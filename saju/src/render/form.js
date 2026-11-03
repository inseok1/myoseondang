import {loadEngine} from '../engine.js';
import {lunarStatus} from '../lunar.js';
import {parseTimeText,suggestCities} from '../input.js';

const form=document.querySelector('#birth-form');
const error=document.querySelector('#form-error');
const review=document.querySelector('#input-review');
const cityInput=document.querySelector('#city');
const hint=document.querySelector('#city-hint');
const list=document.querySelector('#city-list');
const suggestions=document.querySelector('#city-suggestions');
const yearSelect=form.elements.year, monthSelect=form.elements.month, daySelect=form.elements.day;
let cities=[];

const option=(value,label=value)=>`<option value="${value}">${label}</option>`;
const thisYear=new Date().getFullYear();
yearSelect.innerHTML=option('', '년 선택')+Array.from({length:121},(_,i)=>thisYear-i).map(y=>option(y,`${y}년`)).join('');
monthSelect.innerHTML=option('', '월 선택')+Array.from({length:12},(_,i)=>option(i+1,`${i+1}월`)).join('');
function updateDays(){
  const y=Number(yearSelect.value)||2000, m=Number(monthSelect.value)||1, selected=Number(daySelect.value);
  const count=new Date(y,m,0).getDate();
  daySelect.innerHTML=option('', '일 선택')+Array.from({length:count},(_,i)=>option(i+1,`${i+1}일`)).join('');
  if(selected&&selected<=count)daySelect.value=String(selected);
}
monthSelect.addEventListener('change',updateDays);yearSelect.addEventListener('change',updateDays);
updateDays();
function refreshWeekday(){
  const [y,m,d]=[Number(yearSelect.value),Number(monthSelect.value),Number(daySelect.value)];
  const note=document.querySelector('#weekday-note');
  if(!y||!m||!d){note.textContent='';return;}
  const date=new Date(y,m-1,d);
  note.textContent=date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?`${y}년 ${m}월 ${d}일 · ${['일','월','화','수','목','금','토'][date.getDay()]}요일`:'';
}
yearSelect.addEventListener('change',refreshWeekday);monthSelect.addEventListener('change',refreshWeekday);daySelect.addEventListener('change',refreshWeekday);

fetch(new URL('../../cities.json',import.meta.url)).then(r=>r.json()).then(rows=>{
  cities=rows;
  list.innerHTML=rows.map(([name])=>option(name)).join('');
});
function cityMatches(query){
  return suggestCities(cities,query);
}
function setCity(name){cityInput.value=name;cityInput.dispatchEvent(new Event('input',{bubbles:true}));suggestions.hidden=true;}
cityInput.addEventListener('input',()=>{
  const value=cityInput.value.trim();
  if(value==='모름'||value==='unknown'){hint.textContent='출생지를 모르는 상태로 계산합니다.';suggestions.hidden=true;return;}
  const exact=cities.find(([name])=>name===value)||cities.find(([name])=>name===`${value}시`);
  const matches=cityMatches(value);
  if(exact){hint.textContent=`${exact[0]} · 경도 ${exact[1]}°를 적용합니다.`;suggestions.hidden=true;return;}
  hint.textContent=matches.length?`“${value}”에 가까운 도시를 골라 주세요.`:'목록에서 찾을 수 없어요. 가까운 도시를 검색해 주세요.';
  suggestions.innerHTML=matches.slice(0,5).map(([name,lon])=>`<button type="button" data-city-pick="${name}">${name}<small>경도 ${lon}°</small></button>`).join('');
  suggestions.hidden=!matches.length;
});
suggestions.addEventListener('click',e=>{const b=e.target.closest('[data-city-pick]');if(b)setCity(b.dataset.cityPick);});
document.querySelectorAll('[data-city]').forEach(b=>b.addEventListener('click',()=>setCity(b.dataset.city==='unknown'?'모름':b.dataset.city)));

