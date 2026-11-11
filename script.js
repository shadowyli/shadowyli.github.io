const searchInput = document.querySelector("#search-input");
const searchBox = document.querySelector(".search-box");
const projectCards = [...document.querySelectorAll(".project-card")];
const resultsMessage = document.querySelector(".results-message");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const tabList = document.querySelector(".tabs");
const primaryNavLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
const languageToggle = document.querySelector(".language-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const contactButton = document.querySelector(".sidebar-contact");
const contactDialog = document.querySelector(".contact-dialog");
const ageElement = document.querySelector(".age");
const timelineScroll = document.querySelector(".timeline-scroll");
const timelineShell = document.querySelector(".timeline-scroll-shell");

if (window.lucide) {
  window.lucide.createIcons();
}

const translations = {
  zh: {
    skip: "跳到作品区",
    work: "作品",
    about: "关于我",
    intro: "关于我",
    contact: "联系",
    search: "搜索作品",
    portfolioTitle: "作品集",
    featuredHeading: "主要项目",
    disciplineHeading: "我的作品",
    eyebrow: "VISUAL WORK / 2026",
    availability: "正在关注工作机会",
    role: "高级视觉创意设计师",
    experienceTag: "工作3年+",
    contactMe: "联系我",
    wechatTitle: "微信二维码",
    saveHint: "长按图片保存二维码",
    timelineTitle: "工作经历",
    timelineScrollLabel: "工作经历时间轴，可横向滑动",
    workSummary: "我的工作简介",
    present: "至今",
    netease: "网易互娱",
    seniorRole: "高级视觉创意设计师",
    designerRole: "视觉设计师",
    visualIntern: "视觉设计实习生",
    leiting: "雷霆游戏",
    brandIntern: "品牌视觉设计实习生",
    tecdo: "钛动科技",
    graphicIntern: "平面设计实习生",
    szu: "深圳大学",
    fineArts: "美术学（版画）",
    bio: "踏踏实实，保持热爱",
    location: "中国 广州",
    education: "深圳大学 美术学本科",
    mengshouTitle: "《梦幻西游》手游巅峰联赛",
    danzaiTitle: "《蛋仔派对》全国总决赛",
    stageDesignTitle: "舞美设计",
    merchandiseTitle: "周边物料",
    campaignTitle: "宣发设计",
    largeScreenTitle: "大屏视觉",
    aiPipelineTitle: "AI 管线开发",
    aboutTitle: "保持对美的追求。",
    aboutPoint1: "3 年以上游戏赛事与品牌视觉创意经验，具备独立负责视觉项目、风格探索与系列化设计的能力",
    aboutPoint2: "负责主视觉 KV、角色海报、版本宣传物料、品牌 VI 及品牌联动视觉的创意与系列化延展",
    aboutPoint3: "围绕产品卖点、角色设定与内容主题提炼视觉概念，输出创意提案、Mood Board、视觉风格方案与设计规范",
    aboutPoint4: "将角色、场景及演出资产转化为营销传播视觉，并完成大屏、周边、舞美外场与宣发物料的多媒介落地",
    otherTitle: "其他",
    otherPoint1: "网易第二届 AIGC 应用分享大赛 AI 美术管线人气奖（3 项）",
    otherPoint2: "微软 & 领英生成式 AI 职业要素专业认证",
    otherPoint3: "深圳大学校级优秀学生干部奖学金、学习奖学金（专业前 9%）",
    otherPoint4: "深圳大学社团联合活动中心学生会长（协调百人团队承办英雄联盟高校行、深圳市大学生歌手大奖赛半决赛、深圳大学彩色跑等千人规模高校活动）",
    toolsTitle: "我常用的工具",
    languageTitle: "我会说",
    languageList: "普通话（二甲）、粤语（母语）、英语（CET-4）、日语（JLPT-N3）",
    mandarin: "普通话",
    mandarinLevel: "二甲",
    cantonese: "粤语",
    cantoneseLevel: "母语",
    english: "英语",
    japanese: "日语",
    focusLabel: "专注方向",
    focusValue: "品牌视觉 / 游戏营销",
    baseLabel: "所在地",
    baseValue: "中国 广州",
    targetCitiesLabel: "意向城市",
    targetCitiesValue: "广州/深圳",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单"
  },
  en: {
    skip: "Skip to work",
    work: "Work",
    about: "About Me",
    intro: "About Me",
    contact: "Contact",
    search: "Search work",
    portfolioTitle: "Portfolio",
    featuredHeading: "Key Projects",
    disciplineHeading: "My Work",
    eyebrow: "VISUAL WORK / 2026",
    availability: "Open to opportunities",
    role: "Senior Visual Creative Designer",
    experienceTag: "3+ Years",
    contactMe: "Contact Me",
    wechatTitle: "WeChat QR code",
    saveHint: "Press and hold the image to save it",
    timelineTitle: "Experience",
    timelineScrollLabel: "Career timeline, scroll horizontally",
    workSummary: "Work Summary",
    present: "Present",
    netease: "NetEase Games",
    seniorRole: "Senior Visual Creative Designer",
    designerRole: "Visual Designer",
    visualIntern: "Visual Design Intern",
    leiting: "Leiting Games",
    brandIntern: "Brand Visual Design Intern",
    tecdo: "TEC-DO",
    graphicIntern: "Graphic Design Intern",
    szu: "Shenzhen University",
    fineArts: "Fine Arts (Printmaking)",
    bio: "Stay grounded, stay passionate.",
    location: "Guangzhou, China",
    education: "Shenzhen University / BFA",
    mengshouTitle: "Fantasy Westward Journey Mobile Peak League",
    danzaiTitle: "Eggy Party National Finals",
    stageDesignTitle: "Stage Design",
    merchandiseTitle: "Merchandise",
    campaignTitle: "Campaign Design",
    largeScreenTitle: "Large-Screen Visuals",
    aiPipelineTitle: "AI Pipeline Development",
    aboutTitle: "Keep pursuing beauty.",
    aboutPoint1: "3+ years of visual creative experience across game esports and brand projects, with the ability to independently lead visual projects, explore styles, and build cohesive design systems.",
    aboutPoint2: "Create key visuals, character posters, version campaign assets, brand VI, and co-branding visuals with systematic extensions across deliverables.",
    aboutPoint3: "Translate product selling points, character settings, and content themes into visual concepts, creative proposals, mood boards, style directions, and design guidelines.",
    aboutPoint4: "Transform character, environment, and performance assets into marketing visuals across large screens, merchandise, stage environments, outdoor spaces, and campaign materials.",
    otherTitle: "Additional Highlights",
    otherPoint1: "People's Choice Award for AI Art Pipeline (3 entries), NetEase 2nd AIGC Application Sharing Competition",
    otherPoint2: "Career Essentials in Generative AI Professional Certificate by Microsoft and LinkedIn",
    otherPoint3: "Shenzhen University Outstanding Student Leader Scholarship and Academic Scholarship (top 9% of major)",
    otherPoint4: "President of the Shenzhen University Student Union Activities Center; coordinated a 100-person team to deliver large campus events for 1,000+ attendees, including the League of Legends Campus Tour, Shenzhen Student Singer Competition Semifinal, and Shenzhen University Color Run.",
    toolsTitle: "Tools I Use",
    languageTitle: "Languages",
    languageList: "Mandarin (Level 2-A) · Cantonese (Native) · English (CET-4) · Japanese (JLPT N3)",
    mandarin: "Mandarin",
    mandarinLevel: "Level 2-A",
    cantonese: "Cantonese",
    cantoneseLevel: "Native",
    english: "English",
    japanese: "Japanese",
    focusLabel: "FOCUS",
    focusValue: "Brand Visual / Game Marketing",
    baseLabel: "BASE",
    baseValue: "Guangzhou, China",
    targetCitiesLabel: "TARGET CITIES",
    targetCitiesValue: "Guangzhou / Shenzhen",
    openMenu: "Open menu",
    closeMenu: "Close menu"
  }
};

let currentLanguage = localStorage.getItem("portfolio-language") === "en" ? "en" : "zh";
let currentTheme = localStorage.getItem("portfolio-theme") === "light" ? "light" : "dark";

const translate = (key) => translations[currentLanguage][key] || key;

// QA-02 / QA-05：英文模式下的属性层与局部文本（不改 HTML、不新增翻译键）
const localizedAttributes = [
  { selector: "a.brand", attribute: "aria-label", zh: "Shadowyli 首页", en: "Shadowyli home" },
  { selector: "nav.desktop-nav", attribute: "aria-label", zh: "主导航", en: "Main navigation" },
  { selector: "nav.mobile-nav", attribute: "aria-label", zh: "移动端导航", en: "Mobile navigation" },
  { selector: ".profile-hero", attribute: "aria-label", zh: "Shadowyli 个人封面", en: "Shadowyli cover" },
  { selector: ".profile-avatar", attribute: "alt", zh: "李颖 LI YING 的头像", en: "Li Ying (LI YING) avatar" },
  { selector: ".profile-meta", attribute: "aria-label", zh: "个人信息", en: "Personal information" },
  { selector: ".featured-projects", attribute: "aria-label", zh: "精选作品", en: "Featured projects" },
  { selector: ".project-grid", attribute: "aria-label", zh: "作品列表", en: "Project list" },
  { selector: ".project-card-link", attribute: "aria-label", zh: "查看项目案例：大屏视觉 · 《全明星街球派对》DCDG 全球冠军赛", en: "View case study: Large-Screen Visuals · All-Star Streetball Party DCDG Global Championship" },
  { selector: ".language-tags", attribute: "aria-label", zh: "语言能力", en: "Languages" },
  { selector: ".qr-image", attribute: "alt", zh: "影子的微信二维码", en: "Shadowyli WeChat QR code" },
  { selector: ".dialog-close", attribute: "aria-label", zh: "关闭", en: "Close" },
  { selector: 'img[src="assets/mengshou-cover.webp"]', attribute: "alt", zh: "《梦幻西游》手游巅峰联赛赛事品牌美术规划封面", en: "Fantasy Westward Journey Mobile Peak League brand art cover" },
  { selector: 'img[src="assets/danzai-cover.webp"]', attribute: "alt", zh: "第三届蛋仔派对全国总决赛主 KV", en: "Eggy Party 3rd National Finals key visual" },
  { selector: 'img[src="assets/campaign-cover.webp"]', attribute: "alt", zh: "COA 2025 全球总决赛冠军海报", en: "COA 2025 Global Finals championship poster" },
  { selector: 'img[src="assets/large-screen-cover.webp"]', attribute: "alt", zh: "《全明星街球派对》DCDG 全球冠军赛大屏视觉舞台设计", en: "All-Star Streetball Party DCDG Global Championship large-screen stage design" },
  { selector: 'img[src="assets/merchandise-cover.webp"]', attribute: "alt", zh: "王牌竞速星芒争锋赛奖牌渲染三视图", en: "Ace Racer Star Radiance Championship medal render, three views" },
  { selector: 'img[src="assets/stage-design-cover.webp"]', attribute: "alt", zh: "蓝色电竞赛事舞台舞美设计", en: "Blue esports stage set design" },
  { selector: 'img[src="assets/ai-pipeline-cover.webp"]', attribute: "alt", zh: "ComfyUI AI 图像生成工作流管线开发界面", en: "ComfyUI AI image generation workflow pipeline interface" }
];

const localizedTexts = [
  { selector: ".project-card-cta", zh: "查看项目 →", en: "View project →" }
];

// QA-06：空状态元素由页面静态提供（#empty-state），这里只负责显隐与文案
const getEmptyState = () => document.querySelector("#empty-state, .empty-state");

const emptyStateCopy = {
  zh: { title: "没有找到相关作品", hint: "换个关键词试试，或清空搜索框查看全部作品。" },
  en: { title: "No projects found", hint: "Try another keyword, or clear the search to see all projects." }
};

const updateEmptyStateText = (language) => {
  const container = getEmptyState();
  if (!container) return;
  const copy = emptyStateCopy[language] || emptyStateCopy.zh;
  const titleNode = container.querySelector("[data-empty-title], h3, h2, strong");
  const hintNode = container.querySelector("[data-empty-text], p");
  if (!titleNode && !hintNode) {
    if (container.childElementCount === 0) {
      container.textContent = language === "zh"
        ? `${copy.title}，${copy.hint}`
        : `${copy.title}. ${copy.hint}`;
    }
    return;
  }
  if (titleNode) titleNode.textContent = copy.title;
  if (hintNode) hintNode.textContent = copy.hint;
};

const applyLocalizedAttributes = (language) => {
  localizedAttributes.forEach(({ selector, attribute, zh, en }) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute(attribute, language === "zh" ? zh : en);
    });
  });

  localizedTexts.forEach(({ selector, zh, en }) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = language === "zh" ? zh : en;
    });
  });

  updateEmptyStateText(language);
};

