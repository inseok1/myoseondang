// 무료 풀이를 문장 창고에서 골라 이어 붙인다(손님당 비용 0원). 같은 사주·같은 질문이면 언제 봐도 같은 글이 나온다.
import {MODULES,features,keyOf,MONTH_KEYWORD,STAR_GROUP} from '../bank-features.js';
import {josa} from './text.js';

const defaultLoad=(module,index)=>fetch(new URL(`../../content/bank-packed/${module}/${index}.json`,import.meta.url)).then(r=>r.ok?r.json():null);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const BRANCH_SOUND={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
const KIND={은:'eunneun',는:'eunneun',이:'iga',가:'iga',을:'eulreul',를:'eulreul',과:'gwawa',와:'gwawa',으로:'euro',로:'euro'};
// 조사는 괄호·숫자 앞의 낱말("정화(丁)"→정화, "丙午"→오, "35.9%"→퍼센트) 소리에 맞춘다
const spoken=v=>/%$/.test(v)?'퍼센트':(s=>BRANCH_SOUND[s.at(-1)]||s)(v.replace(/\s*\([^)]*\)/g,'').trim());
const fill=(text,values)=>text
 .replace(/(\{[^}]+\})(으로|로|은|는|이|가|을|를|과|와)(?=[\s,.])/g,(m,key,p)=>key in values?values[key]+josa(spoken(values[key]),KIND[p]):m)
 .replace(/\{[^}]+\}/g,m=>values[m]??m)
 .replace(/대운 대운/g,'대운');

function summary(calc,f,pick){
 const w=calc['원국']||{},v=f.values;
 const pillars=['연','월','일','시'].map(k=>w[k]).filter(Boolean).join(' · ');
 const base=`그대의 원국은 ${pillars}입니다. 태어난 날의 글자 ${v['{일간}']}${josa(spoken(v['{일간}']),'eulreul')} 나로 삼아 나머지 글자와의 관계를 읽습니다. 타고난 쓰임새를 뜻하는 격은 ${v['{격}']}이고, 균형을 돕는 기운인 용신은 ${v['{용신}']}입니다.`;
 const flow=[`지금은 ${v['{대운나이}']}부터 이어지는 ${v['{대운}']} 속에 있고, 이 대운의 중심 십성은 ${v['{대운십성}']}입니다. 여기에 ${v['{세운연도}']}의 세운 ${v['{세운}']}이 ${v['{세운십성}']}의 기운으로 겹칩니다. 아래 풀이는 이 원국의 바탕 위에 대운의 큰 흐름과 올해의 기운을 차례로 얹어 그대의 질문까지 이어 갑니다.`,
  `큰 흐름으로는 ${v['{대운나이}']}에 시작된 ${v['{대운}']}(${v['{대운십성}']})이 십 년의 무대를 깔고, ${v['{세운연도}']} 세운 ${v['{세운}']}(${v['{세운십성}']})의 기운이 올해의 주제를 더합니다. 이 순서대로 타고난 결, 오행의 균형, 지금의 운, 앞으로 열두 달을 살핀 뒤 그대의 질문으로 돌아옵니다.`][pick];
 return `${base} ${flow}`;
}

function relationPrefix(calc){
 const facts=(calc['관계']||[]).map(v=>String(v).match(/^([^·]+)·\s*([子丑寅卯辰巳午未申酉戌亥]{2,3})/)).filter(Boolean).map(m=>`${m[2]} ${m[1].trim()}`);
 return facts.length?`원국 글자 사이에는 ${facts.join(', ')}이 놓여 있습니다. `:'';
}

function months(calc){
 const list=(calc['월운']||[]).map(v=>String(v).match(/(\d{4})\.(\d{1,2})\s*\S+\s*\(([가-힣]+)/)).filter(Boolean);
 if(!list.length)return '';
 let lastYear='';
 const items=list.map(([,y,m,star])=>{const label=y!==lastYear?`${y}년 ${Number(m)}월`:`${Number(m)}월`;lastYear=y;return `${label}은 ${star}의 달로 '${MONTH_KEYWORD[STAR_GROUP[star]]}'`;});
 return ` 열두 달의 월운을 차례로 적으면 ${items.join(', ')}입니다. 같은 키워드가 이어지는 구간은 한 주제가 길게 흐르는 때이고, 키워드가 바뀌는 자리는 관심이 옮겨 가는 자리입니다.`;
}

// 결제로 받은 칸(answer 등)의 문장 후보 중 하나를 무료 칸과 같은 규칙으로 골라 채운다
export const fillPaid=(calc,topic,seed,id,variants)=>fill(variants[hash(`${seed}|${id}`)%variants.length],features(calc,topic).values);

export async function composeReading(calc,topic,seed,load=defaultLoad){
 const f=features(calc,topic);const sections={part1:[],part2:[],part3:[],part4:[],part5:[],part6:[],part7:[],part8:[]};
 const texts=await Promise.all(MODULES.map(async m=>{
  const index=m.keys().findIndex(parts=>keyOf(parts)===f.keys[m.id]);
  const variants=index<0?null:await load(m.id,index);
  if(!variants)throw new Error(`문장 창고에 없음: ${m.id} ${f.keys[m.id]}`);
  return [m,fill(variants[hash(`${seed}|${m.id}`)%variants.length],f.values)];
 }));
 for(const [m,text] of texts){
  let t=text;
  if(m.id==='relations')t=relationPrefix(calc)+t;
  if(m.id==='yearIntro')t+=months(calc);
  sections[m.part][m.slot]=t;
 }
 sections.part1[1]=summary(calc,f,hash(`${seed}|summary`)%2);
 return sections;
}
