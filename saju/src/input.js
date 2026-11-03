export function suggestCities(cities,query){
  const normalize=s=>String(s||'').trim().toLocaleLowerCase().replace(/(시|군|구)$/,'');
  const q=normalize(query);
  return q?(cities||[]).filter(([name])=>normalize(name).startsWith(q)):[];
}

export function parseTimeText(raw){
  const s=String(raw||'').trim().replace(/\s+/g,'').replace(/반$/,'30분');
  if(!s)return null;
  let match=s.match(/^(오전|오후|아침|저녁|밤|새벽)?(\d{1,2})(?::|시)(\d{1,2}|반)?분?$/);
  if(!match){
    match=s.match(/^(자|축|인|묘|진|사|오|미|신|유|술|해)시?$/);
    if(match){const hours={자:0,축:2,인:4,묘:6,진:8,사:10,오:12,미:14,신:16,유:18,술:20,해:22};return [hours[match[1]],0];}
    return undefined;
  }
  let hh=Number(match[2]),mi=match[3]==='반'?30:Number(match[3]||0);const meridiem=match[1];
  if(hh>23||mi>59)return undefined;
  if(meridiem==='오후'&&hh<12)hh+=12;
  if(meridiem==='오전'&&hh===12)hh=0;
  if(['저녁','밤'].includes(meridiem)&&hh<12)hh+=12;
  if(meridiem==='새벽'&&hh===12)hh=0;
  return [hh,mi];
}
