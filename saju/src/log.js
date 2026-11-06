// 방문 기록(구글 설문지 '묘선당 무료 진단 기록')에 classic.html과 같은 줄 형식으로 남긴다: 종류|태어난 해|성별|달력|시간 여부|들어온 경로|주제|손님 번호
// 이름·태어난 달과 날·시각·지역은 보내지 않는다. 경로와 손님 번호는 첫 화면에서 정해 같은 탭의 결과 화면까지 이어 쓴다.
const LOG='https://docs.google.com/forms/d/e/1FAIpQLSfqbnJPIycDBdZuXx8ierUjKeJ041Qg_RR660HnrEHckc0psg/formResponse';
const keep=(k,make)=>{try{let v=sessionStorage.getItem(k);if(!v){v=make();sessionStorage.setItem(k,v);}return v;}catch{return make();}};
const S=new URLSearchParams(location.search).get('s');  // 주소에 경로 표시가 있으면 그것이 우선(같은 탭에서 다른 링크로 다시 들어온 경우)
try{if(S)sessionStorage.setItem('msd_src',S.slice(0,30));}catch{}
const SRC=keep('msd_src',()=>{try{return document.referrer?new URL(document.referrer).hostname.slice(0,30):'직접';}catch{return '직접';}});
const SID=keep('msd_sid',()=>Math.random().toString(36).slice(2,8));
export function log(kind,p={}){
 try{
  const row=[kind,p.y??'',p.sex??'',p.y?'양력':'',p.y?(p.unk?'시간모름':'시간있음'):'',SRC,p.topic??'',SID].join('|');
  fetch(LOG,{method:'POST',mode:'no-cors',keepalive:true,body:new URLSearchParams({'entry.1433921101':row})}).catch(()=>{});  // keepalive: 바로 다음 화면으로 넘어가도 보내지게
 }catch{}
}
