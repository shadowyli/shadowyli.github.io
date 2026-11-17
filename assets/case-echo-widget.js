(function () {
  var CARDS = [
    {
      src: "../assets/social-stat-1-20261112.webp",
      width: 1429,
      height: 782,
      long: true,
      altZh: "《第五人格》COA 推特 420 万曝光、3 万赞破圈爆款帖",
      altEn: "Identity V COA Twitter post with 4.2M impressions and 30K likes"
    },
    {
      src: "../assets/social-stat-2-20261112.webp",
      width: 1428,
      height: 780,
      long: true,
      altZh: "《第五人格》COA 推特 35 万曝光、高互动万赞热帖",
      altEn: "Identity V COA Twitter post with 350K impressions and 10K likes"
    },
    {
      src: "../assets/social-stat-3.webp?v=20261112b",
      width: 900,
      height: 1248,
      altZh: "《蛋仔派对》抖音 47 万赞、30 万转超高裂变视频",
      altEn: "Eggy Party Douyin video with 470K likes and 300K reposts"
    },
    {
      src: "../assets/social-stat-4-20261112.webp",
      width: 900,
      height: 688,
      altZh: "《逆水寒》大屏现场抖音 5W+ 赞、万转直拍",
      altEn: "Naraka: Bladepoint large-screen Douyin video with 50K likes and 10K reposts"
    },
    {
      src: "../assets/social-stat-9-20261112.webp",
      width: 900,
      height: 544,
      altZh: "《逆水寒》赛事现场抖音 3.8w 赞、3k+ 转发",
      altEn: "Naraka: Bladepoint event Douyin video with 38K likes and 3K reposts"
    },
    {
      src: "../assets/social-stat-5.webp?v=20261112b",
      width: 900,
      height: 529,
      altZh: "《第五人格》COA 冠军采访抖音万赞热门视频",
      altEn: "Identity V COA champion interview Douyin video with 10K likes"
    },
    {
      src: "../assets/social-stat-6.webp?v=20261112b",
      width: 900,
      height: 451,
      altZh: "《第五人格》COA 冠军群访抖音 4 千赞视频",
      altEn: "Identity V COA champion group interview Douyin video with 4K likes"
    },
    {
      src: "../assets/social-stat-7.webp?v=20261112b",
      width: 900,
      height: 1249,
      altZh: "《蛋仔派对》惊魂杯抖音 3 千赞视频",
      altEn: "Eggy Party Douyin video with 3K likes"
    },
    {
      src: "../assets/social-stat-8.webp?v=20261112b",
      width: 900,
      height: 567,
      altZh: "《第五人格》情报局节目全网 300 万曝光",
      altEn: "Identity V intelligence bureau show with 3M impressions"
    }
  ];

  var COPY = {
    zh: {
      title: "设计的回声",
      aria: "社交媒体反响截图，可左右拖动或用方向键浏览",
      badges: [
        "推特420w+曝光·3万赞+破圈爆款",
        "推特35w+曝光·高互动万赞热帖",
        "抖音47w赞",
        "抖音5W+赞万转直拍",
        "抖音3.8w赞3k+转发",
        "抖音万赞热门",
        "抖音4千+赞",
        "抖音3k+赞",
        "全网300w曝光节目"
      ]
    },
    en: {
      title: "The echo of design",
      aria: "Social response screenshots. Drag horizontally or use the arrow keys.",
      badges: [
        "Twitter · 4.2M impressions · 30K likes",
        "Twitter · 350K impressions · 10K-like hit",
        "Douyin · 470K likes",
        "Douyin · 50K likes · 10K reposts",
        "Douyin · 38K likes · 3K reposts",
        "Douyin · 10K-like hit",
        "Douyin · 4K+ likes",
        "Douyin · 3K+ likes",
        "3M-impression show"
      ]
    }
  };

  function currentLanguage() {
    return document.documentElement.lang === "en" ? "en" : "zh";
  }

  function build(section) {
    section.textContent = "";
    section.setAttribute("aria-labelledby", "echo-sign");

    var title = document.createElement("p");
    title.className = "social-sign";
    title.id = "echo-sign";

    var reel = document.createElement("div");
    reel.className = "echo-reel";
    reel.tabIndex = 0;
    reel.setAttribute("role", "region");

    var canvas = document.createElement("canvas");
    canvas.className = "echo-canvas";
    canvas.setAttribute("aria-hidden", "true");

    var list = document.createElement("div");
    list.className = "echo-list";

    CARDS.forEach(function (card) {
      var figure = document.createElement("figure");
      figure.className = "echo-card";

      var badge = document.createElement("span");
      badge.className = "social-badge" + (card.long ? " social-badge--long" : "");

      var img = document.createElement("img");
      img.src = card.src;
      img.width = card.width;
      img.height = card.height;
      img.loading = "lazy";
      img.decoding = "async";

      figure.appendChild(badge);
      figure.appendChild(img);
      list.appendChild(figure);
    });

    reel.appendChild(canvas);
    reel.appendChild(list);
    section.appendChild(title);
    section.appendChild(reel);
  }

  function update(section, language) {
    var dictionary = COPY[language];
    var title = section.querySelector(".social-sign");
    var reel = section.querySelector(".echo-reel");
    var figures = section.querySelectorAll(".echo-card");

    if (title) title.textContent = dictionary.title;
    if (reel) reel.setAttribute("aria-label", dictionary.aria);

    for (var i = 0; i < figures.length; i++) {
      var badge = figures[i].querySelector(".social-badge");
      var img = figures[i].querySelector("img");
      if (badge) badge.textContent = dictionary.badges[i];
      if (img) img.alt = language === "en" ? CARDS[i].altEn : CARDS[i].altZh;
    }
  }

  function renderAll() {
    var sections = document.querySelectorAll("[data-case-echo]");
    var language = currentLanguage();
    for (var i = 0; i < sections.length; i++) {
      if (!sections[i].querySelector(".echo-reel")) build(sections[i]);
      update(sections[i], language);
    }
  }

  renderAll();

  if (window.MutationObserver) {
    new MutationObserver(renderAll).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }
})();
