// 문장 창고: 계산값 → 열쇠·자리표시 값. 창고를 만드는 스크립트(scripts/build-bank.mjs)와 화면 조립기(src/render/bank-reading.js)가 함께 쓴다.
export const TOPICS={business:'사업',reunion:'재회',marriage:'결혼',dating:'연애',jobchange:'이직',employment:'취업',money:'재물',move:'이사·이동',exam:'시험·공부',health:'생활 리듬',general:'삶 전반'};
export const GROUPS=['비겁','식상','재성','관성','인성'];
export const STARS=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
export const STAR_GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
export const GROUP_MEANING={비겁:'자립·동료·경쟁',식상:'재능·표현',재성:'돈·실속·관리',관성:'책임·규칙·직장',인성:'배움·문서·도움'};
export const MONTH_KEYWORD={비겁:'사람 · 자립',식상:'표현 · 재능',재성:'실속 · 관리',관성:'책임 · 약속',인성:'배움 · 정리'};
export const ELEMENTS=['목','화','토','금','수'];
export const ELEMENT_MEANING={목:'나무(자라남·시작)',화:'불(드러냄·열정)',토:'흙(버팀·중재)',금:'쇠(기준·결단)',수:'물(지혜·흐름)'};
export const STEMS={'甲':'갑목','乙':'을목','丙':'병화','丁':'정화','戊':'무토','己':'기토','庚':'경금','辛':'신금','壬':'임수','癸':'계수'};
export const SEASONS=['봄','여름','가을','겨울'];
export const STRENGTHS={약:'일간의 힘이 약한 편(신약)',중:'일간의 힘이 고른 편(중화)',강:'일간의 힘이 센 편(신강)'};
export const GYEOKS=['건록격','양인격','식신격','상관격','편재격','정재격','편관격','정관격','편인격','정인격'];
export const RELATION_KINDS=['합','충','합+충','형파해','합+형파해','충+형파해','합+충+형파해','없음'];

const seasonOf=ji=>({寅:'봄',卯:'봄',辰:'봄',巳:'여름',午:'여름',未:'여름',申:'가을',酉:'가을',戌:'가을',亥:'겨울',子:'겨울',丑:'겨울'})[ji];
const strengthOf=v=>/약/.test(v)?'약':/강/.test(v)?'강':'중';
// 관계 줄 형식: "육합 · 酉辰 합 → 금", "파 · 丑辰 파", "충 · 子午 충"
export function relationKey(list){const kinds=list.map(v=>String(v).split('·')[0].trim());const has=[kinds.some(k=>/합/.test(k))&&'합',kinds.some(k=>/충/.test(k))&&'충',kinds.some(k=>/^(형|파|해|자형|삼형)/.test(k))&&'형파해'].filter(Boolean);return has.length?has.join('+'):'없음';}

