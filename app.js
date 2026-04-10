/**
 * BeyWarrior｜陀螺鬥士輔助系統
 * 製作人：OK
 * app.js
 */

// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
const state = {
  parts:        JSON.parse(localStorage.getItem('bey_parts')    || '[]'),
  cxMods:       JSON.parse(localStorage.getItem('bey_cxmods')   || '[]'),
  matches:      JSON.parse(localStorage.getItem('bey_matches')  || '[]'),
  personalLogs: JSON.parse(localStorage.getItem('bey_personal') || '[]'),
};

function save() {
  localStorage.setItem('bey_parts',    JSON.stringify(state.parts));
  localStorage.setItem('bey_cxmods',  JSON.stringify(state.cxMods));
  localStorage.setItem('bey_matches',  JSON.stringify(state.matches));
  localStorage.setItem('bey_personal', JSON.stringify(state.personalLogs));
}

// 預設零件（首次執行才插入）
function seedDefaultParts() {
  if (state.parts.length > 0) return;
  const defaults = [
    // 鳳凰飛翼 BX
    { id: 10001, name:'鳳凰飛翼', cat:'blade', series:'BX', spin:'右旋', note:'BX系列初始戰刃', cxMods:{}, uses:0 },
    // 蒼龍爆刃 UX
    { id: 10002, name:'蒼龍爆刃', cat:'blade', series:'UX', spin:'右旋', note:'UX系列強攻戰刃', cxMods:{}, uses:0 },
  ];
  state.parts.push(...defaults);
  save();
}

// ═══════════════════════════════════════
//  NAV
// ═══════════════════════════════════════
function switchPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
}
function switchInner(group, id, btn) {
  const page = document.getElementById('page-' + group);
  page.querySelectorAll(':scope > .inner-page').forEach(p => p.classList.remove('active'));
  page.querySelectorAll(':scope > .inner-tabs > .inner-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(group + '-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
}
function backToSetup() {
  switchInner('bracket','setup',null);
  const tabs = document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.add('active'); tabs[1].classList.remove('active');
}

// ═══════════════════════════════════════
//  SCOREBOARD
// ═══════════════════════════════════════
let scores     = [0, 0];
let touchTimer = null;
let touchMoved = false;

function addScore(p) {
  scores[p - 1]++;
  updateScoreDisplay();
  flashCard(p);
}
function subScore(p, e) {
  if (e) e.preventDefault();
  if (scores[p - 1] > 0) { scores[p - 1]--; updateScoreDisplay(); }
}
function updateScoreDisplay() {
  document.getElementById('score1').textContent = scores[0];
  document.getElementById('score2').textContent = scores[1];
  const c1 = document.getElementById('card1'), c2 = document.getElementById('card2');
  c1.classList.remove('winning'); c2.classList.remove('winning');
  if (scores[0] > scores[1])      c1.classList.add('winning');
  else if (scores[1] > scores[0]) c2.classList.add('winning');
}
function resetScores() {
  scores = [0, 0]; updateScoreDisplay();
  document.getElementById('card1').classList.remove('winning');
  document.getElementById('card2').classList.remove('winning');
}
function flashCard(p) {
  const card = document.getElementById('card' + p);
  card.style.transition = 'none';
  card.style.transform  = 'scale(1.04)';
  setTimeout(() => { card.style.transition = 'all .25s'; card.style.transform = ''; }, 120);
}
function touchStart(p, e) {
  touchMoved = false;
  touchTimer = setTimeout(() => { if (!touchMoved) subScore(p, null); touchTimer = null; }, 550);
}
function touchMove() { touchMoved = true; if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } }
function touchEnd()  { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } }

function declareWinner() {
  const p1 = document.getElementById('p1name').value || '選手 A';
  const p2 = document.getElementById('p2name').value || '選手 B';
  document.getElementById('victoryName').textContent  = scores[0] >= scores[1] ? p1 : p2;
  document.getElementById('victoryScore').textContent = `${scores[0]} : ${scores[1]}`;
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}
function closeVictory() {
  document.getElementById('victoryOverlay').classList.remove('show');
  document.getElementById('confettiWrap').innerHTML = '';
}
function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  const colors = ['#c9a84c','#e8c97a','#8c6e2a','#fff8e0','#f5dfa0','#f0d080'];
  const style  = document.createElement('style');
  style.textContent =
    '@keyframes f0{to{transform:translateY(105vh) rotate(360deg);opacity:0}}' +
    '@keyframes f1{to{transform:translateY(105vh) rotate(-360deg) translateX(60px);opacity:0}}' +
    '@keyframes f2{to{transform:translateY(105vh) rotate(180deg) translateX(-60px);opacity:0}}';
  wrap.appendChild(style);
  for (let i = 0; i < 80; i++) {
    const c = document.createElement('div');
    const s = 6 + Math.random() * 8;
    c.style.cssText =
      `position:absolute;width:${s}px;height:${s}px;` +
      `background:${colors[Math.floor(Math.random()*colors.length)]};` +
      `left:${Math.random()*100}vw;top:-20px;` +
      `border-radius:${Math.random()>.5?'50%':'2px'};` +
      `animation:f${Math.floor(Math.random()*3)} ${1.5+Math.random()*2}s ${Math.random()*.5}s linear forwards;` +
      `opacity:${.7+Math.random()*.3}`;
    wrap.appendChild(c);
  }
}

