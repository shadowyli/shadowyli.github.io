/* 案例页接力：页尾「下一个案例」+ 触底/轻扫进入下一案例
   配合 case-flow.css 的原生跨文档视图过渡，以及下方注入的预渲染规则 */
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
    '<span class="case-next-progress" aria-hidden="true"></span>' +
    '<span class="case-next-meter" aria-hidden="true"></span>' +
    '<a class="case-next-link" href="' + nextUrl + '">' +
      '<span class="case-next-body">' +
        '<span class="case-next-eyebrow"></span>' +
        '<span class="case-next-title"></span>' +
        '<span class="case-next-hint"></span>' +
      '</span>' +
      '<span class="case-next-arrow" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 12h15"></path><path d="m13 6 6 6-6 6"></path>' +
        '</svg>' +
      '</span>' +
    '</a>';
  /* 接力块作为内容区的最后一块，并把页脚收进来：
     标题在上、版权与联系方式在下，滚到底看到的就是「下一个案例」，
     不会出现标题下面还压着一条页脚的错位感 */
  host.appendChild(section);
  var footer = document.querySelector(".case-footer");
  if (footer) section.appendChild(footer);

  var main = document.querySelector("main.case-main");
  if (main) main.classList.add("has-case-next");

  var eyebrowEl = section.querySelector(".case-next-eyebrow");
  var titleEl = section.querySelector(".case-next-title");
  var hintEl = section.querySelector(".case-next-hint");
  var linkEl = section.querySelector(".case-next-link");

  function english() {
    return (document.documentElement.lang || "zh").toLowerCase().indexOf("en") === 0;
  }

  function render() {
    var en = english();
    var name = en ? next.en : next.zh;
    eyebrowEl.textContent = en ? "Next case" : "下一个案例";
    titleEl.textContent = name;
    hintEl.textContent = released
      ? (en ? "Release to open" : "松手进入")
      : (en ? "Keep scrolling / swipe up" : "继续下滑 / 轻扫进入");
    linkEl.setAttribute("aria-label", (en ? "Next case: " : "下一个案例：") + name);
  }

  render();

  if ("MutationObserver" in window) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  /* 预取 + 预渲染：只在快滚到页尾时才做，避免一开始就抢带宽 */
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
    } catch (error) { /* 不支持就算了，退化成普通跳转 */ }
  }

  var pull = 0;
  var released = false;
  var navigating = false;
  var armed = false;
  var wheelAcc = 0;
  var lastWheel = 0;

  function setPull(value) {
    pull = Math.max(0, Math.min(1, value));
    section.style.setProperty("--pull", pull.toFixed(3));
    syncCue();
    var strong = pull > 0.6;
    if (strong !== released) {
      released = strong;
      hintEl.textContent = strong
        ? (english() ? "Release to open" : "松手进入")
        : (english() ? "Keep scrolling / swipe up" : "继续下滑 / 轻扫进入");
    }
  }

  /* 到达页尾的时刻：用来跳过「一路惯性滚到底」的残余滚动量，避免误跳页 */
  var bottomSince = 0;
  function atBottom() {
    var doc = document.documentElement;
    var at = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
    if (at) {
      if (!bottomSince) bottomSince = Date.now();
    } else {
      bottomSince = 0;
    }
    return at;
  }

  /* 滚到页尾时把接力块点亮，作为「再滑一下就进去」的提示 */
  var cueFrame = 0;
  function syncCue() {
    cueFrame = 0;
    section.classList.toggle("is-armed", armed && !navigating && atBottom());
  }

  window.addEventListener("scroll", function () {
    if (cueFrame) return;
    cueFrame = window.requestAnimationFrame(syncCue);
  }, { passive: true });

  function blocked(target) {
    return !!(target && target.closest &&
      target.closest(".case-tabs, .contact-dialog, .case-contact, .mobile-play, .case-sound, .slot-play"));
  }

  function go() {
    if (navigating) return;
    navigating = true;
    setPull(1);
    window.location.href = nextUrl;
  }

  window.addEventListener("wheel", function (event) {
    syncCue();
    if (event.ctrlKey || blocked(event.target)) return;
    if (event.deltaY <= 0) {
      wheelAcc = 0;
      setPull(0);
      return;
    }
    if (!armed || !atBottom()) return;
    if (Date.now() - bottomSince < 140) return;

    var now = Date.now();
    if (now - lastWheel > 420) wheelAcc = 0;
    lastWheel = now;
    wheelAcc += event.deltaY;
    setPull(wheelAcc / 240);
    if (wheelAcc >= 240) go();
  }, { passive: true });

  var touchY = null;
  var touched = false;

  window.addEventListener("touchstart", function (event) {
    touchY = null;
    touched = false;
    if (event.touches.length !== 1 || blocked(event.target)) return;
    if (!armed || !atBottom()) return;
    if (Date.now() - bottomSince < 110) return;
    touchY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchmove", function (event) {
    syncCue();
    if (touchY === null || event.touches.length !== 1) return;
    var distance = touchY - event.touches[0].clientY;
    if (distance <= 0) {
      setPull(0);
      return;
    }
    if (!atBottom()) {
      touchY = null;
      setPull(0);
      return;
    }
    if (event.cancelable && distance > 8) event.preventDefault();
    touched = true;
    setPull(distance / 150);
  }, { passive: false });

  function endTouch() {
    if (touchY === null) return;
    var shouldGo = touched && pull > 0.7;
    touchY = null;
    touched = false;
    if (shouldGo) go();
    else setPull(0);
  }

  window.addEventListener("touchend", endTouch);
  window.addEventListener("touchcancel", endTouch);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        armed = entry.isIntersecting;
        syncCue();
        if (armed) warm();
        else {
          wheelAcc = 0;
          setPull(0);
        }
      });
    }, { threshold: 0.15 }).observe(section);
  } else {
    armed = true;
    warm();
  }

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    navigating = false;
    wheelAcc = 0;
    setPull(0);
  });
})();
