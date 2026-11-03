import {sipsinCounts,josa} from './text.js';
export function questionTopic(question,selected=''){
  const q=String(question||'');
  const topics=[['business',/사업|창업|가게|장사|매장|고객|거래처|매출|동업/],['reunion',/재회|재결합|다시 만날|다시 만남|헤어진 사람/],['marriage',/결혼|혼인|배우자|부부/],['dating',/연애|애인|남자친구|여자친구|짝사랑|소개팅/],['jobchange',/이직|퇴사|직장 옮|옮길|새 직장/],['employment',/취업|합격|구직|취직|직장 구/],['money',/돈|재물|금전|수입|투자|빚|저축|재정/],['move',/이사|이동|이주|집을 옮/],['exam',/시험|고시|자격증|입시|공부|합격/],['health',/건강|몸 상태|회복|컨디션/]];
  for(const [topic,pattern] of topics)if(pattern.test(q))return topic;
  return ({work:'business',relationship:'dating',change:'jobchange',self:'general'})[selected]||'general';
}
export const starGroup=star=>/식신|상관/.test(star)?'식상':/정재|편재/.test(star)?'재성':/정관|편관|칠살/.test(star)?'관성':/정인|편인/.test(star)?'인성':'비겁';
export function starMeaning(star,topic='general'){
  const meaning=({
    비견:'자립심과 동료 의식, 자기 주장을',
    겁재:'경쟁심과 승부욕, 자원 경쟁과 지출을',
    식신:'재능과 꾸준한 표현, 결과물을 만드는 힘을',
    상관:'표현과 재치, 기존 규칙을 새롭게 다루는 힘을',
    편재:'변동하는 자원과 넓은 활동 범위를',
    정재:'꾸준한 자원과 계획적으로 관리하는 힘을',
    편관:'압박에 대응하는 추진력과 책임을',
    정관:'규칙과 맡은 역할, 공적인 신뢰를',
    편인:'직관과 특수 기술, 혼자 깊이 파고드는 힘을',
    정인:'배움과 문서, 주변의 도움을'
  })[star];
  const action=({
    business:'기회가 보이면 사람과 일을 잇는 힘이 나며, 감당할 몫을 살핀 뒤 약속할 때 가진 감각이 오래 갑니다',
    jobchange:'더 잘 맞는 자리를 찾고 싶어 하니, 지금 가진 경험을 알아주는 곳인지 천천히 살펴보세요',
    employment:'자신의 재주를 펼칠 자리를 찾는 마음이 크니, 준비해 온 경험을 믿고 하나씩 보여 주세요',
    dating:'마음을 나누고 관계를 키우고 싶어 하니, 바라는 연락과 만남의 속도를 솔직하게 전해 보세요',
    reunion:'지난 인연에서 달라진 점을 살피고 싶어 하니, 마음을 전하기 전에 지금의 바람도 돌아보세요',
    marriage:'서로의 생활을 함께 가꾸고 싶어 하니, 작은 생활 기준부터 나누면 먼 계획도 함께 그릴 수 있습니다',
    money:'지금 가진 것을 잘 지키고 불리고 싶어 하니, 눈앞의 이익보다 꾸준히 이어 갈 선택을 살펴보세요',
    move:'새로운 환경에서 마음을 다잡고 싶어 하니, 무엇이 달라지길 바라는지 먼저 생각해 보세요',
    exam:'배운 것을 실력으로 보여 주고 싶어 하니, 조급함을 덜고 익혀 온 흐름을 꾸준히 이어 가세요',
    health:'몸과 마음의 리듬을 돌아볼 때이니, 불편함이 이어지면 무리하게 참지 말고 전문가와 의논하세요',
    general:'스스로 납득할 선택을 찾고 싶어 하니, 마음에 걸리는 기준을 살피고 지금 할 수 있는 일부터 시작해 보세요'
  })[topic]||'스스로 납득할 선택을 찾고 싶어 합니다. 마음에 걸리는 기준을 살피고 지금 할 수 있는 일부터 시작해 보세요';
  return meaning?`${meaning} 뜻하므로, ${action}`:action;
}
export function buildQuestionAnswer({question,selected,r,yearStar,daeunStar,copy}){
  const topic=questionTopic(question,selected),lines=copy[topic]||copy.general;
  const counts=sipsinCounts(r),count=g=>Object.entries(counts).reduce((sum,[star,n])=>sum+(starGroup(star)===g?n:0),0);
  const values={yearStar,daeunStar,yearGroup:starGroup(yearStar),daeunGroup:starGroup(daeunStar),yearMeaning:starMeaning(yearStar,topic),daeunMeaning:starMeaning(daeunStar,topic),wealthCount:count('재성'),outputCount:count('식상'),authorityCount:count('관성'),resourceCount:count('인성'),yearGroupCount:count(starGroup(yearStar)),daeunGroupCount:count(starGroup(daeunStar)),josa};
  return lines.map(item=>{const line=typeof item==='string'?item:item?.text||'';return line.replace(/^\[\uC784\uC2DC\]\s*/,'').replace(/\{([^}]+)\}(\uC73C\uB85C|\uB85C|\uC740|\uB294|\uC774|\uAC00|\uC744|\uB97C|\uACFC|\uC640)/g,(_,key,particle)=>{const code=particle.codePointAt(0),kind=code===0xC740||code===0xB294?'eunneun':code===0xC774||code===0xAC00?'iga':code===0xC744||code===0xB97C?'eulreul':code===0xACFC||code===0xC640?'gwawa':'euro';return (values[key]??'')+josa(values[key],kind)}).replace(/\{([^}]+)\}/g,(_,key)=>values[key]??'')}).join(' ');
}
