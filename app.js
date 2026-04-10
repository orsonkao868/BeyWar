/**
 * BeyWarrior｜陀螺鬥士輔助系統
 * 製作人：OK
 * app.js — 所有功能邏輯
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

// 預設零件
function seedDefaultParts() {
  if (state.parts.length > 0) return;
  state.parts.push(
    { id:10001, name:'鳳凰飛翼', cat:'blade', series:'BX', spin:'右旋', note:'BX初始戰刃', cxMods:{}, uses:0 },
    { id:10002, name:'蒼龍爆刃', cat:'blade', series:'UX', spin:'右旋', note:'UX強攻戰刃', cxMods:{}, uses:0 }
  );
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
  switchInner('bracket', 'setup', null);
  const tabs = document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.add('active'); tabs[1].classList.remove('active');
}

// ═══════════════════════════════════════
//  SCOREBOARD
// ═══════════════════════════════════════
let scores = [0,0], touchTimer = null, touchMoved = false;

function addScore(p) { scores[p-1]++; updateScoreDisplay(); flashCard(p); }
function subScore(p, e) {
  if (e) e.preventDefault();
  if (scores[p-1] > 0) { scores[p-1]--; updateScoreDisplay(); }
}
function updateScoreDisplay() {
  document.getElementById('score1').textContent = scores[0];
  document.getElementById('score2').textContent = scores[1];
  const c1 = document.getElementById('card1'), c2 = document.getElementById('card2');
  c1.classList.remove('winning'); c2.classList.remove('winning');
  if      (scores[0] > scores[1]) c1.classList.add('winning');
  else if (scores[1] > scores[0]) c2.classList.add('winning');
}
function resetScores() {
  scores=[0,0]; updateScoreDisplay();
  document.getElementById('card1').classList.remove('winning');
  document.getElementById('card2').classList.remove('winning');
}
function flashCard(p) {
  const card = document.getElementById('card'+p);
  card.style.transition='none'; card.style.transform='scale(1.04)';
  setTimeout(()=>{ card.style.transition='all .25s'; card.style.transform=''; }, 120);
}
function touchStart(p,e) {
  touchMoved=false;
  touchTimer=setTimeout(()=>{ if(!touchMoved) subScore(p,null); touchTimer=null; }, 550);
}
function touchMove() { touchMoved=true; if(touchTimer){ clearTimeout(touchTimer); touchTimer=null; } }
function touchEnd()  { if(touchTimer){ clearTimeout(touchTimer); touchTimer=null; } }

function declareWinner() {
  const p1=document.getElementById('p1name').value||'選手 A';
  const p2=document.getElementById('p2name').value||'選手 B';
  document.getElementById('victoryName').textContent  = scores[0]>=scores[1]?p1:p2;
  document.getElementById('victoryScore').textContent = `${scores[0]} : ${scores[1]}`;
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}
function closeVictory() {
  document.getElementById('victoryOverlay').classList.remove('show');
  document.getElementById('confettiWrap').innerHTML='';
}
function launchConfetti() {
  const wrap=document.getElementById('confettiWrap'); wrap.innerHTML='';
  const colors=['#c9a84c','#e8c97a','#8c6e2a','#fff8e0','#f5dfa0','#f0d080'];
  const style=document.createElement('style');
  style.textContent='@keyframes f0{to{transform:translateY(105vh) rotate(360deg);opacity:0}}@keyframes f1{to{transform:translateY(105vh) rotate(-360deg) translateX(60px);opacity:0}}@keyframes f2{to{transform:translateY(105vh) rotate(180deg) translateX(-60px);opacity:0}}';
  wrap.appendChild(style);
  for(let i=0;i<80;i++){
    const c=document.createElement('div'); const s=6+Math.random()*8;
    c.style.cssText=`position:absolute;width:${s}px;height:${s}px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}vw;top:-20px;border-radius:${Math.random()>.5?'50%':'2px'};animation:f${Math.floor(Math.random()*3)} ${1.5+Math.random()*2}s ${Math.random()*.5}s linear forwards;opacity:${.7+Math.random()*.3}`;
    wrap.appendChild(c);
  }
}

// ═══════════════════════════════════════
//  BRACKET — 上下雙向階梯晉級賽
//
//  版面：
//  ┌──────────────────────────────┐
//  │  上半區（選手1~ceil(n/2)）   │
//  │  由上往下，輪次往中間靠攏    │
//  ├──────── 冠軍賽 ─────────────┤
//  │  下半區（選手ceil+1~n）      │
//  │  由下往上，輪次往中間靠攏    │
//  └──────────────────────────────┘
//
//  每輪左右對稱配對，中間為決賽區
//  勝者由金色光點沿 SVG path 飛到下一格
// ═══════════════════════════════════════

let bk = null;  // bracket 資料

// ── 格子尺寸（從 CSS 變數讀取，fallback 預設值）
function getBsW() { return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bs-w'))||160; }
function getBsH() { return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bs-h'))||40; }
const ROUND_H_GAP = 24;  // 輪次垂直間距（基礎值，會乘以輪數）
const MATCH_GAP   = 10;  // 同輪場次間距
const COL_GAP     = 56;  // 輪次水平間距

function genPlayerInputs() {
  const n=Math.min(1000,Math.max(2,parseInt(document.getElementById('playerCount').value)||2));
  document.getElementById('bracketInfo').textContent=`${n} 位選手，上半 ${Math.ceil(n/2)} 人、下半 ${Math.floor(n/2)} 人`;
  const list=document.getElementById('playerListEditor');
  const existing=[...list.querySelectorAll('input')].map(i=>i.value);
  list.innerHTML='';
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='player-entry';
    d.innerHTML=`<span class="player-num">${i+1}</span><input placeholder="選手 ${i+1}" value="${existing[i]||''}">`;
    list.appendChild(d);
  }
}

function generateBracket() {
  const n=Math.min(1000,Math.max(2,parseInt(document.getElementById('playerCount').value)||2));
  let names=[...document.querySelectorAll('#playerListEditor input')].map((el,i)=>el.value||`選手${i+1}`);
  for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
  names=names.slice(0,n);

  const topP  = names.slice(0, Math.ceil(n/2));
  const botP  = names.slice(Math.ceil(n/2));

  // 建立資料
  bk = {
    players: names,
    top: buildHalfData(topP,  'T'),   // 上半區各輪
    bot: buildHalfData(botP,  'B'),   // 下半區各輪
    gf:  mkMatch('GF', null, null, false),   // 冠軍賽
    tp:  mkMatch('TP', null, null, false),   // 季軍賽
    ranking: {},
    // DOM 對應
    slotEls: {},   // matchId+slotKey → DOM el
    pathEls: {},   // 'fromId→toId' → SVG path el
  };

  renderBracket();

  switchInner('bracket','draw',null);
  const tabs=document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.remove('active'); tabs[1].classList.add('active');
}

function resetBracket() {
  bk=null;
  document.getElementById('bracketSlots').innerHTML='';
  const svg=document.getElementById('bracketSvg'); if(svg) svg.innerHTML='';
  document.getElementById('finalsArea').style.display='none';
}

// ── 建立半區資料：二維陣列 rounds[轮][场]
function buildHalfData(players, prefix) {
  const rounds=[];
  // 第一輪
  let r0=[];
  for(let i=0;i<players.length;i+=2){
    if(i+1<players.length) r0.push(mkMatch(`${prefix}-0-${r0.length}`, players[i], players[i+1], false));
    else                   r0.push(mkMatch(`${prefix}-0-${r0.length}`, players[i], null,          true));
  }
  rounds.push(r0);
  // 後續輪（全空格）
  let prev=r0.length;
  while(prev>1){
    const cnt=Math.ceil(prev/2);
    rounds.push(Array.from({length:cnt},(_,i)=>mkMatch(`${prefix}-${rounds.length}-${i}`, null, null, false)));
    prev=cnt;
  }
  return rounds;
}

function mkMatch(id, p1, p2, bye) {
  return { id, p1, p2, winner:null, bye };
}

// ═══════════════════════════════════════
//  RENDER — 完整渲染賽表
// ═══════════════════════════════════════
function renderBracket() {
  if (!bk) return;
  const slotsWrap = document.getElementById('bracketSlots');
  const svg       = document.getElementById('bracketSvg');
  slotsWrap.innerHTML = '';
  svg.innerHTML = '';
  bk.slotEls = {};
  bk.pathEls = {};

  // SVG defs（glow filter + gradient）
  svg.innerHTML = `<defs>
    <filter id="bkGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#e8c97a" stop-opacity=".7"/>
      <stop offset="50%"  stop-color="#c9a84c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#8c6e2a" stop-opacity=".7"/>
    </linearGradient>
  </defs>`;

  const BSW = getBsW(), BSH = getBsH();

  // ── 計算各輪的 y 偏移 ──
  // 上半區：由上往下，各輪場次中心 y 往中間靠攏
  // 下半區：由下往上，鏡像

  // 先算最大輪數
  const topRounds = bk.top.length;
  const botRounds = bk.bot.length;
  const maxRounds = Math.max(topRounds, botRounds);

  // 先算每輪每場的中心 y（相對於各半區的起始 y）
  // 使用遞迴：第0輪場次均分排列，後續輪取前一輪相鄰場的中心點
  function calcMatchCenters(rounds) {
    const centersPerRound = [];
    // 第0輪：場次均等排列
    const n0 = rounds[0].length;
    const r0 = [];
    for(let i=0;i<n0;i++){
      // 每場包含 2 格 + 1 vs線
      const matchH = BSH*2 + 2 + 4;  // p1槽 + vs線(2px) + p2槽 + margins
      r0.push(i * (matchH + MATCH_GAP) + matchH/2);
    }
    centersPerRound.push(r0);
    for(let ri=1;ri<rounds.length;ri++){
      const prev = centersPerRound[ri-1];
      const cur  = [];
      for(let mi=0;mi<rounds[ri].length;mi++){
        const a = prev[mi*2];
        const b = prev[mi*2+1] !== undefined ? prev[mi*2+1] : prev[mi*2];
        cur.push((a+b)/2);
      }
      centersPerRound.push(cur);
    }
    return centersPerRound;
  }

  const topCenters = calcMatchCenters(bk.top);
  const botCenters = calcMatchCenters(bk.bot);

  // 計算上半區總高度（第0輪所有場次）
  const topTotalH = calcHalfHeight(bk.top);
  const botTotalH = calcHalfHeight(bk.bot);

  function calcHalfHeight(rounds) {
    const n = rounds[0].length;
    const matchH = BSH*2 + 2 + 4;
    return n*(matchH + MATCH_GAP) - MATCH_GAP;
  }

  // 中間區高度
  const centerH = 160;  // 冠軍賽 + 季軍賽

  // 計算最多輪次各自的 x 位置
  // 上下半區都由外往中排列，輪次越後越靠中間
  // 左右對稱：左邊是上半的前幾輪，右邊是後幾輪（靠近中間）
  //   → 實際上我們做垂直排列，所以 x=固定，y 變化
  // 這裡改為：每輪是一「列」（水平），輪次越多往中間靠攏

  // 最終布局：
  //  x 軸 = 輪次列（第0輪在最外側，最後輪在最靠近中間）
  //  上半區 y 由上往下，下半區 y 由中往下（鏡像）

  // 每輪列的 x 起始位置
  function getRoundX(ri, totalRounds) {
    return ri * (BSW + COL_GAP);
  }

  // Canvas 寬度
  const halfCols  = Math.max(topRounds, botRounds);
  const canvasW   = halfCols*(BSW+COL_GAP)*2 + 240;  // 兩倍 + 中間決賽寬
  const canvasH   = topTotalH + centerH + botTotalH + 60;

  document.getElementById('bracketCanvas').style.width  = canvasW + 'px';
  document.getElementById('bracketCanvas').style.height = canvasH + 'px';
  svg.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);
  svg.setAttribute('width',  canvasW);
  svg.setAttribute('height', canvasH);

  // ── 上半區起始 y ──
  const topStartY = 20;
  // ── 中間決賽起始 y ──
  const centerY   = topStartY + topTotalH + 20;
  // ── 下半區起始 y ──
  const botStartY = centerY + centerH + 20;
  // ── 中間 x ──
  const centerX   = canvasW/2 - 95;

  // 渲染上半區（輪次從左到右：第0輪在左，最後輪靠近中間）
  renderHalf(slotsWrap, svg, bk.top, topCenters, topStartY, false, canvasW, BSW, BSH);
  // 渲染下半區（輪次從左到右，同上，但 y 反轉：從 botStartY 往下，與上半鏡像）
  renderHalf(slotsWrap, svg, bk.bot, botCenters, botStartY, true, canvasW, BSW, BSH);

  // 渲染中間決賽
  renderCenterFinals(slotsWrap, svg, centerX, centerY, BSW, BSH);

  // 輪空自動晉級
  setTimeout(() => autoAdvanceByes(), 80);
}

function renderHalf(container, svg, rounds, centers, startY, flipped, canvasW, BSW, BSH) {
  const totalRounds = rounds.length;

  rounds.forEach((round, ri) => {
    // x 位置：上半區第0輪在最左，最後輪在中間
    // 右半側鏡像，但我們只渲染一側（上下鏡像，不是左右）
    // 實際 x：左側從 0 開始，右側從 canvasW 開始往左
    // → 我們做雙側：左側是 ri 列，右側也是 ri 列（鏡像 x）
    // 為了簡化，這裡做「左右雙向」：上半區在 canvas 上半，下半在下半
    // 每輪的 x 從兩邊往中間靠攏

    const xLeft  = ri * (BSW + COL_GAP) + 16;
    const xRight = canvasW - (ri+1)*(BSW + COL_GAP) - 16;

    // 每場分配到左側或右側
    const leftMatches  = round.filter((_,i)=>i%2===0);
    const rightMatches = round.filter((_,i)=>i%2===1);

    // 渲染左側
    leftMatches.forEach((match, lmi) => {
      const mi     = lmi*2;
      const cy     = startY + (centers[ri][mi]||0);
      const x      = xLeft;
      renderMatchDOM(container, svg, match, x, cy - (BSH+2), BSW, BSH, flipped, ri, round, rounds);
    });
    // 渲染右側（鏡像 x）
    rightMatches.forEach((match, rmi) => {
      const mi     = rmi*2+1;
      const cy     = startY + (centers[ri][mi]||0);
      const x      = xRight;
      renderMatchDOM(container, svg, match, x, cy - (BSH+2), BSW, BSH, flipped, ri, round, rounds);
    });
  });

  // 畫連接線（每場 → 下一輪對應場）
  rounds.forEach((round, ri) => {
    if (ri >= rounds.length-1) return;
    round.forEach((match, mi) => {
      const nextMi   = Math.floor(mi/2);
      const nextMatch= rounds[ri+1][nextMi];
      if (!nextMatch) return;
      const toSlotKey= mi%2===0 ? 'p1' : 'p2';
      drawConnector(svg, match, nextMatch, toSlotKey);
    });
  });
}

function renderMatchDOM(container, svg, match, x, y, BSW, BSH, flipped, ri, round, rounds) {
  // p1 格子
  const slot1 = makeSlotEl(match, 'p1', BSW, BSH);
  slot1.style.left = x+'px';
  slot1.style.top  = y+'px';
  container.appendChild(slot1);
  bk.slotEls[match.id+'-p1'] = slot1;
  match._el = match._el||{};
  match._el.p1 = slot1;

  // p2 格子（輪空不顯示）
  if (!match.bye) {
    const slot2 = makeSlotEl(match, 'p2', BSW, BSH);
    slot2.style.left = x+'px';
    slot2.style.top  = (y + BSH + 4)+'px';
    container.appendChild(slot2);
    bk.slotEls[match.id+'-p2'] = slot2;
    match._el.p2 = slot2;

    // vs 分隔線（SVG 水平線）
    const midY = y + BSH + 2;
    const vs = document.createElementNS('http://www.w3.org/2000/svg','line');
    vs.setAttribute('x1', x+8); vs.setAttribute('x2', x+BSW-8);
    vs.setAttribute('y1', midY); vs.setAttribute('y2', midY);
    vs.setAttribute('stroke','rgba(201,168,76,0.25)'); vs.setAttribute('stroke-width','1.5');
    svg.appendChild(vs);
  }

  // 點擊事件（第一輪才加，後面輪等對手到齊再加）
  if (ri===0 && !match.bye && match.p1 && match.p2) {
    setSlotClickable(match, round, rounds);
  }
}

function makeSlotEl(match, slotKey, BSW, BSH) {
  const el   = document.createElement('div');
  el.className = 'br-slot dragon-border';
  el.style.cssText = `position:absolute;width:${BSW}px;height:${BSH}px;`;

  const player = match[slotKey];
  const isBye  = match.bye && slotKey==='p2';

  if (isBye) { el.classList.add('br-slot--hidden'); return el; }
  if (!player && !match.bye) el.classList.add('br-slot--empty');
  if (match.bye && slotKey==='p1') el.classList.add('br-slot--bye');

  el.innerHTML = `
    <span class="dragon-bl"></span>
    <span class="dragon-br"></span>
    <span class="br-win-bar"></span>
    <span class="br-slot-name${!player?' br-placeholder':''}">${player || (match.bye?'輪空':'待定')}</span>
  `;
  el.dataset.matchId = match.id;
  el.dataset.slot    = slotKey;
  return el;
}

function setSlotClickable(match, round, rounds) {
  if (!match._el) return;
  ['p1','p2'].forEach(key => {
    const el = match._el[key]; if(!el || match.bye) return;
    el.classList.add('br-slot--clickable');
    el.onclick = (e) => {
      e.stopPropagation();
      handlePickWinner(match, key, round, rounds);
    };
  });
}

// ── 點選勝者 ──
function handlePickWinner(match, winnerKey, round, rounds) {
  if (match.winner) return;
  const winner = match[winnerKey];
  const loserKey = winnerKey==='p1'?'p2':'p1';
  match.winner = winner;

  // 更新格子樣式
  if(match._el[winnerKey]) match._el[winnerKey].classList.add('br-slot--winner');
  if(match._el[loserKey])  match._el[loserKey].classList.add('br-slot--loser');
  match._el?.p1?.classList.remove('br-slot--clickable');
  match._el?.p2?.classList.remove('br-slot--clickable');
  if(match._el?.p1) match._el.p1.onclick=null;
  if(match._el?.p2) match._el.p2.onclick=null;

  // 找下一輪
  const mi       = round.indexOf(match);
  const nextMi   = Math.floor(mi/2);
  const toSlotKey= mi%2===0?'p1':'p2';
  const nextRi   = rounds.indexOf(round)+1;
  const nextRound= rounds[nextRi];
  const nextMatch= nextRound?.[nextMi];

  // 勝者線條動畫 → 填入下一格
  animateWinnerFlow(match, winnerKey, nextMatch, toSlotKey, winner, () => {
    if (nextMatch) {
      nextMatch[toSlotKey] = winner;
      fillSlot(nextMatch._el?.[toSlotKey], winner);
      // 判斷下一場是否可以點了
      if (nextMatch.p1 && nextMatch.p2 && !nextMatch.winner) {
        setSlotClickable(nextMatch, nextRound, rounds);
      }
      // 遞迴檢查是否到達準決賽
      checkSemiFinal(nextMatch, toSlotKey, nextRound, rounds, nextRi);
    } else {
      // 已是最後一輪，直接進決賽檢查
      checkSemiFinal(match, winnerKey, round, rounds, nextRi-1);
    }
  });
}

function checkSemiFinal(match, slotKey, round, rounds, ri) {
  if (ri !== rounds.length-1) return;
  if (!match.winner) return;

  const isSideTop = match.id.startsWith('T');
  const winner    = match.winner;
  const loser     = match.winner===match.p1 ? match.p2 : match.p1;

  const gfKey = isSideTop?'p1':'p2';
  const tpKey = isSideTop?'p1':'p2';

  bk.gf[gfKey] = winner;
  bk.tp[tpKey] = loser;

  fillSlot(bk.gf._el?.[gfKey], winner);
  fillSlot(bk.tp._el?.[tpKey], loser);

  if (bk.gf.p1 && bk.gf.p2) activateFinalMatch('gf');
  if (bk.tp.p1 && bk.tp.p2) activateFinalMatch('tp');
}

function activateFinalMatch(matchKey) {
  const match = bk[matchKey];
  ['p1','p2'].forEach(key=>{
    const el=match._el?.[key]; if(!el) return;
    el.classList.add('br-slot--clickable');
    el.onclick=()=>handlePickFinal(matchKey, key);
  });
}

function handlePickFinal(matchKey, winnerKey) {
  const match=bk[matchKey]; if(match.winner) return;
  match.winner=match[winnerKey];
  const loserKey=winnerKey==='p1'?'p2':'p1';
  match._el?.[winnerKey]?.classList.add('br-slot--winner');
  match._el?.[loserKey]?.classList.add('br-slot--loser');
  match._el?.p1?.classList.remove('br-slot--clickable');
  match._el?.p2?.classList.remove('br-slot--clickable');

  if(matchKey==='gf'){
    bk.ranking.first  = match.winner;
    bk.ranking.second = match[loserKey];
  } else {
    bk.ranking.third  = match.winner;
    bk.ranking.fourth = match[loserKey];
  }
  updateRankBoard();
  if(bk.ranking.first && bk.ranking.third) {
    setTimeout(()=>showFinalCelebration(), 600);
  }
}

// ── 決賽格子渲染 ──
function renderCenterFinals(container, svg, cx, cy, BSW, BSH) {
  const fw = Math.min(BSW+24, 184);
  const makeFS = (match, key, placeholder) => {
    const el=document.createElement('div');
    el.className='br-slot dragon-border br-final-slot';
    el.style.cssText=`position:absolute;width:${fw}px;height:${BSH+2}px;`;
    el.innerHTML=`<span class="dragon-bl"></span><span class="dragon-br"></span><span class="br-win-bar"></span><span class="br-slot-name br-placeholder">${placeholder}</span>`;
    if(!match._el) match._el={};
    match._el[key]=el;
    return el;
  };

  // 冠軍賽
  const gfY = cy;
  const gf1 = makeFS(bk.gf,'p1','待上半冠軍'); gf1.style.left=cx+'px'; gf1.style.top=gfY+'px'; container.appendChild(gf1);
  const gf2 = makeFS(bk.gf,'p2','待下半冠軍'); gf2.style.left=cx+'px'; gf2.style.top=(gfY+BSH+8)+'px'; container.appendChild(gf2);
  // vs label
  const gfVsEl=document.createElement('div');
  gfVsEl.style.cssText=`position:absolute;left:${cx}px;top:${gfY+BSH+1}px;width:${fw}px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:var(--text2);letter-spacing:2px;`;
  gfVsEl.textContent='VS'; container.appendChild(gfVsEl);
  // title
  const gfTitle=document.createElement('div');
  gfTitle.style.cssText=`position:absolute;left:${cx}px;top:${gfY-22}px;width:${fw}px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.88rem;font-weight:700;color:var(--gold-dk);`;
  gfTitle.textContent='🏆 冠軍賽'; container.appendChild(gfTitle);

  // 季軍賽
  const tpY = cy + BSH*2 + 36;
  const tp1 = makeFS(bk.tp,'p1','待上半落敗'); tp1.style.left=cx+'px'; tp1.style.top=tpY+'px'; container.appendChild(tp1);
  const tp2 = makeFS(bk.tp,'p2','待下半落敗'); tp2.style.left=cx+'px'; tp2.style.top=(tpY+BSH+8)+'px'; container.appendChild(tp2);
  const tpVsEl=document.createElement('div');
  tpVsEl.style.cssText=`position:absolute;left:${cx}px;top:${tpY+BSH+1}px;width:${fw}px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:var(--text2);letter-spacing:2px;`;
  tpVsEl.textContent='VS'; container.appendChild(tpVsEl);
  const tpTitle=document.createElement('div');
  tpTitle.style.cssText=`position:absolute;left:${cx}px;top:${tpY-20}px;width:${fw}px;text-align:center;font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:var(--gold-dk);`;
  tpTitle.textContent='🥉 季軍賽'; container.appendChild(tpTitle);

  // 排名牌
  const rankEl=document.createElement('div');
  rankEl.id='bkRankBoard'; rankEl.className='br-rank-board';
  rankEl.style.cssText=`position:absolute;left:${cx-10}px;top:${tpY+BSH*2+24}px;width:${fw+20}px;display:none;`;
  container.appendChild(rankEl);
}

function drawConnector(svg, fromMatch, toMatch, toSlotKey) {
  if (!fromMatch._el || !toMatch._el) return;
  const fromEl = fromMatch._el.p1;  // 從哪個格子出發（使用 p1 槽做定位基準）
  const toEl   = toMatch._el[toSlotKey];
  if (!fromEl || !toEl) return;

  const canvas  = document.getElementById('bracketCanvas');
  const cRect   = canvas.getBoundingClientRect();
  const fRect   = fromEl.getBoundingClientRect();
  const tRect   = toEl.getBoundingClientRect();

  // 起點：from 格子的右中（或底中，因為我們是垂直排列）
  // 連接方式：從 from 場次中心 → to 格子中心
  const fromCY = fRect.top  - cRect.top + fRect.height/2 + (fromMatch._el.p2 ? fRect.height/2+2 : 0);
  const fromCX = fRect.left - cRect.left + fRect.width/2;
  const toCX   = tRect.left - cRect.left + tRect.width/2;
  const toCY   = tRect.top  - cRect.top  + tRect.height/2;

  // 用貝塞爾曲線連接
  const mx = (fromCX+toCX)/2;
  const my = (fromCY+toCY)/2;

  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  const d = `M ${fromCX} ${fromCY} C ${fromCX} ${my}, ${toCX} ${my}, ${toCX} ${toCY}`;
  path.setAttribute('d', d);
  path.classList.add('bc-line');
  path.dataset.from=fromMatch.id;
  path.dataset.to  =toMatch.id+'-'+toSlotKey;
  svg.appendChild(path);

  // 儲存路徑
  if (!fromMatch._paths) fromMatch._paths={};
  fromMatch._paths[toMatch.id+'-'+toSlotKey]=path;
  bk.pathEls[fromMatch.id+'→'+toMatch.id+'-'+toSlotKey]=path;
}

// ── 動畫：金色光流沿路徑飛行 → 填入名字 ──
function animateWinnerFlow(fromMatch, winnerKey, toMatch, toSlotKey, winnerName, callback) {
  // 先讓勝者格子路徑變金色
  if (toMatch && fromMatch._paths) {
    const pathKey = toMatch.id+'-'+toSlotKey;
    const pathEl  = fromMatch._paths[pathKey];
    if (pathEl) {
      pathEl.classList.add('bc-line--win');
      // 建立飛行光點
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('r','5');
      dot.setAttribute('fill','url(#goldGrad)');
      dot.setAttribute('filter','url(#bkGlow)');
      const svgEl=document.getElementById('bracketSvg');
      svgEl.appendChild(dot);

      const totalLen=pathEl.getTotalLength();
      let start=null;
      const dur=500;
      function step(ts){
        if(!start) start=ts;
        const p=Math.min((ts-start)/dur,1);
        const pt=pathEl.getPointAtLength(p*totalLen);
        dot.setAttribute('cx',pt.x); dot.setAttribute('cy',pt.y);
        if(p<1) requestAnimationFrame(step);
        else {
          dot.remove();
          flashSlot(toMatch?._el?.[toSlotKey], callback);
        }
      }
      requestAnimationFrame(step);
      return;
    }
  }
  // 沒路徑就直接閃光
  flashSlot(toMatch?._el?.[toSlotKey], callback);
}

function flashSlot(el, callback) {
  if(!el){ callback?.(); return; }
  el.classList.add('br-slot--flash');
  setTimeout(()=>{ el.classList.remove('br-slot--flash'); callback?.(); }, 450);
}

function fillSlot(el, name) {
  if(!el) return;
  const nameEl=el.querySelector('.br-slot-name'); if(!nameEl) return;
  nameEl.style.opacity='0';
  nameEl.textContent=name;
  nameEl.classList.remove('br-placeholder');
  requestAnimationFrame(()=>{
    nameEl.style.transition='opacity .38s ease';
    nameEl.style.opacity='1';
  });
}

function autoAdvanceByes() {
  ['top','bot'].forEach(side=>{
    bk[side][0].forEach((match,mi)=>{
      if(match.bye && match.p1 && !match.winner){
        setTimeout(()=>handlePickWinner(match,'p1',bk[side][0],bk[side]), 100+mi*60);
      }
    });
  });
}

function updateRankBoard() {
  const el=document.getElementById('bkRankBoard'); if(!el) return;
  const r=bk.ranking;
  const medals=[{k:'first',i:'🥇',l:'冠軍'},{k:'second',i:'🥈',l:'亞軍'},{k:'third',i:'🥉',l:'季軍'},{k:'fourth',i:'4️⃣',l:'殿軍'}];
  if(!medals.some(m=>r[m.k])){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML=`<div class="br-rank-title">🎖️ 目前排名</div>`+
    medals.filter(m=>r[m.k]).map(m=>`<div class="br-rank-row"><span class="br-rank-icon">${m.i}</span><span class="br-rank-lbl">${m.l}</span><span class="br-rank-name">${r[m.k]}</span></div>`).join('');
  // 同步顯示頂部排名牌
  const fa=document.getElementById('finalsArea');
  if(r.first&&r.second&&r.third&&r.fourth){
    fa.style.display='';
    fa.innerHTML=`<div class="finals-grid">
      ${medals.map(m=>`<div class="final-rank-card"><div class="final-rank-medal">${m.i}</div><div class="final-rank-lbl">${m.l}</div><div class="final-rank-name">${r[m.k]||'—'}</div></div>`).join('')}
    </div>`;
  }
}

function showFinalCelebration() {
  const r=bk.ranking;
  document.getElementById('victoryName').textContent=r.first||'—';
  document.getElementById('victoryScore').textContent=`🥈 ${r.second||'—'}　🥉 ${r.third||'—'}　4️⃣ ${r.fourth||'—'}`;
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}

// ═══════════════════════════════════════
//  PARTS DB
// ═══════════════════════════════════════
const CAT_LABELS = { blade:'鋼鐵戰刃', ratchet:'固鎖輪盤', bit:'軸心' };
const CX_MOD_LABELS = { emblem:'聖獸紋章', mainBlade:'主要戰刃', subBlade:'輔助戰刃', overBlade:'超越戰刃' };
let addForm = { cat:'blade', series:'BX' };

function initAddForm() {
  addForm={cat:'blade',series:'BX'};
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active',b.dataset.cat==='blade'));
  document.querySelectorAll('.series-btn').forEach(b=>b.classList.toggle('active',b.dataset.series==='BX'));
  updateAddFormUI(); refreshCxSelects();
}
function selectCat(cat,btn) {
  addForm.cat=cat;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); updateAddFormUI();
}
function selectSeries(series,btn) {
  addForm.series=series;
  document.querySelectorAll('.series-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); updateAddFormUI();
}
function updateAddFormUI() {
  const isBlade=addForm.cat==='blade', isCX=addForm.series==='CX';
  document.getElementById('seriesGroup').style.display=isBlade?'':'none';
  document.getElementById('cxModGroup').style.display=(isBlade&&isCX)?'':'none';
  document.getElementById('nameLabel').textContent=
    isBlade?(isCX?'④ 鋼鐵戰刃名稱（母體）':'③ 鋼鐵戰刃名稱'):
    (addForm.cat==='ratchet'?'② 固鎖輪盤名稱':'② 軸心名稱');
  document.getElementById('spinGroup').style.display=isBlade?'':'none';
}
function openAddCxMod() { renderCxModList(); document.getElementById('cxModModal').classList.add('show'); }
function addCxMod() {
  const type=document.getElementById('cxModType').value;
  const name=document.getElementById('cxModName').value.trim();
  if(!name){showToast('請輸入改造零件名稱','error');return;}
  state.cxMods.push({id:Date.now(),type,name,note:document.getElementById('cxModNote')?.value||'',uses:0});
  save(); document.getElementById('cxModName').value=''; renderCxModList();
  showToast(`✅ ${CX_MOD_LABELS[type]}「${name}」已新增！`,'success');
}
function renderCxModList() {
  const el=document.getElementById('cxModList'); if(!el) return;
  if(!state.cxMods.length){el.innerHTML='<div style="color:var(--text2);font-size:.8rem;">尚無改造零件</div>';return;}
  el.innerHTML=state.cxMods.map(m=>`
    <div class="cx-mod-list-item">
      <div><span class="cx-type-tag">${CX_MOD_LABELS[m.type]||m.type}</span><span style="margin-left:7px;font-weight:700;">${m.name}</span></div>
      <button class="btn-icon" onclick="deleteCxMod(${m.id})">🗑</button>
    </div>`).join('');
}
function deleteCxMod(id){ state.cxMods=state.cxMods.filter(m=>m.id!==id); save(); renderCxModList(); refreshCxSelects(); }
function refreshCxSelects() {
  [['cxEmblem','emblem'],['cxMainBlade','mainBlade'],['cxSubBlade','subBlade'],['cxOverBlade','overBlade']].forEach(([selId,typeKey])=>{
    const el=document.getElementById(selId); if(!el) return;
    const cur=el.value;
    el.innerHTML=`<option value="">— 未使用 —</option>`+state.cxMods.filter(m=>m.type===typeKey).map(m=>`<option value="${m.id}"${m.id==cur?' selected':''}>${m.name}</option>`).join('');
  });
}
function addPart() {
  const name=document.getElementById('newPartName').value.trim();
  if(!name){showToast('請輸入零件名稱','error');return;}
  const part={
    id:Date.now(), name, cat:addForm.cat,
    series:addForm.cat==='blade'?addForm.series:null,
    spin:addForm.cat==='blade'?document.getElementById('newPartSpin').value:null,
    note:document.getElementById('newPartNote').value, cxMods:{}, uses:0,
  };
  if(addForm.cat==='blade'&&addForm.series==='CX'){
    part.cxMods={
      emblem:   document.getElementById('cxEmblem').value||null,
      mainBlade:document.getElementById('cxMainBlade').value||null,
      subBlade: document.getElementById('cxSubBlade').value||null,
      overBlade:document.getElementById('cxOverBlade').value||null,
    };
  }
  state.parts.push(part); save();
  showToast(`✅ ${CAT_LABELS[addForm.cat]}「${name}」已新增！`,'success');
  document.getElementById('newPartName').value='';
  document.getElementById('newPartNote').value='';
  refreshCxSelects(); renderParts();
}
function renderParts() {
  const search=(document.getElementById('partSearch')?.value||'').toLowerCase();
  const catF=document.getElementById('partCatFilter')?.value||'';
  const seriesF=document.getElementById('partSeriesFilter')?.value||'';
  const filtered=state.parts.filter(p=>(!search||p.name.toLowerCase().includes(search))&&(!catF||p.cat===catF)&&(!seriesF||p.series===seriesF));
  const grid=document.getElementById('partsGrid'); if(!grid) return;
  if(!filtered.length){grid.innerHTML='<div class="empty-state"><div class="empty-icon">📦</div><div>尚無零件</div></div>';return;}
  grid.innerHTML=filtered.map(p=>{
    let cxInfo='';
    if(p.cat==='blade'&&p.series==='CX'&&p.cxMods){
      const mods=Object.entries(p.cxMods).filter(([,v])=>v).map(([k,id])=>{const m=state.cxMods.find(m=>m.id==id);return m?`${CX_MOD_LABELS[k]}：${m.name}`:null;}).filter(Boolean);
      if(mods.length) cxInfo=`<div style="font-size:.7rem;color:var(--text2);margin-top:4px;">${mods.join(' / ')}</div>`;
    }
    return `<div class="part-card" onclick="showPart(${p.id})">
      <div class="part-card-top"><div class="part-name">${p.name}</div><div class="part-uses">×${p.uses||0}</div></div>
      <div class="part-tags">
        <span class="badge badge-${p.cat}">${CAT_LABELS[p.cat]||p.cat}</span>
        ${p.series?`<span class="badge badge-${p.series.toLowerCase()}">${p.series}</span>`:''}
        ${p.spin?`<span class="badge" style="background:rgba(120,110,90,0.1);color:var(--text2);border:1px solid var(--border);">${p.spin}</span>`:''}
      </div>${cxInfo}${p.note?`<div style="font-size:.7rem;color:var(--text2);margin-top:3px;">${p.note}</div>`:''}
    </div>`;
  }).join('');
}
let currentPartId=null;
function showPart(id) {
  currentPartId=id; const p=state.parts.find(p=>p.id===id); if(!p) return;
  document.getElementById('partModalTitle').textContent=p.name;
  let cxSection='';
  if(p.cat==='blade'&&p.series==='CX'&&p.cxMods){
    const rows=Object.entries(p.cxMods).map(([k,id])=>{
      const m=id?state.cxMods.find(m=>m.id==id):null;
      return `<div class="part-detail-item"><div class="form-label">${CX_MOD_LABELS[k]}</div><div>${m?m.name:'未使用'}</div></div>`;
    });
    cxSection=`<div style="margin-top:10px;font-size:.72rem;font-weight:700;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">CX 改造配件</div><div class="part-detail-grid">${rows.join('')}</div>`;
  }
  document.getElementById('partModalContent').innerHTML=`
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">
      <span class="badge badge-${p.cat}">${CAT_LABELS[p.cat]||p.cat}</span>
      ${p.series?`<span class="badge badge-${p.series.toLowerCase()}">${p.series}</span>`:''}
      ${p.spin?`<span class="badge" style="background:rgba(120,110,90,0.1);color:var(--text2);border:1px solid var(--border);">${p.spin}</span>`:''}
    </div>
    <div class="part-detail-grid">
      <div class="part-detail-item"><div class="form-label">使用次數</div><div style="font-family:Rajdhani;font-size:1.4rem;font-weight:700;color:var(--gold-dk);">${p.uses||0}</div></div>
      ${p.note?`<div class="part-detail-item"><div class="form-label">備注</div><div style="font-size:.83rem;">${p.note}</div></div>`:''}
    </div>${cxSection}`;
  document.getElementById('partModal').classList.add('show');
}
function deletePart(){ state.parts=state.parts.filter(p=>p.id!==currentPartId); save(); renderParts(); closeModal('partModal'); showToast('零件已刪除','error'); }
function renderPartStats() {
  const bl=state.parts.filter(p=>p.cat==='blade').length;
  const ra=state.parts.filter(p=>p.cat==='ratchet').length;
  const bi=state.parts.filter(p=>p.cat==='bit').length;
  const cx=state.cxMods.length;
  const tu=state.parts.reduce((a,p)=>a+(p.uses||0),0);
  document.getElementById('partStatsCards').innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${state.parts.length}</div><div class="stat-card-label">零件總數</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${bl}</div><div class="stat-card-label">鋼鐵戰刃</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--blue);">${ra}</div><div class="stat-card-label">固鎖輪盤</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${bi}</div><div class="stat-card-label">軸心</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--accent);">${cx}</div><div class="stat-card-label">CX改造</div></div>
    <div class="stat-card"><div class="stat-card-val">${tu}</div><div class="stat-card-label">總使用次數</div></div>`;
  const tc={blade:bl,ratchet:ra,bit:bi};
  const maxT=Math.max(1,...Object.values(tc));
  document.getElementById('partTypeChart').innerHTML=Object.entries(tc).map(([k,v])=>`<div class="bar-row"><div class="bar-label">${CAT_LABELS[k]}</div><div class="bar-track"><div class="bar-fill" style="width:${v/maxT*100}%"></div></div><div class="bar-val">${v}</div></div>`).join('');
  const sorted=[...state.parts].sort((a,b)=>(b.uses||0)-(a.uses||0)).slice(0,10);
  const maxU=Math.max(1,sorted[0]?.uses||0);
  document.getElementById('partUsageChart').innerHTML=sorted.length?sorted.map(p=>`<div class="bar-row"><div class="bar-label">${p.name}</div><div class="bar-track"><div class="bar-fill" style="width:${(p.uses||0)/maxU*100}%"></div></div><div class="bar-val">${p.uses||0}</div></div>`).join(''):'<div style="color:var(--text2);">暫無數據</div>';
}

// ═══════════════════════════════════════
//  SAVE MATCH
// ═══════════════════════════════════════
let matchConfigs={p1:{},p2:{}};
function saveMatch() {
  const p1n=document.getElementById('p1name').value||'選手 A';
  const p2n=document.getElementById('p2name').value||'選手 B';
  document.getElementById('saveP1Label').textContent=p1n;
  document.getElementById('saveP2Label').textContent=p2n;
  matchConfigs={p1:{},p2:{}};
  buildMCUI('p1'); buildMCUI('p2');
  document.getElementById('saveMatchModal').classList.add('show');
}
function buildMCUI(player) {
  const el=document.getElementById(player==='p1'?'configBuilderP1':'configBuilderP2');
  const mkRow=(cat,label)=>{
    const parts=state.parts.filter(p=>p.cat===cat);
    if(!parts.length) return `<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚無零件</div></div>`;
    return `<div class="config-step"><div class="config-step-label">${label}</div>
      <select class="form-select" style="padding:7px 12px;font-size:.8rem;" onchange="matchConfigs['${player}']['${cat}']=this.value">
        <option value="">— 未使用 —</option>
        ${parts.map(p=>`<option value="${p.id}">${p.name}${p.series?' ('+p.series+')':''}</option>`).join('')}
      </select></div>`;
  };
  el.innerHTML=mkRow('blade','鋼鐵戰刃')+mkRow('ratchet','固鎖輪盤')+mkRow('bit','軸心');
}
function confirmSaveMatch() {
  const p1n=document.getElementById('p1name').value||'選手 A';
  const p2n=document.getElementById('p2name').value||'選手 B';
  const winner=scores[0]>=scores[1]?p1n:p2n;
  const ids=cfg=>Object.values(cfg).filter(Boolean);
  state.matches.unshift({id:Date.now(),date:new Date().toLocaleString('zh-TW'),p1:p1n,p2:p2n,s1:scores[0],s2:scores[1],winner,p1Config:{...matchConfigs.p1},p2Config:{...matchConfigs.p2},p1Parts:ids(matchConfigs.p1),p2Parts:ids(matchConfigs.p2)});
  [...ids(matchConfigs.p1),...ids(matchConfigs.p2)].forEach(pid=>{const p=state.parts.find(p=>p.id==pid);if(p)p.uses=(p.uses||0)+1;});
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
  pLogConfig=entry?.config?{...entry.config}:{};
  renderPLogConfig();
  document.getElementById('personalFormModal').classList.add('show');
}
function renderPLogConfig() {
  const el=document.getElementById('pLogConfigArea');
  const mkSel=(cat,label)=>{
    const parts=state.parts.filter(p=>p.cat===cat);
    if(!parts.length) return `<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚無零件</div></div>`;
    return `<div class="config-step"><div class="config-step-label">${label}</div>
      <select class="form-select" style="padding:7px 12px;font-size:.8rem;" onchange="pLogConfig['${cat}']=this.value">
        <option value="">— 未使用 —</option>
        ${parts.map(p=>`<option value="${p.id}"${pLogConfig[cat]==p.id?' selected':''}>${p.name}${p.series?' ('+p.series+')':''}</option>`).join('')}
      </select></div>`;
  };
  el.innerHTML=mkSel('blade','鋼鐵戰刃')+mkSel('ratchet','固鎖輪盤')+mkSel('bit','軸心');
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
function deletePersonalLog(id){
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
  const cfgStr=cfg=>cfg?['blade','ratchet','bit'].map(k=>cfg[k]?pn(cfg[k]):'').filter(Boolean).join(' / '):'—';
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
function renderAnalysis(){ renderConfigAnalysis(); renderPartsAnalysis(); }
function renderConfigAnalysis() {
  const el=document.getElementById('analysisConfig'); if(!el) return;
  const pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const cfgKey=cfg=>{if(!cfg)return null;const n=['blade','ratchet','bit'].map(k=>cfg[k]?pn(cfg[k]):'').filter(Boolean);return n.length?n.join(' / '):null;};
  const cs={};
  const add=(cfg,won)=>{const k=cfgKey(cfg);if(!k)return;if(!cs[k])cs[k]={key:k,wins:0,total:0};cs[k].total++;if(won)cs[k].wins++;};
  state.matches.forEach(m=>{add(m.p1Config,m.winner===m.p1);add(m.p2Config,m.winner===m.p2);});
  state.personalLogs.forEach(l=>{add(l.config,l.result==='win');});
  const rows=Object.values(cs).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">📊 比賽場次不足</div>';return;}
  el.innerHTML=`<div class="analysis-section-title">配置勝率排行</div>
    <table class="analysis-table"><thead><tr><th>#</th><th>配置</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead>
    <tbody>${rows.map((r,i)=>{const wr=Math.round(r.wins/r.total*100);const cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';
      return `<tr><td style="color:var(--text2);">${i+1}</td><td>${r.key}</td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td><td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}
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
        return `<tr><td style="color:var(--text2);">${i+1}</td><td><strong>${r.name}</strong></td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td><td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}
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
  const rows=state.personalLogs.map(l=>[l.date,l.opponent,rl[l.result]||l.result,l.myScore,l.oppScore,pn(l.config?.blade),pn(l.config?.ratchet),pn(l.config?.bit),l.note||'']);
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
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
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