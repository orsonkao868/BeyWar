/**
 * BeyWarrior｜陀螺鬥士輔助系統
 * 製作人：OK
 */

// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
const state = {
  parts:        JSON.parse(localStorage.getItem('bey_parts')    || '[]'),
  matches:      JSON.parse(localStorage.getItem('bey_matches')  || '[]'),
  personalLogs: JSON.parse(localStorage.getItem('bey_personal') || '[]'),
};
function save() {
  localStorage.setItem('bey_parts',    JSON.stringify(state.parts));
  localStorage.setItem('bey_matches',  JSON.stringify(state.matches));
  localStorage.setItem('bey_personal', JSON.stringify(state.personalLogs));
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
  switchInner('bracket', 'setup', null);
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

// 長按 -1，移動取消
function touchStart(p, e) {
  touchMoved = false;
  touchTimer = setTimeout(() => {
    if (!touchMoved) subScore(p, null);
    touchTimer = null;
  }, 550);
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
  const wrap   = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  const colors = ['#c9a84c','#e8c97a','#8c6e2a','#fff8e0','#f5dfa0','#fffde7','#f0d080'];
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

// ═══════════════════════════════════════
//  SAVE MATCH CONFIG
// ═══════════════════════════════════════
let matchConfigs = { p1: {}, p2: {} };

function saveMatch() {
  const p1n = document.getElementById('p1name').value || '選手 A';
  const p2n = document.getElementById('p2name').value || '選手 B';
  document.getElementById('saveP1Label').textContent = p1n + ' 的配置';
  document.getElementById('saveP2Label').textContent = p2n + ' 的配置';
  matchConfigs = { p1: {}, p2: {} };
  buildConfigUI('p1'); buildConfigUI('p2');
  document.getElementById('saveMatchModal').classList.add('show');
}
function buildConfigUI(player) {
  const el  = document.getElementById(player === 'p1' ? 'configBuilderP1' : 'configBuilderP2');
  const cfg = matchConfigs[player];
  let html  = '<div class="config-series-tabs">' +
    ['BX','UX','CX'].map(s =>
      `<button class="config-series-tab${cfg.series===s?' active':''}" onclick="setConfigSeries('${player}','${s}')">${s}</button>`
    ).join('') + '</div>';
  if (!cfg.series) { el.innerHTML = html + '<div class="no-parts-msg">請先選擇系列</div>'; return; }
  const types = SERIES_TYPES[cfg.series];
  if (cfg.series === 'CX') {
    html += '<div class="ptype-group" style="margin-bottom:8px"><div class="ptype-group-label">🌟 鋼鐵戰刃</div><div style="display:flex;flex-direction:column;gap:6px">';
    types.filter(t => !['ratchet','bit'].includes(t.key)).forEach(t => { html += buildConfigRow(player, t); });
    html += '</div></div>';
    types.filter(t => ['ratchet','bit'].includes(t.key)).forEach(t => { html += buildConfigRow(player, t); });
  } else {
    types.forEach(t => { html += buildConfigRow(player, t); });
  }
  el.innerHTML = html;
}
function buildConfigRow(player, typeObj) {
  const { key, label } = typeObj;
  const parts = state.parts.filter(p => p.series === matchConfigs[player].series && p.type === key);
  const sel   = matchConfigs[player][key] || '';
  if (!parts.length) return `<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚未新增此零件</div></div>`;
  return `<div class="config-step"><div class="config-step-label">${label}</div>
    <select class="form-select" style="padding:8px 12px;font-size:.85rem" onchange="setConfigPart('${player}','${key}',this.value)">
      <option value="">— 未使用 —</option>
      ${parts.map(p=>`<option value="${p.id}"${sel==p.id?' selected':''}>${p.name}${p.spin?' ('+p.spin+')':''}</option>`).join('')}
    </select></div>`;
}
function setConfigSeries(player, series) { matchConfigs[player] = { series }; buildConfigUI(player); }
function setConfigPart(player, key, val) { matchConfigs[player][key] = val; }

function confirmSaveMatch() {
  const p1n    = document.getElementById('p1name').value || '選手 A';
  const p2n    = document.getElementById('p2name').value || '選手 B';
  const winner = scores[0] >= scores[1] ? p1n : p2n;
  const collect = cfg => Object.entries(cfg).filter(([k,v])=>k!=='series'&&v).map(([,v])=>v);
  const p1parts = collect(matchConfigs.p1), p2parts = collect(matchConfigs.p2);
  state.matches.unshift({
    id: Date.now(), date: new Date().toLocaleString('zh-TW'),
    p1: p1n, p2: p2n, s1: scores[0], s2: scores[1], winner,
    p1series: matchConfigs.p1.series||'', p2series: matchConfigs.p2.series||'',
    p1parts, p2parts,
  });
  [...p1parts,...p2parts].forEach(pid => {
    const p = state.parts.find(p=>p.id==pid); if(p) p.uses=(p.uses||0)+1;
  });
  save(); closeModal('saveMatchModal'); showToast('✅ 比賽記錄已儲存！','success');
}

// ═══════════════════════════════════════
//  BRACKET  ─ 晉級賽（無 BYE 補位）
//
//  邏輯：
//  ・每輪將選手兩兩配對
//  ・奇數時最後一人直接自動晉級（輪空）
//  ・剩 2 或 3 人時進入「自由選擇輪」，直接點選晉級者
//  ・不補空位，有幾人就幾人
// ═══════════════════════════════════════
let bracketPlayers  = [];   // 原始名單
let bracketRounds   = [];   // 已完成的輪次，每輪是 winner 陣列
let currentRound    = [];   // 本輪對戰清單 [{ p1, p2, winner }]  奇數尾=bye
let currentWinners  = [];   // 本輪已產生的晉級者

function genPlayerInputs() {
  const n = Math.min(1000, Math.max(2, parseInt(document.getElementById('playerCount').value)||2));
  document.getElementById('bracketInfo').textContent =
    `${n} 位選手，晉級賽將依序進行每輪對決`;
  const list     = document.getElementById('playerListEditor');
  const existing = [...list.querySelectorAll('input')].map(i=>i.value);
  list.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'player-entry';
    d.innerHTML = `<span class="player-num">${i+1}</span><input placeholder="選手 ${i+1}" value="${existing[i]||''}">`;
    list.appendChild(d);
  }
}

function generateBracket() {
  const n     = Math.min(1000, Math.max(2, parseInt(document.getElementById('playerCount').value)||2));
  const names = [...document.querySelectorAll('#playerListEditor input')].map((el,i)=>el.value||`選手${i+1}`);
  // shuffle
  for (let i = names.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [names[i],names[j]] = [names[j],names[i]];
  }
  bracketPlayers = names.slice(0, n);
  bracketRounds  = [];
  startRound(bracketPlayers);
  renderBracketView();
  switchInner('bracket','draw',null);
  const tabs = document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.remove('active'); tabs[1].classList.add('active');
}

function resetBracket() {
  bracketPlayers=[]; bracketRounds=[]; currentRound=[]; currentWinners=[];
  document.getElementById('bracketContainer').innerHTML='';
}

/** 開始新一輪，players 為本輪所有選手 */
function startRound(players) {
  currentWinners = [];
  currentRound   = [];
  // 兩兩配對
  for (let i = 0; i < players.length - 1; i += 2) {
    currentRound.push({ p1: players[i], p2: players[i+1], winner: null });
  }
  // 奇數：最後一人自動輪空晉級
  if (players.length % 2 === 1) {
    const bye = players[players.length - 1];
    currentRound.push({ p1: bye, p2: null, winner: bye });  // bye 場直接有 winner
    currentWinners.push(bye);  // 不算在「需點選」的場次裡
  }
}

/** 點選某場勝者 */
function pickWinner(matchIdx, playerKey) {
  const match = currentRound[matchIdx];
  if (!match || match.winner) return;           // 已選過
  match.winner = match[playerKey];
  currentWinners.push(match.winner);

  // 判斷本輪是否全部選完
  const needed = currentRound.filter(m => m.p2 !== null); // 排除輪空場
  const done   = needed.every(m => m.winner);
  if (done) advanceRound();
  else renderBracketView();
}

/** 自由選輪（剩 2-3 人）：直接點選進入決賽/冠軍 */
function pickFree(playerName) {
  // 確認這個人還沒被選過
  if (currentWinners.includes(playerName)) {
    showToast('已選過此選手', 'error'); return;
  }
  currentWinners.push(playerName);

  // 若本輪只需選出 1 人（剩3選1）就進下一輪；若是 2 人都點才算完
  const freePool = currentRound;   // freePool 是陣列裡 p2===null 都是 bye
  // 剩 2 人：選 1 人即完成（另一人也晉級，但賽制上就是決賽）
  // 剩 3 人：選 1 人輪空，另外 2 人對打 => 但我們改成 3 人都直接點選排序
  const total = freePool.length;

  // 自由輪：存在 currentRound 的 freeMode
  if (currentRound._freeMode) {
    const pool = currentRound._pool;
    // 把選的人標為已選
    const idx = pool.findIndex(p => p === playerName && !pool._picked?.includes(p));
    if (!pool._picked) pool._picked = [];
    pool._picked.push(playerName);

    if (pool._picked.length >= pool.length) {
      // 全部選完
      bracketRounds.push({ players: bracketPlayers.slice(), matches: JSON.parse(JSON.stringify(currentRound)), winners: [...currentWinners] });
      const nextPlayers = [...currentWinners];
      if (nextPlayers.length === 1) {
        // 冠軍出爐
        showChampion(nextPlayers[0]);
        renderBracketView();
        return;
      }
      startRound(nextPlayers);
    }
    renderBracketView();
    return;
  }

  renderBracketView();
}

/** 本輪完成，進入下一輪 */
function advanceRound() {
  // 儲存本輪
  bracketRounds.push({
    players: [...(bracketRounds.length === 0 ? bracketPlayers : bracketRounds[bracketRounds.length-1].winners)],
    matches: JSON.parse(JSON.stringify(currentRound)),
    winners: [...currentWinners],
  });

  const next = [...currentWinners];

  if (next.length === 1) { showChampion(next[0]); renderBracketView(); return; }

  // 剩 2 或 3 人 → 自由選擇輪
  if (next.length <= 3) {
    enterFreeRound(next);
  } else {
    startRound(next);
  }
  renderBracketView();
}

/** 自由選擇輪（剩 2-3 人，手動點選晉級順序） */
function enterFreeRound(players) {
  currentWinners = [];
  currentRound   = [];
  currentRound._freeMode = true;
  currentRound._pool     = players;
  players._picked        = [];
}

function showChampion(name) {
  document.getElementById('victoryName').textContent  = name;
  document.getElementById('victoryScore').textContent = '🏆 晉級賽冠軍！';
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}

/** 渲染所有輪次 + 目前輪次 */
function renderBracketView() {
  const container = document.getElementById('bracketContainer');
  const wrap      = document.createElement('div');
  wrap.className  = 'bracket';

  // 已完成的輪次
  bracketRounds.forEach((rd, ri) => {
    const col = document.createElement('div');
    col.className = 'bracket-round';
    const total = bracketPlayers.length;
    const label = getRoundLabel(ri, total);
    col.innerHTML = `<div class="round-label">第 ${ri+1} 輪　${label}</div>`;
    const md = document.createElement('div'); md.className = 'round-matches';

    if (rd._freeMode) {
      // 自由選擇輪歷史
      const p = rd._pool || [];
      const d = document.createElement('div');
      d.className = 'free-round-banner'; d.textContent = `自由選擇輪：${p.join('、')}`;
      md.appendChild(d);
    } else {
      rd.matches.forEach(m => {
        const slot = document.createElement('div'); slot.className = 'match-slot';
        if (m.p2 === null) {
          slot.innerHTML = `<div class="match-player bye"><span class="seed">輪空</span><span>${m.p1}</span><span class="bye-badge">自動晉級</span></div>`;
        } else {
          slot.innerHTML = `
            <div class="match-player${m.winner===m.p1?' winner':''}"><span class="seed"></span><span>${m.p1}</span></div>
            <div class="match-divider"></div>
            <div class="match-player${m.winner===m.p2?' winner':''}"><span class="seed"></span><span>${m.p2}</span></div>`;
        }
        md.appendChild(slot);
      });
    }
    col.appendChild(md); wrap.appendChild(col);
  });

  // 目前輪次
  const curIdx = bracketRounds.length;
  const curCol = document.createElement('div'); curCol.className = 'bracket-round';

  if (currentRound._freeMode) {
    // 自由選擇模式
    const pool    = currentRound._pool || [];
    const picked  = pool._picked || [];
    const remain  = pool.filter(p => !picked.includes(p));
    const total   = bracketPlayers.length;
    curCol.innerHTML = `<div class="round-label" style="color:var(--gold-dk);">第 ${curIdx+1} 輪　自由選擇</div>`;
    const md = document.createElement('div'); md.className = 'round-matches';
    const banner = document.createElement('div');
    banner.className = 'free-round-banner';
    banner.textContent = `剩 ${remain.length} 人，依序點選晉級順序`;
    md.appendChild(banner);

    pool.forEach(p => {
      const el = document.createElement('div');
      if (picked.includes(p)) {
        const rank = picked.indexOf(p) + 1;
        el.className = 'match-player winner';
        el.innerHTML = `<span class="seed">${rank}</span><span>${p}</span>`;
      } else {
        el.className = 'match-player free-pick';
        el.innerHTML = `<span class="seed">?</span><span>${p}</span>`;
        el.onclick   = () => { pickFreePlayer(p); };
      }
      md.appendChild(el);
    });
    curCol.appendChild(md);
  } else if (currentRound.length > 0) {
    const total = bracketPlayers.length;
    curCol.innerHTML = `<div class="round-label" style="color:var(--gold-dk);">第 ${curIdx+1} 輪　進行中</div>`;
    const md = document.createElement('div'); md.className = 'round-matches';

    currentRound.forEach((m, mi) => {
      const slot = document.createElement('div'); slot.className = 'match-slot';
      if (m.p2 === null) {
        // 輪空
        slot.innerHTML = `<div class="match-player bye"><span class="seed">輪空</span><span>${m.p1}</span><span class="bye-badge">自動晉級</span></div>`;
      } else if (m.winner) {
        slot.innerHTML = `
          <div class="match-player${m.winner===m.p1?' winner':''}"><span class="seed"></span><span>${m.p1}</span></div>
          <div class="match-divider"></div>
          <div class="match-player${m.winner===m.p2?' winner':''}"><span class="seed"></span><span>${m.p2}</span></div>`;
      } else {
        // 未決，可點選
        const d1 = document.createElement('div'); d1.className = 'match-player';
        d1.innerHTML = `<span class="seed"></span><span>${m.p1}</span>`;
        d1.onclick   = () => pickWinner(mi, 'p1');
        const div    = document.createElement('div'); div.className = 'match-divider';
        const d2     = document.createElement('div'); d2.className = 'match-player';
        d2.innerHTML = `<span class="seed"></span><span>${m.p2}</span>`;
        d2.onclick   = () => pickWinner(mi, 'p2');
        slot.appendChild(d1); slot.appendChild(div); slot.appendChild(d2);
      }
      md.appendChild(slot);
    });
    curCol.appendChild(md);
  }

  wrap.appendChild(curCol);
  container.innerHTML = '';
  container.appendChild(wrap);
}

function getRoundLabel(ri, total) {
  // 計算剩餘人數
  let n = total;
  for (let i = 0; i < ri; i++) {
    n = Math.ceil(n / 2);
  }
  const next = Math.ceil(n / 2);
  if (next === 1) return '決賽';
  return `${n} → ${next} 人`;
}

/** 自由選擇輪：點選選手 */
function pickFreePlayer(name) {
  const pool   = currentRound._pool;
  if (!pool._picked) pool._picked = [];
  if (pool._picked.includes(name)) return;
  pool._picked.push(name);
  currentWinners.push(name);

  if (pool._picked.length >= pool.length) {
    // 全部選完，存檔並進下一輪
    bracketRounds.push({
      _freeMode: true,
      _pool: pool,
      winners: [...pool._picked],
    });
    const next = [...pool._picked];
    if (next.length === 1) { showChampion(next[0]); renderBracketView(); return; }
    if (next.length <= 3) enterFreeRound(next);
    else startRound(next);
  }
  renderBracketView();
}

// ═══════════════════════════════════════
//  PARTS DB
// ═══════════════════════════════════════
const SERIES_TYPES = {
  BX: [{ key:'blade_bxux',label:'鋼鐵戰刃' },{ key:'ratchet',label:'鎖固輪盤' },{ key:'bit',label:'軸心' }],
  UX: [{ key:'blade_bxux',label:'鋼鐵戰刃' },{ key:'ratchet',label:'鎖固輪盤' },{ key:'bit',label:'軸心' }],
  CX: [{ key:'emblem',label:'紋章' },{ key:'main_blade',label:'主要戰刃' },{ key:'sub_blade',label:'輔助戰刃' },{ key:'over_blade',label:'超越戰刃' },{ key:'ratchet',label:'鎖固輪盤' },{ key:'bit',label:'軸心' }],
};
const TYPE_LABELS = { blade_bxux:'鋼鐵戰刃',ratchet:'鎖固輪盤',bit:'軸心',emblem:'紋章',main_blade:'主要戰刃',sub_blade:'輔助戰刃',over_blade:'超越戰刃' };

let currentAddSeries = 'BX';
let currentAddType   = 'blade_bxux';
let currentPartId    = null;

function selectSeries(s) {
  currentAddSeries = s;
  document.querySelectorAll('.series-btn').forEach(b => b.classList.toggle('active', b.dataset.series===s));
  currentAddType = SERIES_TYPES[s][0].key;
  renderPartTypeSelector();
}
function selectPartType(key) { currentAddType = key; renderPartTypeSelector(); }
function renderPartTypeSelector() {
  const el = document.getElementById('partTypeSelector');
  const types = SERIES_TYPES[currentAddSeries];
  const isCX  = currentAddSeries === 'CX';
  if (isCX) {
    const bl = types.filter(t=>!['ratchet','bit'].includes(t.key));
    const ot = types.filter(t=> ['ratchet','bit'].includes(t.key));
    el.innerHTML = `<div class="ptype-flow">
      <div class="ptype-group"><div class="ptype-group-label">🌟 鋼鐵戰刃（選一種）</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${bl.map(t=>`<button class="ptype-btn cx-only${currentAddType===t.key?' active':''}" onclick="selectPartType('${t.key}')">${t.label}</button>`).join('')}
        </div></div>
      <span class="ptype-arrow">→</span>
      ${ot.map((t,i)=>`<button class="ptype-btn${currentAddType===t.key?' active':''}" onclick="selectPartType('${t.key}')">${t.label}</button>${i<ot.length-1?'<span class="ptype-arrow">→</span>':''}`).join('')}
    </div>`;
  } else {
    el.innerHTML = `<div class="ptype-flow">` +
      types.map((t,i)=>`<button class="ptype-btn${currentAddType===t.key?' active':''}" onclick="selectPartType('${t.key}')">${t.label}</button>${i<types.length-1?'<span class="ptype-arrow">→</span>':''}`).join('') +
      `</div>`;
  }
}
function addPart() {
  const name = document.getElementById('newPartName').value.trim();
  if (!name) { showToast('請輸入零件名稱','error'); return; }
  state.parts.push({ id:Date.now(), name, series:currentAddSeries, type:currentAddType, spin:document.getElementById('newPartSpin').value, note:document.getElementById('newPartNote').value, uses:0 });
  save();
  showToast(`✅ ${TYPE_LABELS[currentAddType]}「${name}」已新增！`,'success');
  document.getElementById('newPartName').value='';
  document.getElementById('newPartNote').value='';
}
function renderParts() {
  const search  = (document.getElementById('partSearch')?.value||'').toLowerCase();
  const seriesF = document.getElementById('partSeriesFilter')?.value||'';
  const filtered = state.parts.filter(p=>(!search||p.name.toLowerCase().includes(search))&&(!seriesF||p.series===seriesF));
  const grid = document.getElementById('partsGrid'); if(!grid) return;
  if (!filtered.length) { grid.innerHTML='<div class="empty-state"><div class="empty-icon">📦</div><div>尚無零件</div></div>'; return; }
  const grouped={};
  filtered.forEach(p=>{(grouped[p.series]=grouped[p.series]||[]).push(p);});
  let html='';
  ['BX','UX','CX'].forEach(s=>{
    if(!grouped[s]) return;
    html+=`<div style="grid-column:1/-1;margin:8px 0 4px;"><span class="part-type-badge badge-series-${s.toLowerCase()}" style="font-size:.85rem;padding:4px 14px;">${s} 系列</span></div>`;
    grouped[s].forEach(p=>{
      html+=`<div class="part-card" onclick="showPart(${p.id})">
        <div class="part-card-header"><span class="part-type-badge badge-${p.type}">${TYPE_LABELS[p.type]||p.type}</span><div class="part-uses-badge">×${p.uses||0}</div></div>
        <div class="part-name">${p.name}</div>
        ${p.spin||p.note?`<div style="font-size:.78rem;color:var(--text2);margin-top:4px;">${p.spin||''}${p.note?' · '+p.note:''}</div>`:''}
      </div>`;
    });
  });
  grid.innerHTML=html;
}
function showPart(id) {
  currentPartId=id;
  const p=state.parts.find(p=>p.id===id); if(!p) return;
  document.getElementById('partModalTitle').textContent=p.name;
  document.getElementById('partModalContent').innerHTML=`
    <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <span class="part-type-badge badge-series-${p.series.toLowerCase()}" style="padding:4px 12px;">${p.series} 系列</span>
      <span class="part-type-badge badge-${p.type}">${TYPE_LABELS[p.type]||p.type}</span>
    </div>
    <div class="part-detail-grid">
      <div class="part-detail-item"><div class="form-label">旋轉方向</div><div>${p.spin||'—'}</div></div>
      <div class="part-detail-item"><div class="form-label">使用次數</div><div style="font-family:Rajdhani;font-size:1.6rem;font-weight:700;color:var(--gold-dk);">${p.uses||0}</div></div>
    </div>
    ${p.note?`<div class="part-detail-item" style="margin-top:8px;"><div class="form-label">備注</div><div>${p.note}</div></div>`:''}`;
  document.getElementById('partModal').classList.add('show');
}
function deletePart() {
  state.parts=state.parts.filter(p=>p.id!==currentPartId);
  save(); renderParts(); closeModal('partModal'); showToast('零件已刪除','error');
}
function renderPartStats() {
  const bx=state.parts.filter(p=>p.series==='BX').length;
  const ux=state.parts.filter(p=>p.series==='UX').length;
  const cx=state.parts.filter(p=>p.series==='CX').length;
  const tu=state.parts.reduce((a,p)=>a+(p.uses||0),0);
  document.getElementById('partStatsCards').innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${state.parts.length}</div><div class="stat-card-label">零件總數</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--blue);">${bx}</div><div class="stat-card-label">BX</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${ux}</div><div class="stat-card-label">UX</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${cx}</div><div class="stat-card-label">CX</div></div>
    <div class="stat-card"><div class="stat-card-val">${tu}</div><div class="stat-card-label">總使用次數</div></div>`;
  const tc={};
  state.parts.forEach(p=>{tc[p.type]=(tc[p.type]||0)+1;});
  const maxT=Math.max(1,...Object.values(tc));
  document.getElementById('partTypeChart').innerHTML=Object.entries(tc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
    <div class="bar-row"><div class="bar-label">${TYPE_LABELS[k]||k}</div><div class="bar-track"><div class="bar-fill" style="width:${v/maxT*100}%"></div></div><div class="bar-val">${v}</div></div>`).join('')||'<div style="color:var(--text2)">暫無數據</div>';
  const sorted=[...state.parts].sort((a,b)=>(b.uses||0)-(a.uses||0)).slice(0,10);
  const maxU=Math.max(1,sorted[0]?.uses||0);
  document.getElementById('partUsageChart').innerHTML=sorted.length?sorted.map(p=>`
    <div class="bar-row"><div class="bar-label">${p.name} <span style="font-size:.65rem;color:var(--text2);">${p.series}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(p.uses||0)/maxU*100}%"></div></div><div class="bar-val">${p.uses||0}</div></div>`).join(''):'<div style="color:var(--text2)">暫無數據</div>';
}

