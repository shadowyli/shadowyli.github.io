#!/usr/bin/env python3
"""重建站内思源黑体 CN 子集（Regular / Medium / Bold）。

用法（需要 fontTools + brotli，以及官方 Source Han Sans CN 的 OTF 源文件）：

    python scripts/build-cjk-subsets.py --src "E:\\FileBackup\\字体"

脚本会收集仓库里所有 HTML / JS 中出现的中文字符，与现有子集已有的字符取并集，
再裁剪出 assets/fonts/SourceHanSansCN-*.woff2。改过页面文案后重跑一次，
再同步 styles.css / index.html 里的 ?v= 版本号即可。
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "assets" / "fonts"
WEIGHTS = {
    "Regular": "SourceHanSansCN-Regular.otf",
    "Medium": "SourceHanSansCN-Medium.otf",
    "Bold": "SourceHanSansCN-Bold.otf",
}
# 与 styles.css 里 @font-face 的 unicode-range 保持一致
RANGES = ((0x3000, 0x303F), (0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xFF00, 0xFFEF))
TEXT_GLOBS = ("*.html", "work/*.html", "*.js", "assets/*.js", "*.css", "assets/*.css")


def in_ranges(cp: int) -> bool:
    return any(lo <= cp <= hi for lo, hi in RANGES)


def text_codepoints() -> set[int]:
    cps: set[int] = set()
    for pattern in TEXT_GLOBS:
        for path in ROOT.glob(pattern):
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            cps.update(ord(ch) for ch in text if in_ranges(ord(ch)))
    return cps


def existing_codepoints() -> set[int]:
    cps: set[int] = set()
    for name in WEIGHTS:
        path = FONT_DIR / f"SourceHanSansCN-{name}.woff2"
        if not path.exists():
            continue
        font = TTFont(path)
        cps.update(cp for cp in font.getBestCmap() if in_ranges(cp))
    return cps


def build(src_dir: pathlib.Path, codepoints: set[int]) -> None:
    for name, filename in WEIGHTS.items():
        src = src_dir / filename
        if not src.exists():
            sys.exit(f"缺少源文件: {src}")
        font = TTFont(src)
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        options.name_legacy = True
        options.name_languages = ["*"]
        options.notdef_outline = True
        options.recalc_bounds = True
        options.drop_tables += ["DSIG"]
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=codepoints)
        subsetter.subset(font)
        font.flavor = "woff2"
        out = FONT_DIR / f"SourceHanSansCN-{name}.woff2"
        font.save(out)
        print(f"{out.name}: {len(codepoints)} codepoints, {out.stat().st_size / 1024:.1f} KB")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", required=True, type=pathlib.Path, help="Source Han Sans CN OTF 所在目录")
    args = parser.parse_args()

    site_cps = text_codepoints()
    kept = existing_codepoints()
    codepoints = site_cps | kept
    print(f"页面文字: {len(site_cps)} 字 / 现有子集: {len(kept)} 字 / 合并: {len(codepoints)} 字")
    build(args.src, codepoints)

    # 覆盖自检
    missing: dict[str, list[str]] = {}
    for name in WEIGHTS:
        cmap = TTFont(FONT_DIR / f"SourceHanSansCN-{name}.woff2").getBestCmap()
        gap = sorted(chr(cp) for cp in site_cps if cp not in cmap)
        if gap:
            missing[name] = gap
    if missing:
        sys.exit(f"子集仍缺字: {missing}")
    print("覆盖自检通过：页面文字全部在子集内")


if __name__ == "__main__":
    main()