// 각 모듈: 화면 칸(part, 문단 순서), 글자 수, 열쇠 목록, 열쇠 설명(창고 작성용), 쓸 수 있는 자리표시
export const MODULES=[
 {id:'opening',part:'part1',slot:0,chars:540,keys:()=>cross(Object.keys(TOPICS),Object.keys(STRENGTHS)),describe:([t,s])=>`질문 분야: ${TOPICS[t]} / ${STRENGTHS[s]}. 풀이 첫머리에서 질문에 대한 첫 방향과 이 풀이가 무엇을 근거로 읽는지 말한다.`,slots:['{일간}','{세운연도}']},
 {id:'answer',part:'part2',slot:0,chars:850,keys:()=>cross(GROUPS,GROUPS,Object.keys(TOPICS)),describe:([y,d,t])=>`올해 세운의 십성 갈래: ${y}(${GROUP_MEANING[y]}) / 지금 대운의 십성 갈래: ${d}(${GROUP_MEANING[d]}) / 질문 분야: ${TOPICS[t]}. 질문에 직접 답한다 — 결론, 근거(두 기운이 만나는 방식), 생활 속 대응 방법.`,slots:['{세운연도}','{세운십성}','{대운십성}']},
 {id:'temper',part:'part3',slot:0,chars:550,keys:()=>cross(Object.keys(STEMS),SEASONS,Object.keys(STRENGTHS)),describe:([g,s,k])=>`일간: ${STEMS[g]} / 태어난 계절: ${s} / ${STRENGTHS[k]}. 이 사람의 기본 결과 성격을 생활 장면으로. 계절 낱말이 든 문장에는 권유·평가(좋습니다, 유리합니다 등)를 넣지 않는다.`,slots:['{일간}']},
 {id:'stars',part:'part3',slot:1,chars:620,keys:()=>cross(GROUPS,GROUPS).filter(([a,b])=>a!==b),describe:([a,b])=>`원국에서 가장 두드러진 십성 갈래: ${a}(${GROUP_MEANING[a]}) / 가장 적거나 빈 갈래: ${b}(${GROUP_MEANING[b]}). 십성 분포가 생활에서 드러나는 장면과 빈 쪽을 채우는 방법. 갈래 이름(비겁·식상·재성·관성·인성)으로만 말하고 개별 십성 이름은 쓰지 않는다.`,slots:[]},
 {id:'gyeok',part:'part3',slot:2,chars:570,keys:()=>cross(GYEOKS,GROUPS),describe:([g,d])=>`격: ${g} / 지금 대운의 십성 갈래: ${d}(${GROUP_MEANING[d]}). 타고난 쓰임(격)이 지금 대운과 어떻게 이어지는지. 대운의 개별 십성 이름은 {대운십성} 자리표시로만 쓴다.`,slots:['{격}','{대운나이}','{대운십성}']},
 {id:'elements',part:'part4',slot:0,chars:700,keys:()=>cross(ELEMENTS,ELEMENTS).filter(([a,b])=>a!==b),describe:([a,b])=>`오행 중 가장 많은 기운: ${ELEMENT_MEANING[a]} / 가장 적은 기운: ${ELEMENT_MEANING[b]}. 넘치는 쪽이 생활에서 드러나는 모습과 모자란 쪽을 채우는 생활 방법.`,slots:['{최다오행}','{최소오행}']},
 {id:'relations',part:'part4',slot:1,chars:600,keys:()=>cross(RELATION_KINDS,ELEMENTS),describe:([r,e])=>`원국 글자 사이의 관계 종류: ${r==='없음'?'두드러진 합·충·형·파·해가 없음':r.replace('형파해','형·파·해')} / 일간 오행: ${ELEMENT_MEANING[e]}. 관계(합=묶임·협력, 충=부딪힘·변화, 형·파·해=마찰·조정)가 사람 사이·일에서 드러나는 장면. 어느 글자끼리인지는 쓰지 않는다(앞에 따로 붙는다).`,slots:[]},
 {id:'yongsin',part:'part5',slot:0,chars:680,keys:()=>cross(ELEMENTS,ELEMENTS),describe:([y,e])=>`용신(균형을 돕는 기운): ${ELEMENT_MEANING[y]} / 일간 오행: ${ELEMENT_MEANING[e]}. 용신의 쉬운 뜻과 이 원국에서 맡는 역할.`,slots:['{용신}']},
 {id:'yongsinTopic',part:'part5',slot:1,chars:500,keys:()=>cross(ELEMENTS,Object.keys(TOPICS)),describe:([y,t])=>`용신: ${ELEMENT_MEANING[y]} / 질문 분야: ${TOPICS[t]}. 일상에서 이 기운을 쓰는 일반적 방법(공간·사람·습관·일하는 방식).`,slots:['{용신}']},
 {id:'daeun',part:'part6',slot:0,chars:700,keys:()=>cross(STARS,Object.keys(STRENGTHS)),describe:([s,k])=>`지금 대운의 십성: ${s} / ${STRENGTHS[k]}. 이 대운 십 년의 큰 주제와 쓰는 법. 이 십성 말고 다른 개별 십성 이름은 쓰지 않는다.`,slots:['{대운}','{대운나이}','{대운연도}']},
 {id:'daeunTopic',part:'part6',slot:1,chars:600,keys:()=>cross(GROUPS,Object.keys(TOPICS)),describe:([d,t])=>`지금 대운의 십성 갈래: ${d}(${GROUP_MEANING[d]}) / 질문 분야: ${TOPICS[t]}. 이 대운에서 질문 분야에 유리한 방향. 개별 십성 이름은 {대운십성} 자리표시로만 쓴다.`,slots:['{대운십성}']},
 {id:'yearIntro',part:'part7',slot:0,chars:300,keys:()=>cross(STARS,GROUPS),describe:([y,d])=>`올해 세운의 십성: ${y} / 지금 대운의 십성 갈래: ${d}(${GROUP_MEANING[d]}). 한 해 흐름의 큰 그림을 짧게. 달 이름은 쓰지 않는다(뒤에 달별 키워드가 따로 붙는다). 이 세운 십성 말고 다른 개별 십성 이름은 쓰지 않는다.`,slots:['{세운연도}','{세운}']},
 {id:'yearTopic',part:'part7',slot:1,chars:700,keys:()=>cross(GROUPS,Object.keys(TOPICS)),describe:([y,t])=>`올해 세운의 십성 갈래: ${y}(${GROUP_MEANING[y]}) / 질문 분야: ${TOPICS[t]}. 한 해 내내 반복되는 주제와 대응. 달·계절·기간을 지정하지 않는다. 개별 십성 이름은 쓰지 않는다.`,slots:['{세운연도}']},
 {id:'closing',part:'part8',slot:0,chars:500,keys:()=>cross(ELEMENTS,Object.keys(TOPICS)),describe:([y,t])=>`용신: ${ELEMENT_MEANING[y]} / 질문 분야: ${TOPICS[t]}. 앞선 풀이를 질문에 연결해 정리하고, 그대가 택할 방향과 방법으로 끝낸다.`,slots:['{용신}']},
];
export function cross(...lists){return lists.reduce((acc,list)=>acc.flatMap(a=>list.map(b=>[...a,b])),[[]]);}
export const keyOf=parts=>parts.join('|');

