/* ================================================================
   网工真题 · 核心逻辑
   ================================================================ */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const pick = (arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const fmtClock = sec => { sec = Math.max(0, Math.round(sec)); return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); };
const fmtDate = ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const fmtTime = ts => { const d = new Date(ts); return fmtDate(ts) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const todayKey = () => fmtDate(Date.now());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- 图标 ---------- */
const I = {
  home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
  exam: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>',
  bank: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  wrong: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5V12"/><path d="M12 16.2v.1"/></svg>',
  stats: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/></svg>',
  manage: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>',
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  install: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg>',
  gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>',
  star: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z"/></svg>',
  starO: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z"/></svg>',
  flag: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/></svg>',
  clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m6 11 6 6 6-6"/><path d="M4 21h16"/></svg>',
  upload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m6 9 6-6 6 6"/><path d="M4 21h16"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>',
  refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
  doc: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>'
};

/* ---------- 题库合并（REAL_BANK / MOCK_BANK 在下方数据文件中） ---------- */
const BANK = (typeof REAL_BANK !== "undefined" ? REAL_BANK : []).concat(typeof MOCK_BANK !== "undefined" ? MOCK_BANK : []);
const BANK_MAP = {}; BANK.forEach(q => BANK_MAP[q.id] = q);
const allBank = () => BANK.concat(EXTRA);
const POINTS = ["计算机硬件","操作系统","数据通信基础","网络体系结构","IP地址与子网","局域网与交换","广域网与接入","网络层与路由","传输层","应用层协议","网络安全","无线网络","网络管理与监控","网络规划与布线","系统开发与项目管理","存储与新技术","法律法规与知识产权"];
const DIFF_TXT = ["", "易", "较易", "中等", "较难", "难"];

/* ---------- 年份+场次 辅助 ---------- */
const semTxt = s => s === "下" ? "下半年" : "上半年";
const yearSemKey = (y, s) => String(y) + (s === "下" ? "下" : "上");
const yearSemLabel = q => q.year + semTxt(q.sem);

/* ---------- 本地存储 ---------- */
const Store = {
  get(k, d) { try { const v = localStorage.getItem("netexam." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("netexam." + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { localStorage.removeItem("netexam." + k); }
};
const DB = {
  records: Store.get("records", []),       // 考试记录（含每题明细）
  wrong: Store.get("wrong", []),           // 错题 [{qid,cnt,last}]
  fav: Store.get("fav", []),               // 收藏 qid[]
  settings: Object.assign({ theme: "light", examMinutes: 0, wrongCapture: true, shuffleOptions: false, shuffleQuestions: true }, Store.get("settings", {})),
  imported: Store.get("imported", []),     // 导入的题目（保留以便导出）
  save() { Store.set("records", this.records); Store.set("wrong", this.wrong); Store.set("fav", this.fav); Store.set("settings", this.settings); Store.set("imported", this.imported); }
};
const isFav = qid => DB.fav.includes(qid);
const wrongMap = () => { const m = {}; DB.wrong.forEach(w => m[w.qid] = w); return m; };
const EXTRA = Store.get("extra", []);
EXTRA.forEach(q => BANK_MAP[q.id] = q);

/* ---------- UI：toast / modal / drawer ---------- */
function toast(msg, type) {
  const t = document.createElement("div");
  t.className = "toast" + (type ? " " + type : "");
  t.textContent = msg;
  $("#toasts").appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200);
}
function modal(title, body, actions) {
  $("#modal").innerHTML = "<h3>" + esc(title) + "</h3>" + body + '<div class="m-actions">' + actions + "</div>";
  $("#modalMask").classList.add("show");
  $$("#modal [data-close]").forEach(b => b.onclick = closeModal);
}
function closeModal() { $("#modalMask").classList.remove("show"); }
function openDrawer(html) { $("#drawerBody").innerHTML = html; $("#drawer").classList.add("show"); $("#drawerMask").classList.add("show"); }
function closeDrawer() { $("#drawer").classList.remove("show"); $("#drawerMask").classList.remove("show"); }

/* ---------- 主题 ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#themeBtn").innerHTML = t === "dark" ? I.sun : I.moon;
  DB.settings.theme = t; DB.save();
}

/* ---------- 路由 ---------- */
const ROUTES = ["home", "exam-cfg", "exam", "result", "bank", "wrong", "stats", "manage", "settings"];
const NAV = [
  ["home", "首页", I.home],
  ["exam-cfg", "模拟考试", I.exam],
  ["bank", "题库", I.bank],
  ["wrong", "错题本", I.wrong],
  ["stats", "学习分析", I.stats],
  ["manage", "题库管理", I.manage]
];
let currentRoute = "home";
function go(route) { location.hash = "#/" + route; }
function router() {
  let r = location.hash.replace(/^#\/?/, "").split("?")[0];
  if (!ROUTES.includes(r)) r = "home";
  if (r === "exam" && !Exam.active) r = "exam-cfg";
  currentRoute = r;
  $$(".page").forEach(p => p.classList.remove("on"));
  const el = $("#view-" + r); if (el) el.classList.add("on");
  renderNav();
  renderTop();
  $("#examToolbar").style.display = (r === "exam" && Exam.active && window.innerWidth <= 1024) ? "block" : "none";
  ({ home: renderHome, "exam-cfg": renderExamCfg, exam: renderExam, result: renderResult, bank: renderBank, wrong: renderWrong, stats: renderStats, manage: renderManage, settings: renderSettings })[r]();
  window.scrollTo(0, 0);
}
function renderNav() {
  $("#nav").innerHTML = NAV.map(([r, t, ic]) =>
    '<button data-go="' + r + '" class="' + (currentRoute === r ? "on" : "") + '">' + ic + '<span class="nav-txt">' + t + "</span></button>").join("");
  $$("#nav button").forEach(b => b.onclick = () => go(b.dataset.go));
}
function renderTop() {
  const cnt = Exam.active ? Exam.qs.length : 0;
  $("#installBtn").style.display = deferredPrompt ? "inline-flex" : "none";
}

/* ---------- 首页 ---------- */
function renderHome() {
  const recs = DB.records;
  const last = recs[recs.length - 1];
  const avg = recs.length ? Math.round(recs.reduce((s, r) => s + r.rate, 0) / recs.length) : null;
  const all = allBank();
  const totalQ = all.length, realN = all.filter(q => q.source === "real").length, mockN = totalQ - realN;
  const wrongN = DB.wrong.length, favN = DB.fav.length;
  const answered = new Set(); recs.forEach(r => (r.detail || []).forEach(d => answered.add(d.qid)));
  const doneN = answered.size;
  const weekAgo = Date.now() - 7 * 864e5;
  const weekRecs = recs.filter(r => r.ts >= weekAgo);
  const weekAvg = weekRecs.length ? Math.round(weekRecs.reduce((s, r) => s + r.rate, 0) / weekRecs.length) : null;

  const recent = recs.slice(-6).reverse().map(r =>
    '<div class="list-row"><div class="lr-main"><div class="lr-title">' + esc(r.title) + '</div><div class="lr-sub">' + fmtTime(r.ts) + " · " + r.score + "/" + r.total + " 分 · 用时 " + fmtClock(r.used) + "</div></div>" +
    '<span class="pill-score" style="color:' + (r.rate >= 60 ? "var(--ok)" : "var(--err)") + '">' + r.rate + '%</span></div>').join("") ||
    '<div class="empty" style="padding:26px"><p>还没有考试记录，去完成第一次模拟考试吧</p></div>';

  $("#view-home").innerHTML =
    '<div class="hero">' +
      '<div class="card card-pad hero-main">' +
        '<h1>网络工程师 · 真题模拟考试系统</h1>' +
        '<p>历年真题与高仿真模拟题分库收录，模拟真实考场环境：限时、答题卡、自动判分、逐题解析。全本地存储，离线可用。</p>' +
        '<div class="hero-actions">' +
          '<button class="btn btn-hero-solid" data-go="exam-cfg">' + I.exam + ' 开始模拟考试</button>' +
          '<button class="btn btn-hero" data-go="bank">' + I.bank + " 浏览题库</button>" +
          (wrongN ? '<button class="btn btn-hero" data-go="wrong">' + I.wrong + " 错题重练</button>" : "") +
        "</div>" +
        '<div class="hero-meta">' +
          '<div class="hm"><b>' + totalQ + "</b><span>收录题目</span></div>" +
          '<div class="hm"><b>' + realN + "</b><span>历年真题</span></div>" +
          '<div class="hm"><b>' + mockN + "</b><span>模拟题</span></div>" +
          '<div class="hm"><b>' + recs.length + "</b><span>模考次数</span></div>" +
        "</div>" +
      "</div>" +
      '<div class="kpi-grid">' +
        kpi("平均分", avg == null ? "—" : avg + "%", "近 7 天" + (weekAvg == null ? "" : " " + weekAvg + "%"), avg != null ? (avg >= 60 ? "var(--ok)" : "var(--err)") : "var(--text)") +
        kpi("已练题目", doneN, "共 " + totalQ + " 题", "var(--brand)") +
        kpi("错题待巩固", wrongN, wrongN ? "去重练 →" : "暂无错题", wrongN ? "var(--warn)" : "var(--text3)") +
        kpi("收藏题目", favN, "重点复习", "var(--warn)") +
      "</div>" +
    "</div>" +
    '<div class="dash-grid">' +
      '<div class="card card-pad"><h2 class="sec-title">最近考试' + '<span class="sec-sub">（正确率趋势详见学习分析）</span></h2>' + recent + "</div>" +
      '<div class="card card-pad"><h2 class="sec-title">快速开始</h2>' +
        '<ul class="quick-tips">' +
          "<li><b>全套真题模考</b>：按年份选择，还原真实考卷（默认 2 分钟/题）。</li>" +
          "<li><b>模拟题模考</b>：跨年份考点全覆盖，检验真实水平。</li>" +
          "<li><b>错题重练</b>：只出你做错的题，直到掌握。</li>" +
          "<li>答题支持键盘 <span class='kbd'>A</span><span class='kbd'>D</span> 选择、<span class='kbd'>←</span><span class='kbd'>→</span> 切换、<span class='kbd'>M</span> 标记。</li>" +
        "</ul>" +
        '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
          '<button class="btn btn-ghost" data-go="stats">' + I.stats + " 查看学习分析</button>" +
          '<button class="btn btn-ghost" data-go="manage">' + I.manage + " 导入更多题目</button>" +
        "</div>" +
      "</div>" +
    "</div>";
  $$("#view-home [data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
}
function kpi(label, num, sub, color) {
  return '<div class="kpi"><div class="k-label">' + label + "</div><div class=\"k-num\" style=\"color:" + color + '">' + num + '</div><div class="k-sub">' + sub + "</div></div>";
}

/* ---------- 组卷配置 ---------- */
const AVAIL_SEMS = (() => {
  const set = new Set(allBank().filter(q => q.source === "real").map(q => yearSemKey(q.year, q.sem)));
  return [...set].sort((a, b) => {
    const ya = parseInt(a), yb = parseInt(b);
    if (ya !== yb) return yb - ya;
    return (a.endsWith("下") ? 1 : 0) - (b.endsWith("下") ? 1 : 0);
  }).map(k => ({ key: k, year: parseInt(k), sem: k.endsWith("下") ? "下" : "上", label: parseInt(k) + (k.endsWith("下") ? "下半年" : "上半年") }));
})();
const Cfg = { source: "real", years: [], points: [], count: 20, minutes: 0, shuffle: DB.settings.shuffleQuestions !== false };
function countCfg() {
  let list = allBank();
  if (Cfg.source === "real") list = list.filter(q => q.source === "real");
  else if (Cfg.source === "mock") list = list.filter(q => q.source === "mock");
  if (Cfg.source === "real" && Cfg.years.length) list = list.filter(q => Cfg.years.includes(yearSemKey(q.year, q.sem)));
  if (Cfg.points.length) list = list.filter(q => Cfg.points.includes(q.point));
  return list;
}
function renderExamCfg() {
  const list = countCfg();
  const yearChips = AVAIL_SEMS.map(ys => '<button class="chip' + (Cfg.years.includes(ys.key) ? " on" : "") + '" data-year="' + ys.key + '">' + ys.label + "（" + allBank().filter(q => q.source === "real" && yearSemKey(q.year, q.sem) === ys.key).length + "题）</button>").join("");
  const pointChips = POINTS.map(p => {
    const n = allBank().filter(q => q.point === p).length;
    return '<button class="chip' + (Cfg.points.includes(p) ? " on" : "") + '" data-point="' + esc(p) + '">' + p + " (" + n + ")</button>";
  }).join("");
  const autoMin = Math.ceil(Cfg.count * 2);

  $("#view-exam-cfg").innerHTML =
    '<h1 class="page-title" style="margin-bottom:16px">模拟考试 · 组卷</h1>' +
    '<div class="card card-pad" style="margin-bottom:14px">' +
      '<div class="field" style="margin-bottom:14px"><label>题库来源</label>' +
        '<div class="seg">' +
          '<button class="' + (Cfg.source === "real" ? "on" : "") + '" data-src="real">历年真题</button>' +
          '<button class="' + (Cfg.source === "mock" ? "on" : "") + '" data-src="mock">模拟题</button>' +
          '<button class="' + (Cfg.source === "mix" ? "on" : "") + '" data-src="mix">混合</button>' +
        "</div>" +
        '<div class="hint">真题：收录历年真实考题（含解析）；模拟：高仿真考点模拟题，难度对齐真题。</div>' +
      "</div>" +
      (Cfg.source === "real" || Cfg.source === "mix" ?
        '<div class="field" style="margin-bottom:14px"><label>年份 / 场次（不选 = 全部）</label><div class="chips" id="yearChips">' + yearChips + "</div></div>" : "") +
      (Cfg.source !== "real" ?
        '<div class="field" style="margin-bottom:14px"><label>知识点（不选 = 全部考点）</label><div class="chips" id="pointChips">' + pointChips + "</div></div>" : "") +
      '<div class="cfg-grid">' +
        '<div class="field"><label>题目数量</label><div class="range-wrap"><input type="range" id="cfgCount" min="5" max="75" step="5" value="' + Cfg.count + '"><output id="cfgCountOut">' + Cfg.count + " 题</output></div></div>" +
        '<div class="field"><label>考试时长</label><div class="range-wrap"><input type="range" id="cfgMin" min="0" max="150" step="5" value="' + Cfg.minutes + '"><output id="cfgMinOut">' + (Cfg.minutes ? Cfg.minutes + " 分钟" : "自动(" + autoMin + " 分钟)") + "</output></div>" +
        '<div class="hint">不设时长则按每题 2 分钟自动分配（接近真实考试节奏）。</div></div>' +
      "</div>" +
    "</div>" +
    '<div class="cfg-summary">' +
      '<div><span class="cs-tip">当前题库匹配：</span><span class="cs-num">' + list.length + "</span> <span class=\"cs-tip\">题</span></div>" +
      '<button class="btn btn-ghost" id="cfgShuffle">' + (Cfg.shuffle ? "打乱顺序：开" : "打乱顺序：关") + "</button>" +
      '<button class="btn btn-pri btn-lg" id="cfgStart"' + (list.length ? "" : " disabled") + ">" + I.exam + " 开始考试</button>" +
    "</div>";

  const bind = () => {
    $$("#view-exam-cfg [data-src]").forEach(b => b.onclick = () => { Cfg.source = b.dataset.src; Cfg.years = []; Cfg.points = []; renderExamCfg(); });
    $$("#yearChips .chip").forEach(b => b.onclick = () => {
      const k = b.dataset.year;
      Cfg.years.includes(k) ? Cfg.years = Cfg.years.filter(x => x !== k) : Cfg.years.push(k);
      renderExamCfg();
    });
    $$("#pointChips .chip").forEach(b => b.onclick = () => {
      const p = b.dataset.point;
      Cfg.points.includes(p) ? Cfg.points = Cfg.points.filter(x => x !== p) : Cfg.points.push(p);
      renderExamCfg();
    });
    const cnt = $("#cfgCount"), cntOut = $("#cfgCountOut"), mn = $("#cfgMin"), mnOut = $("#cfgMinOut");
    cnt.oninput = () => { Cfg.count = +cnt.value; cntOut.textContent = Cfg.count + " 题"; mnOut.textContent = mn.value ? mn.value + " 分钟" : "自动(" + Math.ceil(Cfg.count * 2) + " 分钟)"; };
    mn.oninput = () => { Cfg.minutes = +mn.value; mnOut.textContent = mn.value ? mn.value + " 分钟" : "自动(" + Math.ceil(Cfg.count * 2) + " 分钟)"; };
    $("#cfgShuffle").onclick = () => { Cfg.shuffle = !Cfg.shuffle; renderExamCfg(); };
    $("#cfgStart").onclick = () => {
      const src = countCfg();
      if (!src.length) return toast("当前筛选下没有可用题目", "err");
      const n = Math.min(Cfg.count, src.length);
      let qs = Cfg.shuffle ? pick(src, n) : src.slice(0, n);
      const minutes = Cfg.minutes || Math.ceil(n * 2);
      Exam.start(qs.map(q => q.id), minutes, srcName(), { real: Cfg.source !== "mock", mock: Cfg.source !== "real" });
    };
  };
  bind();
}
function srcName() {
  if (Cfg.source === "real") return "真题模考";
  if (Cfg.source === "mock") return "模拟题模考";
  return "混合模考";
}

/* ---------- 考试引擎 ---------- */
const Exam = {
  active: false, qs: [], answers: {}, flags: {}, cur: 0, seconds: 0, minutes: 0,
  title: "", timerId: null, startTs: 0, sourceFlags: {},
  start(qids, minutes, title, sf) {
    this.active = true; this.qs = qids; this.answers = {}; this.flags = {};
    this.cur = 0; this.minutes = minutes; this.seconds = minutes * 60;
    this.title = title; this.sourceFlags = sf; this.startTs = Date.now();
    this.timerId = setInterval(() => this.tick(), 1000);
    go("exam");
  },
  q() { return BANK_MAP[this.qs[this.cur]]; },
  answeredCount() { return this.qs.filter(id => this.answers[id]).length; },
  flaggedCount() { return this.qs.filter(id => this.flags[id]).length; },
  tick() {
    this.seconds--;
    const el = $("#examTimer"); if (el) { el.textContent = fmtClock(this.seconds); el.classList.toggle("warn", this.seconds <= 300); }
    const et = $("#etTimer"); if (et) et.textContent = fmtClock(this.seconds);
    const p = $("#examProgressBar"); if (p) p.style.width = (this.answeredCount() / this.qs.length * 100) + "%";
    const ep = $("#etProgress"); if (ep) ep.textContent = this.answeredCount() + "/" + this.qs.length;
    if (this.seconds <= 0) { clearInterval(this.timerId); toast("考试时间到，系统已自动交卷", "ok"); this.submit(true); }
  },
  select(key) {
    if (!this.active) return;
    const q = this.q();
    if (this.answers[q.id] === key) { delete this.answers[q.id]; } else { this.answers[q.id] = key; }
    this.renderCurrent();
  },
  toggleFlag() {
    const q = this.q();
    this.flags[q.id] ? delete this.flags[q.id] : this.flags[q.id] = true;
    this.renderCurrent();
  },
  goto(i) { if (i >= 0 && i < this.qs.length) { this.cur = i; this.renderCurrent(); } },
  submit(force) {
    if (!this.active) return;
    const n = this.qs.length, answered = this.answeredCount();
    if (!force && answered < n) {
      modal("确认交卷", "<p>还有 <b style=\"color:var(--warn)\">" + (n - answered) + "</b> 题未作答，确认现在交卷吗？</p>",
        '<button class="btn btn-ghost" data-close>继续答题</button><button class="btn btn-pri" id="modalSubmit">确认交卷</button>');
      $("#modalSubmit").onclick = () => { closeModal(); this.finish(); };
      $$("#modal [data-close]").forEach(b => b.onclick = closeModal);
      return;
    }
    this.finish();
  },
  finish() {
    clearInterval(this.timerId);
    const used = Math.round((Date.now() - this.startTs) / 1000);
    const detail = this.qs.map(id => {
      const q = BANK_MAP[id];
      return { qid: id, ok: this.answers[id] === q.answer };
    });
    const score = detail.filter(d => d.ok).length;
    const rec = {
      id: uid(), ts: Date.now(), title: this.title, total: this.qs.length, score, used,
      rate: Math.round(score / this.qs.length * 100),
      detail, source: this.sourceFlags, answersOf: Object.assign({}, this.answers)
    };
    DB.records.push(rec);
    if (DB.settings.wrongCapture) {
      const wm = wrongMap();
      detail.filter(d => !d.ok).forEach(d => {
        if (wm[d.qid]) { wm[d.qid].cnt++; wm[d.qid].last = Date.now(); }
        else DB.wrong.push({ qid: d.qid, cnt: 1, last: Date.now() });
      });
    }
    DB.save();
    this.active = false; this.qs = [];
    Result.last = rec;
    go("result");
  },
  renderCurrent() { renderExam(); }
};
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; const b = $("#installBtn"); if (b) b.style.display = "inline-flex"; });
$("#installBtn").onclick = async () => {
  if (!deferredPrompt) return toast("当前浏览器不支持安装", "err");
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null; $("#installBtn").style.display = "none";
};

/* ---------- 考试视图 ---------- */
function renderExam() {
  if (!Exam.active) return;
  const q = Exam.q(), i = Exam.cur, n = Exam.qs.length;
  const idx = i + 1;
  const sel = Exam.answers[q.id];
  const flagsOn = Exam.flags[q.id];
  $("#examTimer") && ($("#examTimer").textContent = fmtClock(Exam.seconds));
  $("#etTimer") && ($("#etTimer").textContent = fmtClock(Exam.seconds));
  const options = (q.options || []).map((o, k) => {
    const key = "ABCD"[k];
    const cls = sel === key ? "sel" : "";
    return '<div class="opt ' + cls + '" data-key="' + key + '"><span class="key">' + key + '</span><span class="txt">' + esc(o) + "</span></div>";
  }).join("");
  const srcBadge = q.source === "real" ? '<span class="badge badge-real">真题 · ' + yearSemLabel(q) + "</span>" : '<span class="badge badge-mock">模拟题</span>';
  $("#view-exam").innerHTML =
    '<div class="exam-head">' +
      '<span class="exam-title">' + esc(Exam.title) + "</span>" +
      '<span class="timer" id="examTimer">' + fmtClock(Exam.seconds) + "</span>" +
      '<div class="progress"><i id="examProgressBar" style="width:' + (Exam.answeredCount() / n * 100) + '%"></i></div>' +
      '<span class="muted">' + Exam.answeredCount() + "/" + n + " 已答</span>" +
      '<button class="btn btn-ghost" id="examSheetBtn">答题卡</button>' +
      '<button class="btn btn-pri" id="examSubmitBtn">交卷</button>' +
    "</div>" +
    '<div class="exam-layout">' +
      '<div class="card q-card">' +
        '<div class="q-meta">' + srcBadge +
          '<span class="badge badge-gray">' + esc(q.point || "综合") + "</span>" +
          '<span class="badge badge-gray">难度 ' + DIFF_TXT[q.diff || 3] + "</span>" +
          '<span class="dot"></span><span>第 ' + idx + " / " + n + " 题</span>" +
          (flagsOn ? '<span class="badge badge-warn">' + I.flag + " 已标记</span>" : "") +
        "</div>" +
        '<div class="q-stem"><span class="idx">' + idx + ".</span>" + esc(q.stem) + "</div>" +
        '<div class="options">' + options + "</div>" +
        '<div class="q-foot">' +
          '<div class="btns">' +
            '<button class="btn btn-ghost flag-btn' + (flagsOn ? " on" : "") + '" id="flagBtn">' + I.flag + " " + (flagsOn ? "取消标记" : "标记") + "</button>" +
          "</div>" +
          '<div class="btns">' +
            '<button class="btn btn-ghost" id="prevBtn"' + (i === 0 ? " disabled" : "") + ">上一题</button>" +
            '<button class="btn btn-pri" id="nextBtn"' + (i === n - 1 ? " disabled" : "") + ">" + (i === n - 1 ? "已经是最后一题" : "下一题") + "</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<aside class="sheet">' + sheetHtml(Exam.qs, Exam.cur, Exam.answers, Exam.flags) + "</aside>" +
    "</div>";
  bindExamEvents();
}
function sheetHtml(qs, cur, answers, flags, withSubmit) {
  const cells = qs.map((id, i) => {
    let cls = "sq";
    if (flags[id]) cls += " flagged";
    if (answers[id]) cls += " answered";
    if (i === cur) cls += " cur";
    return '<button class="' + cls + '" data-i="' + i + '">' + (i + 1) + "</button>";
  }).join("");
  return "<h3><span>答题卡</span><span class=\"snum\">" + Object.keys(answers).length + "/" + qs.length + "</span></h3>" +
    '<div class="sheet-grid">' + cells + "</div>" +
    '<div class="sheet-legend"><span><i class="legend-ans"></i>已答</span><span><i class="legend-flag"></i>标记</span><span><i class="legend-cur"></i>当前</span></div>' +
    (withSubmit === false ? "" : '<button class="btn btn-pri btn-block" id="sheetSubmit" style="margin-top:14px">交卷</button>');
}
function bindExamEvents() {
  $$("#view-exam .opt").forEach(o => o.onclick = () => Exam.select(o.dataset.key));
  $("#flagBtn").onclick = () => Exam.toggleFlag();
  $("#prevBtn").onclick = () => Exam.goto(Exam.cur - 1);
  $("#nextBtn").onclick = () => Exam.goto(Exam.cur + 1);
  $$("#view-exam .sq").forEach(s => s.onclick = () => Exam.goto(+s.dataset.i));
  $("#examSubmitBtn").onclick = () => Exam.submit(false);
  $("#sheetSubmit").onclick = () => Exam.submit(false);
  $("#examSheetBtn").onclick = () => {
    if (window.innerWidth <= 1024) { openDrawer(sheetHtml(Exam.qs, Exam.cur, Exam.answers, Exam.flags, false) + '<button class="btn btn-pri btn-block" style="margin-top:12px" id="drawerSubmit">交卷</button>'); bindDrawer(); }
    else toast("答题卡已在右侧显示");
  };
}
function bindDrawer() {
  $$("#drawer .sq").forEach(s => s.onclick = () => { Exam.goto(+s.dataset.i); closeDrawer(); });
  $("#drawerSubmit").onclick = () => { closeDrawer(); Exam.submit(false); };
}
document.addEventListener("keydown", e => {
  if (!Exam.active || !ROUTES.includes(currentRoute) || currentRoute !== "exam") return;
  const tag = (document.activeElement || {}).tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  const k = e.key.toUpperCase();
  if (["A", "B", "C", "D"].includes(k)) { e.preventDefault(); Exam.select(k); }
  else if (e.key === "ArrowRight") { e.preventDefault(); Exam.goto(Exam.cur + 1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); Exam.goto(Exam.cur - 1); }
  else if (k === "M") { e.preventDefault(); Exam.toggleFlag(); }
});
