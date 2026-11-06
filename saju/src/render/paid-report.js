// 1,000원 「○○운 전체 풀이」의 결론: 문장 창고가 아니라 이 사람 원국으로 직접 계산한다.
// 다음 12달·앞으로 6년의 간지를 주제별 십성 가중치 + 용신·희신·기신 + 일지·월지와의 합·충으로 점수 매겨
// 열리는 달·조심할 달·좋은 해·고비 해를 고르고, 근거(실제 글자)와 할 일을 붙인다. 무료 화면 12달 표시도 같은 점수를 쓴다.
import {josa} from './text.js';

const GAN=['갑','을','병','정','무','기','경','신','임','계'],GANH=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI=['자','축','인','묘','진','사','오','미','신','유','술','해'],JIH=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_OH=[0,0,1,1,2,2,3,3,4,4],JI_OH=[4,2,0,0,2,1,1,2,3,3,2,4],OH=['목','화','토','금','수'],OH_WORD=['나무','불','흙','쇠','물'];
const JEONGGI=[9,5,0,1,4,2,3,5,6,7,4,8];  // 지지 정기(본기) 천간
const YUKHAP=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]],CHUNG=[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const pair=(list,a,b)=>list.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
const GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
export const TOPIC_NAME={money:'재물운',business:'사업운',jobchange:'이직운',employment:'취업운',dating:'연애운',marriage:'결혼운',reunion:'재회운',general:'전체 운'};
const LOVE=new Set(['dating','marriage','reunion']);

// 주제별: 십성 갈래가 그 주제에서 하는 일과 가중치. 연애 주제는 성별에 따라 이성 별(남=재성, 여=관성)을 바꿔 끼운다
const WEIGHT={money:{재성:2,식상:1.5,관성:.5,인성:0,비겁:-1.5},business:{식상:2,재성:2,인성:.5,관성:0,비겁:-1.5},jobchange:{관성:2,인성:1.5,식상:1,재성:.5,비겁:-.5},employment:{관성:2,인성:2,재성:.5,식상:0,비겁:-1},general:{비겁:.3,식상:.5,재성:.5,관성:.5,인성:.5}};
const ROLE={
 money:{재성:'돈이 직접 들어오고 나가는 기운',식상:'솜씨와 일이 돈으로 바뀌는 기운',관성:'직장과 책임이 수입을 붙드는 기운',인성:'문서·계약·도와주는 사람이 붙는 기운',비겁:'사람이 몰리고 돈을 나누게 되는 기운'},
 business:{재성:'매출과 거래가 붙는 기운',식상:'상품과 아이디어가 손님에게 닿는 기운',관성:'신용·허가·책임이 무거워지는 기운',인성:'계약서와 도와주는 사람이 붙는 기운',비겁:'동업자와 경쟁자가 나타나는 기운'},
 jobchange:{관성:'새 자리와 직함이 들어오는 기운',인성:'추천·서류·자격이 힘을 얻는 기운',식상:'지금 자리를 벗어나 내 방식을 펴고 싶은 기운',재성:'조건과 연봉을 따져 보게 되는 기운',비겁:'혼자 서고 싶은 마음과 경쟁이 커지는 기운'},
 employment:{관성:'합격과 자리가 들어오는 기운',인성:'서류·시험·추천이 통하는 기운',식상:'면접에서 말과 실력이 드러나는 기운',재성:'현실 조건을 맞추게 되는 기운',비겁:'경쟁자가 많아지는 기운'},
 love:{mate:'이성 인연이 다가오는 기운',식상:'매력과 표현이 살아나는 기운',인성:'마음을 돌아보고 기다리게 되는 기운',비겁:'친구나 경쟁자가 끼어드는 기운',other:{M:'책임과 체면이 앞서는 기운',F:'현실 조건을 따지게 되는 기운'}},
 general:{비겁:'내 힘으로 서려는 기운',식상:'재능과 표현이 드러나는 기운',재성:'돈과 실속을 챙기는 기운',관성:'책임과 자리가 무거워지는 기운',인성:'배움과 도움이 들어오는 기운'}
};
// 열리는 달 카드 세 장, 조심할 달 카드 두 장이 서로 다른 할 일을 말하도록 주제마다 문장을 여러 개 둔다
const GOOD_DO={
 money:['받을 돈은 이 달에 정리해 받고, 미뤄 둔 가격·연봉 이야기도 이 달에 꺼내세요.','부업이나 추가 일감처럼 들어오는 길을 하나 더 여는 달로 쓰세요. 이 달에 시작한 수입은 오래 붙습니다.','들어온 돈의 일부를 그날 바로 따로 떼어 두세요. 이 달에 만든 저축 습관이 한 해의 돈을 지킵니다.'],
 business:['신상품·홍보·거래처 제안처럼 바깥으로 내미는 일을 이 달에 몰아서 하세요.','미뤄 둔 가격 조정이나 새 판매처 입점을 이 달에 진행하세요.','단골에게 먼저 연락하고 소개를 부탁하세요. 이 달에 이어진 손님이 다음 손님을 데려옵니다.'],
 jobchange:['이력서를 고치고, 가고 싶은 곳에 먼저 연락하는 달로 쓰세요.','면접이나 제안이 오면 이 달 안에 답을 내는 편이 좋습니다.','연봉과 직함 협상을 이 달에 하세요. 조건을 분명히 말할수록 유리합니다.'],
 employment:['지원서를 가장 많이 넣을 달입니다.','면접·시험 날짜를 고를 수 있다면 이 달로 잡으세요.','추천해 줄 사람에게 이 달에 먼저 연락하세요. 사람을 통한 길이 열립니다.'],
 dating:['소개·모임 자리에 나가 새 사람을 만나세요.','마음에 둔 사람에게 먼저 약속을 잡으세요.','관계를 한 걸음 진전시키는 이야기를 이 달에 꺼내세요.'],
 marriage:['날짜·집처럼 결혼의 실무 이야기를 꺼내기 좋은 달입니다.','양가 인사나 상견례를 이 달에 잡으세요.','함께 살 생활 계획(돈·집안일)을 이 달에 맞춰 두세요.'],
 reunion:['다시 연락한다면 이 달이 가장 자연스럽습니다. 긴 사과보다 짧은 안부 한 줄로 시작하세요.','답이 오면 이 달 안에 짧게라도 얼굴을 보세요.','예전과 달라진 점을 말보다 행동으로 보여 줄 기회가 오는 달입니다.'],
 general:['미뤄 둔 결정을 이 달에 내리세요.','새로 시작할 일을 이 달에 몰아 두세요.','도움을 청할 사람에게 이 달에 먼저 연락하세요.']
};
const CAUTION_DO={
 money:['돈을 빌려주거나 보증·동업을 약속하는 일은 이 달에 하지 마세요. 큰 지출은 {next}로 옮기세요.','이 달엔 새는 돈부터 막으세요. 구독·카드 할부를 정리하고, 투자 결정은 {next}에 하세요.'],
 business:['확장·대출·채용 같은 큰 판은 이 달에 벌이지 마세요. 벌이는 일은 {next}에 하세요.','이 달엔 재고와 장부를 정리하고 외상값을 받는 데 힘을 쓰세요. 새 일은 {next}에 시작하세요.'],
 jobchange:['홧김에 사표를 내기 쉬운 달입니다. 지금 자리에서 서류만 준비하고, 움직이는 것은 {next}에 하세요.','윗사람과 부딪히기 쉬운 달입니다. 할 말은 적어 두었다가 {next}에 정리해서 하세요.'],
 employment:['결과 하나에 마음이 흔들리기 쉬운 달입니다. 서류를 다듬어 {next}에 다시 넣으세요.','이 달엔 지원 수를 늘리기보다 부족한 자격·포트폴리오를 채우세요. 성과는 {next}에 납니다.'],
 dating:['말이 엇갈려 오해가 커지기 쉬운 달입니다. 고백이나 관계 확인은 {next}로 미루세요.','이 달엔 가볍게 만나고 무거운 이야기는 피하세요. 중요한 대화는 {next}에 하세요.'],
 marriage:['집안 일이나 돈 문제로 부딪히기 쉬운 달입니다. 큰 결정은 {next}로 미루세요.','이 달엔 서로의 조건을 적어 보는 데서 멈추세요. 결정은 {next}에 하세요.'],
 reunion:['이 달에 연락하면 예전 다툼이 되풀이되기 쉽습니다. {next}까지 기다리세요.','이 달엔 상대 소식을 찾아보기보다 내 생활을 다지세요. 연락은 {next}에 하세요.'],
 general:['새 일을 벌이기보다 하던 일을 마무리하세요. 큰 결정은 {next}로 옮기세요.','이 달엔 몸과 생활 리듬을 먼저 챙기세요. 벌이는 일은 {next}에 하세요.']
};
const YEAR_GOOD={money:'이 해에는 수입 구조를 넓히세요. 부업·이직·가격 인상처럼 들어오는 길을 하나 더 만드는 결정이 오래 남습니다.',business:'이 해에 판을 키우세요. 새 지점·새 상품·새 거래처처럼 벌이는 일이 이 해에 뿌리를 내립니다.',jobchange:'옮길 거라면 이 해입니다. 상반기에 자리를 알아보고 이 해 안에 결정하세요.',employment:'이 해에 지원을 가장 많이 하세요. 붙는 흐름이 가장 강한 해입니다.',dating:'이 해에 만나는 인연을 가볍게 넘기지 마세요. 오래 갈 사람이 들어오는 해입니다.',marriage:'결혼을 생각한다면 이 해에 날을 잡는 쪽으로 움직이세요.',reunion:'다시 이어질 길이 가장 넓게 열리는 해입니다. 이 해에 먼저 손을 내밀어 보세요.',general:'이 해에 큰 결정을 몰아 두세요. 시작한 일이 오래 갑니다.'};
const YEAR_HARD={money:'이 해에는 지키는 쪽으로 가세요. 큰 투자·보증·동업은 피하고, 비상금을 석 달치 이상 먼저 만들어 두면 고비가 그냥 지나갑니다.',business:'이 해에는 확장보다 내실입니다. 고정비를 줄이고 현금을 쌓아 두면 다음 해에 크게 씁니다.',jobchange:'이 해에 홧김에 나오면 후회하기 쉽습니다. 옮길 자리를 먼저 정한 뒤 움직이세요.',employment:'이 해에는 자격증·포트폴리오처럼 다음 해에 쓸 무기를 만드세요. 준비한 만큼 다음 좋은 해에 붙습니다.',dating:'이 해에는 서두르지 마세요. 조건보다 말이 통하는지를 먼저 보면 흔들림이 줄어듭니다.',marriage:'이 해에는 날을 잡기보다 생활 계획을 맞추는 데 쓰세요. 맞춰 둔 만큼 다음 해가 편해집니다.',reunion:'이 해에는 매달리기보다 나를 다시 세우는 데 쓰세요. 달라진 모습이 다음 해의 연락을 바꿉니다.',general:'이 해에는 벌이기보다 지키세요. 건강한 생활 리듬과 비상금이 고비를 넘기는 힘입니다.'};

const ganWord=g=>`${GAN[g]}${OH[GAN_OH[g]]}(${GANH[g]})`,jiWord=j=>`${JI[j]}(${JIH[j]})`,elWord=e=>`${OH_WORD[e]}(${OH[e]})`;
const ganJosa=(g,k)=>josa(OH[GAN_OH[g]],k),jiJosa=(j,k)=>josa(JI[j],k);

// 한 기둥(천간 g, 지지 j)이 이 사람·이 주제에 얼마나 좋은지: 점수와 근거 목록
export function scorePillar(engine,r,sex,topic,g,j){
 const love=LOVE.has(topic),mate=sex==='F'?'관성':'재성',reasons=[];
 const weightOf=star=>{const grp=GROUP[star];let w=love?(grp===mate?2:grp==='식상'?1:grp==='비겁'?-1:0):(WEIGHT[topic]||WEIGHT.general)[grp];
  // 신약하면 비겁이 재물을 감당할 힘이 되고, 재성은 들어와도 버겁다(재다신약)
  if(!r.isStrong&&(topic==='money'||topic==='business')){if(grp==='비겁')w=-.5;if(grp==='재성')w=1.5;}
  if(star==='겁재'&&(topic==='money'||topic==='business'))w-=.5;
  if(star==='상관'&&(topic==='employment'||(love&&sex==='F')))w-=1;
  return w;};
 const roleOf=star=>{const grp=GROUP[star];if(!love)return (ROLE[topic]||ROLE.general)[grp];return grp===mate?ROLE.love.mate:ROLE.love[grp]||ROLE.love.other[sex==='F'?'F':'M'];};
 const sg=engine.sipsin(r.dG,g),sj=engine.sipsin(r.dG,JEONGGI[j]);
 reasons.push({w:weightOf(sg),t:`천간 ${ganWord(g)}${ganJosa(g,'eunneun')} 그대에게 ${sg}, 곧 ${roleOf(sg)}입니다`});
 reasons.push({w:weightOf(sj)*.8,t:GROUP[sj]===GROUP[sg]?`지지 ${jiWord(j)}도 같은 갈래의 ${sj}${josa(sj,'euro')} 겹쳐 이 기운이 두 배로 실립니다`:`지지 ${jiWord(j)}의 속 기운은 ${sj}, ${roleOf(sj)}입니다`});
 for(const [e,where] of [[GAN_OH[g],'천간'],[JI_OH[j],'지지']]){
  if(e===r.yongsin)reasons.push({w:1.5,t:`${where}에 그대에게 꼭 필요한 ${elWord(e)} 기운(용신)이 들어와 힘이 보태집니다`});
  else if(e===r.huisin)reasons.push({w:.75,t:`${where}에 용신을 돕는 ${elWord(e)} 기운(희신)이 들어옵니다`});
  else if(e===r.gisin)reasons.push({w:-1.5,t:`${where}의 ${elWord(e)} 기운은 그대 사주에 부담이 되는 기운(기신)이라 들어온 만큼 빠져나가기 쉽습니다`});
 }
 if(pair(YUKHAP,j,r.dJ))reasons.push({w:love?2:.5,t:`${jiWord(j)}${jiJosa(j,'iga')} 그대 일지 ${jiWord(r.dJ)}${jiJosa(r.dJ,'gwawa')} 육합합니다. ${love?'곁에 사람이 묶이는 자리라 인연이 붙습니다':'가까운 사람과 일이 한데 묶입니다'}`});
 if(pair(CHUNG,j,r.dJ))reasons.push({w:topic==='jobchange'?1:love?(topic==='marriage'||topic==='reunion'?-2:-1.5):-1,t:`${jiWord(j)}${jiJosa(j,'iga')} 그대 일지 ${jiWord(r.dJ)}${jiJosa(r.dJ,'gwawa')} 충합니다. ${topic==='jobchange'?'자리가 흔들려 움직이기 쉬운 때입니다':love?'가장 가까운 사이가 부딪히기 쉬운 자리입니다':'생활의 바탕이 흔들리기 쉬운 자리입니다'}`});
 if(j!==r.dJ&&pair(CHUNG,j,r.mJ))reasons.push({w:topic==='jobchange'?1:topic==='employment'||topic==='business'?-.5:0,t:`${jiWord(j)}${jiJosa(j,'iga')} 그대 월지 ${jiWord(r.mJ)}${jiJosa(r.mJ,'gwawa')} 충합니다. 일터와 사회 자리에 변동이 생기는 기운입니다`});
 const score=reasons.reduce((a,x)=>a+x.w,0);
 // 화면 근거는 결론과 같은 쪽(좋은 달엔 좋은 이유, 조심할 달엔 조심할 이유)만 센 순서로
 const side=reasons.filter(x=>score>=0?x.w>0:x.w<0).sort((a,b)=>(score>=0?b.w-a.w:a.w-b.w)),other=reasons.filter(x=>score>=0?x.w<0:x.w>0).sort((a,b)=>Math.abs(b.w)-Math.abs(a.w))[0];
 return {score,sg,reasons:side,counter:other?.t};
}

const monthLabel=m=>{const [y,mo]=m.label.split('.');return `${y}년 ${Number(mo)}월`;};
// 다음 12달: 점수 높은 3달(점수가 0보다 클 때)이 열리는 달, 낮은 2달(점수가 0보다 작을 때)이 조심할 달
export function rankMonths(engine,r,sex,topic){
 const list=engine.wolwoonList(r,12).map(m=>({...m,name:monthLabel(m),...scorePillar(engine,r,sex,topic,m.g,m.j)}));
 const byScore=[...list].sort((a,b)=>b.score-a.score);
 const good=byScore.filter(m=>m.score>0).slice(0,3),bad=byScore.reverse().filter(m=>m.score<0).slice(0,2);
 list.forEach(m=>m.kind=good.includes(m)?'good':bad.includes(m)?'bad':'usual');
 const inOrder=a=>a.sort((x,y)=>list.indexOf(x)-list.indexOf(y));
 return {list,good:inOrder(good),bad:inOrder(bad)};
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
// 결론 쪽 근거 셋 + 반대쪽에서 가장 센 근거 하나(다만 …)
const why=x=>x.reasons.slice(0,3).map(v=>v.t).join('. ')+'.'+(x.counter?` 다만 ${x.counter}.`:'');
const pillarName=(g,j)=>`${GANH[g]}${JIH[j]}`;

// 결제 확인 뒤 화면 맨 위에 붙일 전용 풀이(HTML). #paid-more 자리에 창고 문장(핵심 해석·대운·올해·12달)이 이어 붙는다
export function buildPaidReport(engine,r,{sex,name,topic}){
 topic=TOPIC_NAME[topic]?topic:'general';
 const title=TOPIC_NAME[topic],{list,good,bad}=rankMonths(engine,r,sex,topic);
 const nextGood=m=>list.slice(list.indexOf(m)+1).find(x=>x.kind==='good')?.name||'다음 열리는 달';
 // 10월이 넘으면 올해는 거의 지나갔으니 내년부터 6년
 const years=engine.sewoonList(r,7).slice(new Date().getMonth()>=9?1:0).slice(0,6).map(y=>({...y,...scorePillar(engine,r,sex,topic,y.g,y.j)}));
 const best=[...years].sort((a,b)=>b.score-a.score)[0],hard=[...years].sort((a,b)=>a.score-b.score)[0],hasHard=hard.score<0;
 const nowYear=new Date().getFullYear(),cur=[...r.daeun].reverse().find(u=>u.year<=nowYear)||r.daeun[0],next=r.daeun[r.daeun.indexOf(cur)+1];
 const dscore=u=>scorePillar(engine,r,sex,topic,u.g,u.j).score,tone=s=>s>=2?'힘이 붙는':s<=-1?'버거운':'고른';
 const who=name?`${esc(name)}님`:'그대';
 const head=good.length?`사주는 ${who}의 ${title}이 <b>${good.map(m=>m.name).join(' · ')}</b>에 가장 크게 열린다고 말합니다.`:`사주는 앞으로 열두 달이 ${title}에 크게 오르내리지 않는 고른 흐름이라고 말합니다.`;
 const tail=bad.length?` ${bad.map(m=>m.name).join(' · ')}은 한 박자 쉬어 가야 하는 달입니다.`:' 열두 달 가운데 크게 막히는 달은 없습니다.';
 const card=(m,kind,i)=>`<article class="paid-month ${kind}"><p class="pm-head"><b>${m.name}</b><span>${pillarName(m.g,m.j)}월 · ${kind==='good'?'열리는 달':'조심할 달'}</span></p><p>${esc(why(m))}</p><p class="pm-do"><b>${kind==='good'?'이렇게 쓰세요':'이렇게 넘기세요'}</b> ${esc((kind==='good'?GOOD_DO:CAUTION_DO)[topic][i].replace('{next}',nextGood(m)))}</p></article>`;
 const yearTag=y=>y===best?'가장 열리는 해':y===hard&&hasHard?'고비의 해':y.score>=1.5?'좋은 해':y.score<=-1?'조심할 해':'고른 해';
 const yearRow=y=>`<li class="${y===best?'good':y===hard&&hasHard?'bad':''}"><b>${y.year}년</b><span>${pillarName(y.g,y.j)} · ${y.sg}</span><em>${yearTag(y)}</em></li>`;
 return `<section id="paid-report" class="section paid-report"><p class="eyebrow">결제 완료 · ${esc(title)} 전체 풀이</p><h2>${who}의 ${esc(title)}</h2>
<div class="paid-verdict"><p>${head}${tail}</p></div>
<h3>열리는 달</h3>${good.map((m,i)=>card(m,'good',i)).join('')||'<p class="muted">크게 튀는 달 없이 고른 한 해입니다.</p>'}
${bad.length?`<h3>조심할 달</h3>${bad.map((m,i)=>card(m,'bad',i)).join('')}`:''}
<h3>앞으로 6년</h3><ul class="paid-years">${years.map(yearRow).join('')}</ul>
<div class="paid-year-note"><p><b>${best.year}년</b> ${esc(why(best))} ${esc(YEAR_GOOD[topic])}</p>${hasHard?`<p><b>${hard.year}년</b> ${esc(why(hard))} ${esc(YEAR_HARD[topic])}</p>`:''}</div>
<h3>십 년 단위의 흐름</h3><p>지금은 ${cur.age}세(${cur.year}년)에 들어선 ${pillarName(cur.g,cur.j)} 대운으로, ${esc(title)}에는 ${tone(dscore(cur))} 십 년입니다.${next?` ${next.year}년(${next.age}세)부터 ${pillarName(next.g,next.j)} 대운으로 바뀌며 ${tone(dscore(next))} 흐름으로 넘어갑니다.`:''}</p>
<div id="paid-more"></div></section>`;
}
