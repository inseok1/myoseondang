// 1,000원 「○○ 전체 풀이」: 고른 카테고리(주제) 하나의 유료 칸(PAID_MODULES: 핵심 해석·기운 쓰는 법·대운·올해·다음 12개월)을 한 번에 판다.
// 페이앱 결제(var1=주문 토큰, var2=set:<주제>) → 결제 확인 서버(server/pay.mjs)가 그 주제 문장만 내려주고, 이 파일이 각 칸 자리에 붙인다.
// 주문 토큰은 탭(sessionStorage)과 돌아오는 주소(?o=)에 남겨, 창을 닫아도 그 주소로 같은 생년월일·주제를 넣으면 다시 열린다. 이름·생년월일은 서버로 보내지 않는다.
import {features,TOPICS,PAID_MODULES} from '../bank-features.js';
import {fillPaid} from './bank-reading.js';
import {buildPaidReport,teaserInfo,TOPIC_NAME} from './paid-report.js';

export const PAY_SERVER='https://myoseondang-pay-uasuwwm3hq-du.a.run.app';  // server/deploy.mjs가 알려 준 Cloud Run 주소
// 디지털 콘텐츠 청약철회 안내(결제 칸마다 같은 문구)
export const REFUND='결제하면 바로 열리는 디지털 콘텐츠예요. 열린 뒤에는 청약철회가 제한돼요(전자상거래법 제17조 제2항 제5호). 결제 전에 보이는 미리보기가 맛보기예요. 결제했는데 열리지 않거나 계산 오류가 있으면 인스타 DM으로 알려 주세요. 다시 열어 드리거나 환불해 드려요.';
const SLOT='myoseondang-pay990',TOKEN=/^[A-Za-z0-9_-]{20,64}$/;
const hash=s=>{let h=2166136261;for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

function months(calc,topic){
 const [t,strength]=features(calc,topic).keys.opening;
 return (calc['월운']||[]).map(v=>String(v).match(/(\d{4})\.(\d{1,2})\s*\S+\s*\(([가-힣]+)/)).filter(Boolean).map(([,y,m,star])=>({label:`${y}년 ${Number(m)}월`,star,key:`${star}|${strength}|${t}`}));
}
const readSlot=()=>{try{return JSON.parse(sessionStorage.getItem(SLOT)||'null');}catch{return null;}};

function loadPayApp(){
 if(window.PayApp)return Promise.resolve(window.PayApp);
 return new Promise((ok,fail)=>{const s=document.createElement('script');s.src='https://lite.payapp.kr/public/api/v2/payapp-lite.js';s.onload=()=>ok(window.PayApp);s.onerror=()=>fail(new Error('결제창을 불러오지 못했어요'));document.head.append(s);});
}

async function pay(topic,sig,goodname){
 const t=crypto.randomUUID().replaceAll('-','');
 sessionStorage.setItem(SLOT,JSON.stringify({t,sig}));
 const PayApp=await loadPayApp();
 PayApp.setTarget('_self');
 const back=new URL(location.href);back.search=`?o=${t}&c=${topic}`;back.hash='paid-offer';
 PayApp.call({userid:'myoseondang',shopname:'묘선당',goodname,price:'1000',var1:t,var2:`set:${topic}`,smsuse:'n',redirectpay:'1',checkretry:'y',
  feedbackurl:`${PAY_SERVER}/feedback`,returnurl:back.href});
}

// ctx: {engine,r,sex,name} — 결제 뒤 원국으로 직접 계산한 결론(paid-report.js)을 만들 때 쓴다
export async function setupPaidMonths(calc,topic,seed,ctx){
 if(!PAY_SERVER)return;
 topic=TOPICS[topic]?topic:'general';
 const sig=String(hash(JSON.stringify([calc['원국'],topic]))),subject=TOPICS[topic],f=features(calc,topic);
 const title=topic==='general'?'내 사주 전체 풀이':`${subject}운 전체 풀이`,list=months(calc,topic);
 const parts=PAID_MODULES.filter(m=>m.part).map(m=>({m,name:m.title.replace('이 주제',subject),key:f.keys[m.id]}));
 // 칸마다 잠긴 자리: 무엇이 들어 있는지만 보이고, 누르면 아래 결제 칸으로 간다
 const spots=parts.map(({m,name})=>{
  const section=document.querySelector(`#${m.part}`);if(!section)return null;
  const spot=document.createElement('a');spot.className='paid-spot';spot.href='#paid-offer';
  spot.innerHTML=`<b>🔒 ${esc(name)}</b><small>「${esc(title)}」 1,000원 · 누르면 바로 결제로 열려요</small>`;const lock=section.querySelector('.locked-card');lock?lock.before(spot):section.append(spot);return spot;
 });
 // 결제 칸 하나: result.js가 #part7에 만든 잠긴 칸을 봉인 편지 칸으로 바꾼다
 const card=document.querySelector('#part7 .locked-card');if(!card)return;
 card.id='paid-offer';card.classList.add('paid');
 card.innerHTML=`<img class="lock-art" src="assets/v3-lock.jpg" alt="봉인된 라벤더 편지"><div class="offer-body"><h3>${esc(title)} · 1,000원</h3><ul><li>다음 열두 달 중 열리는 달·조심할 달과 그 이유(그대 원국의 실제 글자로)</li><li>달마다 이렇게 쓰세요 · 이렇게 넘기세요</li><li>앞으로 6년의 가장 열리는 해와 고비의 해</li><li>지금 대운과 다음 대운의 흐름</li><li>당주의 풀이: ${parts.map(p=>esc(p.name)).join(' · ')}</li></ul><button class="button primary wide">🔓 1,000원으로 ${esc(title)} 열기</button><small>결제하면 바로 이 화면 맨 위에 열려요</small><small class="refund-note">${REFUND}</small></div>`;
 const button=card.querySelector('button');
 button.onclick=()=>{button.disabled=true;pay(topic,sig,`${title} · 묘선당`).catch(err=>{button.disabled=false;alert(err.message);});};
 // 칸마다 붙은 잠긴 자리도 누르면 바로 결제창을 연다(아래로 내려가기만 하면 손님이 결제 버튼을 못 찾는다)
 spots.forEach(s=>s?.addEventListener('click',e=>{e.preventDefault();if(!button.disabled)button.click();}));

 // 결제하고 돌아왔으면(탭의 주문 또는 주소의 ?o=) 연다
 const q=new URLSearchParams(location.search),slot=readSlot();
 // 첫 화면에서 1,000원 카테고리를 고르고 왔으면 바로 결제창으로 간다(주소에서 pay를 지워 뒤로 가기로는 무료 화면이 보이게)
 if(ctx&&topic!=='general')teaser(calc,topic,ctx,title,button,q.get('pay')==='1');
 if(q.get('pay')==='1'){history.replaceState(null,'',location.pathname);return;}
 const t=slot?.sig===sig?slot.t:(q.get('c')===topic&&TOKEN.test(q.get('o')||'')?q.get('o'):'');
 if(!t)return;
 const keys=[...parts.map(p=>`${p.m.id}:${p.key}`),...new Set(list.map(m=>`month:${m.key}`))];
 button.disabled=true;button.textContent='결제를 확인하고 있어요…';
 for(let i=0;i<8;i++){
  const r=await fetch(`${PAY_SERVER}/unlock?t=${t}&k=${encodeURIComponent(keys.join(','))}`).catch(()=>null);
  if(r?.ok){
   const texts=(await r.json()).texts;
   openPaid({calc,topic,seed,ctx,title,parts,list,texts,spots,card});
   return;
  }
  if(r&&r.status!==402)break;
  await new Promise(ok=>setTimeout(ok,3000));
 }
 sessionStorage.removeItem(SLOT);button.disabled=false;button.textContent=`🔓 1,000원으로 ${title} 열기`;
 alert('결제가 아직 확인되지 않았어요. 결제를 마쳤는데 열리지 않으면 인스타 DM으로 알려 주세요.');
}

// 결제 확인 뒤: 무료 풀이 사이에 끼워 넣지 않고, 이 주제만 담은 전용 풀이를 맨 위에 따로 펼치고 무료 풀이는 접어 둔다
function openPaid({calc,topic,seed,ctx,title,parts,list,texts,spots,card}){
 spots.forEach(s=>s?.remove());card.remove();
 const root=document.querySelector('#result-content'),hero=root.querySelector('.result-hero');
 const fold=document.createElement('details');fold.className='free-fold';fold.innerHTML='<summary>무료 기본 풀이 다시 보기 (원국표 · 기질 · 오행)</summary>';
 [...root.children].filter(el=>el!==hero).forEach(el=>fold.append(el));
 hero.insertAdjacentHTML('afterend',buildPaidReport(ctx.engine,ctx.r,{sex:ctx.sex,name:ctx.name,topic}));
 const report=root.querySelector('#paid-report');report.after(fold);
 root.querySelector('#paid-more').outerHTML=`<h3>당주의 풀이</h3>${parts.map(p=>{const v=texts[`${p.m.id}:${p.key}`];return v?`<div class="personal-reading paid-open"><h3>${esc(p.name)}</h3><p>${esc(fillPaid(calc,topic,seed,p.m.id,v))}</p></div>`:'';}).join('')}`;
 root.querySelector('#paid-teaser')?.remove();
 report.querySelector('[data-buy]')?.addEventListener('click',()=>document.querySelector('.mid-offer [data-buy="BASIC"],.end-offer [data-buy="BASIC"],#buy-basic')?.click());
 report.scrollIntoView();
}

// 결제 전 미리보기: 결론의 윤곽(열리는 달 수·첫 기회의 반기·조심할 달 수)까지 보여 주고, 정확한 달·이유·할 일은 결제 뒤에
function teaser(calc,topic,ctx,title,button,scroll){
 const root=document.querySelector('#result-content'),hero=root?.querySelector('.result-hero');if(!hero)return;
 const t=teaserInfo(ctx.engine,ctx.r,ctx.sex,topic),who=ctx.name?`${esc(ctx.name)}님`:'그대';title=TOPIC_NAME[topic]||title;
 const line=t.good?`앞으로 열두 달 가운데 ${who}의 ${esc(title)}이 힘을 얻는 달은 <b>${t.good}번</b> 있고, 첫 기회는 <b>${t.first}</b>에 옵니다.`:`앞으로 열두 달은 ${esc(title)}이 크게 오르내리지 않는 고른 흐름입니다. 그 안에서 조금 더 나은 때와 할 일을 짚어 드려요.`;
 const tail=t.bad?` 한 박자 쉬어 가야 할 달도 <b>${t.bad}번</b> 보입니다.`:' 크게 막히는 달은 보이지 않습니다.';
 hero.insertAdjacentHTML('afterend',`<section id="paid-teaser" class="section paid-report"><p class="eyebrow">${esc(title)} 미리보기 · 무료</p><div class="paid-verdict"><p>${line}${tail}</p></div><p class="muted">정확히 몇 월인지, 왜 그런지(그대 원국의 실제 글자), 그 달에 무엇을 하면 좋은지, 앞으로 6년의 좋은 해와 고비의 해는 1,000원 풀이에서 열려요.</p><button class="button primary wide" type="button">🔓 1,000원으로 정확한 달과 할 일 보기</button><small class="refund-note">${REFUND}</small></section>`);
 const b=root.querySelector('#paid-teaser button');b.onclick=()=>{if(!button.disabled)button.click();};
 if(scroll)root.querySelector('#paid-teaser').scrollIntoView();
}