// ═══════════════════════════════════════
//  PERSONAL LOG
// ═══════════════════════════════════════
let editingPersonalId=null, pLogSeries='BX', pLogConfig={};

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
  pLogSeries=entry?.series||'BX'; pLogConfig=entry?{...entry.config}:{};
  document.querySelectorAll('#pLogSeriesTabs .config-series-tab').forEach(t=>{
    t.classList.toggle('active',t.textContent.trim()===(pLogSeries||'未記錄'));
  });
  renderPLogConfigArea();
  document.getElementById('personalFormModal').classList.add('show');
}
function setPLogSeries(s,btn) {
  pLogSeries=s; pLogConfig={};
  document.querySelectorAll('#pLogSeriesTabs .config-series-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active'); renderPLogConfigArea();
}
function renderPLogConfigArea() {
  const el=document.getElementById('pLogConfigArea');
  if(!pLogSeries){el.innerHTML='';return;}
  const types=SERIES_TYPES[pLogSeries], isCX=pLogSeries==='CX';
  const row=t=>{
    const parts=state.parts.filter(p=>p.series===pLogSeries&&p.type===t.key);
    const sel=pLogConfig[t.key]||'';
    if(!parts.length) return `<div class="config-step"><div class="config-step-label">${t.label}</div><div class="no-parts-msg">尚未新增此零件</div></div>`;
    return `<div class="config-step"><div class="config-step-label">${t.label}</div>
      <select class="form-select" style="padding:8px 12px;font-size:.85rem;" onchange="pLogConfig['${t.key}']=this.value">
        <option value="">— 未使用 —</option>
        ${parts.map(p=>`<option value="${p.id}"${sel==p.id?' selected':''}>${p.name}</option>`).join('')}
      </select></div>`;
  };
  let html='<label class="form-label">自己的零件配置</label>';
  if(isCX){
    html+=`<div class="ptype-group" style="margin-bottom:8px;"><div class="ptype-group-label">🌟 鋼鐵戰刃</div>${types.filter(t=>!['ratchet','bit'].includes(t.key)).map(row).join('')}</div>`;
    types.filter(t=>['ratchet','bit'].includes(t.key)).forEach(t=>{html+=row(t);});
  } else { types.forEach(t=>{html+=row(t);}); }
  el.innerHTML=html;
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
    series:pLogSeries, config:{...pLogConfig},
  };
  if(editingPersonalId){
    const i=state.personalLogs.findIndex(l=>l.id===editingPersonalId);
    if(i!==-1) state.personalLogs[i]=entry;
  } else { state.personalLogs.unshift(entry); }
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
  const cfgText=(series,config)=>{
    if(!series) return '';
    return `<div class="plog-config"><strong>${series} 系列</strong>　`+
      (SERIES_TYPES[series]||[]).map(t=>{const pid=config?.[t.key];const p=pid?state.parts.find(p=>p.id==pid):null;return `<span><strong>${t.label}：</strong>${p?p.name:'—'}</span>`;}).join('　')+'</div>';
  };
  const rl={win:'✅ 勝',lose:'❌ 負',draw:'🤝 平'};
  el.innerHTML='<div class="plog-list">'+logs.map(l=>`
    <div class="plog-card ${l.result}">
      <div class="plog-result-badge badge-${l.result}">${rl[l.result]||l.result}</div>
      <div class="plog-meta">
        <div class="plog-opponent">vs　${l.opponent}</div>
        <div class="plog-score-line"><span>${l.myScore}</span> : <span>${l.oppScore}</span></div>
        <div class="plog-date">📅 ${l.date}</div>
        ${cfgText(l.series,l.config)}
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
  const ct=(parts,series)=>{const n=(parts||[]).map(pn).filter(Boolean).join(' / ');return `${series||''}${n?' · '+n:''}`||'—';};
  le.innerHTML=state.matches.map(m=>`
    <div class="log-entry">
      <div><div class="log-player">${m.p1}${m.winner===m.p1?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts">${ct(m.p1parts,m.p1series)}</div></div>
      <div><div class="log-score">${m.s1} : ${m.s2}</div><div class="log-date">${m.date}</div></div>
      <div style="text-align:right;"><div class="log-player">${m.p2}${m.winner===m.p2?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts" style="text-align:right;">${ct(m.p2parts,m.p2series)}</div></div>
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
  const cfgKey=(parts,series)=>{
    if(!series||!parts?.length) return null;
    const n=parts.map(id=>state.parts.find(p=>p.id==id)?.name||'').filter(Boolean);
    return `[${series}] ${n.join(' / ')}`;
  };
  const cs={};
  state.matches.forEach(m=>{
    [[m.p1,m.p1parts,m.p1series,m.winner===m.p1],[m.p2,m.p2parts,m.p2series,m.winner===m.p2]].forEach(([,parts,series,won])=>{
      const k=cfgKey(parts,series); if(!k) return;
      if(!cs[k]) cs[k]={key:k,wins:0,total:0,series};
      cs[k].total++; if(won) cs[k].wins++;
    });
  });
  state.personalLogs.forEach(l=>{
    const n=(SERIES_TYPES[l.series]||[]).map(t=>{const pid=l.config?.[t.key];return pid?state.parts.find(p=>p.id==pid)?.name:'';}).filter(Boolean);
    const k=n.length?`[${l.series}] ${n.join(' / ')}`:null; if(!k) return;
    if(!cs[k]) cs[k]={key:k,wins:0,total:0,series:l.series};
    cs[k].total++; if(l.result==='win') cs[k].wins++;
  });
  const rows=Object.values(cs).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">📊 比賽場次不足，尚無法分析</div>';return;}
  el.innerHTML=`<div class="analysis-section-title">配置勝率排行</div>
    <table class="analysis-table"><thead><tr><th>#</th><th>配置</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead>
    <tbody>${rows.map((r,i)=>{const wr=Math.round(r.wins/r.total*100);const cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';
      return `<tr><td style="color:var(--text2);">${i+1}</td><td><span class="part-type-badge badge-series-${(r.series||'').toLowerCase()}" style="margin-right:6px;">${r.series||'—'}</span>${r.key.replace(/^\[.*?\]\s*/,'')}</td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td>
      <td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}
    </tbody></table>`;
}

function renderPartsAnalysis() {
  const el=document.getElementById('analysisParts'); if(!el) return;
  const ps={};
  const track=(pid,won)=>{const p=state.parts.find(p=>p.id==pid);if(!p) return;if(!ps[p.id])ps[p.id]={id:p.id,name:p.name,type:p.type,series:p.series,wins:0,total:0};ps[p.id].total++;if(won)ps[p.id].wins++;};
  state.matches.forEach(m=>{m.p1parts?.forEach(pid=>track(pid,m.winner===m.p1));m.p2parts?.forEach(pid=>track(pid,m.winner===m.p2));});
  state.personalLogs.forEach(l=>{(SERIES_TYPES[l.series]||[]).forEach(t=>{const pid=l.config?.[t.key];if(pid)track(pid,l.result==='win');});});
  const rows=Object.values(ps).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">⚙️ 尚無零件使用記錄</div>';return;}
  const byType={};
  rows.forEach(r=>{(byType[r.type]=byType[r.type]||[]).push(r);});
  let html='';
  ['blade_bxux','emblem','main_blade','sub_blade','over_blade','ratchet','bit'].forEach(type=>{
    const g=byType[type]; if(!g) return;
    html+=`<div class="analysis-section-title">${TYPE_LABELS[type]||type}</div>
      <table class="analysis-table"><thead><tr><th>#</th><th>零件</th><th>系列</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead>
      <tbody>${g.map((r,i)=>{const wr=Math.round(r.wins/r.total*100);const cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';
        return `<tr><td style="color:var(--text2);">${i+1}</td><td><strong>${r.name}</strong></td><td><span class="part-type-badge badge-series-${(r.series||'').toLowerCase()}">${r.series||'—'}</span></td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td>
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
  const headers=['日期','對手','結果','自己分數','對手分數','系列','鋼鐵戰刃/紋章','鎖固輪盤','軸心','備注'];
  const rows=state.personalLogs.map(l=>{
    const cfg=l.config||{};
    const blade=['blade_bxux','emblem','main_blade'].map(k=>{const pid=cfg[k];return pid?state.parts.find(p=>p.id==pid)?.name:'';}).filter(Boolean).join('/');
    const ratchet=cfg.ratchet?state.parts.find(p=>p.id==cfg.ratchet)?.name||'':'';
    const bit=cfg.bit?state.parts.find(p=>p.id==cfg.bit)?.name||'':'';
    return[l.date,l.opponent,rl[l.result]||l.result,l.myScore,l.oppScore,l.series||'',blade,ratchet,bit,l.note||''];
  });
  downloadCSV([headers,...rows],'個人戰績.csv');
}
function exportMultiExcel() {
  if(!state.matches.length){showToast('尚無多人記錄','error');return;}
  const headers=['日期','選手A','A分數','選手B','B分數','勝者','A系列','A零件','B系列','B零件'];
  const pn=ids=>(ids||[]).map(id=>state.parts.find(p=>p.id==id)?.name||'').filter(Boolean).join(' / ');
  const rows=state.matches.map(m=>[m.date,m.p1,m.s1,m.p2,m.s2,m.winner,m.p1series||'',pn(m.p1parts),m.p2series||'',pn(m.p2parts)]);
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
genPlayerInputs();
document.getElementById('playerCount').dispatchEvent(new Event('input'));
renderPartTypeSelector();
renderParts();