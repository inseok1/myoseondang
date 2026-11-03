// 990원 「다음 12개월」: 페이앱 결제 → 결제 확인 서버(server/pay.mjs)가 열어 준 달별 문장을 12달 칸 아래에 붙인다.
// 탭에는 주문 토큰과 사주 표식(원국+주제)만 남긴다. 이름·생년월일은 서버로 보내지 않는다.
import {features} from '../bank-features.js';

export const PAY_SERVER='https://myoseondang-pay-uasuwwm3hq-du.a.run.app';  // server/deploy.mjs가 알려 준 Cloud Run 주소
const SLOT='myoseondang-pay990';
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

async function pay(sig){
 const t=crypto.randomUUID().replaceAll('-','');
 sessionStorage.setItem(SLOT,JSON.stringify({t,sig}));
 const PayApp=await loadPayApp();
 PayApp.setTarget('_self');
 PayApp.call({userid:'myoseondang',shopname:'묘선당',goodname:'내 사주의 다음 12개월',price:'990',var1:t,smsuse:'n',checkretry:'y',
  feedbackurl:`${PAY_SERVER}/feedback`,returnurl:location.href.split('#')[0]+'#part7'});
}

function show(box,list,texts,seed){
 box.innerHTML=`<h3>다음 12개월 · 달마다 다른 이유와 방향</h3>${list.map(m=>{const v=texts[m.key];if(!v)return '';return `<article class="month-reading"><b>${esc(m.label)} · ${esc(m.star)}의 달</b><p>${esc(v[hash(`${seed}|${m.label}`)%v.length])}</p></article>`;}).join('')}<p class="muted">사주가 말하는 흐름입니다. 실제 선택은 그대의 상황에 맞춰 정하세요.</p>`;
}

export async function setupPaidMonths(calc,topic,seed){
 const section=document.querySelector('#part7'),card=section?.querySelector('.locked-card');
 if(!card||!PAY_SERVER)return;
 const list=months(calc,topic),sig=String(hash(JSON.stringify([calc['원국'],topic])));
 const button=card.querySelector('.lock-overlay');
 button.innerHTML='🔓 990원으로 12달 이유와 방향 열기<small>결제하면 바로 이 자리에서 열려요</small>';
 button.onclick=e=>{e.stopPropagation();button.disabled=true;pay(sig).catch(err=>{button.disabled=false;alert(err.message);});};
 const slot=readSlot();
 if(!slot||slot.sig!==sig)return;
 const box=document.createElement('div');box.className='personal-reading paid-months';box.textContent='결제를 확인하고 있어요…';card.replaceWith(box);
 const keys=[...new Set(list.map(m=>m.key))].join(',');
 for(let i=0;i<8;i++){
  const r=await fetch(`${PAY_SERVER}/months?t=${slot.t}&k=${encodeURIComponent(keys)}`).catch(()=>null);
  if(r?.ok){show(box,list,(await r.json()).months,seed);return;}
  if(r&&r.status!==402)break;
  await new Promise(ok=>setTimeout(ok,3000));
 }
 box.replaceWith(card);sessionStorage.removeItem(SLOT);button.disabled=false;
 alert('결제가 아직 확인되지 않았어요. 결제를 마쳤는데 열리지 않으면 인스타 DM으로 알려 주세요.');
}
