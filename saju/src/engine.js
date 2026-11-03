/* Browser adapter only. Source of all calculations: tools/saju-ai/src/calc-engine.js.
   Keep this file's URL relative to the repository root; do not duplicate formulas here. */
let enginePromise;
export function loadEngine(){
  if(!enginePromise) enginePromise=(async()=>{
    const url=new URL('../calc-engine.js',import.meta.url);
    const response=await fetch(url);
    if(!response.ok) throw new Error('기존 계산 엔진 파일을 불러오지 못했습니다.');
    const source=await response.text();
    const module={exports:{}};
    new Function('module','exports',source+'\n//# sourceURL=calc-engine.js')(module,module.exports);
    return module.exports;
  })();
  return enginePromise;
}
