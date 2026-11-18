(function () {
  "use strict";

  function translate() {
    var english = document.documentElement.lang === "en";
    document.querySelectorAll("[data-fx-zh]").forEach(function (element) {
      element.textContent = element.getAttribute(english ? "data-fx-en" : "data-fx-zh");
    });
  }

  translate();
  new MutationObserver(translate).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  var dialog = document.createElement("dialog");
  dialog.className = "fx-lightbox";
  dialog.setAttribute("aria-label", "Image preview / 图片预览");
  dialog.innerHTML = '<button type="button" aria-label="Close / 关闭">×</button><img alt=""><p></p>';
  document.body.appendChild(dialog);
  var previousFocus;

  document.querySelectorAll("[data-fx-image]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      event.preventDefault();
      previousFocus = link;
      var source = link.querySelector("img");
      dialog.querySelector("img").src = link.href;
      dialog.querySelector("img").alt = source.alt;
      dialog.querySelector("p").textContent = source.alt;
      dialog.showModal();
    });
  });

  dialog.querySelector("button").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () {
    if (previousFocus) previousFocus.focus({ preventScroll: true });
  });
})();
