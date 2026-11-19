# Self-hosted fonts

## 平方上上谦体

- Source file: `平方上上谦体.ttf` supplied by the site owner
- Web font: `PingFangShangShangQianSubset.woff2`
- Internal PostScript name: `pingfangshangshangqian`
- Subset scope: the Chinese and English profile bio text

The website uses this font for the short profile bio only.

## 龙藏体（Long Cang）

- 源文件：Google Fonts 的 `LongCang-Regular.ttf`
- 网页字体：`LongCangSite.woff2`（约 15KB）
- 许可：SIL Open Font License 1.1，见 `LongCang-OFL.txt`
- 用途：AI 管线页首屏那句手写文案「工具是杠杆，解决问题的能力才是支点。」
- 子集范围：该句中文 + `ai-capabilities.js` 里对应的英文译文 `intro` + ASCII
- 子集没覆盖到的字会回退到 `--font-cjk`；改文案后重新生成（需要 fontTools + brotli）：

  ```powershell
  python -m fontTools.subset LongCang-Regular.ttf --text="工具是杠杆，解决问题的能力才是支点。Tools are the lever; problem-solving is the fulcrum." --unicodes=U+0020-007E --flavor=woff2 --no-hinting --output-file=assets/fonts/LongCangSite.woff2
  ```

  `@font-face` 写在 `assets/ai-capabilities.css` 顶部，文件名后的 `?v=` 改动时同步加 1。

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

## 单独的 &（AmpersandSourceHan.woff2）

- 只含 U+0026 一个字符，约 1.8KB，由 `scripts/build-cjk-subsets.py` 一并生成
- 原因：Archivo 和 Space Grotesk 的 `&` 是单层的 δ 形，夹在中文句子（例如
  「微软 & 领英…」「3D & 视觉创意设计」）里像乱码
- 做法：`styles.css` 里给这两个拉丁字体的 `@font-face` 去掉 U+0026 的
  unicode-range，再用一个 `unicode-range: U+0026` 的 "CJK Ampersand" 面部接管，
  以 `--font-cjk` 首位生效；拉丁字母仍走 Archivo

## Archivo and Space Grotesk

- Subset scope: Latin-1 (`U+0000-00FF`)
- Source: Google Fonts
- License: SIL Open Font License 1.1; see `Archivo-OFL.txt` and `SpaceGrotesk-OFL.txt`
