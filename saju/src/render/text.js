export const fillText=(source,values={})=>String(source??'')
  .replace(/\{([\w]+)\}(\uC73C\uB85C|\uB85C|\uC740|\uB294|\uC774|\uAC00|\uC744|\uB97C|\uACFC|\uC640)/g,(_,key,particle)=>{const value=String(values[key]??'').replace(/^\[\uC784\uC2DC\]\s*/,'');if(!value)return '';const code=particle.codePointAt(0),kind=code===0xC740||code===0xB294?'eunneun':code===0xC774||code===0xAC00?'iga':code===0xC744||code===0xB97C?'eulreul':code===0xACFC||code===0xC640?'gwawa':'euro';return value+josa(value,kind)})
  .replace(/\{([\w]+)\}/g,(_,key)=>String(values[key]??'').replace(/^\[\uC784\uC2DC\]\s*/,''))
  .replace(/\{[^{}]*\}/g,'')
  .replace(/\s{2,}/g,' ')
  .trim();

export function josa(word, pair){
  const forms={eunneun:['\uC740','\uB294'],iga:['\uC774','\uAC00'],eulreul:['\uC744','\uB97C'],gwawa:['\uACFC','\uC640'],euro:['\uC73C\uB85C','\uB85C']}[pair];
  if(!forms)return '';
  const last=String(word??'').at(-1)||'',code=last.charCodeAt(0);
  const jong=code>=0xAC00&&code<=0xD7A3?(code-0xAC00)%28:0;
  const hasBatchim=jong!==0;
  if(pair==='euro'&&(!hasBatchim||jong===8))return forms[1];
  return forms[hasBatchim?0:1];
}

export function sipsinCounts(r){
  const counts={};
  (r?.sipsinGan||[]).forEach((star,index)=>{if(index!==2&&star)counts[star]=(counts[star]||0)+1;});
  (r?.sipsinJi||[]).forEach(star=>{if(star)counts[star]=(counts[star]||0)+1;});
  return counts;
}

export function dedupeScreenSentences(container){
  const seen=new Set();
  container.querySelectorAll('p, .locked-copy').forEach(paragraph=>{
    const sentences=paragraph.textContent.split(/(?<=[.!?。])\s*/).filter(Boolean),kept=[];
    for(const sentence of sentences){
      const key=sentence.replace(/\s+/g,' ').trim();
      if(!key||seen.has(key))continue;
      seen.add(key);kept.push(sentence);
    }
    if(sentences.length&&kept.length!==sentences.length)paragraph.textContent=kept.join(' ');
  });
}

export function findUnfilledPlaceholders(text){return String(text??'').match(/\{[^{}]+\}/g)||[];}
