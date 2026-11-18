---
name: "Shadowyli · AI 管线开发页"
description: "仅记录 work/ai-pipeline.html 当前实现的页面级设计，不定义全站风格。"
colors:
  ink: "#f1f1ed"
  muted: "#a4a9ae"
  faint: "#616970"
  paper: "#101214"
  rule: "#343a40"
  signal: "#b5d2e8"
  light-ink: "#181e23"
  light-muted: "#535e68"
  light-faint: "#6e7983"
  light-paper: "#eef0f1"
  light-rule: "#c2c9ce"
  light-signal: "#315b7c"
  sculpture-dark: "#e6edf1"
  sculpture-light: "#25465d"
typography:
  display:
    fontFamily: '"Archivo", var(--font-cjk)'
    fontSize: "clamp(56px, 6.8vw, 96px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.03em"
  headline:
    fontFamily: '"Archivo", var(--font-cjk)'
    fontSize: "clamp(32px, 4.3vw, 67px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-.03em"
  team-headline:
    fontFamily: '"Archivo", var(--font-cjk)'
    fontSize: "clamp(36px, 5.2vw, 76px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-.03em"
  title:
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: '"Archivo", var(--font-cjk)'
    fontSize: "16px"
    lineHeight: 1.5
  scene-copy:
    fontSize: "14px"
    lineHeight: 1.7
  mono:
    fontFamily: '"Space Grotesk", monospace'
spacing:
  gutter: "clamp(24px, 5vw, 88px)"
  gutter-mobile: "22px"
components:
  header-control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0"
  request:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "10px 14px"
  request-creative:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    padding: "10px 14px"
  data-row-active:
    backgroundColor: "color-mix(in srgb, var(--signal) 9%, transparent)"
    textColor: "{colors.signal}"
    padding: "10px 8px"
---

# Design System: Shadowyli · AI 管线开发页

## Overview

**Creative North Star: "Meristem 空间感 · ASCII 滚动"**

这句话记录用户明确的本页方向。当前代码将其落实为挂载于 film-stage 的三股字符空间形体，在启用固定舞台时随滚动连续形变为队列和需求分流，随后衔接二维生产流程示意；不代表已复刻某个外部站点，也不承诺未来视觉效果。

页面先说明李颖作为发起人、负责人的责任，再呈现业务分工、技术组合与团队建设。FlowX 只作为代表实践链接到独立案例。内容直接存在于 HTML 中，空间图形辅助阅读；无案例图片或视频，核心信息没有点击、悬停、拖动或弹窗门槛。

**Scope：** 本文及 `.impeccable/design.json` 只适用于 `work/ai-pipeline.html`，以及该页对 `assets/ai-pipeline.css`、`assets/ai-pipeline.js`、`assets/ai-pipeline-sculpture.js` 的使用。主题、字体、颜色变量、滚动、响应式和降级规则均为页面级记录。即使文件位于项目根目录，也不得把其他案例、首页或 FlowX 页改为本页风格。

**证据范围：** 已读取 `PRODUCT.md` 和上述四个实现文件；为确认继承与层叠，补读 `styles.css`、`assets/case-flow.css`、`assets/case-flow.js`。这是源码快照，未运行浏览器视觉、对比度或跨设备验收。前置 token 为当前源码值，正文说明适用条件；没有生成额外色阶、间距体系或组件。

**Key Characteristics:**

- 冷灰底与单一蓝色信号色，支持深浅主题。
- ASCII 空间形体承担视觉表达，HTML 文本承担信息。
- 滚动顺序为责任范围、业务分流、确定性生产，随后进入团队建设。
- 无案例图片；本页聚焦负责人个人能力，FlowX 保留独立案例入口。

## Colors

### Primary

`signal` 是深色主题的蓝色信号色，`light-signal` 是浅色覆盖；用于路径、图示强调、数据选中行、键盘焦点与文字选择。不是全站 `--accent` 的替代名称。数据选中背景直接采用 `color-mix(in srgb, var(--signal) 9%, transparent)`，没有额外的透明色 token。

### Neutral

前置 `ink`、`muted`、`faint`、`paper`、`rule` 对应 `.pipeline-page` 的同名 CSS 自定义属性：正文、辅助文本、弱标注、页面底色、边线。`light-*` 对应 `[data-theme="light"] .pipeline-page` 中同名变量的覆盖。变量名保留源码语义，不改成未实施的品牌色体系。

