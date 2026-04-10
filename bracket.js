/**
 * BeyWarrior — 晉級賽模組
 * 製作人：OK
 * bracket.js
 *
 * 架構：
 *  - 完全對稱雙向賽表，左右各一半選手
 *  - 所有格子預先渲染，用 SVG 連接線連起來
 *  - 點擊勝者 → 金色光流沿線流動 → 名字填入晉級格
 *  - 中間：冠軍賽 + 季軍賽 + 最終排名
 *  - 每個格子有龍刺 CSS 邊框裝飾
 */

// ═══════════════════════════════════════
//  設定常數
// ═══════════════════════════════════════
const BR = {
  SLOT_W:   160,   // 格子寬度 px
  SLOT_H:    42,   // 格子高度 px
  SLOT_GAP:  10,   // 同場兩格間距（上下選手）
  ROUND_GAP: 60,   // 輪次水平間距
  // 垂直間距會依輪次指數增長，形成階梯
  BASE_V_GAP: 16,  // 第一輪垂直場間距
};

// ═══════════════════════════════════════
//  資料結構
// ═══════════════════════════════════════

/**
 * bracketData = {
 *   players: string[],
 *   left: Round[],   // 左半區各輪
 *   right: Round[],  // 右半區各輪
 *   grandFinal: Match,
 *   thirdPlace: Match,
 *   ranking: { first, second, third, fourth },
 * }
 *
 * Round = Match[]
 * Match = {
 *   id: string,        // 唯一 id，例如 'L-0-3'（左半區第0輪第3場）
 *   p1: string|null,   // 上方選手名稱（null=待定）
 *   p2: string|null,   // 下方選手名稱（null=待定）
 *   winner: string|null,
 *   bye: boolean,      // 是否輪空
 *   // 渲染後填入的 DOM 位置（用於動畫）
 *   _el: { p1, p2, next },  // DOM 元素參考
 * }
 */
let bracketData = null;

// ═══════════════════════════════════════
//  PUBLIC：生成賽表
// ═══════════════════════════════════════
function generateBracket() {
  const n = Math.min(1000, Math.max(2, parseInt(document.getElementById('playerCount').value) || 2));
  let names = [...document.querySelectorAll('#playerListEditor input')].map((el, i) => el.value || `選手${i+1}`);
  // shuffle
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  names = names.slice(0, n);

  // 分左右
  const half    = Math.ceil(n / 2);
  const leftP   = names.slice(0, half);
  const rightP  = names.slice(half);

  bracketData = {
    players: names,
    left:  buildHalfRounds(leftP,  'L'),
    right: buildHalfRounds(rightP, 'R'),
    grandFinal:  { id:'GF', p1:null, p2:null, winner:null, bye:false, _el:{} },
    thirdPlace:  { id:'TP', p1:null, p2:null, winner:null, bye:false, _el:{} },
    ranking: {},
  };

  renderBracketFull();

  // 切換到賽表頁
  switchInner('bracket', 'draw', null);
  const tabs = document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.remove('active');
  tabs[1].classList.add('active');
}

function resetBracket() {
  bracketData = null;
  document.getElementById('bracketScroll').innerHTML = '';
  document.getElementById('finalsArea').style.display = 'none';
}

// ═══════════════════════════════════════
//  建立某半區的所有輪次資料
//  預先建立所有「待定」格子
// ═══════════════════════════════════════
function buildHalfRounds(players, prefix) {
  const rounds = [];

  // 第一輪：兩兩配對，奇數尾輪空
  let round0 = [];
  for (let i = 0; i < players.length; i += 2) {
    if (i + 1 < players.length) {
      round0.push(makeMatch(`${prefix}-0-${round0.length}`, players[i], players[i+1], false));
    } else {
      // 奇數：輪空
      round0.push(makeMatch(`${prefix}-0-${round0.length}`, players[i], null, true));
    }
  }
  rounds.push(round0);

  // 後續輪次：依上一輪場數推算，全部填 null（待定）
  let prevCount = round0.length;
  while (prevCount > 1) {
    const nextCount = Math.ceil(prevCount / 2);
    const round = [];
    for (let i = 0; i < nextCount; i++) {
      round.push(makeMatch(`${prefix}-${rounds.length}-${i}`, null, null, false));
    }
    rounds.push(round);
    prevCount = nextCount;
  }

  return rounds;
}