function showFinalRanking() {
  const r = bracketState.ranking;
  document.getElementById('victoryName').textContent  = r.first || '—';
  document.getElementById('victoryScore').textContent = `🥈 ${r.second||'—'}  🥉 ${r.third||'—'}  4️⃣ ${r.fourth||'—'}`;
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}

// ── 渲染整個賽表 ──
function renderBracketView() {
  if (!bracketState) return;
  const container = document.getElementById('bracketScroll');
  container.innerHTML = '';

  const { rounds, semiFinals, grandFinal, thirdPlace, ranking } = bracketState;
  const maxRounds = Math.max(
    rounds.filter(r=>r.left.length>0).length,
    rounds.filter(r=>r.right.length>0).length
  );

  // 計算單側最大輪數
  const leftRounds  = rounds.filter(r=>r.left.length>0).length;
  const rightRounds = rounds.filter(r=>r.right.length>0).length;

  // ── 建立雙向賽表容器 ──
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;align-items:flex-start;gap:0;position:relative;';

  // 左半區（由左到右排列，最後一輪靠近中心）
  const leftHalf = buildHalf('left', rounds, leftRounds);
  // 中間決賽
  const center   = buildCenter(grandFinal, thirdPlace, semiFinals, ranking);
  // 右半區（由右到左排列，最後一輪靠近中心）
  const rightHalf = buildHalf('right', rounds, rightRounds, true);

  wrapper.appendChild(leftHalf);
  wrapper.appendChild(center);
  wrapper.appendChild(rightHalf);
  container.appendChild(wrapper);

  // 決賽區域（上方摘要）
  renderFinalsArea(grandFinal, thirdPlace, ranking);
}

/**
 * 建立一側的賽表 HTML
 * @param {'left'|'right'} side
 * @param {Array} rounds
 * @param {number} totalRounds
 * @param {boolean} reverse 右側反向
 */
function buildHalf(side, rounds, totalRounds, reverse=false) {
  const half = document.createElement('div');
  half.style.cssText = `display:flex;flex-direction:${reverse?'row-reverse':'row'};align-items:flex-start;`;

  const sideRounds = rounds.map(r => r[side]).filter(r=>r&&r.length>0);

  sideRounds.forEach((roundMatches, ri) => {
    const isLastRound = (ri === sideRounds.length - 1);
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;';

    // 輪次標題
    const label = document.createElement('div');
    label.className = 'b-round-label';
    label.style.cssText = `width:${CSS_W}px;font-size:.66rem;`;
    const n = bracketState[side==='left'?'leftPlayers':'rightPlayers'].length;
    label.textContent = getRoundName(ri, n, isLastRound);
    col.appendChild(label);

    // 計算這輪的 gap（越後面輪次間距越大，形成階梯感）
    const spacer = getVerticalSpacer(ri, sideRounds.length);

    // 比賽槽
    const matchesWrap = document.createElement('div');
    matchesWrap.style.cssText = `display:flex;flex-direction:column;padding:${spacer}px 0;gap:${spacer*2}px;`;

    roundMatches.forEach((match, mi) => {
      const matchEl = buildMatchSlot(match, side, ri, mi);
      matchesWrap.appendChild(matchEl);
    });

    col.appendChild(matchesWrap);

    // 連接線（SVG）
    if (!isLastRound) {
      appendConnectorLines(col, roundMatches, sideRounds[ri+1]||[], spacer, side, reverse);
    }

    half.appendChild(col);
  });

  return half;
}

const CSS_W = 150;   // 槽寬
const CSS_H = 38;    // 槽高
const CSS_VS = 6;    // vs 間隔
const CSS_GAP_H = 50; // 水平輪次間距

function getVerticalSpacer(roundIdx, totalRounds) {
  // 越靠近決賽間距越大
  return 8 + roundIdx * 18;
}

/**
 * 建立單場比賽的 DOM（兩個槽 + VS 分隔）
 */
function buildMatchSlot(match, side, roundIdx, matchIdx) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;position:relative;';

  const makeSlot = (player, key) => {
    const el = document.createElement('div');
    el.className = 'b-slot';
    el.style.cssText = `width:${CSS_W}px;height:${CSS_H}px;`;

    if (!player) {
      el.classList.add('empty');
      el.innerHTML = `<span class="name" style="color:var(--text2);font-style:italic;">待定</span>`;
      return el;
    }

    const isBye    = match.bye && key === 'p1';
    const isWinner = match.winner === player;
    const isLoser  = match.winner && match.winner !== player && !match.bye;
    const canClick = !match.winner && !match.bye && player;

    if (isBye)    el.classList.add('bye');
    if (isWinner) el.classList.add('winner');
    if (isLoser)  el.classList.add('loser');
    if (canClick) el.classList.add('clickable');

    el.innerHTML = `
      <span class="name">${player}</span>
      ${isBye ? '<span class="badge-bye">輪空晉級</span>' : ''}
    `;

    if (canClick) {
      el.onclick = () => pickBracketWinner(side, roundIdx, matchIdx, key);
    }
    return el;
  };

  const slot1 = makeSlot(match.p1, 'p1');
  const vs    = document.createElement('div');
  vs.className = 'b-vs';
  vs.innerHTML = '<div class="b-vs-line"></div>';
  const slot2 = match.p2 !== null ? makeSlot(match.p2, 'p2') :
    (() => {
      const el = document.createElement('div');
      el.className = 'b-slot bye';
      el.style.cssText = `width:${CSS_W}px;height:${CSS_H}px;`;
      return el;
    })();

  wrap.appendChild(slot1);
  wrap.appendChild(vs);
  wrap.appendChild(slot2);
  return wrap;
}