const updateTimelineHint = () => {
  const maxScroll = timelineScroll.scrollWidth - timelineScroll.clientWidth;
  timelineShell.classList.toggle("no-overflow", maxScroll <= 2);
  timelineShell.classList.toggle("at-end", timelineScroll.scrollLeft >= maxScroll - 2);
};

const applyTheme = (theme) => {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  const nextIsLight = theme === "dark";
  const label = currentLanguage === "zh"
    ? `切换到${nextIsLight ? "浅色" : "深色"}模式`
    : `Switch to ${nextIsLight ? "light" : "dark"} mode`;
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("title", label);
  themeToggle.innerHTML = `<i data-lucide="${theme === "dark" ? "sun" : "moon"}" aria-hidden="true"></i>`;
  if (window.lucide) window.lucide.createIcons();
  localStorage.setItem("portfolio-theme", theme);
};

const updateAge = () => {
  const birthYear = Number(ageElement.dataset.birthYear);
  if (!Number.isFinite(birthYear)) return;
  const birthMonth = Number(ageElement.dataset.birthMonth);
  const birthDay = Number(ageElement.dataset.birthDay);
  const today = new Date();
  let age = today.getFullYear() - birthYear;

  // 生日已过与否：只有数据里带了月/日才能精确判断，缺字段时退化为按年计算
  if (Number.isFinite(birthMonth) && Number.isFinite(birthDay) && birthMonth >= 1 && birthDay >= 1) {
    const currentMonth = today.getMonth() + 1;
    const hasHadBirthday = currentMonth > birthMonth || (currentMonth === birthMonth && today.getDate() >= birthDay);
    if (!hasHadBirthday) age -= 1;
  }

  ageElement.textContent = currentLanguage === "zh"
    ? `${age}岁（${birthYear}年）`
    : `${age} years old (Born ${birthYear})`;
};

