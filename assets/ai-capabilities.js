(function () {
  "use strict";
  var english = {
    skip: "Skip to content", back: "← Back to Work", navWork: "Work", navAbout: "About Me",
    name: "Shadow · Li Ying", role: "Project initiator / Lead", title: "AI pipeline development",
    intro: "Tools are the lever; problem-solving is the fulcrum.",
    toolsTitle: "Pipeline toolchain",
    loraLabel: "LoRA training", coreLabel: "My technical exploration", docLabel: "Doc writing",
    module1: "AI pipeline building", module3: "AI applications & agents", module4: "VFX pipeline building",
    vfxLead: "Blender toon shading",
    pipelineLead: "Connect generation, processing, composition and export around business specifications.",
    custom: "Custom workflows", batch: "Batch processing",
    portraitExample: "Player portrait pipeline", workflowNote: "Illustration of a real business workflow",
    portraitInput: "Photo + event requirements", portraitInputDetail: "Provide source photos and define clothing, background and delivery specifications.",
    portraitGenerate: "AI generation & styling", portraitGenerateDetail: "Adapt clothing and backgrounds to the event, with attention to identity preservation.",
    portraitProcess: "Cutout, detection & alignment", portraitProcessDetail: "Use UNIFACE face detection, align the subject and crop to the required dimensions.",
    portraitOutput: "Export & acceptance", portraitOutputDetail: "Convert formats, export consistent specifications and have specialists confirm the result.",
    pipelineResponsibility: "Help colleagues learn the methods",
    pipelineResponsibilityDetail: "Write ComfyUI and n8n guides, and teach workflow building through internal training, exercises and project coaching.",
    appLead: "Package specialist workflows as web services, accessible through business forms or natural language.",
    toolTag: "Tool calling", orchestrationTag: "Orchestration", qualityTag: "Quality & error handling",
    app1: "Express the request", app1Detail: "Fill in business parameters or describe a goal in natural language.",
    app2: "Agent plans the work", app2Detail: "Break down the request and select pipelines and tools.",
    app3: "Execute & check", app3Detail: "Call APIs, follow task status and check specifications and visual quality.",
    app4: "Deliver or escalate", app4Detail: "Collect outputs, retry failures and escalate when results cannot be confirmed.",
    footerNote: "Shadow · Visual Design Portfolio", contactMe: "Contact me"
  };
  var elements = Array.from(document.querySelectorAll("[data-copy]"));
  var chinese = {};
  elements.forEach(function (element) { chinese[element.dataset.copy] = element.textContent; });
  var languageButton = document.querySelector(".pipeline-language");
  var themeButton = document.querySelector(".pipeline-theme");
  var language = "zh";

  function stored(key, fallback) {
    try { return localStorage.getItem(key) || fallback; }
    catch (error) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); }
    catch (error) { return; }
  }
  function updateThemeLabel() {
    var light = document.documentElement.dataset.theme === "light";
    var label = language === "en" ? (light ? "Switch to dark mode" : "Switch to light mode") : (light ? "切换到深色模式" : "切换到浅色模式");
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
    document.querySelector('meta[name="theme-color"]').content = light ? "#eef0f1" : "#101214";
  }
  function applyLanguage(next) {
    language = next === "en" ? "en" : "zh";
    var dictionary = language === "en" ? english : chinese;
    elements.forEach(function (element) {
      if (typeof dictionary[element.dataset.copy] === "string") element.textContent = dictionary[element.dataset.copy];
    });
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.title = language === "en" ? "AI Pipelines & Agents · Shadow Li Ying | Shadowyli" : "AI 管线开发 · 影子 李颖 | Shadowyli";
    document.querySelector('meta[name="description"]').content = language === "en"
      ? "Shadow Li Ying's AI pipeline building, AI applications and agent development."
      : "影子（李颖）的 AI 管线搭建、AI 应用与 Agent 开发实践。项目发起人、负责人，亲自承担关键设计与开发。";
    languageButton.textContent = language === "en" ? "CN" : "EN";
    languageButton.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "切换到英文");
    updateThemeLabel();
    requestUpdate();
  }

  var sections = Array.from(document.querySelectorAll(".capability-section"));
  var steps = Array.from(document.querySelectorAll(".workflow-track > li"));
  var frame = 0;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function updateScroll() {
    frame = 0;
    var viewport = window.innerHeight;
    var documentRange = document.documentElement.scrollHeight - viewport;
    var track = document.querySelector(".workflow-track");
    var stepBounds = track ? track.getBoundingClientRect() : null;
    var sectionBounds = sections.map(function (section) { return section.getBoundingClientRect(); });
    if (stepBounds && steps.length) {
      var progress = clamp((viewport * .85 - stepBounds.top) / (viewport * .6 + stepBounds.height * .45));
      var selected = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      steps.forEach(function (step, index) { step.classList.toggle("is-current", !reducedMotion.matches && index === selected && stepBounds.bottom > 0 && stepBounds.top < viewport); });
    }
    sections.forEach(function (section, index) { section.classList.toggle("is-in-view", sectionBounds[index].top < viewport * .65 && sectionBounds[index].bottom > viewport * .2); });
    document.body.style.setProperty("--read-progress", documentRange > 0 ? clamp(window.scrollY / documentRange) : 1);
  }
  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  var networkFrame = document.querySelector(".network-frame");
  var networkCanvas = document.querySelector(".network-canvas");
  function scaleNetwork() {
    if (!networkFrame || !networkCanvas) return;
    var scale = networkFrame.clientWidth / 1080;
    networkCanvas.style.setProperty("--net-scale", scale);
    networkFrame.style.height = (324 * scale) + "px";
    networkFrame.classList.toggle("is-scaled", scale < 1);
  }
  scaleNetwork();
  applyLanguage(stored("portfolio-language", "zh"));
  languageButton.hidden = false;
  themeButton.hidden = false;
  languageButton.addEventListener("click", function () {
    applyLanguage(language === "zh" ? "en" : "zh");
    save("portfolio-language", language);
  });
  themeButton.addEventListener("click", function () {
    var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    save("portfolio-theme", next);
    updateThemeLabel();
  });
  document.getElementById("pipeline-year").textContent = new Date().getFullYear();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () { scaleNetwork(); requestUpdate(); });
  window.addEventListener("pageshow", function () { scaleNetwork(); requestUpdate(); });
  window.addEventListener("storage", function (event) {
    if (event.key === "portfolio-language") applyLanguage(event.newValue);
    if (event.key === "portfolio-theme") {
      document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
      updateThemeLabel();
    }
  });
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", requestUpdate);
  else reducedMotion.addListener(requestUpdate);
  if (document.fonts) document.fonts.ready.then(requestUpdate);
  requestUpdate();
})();
