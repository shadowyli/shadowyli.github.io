#!/usr/bin/env python3
"""Deploy the shadowyli.github.io static site to an Alibaba Cloud OSS bucket.

Pure stdlib (no ossutil / no aliyun CLI needed). Uses OSS Signature V1.

Usage:
  export OSS_AK=...  OSS_SK=...
  python3 scripts/deploy_oss.py --dry-run    # list what would be uploaded
  python3 deploy_oss.py --bucket shadowyli-site --region oss-cn-hongkong
  python3 deploy_oss.py --website            # also enable static website hosting
"""

import argparse
import base64
import hashlib
import hmac
import mimetypes
import os
import sys
import time
from email.utils import formatdate
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", ".github", "scripts", "node_modules", ".tools"}

# Explicit types: python's mimetypes is unreliable for webp/woff2/jfif across platforms.
TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jfif": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".xml": "application/xml",
}

# Immutable-ish assets get a long cache; HTML must not be cached long.
LONG_CACHE = "public, max-age=31536000, immutable"
SHORT_CACHE = "public, max-age=300, must-revalidate"


def content_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in TYPES:
        return TYPES[suffix]
    guess, _ = mimetypes.guess_type(str(path))
    return guess or "application/octet-stream"


def cache_control(key: str) -> str:
    if key.endswith(".html") or key.endswith(".xml") or key == "README.md":
        return SHORT_CACHE
    return LONG_CACHE


def sign_v1(secret: str, verb: str, content_md5: str, ctype: str, date: str,
            oss_headers: dict, resource: str) -> str:
    canon_headers = "".join(f"{k}:{v}\n" for k, v in sorted(oss_headers.items()))
    to_sign = "\n".join([verb, content_md5, ctype, date, f"{canon_headers}{resource}"])
    digest = hmac.new(secret.encode(), to_sign.encode(), hashlib.sha1).digest()
    return base64.b64encode(digest).decode()


def call(ak: str, sk: str, method: str, url: str, bucket: str, body: bytes | None = None,
         ctype: str = "", headers: dict | None = None) -> tuple[int, bytes]:
    headers = dict(headers or {})
    date = formatdate(usegmt=True)
    md5 = base64.b64encode(hashlib.md5(body).digest()).decode() if body else ""
    oss_headers = {k: v for k, v in headers.items() if k.lower().startswith("x-oss-")}
    # CanonicalizedResource = /bucket/object (bucket is always part of the resource)
    path = url.split("://", 1)[1].partition("/")[2]
    resource = f"/{bucket}/{path}"
    signature = sign_v1(sk, method, md5, ctype, date, oss_headers, resource)
    headers.update({
        "Date": date,
        "Authorization": f"OSS {ak}:{signature}",
    })
    if md5:
        headers["Content-MD5"] = md5
    if ctype:
        headers["Content-Type"] = ctype
    else:
        headers.setdefault("Content-Type", "")
    req = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except HTTPError as exc:
        return exc.code, exc.read()


def bucket_url(bucket: str, region: str) -> str:
    return f"https://{bucket}.{region}.aliyuncs.com"


def ensure_bucket(ak: str, sk: str, bucket: str, region: str) -> None:
    url = f"https://{bucket}.{region}.aliyuncs.com/"
    status, body = call(ak, sk, "PUT", url, bucket, headers={
        "x-oss-acl": "public-read",
    })
    if status in (200, 409):  # 409 = already exists and owned by you
        print(f"bucket {bucket} ready ({status})")
    else:
        print(f"bucket create failed: {status} {body[:300]!r}")
        sys.exit(1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bucket", default="shadowyli-site")
    ap.add_argument("--region", default="oss-cn-hongkong")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--website", action="store_true")
    args = ap.parse_args()

    ak, sk = os.environ.get("OSS_AK", ""), os.environ.get("OSS_SK", "")
    if not args.dry_run and not (ak and sk):
        sys.exit("set OSS_AK and OSS_SK (or use --dry-run)")

    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and not (set(p.relative_to(ROOT).parts) & SKIP_DIRS))
    total = 0
    plan = []
    for path in files:
        key = path.relative_to(ROOT).as_posix()
        size = path.stat().st_size
        total += size
        plan.append((key, size, content_type(path), cache_control(key)))

    print(f"{len(plan)} files, {total/1024/1024:.2f} MiB, bucket {args.bucket} @ {args.region}")
    if args.dry_run:
        for key, size, ctype, cache in plan:
            print(f"  {size:>9}  {key:<48} {ctype:<32} {cache}")
        return

    ensure_bucket(ak, sk, args.bucket, args.region)
    base = bucket_url(args.bucket, args.region)
    failed = 0
    for key, size, ctype, cache in plan:
        body = (ROOT / key).read_bytes()
        status, resp = call(ak, sk, "PUT", f"{base}/{key}", args.bucket, body=body,
                            ctype=ctype, headers={"Cache-Control": cache})
        if status == 200:
            print(f"  ok  {size:>9}  {key}")
        else:
            failed += 1
            print(f"  ERR {status} {key}: {resp[:200]!r}")
    if failed:
        sys.exit(f"{failed} uploads failed")

    if args.website:
        xml = (b'<WebsiteConfiguration><IndexDocument><Suffix>index.html</Suffix>'
               b'</IndexDocument><ErrorDocument><Key>index.html</Key></ErrorDocument>'
               b'</WebsiteConfiguration>')
        status, resp = call(ak, sk, "PUT", f"{base}/?website", args.bucket, body=xml,
                            ctype="application/xml")
        print(f"website hosting: {status} {resp[:200]!r}")


if __name__ == "__main__":
    main()
