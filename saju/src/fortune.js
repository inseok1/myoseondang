export function currentDaeun(daeun, year=new Date().getFullYear()){
  return [...(daeun||[])].filter(item=>item.year<=year).sort((a,b)=>b.year-a.year)[0]||daeun?.[0]||null;
}