/**
 * SVG 連接線（當前輪 → 下一輪）
 */
function appendConnectorLines(col, currentMatches, nextMatches, spacer, side, reverse) {
  // 連接線用 CSS border 模擬（避免 SVG 複雜定位）
  // 每場比賽右側（左半）或左側（右半）畫出連線到下一輪
  // 這裡用相對定位的偽元素方式，留給瀏覽器自然渲染
  // 實際完整 SVG 連線可以在 renderBracketView 後用 JS 計算位置
  // 此處先用視覺間距呈現階梯，後續可強化
}

/**
 * 建立中間決賽區
 */
function buildCenter(grandFinal, thirdPlace, semiFinals, ranking) {
  const center = document.createElement('div');
  center.style.cssText = `
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:0 24px;min-width:160px;gap:10px;
  `;

  // 冠軍賽
  const gfTitle = document.createElement('div');
  gfTitle.className = 'center-title';
  gfTitle.innerHTML = '🏆 冠軍賽';
  center.appendChild(gfTitle);

  if (grandFinal && grandFinal.p1) {
    const s1 = makeCenterSlot(grandFinal.p1, grandFinal.winner===grandFinal.p1, !grandFinal.winner, () => pickFinalWinner('grandFinal','p1'));
    const vs = document.createElement('div'); vs.className='center-vs'; vs.textContent='VS';
    const s2 = makeCenterSlot(grandFinal.p2, grandFinal.winner===grandFinal.p2, !grandFinal.winner, () => pickFinalWinner('grandFinal','p2'));
    center.appendChild(s1); center.appendChild(vs); center.appendChild(s2);
  } else {
    ['待左半冠軍','待右半冠軍'].forEach(t=>{
      const s=document.createElement('div'); s.className='center-slot'; s.style.opacity='.5'; s.textContent=t; center.appendChild(s);
    });
  }

  center.appendChild(document.createElement('div')).style.height='16px';

  // 季軍賽
  const tpTitle = document.createElement('div');
  tpTitle.className = 'center-title';
  tpTitle.style.fontSize = '.8rem';
  tpTitle.innerHTML = '🥉 季軍賽';
  center.appendChild(tpTitle);

  if (thirdPlace && thirdPlace.p1) {
    const s1 = makeCenterSlot(thirdPlace.p1, thirdPlace.winner===thirdPlace.p1, !thirdPlace.winner, () => pickFinalWinner('thirdPlace','p1'));
    const vs = document.createElement('div'); vs.className='center-vs'; vs.textContent='VS';
    const s2 = makeCenterSlot(thirdPlace.p2, thirdPlace.winner===thirdPlace.p2, !thirdPlace.winner, () => pickFinalWinner('thirdPlace','p2'));
    center.appendChild(s1); center.appendChild(vs); center.appendChild(s2);
  } else {
    const p=document.createElement('div'); p.className='center-slot'; p.style.opacity='.5'; p.style.fontSize='.76rem'; p.textContent='待半決賽結束';
    center.appendChild(p);
  }

  // 排名
  if (ranking.first) {
    const rankWrap = document.createElement('div');
    rankWrap.style.cssText='margin-top:12px;width:100%;';
    const medals = [['🥇','first'],['🥈','second'],['🥉','third'],['4️⃣','fourth']];
    medals.forEach(([medal,key])=>{
      if(!ranking[key]) return;
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:.82rem;font-weight:700;color:var(--gold-dk);';
      row.innerHTML=`<span>${medal}</span><span>${ranking[key]}</span>`;
      rankWrap.appendChild(row);
    });
    center.appendChild(rankWrap);
  }

  return center;
}

function makeCenterSlot(name, isWinner, clickable, onClick) {
  const el = document.createElement('div');
  el.className = 'center-slot' + (isWinner?' winner':'');
  el.style.cssText = `cursor:${clickable?'pointer':'default'};transition:all .2s;`;
  if(isWinner) el.style.background='rgba(201,168,76,0.25)';
  el.textContent = name || '—';
  if(clickable && name) el.onclick = onClick;
  return el;
}

function renderFinalsArea(grandFinal, thirdPlace, ranking) {
  const area = document.getElementById('finalsArea');
  // 只有決賽啟動時才顯示
  if (!grandFinal || !grandFinal.p1) { area.style.display='none'; return; }
  area.style.display='block';

  const medals = [
    { medal:'🥇', key:'first',  label:'冠軍' },
    { medal:'🥈', key:'second', label:'亞軍' },
    { medal:'🥉', key:'third',  label:'季軍' },
    { medal:'4️⃣', key:'fourth', label:'殿軍' },
  ];
  const allDone = medals.every(m=>ranking[m.key]);
  if (!allDone) { area.style.display='none'; return; }

  area.innerHTML = `
    <div class="finals-title">🎖️ 最終排名</div>
    <div class="ranking-display">
      ${medals.map(m=>`
        <div class="rank-card">
          <div class="rank-medal">${m.medal}</div>
          <div style="font-size:.7rem;color:var(--text2);">${m.label}</div>
          <div class="rank-name">${ranking[m.key]||'—'}</div>
        </div>`).join('')}
    </div>`;
}

function getRoundName(ri, totalPlayers, isLast) {
  if (isLast && totalPlayers <= 4) return '準決賽';
  const remaining = Math.ceil(totalPlayers / Math.pow(2, ri));
  if (remaining <= 2) return '準決賽';
  return `第 ${ri+1} 輪 (${remaining}→${Math.ceil(remaining/2)})`;
}