const applyLanguage = (language) => {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  updateAge();

  searchInput.placeholder = language === "zh" ? "搜索作品…" : "Search work…";
  languageToggle.querySelector("span").textContent = language === "zh" ? "EN" : "CN";
  languageToggle.setAttribute("aria-label", language === "zh" ? "切换到英文" : "Switch to Chinese");
  languageToggle.setAttribute("title", language === "zh" ? "切换到英文" : "Switch to Chinese");
  menuButton.setAttribute("aria-label", menuButton.getAttribute("aria-expanded") === "true" ? translate("closeMenu") : translate("openMenu"));
  document.querySelector(".tabs").setAttribute("aria-label", language === "zh" ? "个人页内容" : "Portfolio sections");
  document.querySelector(".profile-sidebar").setAttribute("aria-label", language === "zh" ? "个人资料" : "Profile");
  timelineScroll.setAttribute("aria-label", translate("timelineScrollLabel"));
  document.title = language === "zh" ? "Shadowyli - 个人作品集" : "Shadowyli - Portfolio";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", language === "zh"
      ? "Shadowyli 的个人作品集。"
      : "Portfolio of Shadowyli — event screen design and visual creatives.");
  }
  applyLocalizedAttributes(language);
  localStorage.setItem("portfolio-language", language);
  applyTheme(currentTheme);
};

