(function () {
  "use strict";

  var english = {
    skip: "Skip to content", context: "AI pipeline development", back: "Portfolio ↗",
    name: "Shadow · Li Ying", role: "Project initiator / Lead", heroTitle: "AI PIPELINES", titleCn: "Turn production experience into reusable capability.",
    ownershipBusiness: "Define the work", ownershipBusinessDetail: "Evaluate value and set priorities",
    ownershipBuild: "Build the system", ownershipBuildDetail: "Build the first MVP; lead collaborative development",
    ownershipTeam: "Enable the team", ownershipTeamDetail: "Release standards / Practice / Coaching",
    introStatement: "Grounded in hands-on visual production.<br><strong>Initiate the platform and own product and key development.</strong>",
    scroll: "Scroll to see production change <b>↓</b>",
    routingTitle: "Give each request a better path.",
    routingIntro: "Move suitable work to self-service, and support specialist production.",
    requests: "Business requests", request1: "Text & image swaps", request2: "Multiple formats", request3: "Batch image processing", request4: "Creative & finishing",
    oldQueue: "Schedule / Produce manually", oldQueueDetail: "Different requests, one manual queue",
    routeHub: "Custom pipelines", routeHubDetail: "Built-in standards & steps",
    selfService: "Self-service", selfDetail: "Operations and directors handle suitable standard work",
    professional: "Specialist work", proDetail: "Pipelines assist execution; artists retain judgement",
    beforeLabel: "Before / Requests routed to artists", afterLabel: "After / A path designed for each type of work",
    engineeringTitle: "Generate with AI.<br>Keep precision in tools.",
    engineeringIntro: "Illustrative workflow: use AI for generation; preserve logos, layouts and specifications with deterministic tools.",
    agentRole: "Generate content / Interpret requests / Coordinate execution",
    dataTitle: "A business table", columnTeam: "Team", columnAsset: "Image", columnName: "Name",
    nameA: "Team A", nameB: "Team B", nameC: "Team C", dataNote: "One record becomes one asset",
    templateTitle: "An existing template", imageSlot: "Image slot", nameSlot: "Name slot", templateLayers: "Layout / Layers",
    templateNote: "Reuse professional layouts and preserve fixed brand assets",
    outputTitle: "Batch output", outputNote: "Consistent layout, different records",
    qualityLabel: "Delivery checks", ruleCheck: "Specification", ruleDetail: "Size / Format / Slots",
    visualCheck: "Visual review", visualDetail: "Check against the request",
    humanCheck: "Human acceptance", humanDetail: "Confirm the final result",
    qualityReturn: "Revise failures; escalate when uncertain",
    engineeringEnd: "Canvas for precise adaptation, FFmpeg for motion. Choose by quality, cost and speed.",
    teamTitle: "Build the first version.<br>Lead the versions that follow.",
    teamIntro: "From MVP validation to prioritisation, release planning, acceptance and adoption.",
    teamPipelines: "Development & releases", teamPipelinesDetail: "Connect requirements, implementation, testing and feedback",
    teamPlaybooks: "ComfyUI / n8n guides", teamPlaybooksDetail: "Make practical methods searchable and reusable",
    teamTraining: "Practice & coaching", teamTrainingDetail: "Use real tasks to teach workflows and quality judgement",
    businessAudience: "Operations / Directors", businessBenefit: "Complete suitable requests independently",
    productionAudience: "Art / Animation / AR", productionBenefit: "Reuse pipelines to improve production",
    experience: "Generative practice / ComfyUI workflows / n8n automation / Agents & application engineering",
    practiceLabel: "Selected practice", practiceRole: "Project initiator and lead; key design and development, built with core collaborators.",
    practiceLink: "Explore the product case ↗",
    footerNote: "Shadow · Visual Design Portfolio", contactMe: "Contact me"
  };

  var textElements = Array.from(document.querySelectorAll("[data-copy]"));
  var chinese = {};
  textElements.forEach(function (element) { chinese[element.dataset.copy] = element.innerHTML; });
  var languageButton = document.querySelector(".pipeline-language");
  var themeButton = document.querySelector(".pipeline-theme");
  var language = "zh";
  var motion;
  var drawingState = { batch: 0 };
  var activeRow = -1;
  var rows = Array.from(document.querySelectorAll(".data-row"));
  var templateName = document.querySelector(".template-name");
  var filmCurrent = document.querySelector(".film-current");
  var progressBar = document.querySelector(".film-position b");
  var routingBoard = document.querySelector(".routing-board");

  function preference(key, fallback) {
    try { return localStorage.getItem(key) || fallback; }
    catch (error) { return fallback; }
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); }
    catch (error) { return; }
  }

  function themeLabel() {
    var light = document.documentElement.dataset.theme === "light";
    var label = language === "en"
      ? (light ? "Switch to dark mode" : "Switch to light mode")
      : (light ? "切换到深色模式" : "切换到浅色模式");
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
    document.querySelector('meta[name="theme-color"]').content = light ? "#eef0f1" : "#101214";
  }

  function setLanguage(next) {
    language = next === "en" ? "en" : "zh";
    var dictionary = language === "en" ? english : chinese;
    textElements.forEach(function (element) { element.innerHTML = dictionary[element.dataset.copy]; });
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.title = language === "en" ? "AI Pipeline Development · Shadow Li Ying | Shadowyli" : "AI 管线开发 · 影子 李颖 | Shadowyli";
    document.querySelector('meta[name="description"]').content = language === "en"
      ? "Shadow Li Ying's AI pipeline practice: project ownership, hands-on design and development, and team capability."
      : "影子（李颖）的 AI 管线开发实践。项目发起与负责、产品体验与核心开发，以及面向真实业务的技术组合和团队能力建设。";
    languageButton.textContent = language === "en" ? "CN" : "EN";
    languageButton.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "切换到英文");
    activeRow = -1;
    updateBatch();
    themeLabel();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  setLanguage(preference("portfolio-language", "zh"));
  languageButton.hidden = false;
  themeButton.hidden = false;
  languageButton.addEventListener("click", function () {
    setLanguage(language === "zh" ? "en" : "zh");
    store("portfolio-language", language);
  });
  themeButton.addEventListener("click", function () {
    var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    store("portfolio-theme", next);
    themeLabel();
  });
  document.getElementById("pipeline-year").textContent = new Date().getFullYear();

  function updateBatch() {
    var selected = drawingState.batch <= .01 ? -1 : Math.min(2, Math.floor(drawingState.batch * 3));
    if (selected === activeRow) return;
    activeRow = selected;
    rows.forEach(function (row, index) { row.classList.toggle("is-active", index === selected); });
    templateName.textContent = selected < 0
      ? (language === "en" ? "Name slot" : "名称槽位")
      : rows[selected].lastElementChild.textContent;
    var letters = selected === 2 ? ["C", "B", "A"] : selected === 1 ? ["B", "A", "C"] : ["A", "B", "C"];
    [".sheet-a", ".sheet-b", ".sheet-c"].forEach(function (selector, index) {
      document.querySelector(selector + " > span").textContent = letters[index];
    });
  }

  function setupMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    motion = gsap.matchMedia();
    motion.add({
      animate: "(prefers-reduced-motion: no-preference)",
      tall: "(min-height: 700px)",
      wide: "(min-width: 701px)"
    }, function (context) {
      if (!context.conditions.animate) return;
      if (!context.conditions.tall || !context.conditions.wide) {
        window.ScrollTrigger.create({
          trigger: routingBoard,
          start: "top 80%",
          end: "center 50%",
          onUpdate: function (trigger) { routingBoard.style.setProperty("--route", trigger.progress); },
          onRefresh: function (trigger) { routingBoard.style.setProperty("--route", trigger.progress); }
        });
        return function () { routingBoard.style.removeProperty("--route"); };
      }
      document.body.classList.add("motion-ready");
      gsap.set(".scene-routing, .scene-engineering", { opacity: 0, y: 45 });
      routingBoard.style.setProperty("--route", "0");
      gsap.set(".output-sheet", { opacity: 0 });
      var clock = { hold: 0 };
      var timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          id: "pipeline-film",
          trigger: ".film-stage",
          start: function () { return "top " + document.querySelector(".pipeline-header").offsetHeight; },
          end: function () { return "+=" + Math.round(innerHeight * 3.8); },
          pin: true,
          scrub: .3,
          invalidateOnRefresh: true
        },
        onUpdate: function () {
          var time = timeline.time();
          var routeProgress = Math.max(0, Math.min(1, (time - 1.7) / .8));
          routingBoard.style.setProperty("--route", routeProgress * routeProgress * (3 - 2 * routeProgress));
          filmCurrent.textContent = time < 1.05 ? "00" : time < 3.45 ? "01" : "02";
          progressBar.style.transform = "scaleY(" + timeline.progress() + ")";
          updateBatch();
        }
      });
      timeline.addLabel("ownership", 0)
        .to(".scene-intro", { opacity: 0, y: -45, duration: .32 }, .8)
        .to(".scene-routing", { opacity: 1, y: 0, duration: .32 }, .92)
        .addLabel("queue", 1.24)
        .to(".queue-stack i", { x: -6, stagger: .05, duration: .35 }, 1.24)
        .addLabel("reroute", 1.7)
        .to(".scene-routing", { opacity: 0, y: -40, duration: .3 }, 3.1)
        .to(".scene-engineering", { opacity: 1, y: 0, duration: .3 }, 3.22)
        .addLabel("batch", 3.65)
        .to(drawingState, { batch: 1, duration: 1.1, ease: "none" }, "batch")
        .to(".output-sheet", { opacity: 1, duration: .3, stagger: .2 }, 3.85)
        .to(clock, { hold: 1, duration: .7 }, 5.1);
      return function () {
        document.body.classList.remove("motion-ready");
        routingBoard.style.removeProperty("--route");
        drawingState.batch = 0;
        activeRow = -2;
        updateBatch();
      };
    });
  }

  window.addEventListener("pageshow", function () {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  window.addEventListener("storage", function (event) {
    if (event.key === "portfolio-language") setLanguage(event.newValue);
    if (event.key === "portfolio-theme") {
      document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
      themeLabel();
    }
  });
  setupMotion();
  if (document.fonts) document.fonts.ready.then(function () {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
})();
