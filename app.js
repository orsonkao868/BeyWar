/**
 * BeyWarrior｜陀螺鬥士輔助系統
 * 製作人：OK x T.B.X.C
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

function seedDefaultParts() {
  if (state.parts.length > 0 || state.cxMods.length > 0) return;
  state.cxMods.push(
    { id:20001, type:'emblem',    name:'帝王', note:'', uses:0 },
    { id:20002, type:'mainBlade', name:'爆擊', note:'', uses:0 },
    { id:20003, type:'subBlade',  name:'W',    note:'', uses:0 },
    { id:20004, type:'overBlade', name:'B',    note:'', uses:0 }
  );
  state.parts.push(
    { id:10001, name:'鳳凰飛翼',   cat:'blade', series:'BX', spin:'右旋', note:'BX初始戰刃', cxMods:{}, uses:0 },
    { id:10002, name:'蒼龍爆刃',   cat:'blade', series:'UX', spin:'右旋', note:'UX強攻戰刃', cxMods:{}, uses:0 },
    { id:10003, name:'帝王爆擊WB', cat:'blade', series:'CX', spin:'右旋', note:'',
      cxMods:{ emblem:20001, mainBlade:20002, subBlade:20003, overBlade:20004 }, uses:0 }
  );
  for (let i = 1; i <= 50; i++) {
    state.parts.push({ id:30000+i, name:String(i), cat:'ratchet', series:null, spin:null, note:'', cxMods:{}, uses:0 });
  }
  state.parts.push({ id:40001, name:'R', cat:'bit', series:null, spin:null, note:'', cxMods:{}, uses:0 });
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
  scores = [0,0]; updateScoreDisplay();
  document.getElementById('card1').classList.remove('winning');
  document.getElementById('card2').classList.remove('winning');
  closeVictory();
}
function flashCard(p) {
  const card = document.getElementById('card'+p);
  card.style.transition = 'none'; card.style.transform = 'scale(1.04)';
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
  const wrap = document.getElementById('confettiWrap'); wrap.innerHTML = '';
  const colors = ['#c9a84c','#e8c97a','#8c6e2a','#fff8e0','#f5dfa0','#f0d080'];
  const style  = document.createElement('style');
  style.textContent =
    '@keyframes f0{to{transform:translateY(105vh) rotate(360deg);opacity:0}}' +
    '@keyframes f1{to{transform:translateY(105vh) rotate(-360deg) translateX(60px);opacity:0}}' +
    '@keyframes f2{to{transform:translateY(105vh) rotate(180deg) translateX(-60px);opacity:0}}';
  wrap.appendChild(style);
  for (let i = 0; i < 80; i++) {
    const c = document.createElement('div'), s = 6 + Math.random() * 8;
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
//  BRACKET
// ═══════════════════════════════════════
const BK_W=148, BK_H=38, BK_COL=56, BK_VS=6, BK_MAT=20;
let bk = null;

function genPlayerInputs() {
  const n = Math.min(1000, Math.max(2, parseInt(document.getElementById('playerCount').value)||2));
  document.getElementById('bracketInfo').textContent =
    `${n} 位選手 → 左側 ${Math.ceil(n/2)} 人、右側 ${Math.floor(n/2)} 人，各自淘汰到中間決賽`;
  const list = document.getElementById('playerListEditor');
  const existing = [...list.querySelectorAll('input')].map(i => i.value);
  list.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'player-entry';
    d.innerHTML = `<span class="player-num">${i+1}</span><input placeholder="選手 ${i+1}" value="${existing[i]||''}">`;
    list.appendChild(d);
  }
}

function generateBracket() {
  closeVictory();
  const fa = document.getElementById('finalsArea');
  if (fa) { fa.style.display='none'; fa.innerHTML=''; }
  const n = Math.min(1000, Math.max(2, parseInt(document.getElementById('playerCount').value)||2));
  let names = [...document.querySelectorAll('#playerListEditor input')].map((el,i) => el.value||`選手${i+1}`);
  for (let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
  names = names.slice(0,n);
  bk = {
    left:  buildHalf(names.slice(0,Math.ceil(n/2)),'L'),
    right: buildHalf(names.slice(Math.ceil(n/2)),'R'),
    gf: mkM('GF',null,null,false), tp: mkM('TP',null,null,false),
    ranking:{}, _paths:{},
  };
  const outer = document.getElementById('bkOuter');
  outer.innerHTML='';
  const canvas=document.createElement('div'); canvas.id='bkCanvas'; canvas.className='bk-canvas';
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id='bkSvg'; svg.className='bk-svg';
  canvas.appendChild(svg); outer.appendChild(canvas);
  renderBracketDOM(canvas,svg);
  switchInner('bracket','draw',null);
  const tabs=document.querySelectorAll('#page-bracket > .inner-tabs > .inner-tab');
  tabs[0].classList.remove('active'); tabs[1].classList.add('active');
}

function resetBracket() {
  bk=null;
  const outer=document.getElementById('bkOuter'); if(outer) outer.innerHTML='';
  const fa=document.getElementById('finalsArea'); if(fa){fa.style.display='none';fa.innerHTML='';}
  closeVictory(); backToSetup();
}

function buildHalf(players,prefix){
  const rounds=[];let r0=[];
  for(let i=0;i<players.length;i+=2){
    if(i+1<players.length) r0.push(mkM(`${prefix}-0-${r0.length}`,players[i],players[i+1],false));
    else r0.push(mkM(`${prefix}-0-${r0.length}`,players[i],null,true));
  }
  rounds.push(r0);let prev=r0.length;
  while(prev>1){const cnt=Math.ceil(prev/2);rounds.push(Array.from({length:cnt},(_,i)=>mkM(`${prefix}-${rounds.length}-${i}`,null,null,false)));prev=cnt;}
  return rounds;
}
function mkM(id,p1,p2,bye){return{id,p1,p2,winner:null,bye,_el:{},_paths:{}};}

function renderBracketDOM(canvas,svgEl){
  svgEl.innerHTML=`<defs>
    <filter id="bkGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="goldFlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fff3b0" stop-opacity=".6"/>
      <stop offset="50%" stop-color="#e8c97a" stop-opacity="1"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity=".8"/>
    </linearGradient>
  </defs>`;
  const lC=calcCenters(bk.left),rC=calcCenters(bk.right);
  const matchH=BK_H*2+BK_VS;
  const leftH=bk.left[0].length*(matchH+BK_MAT)-BK_MAT;
  const rightH=bk.right[0].length*(matchH+BK_MAT)-BK_MAT;
  const CENTER_W=180,FINAL_H=matchH*2+60;
  const lCols=bk.left.length,rCols=bk.right.length;
  const canvasW=lCols*(BK_W+BK_COL)+CENTER_W+rCols*(BK_W+BK_COL)+40;
  const canvasH=Math.max(leftH,rightH,FINAL_H)+60;
  canvas.style.width=canvasW+'px'; canvas.style.height=canvasH+'px';
  svgEl.setAttribute('width',canvasW); svgEl.setAttribute('height',canvasH); svgEl.setAttribute('viewBox',`0 0 ${canvasW} ${canvasH}`);
  const lSY=(canvasH-leftH)/2,rSY=(canvasH-rightH)/2,cY=(canvasH-FINAL_H)/2;
  const cX=lCols*(BK_W+BK_COL)+20;
  const lRX=ri=>16+ri*(BK_W+BK_COL);
  const rRX=ri=>canvasW-16-(ri+1)*BK_W-ri*BK_COL;

  bk.left.forEach((round,ri)=>{
    round.forEach((match,mi)=>placeMatch(canvas,svgEl,match,lRX(ri),lSY+lC[ri][mi],'left',ri,mi));
    if(ri<bk.left.length-1) round.forEach((match,mi)=>{
      const nm=bk.left[ri+1][Math.floor(mi/2)],tk=mi%2===0?'p1':'p2';
      drawConn(svgEl,match,nm,tk,lRX(ri)+BK_W,lSY+lC[ri][mi],lRX(ri+1),lSY+lC[ri+1][Math.floor(mi/2)]);
    });
  });
  bk.right.forEach((round,ri)=>{
    round.forEach((match,mi)=>placeMatch(canvas,svgEl,match,rRX(ri),rSY+rC[ri][mi],'right',ri,mi));
    if(ri<bk.right.length-1) round.forEach((match,mi)=>{
      const nm=bk.right[ri+1][Math.floor(mi/2)],tk=mi%2===0?'p1':'p2';
      drawConn(svgEl,match,nm,tk,rRX(ri),rSY+rC[ri][mi],rRX(ri+1)+BK_W,rSY+rC[ri+1][Math.floor(mi/2)]);
    });
  });
  placeFinals(canvas,svgEl,cX,cY);
  setTimeout(()=>autoAdvanceByes(),100);
}

function calcCenters(rounds){
  const matchH=BK_H*2+BK_VS;
  const c0=rounds[0].map((_,i)=>i*(matchH+BK_MAT)+matchH/2);
  const centers=[c0];
  for(let ri=1;ri<rounds.length;ri++){
    const prev=centers[ri-1];
    centers.push(rounds[ri].map((_,mi)=>{
      const a=prev[mi*2]??prev[prev.length-1],b=prev[mi*2+1]??prev[mi*2];return(a+b)/2;
    }));
  }
  return centers;
}

function placeMatch(container,svg,match,x,cy,side,ri,mi){
  const y1=cy-BK_H-BK_VS/2,y2=cy+BK_VS/2;
  const el1=makeSlot(match,'p1'); el1.style.left=x+'px'; el1.style.top=y1+'px';
  container.appendChild(el1); match._el.p1=el1;
  const vl=mkSvg('line'); vl.setAttribute('x1',x+10); vl.setAttribute('x2',x+BK_W-10);
  vl.setAttribute('y1',cy); vl.setAttribute('y2',cy);
  vl.setAttribute('stroke','rgba(201,168,76,0.22)'); vl.setAttribute('stroke-width','1.5'); vl.setAttribute('stroke-dasharray','3 3');
  svg.appendChild(vl);
  if(!match.bye){const el2=makeSlot(match,'p2'); el2.style.left=x+'px'; el2.style.top=y2+'px'; container.appendChild(el2); match._el.p2=el2;}
  if(ri===0&&match.p1&&match.p2&&!match.bye) enableClick(match,side,ri,mi);
}

function makeSlot(match,key){
  const el=document.createElement('div'); el.className='bk-slot dragon-border';
  el.style.cssText=`position:absolute;width:${BK_W}px;height:${BK_H}px;`;
  el.dataset.matchId=match.id; el.dataset.slot=key;
  const player=match[key];
  if(match.bye&&key==='p2'){el.style.display='none';return el;}
  if(!player&&!match.bye) el.classList.add('bk-slot--empty');
  if(match.bye&&key==='p1') el.classList.add('bk-slot--bye');
  el.innerHTML=`<span class="dragon-bl"></span><span class="dragon-br"></span><span class="bk-win-bar"></span><span class="bk-slot-name${!player&&!match.bye?' bk-placeholder':''}">${player||(match.bye?'輪空':'待定')}</span>`;
  return el;
}

function enableClick(match,side,ri,mi){
  ['p1','p2'].forEach(key=>{
    const el=match._el[key]; if(!el) return;
    el.classList.add('bk-slot--clickable');
    el.onclick=e=>{e.stopPropagation();pickWinner(match,key,side,ri,mi);};
  });
}

function pickWinner(match,winKey,side,ri,mi){
  if(match.winner) return;
  const loseKey=winKey==='p1'?'p2':'p1'; match.winner=match[winKey];
  match._el[winKey]?.classList.add('bk-slot--winner'); match._el[winKey]?.classList.remove('bk-slot--clickable');
  match._el[loseKey]?.classList.add('bk-slot--loser'); match._el[loseKey]?.classList.remove('bk-slot--clickable');
  if(match._el.p1) match._el.p1.onclick=null; if(match._el.p2) match._el.p2.onclick=null;
  const rounds=bk[side],nextRi=ri+1,nextMi=Math.floor(mi/2),toKey=mi%2===0?'p1':'p2';
  const nextMatch=rounds[nextRi]?.[nextMi];
  const pathKey=nextMatch?`${match.id}→${nextMatch.id}-${toKey}`:null;
  const pathEl=pathKey?bk._paths[pathKey]:null;
  animateFlow(pathEl,()=>{
    if(nextMatch){
      nextMatch[toKey]=match.winner; fillSlot(nextMatch._el[toKey],match.winner);
      if(nextMatch.p1&&nextMatch.p2&&!nextMatch.winner) enableClick(nextMatch,side,nextRi,nextMi);
    }
    checkSemi(side,nextMatch?nextRi:ri,nextMatch?nextMi:mi,nextMatch||match);
  });
}

function checkSemi(side,ri,mi,match){
  const rounds=bk[side]; if(ri!==rounds.length-1||!match.winner) return;
  const winner=match.winner,loser=match.p1===winner?match.p2:match.p1,gfKey=side==='left'?'p1':'p2';
  bk.gf[gfKey]=winner; setTimeout(()=>{fillSlot(bk.gf._el[gfKey],winner);flashSlot(bk.gf._el[gfKey]);},200);
  if(loser){bk.tp[gfKey]=loser;setTimeout(()=>{fillSlot(bk.tp._el[gfKey],loser);flashSlot(bk.tp._el[gfKey]);},350);}
  if(bk.gf.p1&&bk.gf.p2&&!bk.gf.winner) setTimeout(()=>enableFinal('gf'),500);
  if(bk.tp.p1&&bk.tp.p2&&!bk.tp.winner) setTimeout(()=>enableFinal('tp'),500);
}

function enableFinal(mk){
  const match=bk[mk];
  ['p1','p2'].forEach(key=>{
    const el=match._el[key]; if(!el) return;
    el.classList.add('bk-slot--clickable');
    el.onclick=e=>{e.stopPropagation();pickFinal(mk,key);};
  });
}

function pickFinal(mk,winKey){
  const match=bk[mk]; if(match.winner) return;
  const loseKey=winKey==='p1'?'p2':'p1'; match.winner=match[winKey];
  match._el[winKey]?.classList.add('bk-slot--winner'); match._el[winKey]?.classList.remove('bk-slot--clickable');
  match._el[loseKey]?.classList.add('bk-slot--loser'); match._el[loseKey]?.classList.remove('bk-slot--clickable');
  if(match._el.p1) match._el.p1.onclick=null; if(match._el.p2) match._el.p2.onclick=null;
  if(mk==='gf'){bk.ranking.first=match.winner;bk.ranking.second=match[loseKey];}
  else{bk.ranking.third=match.winner;bk.ranking.fourth=match[loseKey];}
  updateRankBoard();
  if(bk.ranking.first&&bk.ranking.third) setTimeout(()=>showFinalCelebration(),500);
}

function placeFinals(container,svg,cx,cy){
  const fw=170,fx=cx+5,matchH=BK_H*2+BK_VS;
  const mkFS=(match,key,placeholder,x,y)=>{
    const el=document.createElement('div'); el.className='bk-slot dragon-border bk-final-slot';
    el.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:${fw}px;height:${BK_H}px;`;
    el.innerHTML=`<span class="dragon-bl"></span><span class="dragon-br"></span><span class="bk-win-bar"></span><span class="bk-slot-name bk-placeholder">${placeholder}</span>`;
    el.dataset.matchId=match.id;el.dataset.slot=key;match._el[key]=el;container.appendChild(el);
  };
  const mkLbl=(t,x,y,sz='0.88rem')=>{const el=document.createElement('div');el.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:${fw}px;text-align:center;font-family:Rajdhani,sans-serif;font-size:${sz};font-weight:700;color:var(--gold-dk);`;el.textContent=t;container.appendChild(el);};
  const mkVs=(x,y)=>{const el=document.createElement('div');el.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:${fw}px;height:${BK_VS}px;display:flex;align-items:center;justify-content:center;font-family:Rajdhani,sans-serif;font-size:.72rem;font-weight:700;color:var(--text2);letter-spacing:2px;`;el.textContent='VS';container.appendChild(el);};
  mkLbl('🏆 冠軍賽',fx,cy-22);mkFS(bk.gf,'p1','待左半冠軍',fx,cy);mkVs(fx,cy+BK_H);mkFS(bk.gf,'p2','待右半冠軍',fx,cy+BK_H+BK_VS);
  const tpB=cy+matchH+36;
  mkLbl('🥉 季軍賽',fx,tpB-20,'0.78rem');mkFS(bk.tp,'p1','待左半落敗',fx,tpB);mkVs(fx,tpB+BK_H);mkFS(bk.tp,'p2','待右半落敗',fx,tpB+BK_H+BK_VS);
  const rb=document.createElement('div');rb.id='bkRankBoard';rb.className='bk-rank-board';rb.style.cssText=`position:absolute;left:${fx-5}px;top:${tpB+BK_H*2+BK_VS+16}px;width:${fw+10}px;display:none;`;container.appendChild(rb);
}

function drawConn(svg,fromMatch,toMatch,toKey,x1,y1,x2,y2){
  const mid=(x1+x2)/2,path=mkSvg('path');
  path.setAttribute('d',`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
  path.classList.add('bk-conn');svg.appendChild(path);
  const key=`${fromMatch.id}→${toMatch.id}-${toKey}`;bk._paths[key]=path;fromMatch._paths[key]=path;
}
function mkSvg(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag);}

function animateFlow(pathEl,callback){
  if(!pathEl){callback?.();return;}
  pathEl.classList.add('bk-conn--win');
  const svgEl=document.getElementById('bkSvg'); if(!svgEl){callback?.();return;}
  const total=pathEl.getTotalLength();
  const dot=mkSvg('circle');dot.setAttribute('r','6');dot.setAttribute('fill','url(#goldFlow)');dot.setAttribute('filter','url(#bkGlow)');
  const tail=mkSvg('circle');tail.setAttribute('r','3.5');tail.setAttribute('fill','#fff3b0');tail.setAttribute('filter','url(#bkGlow)');tail.setAttribute('opacity','0.7');
  svgEl.appendChild(dot);svgEl.appendChild(tail);
  let start=null;
  function step(ts){
    if(!start)start=ts;const p=Math.min((ts-start)/550,1),pT=Math.max(p-0.12,0);
    const pt=pathEl.getPointAtLength(p*total),ptT=pathEl.getPointAtLength(pT*total);
    dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);
    tail.setAttribute('cx',ptT.x);tail.setAttribute('cy',ptT.y);
    if(p<1)requestAnimationFrame(step);else{dot.remove();tail.remove();callback?.();}
  }
  requestAnimationFrame(step);
}

function fillSlot(el,name){
  if(!el)return;const ne=el.querySelector('.bk-slot-name');if(!ne)return;
  ne.style.opacity='0';ne.textContent=name;ne.classList.remove('bk-placeholder');
  requestAnimationFrame(()=>{ne.style.transition='opacity .4s ease';ne.style.opacity='1';});
}
function flashSlot(el){if(!el)return;el.classList.add('bk-slot--flash');setTimeout(()=>el.classList.remove('bk-slot--flash'),450);}
function autoAdvanceByes(){
  ['left','right'].forEach(side=>{
    bk[side][0].forEach((match,mi)=>{
      if(match.bye&&match.p1&&!match.winner) setTimeout(()=>pickWinner(match,'p1',side,0,mi),80+mi*60);
    });
  });
}
function updateRankBoard(){
  const el=document.getElementById('bkRankBoard');if(!el)return;
  const r=bk.ranking;
  const medals=[{k:'first',i:'🥇',l:'冠軍'},{k:'second',i:'🥈',l:'亞軍'},{k:'third',i:'🥉',l:'季軍'},{k:'fourth',i:'4️⃣',l:'殿軍'}];
  if(!medals.some(m=>r[m.k])){el.style.display='none';return;}
  el.style.display='';
  el.innerHTML=`<div class="bk-rank-title">🎖️ 目前排名</div>`+medals.filter(m=>r[m.k]).map(m=>`<div class="bk-rank-row"><span class="bk-rank-icon">${m.i}</span><span class="bk-rank-lbl">${m.l}</span><span class="bk-rank-name">${r[m.k]}</span></div>`).join('');
  if(medals.every(m=>r[m.k])){
    const fa=document.getElementById('finalsArea');
    if(fa){fa.style.display='';fa.innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">${medals.map(m=>`<div class="final-rank-card"><div class="final-rank-medal">${m.i}</div><div class="final-rank-lbl">${m.l}</div><div class="final-rank-name">${r[m.k]||'—'}</div></div>`).join('')}</div>`;}
  }
}
function showFinalCelebration(){
  const r=bk.ranking;
  document.getElementById('victoryName').textContent=r.first||'—';
  document.getElementById('victoryScore').textContent=`🥈 ${r.second||'—'}　🥉 ${r.third||'—'}　4️⃣ ${r.fourth||'—'}`;
  document.getElementById('victoryOverlay').classList.add('show');launchConfetti();
}

// ═══════════════════════════════════════
//  PARTS DB
// ═══════════════════════════════════════
const CAT_LABELS    = { blade:'鋼鐵戰刃', ratchet:'固鎖輪盤', bit:'軸心' };
const CX_MOD_LABELS = { emblem:'聖獸紋章', mainBlade:'主要戰刃', subBlade:'輔助戰刃', overBlade:'超越戰刃' };
let addForm = { cat:'blade', series:'BX' };
let currentPartId = null;

function initAddForm(){
  addForm={cat:'blade',series:'BX'};
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active',b.dataset.cat==='blade'));
  document.querySelectorAll('.series-btn').forEach(b=>b.classList.toggle('active',b.dataset.series==='BX'));
  updateAddFormUI();
}
function selectCat(cat,btn){addForm.cat=cat;document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');updateAddFormUI();}
function selectSeries(series,btn){addForm.series=series;document.querySelectorAll('.series-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');updateAddFormUI();}

function updateAddFormUI(){
  const isBlade=addForm.cat==='blade',isCX=isBlade&&addForm.series==='CX';
  document.getElementById('seriesGroup').style.display=isBlade?'':'none';
  document.getElementById('cxModGroup').style.display=isCX?'':'none';
  document.getElementById('spinGroup').style.display=isBlade?'':'none';
  document.getElementById('nameGroup').style.display=isCX?'none':'';
  const nameLabel=document.getElementById('nameLabel'),nameWrap=document.getElementById('nameFieldWrap');
  if(isCX){refreshCxSelects();updateCxPreview();return;}
  if(isBlade){
    if(nameLabel)nameLabel.textContent='③ 鋼鐵戰刃名稱';
    if(nameWrap)nameWrap.innerHTML=`<input class="form-input" id="partNewInput" placeholder="例：鳳凰飛翼">`;
  }else{
    if(nameLabel)nameLabel.textContent=addForm.cat==='ratchet'?'② 固鎖輪盤名稱':'② 軸心名稱';
    if(nameWrap)nameWrap.innerHTML=`<input class="form-input" id="partNewInput" placeholder="${addForm.cat==='ratchet'?'例：9-60':'例：H'}">`;
  }
}

function updateCxPreview(){
  const preview=document.getElementById('cxNamePreview');if(!preview)return;
  const name=buildCxName();
  if(name){preview.innerHTML=`<div style="font-size:.7rem;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">組合名稱預覽</div><div style="font-family:'Rajdhani',sans-serif;font-size:1.2rem;font-weight:700;color:var(--gold-dk);">${name}</div>`;}
  else{preview.innerHTML=`<div style="color:var(--text2);font-size:.8rem;">請至少選擇聖獸紋章</div>`;}
}
function buildCxName(){
  const getN=id=>{if(!id)return'';const m=state.cxMods.find(m=>m.id==id);return m?m.name:'';};
  const e=getN(document.getElementById('cxEmblem')?.value),mb=getN(document.getElementById('cxMainBlade')?.value),sb=getN(document.getElementById('cxSubBlade')?.value),ob=getN(document.getElementById('cxOverBlade')?.value);
  if(!e)return'';return[e,mb,sb,ob].filter(Boolean).join('');
}

function openCxModModal(){renderCxModList();document.getElementById('cxModModal').classList.add('show');}
function addCxMod(){
  const type=document.getElementById('cxModType').value,name=document.getElementById('cxModName').value.trim();
  if(!name){showToast('請輸入改造零件名稱','error');return;}
  state.cxMods.push({id:Date.now(),type,name,note:'',uses:0});save();
  document.getElementById('cxModName').value='';renderCxModList();refreshCxSelects();
  showToast(`✅ ${CX_MOD_LABELS[type]}「${name}」已新增！`,'success');
}
function renderCxModList(){
  const el=document.getElementById('cxModList');if(!el)return;
  if(!state.cxMods.length){el.innerHTML='<div style="color:var(--text2);font-size:.8rem;">尚無改造零件</div>';return;}
  el.innerHTML=state.cxMods.map(m=>`<div class="cx-mod-list-item"><div><span class="cx-type-tag">${CX_MOD_LABELS[m.type]||m.type}</span><span style="margin-left:7px;font-weight:700;">${m.name}</span></div><button class="btn-icon" onclick="deleteCxMod(${m.id})">🗑</button></div>`).join('');
}
function deleteCxMod(id){state.cxMods=state.cxMods.filter(m=>m.id!==id);save();renderCxModList();refreshCxSelects();}
function refreshCxSelects(){
  [['cxEmblem','emblem'],['cxMainBlade','mainBlade'],['cxSubBlade','subBlade'],['cxOverBlade','overBlade']].forEach(([selId,typeKey])=>{
    const el=document.getElementById(selId);if(!el)return;
    const cur=el.value;
    el.innerHTML=`<option value="">— 未使用 —</option>`+state.cxMods.filter(m=>m.type===typeKey).map(m=>`<option value="${m.id}"${m.id==cur?' selected':''}>${m.name}</option>`).join('');
  });
  updateCxPreview();
}

function addPart(){
  const isBlade=addForm.cat==='blade',isCX=isBlade&&addForm.series==='CX';
  if(isCX){
    const name=buildCxName();if(!name){showToast('請至少選擇聖獸紋章','error');return;}
    if(state.parts.find(p=>p.cat==='blade'&&p.series==='CX'&&p.name===name)){showToast(`「${name}」已存在`,'error');return;}
    const cxMods={emblem:document.getElementById('cxEmblem').value||null,mainBlade:document.getElementById('cxMainBlade').value||null,subBlade:document.getElementById('cxSubBlade').value||null,overBlade:document.getElementById('cxOverBlade').value||null};
    state.parts.push({id:Date.now(),name,cat:'blade',series:'CX',spin:document.getElementById('newPartSpin').value,note:document.getElementById('newPartNote').value,cxMods,uses:0});
    save();showToast(`✅ CX 鋼鐵戰刃「${name}」已新增！`,'success');
    document.getElementById('newPartNote').value='';
    ['cxEmblem','cxMainBlade','cxSubBlade','cxOverBlade'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    updateCxPreview();renderParts();return;
  }
  const nameInput=document.getElementById('partNewInput'),name=(nameInput?.value||'').trim();
  if(!name){showToast('請輸入零件名稱','error');return;}
  const dup=state.parts.find(p=>p.cat===addForm.cat&&p.name===name&&(isBlade?p.series===addForm.series:true));
  if(dup){showToast(`「${name}」已存在`,'error');return;}
  state.parts.push({id:Date.now(),name,cat:addForm.cat,series:isBlade?addForm.series:null,spin:isBlade?document.getElementById('newPartSpin').value:null,note:document.getElementById('newPartNote').value,cxMods:{},uses:0});
  save();showToast(`✅ ${CAT_LABELS[addForm.cat]}「${name}」已新增！`,'success');
  if(nameInput)nameInput.value='';document.getElementById('newPartNote').value='';
  updateAddFormUI();renderParts();
}

function renderParts(){
  const search=(document.getElementById('partSearch')?.value||'').toLowerCase();
  const catF=document.getElementById('partCatFilter')?.value||'';
  const seriesF=document.getElementById('partSeriesFilter')?.value||'';
  const filtered=state.parts.filter(p=>(!search||p.name.toLowerCase().includes(search))&&(!catF||p.cat===catF)&&(!seriesF||p.series===seriesF));
  const grid=document.getElementById('partsGrid');if(!grid)return;
  if(!filtered.length){grid.innerHTML='<div class="empty-state"><div class="empty-icon">📦</div><div>尚無零件</div></div>';return;}
  grid.innerHTML=filtered.map(p=>{
    let cxInfo='';
    if(p.cat==='blade'&&p.series==='CX'&&p.cxMods){
      const mods=Object.entries(p.cxMods).filter(([,v])=>v).map(([k,id])=>{const m=state.cxMods.find(m=>m.id==id);return m?`${CX_MOD_LABELS[k]}：${m.name}`:null;}).filter(Boolean);
      if(mods.length)cxInfo=`<div style="font-size:.7rem;color:var(--text2);margin-top:4px;">${mods.join(' · ')}</div>`;
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

function showPart(id){
  currentPartId=id;const p=state.parts.find(p=>p.id===id);if(!p)return;
  document.getElementById('partModalTitle').textContent=p.name;
  let cx='';
  if(p.cat==='blade'&&p.series==='CX'&&p.cxMods){
    const rows=Object.entries(CX_MOD_LABELS).map(([k,label])=>{const mid=p.cxMods[k];const m=mid?state.cxMods.find(m=>m.id==mid):null;return`<div class="part-detail-item"><div class="form-label">${label}</div><div>${m?m.name:'未使用'}</div></div>`;});
    cx=`<div style="margin-top:10px;font-size:.7rem;font-weight:700;color:var(--text2);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">CX 改造配件</div><div class="part-detail-grid">${rows.join('')}</div>`;
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
    </div>${cx}`;
  document.getElementById('partModal').classList.add('show');
}
function deletePart(){state.parts=state.parts.filter(p=>p.id!==currentPartId);save();renderParts();closeModal('partModal');showToast('零件已刪除','error');}

function renderPartStats(){
  const bl=state.parts.filter(p=>p.cat==='blade').length,ra=state.parts.filter(p=>p.cat==='ratchet').length,bi=state.parts.filter(p=>p.cat==='bit').length,cx=state.cxMods.length,tu=state.parts.reduce((a,p)=>a+(p.uses||0),0);
  document.getElementById('partStatsCards').innerHTML=`
    <div class="stat-card"><div class="stat-card-val">${state.parts.length}</div><div class="stat-card-label">零件總數</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${bl}</div><div class="stat-card-label">鋼鐵戰刃</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--blue);">${ra}</div><div class="stat-card-label">固鎖輪盤</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${bi}</div><div class="stat-card-label">軸心</div></div>
    <div class="stat-card"><div class="stat-card-val" style="color:var(--accent);">${cx}</div><div class="stat-card-label">CX改造</div></div>
    <div class="stat-card"><div class="stat-card-val">${tu}</div><div class="stat-card-label">總使用次數</div></div>`;
  const tc={blade:bl,ratchet:ra,bit:bi},maxT=Math.max(1,...Object.values(tc));
  document.getElementById('partTypeChart').innerHTML=Object.entries(tc).map(([k,v])=>`<div class="bar-row"><div class="bar-label">${CAT_LABELS[k]}</div><div class="bar-track"><div class="bar-fill" style="width:${v/maxT*100}%"></div></div><div class="bar-val">${v}</div></div>`).join('');
  const sorted=[...state.parts].sort((a,b)=>(b.uses||0)-(a.uses||0)).slice(0,10),maxU=Math.max(1,sorted[0]?.uses||0);
  document.getElementById('partUsageChart').innerHTML=sorted.length?sorted.map(p=>`<div class="bar-row"><div class="bar-label">${p.name}</div><div class="bar-track"><div class="bar-fill" style="width:${(p.uses||0)/maxU*100}%"></div></div><div class="bar-val">${p.uses||0}</div></div>`).join(''):'<div style="color:var(--text2);">暫無數據</div>';
}

// ═══════════════════════════════════════
//  SAVE MATCH
// ═══════════════════════════════════════
let matchConfigs={p1:{},p2:{}};
function saveMatch(){
  const p1n=document.getElementById('p1name').value||'選手 A',p2n=document.getElementById('p2name').value||'選手 B';
  document.getElementById('saveP1Label').textContent=p1n;document.getElementById('saveP2Label').textContent=p2n;
  matchConfigs={p1:{},p2:{}};buildMCUI('p1');buildMCUI('p2');document.getElementById('saveMatchModal').classList.add('show');
}
function buildMCUI(player){
  const el=document.getElementById(player==='p1'?'configBuilderP1':'configBuilderP2');
  const bxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='BX');
  const uxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='UX');
  const cxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='CX');
  const ras=state.parts.filter(p=>p.cat==='ratchet'),bis=state.parts.filter(p=>p.cat==='bit');
  const bladeOpts=`<option value="">— 未選 —</option>${bxB.length?`<optgroup label="⚔️ BX">${bxB.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</optgroup>`:''}${uxB.length?`<optgroup label="⚔️ UX">${uxB.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</optgroup>`:''}${cxB.length?`<optgroup label="⚔️ CX">${cxB.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</optgroup>`:''}`;
  const mkRow=(cat,label,opts)=>{
    if(cat!=='blade'){const parts=state.parts.filter(p=>p.cat===cat);if(!parts.length)return`<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚無零件</div></div>`;opts=`<option value="">— 未選 —</option>${parts.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}`;}
    return`<div class="config-step"><div class="config-step-label">${label}</div><select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="matchConfigs['${player}']['${cat}']=this.value;updateBeyoName('${player}')">${opts}</select></div>`;
  };
  el.innerHTML=mkRow('blade','鋼鐵戰刃',bladeOpts)+mkRow('ratchet','固鎖輪盤','')+mkRow('bit','軸心','')+`<div class="beyo-name-preview" id="beyoPreview_${player}"><span style="font-size:.72rem;color:var(--text2);">陀螺組合：</span><span class="beyo-name-text" id="beyoName_${player}">—</span></div>`;
}
function updateBeyoName(player){
  const cfg=matchConfigs[player],parts=['blade','ratchet','bit'].map(cat=>{const pid=cfg[cat];if(!pid)return null;return state.parts.find(p=>p.id==pid)?.name||null;}).filter(Boolean);
  const el=document.getElementById(`beyoName_${player}`);if(el)el.textContent=parts.length?parts.join(' ＋ '):'—';
}
function getBeyoName(config){
  if(!config)return'—';
  const parts=['blade','ratchet','bit'].map(cat=>{const pid=config[cat];if(!pid)return null;return state.parts.find(p=>p.id==pid)?.name||null;}).filter(Boolean);
  return parts.length?parts.join(' ＋ '):'—';
}
function confirmSaveMatch(){
  const p1n=document.getElementById('p1name').value||'選手 A',p2n=document.getElementById('p2name').value||'選手 B';
  const winner=scores[0]>=scores[1]?p1n:p2n,ids=cfg=>Object.values(cfg).filter(Boolean);
  state.matches.unshift({id:Date.now(),date:new Date().toLocaleString('zh-TW'),p1:p1n,p2:p2n,s1:scores[0],s2:scores[1],winner,p1Config:{...matchConfigs.p1},p2Config:{...matchConfigs.p2},p1Parts:ids(matchConfigs.p1),p2Parts:ids(matchConfigs.p2)});
  [...ids(matchConfigs.p1),...ids(matchConfigs.p2)].forEach(pid=>{const p=state.parts.find(p=>p.id==pid);if(p)p.uses=(p.uses||0)+1;});
  save();closeModal('saveMatchModal');showToast('✅ 比賽記錄已儲存！','success');
}

// ═══════════════════════════════════════
//  PERSONAL LOG
// ═══════════════════════════════════════
let editingPersonalId=null,pLogConfig={};
function openPersonalForm(id){
  editingPersonalId=id;const entry=id?state.personalLogs.find(l=>l.id===id):null;
  document.getElementById('personalFormTitle').textContent=id?'✏️ 編輯記錄':'➕ 新增個人記錄';
  document.getElementById('pLogDate').value=entry?.date||new Date().toISOString().slice(0,10);
  document.getElementById('pLogOpponent').value=entry?.opponent||'';
  document.getElementById('pLogMyScore').value=entry?.myScore??0;
  document.getElementById('pLogOppScore').value=entry?.oppScore??0;
  document.getElementById('pLogResult').value=entry?.result||'win';
  document.getElementById('pLogNote').value=entry?.note||'';
  pLogConfig=entry?.config?{...entry.config}:{};renderPLogConfig();
  document.getElementById('personalFormModal').classList.add('show');
}
function renderPLogConfig(){
  const el=document.getElementById('pLogConfigArea');
  const bxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='BX'),uxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='UX'),cxB=state.parts.filter(p=>p.cat==='blade'&&p.series==='CX');
  const bladeOpts=`<option value="">— 未選 —</option>${bxB.length?`<optgroup label="⚔️ BX">${bxB.map(p=>`<option value="${p.id}"${pLogConfig.blade==p.id?' selected':''}>${p.name}</option>`).join('')}</optgroup>`:''}${uxB.length?`<optgroup label="⚔️ UX">${uxB.map(p=>`<option value="${p.id}"${pLogConfig.blade==p.id?' selected':''}>${p.name}</option>`).join('')}</optgroup>`:''}${cxB.length?`<optgroup label="⚔️ CX">${cxB.map(p=>`<option value="${p.id}"${pLogConfig.blade==p.id?' selected':''}>${p.name}</option>`).join('')}</optgroup>`:''}`;
  const mkSel=(cat,label,opts)=>{
    if(cat!=='blade'){const parts=state.parts.filter(p=>p.cat===cat);if(!parts.length)return`<div class="config-step"><div class="config-step-label">${label}</div><div class="no-parts-msg">尚無零件</div></div>`;opts=`<option value="">— 未選 —</option>${parts.map(p=>`<option value="${p.id}"${pLogConfig[cat]==p.id?' selected':''}>${p.name}</option>`).join('')}`;}
    return`<div class="config-step"><div class="config-step-label">${label}</div><select class="form-select" style="padding:7px 12px;font-size:.82rem;" onchange="pLogConfig['${cat}']=this.value;updatePLogBeyoName()">${opts}</select></div>`;
  };
  el.innerHTML=mkSel('blade','鋼鐵戰刃',bladeOpts)+mkSel('ratchet','固鎖輪盤','')+mkSel('bit','軸心','')+`<div class="beyo-name-preview" id="pLogBeyoPreview"><span style="font-size:.72rem;color:var(--text2);">陀螺組合：</span><span class="beyo-name-text" id="pLogBeyoName">${getBeyoName(pLogConfig)}</span></div>`;
}
function updatePLogBeyoName(){const el=document.getElementById('pLogBeyoName');if(el)el.textContent=getBeyoName(pLogConfig);}
function savePersonalLog(){
  const entry={id:editingPersonalId||Date.now(),date:document.getElementById('pLogDate').value,opponent:document.getElementById('pLogOpponent').value.trim()||'未知對手',myScore:parseInt(document.getElementById('pLogMyScore').value)||0,oppScore:parseInt(document.getElementById('pLogOppScore').value)||0,result:document.getElementById('pLogResult').value,note:document.getElementById('pLogNote').value.trim(),config:{...pLogConfig}};
  if(editingPersonalId){const i=state.personalLogs.findIndex(l=>l.id===editingPersonalId);if(i!==-1)state.personalLogs[i]=entry;}
  else state.personalLogs.unshift(entry);
  save();closeModal('personalFormModal');renderPersonalLog();showToast('✅ 記錄已儲存！','success');
}
function deletePersonalLog(id){if(!confirm('確定刪除？'))return;state.personalLogs=state.personalLogs.filter(l=>l.id!==id);save();renderPersonalLog();showToast('記錄已刪除','error');}
function renderPersonalLog(){
  const filter=document.getElementById('pLogFilter')?.value||'',logs=state.personalLogs.filter(l=>!filter||l.result===filter);
  const total=state.personalLogs.length,wins=state.personalLogs.filter(l=>l.result==='win').length,loses=state.personalLogs.filter(l=>l.result==='lose').length,wr=total?Math.round(wins/total*100):0;
  const se=document.getElementById('personalStats');
  if(se)se.innerHTML=`<div class="stat-card"><div class="stat-card-val">${total}</div><div class="stat-card-label">總場次</div></div><div class="stat-card"><div class="stat-card-val" style="color:var(--green);">${wins}</div><div class="stat-card-label">勝場</div></div><div class="stat-card"><div class="stat-card-val" style="color:var(--accent);">${loses}</div><div class="stat-card-label">敗場</div></div><div class="stat-card"><div class="stat-card-val" style="color:${wr>=60?'var(--green)':wr>=40?'var(--gold-dk)':'var(--accent)'};">${wr}%</div><div class="stat-card-label">勝率</div></div>`;
  const el=document.getElementById('personalLog');if(!el)return;
  if(!logs.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">📒</div><div>${total?'無符合記錄':'尚無個人戰績'}</div></div>`;return;}
  const cfgText=config=>{if(!config)return'';const items=['blade','ratchet','bit'].map(cat=>{const pid=config[cat];if(!pid)return null;const p=state.parts.find(p=>p.id==pid);if(!p)return null;return`<span><strong>${CAT_LABELS[cat]}：</strong>${p.name}</span>`;}).filter(Boolean);return items.length?`<div class="plog-config">${items.join('　')}</div>`:''};
  const rl={win:'✅ 勝',lose:'❌ 負',draw:'🤝 平'};
  el.innerHTML='<div class="plog-list">'+logs.map(l=>`<div class="plog-card ${l.result}"><div class="plog-result-badge badge-${l.result}">${rl[l.result]||l.result}</div><div class="plog-meta"><div class="plog-opponent">vs　${l.opponent}</div><div class="plog-score-line"><span>${l.myScore}</span> : <span>${l.oppScore}</span></div><div class="plog-date">📅 ${l.date}</div>${cfgText(l.config)}${l.note?`<div class="plog-note">💬 ${l.note}</div>`:''}</div><div class="plog-actions"><button class="btn-icon" onclick="openPersonalForm(${l.id})">✏️</button><button class="btn-icon" onclick="deletePersonalLog(${l.id})" style="color:var(--accent);">🗑</button></div></div>`).join('')+'</div>';
}

// ═══════════════════════════════════════
//  MULTI LOG
// ═══════════════════════════════════════
function renderMultiLog(){
  const wins={};state.matches.forEach(m=>{wins[m.winner]=(wins[m.winner]||0)+1;});
  const top=Object.entries(wins).sort((a,b)=>b[1]-a[1])[0];
  const se=document.getElementById('overallStats');
  if(se)se.innerHTML=`<div class="stat-card"><div class="stat-card-val">${state.matches.length}</div><div class="stat-card-label">總場次</div></div><div class="stat-card"><div class="stat-card-val" style="color:var(--gold-dk);">${top?top[0]:'—'}</div><div class="stat-card-label">勝場最多</div></div><div class="stat-card"><div class="stat-card-val">${top?top[1]:0}</div><div class="stat-card-label">最高勝場</div></div>`;
  const le=document.getElementById('matchLog');if(!le)return;
  if(!state.matches.length){le.innerHTML='<div class="empty-state"><div class="empty-icon">⚔️</div><div>尚無多人記錄</div></div>';return;}
  const pn=id=>{const p=state.parts.find(p=>p.id==id);return p?p.name:'—';};
  const cfgStr=cfg=>cfg?['blade','ratchet','bit'].map(k=>cfg[k]?pn(cfg[k]):'').filter(Boolean).join(' / '):'—';
  le.innerHTML=state.matches.map(m=>`<div class="log-entry"><div><div class="log-player">${m.p1}${m.winner===m.p1?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts">${cfgStr(m.p1Config)}</div></div><div><div class="log-score">${m.s1} : ${m.s2}</div><div class="log-date">${m.date}</div></div><div style="text-align:right;"><div class="log-player">${m.p2}${m.winner===m.p2?' <span class="log-winner-tag">✔ 勝</span>':''}</div><div class="log-parts" style="text-align:right;">${cfgStr(m.p2Config)}</div></div></div>`).join('');
}

// ═══════════════════════════════════════
//  ANALYSIS
// ═══════════════════════════════════════
let analysisMode='config';
function switchAnalysis(mode){
  analysisMode=mode;
  document.getElementById('analysisConfig').style.display=mode==='config'?'':'none';
  document.getElementById('analysisParts').style.display=mode==='parts'?'':'none';
  document.getElementById('anaTab1').classList.toggle('active',mode==='config');
  document.getElementById('anaTab2').classList.toggle('active',mode==='parts');
  renderAnalysis();
}
function renderAnalysis(){renderConfigAnalysis();renderPartsAnalysis();}
function renderConfigAnalysis(){
  const el=document.getElementById('analysisConfig');if(!el)return;
  const pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const cfgKey=cfg=>{if(!cfg)return null;const n=['blade','ratchet','bit'].map(k=>cfg[k]?pn(cfg[k]):'').filter(Boolean);return n.length?n.join(' / '):null;};
  const cs={},add=(cfg,won)=>{const k=cfgKey(cfg);if(!k)return;if(!cs[k])cs[k]={key:k,wins:0,total:0};cs[k].total++;if(won)cs[k].wins++;};
  state.matches.forEach(m=>{add(m.p1Config,m.winner===m.p1);add(m.p2Config,m.winner===m.p2);});
  state.personalLogs.forEach(l=>{add(l.config,l.result==='win');});
  const rows=Object.values(cs).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">📊 比賽場次不足</div>';return;}
  el.innerHTML=`<div class="analysis-section-title">配置勝率排行</div><table class="analysis-table"><thead><tr><th>#</th><th>配置</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead><tbody>${rows.map((r,i)=>{const wr=Math.round(r.wins/r.total*100),cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';return`<tr><td style="color:var(--text2);">${i+1}</td><td>${r.key}</td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td><td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}</tbody></table>`;
}
function renderPartsAnalysis(){
  const el=document.getElementById('analysisParts');if(!el)return;
  const ps={},track=(pid,won)=>{const p=state.parts.find(p=>p.id==pid);if(!p)return;if(!ps[p.id])ps[p.id]={id:p.id,name:p.name,cat:p.cat,wins:0,total:0};ps[p.id].total++;if(won)ps[p.id].wins++;};
  state.matches.forEach(m=>{m.p1Parts?.forEach(pid=>track(pid,m.winner===m.p1));m.p2Parts?.forEach(pid=>track(pid,m.winner===m.p2));});
  state.personalLogs.forEach(l=>{['blade','ratchet','bit'].forEach(k=>{if(l.config?.[k])track(l.config[k],l.result==='win');});});
  const rows=Object.values(ps).sort((a,b)=>(b.wins/b.total)-(a.wins/a.total)||b.total-a.total);
  if(!rows.length){el.innerHTML='<div class="analysis-empty">⚙️ 尚無零件使用記錄</div>';return;}
  const byType={};rows.forEach(r=>{(byType[r.cat]=byType[r.cat]||[]).push(r);});
  let html='';
  ['blade','ratchet','bit'].forEach(cat=>{
    const g=byType[cat];if(!g)return;
    html+=`<div class="analysis-section-title">${CAT_LABELS[cat]}</div><table class="analysis-table"><thead><tr><th>#</th><th>零件</th><th>場次</th><th>勝場</th><th>勝率</th></tr></thead><tbody>${g.map((r,i)=>{const wr=Math.round(r.wins/r.total*100),cls=wr>=60?'win-rate-high':wr>=40?'win-rate-mid':'win-rate-low';return`<tr><td style="color:var(--text2);">${i+1}</td><td><strong>${r.name}</strong></td><td>${r.total}</td><td style="color:var(--green);">${r.wins}</td><td><div class="win-rate-val ${cls}">${wr}%</div><div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div></td></tr>`;}).join('')}</tbody></table>`;
  });
  el.innerHTML=html;
}

// ═══════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════
function exportPersonalExcel(){
  if(!state.personalLogs.length){showToast('尚無個人記錄','error');return;}
  const rl={win:'勝',lose:'負',draw:'平'},pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const headers=['日期','對手','結果','我的分數','對手分數','鋼鐵戰刃','固鎖輪盤','軸心','備注'];
  const rows=state.personalLogs.map(l=>[l.date,l.opponent,rl[l.result]||l.result,l.myScore,l.oppScore,pn(l.config?.blade),pn(l.config?.ratchet),pn(l.config?.bit),l.note||'']);
  downloadCSV([headers,...rows],'個人戰績.csv');
}
function exportMultiExcel(){
  if(!state.matches.length){showToast('尚無多人記錄','error');return;}
  const pn=id=>state.parts.find(p=>p.id==id)?.name||'';
  const cfgStr=cfg=>cfg?['blade','ratchet','bit'].map(k=>pn(cfg[k])).filter(Boolean).join(' / '):'';
  const headers=['日期','選手A','A分數','選手B','B分數','勝者','A配置','B配置'];
  const rows=state.matches.map(m=>[m.date,m.p1,m.s1,m.p2,m.s2,m.winner,cfgStr(m.p1Config),cfgStr(m.p2Config)]);
  downloadCSV([headers,...rows],'多人戰績.csv');
}
function downloadCSV(data,filename){
  const csv='\uFEFF'+data.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download=filename;a.click();showToast(`✅ ${filename} 已下載！`,'success');
}

// ═══════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════
function closeModal(id){document.getElementById(id).classList.remove('show');}
function showToast(msg,type=''){
  const t=document.getElementById('toast');t.textContent=msg;t.className='toast'+(type?' '+type:'');
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);
}

// ═══════════════════════════════════════
//  TBXC 廣告
// ═══════════════════════════════════════
function expandAd(){document.getElementById('adCollapsed').style.display='none';document.getElementById('adExpanded').style.display='';}
function foldAd(){document.getElementById('adExpanded').style.display='none';document.getElementById('adCollapsed').style.display='';}
function closeAd(){document.getElementById('adBar').style.display='none';document.body.classList.add('ad-gone');sessionStorage.setItem('adClosed','1');}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
seedDefaultParts();
genPlayerInputs();
document.getElementById('playerCount').dispatchEvent(new Event('input'));
initAddForm();
renderParts();

// 廣告 session 狀態
if(sessionStorage.getItem('adClosed')){
  const adBar=document.getElementById('adBar');if(adBar)adBar.style.display='none';
  document.body.classList.add('ad-gone');
}