/* 全站统一顶栏：
   1. 固定暗色（主题切换按钮已隐藏）
   2. 顶栏「联系我」复用页面已有的联系弹窗触发器 */
(function () {
  "use strict";

  document.documentElement.dataset.theme = "dark";

  function bind() {
    var buttons = document.querySelectorAll("[data-contact-trigger]");
    Array.prototype.forEach.call(buttons, function (button) {
      if (button.id === "case-contact" || button.id === "contact") return;
      button.addEventListener("click", function () {
        var target = document.getElementById("case-contact") || document.getElementById("contact");
        if (target) target.click();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