function makeMatch(id, p1, p2, bye) {
  return { id, p1, p2, winner: null, bye, _el: {} };
}

// ═══════════════════════════════════════
//  渲染整個賽表
// ═══════════════════════════════════════
function renderBracketFull() {
  if (!bracketData) return;

  const scroll  = document.getElementById('bracketScroll');
  scroll.innerHTML = '';

  // 外層用相對定位容器承接 SVG 連接線
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative; display:flex; align-items:flex-start; gap:0;';

  // ── 左半區 ──
  const leftWrap = document.createElement('div');
  leftWrap.style.cssText = 'display:flex; flex-direction:row; position:relative;';
  renderHalf(leftWrap, bracketData.left, 'left');

  // ── 中間（冠軍賽 + 季軍賽）──
  const center = renderCenter();

  // ── 右半區（反向排列，最後一輪靠近中心）──
  const rightWrap = document.createElement('div');
  rightWrap.style.cssText = 'display:flex; flex-direction:row-reverse; position:relative;';
  renderHalf(rightWrap, bracketData.right, 'right');

  wrapper.appendChild(leftWrap);
  wrapper.appendChild(center);
  wrapper.appendChild(rightWrap);
  scroll.appendChild(wrapper);

  // 畫 SVG 連接線（在 DOM ready 後執行）
  requestAnimationFrame(() => {
    drawAllConnectors(leftWrap,  bracketData.left,  'left');
    drawAllConnectors(rightWrap, bracketData.right, 'right');
    drawFinalConnectors();
    // 輪空自動晉級
    autoAdvanceByes();
  });
}

// ═══════════════════════════════════════
//  渲染一個半區
// ═══════════════════════════════════════
function renderHalf(container, rounds, side) {
  rounds.forEach((round, ri) => {
    const col = document.createElement('div');
    col.className = 'br-round-col';
    col.dataset.side  = side;
    col.dataset.round = ri;

    // 輪次標題
    const label = document.createElement('div');
    label.className = 'br-round-label';
    label.textContent = getRoundLabel(ri, rounds.length, bracketData[side === 'left' ? 'left' : 'right'].length);
    col.appendChild(label);

    // 格子容器
    const slots = document.createElement('div');
    slots.className = 'br-slots-wrap';

    // 計算這輪的垂直間距（越後面輪次間距越大）
    const vGap = BR.BASE_V_GAP * Math.pow(2, ri);
    slots.style.gap = vGap + 'px';

    round.forEach((match, mi) => {
      const matchEl = renderMatch(match, side, ri, mi);
      slots.appendChild(matchEl);
    });

    col.appendChild(slots);
    container.appendChild(col);
  });
}

// ═══════════════════════════════════════
//  渲染單場比賽（兩個格子 + 龍刺裝飾）
// ═══════════════════════════════════════
function renderMatch(match, side, roundIdx, matchIdx) {
  const wrap = document.createElement('div');
  wrap.className = 'br-match';
  wrap.dataset.matchId = match.id;

  const makeSlot = (player, slotKey) => {
    const el = document.createElement('div');
    el.className = 'br-slot dragon-border';
    el.dataset.matchId = match.id;
    el.dataset.slot    = slotKey;

    // 龍刺裝飾容器（CSS pseudo 做不到複雜角落，改用 span 覆蓋）
    el.innerHTML = `
      <span class="dragon-tl"></span>
      <span class="dragon-tr"></span>
      <span class="dragon-bl"></span>
      <span class="dragon-br"></span>
      <span class="br-slot-name">${player || ''}</span>
    `;

    if (!player && !match.bye) {
      el.classList.add('br-slot--empty');
    }
    if (match.bye && slotKey === 'p2') {
      el.classList.add('br-slot--hidden');
    }

    // 可點擊：第一輪雙方都有名字，且尚未決定勝者
    const canClick = roundIdx === 0 && !match.winner && !match.bye && match.p1 && match.p2;
    if (canClick) {
      el.classList.add('br-slot--clickable');
      el.onclick = () => handlePickWinner(match, side, roundIdx, matchIdx, slotKey);
    }

    match._el[slotKey] = el;
    return el;
  };

  const slot1 = makeSlot(match.p1, 'p1');
  wrap.appendChild(slot1);

  // 中間 vs 分隔
  if (!match.bye) {
    const vs = document.createElement('div');
    vs.className = 'br-vs-divider';
    wrap.appendChild(vs);
    const slot2 = makeSlot(match.p2, 'p2');
    wrap.appendChild(slot2);
  }

  return wrap;
}

