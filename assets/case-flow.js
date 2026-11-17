/* 案例页之间：原生跨文档视图过渡 + 悬停案例 tab 时预取下一页
   页面内不新增任何 UI */
(function () {
  "use strict";

  if (typeof document.startViewTransition === "function") {
    document.documentElement.classList.add("has-vt");
  }

  var prefetched = {};
  document.addEventListener("pointerenter", function (event) {
    var link = event.target && event.target.closest ? event.target.closest(".case-tab") : null;
    if (!link || !link.href) return;
    if (prefetched[link.href]) return;
    prefetched[link.href] = true;

    var prefetch = document.createElement("link");
    prefetch.rel = "prefetch";
    prefetch.as = "document";
    prefetch.href = link.href;
    document.head.appendChild(prefetch);
  }, true);
})();
