# Self-hosted fonts

## 平方上上谦体

- Source file: `平方上上谦体.ttf` supplied by the site owner
- Web font: `PingFangShangShangQianSubset.woff2`
- Internal PostScript name: `pingfangshangshangqian`
- Subset scope: the Chinese and English profile bio text

The website uses this font for the short profile bio only.

## 思源黑体 CN（Source Han Sans CN）

- 源文件：官方 Source Han Sans CN 的 OTF（Regular / Medium / Bold）
- 网页字体：`SourceHanSansCN-Regular.woff2`、`-Medium.woff2`、`-Bold.woff2`
- 子集范围：站点源码（HTML / JS / CSS）里出现过的中文，加现有子集已有字符；
  与 `styles.css` 中 `@font-face` 的 `unicode-range`（U+3000-303F、U+3400-4DBF、
  U+4E00-9FFF、U+FF00-FFEF）对应
- 重新生成（需要 fontTools + brotli）：

  ```powershell
  python scripts/build-cjk-subsets.py --src "E:\FileBackup\字体"
  ```

  改完文案后重跑一次，并同步 `styles.css` 与各页面里 `SourceHanSansCN-*.woff2?v=`
  的版本号，否则浏览器会继续用旧子集。
- 子集没覆盖到的字会回退到本地安装的思源黑体 / 苹方 / 微软雅黑，所以新增中文
  文案后一定要重跑上面的命令（脚本末尾会自检覆盖）。

## Archivo and Space Grotesk

- Subset scope: Latin-1 (`U+0000-00FF`)
- Source: Google Fonts
- License: SIL Open Font License 1.1; see `Archivo-OFL.txt` and `SpaceGrotesk-OFL.txt`