// ═══════════════════════════════════════
//  龍刺邊框（CSS class 定義在 style.css）
//  這裡只做 DOM，樣式在 CSS
// ═══════════════════════════════════════

// ═══════════════════════════════════════
//  渲染中間決賽區
// ═══════════════════════════════════════
function renderCenter() {
  const center = document.createElement('div');
  center.id    = 'bracketCenter';
  center.className = 'br-center';

  // 冠軍賽
  const gfLabel = document.createElement('div');
  gfLabel.className = 'br-center-label';
  gfLabel.innerHTML = '🏆 冠軍賽';
  center.appendChild(gfLabel);

  const gfWrap = document.createElement('div');
  gfWrap.className = 'br-final-wrap';
  gfWrap.id = 'gfWrap';

  const gfSlot1 = makeFinalSlot('GF', 'p1', '待左半冠軍');
  const gfVs    = document.createElement('div');
  gfVs.className = 'br-center-vs'; gfVs.textContent = 'VS';
  const gfSlot2 = makeFinalSlot('GF', 'p2', '待右半冠軍');

  bracketData.grandFinal._el.p1 = gfSlot1;
  bracketData.grandFinal._el.p2 = gfSlot2;

  gfWrap.appendChild(gfSlot1);
  gfWrap.appendChild(gfVs);
  gfWrap.appendChild(gfSlot2);
  center.appendChild(gfWrap);

  // 間距
  const spacer = document.createElement('div');
  spacer.style.height = '24px';
  center.appendChild(spacer);

  // 季軍賽
  const tpLabel = document.createElement('div');
  tpLabel.className = 'br-center-label';
  tpLabel.style.fontSize = '.78rem';
  tpLabel.innerHTML = '🥉 季軍賽';
  center.appendChild(tpLabel);

  const tpWrap = document.createElement('div');
  tpWrap.className = 'br-final-wrap';
  tpWrap.id = 'tpWrap';

  const tpSlot1 = makeFinalSlot('TP', 'p1', '待半決賽落敗');
  const tpVs    = document.createElement('div');
  tpVs.className = 'br-center-vs'; tpVs.textContent = 'VS';
  const tpSlot2 = makeFinalSlot('TP', 'p2', '待半決賽落敗');

  bracketData.thirdPlace._el.p1 = tpSlot1;
  bracketData.thirdPlace._el.p2 = tpSlot2;

  tpWrap.appendChild(tpSlot1);
  tpWrap.appendChild(tpVs);
  tpWrap.appendChild(tpSlot2);
  center.appendChild(tpWrap);

  // 排名顯示區（初始隱藏）
  const rankWrap = document.createElement('div');
  rankWrap.id = 'rankDisplay';
  rankWrap.className = 'br-rank-display';
  rankWrap.style.display = 'none';
  center.appendChild(rankWrap);

  return center;
}

function makeFinalSlot(matchType, slotKey, placeholder) {
  const el = document.createElement('div');
  el.className = 'br-slot br-final-slot dragon-border';
  el.innerHTML = `
    <span class="dragon-tl"></span>
    <span class="dragon-tr"></span>
    <span class="dragon-bl"></span>
    <span class="dragon-br"></span>
    <span class="br-slot-name br-placeholder">${placeholder}</span>
  `;
  el.dataset.matchType = matchType;
  el.dataset.slot      = slotKey;
  return el;
}

// ═══════════════════════════════════════
//  SVG 連接線
// ═══════════════════════════════════════

/**
 * 在 container 內疊加一層 SVG，畫出所有連接線
 * 每場比賽 → 下一輪對應場次
 */