WebGL 材质的 `sculpture-dark` / `sculpture-light` 来自 `ai-pipeline-sculpture.js` 的 `draw()`，独立于 CSS `--signal`；二维 Canvas 则从 body 的计算样式读取 `--ink` / `--signal`。不能把两种渲染器记成共用同一套颜色。

**The Page Palette Rule.** 颜色映射只在本页 body 及其后代成立；共享样式的全站颜色与其他案例不由本文重新定义。

主题初始化读取 `portfolio-theme`，只有值为 `light` 才启用浅色，其余及存储异常回退深色；没有跟随系统配色的初始化分支。按钮切换同时更新 meta theme-color、可访问名称及 Canvas。`color-scheme` 继承共享样式中与主题匹配的根节点声明。

打印规则在本页变量上覆盖纸白、墨黑、辅助文本 `#444`、边线 `#888`，信号色使用浅色值；未覆盖 `--faint`，不应称为独立完整的打印调色板。html 上的滚动条声明引用 body 才定义的变量，正常继承方向下会使用声明中的深色回退值，不能承诺浅色滚动条随主题变化。

## Typography

**Display / Body Font：** `"Archivo", var(--font-cjk)`，来自共享 body 与本页主标题声明。实际中文回退链为 `"CJK Ampersand", "Source Han Sans CN", "思源黑体 CN", "Source Han Sans SC", "Noto Sans SC", "Noto Sans CJK SC", "CJK Sans", "PingFang SC", "Microsoft YaHei", sans-serif`。本页预加载 Archivo 与 Space Grotesk 的本地 WOFF2；共享字体声明使用 `font-display: swap`。

**Label / Mono Font：** `.mono` 使用 `"Space Grotesk", monospace`；这一名称不意味着实际字符等宽。品牌也继承 Space Grotesk，但后备为 sans-serif。绘图字符另用 `Consolas, monospace`：二维 Canvas 为 7 / 9px，WebGL 字形图集为 24px，显示点大小另在 resize 时设为 7 / 10。

前置 `display` 对应首屏标题；`headline` 对应中间两个场景标题；`team-headline` 对应团队标题；`title` 对应生产链模块标题。`body` 是继承基线，不代表所有段落字号。辅助说明多次使用 12–14px 和 1.7–1.8 行高，实际值按所在组件声明；没有固定比例的全局字号阶梯。

| 条件 | 首屏标题 | 场景标题 | 团队标题 |
| --- | --- | --- | --- |
| 默认桌面 | `display` | `headline` | `team-headline` |
| 宽度 ≤700px | 12vw | 31px / 1.3 | 36px |
| 宽度 ≥701px 且高度 ≤760px | 76px | 40px | 保留默认 |
| 宽度 ≤700px 且高度 ≤760px | 保留 12vw | 28px | 保留 36px |

首屏标题当前 `white-space: nowrap`。中英文切换没有另设长标题字号规则，不能据源码宣称所有窗口下均不会溢出。模板、进度及部分移动标注现有 6–10px 小字仅记录为实现限制，不建立为通用可读性标准；顶部短标签和字符箭头也不推广为新组件装饰规范。

## Layout

**The Single Page Scope Rule.** 本页的留白、主题、字体和动画只描述本页实现，不作为原站其他案例的迁移目标。

页面为全宽场景，左右采用前置 `gutter`，没有另设内容最大宽度容器。固定页头默认高 64px、层级 50，正文按同高留顶；≤700px 时改为 56px 与 `gutter-mobile`。场景默认内边距为 `38px var(--gutter)`，最小高度 `max(650px, calc(100svh - var(--header-size)))`。html 最小宽度 320px 来自共享样式；本页横向 overflow 为 clip。

生产链默认是 `1fr 60px 1fr 60px 1fr`，中间窄列容纳箭头。团队交付物是三列、35px 间隔。边框与细线承担分组；没有通用卡片容器体系。

| 媒体条件 | 当前变更 |
| --- | --- |
| ≥1500px | 首屏关系图、分流图增加顶部间距，部分说明放大 |
| 701–1000px | 场景与分流字号收缩，生产链箭头列改为 35px |
| ≤700px | 禁用三场 pin，工程内容纵向排列；隐藏页头上下文，生产链与团队交付物改为单列；生产模块内部为 `110px 1fr`；隐藏链间箭头、数据最后一列及模板规格字 |
| ≤700px | 普通场景最小高度 720px，工程场景 1200px，工程结语回到文档流；经历、实践链接和页脚重新排布 |
| ≥701px 且高 ≤760px | 缩小场景顶部间距与图示高度，保留横向结构 |
| ≤700px 且高 ≤760px | 进一步缩小关系图、分流图及标题；其中 `.motion-ready` 最小高度规则不等于手机实际启用 pin |

