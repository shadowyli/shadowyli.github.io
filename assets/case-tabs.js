/* 手机端悬浮案例 tab：在已有案例页之间切换 */
(function () {
  var CASES = [
    { id: "mengshou", zh: "梦幻西游", en: "Fantasy League" },
    { id: "danzai", zh: "蛋仔派对", en: "Eggy Party" },
    { id: "large-screen", zh: "大屏视觉", en: "Large Screen" },
    { id: "campaign", zh: "宣发设计", en: "Campaign" },
    { id: "stage", zh: "舞美设计", en: "Stage Design" }
  ];

  var current = (window.location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var active = CASES.filter(function (item) { return item.id === current; })[0];
  if (!active || document.querySelector(".case-tabs")) return;

  var nav = document.createElement("nav");
  nav.className = "case-tabs";
  document.body.appendChild(nav);

  function isEnglish() {
    return (document.documentElement.lang || "zh").toLowerCase().indexOf("en") === 0;
  }

  function render() {
    var english = isEnglish();
    nav.setAttribute("aria-label", english ? "Switch case" : "案例切换");
    nav.innerHTML = "";
    CASES.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "case-tab";
      link.href = item.id + ".html";
      link.textContent = english ? item.en : item.zh;
      if (item.id === current) link.setAttribute("aria-current", "page");
      nav.appendChild(link);
    });

    var currentTab = nav.querySelector('[aria-current="page"]');
    if (currentTab) {
      nav.scrollLeft = Math.max(0, currentTab.offsetLeft - (nav.clientWidth - currentTab.offsetWidth) / 2);
    }
  }

  render();

  if ("MutationObserver" in window) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }
})();