function drawAllConnectors(container, rounds, side) {
  // 建立 SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = `
    position:absolute; top:0; left:0;
    width:${container.scrollWidth}px;
    height:${container.scrollHeight}px;
    pointer-events:none; overflow:visible; z-index:1;
  `;
  container.style.position = 'relative';
  container.appendChild(svg);

  // 定義漸層（勝者光流用）
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="goldFlow-${side}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#e8c97a" stop-opacity="0.8"/>
      <stop offset="50%"  stop-color="#c9a84c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#8c6e2a" stop-opacity="0.8"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  rounds.forEach((round, ri) => {
    if (ri >= rounds.length - 1) return; // 最後一輪不需畫（連到中間決賽）

    round.forEach((match, mi) => {
      const nextMatchIdx = Math.floor(mi / 2);
      const nextMatch    = rounds[ri + 1]?.[nextMatchIdx];
      if (!nextMatch) return;

      // 勝者格子的目標槽（mi 偶數→p1，mi 奇數→p2）
      const targetSlotKey = mi % 2 === 0 ? 'p1' : 'p2';

      // 畫線：從 match 的中心右側 → nextMatch 的目標槽左側
      drawConnectorLine(svg, match, nextMatch, targetSlotKey, side, ri, mi, container);
    });
  });
}

function drawConnectorLine(svg, fromMatch, toMatch, toSlotKey, side, ri, mi, container) {
  const containerRect = container.getBoundingClientRect();

  // 從哪個格子出發（優先看 p1，如果輪空只有 p1）
  const fromSlotEl = fromMatch._el.p1 || fromMatch._el.p2;
  const toSlotEl   = toMatch._el[toSlotKey];

  if (!fromSlotEl || !toSlotEl) return;

  const fromRect = fromSlotEl.getBoundingClientRect();
  const toRect   = toSlotEl.getBoundingClientRect();

  const scrollLeft = container.scrollLeft || 0;
  const scrollTop  = container.scrollTop  || 0;

  // 左半區：從右側出發，往右連
  // 右半區：從左側出發，往左連
  const isLeft = side === 'left';

  const x1 = isLeft
    ? fromRect.right  - containerRect.left + scrollLeft
    : fromRect.left   - containerRect.left + scrollLeft;
  const y1 = (fromRect.top + fromRect.bottom) / 2 - containerRect.top + scrollTop;

  const x2 = isLeft
    ? toRect.left  - containerRect.left + scrollLeft
    : toRect.right - containerRect.left + scrollLeft;
  const y2 = (toRect.top + toRect.bottom) / 2 - containerRect.top + scrollTop;

  // 中間控制點（S形曲線）
  const midX = (x1 + x2) / 2;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
  path.classList.add('br-connector');
  path.dataset.fromId    = fromMatch.id;
  path.dataset.toId      = toMatch.id;
  path.dataset.toSlotKey = toSlotKey;
  svg.appendChild(path);

  // 儲存路徑參考到 match（用於動畫）
  if (!fromMatch._paths) fromMatch._paths = [];
  fromMatch._paths.push({ el: path, toMatch, toSlotKey });
}

function drawFinalConnectors() {
  // 左半決賽 → 冠軍賽 p1
  // 右半決賽 → 冠軍賽 p2
  // （這部分的連接線位置比較複雜，先留待後續精修）
}

// ═══════════════════════════════════════
//  點選勝者 → 動畫流動 → 晉級
// ═══════════════════════════════════════
function handlePickWinner(match, side, roundIdx, matchIdx, slotKey) {
  if (match.winner) return;

  const winner = match[slotKey];
  const loser  = slotKey === 'p1' ? match.p2 : match.p1;
  match.winner = winner;

  // 更新 DOM 樣式
  match._el.p1?.classList.remove('br-slot--clickable');
  match._el.p2?.classList.remove('br-slot--clickable');
  if (match._el[slotKey])  match._el[slotKey].classList.add('br-slot--winner');
  if (match._el[loser === match.p1 ? 'p1' : 'p2']) {
    const loserKey = slotKey === 'p1' ? 'p2' : 'p1';
    match._el[loserKey]?.classList.add('br-slot--loser');
  }

  // 找下一輪對應的格子
  const rounds       = bracketData[side];
  const nextRound    = rounds[roundIdx + 1];
  const nextMatchIdx = Math.floor(matchIdx / 2);
  const nextMatch    = nextRound?.[nextMatchIdx];
  const nextSlotKey  = matchIdx % 2 === 0 ? 'p1' : 'p2';

  if (nextMatch) {
    // 動畫：光流 → 填入名字
    animateFlow(match, nextMatch, nextSlotKey, winner, () => {
      // 填入下一輪
      nextMatch[nextSlotKey] = winner;
      fillSlot(nextMatch._el[nextSlotKey], winner);

      // 讓下一輪的格子可點擊（當對手也填入後）
      activateMatchIfReady(nextMatch, side, roundIdx + 1, nextMatchIdx);

      // 檢查是否到達半決賽最後一場
      checkSemiFinal(side, roundIdx + 1, nextMatchIdx, nextMatch);
    });
  } else {
    // 已是最後一輪 → 送進決賽
    checkSemiFinal(side, roundIdx, matchIdx, match);
  }
}

/**
 * 若雙方都填入則啟用點擊
 */
function activateMatchIfReady(match, side, roundIdx, matchIdx) {
  if (match.p1 && match.p2 && !match.winner) {
    if (match._el.p1) {
      match._el.p1.classList.add('br-slot--clickable');
      match._el.p1.onclick = () => handlePickWinner(match, side, roundIdx, matchIdx, 'p1');
    }
    if (match._el.p2) {
      match._el.p2.classList.add('br-slot--clickable');
      match._el.p2.onclick = () => handlePickWinner(match, side, roundIdx, matchIdx, 'p2');
    }
  }
}

/**
 * 檢查是否到達準決賽（最後一輪只剩1場）
 */
function checkSemiFinal(side, roundIdx, matchIdx, match) {
  const rounds = bracketData[side];
  if (roundIdx === rounds.length - 1 && match.winner) {
    // 這半區產生最終勝者
    const winner = match.winner;
    const loser  = match.winner === match.p1 ? match.p2 : match.p1;
    const slotKey = side === 'left' ? 'p1' : 'p2';

    // 填入冠軍賽
    bracketData.grandFinal[slotKey] = winner;
    fillSlot(bracketData.grandFinal._el[slotKey], winner);
    bracketData.grandFinal._el[slotKey]?.classList.remove('br-placeholder');

    // 填入季軍賽
    bracketData.thirdPlace[slotKey] = loser;
    fillSlot(bracketData.thirdPlace._el[slotKey], loser);
    bracketData.thirdPlace._el[slotKey]?.classList.remove('br-placeholder');

    // 如果冠軍賽雙方都就位，啟用點擊
    if (bracketData.grandFinal.p1 && bracketData.grandFinal.p2) {
      activateFinalMatch('grandFinal');
    }
    if (bracketData.thirdPlace.p1 && bracketData.thirdPlace.p2) {
      activateFinalMatch('thirdPlace');
    }
  }
}

function activateFinalMatch(matchType) {
  const match = bracketData[matchType];
  ['p1','p2'].forEach(key => {
    if (match._el[key]) {
      match._el[key].classList.add('br-slot--clickable');
      match._el[key].onclick = () => handlePickFinal(matchType, key);
    }
  });
}

function handlePickFinal(matchType, slotKey) {
  const match = bracketData[matchType];
  if (match.winner) return;

  match.winner = match[slotKey];
  const loserKey = slotKey === 'p1' ? 'p2' : 'p1';

  match._el[slotKey]?.classList.add('br-slot--winner');
  match._el[loserKey]?.classList.add('br-slot--loser');
  match._el.p1?.classList.remove('br-slot--clickable');
  match._el.p2?.classList.remove('br-slot--clickable');

  if (matchType === 'grandFinal') {
    bracketData.ranking.first  = match.winner;
    bracketData.ranking.second = match[loserKey];
  } else {
    bracketData.ranking.third  = match.winner;
    bracketData.ranking.fourth = match[loserKey];
  }

  updateRankDisplay();

  if (bracketData.ranking.first && bracketData.ranking.third) {
    setTimeout(() => showFinalCelebration(), 500);
  }
}

// ═══════════════════════════════════════
//  動畫：金色光流
// ═══════════════════════════════════════

/**
 * 從 fromMatch 的某條 SVG 路徑，畫出金色流動光效
 * 結束後呼叫 callback
 */
function animateFlow(fromMatch, toMatch, toSlotKey, winnerName, callback) {
  // 找對應的 SVG path
  const pathInfo = fromMatch._paths?.find(p => p.toMatch === toMatch && p.toSlotKey === toSlotKey);

  if (!pathInfo) {
    // 沒找到路徑，直接執行
    callback?.();
    return;
  }

  const pathEl = pathInfo.el;
  const totalLength = pathEl.getTotalLength();

  // 啟用勝利者路徑樣式
  pathEl.classList.add('br-connector--win');

  // 建立流動光點
  const svgNS  = 'http://www.w3.org/2000/svg';
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', '#e8c97a');
  circle.setAttribute('filter', 'url(#glow)');
  pathEl.parentElement.appendChild(circle);

  // 加入 glow filter（如果還沒有）
  ensureGlowFilter(pathEl.parentElement);

  let start = null;
  const duration = 600; // ms

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    // 沿路徑移動
    const point = pathEl.getPointAtLength(progress * totalLength);
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // 動畫完成
      circle.remove();
      // 格子閃光效果
      flashSlot(toMatch._el[toSlotKey], () => callback?.());
    }
  }
  requestAnimationFrame(step);
}

function ensureGlowFilter(svg) {
  if (svg.querySelector('#glow')) return;
  const defs = svg.querySelector('defs') || svg.insertBefore(
    document.createElementNS('http://www.w3.org/2000/svg','defs'), svg.firstChild
  );
  defs.innerHTML += `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
}