滚动启用阈值独立于 CSS 的紧凑布局阈值：宽度 ≥701px、视口高度 ≥700px 且无减少动态偏好，才启用固定舞台。700–760px 高的桌面因此可能同时使用紧凑样式和 pin。

## Elevation & Depth

页面独有样式没有 box-shadow 词汇。空间感来自字形透明度、三股形体的前后深度、透视式二维平面和错位旋转的输出纸张，而非浮起的卡片阴影。

WebGL 使用透明背景、正交相机和 5,040 个字符点（112 × 15 × 3），字形为 `. : + / 0 1 - =`。`#pipeline-sculpture` 动态挂载为 `.film-stage` 的直接子节点，绝对定位覆盖舞台，层级 1；文本场景层级 2，首屏内仍保留二维回退 Canvas。启用固定舞台时，同一个 WebGL 主体跨首屏和分流场景连续形变：时间线 0.8–1.3 从空间束转为流向队列的线路，1.7–2.5 转为经过管线节点的分流，3.1–3.45 在工程场景进入时淡去。非 motion-ready 时绘图层高度限制为 `--stage-height`；≤700px 时固定为首幕的 720px，避免短屏主体上移覆盖标题。移动职责标签使用页面底色保护文字。材质透明且不写入深度，像素比上限为 2，按请求合并单帧绘制，没有独立的持续自动旋转循环。

默认输出层使用三张线框纸张，后两层分别偏移 `(17px, -6px)` / `(34px, -13px)` 并旋转 3° / 6°；手机偏移变为 `(9px, -4px)` / `(18px, -8px)`。这是批量输出示意，不是案例图片或成果缩略图。

## Shapes

模块以细线、直边和矩形示意为主，源码没有为本页定义圆角 token，故不生成 `rounded` 阶梯。普通需求使用 1px 实线边框，创意精修需求用虚线及弱文本；模板保留虚线图片槽位，输出图的斜线来自 CSS repeating-linear-gradient。

SVG 路径用三次曲线与非缩放描边连接节点；字形图集和二维 Canvas 是程序绘图。表中的 `a.png`、`b.png`、`c.png` 只是示意文件名，不是图片资源引用。

## Components

### 页头与导航

品牌、返回作品集、主题和语言切换组成固定页头。控制按钮透明、无边框、零 padding，最小尺寸 32 × 40px，手机最小宽度 28px。本页没有定义按钮 hover / active 的视觉变体；键盘焦点为 2px signal 实线、偏移 5px。不能由此虚构主按钮、表单或 CTA 系统。

主题与语言按钮初始 hidden，脚本初始化后显示。语言取自 `portfolio-language`，切换已有 data-copy 文案、文档语言、标题和描述，并刷新滚动测量；部分静态 group/table aria-label 未纳入字典，不宣称完整双语无障碍覆盖。跳到正文链接复用共享组件，并受本页链接颜色规则影响。

### ASCII 舞台与滚动

**The Text Before Motion Rule.** 责任、业务、技术和团队信息以 HTML 为信息源，ASCII、SVG 与 Canvas 是辅助图示，不承担唯一说明。

满足宽高与偏好门槛，且 GSAP / ScrollTrigger 已加载时，body 增加 `motion-ready`：前三场改为绝对定位、关闭 pointer-events，以透明度和 y 位移切换，团队段仍在正常流中。舞台从页头下沿 pin，滚动距离为 `round(innerHeight * 3.8)`，scrub 为 0.3，默认 ease 为 `power2.inOut`。

时间线标签为 ownership 0、queue 1.24、reroute 1.7、batch 3.65；在 5.1 开始 0.7 的停留段。它们是滚动映射的时间线单位，不是自动播放秒数保证。`--route` 在 1.7–2.5 间经 smoothstep 插值，进度指示按时间分为 00 / 01 / 02。没有自定义 wheel 拦截或 Lenis 平滑滚动；本页 html 声明为原生 auto 滚动，锚点上留 80px。

