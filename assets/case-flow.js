/* 案例页接力：页尾「下一个案例」入口 + 预取/预渲染，配合 case-flow.css 的跨文档视图过渡
   只做点击进入，不做滚轮/轻扫触发 */
(function () {
  "use strict";

  /* 顺序与 case-tabs.js 的 CASES 保持一致 */
  var CASES = [
    { id: "mengshou", zh: "梦幻西游", en: "Fantasy League" },
    { id: "danzai", zh: "蛋仔派对", en: "Eggy Party" },
    { id: "large-screen", zh: "大屏", en: "Large Screen" },
    { id: "campaign", zh: "宣发", en: "Campaign" },
    { id: "merchandise", zh: "周边", en: "Merch" },
    { id: "stage", zh: "舞美", en: "Stage" },
    { id: "video", zh: "视频", en: "Video" },
    { id: "flowx", zh: "FlowX", en: "FlowX" },
    { id: "ai-pipeline", zh: "AI 管线", en: "AI Pipelines" }
  ];

  var current = (window.location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var index = -1;
  for (var i = 0; i < CASES.length; i += 1) {
    if (CASES[i].id === current) { index = i; break; }
  }
  if (index === -1) return;

  var next = CASES[(index + 1) % CASES.length];
  var nextUrl = next.id + ".html";
  var host = document.querySelector(".case-body") || document.querySelector("main.case-main");
  if (!host) return;

  /* 支持视图过渡的浏览器：关掉站点原有的整页淡入淡出，交给浏览器做跨页过渡 */
  if (typeof document.startViewTransition === "function") {
    document.documentElement.classList.add("has-vt");
  }

  var section = document.createElement("section");
  section.className = "case-next";
  section.innerHTML =
    '<a class="case-next-link" href="' + nextUrl + '">' +
      '<span class="case-next-body">' +
        '<span class="case-next-eyebrow"></span>' +
        '<span class="case-next-title"></span>' +
      '</span>' +
      '<span class="case-next-arrow" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 12h15"></path><path d="m13 6 6 6-6 6"></path>' +
        '</svg>' +
      '</span>' +
    '</a>';

  /* 接力块作为内容区最后一块，并把页脚收进来：标题在上、版权与联系方式在下 */
  host.appendChild(section);
  var footer = document.querySelector(".case-footer");
  if (footer) section.appendChild(footer);

  var main = document.querySelector("main.case-main");
  if (main) main.classList.add("has-case-next");

  var eyebrowEl = section.querySelector(".case-next-eyebrow");
  var titleEl = section.querySelector(".case-next-title");
  var linkEl = section.querySelector(".case-next-link");

  function render() {
    var en = (document.documentElement.lang || "zh").toLowerCase().indexOf("en") === 0;
    var name = en ? next.en : next.zh;
    eyebrowEl.textContent = en ? "Next case" : "下一个案例";
    titleEl.textContent = name;
    linkEl.setAttribute("aria-label", (en ? "Next case: " : "下一个案例：") + name);
  }

  render();

  if ("MutationObserver" in window) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  /* 预取 + 预渲染：等接力块快进入视野时再做，避免一开始就抢带宽 */
  var warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;

    var prefetch = document.createElement("link");
    prefetch.rel = "prefetch";
    prefetch.as = "document";
    prefetch.href = nextUrl;
    document.head.appendChild(prefetch);

    var supportsRules =
      window.HTMLScriptElement &&
      HTMLScriptElement.supports &&
      HTMLScriptElement.supports("speculationrules");
    if (!supportsRules) return;

    try {
      var rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({
        prerender: [{
          source: "list",
          urls: [new URL(nextUrl, window.location.href).href],
          eagerness: "eager"
        }]
      });
      document.head.appendChild(rules);
    } catch (error) { /* 不支持就退化成普通跳转 */ }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) warm();
      });
    }, { rootMargin: "600px 0px" }).observe(section);
  } else {
    warm();
  }
})();