// ═══════════════════════════════════════
//  PARTS DB ── 零件資料庫
//  主類型：blade / ratchet / bit
//  鋼鐵戰刃有 series：BX / UX / CX
//  CX 另有 cxMods：{ emblem, mainBlade, subBlade, overBlade }（存 cxMod id）
// ═══════════════════════════════════════

// CX 改造零件類型標籤
const CX_MOD_LABELS = {
  emblem:    '聖獸紋章',
  mainBlade: '主要戰刃',
  subBlade:  '輔助戰刃',
  overBlade: '超越戰刃',
};

const CAT_LABELS = { blade:'鋼鐵戰刃', ratchet:'固鎖輪盤', bit:'軸心' };

// 目前新增表單的選擇狀態
let addForm = { cat:'blade', series:'BX' };

function initAddForm() {
  addForm = { cat:'blade', series:'BX' };
  updateAddFormUI();
  refreshCxSelects();
}

function selectCat(cat, btn) {
  addForm.cat = cat;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateAddFormUI();
}

function selectSeries(series, btn) {
  addForm.series = series;
  document.querySelectorAll('.series-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateAddFormUI();
}

function updateAddFormUI() {
  const isBlade = addForm.cat === 'blade';
  const isCX    = addForm.series === 'CX';

  // 系列選擇只有鋼鐵戰刃才顯示
  document.getElementById('seriesGroup').style.display = isBlade ? '' : 'none';
  // CX 改造選單
  document.getElementById('cxModGroup').style.display  = (isBlade && isCX) ? '' : 'none';
  // 名稱 label
  document.getElementById('nameLabel').textContent =
    isBlade ? (isCX ? '④ 鋼鐵戰刃名稱（母體）' : '③ 鋼鐵戰刃名稱') :
    (addForm.cat==='ratchet' ? '② 固鎖輪盤名稱' : '② 軸心名稱');
  // 旋轉方向只有戰刃才顯示
  document.getElementById('spinGroup').style.display = isBlade ? '' : 'none';
}

/** 開啟 CX 改造管理 modal */
function openAddCxMod() {
  renderCxModList();
  document.getElementById('cxModModal').classList.add('show');
}

/** 新增 CX 改造零件 */
function addCxMod() {
  const type = document.getElementById('cxModType').value;
  const name = document.getElementById('cxModName').value.trim();
  const note = document.getElementById('cxModNote').value.trim();
  if (!name) { showToast('請輸入改造零件名稱','error'); return; }
  state.cxMods.push({ id:Date.now(), type, name, note, uses:0 });
  save();
  document.getElementById('cxModName').value='';
  document.getElementById('cxModNote').value='';
  renderCxModList();
  showToast(`✅ ${CX_MOD_LABELS[type]}「${name}」已新增！`,'success');
}

function renderCxModList() {
  const el = document.getElementById('cxModList');
  if (!el) return;
  if (!state.cxMods.length) { el.innerHTML='<div style="color:var(--text2);font-size:.82rem;">尚無改造零件</div>'; return; }
  el.innerHTML = state.cxMods.map(m=>`
    <div class="cx-mod-list-item">
      <div>
        <span class="cx-type-tag">${CX_MOD_LABELS[m.type]||m.type}</span>
        <span style="margin-left:8px;font-weight:700;">${m.name}</span>
        ${m.note?`<span style="color:var(--text2);font-size:.75rem;margin-left:6px;">${m.note}</span>`:''}
      </div>
      <button class="btn-icon" onclick="deleteCxMod(${m.id})">🗑</button>
    </div>`).join('');
}

function deleteCxMod(id) {
  state.cxMods = state.cxMods.filter(m=>m.id!==id);
  save(); renderCxModList(); refreshCxSelects();
}

/** 更新 CX 改造選單的 option */
function refreshCxSelects() {
  ['cxEmblem','cxMainBlade','cxSubBlade','cxOverBlade'].forEach((selectId, idx) => {
    const typeKey = ['emblem','mainBlade','subBlade','overBlade'][idx];
    const el = document.getElementById(selectId); if(!el) return;
    const current = el.value;
    const mods = state.cxMods.filter(m=>m.type===typeKey);
    el.innerHTML = `<option value="">— 未使用 —</option>` +
      mods.map(m=>`<option value="${m.id}"${m.id==current?' selected':''}>${m.name}</option>`).join('');
  });
}

/** 新增零件 */
function addPart() {
  const name = document.getElementById('newPartName').value.trim();
  if (!name) { showToast('請輸入零件名稱','error'); return; }

  const part = {
    id:     Date.now(),
    name,
    cat:    addForm.cat,   // blade / ratchet / bit
    series: addForm.cat==='blade' ? addForm.series : null,  // 只有 blade 才有系列
    spin:   addForm.cat==='blade' ? document.getElementById('newPartSpin').value : null,
    note:   document.getElementById('newPartNote').value,
    cxMods: {},
    uses:   0,
  };

  // CX 改造配件
  if (addForm.cat==='blade' && addForm.series==='CX') {
    part.cxMods = {
      emblem:    document.getElementById('cxEmblem').value    || null,
      mainBlade: document.getElementById('cxMainBlade').value || null,
      subBlade:  document.getElementById('cxSubBlade').value  || null,
      overBlade: document.getElementById('cxOverBlade').value || null,
    };
  }

  state.parts.push(part);
  save();
  showToast(`✅ ${CAT_LABELS[addForm.cat]}「${name}」已新增！`,'success');
  document.getElementById('newPartName').value='';
  document.getElementById('newPartNote').value='';
  refreshCxSelects();
  renderParts();
}

/** 渲染零件列表 */
function renderParts() {
  const search  = (document.getElementById('partSearch')?.value||'').toLowerCase();
  const catF    = document.getElementById('partCatFilter')?.value||'';
  const seriesF = document.getElementById('partSeriesFilter')?.value||'';

  const filtered = state.parts.filter(p=>
    (!search  || p.name.toLowerCase().includes(search)) &&
    (!catF    || p.cat===catF) &&
    (!seriesF || p.series===seriesF)
  );

  const grid = document.getElementById('partsGrid'); if(!grid) return;
  if(!filtered.length) {
    grid.innerHTML='<div class="empty-state"><div class="empty-icon">📦</div><div>尚無零件</div></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => {
    // CX 改造資訊
    let cxInfo = '';
    if (p.cat==='blade' && p.series==='CX' && p.cxMods) {
      const mods = Object.entries(p.cxMods)
        .filter(([,v])=>v)
        .map(([k,id])=>{ const m=state.cxMods.find(m=>m.id==id); return m?`<span>${CX_MOD_LABELS[k]}：${m.name}</span>`:''; })
        .filter(Boolean);
      if(mods.length) cxInfo=`<div style="font-size:.72rem;color:var(--text2);margin-top:4px;">${mods.join(' / ')}</div>`;
    }
    return `<div class="part-card" onclick="showPart(${p.id})">
      <div class="part-card-top">
        <div class="part-name">${p.name}</div>
        <div class="part-uses">×${p.uses||0}</div>
      </div>
      <div class="part-tags">
        <span class="badge badge-${p.cat}">${CAT_LABELS[p.cat]||p.cat}</span>
        ${p.series?`<span class="badge badge-${p.series.toLowerCase()}">${p.series}</span>`:''}
        ${p.spin?`<span class="badge" style="background:rgba(120,110,90,0.1);color:var(--text2);border:1px solid var(--border);">${p.spin}</span>`:''}
      </div>
      ${cxInfo}
      ${p.note?`<div style="font-size:.72rem;color:var(--text2);margin-top:4px;">${p.note}</div>`:''}
    </div>`;
  }).join('');
}