const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

let dialogTrigger = null;
let dialogCloseBound = false;

const getFocusableElements = (container) => [...container.querySelectorAll(
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
)].filter((element) => !element.hidden && element.getClientRects().length > 0);

const bindDialogCloseButton = () => {
  if (dialogCloseBound) return;
  const closeButton = contactDialog.querySelector(".dialog-close");
  if (!closeButton) return;
  closeButton.addEventListener("click", closeContactDialog);
  dialogCloseBound = true;
};

const openContactDialog = () => {
  dialogTrigger = document.activeElement;
  contactDialog.querySelectorAll("img[data-src]").forEach((image) => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  });
  contactDialog.hidden = false;
  document.body.classList.add("dialog-open");
  bindDialogCloseButton();
  const focusable = getFocusableElements(contactDialog);
  (focusable[0] || contactDialog).focus();
};

const closeContactDialog = () => {
  contactDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  dialogTrigger?.focus();
};

const filterProjects = () => {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  if (query) {
    activateTab("work");
  }

  projectCards.forEach((card) => {
    const searchable = normalize(`${card.dataset.title} ${card.dataset.tags}`);
    const matched = !query || searchable.includes(query);
    card.hidden = !matched;
    if (matched) visibleCount += 1;
  });

  const emptyStateElement = getEmptyState();
  if (emptyStateElement) {
    emptyStateElement.hidden = visibleCount !== 0;
    if (visibleCount === 0 && query) updateEmptyStateText(currentLanguage);
  }
  resultsMessage.textContent = query
    ? currentLanguage === "zh"
      ? `找到 ${visibleCount} 个与“${searchInput.value.trim()}”相关的作品`
      : `${visibleCount} result${visibleCount === 1 ? "" : "s"} for "${searchInput.value.trim()}"`
    : "";

  // 空状态已给出「没有找到」的视觉信息时，计数行只留给读屏，避免视觉重复。
  // .results-message 自带 min-height/margin，这里补内联复位让 .sr-only 真正收起。
  const hideCountForEmpty = Boolean(query) && visibleCount === 0 && Boolean(emptyStateElement);
  resultsMessage.classList.toggle("sr-only", hideCountForEmpty);
  if (hideCountForEmpty) {
    resultsMessage.style.minHeight = "0";
    resultsMessage.style.margin = "0";
  } else {
    resultsMessage.style.removeProperty("min-height");
    resultsMessage.style.removeProperty("margin");
  }
};

