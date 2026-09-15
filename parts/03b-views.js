/* ================================================================
   网工真题 · 其余视图（结果 / 题库 / 错题 / 分析 / 管理 / 设置）
   ================================================================ */
const Result = { last: null };

/* 解析渲染：纯文本（加粗由 CSS 控制） */
function analysisHtml(q) {
  if (!q.analysis) return "";
  return '<div class="qi-exp"><b>解析：</b>' + esc(q.analysis) + "</div>";
}

/* ---------- 结果页 ---------- */
function renderResult() {
  const r = Result.last;
  if (!r) { $("#view-result").innerHTML = '<div class="empty"><p>没有考试结果</p></div>'; return; }
  const pct = r.rate;
  const C = 2 * Math.PI * 56;
  const off = C * (1 - pct / 100);
  const grade = pct >= 80 ? "优秀" : pct >= 60 ? "合格" : pct >= 40 ? "待加强" : "需努力";
  const gradeColor = pct >= 60 ? "var(--ok)" : "var(--err)";
  const wrongIds = r.detail.filter(d => !d.ok).map(d => d.qid);

  // 用答题明细重建逐题解析（作答快照保存在交卷记录中）
  let items = "";
  if (r.detail && r.detail.length) {
    items = r.detail.map((d, i) => {
      const q = BANK_MAP[d.qid];
      if (!q) return "";
      const opts = (q.options || []).map((o, k) => {
        const key = "ABCD"[k];
        let cls = "reveal";
        if (key === q.answer) cls += " correct keep";
        else if (key === r.answersOf && r.answersOf[d.qid] === key) cls += " wrong keep";
        return '<div class="opt ' + cls + '"><span class="key">' + key + '</span><span class="txt">' + esc(o) + "</span></div>";
      }).join("");
      return '<div class="analysis-item">' +
        '<div class="ai-head"><span class="badge ' + (d.ok ? "badge-ok" : "badge-err") + '">' + (d.ok ? I.check + " 回答正确" : I.x + " 回答错误") + '</span>' +
        '<span class="badge ' + (q.source === "real" ? "badge-real" : "badge-mock") + '">' + (q.source === "real" ? "真题 " + yearSemLabel(q) : "模拟") + '</span>' +
        '<span class="badge badge-gray">' + esc(q.point || "综合") + "</span></div>" +
        '<div class="ai-stem">' + (i + 1) + ". " + esc(q.stem) + "</div>" + opts +
        '<div class="ai-ans">正确答案：<b>' + q.answer + "</b>" +
        (d.ok ? "" : '　你的答案：<span class="my">' + (r.answersOf && r.answersOf[d.qid] ? r.answersOf[d.qid] : "未作答") + "</span>") +
        "</div>" +
        (q.analysis ? '<div class="ai-exp"><b>解析：</b>' + esc(q.analysis) + "</div>" : "") +
        "</div>";
    }).join("");
  }
  $("#view-result").innerHTML =
    '<div class="result-hero">' +
      '<div class="score-ring">' +
        '<svg width="148" height="148" viewBox="0 0 148 148"><circle class="ring-bg" cx="74" cy="74" r="56"/><circle class="ring-fg" cx="74" cy="74" r="56" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
        '<div class="ring-txt"><b style="color:' + gradeColor + '">' + pct + "%</b><span>" + grade + "</span></div>" +
      "</div>" +
      '<h1 class="page-title">' + esc(r.title) + " · 交卷成功</h1>" +
      '<div class="result-cards">' +
        '<div class="rc g"><b>' + r.score + "</b><span>得分 / " + r.total + " 分</span></div>" +
        '<div class="rc r"><b>' + (r.total - r.score) + "</b><span>答错</span></div>" +
        '<div class="rc y"><b>' + fmtClock(r.used) + "</b><span>用时</span></div>" +
        '<div class="rc"><b>' + r.total + "</b><span>总题数</span></div>" +
      "</div>" +
      '<div class="result-actions">' +
        '<button class="btn btn-pri btn-lg" data-go="exam-cfg">' + I.exam + " 再来一场</button>" +
        (wrongIds.length ? '<button class="btn btn-ghost btn-lg" data-go="wrong">' + I.wrong + " 巩固错题</button>" : "") +
        '<button class="btn btn-ghost btn-lg" data-go="home">返回首页</button>' +
      "</div>" +
    "</div>" +
    '<h2 class="sec-title" style="margin:20px 0 12px">逐题解析</h2>' +
    (items || '<div class="empty"><p>无解析内容</p></div>');
  $$("#view-result [data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
}

/* ---------- 题库浏览 ---------- */
const BankUI = { tab: "real", yearSem: "", point: "", kw: "", page: 1, per: 15, exp: null };
function bankFiltered() {
  let list = allBank().filter(q => BankUI.tab === "all" || q.source === BankUI.tab);
  if (BankUI.yearSem) list = list.filter(q => yearSemKey(q.year, q.sem) === BankUI.yearSem);
  if (BankUI.point) list = list.filter(q => q.point === BankUI.point);
  if (BankUI.kw) { const k = BankUI.kw.toLowerCase(); list = list.filter(q => (q.stem + " " + (q.analysis || "")).toLowerCase().includes(k)); }
  return list;
}
function renderBank() {
  const years = AVAIL_SEMS;
  const points = [...new Set(allBank().map(q => q.point))].sort((a, b) => (POINTS.indexOf(a) < 0 ? 999 : POINTS.indexOf(a)) - (POINTS.indexOf(b) < 0 ? 999 : POINTS.indexOf(b)));
  const list = bankFiltered();
  const pages = Math.max(1, Math.ceil(list.length / BankUI.per));
  BankUI.page = Math.min(BankUI.page, pages);
  const slice = list.slice((BankUI.page - 1) * BankUI.per, BankUI.page * BankUI.per);
  const items = slice.map(q => {
    const f = isFav(q.id);
    const exp = BankUI.exp === q.id;
    return '<div class="q-item' + (exp ? " exp" : "") + '" data-id="' + q.id + '">' +
      '<div class="qi-top">' +
        '<span class="badge ' + (q.source === "real" ? "badge-real" : "badge-mock") + '">' + (q.source === "real" ? "真题 · " + yearSemLabel(q) : "模拟题") + "</span>" +
        '<span class="badge badge-gray">' + esc(q.point || "综合") + "</span>" +
        '<span class="badge badge-gray">难度 ' + DIFF_TXT[q.diff || 3] + "</span>" +
        '<span class="muted" style="margin-left:auto">#' + esc(q.id) + "</span>" +
      "</div>" +
      '<div class="qi-stem">' + esc(q.stem) + "</div>" +
      (q.options || []).map((o, k) => '<div class="qi-opt' + ("ABCD"[k] === q.answer ? " qi-opt-ans" : "") + '"><span class="k">' + "ABCD"[k] + ".</span><span>" + esc(o) + "</span></div>").join("") +
      '<div class="qi-actions">' +
        '<button class="btn btn-ghost mini" data-exp="' + q.id + '">' + (exp ? "收起解析" : "查看解析") + "</button>" +
        '<button class="btn btn-ghost mini mini-fav' + (f ? " on" : "") + '" data-fav="' + q.id + '">' + (f ? I.star + " 已收藏" : I.starO + " 收藏") + "</button>" +
      "</div>" +
      '<div class="qi-body">' +
        '<div>正确答案：<span class="qi-ans">' + q.answer + "</span></div>" +
        analysisHtml(q) +
      "</div>" +
    "</div>";
  }).join("");

  $("#view-bank").innerHTML =
    '<h1 class="page-title" style="margin-bottom:14px">题库</h1>' +
    '<div class="bank-tabs">' +
      '<button class="' + (BankUI.tab === "real" ? "on" : "") + '" data-tab="real">历年真题</button>' +
      '<button class="' + (BankUI.tab === "mock" ? "on" : "") + '" data-tab="mock">模拟题</button>' +
      '<button class="' + (BankUI.tab === "all" ? "on" : "") + '" data-tab="all">全部</button>' +
    "</div>" +
    '<div class="bank-toolbar">' +
      '<input type="search" placeholder="搜索题干关键词…" id="bankKw" value="' + esc(BankUI.kw) + '">' +
      '<select id="bankYear">' + '<option value="">全部年份/场次</option>' + years.map(ys => '<option value="' + ys.key + '"' + (BankUI.yearSem === ys.key ? " selected" : "") + ">" + ys.label + "</option>").join("") + "</select>" +
      '<select id="bankPoint">' + '<option value="">全部知识点</option>' + points.map(p => '<option value="' + esc(p) + '"' + (BankUI.point === p ? " selected" : "") + ">" + esc(p) + "</option>").join("") + "</select>" +
      '<span class="muted">' + list.length + " 题</span>" +
    "</div>" +
    (items || '<div class="empty"><p>没有符合条件的题目</p></div>') +
    (pages > 1 ? '<div class="pager"><button class="btn btn-ghost" id="prevPage"' + (BankUI.page <= 1 ? " disabled" : "") + ">上一页</button><span>" + BankUI.page + " / " + pages + '</span><button class="btn btn-ghost" id="nextPage"' + (BankUI.page >= pages ? " disabled" : "") + ">下一页</button></div>" : "");

  const bind = () => {
    $$("#view-bank [data-tab]").forEach(b => b.onclick = () => { BankUI.tab = b.dataset.tab; BankUI.page = 1; renderBank(); });
    let t1 = null;
    $("#bankKw").oninput = () => { clearTimeout(t1); t1 = setTimeout(() => { BankUI.kw = $("#bankKw").value.trim(); BankUI.page = 1; renderBank(); }, 250); };
    $("#bankYear").onchange = () => { BankUI.yearSem = $("#bankYear").value; BankUI.page = 1; renderBank(); };
    $("#bankPoint").onchange = () => { BankUI.point = $("#bankPoint").value; BankUI.page = 1; renderBank(); };
    $$("#view-bank [data-exp]").forEach(b => b.onclick = e => {
      const id = b.dataset.exp; e.stopPropagation();
      BankUI.exp = BankUI.exp === id ? null : id;
      const item = b.closest(".q-item");
      if (item) { item.classList.toggle("exp"); const body = item.querySelector(".qi-body"); if (body) body.style.display = BankUI.exp === id ? "block" : "none"; const btn = item.querySelector('button[data-exp="' + id + '"]'); if (btn) btn.textContent = BankUI.exp === id ? "收起解析" : "查看解析"; }
    });
    $$("#view-bank [data-fav]").forEach(b => b.onclick = () => {
      const id = b.dataset.fav;
      const i = DB.fav.indexOf(id);
      i >= 0 ? DB.fav.splice(i, 1) : DB.fav.push(id);
      DB.save(); renderBank(); toast(i >= 0 ? "已取消收藏" : "已加入收藏", "ok");
    });
    const pp = $("#prevPage"), np = $("#nextPage");
    if (pp) pp.onclick = () => { BankUI.page--; renderBank(); };
    if (np) np.onclick = () => { BankUI.page++; renderBank(); };
  };
  bind();
}

/* ---------- 错题本 ---------- */
function renderWrong() {
  const wm = wrongMap();
  const items = DB.wrong.map(w => {
    const q = BANK_MAP[w.qid];
    if (!q) return "";
    return '<div class="q-item" data-id="' + q.id + '">' +
      '<div class="qi-top"><span class="badge badge-err">答错 ' + w.cnt + " 次</span>" +
      '<span class="badge ' + (q.source === "real" ? "badge-real" : "badge-mock") + '">' + (q.source === "real" ? "真题 · " + yearSemLabel(q) : "模拟题") + '</span>' +
      '<span class="badge badge-gray">' + esc(q.point || "综合") + "</span>" +
      '<span class="muted" style="margin-left:auto">最近 ' + fmtDate(w.last) + "</span></div>" +
      '<div class="qi-stem">' + esc(q.stem) + "</div>" +
      (q.options || []).map((o, k) => '<div class="qi-opt' + ("ABCD"[k] === q.answer ? " qi-opt-ans" : "") + '"><span class="k">' + "ABCD"[k] + ".</span><span>" + esc(o) + "</span></div>").join("") +
      '<div class="qi-actions">' +
        '<button class="btn btn-ghost mini" data-wshow="' + q.id + '">查看解析</button>' +
        '<button class="btn btn-ghost mini mini-fav on" data-wdel="' + q.id + '">' + I.trash + " 移除</button>" +
      "</div>" +
      '<div class="qi-body" style="display:none"><div>正确答案：<span class="qi-ans">' + q.answer + "</span></div>" +
      analysisHtml(q) + "</div>" +
    "</div>";
  }).join("");
  const totalWrong = DB.wrong.length;
  const retryN = DB.wrong.filter(w => w.cnt >= 2).length;
  $("#view-wrong").innerHTML =
    '<h1 class="page-title" style="margin-bottom:14px">错题本</h1>' +
    '<div class="wrong-stat">' +
      '<div class="rc y"><b>' + totalWrong + "</b><span>错题总数</span></div>" +
      '<div class="rc"><b>' + [...new Set(DB.wrong.map(w => BANK_MAP[w.qid] ? BANK_MAP[w.qid].point : ""))].filter(Boolean).length + "</b><span>涉及知识点</span></div>" +
      '<div class="rc"><b>' + DB.wrong.reduce((s, w) => s + w.cnt, 0) + "</b><span>累计答错</span></div>" +
      '<div class="rc r"><b>' + retryN + "</b><span>需重点重练（≥2次）</span></div>" +
    "</div>" +
    '<div class="wrong-actions">' +
      (totalWrong ? '<button class="btn btn-pri" id="wrongRetry">' + I.exam + " 错题重练（" + Math.min(totalWrong, 75) + " 题）</button>" : "") +
      (totalWrong ? '<button class="btn btn-ghost" id="wrongClear">' + I.trash + " 清空错题本</button>" : "") +
      '<a class="btn btn-ghost" href="#/bank">去题库复习</a>' +
    "</div>" +
    (items || '<div class="empty"><p>暂无错题，继续保持</p></div>');
  const retry = $("#wrongRetry");
  if (retry) retry.onclick = () => {
    const ids = DB.wrong.map(w => w.qid);
    const n = Math.min(ids.length, 75);
    Exam.start(pick(ids, n), Math.ceil(n * 2), "错题重练", { real: true, mock: true });
  };
  const clr = $("#wrongClear");
  if (clr) clr.onclick = () => modal("清空错题本", "<p>将删除全部 " + totalWrong + " 条错题记录，此操作不可撤销。</p>",
    '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-danger" id="wrongClearOk">确认清空</button>');
  $("#wrongClearOk") && ($("#wrongClearOk").onclick = () => { DB.wrong = []; DB.save(); closeModal(); renderWrong(); toast("错题本已清空", "ok"); });
  $$("#view-wrong [data-close]").forEach(b => b.onclick = closeModal);
  $$("#view-wrong [data-wshow]").forEach(b => b.onclick = () => {
    const item = b.closest(".q-item"); const body = item.querySelector(".qi-body");
    const show = body.style.display !== "block";
    body.style.display = show ? "block" : "none"; item.classList.toggle("exp", show); b.textContent = show ? "收起解析" : "查看解析";
  });
  $$("#view-wrong [data-wdel]").forEach(b => b.onclick = () => {
    DB.wrong = DB.wrong.filter(w => w.qid !== b.dataset.wdel); DB.save(); renderWrong(); toast("已移除", "ok");
  });
}

/* ---------- 学习分析 ---------- */
function renderStats() {
  const recs = DB.records;
  const detail = recs.flatMap(r => (r.detail || []).map(d => ({ qid: d.qid, ok: d.ok })));
  const byPoint = {};
  detail.forEach(d => { const q = BANK_MAP[d.qid]; if (!q) return; const p = q.point || "综合"; byPoint[p] = byPoint[p] || { n: 0, ok: 0 }; byPoint[p].n++; if (d.ok) byPoint[p].ok++; });
  const pointRows = Object.entries(byPoint).sort((a, b) => (b[1].ok / b[1].n) - (a[1].ok / a[1].n));
  const total = detail.length, okN = detail.filter(d => d.ok).length;
  const overall = total ? Math.round(okN / total * 100) : null;
  const lineSvg = lineChart(recs);

  $("#view-stats").innerHTML =
    '<h1 class="page-title" style="margin-bottom:16px">学习分析</h1>' +
    '<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">' +
      kpi("累计答题", total, "基于全部模考记录", "var(--brand)") +
      kpi("综合正确率", overall == null ? "—" : overall + "%", overall != null ? (overall >= 60 ? "稳中有进" : "需要加把劲") : "暂无数据", overall != null ? (overall >= 60 ? "var(--ok)" : "var(--err)") : "var(--text3)") +
      kpi("模考次数", recs.length, recs.length ? "最近 " + fmtDate(recs[recs.length - 1].ts) : "—", "var(--text)") +
      kpi("薄弱知识点", Object.keys(byPoint).length ? Object.keys(byPoint).length : "—", "建议优先复习", "var(--warn)") +
    "</div>" +
    '<div class="stats-grid">' +
      '<div class="card card-pad"><h2 class="sec-title">模考正确率趋势</h2>' + lineSvg + "</div>" +
      '<div class="card card-pad"><h2 class="sec-title">知识点掌握度</h2>' + pointBars(pointRows) + "</div>" +
    "</div>";
}
function pointBars(rows) {
  if (!rows.length) return '<div class="empty"><p>完成模考后这里会展示各知识点掌握度</p></div>';
  return rows.map(([p, v]) => {
    const pct = Math.round(v.ok / v.n * 100);
    const color = pct >= 80 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--err)";
    return '<div class="point-row"><span class="pn">' + esc(p) + '</span><span class="pbar"><i style="width:' + pct + "%;background:" + color + '"></i></span><span class="pv" style="color:' + color + '">' + pct + '%</span><span class="pvl">' + v.ok + "/" + v.n + "</span></div>";
  }).join("");
}
function lineChart(recs) {
  if (recs.length < 2) return '<div class="empty"><p>完成至少 2 次模考后生成趋势图</p></div>';
  const W = 620, H = 230, L = 46, R = 16, T = 14, B = 34;
  const iw = W - L - R, ih = H - T - B;
  const data = recs.map((r, i) => ({ x: L + iw * (recs.length === 1 ? 0.5 : i / (recs.length - 1)), y: T + ih * (1 - r.rate / 100), r: r.rate, ts: r.ts, title: r.title }));
  const gx = (v) => (L + iw * v);
  let grid = "";
  for (let g = 0; g <= 4; g++) { const v = g * 25; const y = T + ih * (1 - v / 100); grid += '<line x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '" stroke="var(--line)" stroke-dasharray="3 4"/><text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10.5" fill="var(--text3)">' + v + '</text>'; }
  const xLabels = [0, recs.length > 1 ? Math.floor((recs.length - 1) / 2) : 0, recs.length - 1];
  let xl = xLabels.filter((v, i, a) => a.indexOf(v) === i).map(i => '<text x="' + data[i].x + '" y="' + (H - B + 18) + '" text-anchor="middle" font-size="10.5" fill="var(--text3)">' + fmtDate(data[i].ts).slice(5) + "</text>").join("");
  const path = data.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
  const area = path + " L" + (W - R) + " " + (T + ih) + " L" + L + " " + (T + ih) + " Z";
  const dots = data.map(p => '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4" fill="var(--bg2)" stroke="var(--brand)" stroke-width="2"><title>' + esc(p.title) + " " + p.r + "%</title></circle>").join("");
  return '<div class="chart-box"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="模考正确率趋势">' +
    grid + xl +
    '<path d="' + area + '" fill="var(--brand)" opacity=".08"/>' +
    '<path d="' + path + '" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' + dots +
    "</svg><div class=\"chart-legend\"><span><i style=\"background:var(--brand)\"></i>正确率（%）</span><span>共 " + recs.length + " 次模考</span></div></div>";
}

/* ---------- 题库管理 ---------- */
function renderManage() {
  const importedN = EXTRA.length;
  const sample = '[\n  { "id": "custom-01", "source": "mock", "year": 2025, "point": "网络层与路由", "diff": 3,\n    "stem": "题干内容", "options": ["选项A", "选项B", "选项C", "选项D"], "answer": "A", "analysis": "解析" }\n]';
  $("#view-manage").innerHTML =
    '<h1 class="page-title" style="margin-bottom:16px">题库管理</h1>' +
    '<div class="stats-grid">' +
      '<div class="card card-pad">' +
        '<h2 class="sec-title">导入题库' + '<span class="sec-sub">（JSON 文件）</span></h2>' +
        '<div class="drop-zone" id="dropZone">' +
          '<div style="font-size:30px;margin-bottom:6px;color:var(--brand)">' + I.upload + "</div>" +
          "<b>点击选择或拖拽 JSON 文件到此处</b><p>支持导入题目数组，可扩充任意数量真题 / 模拟题</p>" +
        "</div>" +
        '<input type="file" id="fileInput" accept=".json,application/json" style="display:none">' +
        '<div style="margin-top:14px"><h2 class="sec-title" style="font-size:14px">字段说明</h2>' +
        '<div class="code-block">' + esc(sample) + "</div></div>" +
      "</div>" +
      '<div class="card card-pad">' +
        '<h2 class="sec-title">导出</h2>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<button class="btn btn-ghost btn-block" id="expQ">' + I.download + " 导出全部题库（" + allBank().length + " 题）</button>" +
          '<button class="btn btn-ghost btn-block" id="expData">' + I.download + " 导出学习数据（记录/错题/收藏）</button>" +
        "</div>" +
        '<div style="margin-top:18px;padding-top:16px;border-top:1px dashed var(--line)">' +
          '<h2 class="sec-title" style="font-size:14px">数据概况</h2>' +
          '<div class="list-row"><div class="lr-main"><div class="lr-title">内置真题</div></div><span class="pill-score">' + allBank().filter(q => q.source === "real").length + " 题</span></div>" +
          '<div class="list-row"><div class="lr-main"><div class="lr-title">内置模拟题</div></div><span class="pill-score">' + allBank().filter(q => q.source === "mock").length + " 题</span></div>" +
          '<div class="list-row"><div class="lr-main"><div class="lr-title">已导入题目</div></div><span class="pill-score">' + importedN + " 题</span></div>" +
          '<div class="list-row"><div class="lr-main"><div class="lr-title">考试记录 / 错题 / 收藏</div></div><span class="pill-score">' + DB.records.length + " / " + DB.wrong.length + " / " + DB.fav.length + "</span></div>" +
        "</div>" +
      "</div>" +
    "</div>";
  const dz = $("#dropZone"), fi = $("#fileInput");
  dz.onclick = () => fi.click();
  dz.ondragover = e => { e.preventDefault(); dz.classList.add("over"); };
  dz.ondragleave = () => dz.classList.remove("over");
  dz.ondrop = e => { e.preventDefault(); dz.classList.remove("over"); if (e.dataTransfer.files[0]) readImport(e.dataTransfer.files[0]); };
  fi.onchange = () => { if (fi.files[0]) readImport(fi.files[0]); fi.value = ""; };
  $("#expQ").onclick = () => downloadJSON("network-questions.json", allBank());
  $("#expData").onclick = () => downloadJSON("netexam-backup.json", { records: DB.records, wrong: DB.wrong, fav: DB.fav, settings: DB.settings, extra: EXTRA });
}
function readImport(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const raw = JSON.parse(rd.result);
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw.questions) ? raw.questions : null);
      if (!arr) return toast("文件格式不正确：应为题目数组或 {questions:[...]}", "err");
      let ok = 0, skip = 0, bad = 0;
      arr.forEach(it => {
        if (!it || !it.id || !it.stem || !Array.isArray(it.options) || it.options.length < 2 || !it.answer) { bad++; return; }
        if (BANK_MAP[it.id] || EXTRA.some(x => x.id === it.id)) { skip++; return; }
        const q = Object.assign({ source: "mock", year: 0, point: "综合", diff: 3, analysis: "" }, it);
        q.source = q.source === "real" ? "real" : "mock";
        q.answer = String(q.answer).toUpperCase().replace(/[^A-D]/g, "");
        if (!q.answer || q.answer.length > 1) { bad++; return; }
        EXTRA.push(q); ok++;
      });
      DB.extra = EXTRA; Store.set("extra", EXTRA);
      EXTRA.forEach(q => { BANK_MAP[q.id] = q; });
      DB.save();
      toast("导入完成：成功 " + ok + " 题" + (skip ? "，跳过重复 " + skip : "") + (bad ? "，格式错误 " + bad : ""), ok ? "ok" : "err");
      renderManage();
    } catch (e) { toast("解析失败：" + e.message, "err"); }
  };
  rd.onerror = () => toast("文件读取失败", "err");
  rd.readAsText(file, "utf-8");
}
function downloadJSON(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- 设置 ---------- */
function renderSettings() {
  const s = DB.settings;
  $("#view-settings").innerHTML =
    '<h1 class="page-title" style="margin-bottom:16px">设置</h1>' +
    '<div class="card card-pad" style="max-width:640px">' +
      '<div class="set-row"><div class="sr-t"><b>深色模式</b><span>降低夜间刷题亮度</span></div>' +
        '<label class="switch"><input type="checkbox" id="setTheme"' + (s.theme === "dark" ? " checked" : "") + '><i></i></label></div>' +
      '<div class="set-row"><div class="sr-t"><b>考试默认时长</b><span>0 表示按每题 2 分钟自动分配</span></div>' +
        '<input type="number" id="setMin" min="0" max="180" step="5" value="' + s.examMinutes + '" style="width:86px;text-align:center"></div>' +
      '<div class="set-row"><div class="sr-t"><b>错题自动收录</b><span>模考答错的题自动进入错题本</span></div>' +
        '<label class="switch"><input type="checkbox" id="setWrong"' + (s.wrongCapture ? " checked" : "") + '><i></i></label></div>' +
      '<div class="set-row"><div class="sr-t"><b>组卷打乱题目</b><span>模考时随机打乱题目顺序</span></div>' +
        '<label class="switch"><input type="checkbox" id="setShuffleQ"' + (s.shuffleQuestions ? " checked" : "") + '><i></i></label></div>' +
      '<div class="set-row" style="border-bottom:none"><div class="sr-t"><b>重置所有数据</b><span>清除考试记录、错题、收藏与导入题目</span></div>' +
        '<button class="btn btn-danger" id="setReset">重置</button></div>' +
    "</div>";
  $("#setTheme").onchange = e => applyTheme(e.target.checked ? "dark" : "light");
  $("#setMin").onchange = e => { s.examMinutes = Math.max(0, +e.target.value || 0); DB.save(); toast("已保存"); };
  $("#setWrong").onchange = e => { s.wrongCapture = e.target.checked; DB.save(); };
  $("#setShuffleQ").onchange = e => { s.shuffleQuestions = e.target.checked; DB.save(); };
  $("#setReset").onclick = () => {
    modal("重置所有数据", "<p>将清除全部考试记录、错题、收藏、已导入题目与个性化设置，内置题库不受影响。此操作不可撤销。</p>",
      '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-danger" id="resetOk">确认重置</button>');
    $("#resetOk").onclick = () => {
      localStorage.removeItem("netexam.records"); localStorage.removeItem("netexam.wrong"); localStorage.removeItem("netexam.fav"); localStorage.removeItem("netexam.settings"); localStorage.removeItem("netexam.extra"); localStorage.removeItem("netexam.imported");
      location.reload();
    };
    $$("#view-settings [data-close]").forEach(b => b.onclick = closeModal);
  };
}

/* ---------- 移动端工具条绑定 ---------- */
$("#etSheetBtn").onclick = () => { if (Exam.active) openDrawer(sheetHtml(Exam.qs, Exam.cur, Exam.answers, Exam.flags, false) + '<button class="btn btn-pri btn-block" style="margin-top:12px" id="drawerSubmit">交卷</button>'); bindDrawer(); };
$("#etSubmitBtn").onclick = () => { if (Exam.active) Exam.submit(false); };
$("#drawerMask").onclick = closeDrawer;
$("#modalMask").onclick = e => { if (e.target.id === "modalMask") closeModal(); };
$("#themeBtn").onclick = () => applyTheme(DB.settings.theme === "dark" ? "light" : "dark");
$("#settingsBtn").onclick = () => go("settings");
$("#brandLink").onclick = e => { e.preventDefault(); go("home"); };
$("#nav").addEventListener("click", e => { const b = e.target.closest("button[data-go]"); if (b) go(b.dataset.go); });

/* ---------- PWA Service Worker 注册（HTTP 环境下生效） ---------- */
if (location.protocol.startsWith("file")) {
  const m = document.querySelector('link[rel="manifest"]'); if (m) m.remove();
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* ---------- 初始化 ---------- */
window.addEventListener("hashchange", router);
applyTheme(DB.settings.theme);
renderTop();
router();