let currentPartId = null;
function showPart(id) {
  currentPartId = id;
  const p = state.parts.find(p=>p.id===id); if(!p) return;
  document.getElementById('partModalTitle').textContent = p.name;

  let cxSection = '';
  if (p.cat==='blade' && p.series==='CX' && p.cxMods) {
    const rows = Object.entries(p.cxMods).map(([k,id])=>{
      if(!id) return `<div class="part-detail-item"><div class="form-label">${CX_MOD_LABELS[k]}</div><div style="color:var(--text2);">未使用</div></div>`;
      const m=state.cxMods.find(m=>m.id==id);
      return `<div class="part-detail-item"><div class="form-label">${CX_MOD_LABELS[k]}</div><div>${m?m.name:'—'}</div></div>`;
    });
    cxSection=`<div style="margin-top:12px;font-size:.76rem;font-weight:700;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">CX 改造配件</div>
      <div class="part-detail-grid">${rows.join('')}</div>`;
  }

  document.getElementById('partModalContent').innerHTML=`
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
      <span class="badge badge-${p.cat}">${CAT_LABELS[p.cat]||p.cat}</span>
      ${p.series?`<span class="badge badge-${p.series.toLowerCase()}">${p.series}</span>`:''}
      ${p.spin?`<span class="badge" style="background:rgba(120,110,90,0.1);color:var(--text2);border:1px solid var(--border);">${p.spin}</span>`:''}
    </div>
    <div class="part-detail-grid">
      <div class="part-detail-item"><div class="form-label">使用次數</div>
        <div style="font-family:Rajdhani;font-size:1.5rem;font-weight:700;color:var(--gold-dk);">${p.uses||0}</div>
      </div>
      ${p.note?`<div class="part-detail-item"><div class="form-label">備注</div><div style="font-size:.85rem;">${p.note}</div></div>`:''}
    </div>
    ${cxSection}`;
  document.getElementById('partModal').classList.add('show');
}
function deletePart() {
  state.parts=state.parts.filter(p=>p.id!==currentPartId);
  save(); renderParts(); closeModal('partModal'); showToast('零件已刪除','error');
}