searchInput.addEventListener("input", filterProjects);

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && !contactDialog.hidden) {
    const focusable = getFocusableElements(contactDialog);
    if (focusable.length === 0) {
      event.preventDefault();
      contactDialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const isInside = contactDialog.contains(document.activeElement);
    if (event.shiftKey) {
      if (!isInside || document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (!isInside || document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }

  if (event.key === "Escape" && !contactDialog.hidden) {
    closeContactDialog();
    return;
  }

  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuState(false);
    return;
  }

  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchBox.classList.add("open");
    searchInput.focus();
  }

  if (event.key === "Escape") {
    searchInput.value = "";
    searchBox.classList.remove("open");
    filterProjects();
    searchInput.blur();
  }
});

searchBox.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 560px)").matches) {
    searchBox.classList.add("open");
    searchInput.focus();
  }
});

contactButton.addEventListener("click", openContactDialog);

contactDialog.addEventListener("click", (event) => {
  if (event.target === contactDialog) {
    closeContactDialog();
  }
});

let timelineDrag = null;
let timelineMomentumFrame = null;

const stopTimelineMomentum = () => {
  if (timelineMomentumFrame) cancelAnimationFrame(timelineMomentumFrame);
  timelineMomentumFrame = null;
};

const applyTimelineMomentum = (velocity) => {
  const step = () => {
    velocity *= 0.92;
    if (Math.abs(velocity) < 0.08) return;
    timelineScroll.scrollLeft += velocity * 16;
    timelineMomentumFrame = requestAnimationFrame(step);
  };
  timelineMomentumFrame = requestAnimationFrame(step);
};

timelineScroll.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  stopTimelineMomentum();
  timelineDrag = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScroll: timelineScroll.scrollLeft,
    lastX: event.clientX,
    lastTime: performance.now(),
    velocity: 0,
    active: false,
    cancelled: false
  };
});

timelineScroll.addEventListener("pointermove", (event) => {
  if (!timelineDrag || timelineDrag.id !== event.pointerId || timelineDrag.cancelled) return;
  const distanceX = event.clientX - timelineDrag.startX;
  const distanceY = event.clientY - timelineDrag.startY;

  if (!timelineDrag.active) {
    if (Math.abs(distanceX) < 6 && Math.abs(distanceY) < 6) return;
    if (Math.abs(distanceY) >= Math.abs(distanceX)) {
      timelineDrag.cancelled = true;
      return;
    }
    timelineDrag.active = true;
    timelineScroll.classList.add("is-dragging");
    timelineScroll.setPointerCapture(event.pointerId);
  }

  if (event.cancelable) event.preventDefault();
  const currentTime = performance.now();
  const elapsed = Math.max(1, currentTime - timelineDrag.lastTime);
  timelineDrag.velocity = -(event.clientX - timelineDrag.lastX) / elapsed;
  timelineDrag.lastX = event.clientX;
  timelineDrag.lastTime = currentTime;
  timelineScroll.scrollLeft = timelineDrag.startScroll - distanceX;
});