document.querySelectorAll('[name="calendar"]').forEach(r=>r.addEventListener('change',()=>{
  const lunar=document.querySelector('[name="calendar"]:checked').value==='lunar';
  document.querySelector('#lunar-note').hidden=!lunar;
  form.elements.leap.disabled=!lunar;
}));
document.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>{
  const manual=document.querySelector('.manual-date');
  if(b.dataset.date==='manual'){manual.hidden=!manual.hidden;return;}
  let date=b.dataset.date==='today'?new Date():new Date(`${b.dataset.date}T12:00:00`);
  yearSelect.value=String(date.getFullYear());monthSelect.value=String(date.getMonth()+1);updateDays();daySelect.value=String(date.getDate());
  form.elements.yearManual.value='';form.elements.monthManual.value='';form.elements.dayManual.value='';manual.hidden=true;
  document.querySelector('#weekday-note').textContent=`${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 · ${['일','월','화','수','목','금','토'][date.getDay()]}요일`;
}));
document.querySelectorAll('[data-hour]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelector('#time-text').value=`${String(Number(b.dataset.hour)).padStart(2,'0')}:00`;
  document.querySelector('[name="unknownTime"]').checked=false;
  document.querySelectorAll('[data-hour]').forEach(x=>x.classList.toggle('selected',x===b));
}));
document.querySelector('[name="unknownTime"]').addEventListener('change',e=>{
  document.querySelector('#time-text').disabled=e.target.checked;
  document.querySelectorAll('[data-hour]').forEach(b=>b.disabled=e.target.checked);
});

function chosenDate(data){
  const manual=!document.querySelector('.manual-date').hidden;
  return manual?[Number(data.get('yearManual')),Number(data.get('monthManual')),Number(data.get('dayManual'))]:[Number(data.get('year')),Number(data.get('month')),Number(data.get('day'))];
}
function showError(message){error.textContent=message;review.hidden=false;review.scrollIntoView({behavior:'smooth',block:'center'});}

form.addEventListener('submit',async e=>{
  e.preventDefault();error.textContent='';review.hidden=true;
  const data=new FormData(form),[y,mo,d]=chosenDate(data),unknown=Boolean(data.get('unknownTime'));
  if(data.get('calendar')==='lunar'){showError(lunarStatus().message);return;}
  const birthday=new Date(y,mo-1,d);
  if(!y||y<1900||y>2100||mo<1||mo>12||d<1||d>31||birthday.getFullYear()!==y||birthday.getMonth()!==mo-1||birthday.getDate()!==d){showError('생년월일을 다시 확인해 주세요.');return;}
  let city=cities.find(([name])=>name===String(data.get('city')||'').trim());
  if(!city&&String(data.get('city')||'').trim()!=='모름'){
    const matches=cityMatches(String(data.get('city')||''));
    if(matches.length===1){city=matches[0];setCity(city[0]);}
    else{showError(matches.length?'출생 도시 후보를 아래 목록에서 골라 주세요.':'출생 도시를 선택해 주세요.');cityInput.focus();return;}
  }
  const time=unknown?null:parseTimeText(String(data.get('timeText')||''));
  if(!unknown&&!time){showError('태어난 시각을 다시 확인해 주세요. 예: 오후 7시, 새벽 1시 반, 19:00.');return;}
  const unknownCity=!city, payload={
    name:String(data.get('name')||'').trim(),sex:data.get('sex'),y,mo,d,
    hh:unknown?undefined:time[0],mi:unknown?undefined:time[1],unk:unknown,
    lon:city?city[1]:127.5,city:city?city[0]:'출생지 모름',uLon:!unknownCity,uEot:true,uYaja:true,
    question:String(data.get('question')||'').trim(),topic:data.get('topic')||'default',
    work:data.get('work')||'',relationship:data.get('relationship')||'',calendar:'solar'
  };
  try{const engine=await loadEngine();payload.calculation=engine.compute(payload);sessionStorage.setItem('myoseondang-current',JSON.stringify(payload));location.href='result.html';}
  catch(err){showError(err.message||'입력 내용을 확인해 주세요.');}
});
