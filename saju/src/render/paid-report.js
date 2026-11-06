// 1,000원 「○○운 전체 풀이」의 결론: 문장 창고가 아니라 이 사람 원국으로 직접 계산한다.
// 다음 12달·앞으로 6년의 간지마다 점수 = 주제별 십성 가중치(신강·신약 보정) + 용신·희신·기신 + 일지와의 합·충·형·파·해(+ 월지 충)
// 점수가 충분히 높은 달(≥1.5)만 열리는 달, 충분히 낮은 달(≤−1)만 조심할 달로 부른다. 근거는 실제 글자, 할 일은 그 달 근거의 종류에 맞춰 고른다.
// 2026-11-06 ChatGPT·Gemini 평가 반영: 같은 문장 반복·주제에 안 맞는 기신 문장·앞뒤 모순·근거와 따로 노는 할 일·보장형 표현을 없앰.
// 무료 화면 12달 표시와 결제 전 맛보기도 같은 계산을 쓴다.
import {josa} from './text.js';

const GAN=['갑','을','병','정','무','기','경','신','임','계'],GANH=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI=['자','축','인','묘','진','사','오','미','신','유','술','해'],JIH=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_OH=[0,0,1,1,2,2,3,3,4,4],JI_OH=[4,2,0,0,2,1,1,2,3,3,2,4],OH=['목','화','토','금','수'],OH_WORD=['나무','불','흙','쇠','물'];
const JEONGGI=[9,5,0,1,4,2,3,5,6,7,4,8];  // 지지 정기(본기) 천간
const YUKHAP=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]],CHUNG=[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const HYUNG=[[2,5],[5,8],[1,10],[10,7],[0,3]],JAHYUNG=[4,6,9,11];  // 寅巳·巳申·丑戌·戌未·子卯 (寅申·丑未는 충으로 셈), 자형 辰午酉亥
const PA=[[0,9],[3,6],[4,1],[7,10],[2,11],[5,8]],HAE=[[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
const pair=(list,a,b)=>list.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
const GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
export const TOPIC_NAME={money:'재물운',business:'사업운',jobchange:'이직운',employment:'취업운',dating:'연애운',marriage:'결혼운',reunion:'재회운',general:'전체 운'};
const LOVE=new Set(['dating','marriage','reunion']);
const kindOf=topic=>LOVE.has(topic)?'love':topic==='jobchange'||topic==='employment'?'career':topic==='money'||topic==='business'?topic:'general';
const strengthOf=r=>/극신약/.test(r.strength)?-2:/신약/.test(r.strength)?-1:/극신강/.test(r.strength)?2:/신강/.test(r.strength)?1:0;

// 주제별 십성 가중치. 신약하면 재성·관성·식상(나를 쓰게 하는 기운)은 버겁고 인성·비겁이 힘이 된다(재다신약), 신강하면 반대
function weightOf(topic,sex,star,st){
 const grp=GROUP[star],love=LOVE.has(topic),mate=sex==='F'?'관성':'재성';
 if(love){
  const base={dating:{mate:2,식상:1,인성:0,비겁:-1,other:0},marriage:{mate:2,식상:.5,인성:.5,비겁:-1,other:0},reunion:{mate:0,식상:.5,인성:1.5,비겁:-1,other:0}}[topic];
  let w=grp===mate?base.mate:base[grp]??base.other;
  if(topic==='marriage'&&grp===mate&&/^정/.test(star))w+=.5;
  if(star==='상관'&&sex==='F')w-=1;
  return w;
 }
 const W={money:{재성:2,식상:1.5,관성:.5,인성:0,비겁:-1.5},business:{식상:2,재성:2,인성:.5,관성:0,비겁:-1.5},jobchange:{관성:2,인성:1.5,식상:1,재성:.5,비겁:-.5},employment:{관성:2,인성:2,재성:.5,식상:0,비겁:-1},general:{비겁:.3,식상:.5,재성:.5,관성:.5,인성:.5}}[TOPIC_NAME[topic]?topic:'general'];
 let w=W[grp];
 if(topic==='money'||topic==='business'){
  if(st<0)w={재성:st<-1?-.5:1,식상:st<-1?0:1,관성:-.5,인성:1,비겁:st<-1?1:0}[grp];
  if(st>0)w={재성:2.5,식상:2,관성:.5,인성:-.5,비겁:-2}[grp];
  if(star==='겁재'&&w<=0)w-=.5;
 }
 if((topic==='jobchange'||topic==='employment')&&st<0)w={관성:1,인성:2.5,식상:topic==='employment'?0:.5,재성:0,비겁:0}[grp];
 if(star==='상관'&&topic==='employment')w-=1;
 return w;
}

// 주제별로 각 십성이 그 달에 하는 일(정·편을 나눠, 이웃한 달이 같은 문장이 되지 않게)
const STAR={
 money:{정재:'월급·정해진 수입처럼 꾸준히 들어오는 돈이 움직이는 기운',편재:'부수입이나 뜻밖의 기회처럼 크게 오가는 돈이 움직이는 기운',식신:'익숙한 솜씨가 차곡차곡 돈으로 바뀌는 기운',상관:'새로운 시도와 말솜씨가 수입으로 이어지는 기운',정관:'직장과 맡은 책임이 수입을 안정시키는 기운',편관:'부담스러운 일을 맡는 만큼 대가가 따르는 기운',정인:'계약·문서·도와주는 사람이 돈길을 받쳐 주는 기운',편인:'공부하고 준비한 것이 뒤늦게 쓸모를 찾는 기운',비견:'나와 비슷한 사람들이 모여 몫을 나누게 되는 기운',겁재:'돈을 빌려 달라거나 같이 하자는 사람이 나타나는 기운'},
 business:{정재:'단골과 꾸준한 매출이 쌓이는 기운',편재:'큰 거래나 새 판로가 열리는 기운',식신:'상품과 서비스가 손님에게 잘 닿는 기운',상관:'새 아이디어와 홍보가 눈길을 끄는 기운',정관:'신용과 허가·계약이 무게를 갖는 기운',편관:'경쟁과 압박이 커지는 만큼 버티면 자리가 잡히는 기운',정인:'계약서와 도와주는 사람이 붙는 기운',편인:'새 기술과 새 방식을 익히기 좋은 기운',비견:'동업자나 비슷한 가게가 나타나는 기운',겁재:'경쟁자가 손님과 몫을 나눠 가져가려는 기운'},
 career:{정관:'정식 자리와 직함이 들어오는 기운',편관:'어렵고 큰일을 맡기는 자리가 오는 기운',정인:'추천서·자격·서류가 힘을 얻는 기운',편인:'새 분야를 배우고 방향을 틀어 보는 기운',식신:'가진 실력이 자연스럽게 드러나는 기운',상관:'지금 자리의 답답함을 말로 드러내고 싶어지는 기운',정재:'연봉과 조건을 꼼꼼히 따지게 되는 기운',편재:'더 큰 기회를 찾아 움직이고 싶어지는 기운',비견:'혼자 서 보고 싶은 마음이 커지는 기운',겁재:'같은 자리를 노리는 경쟁자가 많아지는 기운'},
 general:{비견:'내 힘으로 서려는 기운',겁재:'경쟁이 붙는 기운',식신:'재능이 편하게 드러나는 기운',상관:'새 시도를 하고 싶어지는 기운',정재:'실속을 챙기는 기운',편재:'기회를 넓히는 기운',정관:'책임과 자리가 생기는 기운',편관:'압박 속에서 버티는 힘이 생기는 기운',정인:'도움과 배움이 들어오는 기운',편인:'생각이 깊어지는 기운'}
};
// 점수가 그 갈래의 평소 뜻과 반대로 나온 경우(신약해 비겁이 힘이 될 때, 재성·관성이 버거울 때) 문장도 그 방향으로
const POS_TEXT={비겁:'곁에서 힘을 보태 줄 사람이 생기는 기운'},NEG_TEXT={재성:'돈 일이 몰려 오히려 버거워지는 기운',관성:'책임이 무거워져 지치기 쉬운 기운',인성:'생각만 많아지고 움직임이 느려지는 기운',식상:'힘을 밖으로 쓰다 쉽게 지치는 기운'};
function starText(topic,sex,star,w=0){
 const k=kindOf(topic),grp=GROUP[star];
 if(k!=='love'&&w>0&&POS_TEXT[grp])return POS_TEXT[grp];
 if(k!=='love'&&w<0&&NEG_TEXT[grp]&&!(k==='career'&&star==='상관'))return NEG_TEXT[grp];
 if(k!=='love')return STAR[k][star];
 const mate=sex==='F'?'관성':'재성';
 if(grp===mate)return topic==='reunion'?'새로운 사람이 눈에 들어와 마음이 나뉘기 쉬운 기운':/^정/.test(star)?'오래 갈 진지한 인연이 눈에 들어오는 기운':'설레는 새 인연이 다가오는 기운';
 return {식신:'편안한 말과 표현으로 마음이 잘 전해지는 기운',상관:'숨겨 둔 마음을 솔직하게 꺼내게 되는 기운',정인:'지난 인연과 대화를 돌아보게 되는 기운',편인:'혼자 지난 일을 곱씹으며 마음을 정리하는 기운',비견:'친구나 비슷한 사람이 둘 사이에 끼어드는 기운',겁재:'경쟁자가 나타나기 쉬운 기운'}[star]||(sex==='F'?'현실 조건을 따지게 되는 기운':'일과 체면이 연애보다 앞서는 기운');
}
// 용신·희신·기신이 그 주제에서 하는 일
const YONG={money:'버는 힘이 붙습니다',business:'장사를 끌고 갈 힘이 붙습니다',career:'움직일 힘이 붙습니다',love:'마음에 여유가 생겨 사람을 편하게 대하게 됩니다',general:'일이 한결 수월하게 풀립니다'};
const GI={money:'들어온 만큼 새기 쉽습니다',business:'벌이는 만큼 비용과 피로가 커지기 쉽습니다',career:'무리하게 일을 떠안기 쉽습니다',love:'마음이 조급해져 안 해도 될 말을 하기 쉽습니다',general:'몸과 마음이 쉽게 지칩니다'};

const elWord=e=>`${OH_WORD[e]}(${OH[e]})`,ganWord=g=>`${GAN[g]}${OH[GAN_OH[g]]}(${GANH[g]})`,jiWord=j=>`${JI[j]}(${JIH[j]})`;
const gj=(w,k)=>josa(w.replace(/\(.*\)$/,''),k);

// 한 기둥(천간 g, 지지 j)이 이 사람·이 주제에 얼마나 좋은지: 점수, 근거(결론 쪽), 반대 근거 하나
export function scorePillar(engine,r,sex,topic,g,j){
 const k=kindOf(topic),love=LOVE.has(topic),st=strengthOf(r),reasons=[];
 const sg=engine.sipsin(r.dG,g),sj=engine.sipsin(r.dG,JEONGGI[j]);
 const wg=weightOf(topic,sex,sg,st),wj=weightOf(topic,sex,sj,st)*.8;
 if(GROUP[sg]===GROUP[sj]&&Math.sign(wg)===Math.sign(wj))
  reasons.push({w:wg+wj,kind:GROUP[sg],src:'gj',t:`위로 들어오는 ${ganWord(g)}${gj(ganWord(g),'gwawa')} 아래로 깔리는 ${jiWord(j)}${gj(jiWord(j),'iga')} 모두 그대에게 ${GROUP[sg]} 쪽, ${starText(topic,sex,sg,wg)}이 위아래로 겹칩니다`});
 else{
  reasons.push({w:wg,kind:GROUP[sg],src:'g',t:`위로 들어오는 ${ganWord(g)}${gj(ganWord(g),'eunneun')} 그대에게 ${sg}, ${starText(topic,sex,sg,wg)}입니다`});
  reasons.push({w:wj,kind:GROUP[sj],src:'j',t:`아래로 깔리는 ${jiWord(j)}의 속 기운은 ${sj}, ${starText(topic,sex,sj,wj)}입니다`});
 }
 // 용신·희신·기신: 천간·지지가 같은 오행이면 한 문장으로, 무게는 1.5배까지만
 const els=[GAN_OH[g],JI_OH[j]];
 for(const e of new Set(els)){
  const both=els[0]===e&&els[1]===e,x=both?1.5:1,where=both?'위아래로 겹쳐':els[0]===e?'위로':'아래로';
  if(e===r.yongsin)reasons.push({w:1.5*x,kind:'yong',src:'e'+e,t:`그대 사주에 모자란 ${elWord(e)} 기운이 ${where} 들어와 ${YONG[k]}`});
  else if(e===r.huisin)reasons.push({w:.75*x,kind:'yong',src:'e'+e,t:`그대를 돕는 ${elWord(e)} 기운이 ${where} 들어와 한결 수월합니다`});
  else if(e===r.gisin)reasons.push({w:-1.5*x,kind:'gi',src:'e'+e,t:`그대 사주에 부담이 되는 ${elWord(e)} 기운이 ${where} 들어와 ${GI[k]}`});
 }
 // 일지(나와 가장 가까운 자리)와의 관계: 합·충·형·파·해를 한 문장으로 묶는다(巳申처럼 합이면서 형·파인 경우)
 const d=r.dJ,hap=pair(YUKHAP,j,d),chung=pair(CHUNG,j,d),hyung=pair(HYUNG,j,d)||(j===d&&JAHYUNG.includes(j)),pa=pair(PA,j,d),hae=pair(HAE,j,d);
 if(hap||chung||hyung||pa||hae){
  let w=0;const name=`${jiWord(j)}${gj(jiWord(j),'gwawa')} 그대 일지 ${jiWord(d)}`,ga=gj(jiWord(d),'iga');
  if(hap)w+=topic==='reunion'?2.5:love?2:.5;
  if(chung)w+=topic==='jobchange'?1:topic==='marriage'||topic==='reunion'?-2:topic==='dating'?-1.5:-1;
  if(hyung)w+=love?-1.5:-1;
  if(pa)w-=.5;
  if(hae)w-=love?1:.5;
  const marks=[hap&&'합',chung&&'충',hyung&&'형',pa&&'파',hae&&'해'].filter(Boolean).join('·');
  const t=hap&&(hyung||pa||hae)?`${name}에는 ${marks}${josa(marks.slice(-1),'iga')} 함께 걸려, 묶이는 만큼 부딪힘도 생깁니다`
   :hap?`${name}${ga} 합을 이룹니다. ${topic==='reunion'?'끊겼던 인연이 다시 닿을 틈이 생기는 자리입니다':love?'곁의 사람과 가까워지기 쉬운 자리입니다':'가까운 사람과 일이 한데 묶이는 자리입니다'}`
   :chung?`${name}${ga} 충으로 부딪힙니다. ${topic==='jobchange'?'생활의 바탕이 흔들려 자리를 옮기기 쉬운 때입니다':love?'가장 가까운 사이가 부딪히기 쉬운 자리입니다':'생활의 바탕이 흔들리기 쉬운 때입니다'}`
   :hyung?`${name}${ga} 형으로 걸려, 같은 문제로 신경이 곤두서기 쉽습니다`
   :pa?`${name}${ga} 파로 걸려, 작은 약속이 어긋나기 쉽습니다`
   :`${name}${ga} 해로 걸려, ${love?'말 한마디에 서운함이 쌓이기 쉽습니다':'드러나지 않는 마찰이 생기기 쉽습니다'}`;
  if(w)reasons.push({w,kind:hap&&w>0?'hap':chung?'chung':'hyung',src:'rel',t});
 }
 if(j!==d&&pair(CHUNG,j,r.mJ)){const w=topic==='jobchange'?1:topic==='employment'||topic==='business'?-.5:0;if(w)reasons.push({w,kind:'chung',src:'m',t:`${jiWord(j)}${gj(jiWord(j),'iga')} 그대 월지 ${jiWord(r.mJ)}${gj(jiWord(r.mJ),'gwawa')} 충해 일터와 사회 자리에 변동이 생기는 기운입니다`});}
 const score=reasons.reduce((a,x)=>a+x.w,0);
 const side=reasons.filter(x=>score>=0?x.w>0:x.w<0).sort((a,b)=>Math.abs(b.w)-Math.abs(a.w));
 // 반대 근거는 결론 쪽 근거와 다른 글자에서 나왔고 무게가 1 이상일 때만 한 번 단다(같은 글자를 두고 좋다·나쁘다를 동시에 말하지 않게)
 const used=new Set(side.slice(0,3).map(x=>x.src));
 const counter=reasons.filter(x=>(score>=0?x.w<=-1:x.w>=1)&&!used.has(x.src)&&!(x.src==='gj'&&(used.has('g')||used.has('j')))&&!((x.src==='g'||x.src==='j')&&used.has('gj'))).sort((a,b)=>Math.abs(b.w)-Math.abs(a.w))[0];
 return {score,sg,reasons:side,counter:counter?.t};
}

// 할 일: 그 달 근거의 종류(가장 무거운 근거)에 맞춰 고른다
const DO_GOOD={
 money:{재성:'받을 돈은 이 달에 정리해 받고, 미뤄 둔 가격·연봉 이야기를 꺼내 보세요.',식상:'솜씨를 돈으로 바꿀 일감이나 부업을 작게 시작해 보세요. 반복해서 들어오는지 보며 키우면 됩니다.',관성:'회사나 거래처와의 계약·조건을 이 달에 정리해 두면 수입이 안정됩니다.',인성:'계약서와 서류 일을 이 달에 마무리하고, 도와줄 사람에게 먼저 조언을 구해 보세요.',비겁:'믿을 만한 사람과 힘을 합치면 혼자보다 낫습니다. 돈 약속은 꼭 글로 남기세요.',yong:'미뤄 둔 돈 결정을 이 달에 내려 보세요. 힘이 붙는 때라 판단이 덜 흔들립니다.',hap:'가까운 사람이 소개하는 일이나 기회를 가볍게 넘기지 마세요.',default:'들어오는 돈의 흐름을 적어 두고, 남는 돈부터 따로 떼어 두세요.'},
 business:{재성:'새 거래처와 새 판로를 이 달에 두드려 보세요.',식상:'신상품·홍보처럼 바깥으로 내미는 일을 이 달에 몰아서 해 보세요.',관성:'허가·계약·신용처럼 미뤄 둔 서류 일을 이 달에 끝내 두세요.',인성:'도움 줄 사람과 계약서를 꼼꼼히 챙기며 다음 판을 준비하세요.',비겁:'협업 제안은 조건을 글로 정리한 뒤에 받으세요.',yong:'미뤄 둔 확장 결정을 검토하기 좋은 때입니다. 작게 시험해 보고 넓히세요.',hap:'단골과 가까운 거래처에 먼저 연락해 소개를 부탁해 보세요.',default:'잘 팔리는 것과 안 팔리는 것을 나눠 보고, 잘 되는 쪽에 힘을 모으세요.'},
 jobchange:{관성:'가고 싶은 곳에 지원하거나 먼저 연락해 보세요. 제안이 오면 조건을 꼼꼼히 보고 답하세요.',인성:'추천해 줄 사람에게 연락하고, 자격과 서류를 이 달에 정리해 두세요.',식상:'포트폴리오와 이력서를 다듬어 실력을 보여 줄 준비를 하세요.',재성:'연봉과 조건 협상을 이 달에 꺼내 보세요.',비겁:'혼자 준비하던 계획을 날짜와 함께 적어 보세요.',yong:'망설이던 결정을 내리기 좋은 달입니다.',chung:'움직이고 싶은 마음이 커지는 달입니다. 옮길 곳을 먼저 정한 뒤에 움직이세요.',hap:'아는 사람을 통한 자리 소개에 귀를 열어 두세요.',default:'옮기고 싶은 이유를 세 가지로 적어 보고, 그 조건에 맞는 곳만 추려 보세요.'},
 employment:{관성:'지원서를 가장 많이 넣을 달입니다.',인성:'면접·시험 날짜를 고를 수 있다면 이 달로 잡고, 추천서를 부탁해 보세요.',식상:'실력이 드러나기 좋은 때입니다. 면접에서 할 말을 미리 연습해 두세요.',재성:'조건이 맞는 곳을 넓게 찾아보세요.',비겁:'함께 준비하는 사람과 정보를 나누면 도움이 됩니다.',yong:'망설이던 곳에 지원해 보세요.',hap:'아는 사람을 통한 소개에 귀를 열어 두세요.',default:'가고 싶은 곳 다섯 군데를 정해 하나씩 준비해 보세요.'},
 dating:{재성:'소개·모임 자리에 나가 새 사람을 만나 보세요.',관성:'소개·모임 자리에 나가 새 사람을 만나 보세요.',식상:'마음에 둔 사람에게 먼저 약속을 잡아 보세요.',인성:'지난 연애에서 아쉬웠던 점을 정리해 두면 다음 만남이 달라집니다.',hap:'곁에 있는 사람과 한 걸음 가까워질 이야기를 꺼내 보세요.',yong:'마음에 여유가 생기는 달입니다. 미뤄 둔 만남을 잡아 보세요.',default:'가볍게 만날 수 있는 자리를 하나 잡아 보세요.'},
 marriage:{재성:'결혼 이야기를 구체적으로 꺼내 보기 좋은 달입니다.',관성:'결혼 이야기를 구체적으로 꺼내 보기 좋은 달입니다.',식상:'서로 바라는 생활 방식을 솔직하게 나눠 보세요.',인성:'양가 인사나 서류 준비처럼 미뤄 둔 일을 챙겨 보세요.',hap:'날짜·집처럼 함께 정할 일을 이 달에 이야기해 보세요.',yong:'큰 결정을 차분히 논의하기 좋은 때입니다.',default:'함께 살 생활 계획(돈·집안일)을 적어 맞춰 보세요.'},
 reunion:{인성:'예전 대화를 돌아보고, 하고 싶은 말을 짧게 정리해 두세요.',식상:'연락한다면 긴 사과보다 짧은 안부 한 줄이 낫습니다.',hap:'다시 닿을 틈이 생기는 달입니다. 상대도 대화할 마음이 있는지 가볍게 확인해 보세요.',yong:'마음이 안정되는 달입니다. 연락하더라도 결론을 서두르지 마세요.',default:'내가 바라는 관계가 무엇인지 먼저 정리해 보세요.'},
 general:{재성:'실속을 챙길 일을 이 달에 정리해 보세요.',식상:'미뤄 둔 새 시도를 작게 시작해 보세요.',관성:'맡은 일에서 신뢰를 쌓기 좋은 때입니다.',인성:'배우고 싶던 것을 시작해 보세요.',비겁:'혼자 하던 일을 함께할 사람을 찾아보세요.',yong:'미뤄 둔 결정을 내리기 좋은 달입니다.',hap:'가까운 사람과의 약속을 챙기세요.',default:'미뤄 둔 일 하나를 골라 끝내 보세요.'}
};
const DO_BAD={
 money:{비겁:'돈을 빌려주거나 보증·동업을 약속하는 일은 이 달엔 미뤄 두세요. 큰 지출은 {next}로 옮기면 좋습니다.',gi:'새는 돈부터 막으세요. 구독·할부를 정리하고, 투자 결정은 {next}에 하세요.',chung:'생활이 흔들리기 쉬운 달이라 큰돈이 드는 결정은 {next}로 미루세요.',hyung:'돈 문제로 신경이 곤두서기 쉬우니 계약서와 영수증을 꼼꼼히 챙기세요.',관성:'일이 몰려 지출이 늘기 쉽습니다. 고정비부터 점검하세요.',default:'새는 돈부터 막고, 큰 결정은 {next}로 옮기세요.'},
 business:{비겁:'동업·확장 제안은 조건을 글로 남기고, 결정은 {next}로 미루세요.',gi:'확장·대출·채용은 이 달엔 멈추고 재고와 장부를 정리하세요. 벌이는 일은 {next}에 하세요.',chung:'거래처나 직원에 변동이 생기기 쉽습니다. 계약 조건을 다시 확인해 두세요.',hyung:'같은 문제로 다투기 쉬우니 약속은 글로 남기세요.',관성:'규정·세금·허가 일을 미리 챙겨 두세요.',default:'벌이는 일은 {next}로 미루고 지금 있는 손님부터 챙기세요.'},
 jobchange:{gi:'무리하게 일을 떠안기 쉬운 달입니다. 지금 자리에서 서류만 준비하고, 움직이는 건 {next}에 하세요.',비겁:'같은 자리를 노리는 사람이 많은 때라 서두르지 말고 준비를 단단히 하세요.',hyung:'윗사람과 부딪히기 쉬운 달입니다. 할 말은 적어 두었다가 {next}에 정리해서 하세요.',식상:'답답함을 홧김에 말하기 쉽습니다. 사표는 {next} 이후에 다시 생각해 보세요.',chung:'일정이 흔들리기 쉬우니 중요한 약속을 꼼꼼히 챙기세요.',default:'지금 자리에서 준비만 하고, 움직이는 건 {next}에 하세요.'},
 employment:{식상:'면접에서 말이 앞서기 쉽습니다. 답변을 짧게 다듬어 두세요.',gi:'결과 하나에 마음이 흔들리기 쉬운 달입니다. 부족한 자격과 포트폴리오를 채우고 {next}에 다시 지원하세요.',비겁:'경쟁이 센 때라 지원 수를 늘리기보다 맞는 곳을 골라 넣으세요.',chung:'일정이 흔들리기 쉬우니 면접과 서류 마감을 꼼꼼히 챙기세요.',hyung:'같은 실수가 반복되기 쉬우니 지원서를 한 번 더 점검하세요.',default:'준비를 다지고, 지원은 {next}에 몰아서 하세요.'},
 dating:{비겁:'친구나 다른 사람이 끼어들기 쉬운 달입니다. 둘만의 시간을 따로 잡아 보세요.',gi:'마음이 조급해지기 쉬운 달입니다. 중요한 고백이나 확인은 {next}에 하는 편이 낫습니다.',chung:'작은 말다툼이 커지기 쉬우니 무거운 이야기는 {next}로 미뤄 보세요.',hyung:'같은 문제로 다투기 쉬우니 서운한 점은 한 가지씩만 꺼내세요.',default:'가볍게 만나고, 중요한 이야기는 {next}에 하세요.'},
 marriage:{비겁:'주변 사람의 말에 흔들리기 쉬운 달입니다. 두 사람의 기준을 먼저 맞추세요.',gi:'집안 일이나 돈 문제로 부딪히기 쉬운 달입니다. 큰 결정은 {next}로 미루고 서로의 조건을 적어 보세요.',chung:'생활 계획이 흔들리기 쉬우니 날짜·집 결정은 {next}에 하세요.',hyung:'같은 문제로 다투기 쉬우니 정할 일을 글로 정리해 두세요.',default:'큰 결정은 {next}로 미루고 서로의 생각부터 맞춰 보세요.'},
 reunion:{gi:'감정이 앞서기 쉬운 달입니다. 연락하더라도 결론을 재촉하지 말고 짧고 차분한 안부로 시작하세요.',chung:'예전 다툼이 되풀이되기 쉬운 때입니다. 연락은 {next} 무렵이 더 자연스럽습니다.',비겁:'다른 사람 이야기에 마음이 흔들리기 쉽습니다. 내 마음부터 정리해 보세요.',hyung:'같은 문제로 서운함이 반복되기 쉬우니 지난 일을 따지기보다 지금 바라는 것을 말하세요.',default:'서두르지 말고 내 마음부터 정리해 보세요.'},
 general:{gi:'새 일을 벌이기보다 하던 일을 마무리하세요. 큰 결정은 {next}로 옮기세요.',비겁:'남의 부탁에 내 일을 미루지 마세요.',chung:'생활 리듬이 흔들리기 쉬우니 몸부터 챙기세요.',hyung:'같은 문제로 신경이 곤두서기 쉬우니 쉬는 시간을 따로 잡으세요.',관성:'맡은 일이 몰리기 쉬우니 거절할 것은 거절하세요.',default:'하던 일을 마무리하고, 큰 결정은 {next}로 옮기세요.'}
};
// 카드 근거가 비슷해 할 일이 겹칠 때 쓰는 여분(주제마다 두 개씩)
const MORE_GOOD={money:['이 달에 들어온 돈은 쓰기 전에 일부를 먼저 떼어 두세요.','작게라도 수입원을 하나 더 시험해 보세요.'],business:['단골에게 감사 인사와 함께 새 소식을 전해 보세요.','반응이 좋았던 상품을 한 번 더 밀어 보세요.'],jobchange:['관심 있는 회사의 사람을 한 명 만나 이야기를 들어 보세요.','지금 자리에서 쌓은 성과를 숫자로 정리해 두세요.'],employment:['지원한 곳의 일정과 결과를 한눈에 적어 두세요.','면접 뒤 짧은 감사 인사를 남겨 보세요.'],dating:['새로운 모임이나 취미 자리를 하나 찾아보세요.','마음이 가는 사람에게 가벼운 안부를 건네 보세요.'],marriage:['둘만의 계획을 날짜와 함께 적어 보세요.','서로의 가족 이야기를 편하게 나눠 보세요.'],reunion:['내가 달라진 점을 스스로 한 줄로 적어 보세요.','지인을 통해 근황을 듣더라도 판단은 서두르지 마세요.'],general:['미뤄 둔 연락 하나를 해 보세요.','이 달에 이룰 작은 목표 하나를 정해 보세요.']};
const MORE_BAD={money:['카드 사용 내역을 한 번 훑어보고 줄일 것 하나를 고르세요.','급한 돈 부탁은 하루 생각한 뒤에 답하세요.'],business:['재고와 외상값부터 정리해 두세요.','새 계약은 한 번 더 읽고 서명하세요.'],jobchange:['지금 회사에서 챙겨 둘 서류와 경력을 정리하세요.','감정이 앞설 때는 결정을 하루 미루세요.'],employment:['불합격 이유를 짧게 적어 다음 지원에 반영하세요.','체력과 생활 리듬부터 챙기세요.'],dating:['혼자만의 시간을 따로 잡아 마음을 정리하세요.','오해가 생기면 문자보다 직접 이야기하세요.'],marriage:['돈 이야기는 숫자로 적어 놓고 이야기하세요.','서로 쉬는 시간을 따로 챙기세요.'],reunion:['지난 일을 곱씹기보다 오늘 내 생활을 챙기세요.','감정이 올라올 때는 보내지 않을 편지로 먼저 써 보세요.'],general:['잠과 식사를 먼저 챙기세요.','약속을 줄이고 쉬는 날을 하루 정해 두세요.']};
const YEAR_GOOD={money:'수입이 들어오는 길을 하나 더 만들어 보기 좋은 해입니다. 새 수입은 작게 시작해 실제로 남는지 확인하며 키우세요.',business:'판을 넓혀 볼 만한 해입니다. 새 지점·새 상품·새 거래처를 작게 시험해 보고 반응이 오는 쪽을 키우세요.',jobchange:'옮기는 것을 진지하게 검토해 볼 해입니다. 상반기에 자리를 알아보고, 조건을 확인한 뒤 결정하세요.',employment:'지원을 가장 많이 해 볼 해입니다. 붙는 흐름이 강한 때라 준비한 만큼 기회가 옵니다.',dating:'새 인연이 들어오기 좋은 해입니다. 만나는 자리를 넓혀 보세요.',marriage:'결혼을 구체적으로 이야기해 보기 좋은 해입니다.',reunion:'관계를 다시 정리하거나 대화를 시도해 볼 만한 해입니다. 다시 이어지는 것은 두 사람이 함께 정하는 일입니다.',general:'미뤄 둔 큰 결정을 내려 보기 좋은 해입니다.'};
const YEAR_HARD={money:'지키는 쪽으로 가는 해입니다. 큰 투자·보증·동업은 충분히 따져 본 뒤에 하고, 생활비 석 달치 이상의 비상금을 먼저 마련해 두면 부담이 훨씬 줄어듭니다.',business:'확장보다 내실을 다질 해입니다. 고정비를 줄이고 현금을 쌓아 두면 다음 해에 크게 쓸 수 있습니다.',jobchange:'홧김에 나오기보다 옮길 자리를 먼저 정한 뒤 움직일 해입니다.',employment:'자격증·포트폴리오처럼 다음 해에 쓸 준비를 쌓을 해입니다.',dating:'서두르기보다 말이 통하는 사람인지 천천히 볼 해입니다.',marriage:'날을 잡기보다 생활 계획을 맞추는 데 쓸 해입니다.',reunion:'매달리기보다 나를 다시 세우는 데 쓸 해입니다. 달라진 내 모습이 다음 대화를 바꿉니다.',general:'벌이기보다 지키는 해입니다. 생활 리듬과 비상금을 먼저 챙기세요.'};
// 결과 맨 아래 BASIC으로 넘어가는 다리: 주제마다 손님이 실제로 품을 질문 하나
const BASIC_Q={money:'올해 모은 돈을 어디에 써야 할까?',business:'지금 가게를 넓혀도 될까?',jobchange:'지금 회사를 나가도 될까?',employment:'이 회사에 붙을 수 있을까?',dating:'이 사람과 잘될까?',marriage:'이 사람과 결혼해도 될까?',reunion:'그 사람과 다시 이어질 수 있을까?',general:'지금 하려는 이 일, 해도 될까?'};
const KIND_WORD={재성:'이때는 특히 돈이 직접 오가는 일에서 힘이 납니다.',식상:'이때는 특히 솜씨와 표현이 힘을 냅니다.',관성:'이때는 특히 일과 책임을 통해 힘이 납니다.',인성:'이때는 특히 도와주는 사람과 문서가 힘이 됩니다.',비겁:'이때는 특히 곁의 사람과 힘을 합칠 때 잘 풀립니다.',yong:'이때는 그대에게 모자란 기운이 채워져, 무엇을 하든 힘이 붙습니다.',hap:'이때는 특히 가까운 사람과의 연결에서 기회가 옵니다.',chung:'이때는 자리가 바뀌는 흐름을 타기 좋습니다.'};

const monthLabel=m=>{const [y,mo]=m.label.split('.');return `${y}년 ${Number(mo)}월`;};
// 다음 12달: 점수 1.5 이상 중 높은 3달 = 열리는 달, −1 이하 중 낮은 2달 = 조심할 달, 나머지는 평탄
export function rankMonths(engine,r,sex,topic){
 const list=engine.wolwoonList(r,12).map(m=>({...m,name:monthLabel(m),...scorePillar(engine,r,sex,topic,m.g,m.j)}));
 const byScore=[...list].sort((a,b)=>b.score-a.score);
 const good=byScore.filter(m=>m.score>=1.5).slice(0,3),bad=[...byScore].reverse().filter(m=>m.score<=-1).slice(0,2);
 list.forEach(m=>m.kind=good.includes(m)?'good':bad.includes(m)?'bad':'usual');
 const inOrder=a=>a.sort((x,y)=>list.indexOf(x)-list.indexOf(y));
 return {list,good:inOrder(good),bad:inOrder(bad)};
}
// 결제 전 맛보기: 몇 번 열리고, 첫 기회는 언제쯤(반기), 조심할 달은 몇 번
export function teaserInfo(engine,r,sex,topic){
 const {good,bad}=rankMonths(engine,r,sex,topic),f=good[0];
 return {good:good.length,bad:bad.length,first:f?`${f.label.slice(0,4)}년 ${Number(f.label.slice(5))<=6?'상반기':'하반기'}`:''};
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const why=x=>x.reasons.slice(0,3).map(v=>v.t).join('. ')+'.'+(x.counter?` 다만 ${x.counter}. 그래도 ${x.score>=0?'힘이 붙는 쪽이':'조심할 쪽이'} 더 큰 때입니다.`:'');
const pillarName=(g,j)=>`${GANH[g]}${JIH[j]}`;
// "2027년 2월 · 2027년 3월" → "2027년 2월·3월"
const joinMonths=ms=>{let last='';return ms.map(m=>{const y=m.name.slice(0,5),s=y===last?m.name.slice(6):m.name;last=y;return s;}).join('·');};

// 결제 확인 뒤 화면 맨 위에 붙일 전용 풀이(HTML). #paid-more 자리에 당주의 풀이 네 칸이 이어 붙는다
export function buildPaidReport(engine,r,{sex,name,topic}){
 topic=TOPIC_NAME[topic]?topic:'general';
 const title=TOPIC_NAME[topic],{list,good,bad}=rankMonths(engine,r,sex,topic);
 const nextGood=m=>list.slice(list.indexOf(m)+1).find(x=>x.kind==='good')?.name||'흐름이 나아지는 때';
 // 10월이 넘으면 올해는 거의 지나갔으니 내년부터 6년
 const years=engine.sewoonList(r,7).slice(new Date().getMonth()>=9?1:0).slice(0,6).map(y=>({...y,...scorePillar(engine,r,sex,topic,y.g,y.j)}));
 const top=[...years].sort((a,b)=>b.score-a.score)[0],low=[...years].sort((a,b)=>a.score-b.score)[0];
 const best=top.score>=1.5?top:null,hard=low.score<=-1?low:null;
 const nowYear=new Date().getFullYear(),cur=[...r.daeun].reverse().find(u=>u.year<=nowYear)||r.daeun[0],next=r.daeun[r.daeun.indexOf(cur)+1];
 const dscore=u=>scorePillar(engine,r,sex,topic,u.g,u.j).score,tone=s=>s>=2?'힘이 붙는':s<=-1?'버거운':'고른';
 const who=name?`${esc(name)}님`:'그대';
 const kinds=good.map(m=>m.reasons[0]?.kind).filter(k=>KIND_WORD[k]),main=[...kinds].sort((a,b)=>kinds.filter(x=>x===b).length-kinds.filter(x=>x===a).length)[0];
 const head=good.length?`사주는 ${who}의 ${title}이 <b>${joinMonths(good)}</b>에 힘을 얻는다고 말합니다.${main?` ${KIND_WORD[main]}`:''}`:`사주는 앞으로 열두 달이 ${title}에 크게 오르내리지 않는 고른 흐름이라고 말합니다.`;
 const tail=bad.length?` ${joinMonths(bad)}은 한 박자 쉬어 가며 지키는 달입니다.`:' 열두 달 가운데 크게 막히는 달은 없습니다.';
 // 할 일은 그 달 첫 근거의 종류로 고르되, 앞 카드와 같은 문장이 되면 그 달의 다음 근거로
 const cards=(ms,kind)=>{const pool=kind==='good'?DO_GOOD[topic]:DO_BAD[topic],seen=new Set();
  return ms.map(m=>{const opts=[...m.reasons.map(x=>pool[x.kind]).filter(Boolean),pool.default,...(kind==='good'?MORE_GOOD:MORE_BAD)[topic]],raw=opts.find(a=>!seen.has(a))||opts[0],act=raw.replace('{next}',nextGood(m));seen.add(raw);
   return `<article class="paid-month ${kind}"><p class="pm-head"><b>${m.name}</b><span>${pillarName(m.g,m.j)}월 · ${kind==='good'?'열리는 달':'조심할 달'}</span></p><p>${esc(why(m))}</p><p class="pm-do"><b>${kind==='good'?'이렇게 쓰세요':'이렇게 넘기세요'}</b> ${esc(act)}</p></article>`;}).join('');};
 const yearTag=y=>y===best?'가장 열리는 해':y===hard?'고비의 해':y.score>=1.5?'좋은 해':y.score<=-1?'조심할 해':'고른 해';
 const yearRow=y=>`<li class="${y===best?'good':y===hard?'bad':''}"><b>${y.year}년</b><span>${pillarName(y.g,y.j)}</span><em>${yearTag(y)}</em></li>`;
 const strip=list.map(m=>`<li class="${m.kind}"><b>${m.name.slice(6)}</b><span>${m.kind==='good'?'열림':m.kind==='bad'?'조심':'평탄'}</span></li>`).join('');
 return `<section id="paid-report" class="section paid-report"><p class="eyebrow">결제 완료 · ${esc(title)} 전체 풀이</p><h2>${who}의 ${esc(title)}</h2>
<div class="paid-verdict"><p>${head}${tail}</p></div>
<ul class="paid-strip" aria-label="다음 열두 달">${strip}</ul>
<h3>열리는 달</h3>${cards(good,'good')||'<p class="muted">크게 튀는 달 없이 고른 한 해입니다. 그만큼 계획한 일을 꾸준히 밀고 가기 좋습니다.</p>'}
${bad.length?`<h3>조심할 달</h3>${cards(bad,'bad')}`:''}
<h3>앞으로 6년</h3><ul class="paid-years">${years.map(yearRow).join('')}</ul>
<div class="paid-year-note">${best?`<p><b>${best.year}년</b> ${esc(why(best))} ${esc(YEAR_GOOD[topic])}</p>`:'<p>앞으로 6년은 크게 튀는 해 없이 고른 흐름입니다.</p>'}${hard?`<p><b>${hard.year}년</b> ${esc(why(hard))} ${esc(YEAR_HARD[topic])}</p>`:''}</div>
<h3>십 년 단위의 흐름</h3><p>지금은 ${cur.age}세(${cur.year}년)에 들어선 ${pillarName(cur.g,cur.j)} 대운으로, ${esc(title)}에는 ${tone(dscore(cur))} 십 년입니다.${next?` ${next.year}년(${next.age}세)부터 ${pillarName(next.g,next.j)} 대운으로 바뀌며 ${tone(dscore(next))} 흐름으로 넘어갑니다.`:''}</p>
<div id="paid-more"></div>
<div class="after-pay"><b>이 풀이는 그대 한 사람의 생년월일로 본 ${esc(title)}의 흐름이에요</b><p>「${esc(BASIC_Q[topic])}」처럼 지금 마음에 걸린 질문 하나는, 그대의 상황까지 듣고 당주가 따로 깊게 풀어 PDF로 드려요.</p><button class="button primary wide" data-buy="BASIC">BASIC 9,900원 · 내 질문 1개 깊게 보기</button><small>사주가 말하는 흐름입니다. 실제 선택은 그대의 상황에 맞춰 정하세요 · 이 주소를 저장하면 같은 생년월일로 다시 열려요</small></div></section>`;
}