const stopTimelineDrag = (event) => {
  if (!timelineDrag || timelineDrag.id !== event.pointerId) return;
  const { active, velocity } = timelineDrag;
  if (timelineScroll.hasPointerCapture(event.pointerId)) timelineScroll.releasePointerCapture(event.pointerId);
  timelineScroll.classList.remove("is-dragging");
  timelineDrag = null;
  if (active) applyTimelineMomentum(velocity);
};

timelineScroll.addEventListener("pointerup", stopTimelineDrag);
timelineScroll.addEventListener("pointercancel", stopTimelineDrag);
timelineScroll.addEventListener("scroll", updateTimelineHint, { passive: true });
window.addEventListener("resize", updateTimelineHint);

const setMenuState = (open) => {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? translate("closeMenu") : translate("openMenu"));
  mobileNav.hidden = !open;
  menuButton.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
  if (window.lucide) window.lucide.createIcons();
};

// 菜单图标在点击时会被 innerHTML 替换，事件目标随即脱离文档，
// 因此用一次性标记跳过同一次点击的「点击外部关闭」判断。
let menuClickHandled = false;

menuButton.addEventListener("click", () => {
  menuClickHandled = true;
  window.setTimeout(() => { menuClickHandled = false; }, 0);
  setMenuState(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuState(false);
  }
});

document.addEventListener("click", (event) => {
  if (menuClickHandled) return;
  if (menuButton.getAttribute("aria-expanded") !== "true") return;
  if (event.target.closest(".menu-button") || event.target.closest(".mobile-nav")) return;
  setMenuState(false);
});

const hashForTab = (tab) => tab === "about" ? "#about" : "#portfolio";
const tabFromHash = () => window.location.hash === "#about" ? "about" : "work";
const scrollToTabAnchor = (tab) => {
  document.querySelector(hashForTab(tab))?.scrollIntoView({ block: "start" });
};

const activateTab = (selectedTab) => {
  tabButtons.forEach((tab) => {
    const active = tab.dataset.tab === selectedTab;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.id !== `panel-${selectedTab}`;
  });

  const activeHash = hashForTab(selectedTab);
  primaryNavLinks.forEach((link) => {
    const active = link.getAttribute("href") === activeHash;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTab = button.dataset.tab;
    const nextHash = hashForTab(selectedTab);
    activateTab(selectedTab);
    if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
    window.requestAnimationFrame(() => scrollToTabAnchor(selectedTab));
  });
});

tabList.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  const currentIndex = tabButtons.indexOf(document.activeElement);
  const selectedIndex = tabButtons.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
  const index = currentIndex === -1 ? Math.max(selectedIndex, 0) : currentIndex;
  let nextIndex = index;

  if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
  else if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
  else if (event.key === "Home") nextIndex = 0;
  else nextIndex = tabButtons.length - 1;

  event.preventDefault();
  const nextTab = tabButtons[nextIndex];
  nextTab.focus();
  if (nextTab.getAttribute("aria-selected") !== "true") nextTab.click();
});

primaryNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    activateTab(link.getAttribute("href") === "#about" ? "about" : "work");
  });
});

const activateTabFromHash = () => {
  const selectedTab = tabFromHash();
  activateTab(selectedTab);
  if (window.location.hash === hashForTab(selectedTab)) {
    window.requestAnimationFrame(() => scrollToTabAnchor(selectedTab));
  }
};
window.addEventListener("hashchange", activateTabFromHash);
window.addEventListener("popstate", activateTabFromHash);
activateTabFromHash();

languageToggle.addEventListener("click", () => {
  applyLanguage(currentLanguage === "zh" ? "en" : "zh");
  filterProjects();
});

themeToggle.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

bindDialogCloseButton();
applyLanguage(currentLanguage);
requestAnimationFrame(updateTimelineHint);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  projectCards.forEach((card) => card.classList.add("revealed"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = projectCards.indexOf(entry.target);
          window.setTimeout(() => entry.target.classList.add("revealed"), (index % 3) * 70);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  projectCards.forEach((card) => observer.observe(card));
}