/**
 * 格子閃光：金色外光暈閃爍，結束後填入名字
 */
function flashSlot(slotEl, callback) {
  if (!slotEl) { callback?.(); return; }

  slotEl.classList.add('br-slot--flash');
  setTimeout(() => {
    slotEl.classList.remove('br-slot--flash');
    callback?.();
  }, 400);
}

/**
 * 填入格子名字（淡入效果）
 */
function fillSlot(slotEl, name) {
  if (!slotEl) return;
  const nameEl = slotEl.querySelector('.br-slot-name');
  if (!nameEl) return;

  nameEl.style.opacity = '0';
  nameEl.textContent   = name;
  nameEl.classList.remove('br-placeholder');

  requestAnimationFrame(() => {
    nameEl.style.transition = 'opacity 0.4s ease';
    nameEl.style.opacity    = '1';
  });
}

// ═══════════════════════════════════════
//  輪空自動晉級
// ═══════════════════════════════════════
function autoAdvanceByes() {
  ['left','right'].forEach(side => {
    const rounds = bracketData[side];
    rounds[0].forEach((match, mi) => {
      if (match.bye && match.p1 && !match.winner) {
        // 延遲一點點，讓 DOM 完全就緒
        setTimeout(() => {
          handlePickWinner(match, side, 0, mi, 'p1');
        }, 100 + mi * 50);
      }
    });
  });
}

