import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bucket = "oss://shadowyli-site/";
const region = "cn-hongkong";
const dryRun = process.argv.includes("--dry-run");

const excludedPaths = [
  ".git/**",
  "node_modules/**",
  "scripts/**",
  "deploy.cmd",
  "*.md",
  "LICENSE",
  "work/_*.html",
];

function fail(message) {
  console.error(`\n[deploy] ${message}`);
  process.exit(1);
}

function findOssutil() {
  const candidates = [
    process.env.OSSUTIL_EXE,
    path.join(
      process.env.USERPROFILE ?? "",
      "tools",
      "ossutil",
      "ossutil-2.2.0-windows-amd64",
      "ossutil.exe",
    ),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const lookup = spawnSync("where", ["ossutil.exe"], { encoding: "utf8" });
  if (lookup.status === 0) {
    return lookup.stdout.split(/\r?\n/)[0].trim();
  }
  return null;
}

function git(args) {
  return spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

function runOssutil(exe, args) {
  const printable = args.map((value) => (value.includes(" ") ? `"${value}"` : value)).join(" ");
  console.log(`\n> ossutil ${printable}`);
  const result = spawnSync(exe, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    fail(`ossutil 执行失败（退出码 ${result.status}）`);
  }
}

const ossutil = findOssutil();
if (!ossutil) {
  fail("未找到 ossutil.exe，请设置环境变量 OSSUTIL_EXE 指向它。");
}

const configFile = path.join(process.env.USERPROFILE ?? "", ".ossutilconfig");
if (!fs.existsSync(configFile)) {
  fail(
    [
      `未找到 ossutil 配置：${configFile}`,
      "",
      "请先执行一次配置命令，依次输入 region、AccessKeyID、AccessKeySecret：",
      `  "${ossutil}" config`,
      `  region: ${region}`,
    ].join("\n"),
  );
}

const worktree = git(["status", "--porcelain"]).stdout?.trim();
if (worktree) {
  fail("工作区有未提交改动。请先提交并推送，再发布。");
}

git(["fetch", "origin", "main"]);
const head = git(["rev-parse", "HEAD"]).stdout?.trim();
const remote = git(["rev-parse", "origin/main"]).stdout?.trim();
if (!head || head !== remote) {
  fail("本地 main 与 origin/main 不一致。请先 push 到 GitHub，再发布。");
}

console.log(`[deploy] 提交 ${head.slice(0, 7)} 已推送，开始同步到 ${bucket}`);

const syncArgs = ["sync", repoRoot, bucket, "--delete", "--force"];
for (const pattern of excludedPaths) {
  syncArgs.push("--exclude", pattern);
}
if (dryRun) syncArgs.push("--dry-run");
runOssutil(ossutil, syncArgs);

const cacheRules = [
  {
    label: "HTML",
    cacheControl: "no-cache, must-revalidate",
    includes: ["*.html"],
  },
  {
    label: "CSS/JS",
    cacheControl: "public, max-age=604800",
    includes: ["*.css", "*.js"],
  },
  {
    label: "assets",
    cacheControl: "public, max-age=604800",
    includes: ["assets/**"],
  },
];

for (const rule of cacheRules) {
  const args = [
    "set-props",
    bucket,
    "-r",
    "--metadata-directive",
    "update",
    "--cache-control",
    rule.cacheControl,
    "-f",
  ];
  for (const pattern of rule.includes) {
    args.push("--include", pattern);
  }
  if (dryRun) args.push("--dry-run");
  runOssutil(ossutil, args);
}

console.log(
  dryRun
    ? "\n[deploy] 试运行完成，未修改线上文件。"
    : "\n[deploy] 发布完成：https://www.shadowyli.com/",
);