### 需求分流与生产示意

需求文本、旧队列、管线节点、A/B 去向配合 SVG。静态 `--route: 1` 展示分流后的路径；动画在旧队列与分流间插值。只有同时 `motion-ready.webgl-ready` 时，才隐藏被字符流替代的部分 SVG 路径。

第三个需求标签为“批量图像处理”，英文为 “Batch image processing”。≤700px 时所有请求标签宽 94px、padding 为 `8px 7px`，桌面仍使用前置组件值；实线和虚线变体共享该移动尺寸。

工程说明明确以“处理逻辑示意”开头，英文对应 “Illustrative workflow”；业务表有“示意业务数据”可访问名称。批处理进度依次高亮 A/B/C 行、同步模板名称和输出纸张字母；不是实时业务系统。文案区分 AI 生成与确定性工具处理 Logo、版式和输出规格，并明确“Canvas 处理精准适配，FFmpeg 处理动效；按效果、成本与速度选择方案”。交付检查与人工终验始终作为正文说明。移动端隐藏表最后一列是当前呈现行为，不承诺所有示意字段都可见。

### 团队段与案例入口

团队段显示协作发布规范、ComfyUI / n8n 手册、实操作业与项目带教，随后列出受益岗位、经历线和 FlowX 链接。三项交付物直接使用标题和说明，已删除 `[ BUILD ]`、`[ SHARE ]`、`[ COACH ]` 标签及移动端为其预留的 `padding-left: 57px`。责任文案明确“独立完成首版，主导后续协作开发”，英文明确首个 MVP；不得改写成全程单人开发，或把该页扩写成 FlowX 功能介绍。

### 降级与边界

| 条件 | 真实行为 |
| --- | --- |
| 无 JavaScript | HTML 顺序显示前三场与团队段；主题/语言按钮保持隐藏；关系图保留静态占位，分流显示最终态；无 ASCII 绘制 |
| GSAP / ScrollTrigger 不可用 | setupMotion 提前返回；正文不 pin，Canvas / WebGL 初始化仍可独立执行 |
| 减少动态偏好 | 不创建本页滚动动画，后代 animation / transition 禁用；仍会尝试导入并静态绘制 WebGL，不等于完全关闭图形代码 |
| 宽 ≤700px 或高 <700px，且无减少动态偏好 | 保持顺序文档，只为分流板建立 top 80% 到 center 50% 的滚动插值；无三场 pin 与批处理时间线 |
| WebGL / 模块导入失败 | catch 返回二维 Canvas 关系图；若 2D context 也不可用，不设置 canvas-ready，保留 HTML 占位 |
| 字体尚未就绪 | 使用回退字体；fonts.ready 后重测 Canvas 和 ScrollTrigger |
| 打印 | 隐藏页头、滚动提示和进度，重置场景位置、透明度及 pin 容器高度，覆盖部分颜色；未声明隐藏所有 Canvas |

**未固化为规范、未修复的现状：** 共享 `body.case-page` 的 240ms 淡入选择器比 `.pipeline-page { animation: none; }` 更具体；支持 view transition 时由 `.has-vt body.case-page` 再禁用。`case-flow.css` 另提供出场 200ms / 入场 320ms 的根视图过渡，减少动态偏好下为 1ms。不能概括为全页完全没有入场动画。上述小字号、英文不换行标题、静态 aria-label 及滚动条主题继承限制也未作为新规则推广。未经过渲染验证，不把“移动可读”“打印完整”或“全部无障碍合格”写成已完成承诺。

## Do's and Don'ts

### Do:

- Do 将本文 token、主题、字体、滚动和响应式规则严格限定于 AI 管线开发页。
- Do 以现有源码为 token 依据，保留 CSS 主题变量与 WebGL 材质颜色的实际差异。
- Do 保持负责人责任范围、首版实践与后续协作开发的事实边界。
- Do 保留 HTML 信息顺序及静态降级，让图形辅助解释而不独占内容。

### Don't:

- Don't 将本页 Meristem 空间感、ASCII 或无案例图片要求推广到首页和其他案例。
- Don't 把示意表格、占位文件名、字符图形当作真实成果图片或业务数据。
- Don't 生成代码未使用的色阶、圆角、组件状态，或把当前小字和装饰标签固化成通用规范。
- Don't 将源码分支的存在写成已通过视觉、无障碍、移动端或打印验收的承诺。