function renderPartStats() {
  const blades  = state.parts.filter(p=>p.cat==='blade').length;
  const ratchets= state.parts.filter(p=>p.cat==='ratchet').length;
  const bits    = state.parts.filter(p=>p.cat==='bit').length;
  const cxmods  = state.cxMods.length;
  const tu      = state.parts.reduce((a,p)=>a+(p.uses||0),0);
  document.getElementById('partStatsCards').innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${state.parts.length}</div><div class="stat-card-label">零件總數</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${blades}</div><div class="stat-card-label">鋼鐵戰刃</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--blue);">${ratchets}</div><div class="stat-card-label">固鎖輪盤</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${bits}</div><div class="stat-card-label">軸心</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--accent);">${cxmods}</div><div class="stat-card-label">CX改造零件</div></div>
    <div class="stat-card"><div class="stat-card-val">${tu}</div><div class="stat-card-label">總使用次數</div></div>`;

  const tc={blade:blades,ratchet:ratchets,bit:bits};
  const maxT=Math.max(1,...Object.values(tc));
  document.getElementById('partTypeChart').innerHTML=Object.entries(tc).map(([k,v])=>`
    <div class="bar-row"><div class="bar-label">${CAT_LABELS[k]}</div><div class="bar-track"><div class="bar-fill" style="width:${v/maxT*100}%"></div></div><div class="bar-val">${v}</div></div>`).join('');

  const sorted=[...state.parts].sort((a,b)=>(b.uses||0)-(a.uses||0)).slice(0,10);
  const maxU=Math.max(1,sorted[0]?.uses||0);
  document.getElementById('partUsageChart').innerHTML=sorted.length?sorted.map(p=>`
    <div class="bar-row"><div class="bar-label">${p.name}</div><div class="bar-track"><div class="bar-fill" style="width:${(p.uses||0)/maxU*100}%"></div></div><div class="bar-val">${p.uses||0}</div></div>`).join(''):'<div style="color:var(--text2);">暫無數據</div>';
}

// ═══════════════════════════════════════
//  SAVE MATCH
// ═══════════════════════════════════════
let matchConfigs = { p1:{}, p2:{} };

function saveMatch() {
  const p1n = document.getElementById('p1name').value||'選手 A';
  const p2n = document.getElementById('p2name').value||'選手 B';
  document.getElementById('saveP1Label').textContent = p1n;
  document.getElementById('saveP2Label').textContent = p2n;
  matchConfigs = { p1:{}, p2:{} };
  buildMatchConfigUI('p1'); buildMatchConfigUI('p2');
  document.getElementById('saveMatchModal').classList.add('show');
}

function buildMatchConfigUI(player) {
  const el  = document.getElementById(player==='p1'?'configBuilderP1':'configBuilderP2');
  const cfg = matchConfigs[player];
  let html = '';

  // 鋼鐵戰刃選擇
  const blades = state.parts.filter(p=>p.cat==='blade');
  html += `<div class="config-step"><div class="config-step-label">鋼鐵戰刃</div>
    <select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="setMatchPart('${player}','blade',this.value)">
      <option value="">— 未使用 —</option>
      ${blades.map(p=>`<option value="${p.id}">${p.name} (${p.series||'—'})</option>`).join('')}
    </select></div>`;

  // 固鎖輪盤
  const ratchets = state.parts.filter(p=>p.cat==='ratchet');
  html += `<div class="config-step"><div class="config-step-label">固鎖輪盤</div>
    <select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="setMatchPart('${player}','ratchet',this.value)">
      <option value="">— 未使用 —</option>
      ${ratchets.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
    </select></div>`;

  // 軸心
  const bits = state.parts.filter(p=>p.cat==='bit');
  html += `<div class="config-step"><div class="config-step-label">軸心</div>
    <select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="setMatchPart('${player}','bit',this.value)">
      <option value="">— 未使用 —</option>
      ${bits.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
    </select></div>`;

  el.innerHTML = html;
}

function setMatchPart(player, cat, val) { matchConfigs[player][cat] = val; }

function confirmSaveMatch() {
  const p1n    = document.getElementById('p1name').value||'選手 A';
  const p2n    = document.getElementById('p2name').value||'選手 B';
  const winner = scores[0]>=scores[1] ? p1n : p2n;
  const collectIds = cfg => Object.values(cfg).filter(Boolean);

  state.matches.unshift({
    id:Date.now(), date:new Date().toLocaleString('zh-TW'),
    p1:p1n, p2:p2n, s1:scores[0], s2:scores[1], winner,
    p1Config:{...matchConfigs.p1}, p2Config:{...matchConfigs.p2},
    p1Parts:collectIds(matchConfigs.p1), p2Parts:collectIds(matchConfigs.p2),
  });
  // 更新使用次數
  [...collectIds(matchConfigs.p1),...collectIds(matchConfigs.p2)].forEach(pid=>{
    const p=state.parts.find(p=>p.id==pid); if(p) p.uses=(p.uses||0)+1;
  });
  save(); closeModal('saveMatchModal'); showToast('✅ 比賽記錄已儲存！','success');
}

// ═══════════════════════════════════════
//  PERSONAL LOG
// ═══════════════════════════════════════
let editingPersonalId=null, pLogConfig={};

function openPersonalForm(id) {
  editingPersonalId=id;
  const entry=id?state.personalLogs.find(l=>l.id===id):null;
  document.getElementById('personalFormTitle').textContent=id?'✏️ 編輯記錄':'➕ 新增個人記錄';
  document.getElementById('pLogDate').value=entry?.date||new Date().toISOString().slice(0,10);
  document.getElementById('pLogOpponent').value=entry?.opponent||'';
  document.getElementById('pLogMyScore').value=entry?.myScore??0;
  document.getElementById('pLogOppScore').value=entry?.oppScore??0;
  document.getElementById('pLogResult').value=entry?.result||'win';
  document.getElementById('pLogNote').value=entry?.note||'';
  pLogConfig = entry?.config ? {...entry.config} : {};
  renderPLogConfig();
  document.getElementById('personalFormModal').classList.add('show');
}

function renderPLogConfig() {
  const el=document.getElementById('pLogConfigArea');
  const makeSel=(cat,label)=>{
    const parts=state.parts.filter(p=>p.cat===cat);
    if(!parts.length) return `<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚無零件</div></div>`;
    return `<div class="config-step"><div class="config-step-label">${label}</div>
      <select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="pLogConfig['${cat}']=this.value">
        <option value="">— 未使用 —</option>
        ${parts.map(p=>`<option value="${p.id}"${pLogConfig[cat]==p.id?' selected':''}>${p.name}${p.series?' ('+p.series+')':''}</option>`).join('')}
      </select></div>`;
  };
  el.innerHTML=makeSel('blade','鋼鐵戰刃')+makeSel('ratchet','固鎖輪盤')+makeSel('bit','軸心');
}

function savePersonalLog() {
  const entry={
    id:editingPersonalId||Date.now(),
    date:document.getElementById('pLogDate').value,
    opponent:document.getElementById('pLogOpponent').value.trim()||'未知對手',
    myScore:parseInt(document.getElementById('pLogMyScore').value)||0,
    oppScore:parseInt(document.getElementById('pLogOppScore').value)||0,
    result:document.getElementById('pLogResult').value,
    note:document.getElementById('pLogNote').value.trim(),
    config:{...pLogConfig},
  };
  if(editingPersonalId){const i=state.personalLogs.findIndex(l=>l.id===editingPersonalId);if(i!==-1)state.personalLogs[i]=entry;}
  else state.personalLogs.unshift(entry);
  save(); closeModal('personalFormModal'); renderPersonalLog(); showToast('✅ 記錄已儲存！','success');
}
function deletePersonalLog(id) {
  if(!confirm('確定刪除？')) return;
  state.personalLogs=state.personalLogs.filter(l=>l.id!==id);
  save(); renderPersonalLog(); showToast('記錄已刪除','error');
}
function renderPersonalLog() {
  const filter=document.getElementById('pLogFilter')?.value||'';
  const logs=state.personalLogs.filter(l=>!filter||l.result===filter);
  const total=state.personalLogs.length;
  const wins=state.personalLogs.filter(l=>l.result==='win').length;
  const loses=state.personalLogs.filter(l=>l.result==='lose').length;
  const wr=total?Math.round(wins/total*100):0;
  const se=document.getElementById('personalStats');
  if(se) se.innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${total}</div><div class="stat-card-label">總場次</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${wins}</div><div class="stat-card-label">勝場</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--accent);">${loses}</div><div class="stat-card-label">敗場</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:${wr>=60?'var(--green)':wr>=40?'var(--gold-dk)':'var(--accent)'};">${wr}%</div><div class="stat-card-label">勝率</div></div>`;
  const el=document.getElementById('personalLog'); if(!el) return;
  if(!logs.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">📒</div><div>${total?'無符合記錄':'尚無個人戰績'}</div></div>`;return;}
  const cfgText=config=>{
    if(!config) return '';
    const items=['blade','ratchet','bit'].map(cat=>{
      const pid=config[cat]; if(!pid) return null;
      const p=state.parts.find(p=>p.id==pid); if(!p) return null;
      return `<span><strong>${CAT_LABELS[cat]}：</strong>${p.name}</span>`;
    }).filter(Boolean);
    return items.length?`<div class="plog-config">${items.join('　')}</div>`:'';
  };
  const rl={win:'✅ 勝',lose:'❌ 負',draw:'🤝 平'};
  el.innerHTML='<div class="plog-list">'+logs.map(l=>`
    <div class="plog-card ${l.result}">
      <div class="plog-result-badge badge-${l.result}">${rl[l.result]||l.result}</div>
      <div class="plog-meta">
        <div class="plog-opponent">vs　${l.opponent}</div>
        <div class="plog-score-line"><span>${l.myScore}</span> : <span>${l.oppScore}</span></div>
        <div class="plog-date">📅 ${l.date}</div>
        ${cfgText(l.config)}
        ${l.note?`<div class="plog-note">💬 ${l.note}</div>`:''}
      </div>
      <div class="plog-actions">
        <button class="btn-icon" onclick="openPersonalForm(${l.id})">✏️</button>
        <button class="btn-icon" onclick="deletePersonalLog(${l.id})" style="color:var(--accent);">🗑</button>
      </div>
    </div>`).join('')+'</div>';
}

// ═══════════════════════════════════════
//  MULTI LOG
// ═══════════════════════════════════════
function renderMultiLog() {
  const wins={};
  state.matches.forEach(m=>{wins[m.winner]=(wins[m.winner]||0)+1;});
  const top=Object.entries(wins).sort((a,b)=>b[1]-a[1])[0];
  const se=document.getElementById('overallStats');
  if(se) se.innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${state.matches.length}</div><div class="stat-card-label">總場次</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${top?top[0]:'—'}</div><div class="stat-card-label">勝場最多</div></div>
    <div class="stat-card"><div class="stat-card-val">${top?top[1]:0}</div><div class="stat-card-label">最高勝場</div></div>`;
  const le=document.getElementById('matchLog'); if(!le) return;
  if(!state.matches.length){le.innerHTML='<div class="empty-state"><div class="empty-icon">⚔️</div><div>尚無多人記錄</div></div>';return;}
  const pn=id=>{const p=state.parts.find(p=>p.id==id);return p?p.name:'—';};
  const cfgStr=cfg=>{if(!cfg) return '—';return ['blade','ratchet','bit'].map(k=>cfg[k]?pn(cfg[k]):'').filter(Boolean).join(' / ')||'—';};
  le.innerHTML=state.matches.map(m=>`
    <div class="log-entry">
      <div><div class="log-player">${m.p1}${m.winner===m.p1?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts">${cfgStr(m.p1Config)}</div></div>
      <div><div class="log-score">${m.s1} : ${m.s2}</div><div class="log-date">${m.date}</div></div>
      <div style="text-align:right;"><div class="log-player">${m.p2}${m.winner===m.p2?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts" style="text-align:right;">${cfgStr(m.p2Config)}</div></div>
    </div>`).join('');
}

// ═══════════════════════════════════════
//  ANALYSIS
// ═══════════════════════════════════════
let analysisMode='config';
function switchAnalysis(mode) {
  analysisMode=mode;
  document.getElementById('analysisConfig').style.display=mode==='config'?'':'none';
  document.getElementById('analysisParts').style.display=mode==='parts'?'':'none';
  document.getElementById('anaTab1').classList.toggle('active',mode==='config');
  document.getElementById('anaTab2').classList.toggle('active',mode==='parts');
  renderAnalysis();
}
function renderAnalysis() { renderConfigAnalysis(); renderPartsAnalysis(); }

function renderConfigAnalysis() {
  const el=document.getElementById('analysisConfig'); if(!el) return;
  const cfgKey=cfg=>{
    if(!cfg) return null;
    const parts=['blade','ratchet','bit'].map(k=>{const p=state.parts.find(p=>p.id==cfg[k]);return p?p.name:'';}).filter(Boolean);
    return parts.length?parts.join(' / '):null;
  };
  const cs={};
  const add=(cfg,won)=>{const k=cfgKey(cfg);if(!k)return;if(!cs[k])cs[k]={key:k,wins:0,total:0};cs[k].total++;if(won)cs[k].wins++;};
  state.matches.forEach(m=>{add(m.p1Config,m.winner===m.p1);add(m.p2Config,m.winner===m.p2);});
  state.personalLogs.forEach(l=>{add(l.config,l.result==='win');});
  const rows=Object.values(cs).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">📊 比賽場次不足</div>';return;}
  el.innerHTML=`<div class="analysis-section-title">配置勝率排行</div>
    <table class="analysis-table"><thead><tr><th>#</th><th>配置</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead>
    <tbody>${rows.map((r,i)=>{const wr=Math.round(r.wins/r.total*100);const cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';
      return `<tr><td style="color:var(--text2);">${i+1}</td><td>${r.key}</td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td>
      <td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}
    </tbody></table>`;
}

function renderPartsAnalysis() {
  const el=document.getElementById('analysisParts'); if(!el) return;
  const ps={};
  const track=(pid,won)=>{const p=state.parts.find(p=>p.id==pid);if(!p)return;if(!ps[p.id])ps[p.id]={id:p.id,name:p.name,cat:p.cat,wins:0,total:0};ps[p.id].total++;if(won)ps[p.id].wins++;};
  state.matches.forEach(m=>{m.p1Parts?.forEach(pid=>track(pid,m.winner===m.p1));m.p2Parts?.forEach(pid=>track(pid,m.winner===m.p2));});
  state.personalLogs.forEach(l=>{['blade','ratchet','bit'].forEach(k=>{if(l.config?.[k])track(l.config[k],l.result==='win');});});
  const rows=Object.values(ps).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">⚙️ 尚無零件使用記錄</div>';return;}
  const byType={};rows.forEach(r=>{(byType[r.cat]=byType[r.cat]||[]).push(r);});
  let html='';
  ['blade','ratchet','bit'].forEach(cat=>{
    const g=byType[cat];if(!g)return;
    html+=`<div class="analysis-section-title">${CAT_LABELS[cat]}</div>
      <table class="analysis-table"><thead><tr><th>#</th><th>零件</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead>
      <tbody>${g.map((r,i)=>{const wr=Math.round(r.wins/r.total*100);const cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';
        return `<tr><td style="color:var(--text2);">${i+1}</td><td><strong>${r.name}</strong></td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td>
        <td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}
      </tbody></table>`;
  });
  el.innerHTML=html;
}

// ═══════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════
function exportPersonalExcel() {
  if(!state.personalLogs.length){showToast('尚無個人記錄','error');return;}
  const rl={win:'勝',lose:'負',draw:'平'};
  const pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const headers=['日期','對手','結果','我的分數','對手分數','鋼鐵戰刃','固鎖輪盤','軸心','備注'];
  const rows=state.personalLogs.map(l=>[
    l.date,l.opponent,rl[l.result]||l.result,l.myScore,l.oppScore,
    pn(l.config?.blade),pn(l.config?.ratchet),pn(l.config?.bit),l.note||''
  ]);
  downloadCSV([headers,...rows],'個人戰績.csv');
}
function exportMultiExcel() {
  if(!state.matches.length){showToast('尚無多人記錄','error');return;}
  const pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const cfgStr=cfg=>cfg?['blade','ratchet','bit'].map(k=>pn(cfg[k])).filter(Boolean).join(' / '):'';
  const headers=['日期','選手A','A分數','選手B','B分數','勝者','A配置','B配置'];
  const rows=state.matches.map(m=>[m.date,m.p1,m.s1,m.p2,m.s2,m.winner,cfgStr(m.p1Config),cfgStr(m.p2Config)]);
  downloadCSV([headers,...rows],'多人戰績.csv');
}
function downloadCSV(data,filename) {
  const csv='\uFEFF'+data.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=filename; a.click(); showToast(`✅ ${filename} 已下載！`,'success');
}

// ═══════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function showToast(msg,type='') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast'+(type?' '+type:'');
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500);
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
seedDefaultParts();
genPlayerInputs();
document.getElementById('playerCount').dispatchEvent(new Event('input'));
initAddForm();
renderParts();