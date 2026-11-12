import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const flags = args.filter((value) => value.startsWith("--"));
const words = args.filter((value) => !value.startsWith("--"));
const dryRun = flags.includes("--dry-run");
const noPush = flags.includes("--no-push");

const stamp = new Date()
  .toLocaleString("sv-SE", { hour12: false })
  .replace(/:/g, "");
const message = words.join(" ").trim() || `Update site ${stamp}`;

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.error(`[publish] 不是 git 仓库：${repoRoot}`);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const printable = [command, ...commandArgs].join(" ");
  console.log(`\n> ${printable}`);
  if (dryRun && options.mutating) {
    console.log("[publish] --dry-run：跳过此步骤");
    return { status: 0, stdout: "" };
  }
  const capture = Boolean(options.capture);
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (capture) console.error((result.stderr || "").trim());
    console.error(`[publish] 步骤失败（${result.status}）：${printable}`);
    process.exit(result.status ?? 1);
  }
  return result;
}

const status = run("git", ["status", "--porcelain"], { capture: true }).stdout?.trim() ?? "";

if (!status) {
  console.log("[publish] 工作区无未提交改动，跳过提交");
} else {
  run("git", ["add", "-A"], { mutating: true });
  run("git", ["commit", "-m", message], { mutating: true });
}

if (noPush) {
  console.log("[publish] --no-push：仅提交，不推送、不发布");
  process.exit(0);
}

run("git", ["push", "origin", "main"], { mutating: true });

run(process.execPath, [path.join(repoRoot, "scripts", "deploy.mjs"), ...(dryRun ? ["--dry-run"] : [])]);
