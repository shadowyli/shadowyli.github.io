(function () {
  var PEOPLE = {
    shadow: { zh: "影子（李颖）", en: "Shadow (Li Ying)" },
    jiYun: { zh: "纪云", en: "Ji Yun" },
    liChuyi: { zh: "李楚怡", en: "Li Chuyi" },
    zhengSikai: { zh: "郑斯锴", en: "Zheng Sikai" },
    chengYuhan: { zh: "程禹涵", en: "Cheng Yuhan" },
    liuBaiqiang: { zh: "刘佰强", en: "Liu Baiqiang" },
    huXusheng: { zh: "胡煦升", en: "Hu Xusheng" },
    liuXing: { zh: "刘星", en: "Liu Xing" },
    liXia: { zh: "黎夏", en: "Li Xia" },
    daiZexuan: { zh: "戴泽宣", en: "Dai Zexuan" },
    wenHong: { zh: "文鸿", en: "Wen Hong" },
    zhangZhehan: { zh: "张喆涵", en: "Zhang Zhehan" },
    kuangZhenwei: { zh: "匡振威", en: "Kuang Zhenwei" },
    zhongFengjun: { zh: "钟丰骏", en: "Zhong Fengjun" },
    zouWenjun: { zh: "邹文君", en: "Zou Wenjun" }
  };

  var CREDITS = {
    campaign: [
      { zh: "3D & 视觉创意设计", en: "3D & Visual Creative Design", people: ["shadow"] }
    ],
    danzai: [
      { zh: "3D & 视觉创意设计", en: "3D & Visual Creative Design", people: ["shadow"] },
      { zh: "美术监修", en: "Art Supervision", people: ["shadow"] },
      { zh: "动效设计", en: "Motion Design", people: ["jiYun", "liChuyi", "zhengSikai", "liuBaiqiang"] },
      { zh: "美术督导", en: "Art Direction", people: ["huXusheng", "liuXing"] }
    ],
    flowx: [
      { zh: "项目发起人", en: "Project Sponsor", people: ["shadow"] },
      { zh: "项目负责人", en: "Project Lead", people: ["shadow"] },
      { zh: "产品经理", en: "Product Manager", people: ["shadow", "zhangZhehan"] },
      { zh: "核心开发", en: "Core Development", people: ["shadow", "kuangZhenwei", "zhangZhehan"] },
      { zh: "开发实习", en: "Development Intern", people: ["zhongFengjun"] },
      { zh: "运营维护", en: "Operations & Maintenance", people: ["shadow", "kuangZhenwei"] },
      { zh: "AI应用工程", en: "AI Application Engineering", people: ["shadow", "kuangZhenwei", "zhangZhehan", "zhongFengjun"] },
      { zh: "UI/UX设计", en: "UI/UX Design", people: ["shadow"] },
      { zh: "美术支持", en: "Art Support", people: ["shadow", "kuangZhenwei"] },
      { zh: "动画支持", en: "Animation Support", people: ["liuXing", "liuBaiqiang", "zouWenjun"] },
      { zh: "项目指导", en: "Project Advisors", people: ["huXusheng", "liuXing"] },
      { zh: "业务支持", en: "Business Support", people: ["huXusheng", "liuXing"] }
    ],
    mengshou: [
      { zh: "3D & 视觉创意设计", en: "3D & Visual Creative Design", people: ["shadow"] },
      { zh: "动效设计", en: "Motion Design", people: ["liChuyi", "jiYun", "zhengSikai", "chengYuhan", "liuBaiqiang"] },
      { zh: "美术督导", en: "Art Direction", people: ["huXusheng", "liuXing"] },
      { zh: "美术监修", en: "Art Supervision", people: ["shadow"] }
    ],
    merchandise: [
      { zh: "3D & 视觉设计 & 包装设计", en: "3D & Visual Design & Packaging Design", people: ["shadow"] }
    ],
    stage: [
      { zh: "舞美设计", en: "Stage Design", people: ["shadow"] },
      { zh: "舞美监制&执行", en: "Stage Supervision & Execution", people: ["liXia", "daiZexuan", "wenHong"] }
    ]
  };

  var JOIN = { zh: "、", en: ", " };
  var COLON = { zh: "：", en: ": " };
  var LABEL = { zh: "项目署名", en: "Project credits" };

  function currentLanguage() {
    return document.documentElement.lang === "en" ? "en" : "zh";
  }

  function renderList(list) {
    var key = list.getAttribute("data-case-credits");
    var items = CREDITS[key];
    if (!items) return;

    var lang = currentLanguage();
    list.setAttribute("aria-label", LABEL[lang]);
    list.setAttribute("data-count", String(items.length));
    list.textContent = "";

    items.forEach(function (item) {
      var names = item.people.map(function (id) {
        return PEOPLE[id][lang];
      });
      var row = document.createElement("li");
      row.textContent = item[lang] + COLON[lang] + names.join(JOIN[lang]);
      list.appendChild(row);
    });
  }

  function renderAll() {
    var lists = document.querySelectorAll("[data-case-credits]");
    for (var i = 0; i < lists.length; i++) {
      renderList(lists[i]);
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
