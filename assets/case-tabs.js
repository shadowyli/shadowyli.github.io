/* 手机端悬浮案例 tab：在已有案例页之间切换 */
(function () {
  var CASES = [
    { id: "mengshou", zh: "梦幻西游", en: "Fantasy League" },
    { id: "danzai", zh: "蛋仔派对", en: "Eggy Party" },
    { id: "large-screen", zh: "大屏", en: "Large Screen" },
    { id: "campaign", zh: "宣发", en: "Campaign" },
    { id: "merchandise", zh: "周边", en: "Merch" },
    { id: "stage", zh: "舞美", en: "Stage" },
    { id: "video", zh: "视频", en: "Video" },
    { id: "flowx", zh: "FlowX", en: "FlowX" }
  ];

  var current = (window.location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var active = CASES.filter(function (item) { return item.id === current; })[0];
  if (!active || document.querySelector(".case-tabs")) return;

  var nav = document.createElement("nav");
  nav.className = "case-tabs";
  var track = document.createElement("div");
  track.className = "case-tabs-track";
  nav.appendChild(track);
  document.body.appendChild(nav);

  var drag = { active: false, moved: false, startX: 0, startLeft: 0, pointerId: null, blockClick: false };

  function centerFor(tab) {
    var max = Math.max(0, track.scrollWidth - track.clientWidth);
    var left = tab.offsetLeft - (track.clientWidth - tab.offsetWidth) / 2;
    return Math.max(0, Math.min(max, left));
  }

  function snapToNearest() {
    var tabs = Array.prototype.slice.call(track.querySelectorAll(".case-tab"));
    if (!tabs.length) return;
    var mid = track.scrollLeft + track.clientWidth / 2;
    var best = tabs[0];
    var bestDistance = Infinity;
    tabs.forEach(function (tab) {
      var distance = Math.abs(tab.offsetLeft + tab.offsetWidth / 2 - mid);
      if (distance < bestDistance) { bestDistance = distance; best = tab; }
    });
    if (typeof track.scrollTo === "function") {
      track.scrollTo({ left: centerFor(best), behavior: "smooth" });
    } else {
      track.scrollLeft = centerFor(best);
    }
  }

  // 鼠标拖拽；触屏走原生滚动 + CSS 吸附
  nav.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    drag.active = true;
    drag.moved = false;
    drag.startX = event.clientX;
    drag.startLeft = track.scrollLeft;
    drag.pointerId = event.pointerId;
    drag.blockClick = false;
  });

  nav.addEventListener("pointermove", function (event) {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    var delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 6) {
      drag.moved = true;
      nav.classList.add("is-dragging");
      try { nav.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    }
    if (!drag.moved) return;
    event.preventDefault();
    track.scrollLeft = drag.startLeft - delta;
  });

  function endDrag(event) {
    if (!drag.active) return;
    drag.active = false;
    var wasDragging = drag.moved;
    drag.moved = false;
    if (drag.pointerId !== null) {
      try { nav.releasePointerCapture(drag.pointerId); } catch (error) { /* ignore */ }
      drag.pointerId = null;
    }
    nav.classList.remove("is-dragging");
    if (!wasDragging) return;
    event.preventDefault();
    drag.blockClick = true;
    snapToNearest();
  }

  nav.addEventListener("pointerup", endDrag);
  nav.addEventListener("pointercancel", endDrag);

  nav.addEventListener("click", function (event) {
    if (drag.blockClick) {
      drag.blockClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    var link = event.target && event.target.closest ? event.target.closest(".case-tab") : null;
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.href === window.location.href) return;
    if (typeof track.scrollTo === "function") {
      track.scrollTo({ left: centerFor(link), behavior: "smooth" });
    }
    document.body.classList.add("is-leaving");
    window.setTimeout(function () {
      window.location.href = link.href;
    }, 170);
  });

  function isEnglish() {
    return (document.documentElement.lang || "zh").toLowerCase().indexOf("en") === 0;
  }

  function render() {
    var english = isEnglish();
    nav.setAttribute("aria-label", english ? "Switch case" : "案例切换");
    track.innerHTML = "";
    CASES.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "case-tab";
      link.href = item.id + ".html";
      link.draggable = false;
      link.textContent = english ? item.en : item.zh;
      if (item.id === current) link.setAttribute("aria-current", "page");
      track.appendChild(link);
    });

    var currentTab = track.querySelector('[aria-current="page"]');
    if (currentTab) {
      var target = Math.max(0, currentTab.offsetLeft - (track.clientWidth - currentTab.offsetWidth) / 2);
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left: target, behavior: "instant" });
      } else {
        track.scrollLeft = target;
      }
    }

    updateOverflow();
  }

  render();

  function updateOverflow() {
    nav.classList.toggle("is-overflowing", track.scrollWidth > track.clientWidth + 1);
  }

  window.addEventListener("resize", updateOverflow);
  window.addEventListener("load", updateOverflow);

  if ("MutationObserver" in window) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }
})();
