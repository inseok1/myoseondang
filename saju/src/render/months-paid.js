// 1,000원 「○○ 전체 풀이」: 고른 카테고리(주제) 하나의 유료 칸(PAID_MODULES: 핵심 해석·기운 쓰는 법·대운·올해·다음 12개월)을 한 번에 판다.
// 페이앱 결제(var1=주문 토큰, var2=set:<주제>) → 결제 확인 서버(server/pay.mjs)가 그 주제 문장만 내려주고, 이 파일이 각 칸 자리에 붙인다.
// 주문 토큰은 탭(sessionStorage)과 돌아오는 주소(?o=)에 남겨, 창을 닫아도 그 주소로 같은 생년월일·주제를 넣으면 다시 열린다. 이름·생년월일은 서버로 보내지 않는다.
import {features,TOPICS,PAID_MODULES} from '../bank-features.js';
import {fillPaid} from './bank-reading.js';

export const PAY_SERVER='https://myoseondang-pay-uasuwwm3hq-du.a.run.app';  // server/deploy.mjs가 알려 준 Cloud Run 주소
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

export async function setupPaidMonths(calc,topic,seed){
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
 card.innerHTML=`<img class="lock-art" src="assets/v3-lock.jpg" alt="봉인된 라벤더 편지"><div class="offer-body"><h3>${esc(title)} · 1,000원</h3><ul>${parts.map(p=>`<li>${esc(p.name)}</li>`).join('')}<li>다음 12개월, 달마다 이유와 방향</li></ul><button class="button primary wide">🔓 1,000원으로 ${esc(title)} 열기</button><small>결제하면 바로 이 화면에서 다섯 칸이 함께 열려요</small></div>`;
 const button=card.querySelector('button');
 button.onclick=()=>{button.disabled=true;pay(topic,sig,`${title} · 묘선당`).catch(err=>{button.disabled=false;alert(err.message);});};
 // 칸마다 붙은 잠긴 자리도 누르면 바로 결제창을 연다(아래로 내려가기만 하면 손님이 결제 버튼을 못 찾는다)
 spots.forEach(s=>s?.addEventListener('click',e=>{e.preventDefault();if(!button.disabled)button.click();}));

 // 결제하고 돌아왔으면(탭의 주문 또는 주소의 ?o=) 연다
 const q=new URLSearchParams(location.search),slot=readSlot();
 // 첫 화면에서 1,000원 카테고리를 고르고 왔으면 바로 결제창으로 간다(주소에서 pay를 지워 뒤로 가기로는 무료 화면이 보이게)
 if(q.get('pay')==='1'){history.replaceState(null,'',location.pathname);button.click();return;}
 const t=slot?.sig===sig?slot.t:(q.get('c')===topic&&TOKEN.test(q.get('o')||'')?q.get('o'):'');
 if(!t)return;
 const keys=[...parts.map(p=>`${p.m.id}:${p.key}`),...new Set(list.map(m=>`month:${m.key}`))];
 button.disabled=true;button.textContent='결제를 확인하고 있어요…';
 for(let i=0;i<8;i++){
  const r=await fetch(`${PAY_SERVER}/unlock?t=${t}&k=${encodeURIComponent(keys.join(','))}`).catch(()=>null);
  if(r?.ok){
   const texts=(await r.json()).texts;
   parts.forEach((p,i)=>{const v=texts[`${p.m.id}:${p.key}`];if(v&&spots[i])spots[i].outerHTML=`<div class="personal-reading paid-open"><h3>${esc(p.name)}</h3><p>${esc(fillPaid(calc,topic,seed,p.m.id,v))}</p></div>`;});
   card.outerHTML=`<div id="paid-offer" class="personal-reading paid-months"><h3>다음 12개월 · 달마다 다른 이유와 방향</h3>${list.map(m=>{const v=texts[`month:${m.key}`];if(!v)return '';return `<article class="month-reading"><b>${esc(m.label)} · ${esc(m.star)}의 달</b><p>${esc(v[hash(`${seed}|${m.label}`)%v.length])}</p></article>`;}).join('')}<p class="muted">사주가 말하는 흐름입니다. 실제 선택은 그대의 상황에 맞춰 정하세요.</p>
<div class="after-pay"><b>✅ ${esc(title)}가 열렸어요</b><p>이 주소를 저장해 두면 같은 생년월일로 언제든 다시 열 수 있어요.</p><p>마음에 걸린 질문이 따로 있다면, 질문 하나를 직접 적어 PDF로 받아 보세요.</p><button class="button primary wide" data-buy="BASIC">BASIC 9,900원 · 내 질문 1개 PDF</button><small>다른 카테고리도 1,000원에 따로 열 수 있어요 · <a href="index.html">카테고리 고르기</a></small></div></div>`;
   document.querySelector('#paid-offer [data-buy]')?.addEventListener('click',()=>document.querySelector('.mid-offer [data-buy="BASIC"],.end-offer [data-buy="BASIC"]')?.click());
   return;
  }
  if(r&&r.status!==402)break;
  await new Promise(ok=>setTimeout(ok,3000));
 }
 sessionStorage.removeItem(SLOT);button.disabled=false;button.textContent=`🔓 1,000원으로 ${title} 열기`;
 alert('결제가 아직 확인되지 않았어요. 결제를 마쳤는데 열리지 않으면 인스타 DM으로 알려 주세요.');
}
