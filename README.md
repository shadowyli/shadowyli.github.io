
https://www.shadowyli.com/

GitHub Pages 旧地址：https://shadowyli.github.io/

## 发布

1. 提交并推送到 GitHub：

   ```powershell
   git add -A
   git commit -m "说明这次改了什么"
   git push origin main
   ```

2. 同步到阿里云 OSS（香港）：

   ```powershell
   deploy.cmd
   ```

   首次使用需安装并配置 ossutil（不在 PATH 时用完整路径，
   例如 `%USERPROFILE%\tools\ossutil\ossutil-2.2.0-windows-amd64\ossutil.exe`）：

   ```powershell
   ossutil config
   ```

   region 填 `cn-hongkong`，再输入 AccessKeyID 和 AccessKeySecret。
   脚本会检查工作区是否干净、本地是否已推送，再同步 `shadowyli-site` 桶并设置缓存头。
   预演可加 `--dry-run`。