// ═══════════════════════════════════════
//  更新排名顯示
// ═══════════════════════════════════════
function updateRankDisplay() {
  const r   = bracketData.ranking;
  const el  = document.getElementById('rankDisplay');
  if (!el) return;

  const medals = [
    { key:'first',  icon:'🥇', label:'冠軍' },
    { key:'second', icon:'🥈', label:'亞軍' },
    { key:'third',  icon:'🥉', label:'季軍' },
    { key:'fourth', icon:'4️⃣', label:'殿軍' },
  ];

  const hasAny = medals.some(m => r[m.key]);
  el.style.display = hasAny ? '' : 'none';
  el.innerHTML = `
    <div class="br-rank-title">🎖️ 目前排名</div>
    ${medals.map(m => r[m.key] ? `
      <div class="br-rank-row">
        <span class="br-rank-icon">${m.icon}</span>
        <span class="br-rank-label">${m.label}</span>
        <span class="br-rank-name">${r[m.key]}</span>
      </div>` : '').join('')}`;
}

function showFinalCelebration() {
  const r = bracketData.ranking;
  document.getElementById('victoryName').textContent  = r.first || '—';
  document.getElementById('victoryScore').textContent =
    `🥈 ${r.second||'—'}　🥉 ${r.third||'—'}　4️⃣ ${r.fourth||'—'}`;
  document.getElementById('victoryOverlay').classList.add('show');
  launchConfetti();
}

// ═══════════════════════════════════════
//  工具
// ═══════════════════════════════════════
function getRoundLabel(ri, totalRounds, _) {
  if (ri === totalRounds - 1) return '準決賽';
  return `第 ${ri + 1} 輪`;
}