// 계산값(toData 결과)에서 각 모듈의 열쇠와 자리표시 값을 뽑는다
export function features(calc,topic){
 const stem=String(calc['일간']||'').charAt(0), monthJi=String(calc['원국']?.['월']||'').charAt(1);
 const season=seasonOf(monthJi), strength=strengthOf(calc['신강신약']?.['판정']||'');
 const counts=Object.fromEntries(GROUPS.map(g=>[g,0]));for(const [s,n] of Object.entries(calc['십신분포']||{}))if(STAR_GROUP[s])counts[STAR_GROUP[s]]+=Number(n)||0;
 const top=[...GROUPS].sort((a,b)=>counts[b]-counts[a])[0],lack=[...GROUPS].sort((a,b)=>counts[a]-counts[b]).find(g=>g!==top);
 const pct=Object.entries(calc['오행세력']||{}).map(([e,v])=>[e,parseFloat(v)]).sort((a,b)=>b[1]-a[1]);const most=pct[0]?.[0]||'토',least=pct[pct.length-1]?.[0]||'수';
 const ym=String((calc['세운']||[])[0]||'').match(/(\d{4})년.*?([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*\(([가-힣]+)/);const nowYear=ym?Number(ym[1]):new Date().getFullYear();
 const daeuns=(calc['대운']||[]).map(v=>String(v).match(/(\d+)세\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*\(([가-힣]+)\)\s*(\d{4})년/)).filter(Boolean);
 const cur=[...daeuns].reverse().find(m=>Number(m[4])<=nowYear)||daeuns[0];
 const daeunStar=cur?.[3]||'비견', yearStar=ym?.[3]||'비견';
 const yong=String(calc['용신']?.['용신']||'').charAt(0)||'목';
 const myEl=calc['일간오행']||'화', gyeok=calc['격국']?.['이름']||'';
 const t=TOPICS[topic]?topic:'general', el=e=>`${ELEMENT_MEANING[e].split('(')[0]}(${e})`;
 const keys={opening:[t,strength],answer:[STAR_GROUP[yearStar],STAR_GROUP[daeunStar],t],temper:[stem,season,strength],stars:[top,lack],gyeok:[gyeok,STAR_GROUP[daeunStar]],elements:[most,least],relations:[relationKey(calc['관계']||[]),myEl],yongsin:[yong,myEl],yongsinTopic:[yong,t],daeun:[daeunStar,strength],daeunTopic:[STAR_GROUP[daeunStar],t],yearIntro:[yearStar,STAR_GROUP[daeunStar]],yearTopic:[STAR_GROUP[yearStar],t],closing:[yong,t]};
 const values={'{일간}':`${STEMS[stem]||stem}(${stem})`,'{계절}':season,'{세운연도}':ym?`${ym[1]}년`:'올해','{세운}':ym?ym[2]:'','{세운십성}':yearStar,'{대운}':cur?`${cur[2]} 대운`:'지금 대운','{대운나이}':cur?`${cur[1]}세`:'','{대운연도}':cur?`${cur[4]}년`:'','{대운십성}':daeunStar,'{격}':gyeok,'{용신}':el(yong),'{최다오행}':`${el(most)} ${calc['오행세력']?.[most]||''}`.trim(),'{최소오행}':`${el(least)} ${calc['오행세력']?.[least]||''}`.trim()};
 return {keys:Object.fromEntries(Object.entries(keys).map(([k,v])=>[k,keyOf(v)])),values,topic:t,yearStar,daeunStar};
}
