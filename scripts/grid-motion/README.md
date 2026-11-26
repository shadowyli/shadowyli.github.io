# 梦幻西游手游 Logo 动态墙

使用用户提供的 Vue Bits GridMotion（Vue + TypeScript）源码，单独构建为静态网站可直接加载的 JS 和 CSS。页面无需启动 Vue 开发服务。

在本目录执行：

```sh
npm ci
npm run build
```

输出到 `assets/mengshou-logo-wall.js` 和 `assets/mengshou-logo-wall.css`。Logo 和名称从 `assets/mengshou-logos/manifest.json` 读取，三个组别共 36 张 WebP，保留透明背景。

接入处：`work/mengshou.html#case-logo-wall`。静态 HTML 保留全部 Logo 的回退网格与可访问名称；组件进入视口附近时挂载并自动漂移。桌面高度 600px，手机高度 300px，均为五行；手机使用更小间距、倾角和边缘渐隐。关闭鼠标视差与聚光，支持减少动态偏好、页面隐藏/离屏暂停和主题跟随。Logo 使用 contain 显示；每行的循环长度覆盖全部素材，避免素材多于首屏时遗漏尾部图片。
