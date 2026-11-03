'use strict';
/* ═══════════════════════════════════════════════════════════
   묘선당 사주 계산 엔진 (Node 포팅판)
   원본: Downloads/myeongri-engine.html (계산부) +
         saju-studio-9.html (toData/세운/월운부)
   DOM 의존 코드만 제거, 계산 로직은 원본 그대로 — 정확도 보존 목적
   ═══════════════════════════════════════════════════════════ */

/* ═══════════ 기본 상수 ═══════════ */
const GAN=['갑','을','병','정','무','기','경','신','임','계'];
const GANH=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIH=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_OH=[0,0,1,1,2,2,3,3,4,4];        // 0木1火2土3金4水
const JI_OH =[4,2,0,0,2,1,1,2,3,3,2,4];
const GAN_YIN=[0,1,0,1,0,1,0,1,0,1];
const OH=['목','화','토','금','수'];
const OHC=['m','h','t','g','s'];
const OHV=['--mok','--hwa','--to','--geum','--su'];

/* 지장간 (여기/중기/정기) + 비중 */
const JIJANG=[
  [['임',10],['계',20]],                     // 子
  [['계',9],['신',3],['기',18]],             // 丑
  [['무',7],['병',7],['갑',16]],             // 寅
  [['갑',10],['을',20]],                     // 卯
  [['을',9],['계',3],['무',18]],             // 辰
  [['무',7],['경',7],['병',16]],             // 巳
  [['병',10],['기',9],['정',11]],            // 午
  [['정',9],['을',3],['기',18]],             // 未
  [['무',7],['임',7],['경',16]],             // 申
  [['경',10],['신',20]],                     // 酉
  [['신',9],['정',3],['무',18]],             // 戌
  [['무',7],['갑',7],['임',16]]              // 亥
];

/* 십이운성 */
const UNSUNG=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const JANGSAENG=[11,6,2,9,2,9,5,0,8,3];   // 甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯

/* 합충형파해 */
const GAN_HAP=[[0,5,2],[1,6,3],[2,7,4],[3,8,0],[4,9,1]]; // 甲己土 乙庚金 丙辛水 丁壬木 戊癸火
const GAN_CHUNG=[[0,6],[1,7],[2,8],[3,9]];
const JI_YUKHAP=[[0,1,2],[2,11,0],[3,10,1],[4,9,3],[5,8,4],[6,7,2]];
const SAMHAP=[[8,0,4,4],[11,3,7,0],[2,6,10,1],[5,9,1,3]]; // 申子辰水 亥卯未木 寅午戌火 巳酉丑金
const BANGHAP=[[2,3,4,0],[5,6,7,1],[8,9,10,3],[11,0,1,4]];
const JI_CHUNG=[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const SAMHYUNG=[[2,5,8],[1,10,7]];
const SANGHYUNG=[[0,3]];
const JAHYUNG=[4,6,9,11];
const JI_PA=[[0,9],[3,6],[4,1],[7,10],[2,11],[5,8]];
const JI_HAE=[[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];

/* 신살 */
const CHEONEUL={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[2,6],8:[3,5],9:[3,5]};
const MUNCHANG=[5,6,8,9,8,9,11,0,2,3];
const YANGIN={0:3,2:6,4:6,6:9,8:0};
const HONGYEOM=[6,6,2,7,4,4,10,9,0,8];
const BAEKHO=['갑진','을미','병술','정축','무진','임술','계축'];
const GWAEGANG=['경진','경술','임진','임술','무술'];
const DOHWA=[3,6,9,0], YEOKMA=[8,2,5,11], HWAGAE=[10,4,7,1]; // 삼합국 index 순

/* ═══════════ 천문 ═══════════ */
const rad=Math.PI/180;
function toJD(y,m,d,h){if(m<=2){y-=1;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5+h/24}
function jdnOf(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045}
function solarLon(jd){const T=(jd-2451545)/36525;
  const L0=280.46646+36000.76983*T+0.0003032*T*T, M=357.52911+35999.05029*T-0.0001537*T*T;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M*rad)+(0.019993-0.000101*T)*Math.sin(2*M*rad)+0.000289*Math.sin(3*M*rad);
  const O=125.04-1934.136*T; let l=L0+C-0.00569-0.00478*Math.sin(O*rad);
  return ((l%360)+360)%360}
function eot(jd){const T=(jd-2451545)/36525;
  const L0=((280.46646+36000.76983*T)%360+360)%360, M=357.52911+35999.05029*T;
  const e=0.016708634-0.000042037*T, eps=23.439291-0.0130042*T, y=Math.tan(eps/2*rad)**2;
  const E=y*Math.sin(2*L0*rad)-2*e*Math.sin(M*rad)+4*e*y*Math.sin(M*rad)*Math.cos(2*L0*rad)
    -0.5*y*y*Math.sin(4*L0*rad)-1.25*e*e*Math.sin(2*M*rad);
  return E/rad*4}
function findTerm(t,g){let jd=g;for(let i=0;i<40;i++){let d=solarLon(jd)-t;
  if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<1e-7)break;jd-=d/0.9856473}return jd}
function stdOff(y,m,d){const n=y*1e4+m*100+d;
  if(n<19120101)return 8.5; if(n<19540321)return 9; if(n<19610810)return 8.5; return 9}
const DST=[[1948,6,1,1948,9,13],[1949,4,3,1949,9,11],[1950,4,1,1950,9,10],[1951,5,6,1951,9,9],
  [1955,5,5,1955,9,9],[1956,5,20,1956,9,30],[1957,5,5,1957,9,22],[1958,5,4,1958,9,21],
  [1959,5,3,1959,9,20],[1960,5,1,1960,9,18],[1987,5,10,1987,10,11],[1988,5,8,1988,10,9]];
const isDST=(y,m,d)=>{const n=y*1e4+m*100+d;return DST.some(p=>n>=p[0]*1e4+p[1]*100+p[2]&&n<p[3]*1e4+p[4]*100+p[5])};

/* ═══════════ 십신 ═══════════ */
const SIP=[['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
function sipsin(day,g){
  const a=GAN_OH[day],b=GAN_OH[g], same=GAN_YIN[day]===GAN_YIN[g]?0:1;
  let r; if(a===b)r=0; else if((a+1)%5===b)r=1; else if((a+2)%5===b)r=2;
  else if((a+3)%5===b)r=3; else r=4;
  return SIP[r][same];
}
const SIP_GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',
  편관:'관성',정관:'관성',편인:'인성',정인:'인성'};

/* ═══════════ 메인 계산 ═══════════ */
function validateInput(o){
  if(!o||typeof o!=='object') throw new Error('입력값이 필요합니다.');
  const {y,mo,d,hh,mi,lon,unk,uLon,sex}=o;
  if(!Number.isInteger(y)||y<1900||y>2100) throw new Error('연도는 1900~2100 사이의 정수여야 합니다.');
  if(!Number.isInteger(mo)||mo<1||mo>12) throw new Error('월은 1~12 사이의 정수여야 합니다.');
  const days=new Date(Date.UTC(y,mo,0)).getUTCDate();
  if(!Number.isInteger(d)||d<1||d>days) throw new Error('존재하지 않는 날짜입니다.');
  if(!unk&&(!Number.isInteger(hh)||hh<0||hh>23)) throw new Error('시는 0~23 사이의 정수여야 합니다.');
  if(!unk&&(!Number.isInteger(mi)||mi<0||mi>59)) throw new Error('분은 0~59 사이의 정수여야 합니다.');
  if(!['M','F'].includes(sex)) throw new Error('성별을 선택해 주세요.');
  if(uLon&&(!Number.isFinite(lon)||lon < -180||lon > 180)) throw new Error('출생지 경도를 확인해 주세요.');
}

function compute(o){
  validateInput(o);
  const {y,mo,d,hh,mi,lon,unk,uLon,uEot,uYaja,sex}=o;
  const timeUnknown=Boolean(unk), refHH=timeUnknown?12:hh, refMI=timeUnknown?0:mi;
  const off=stdOff(y,mo,d), dst=isDST(y,mo,d), log=[];
  let adj=refHH*60+refMI;
  log.push([timeUnknown?'시각 정보':'입력 시각',timeUnknown?'시간 모름':pad(hh)+':'+pad(mi)]);
  log.push(['당시 표준시','UTC+'+off]);
  if(dst){adj-=60;log.push([timeUnknown?'정오 기준 DST 보정':'서머타임','적용 (−60분)'])}
  const jd0=toJD(y,mo,d,(adj/60)-off);
  let lm=0,em=0;
  if(uLon){lm=(lon-off*15)*4;log.push(['경도 보정',fm(lm)])}
  if(uEot){em=eot(jd0);log.push(['균시차',fm(em)])}
  const tmin=adj+lm+em;
  const jd=toJD(y,mo,d,(tmin/60)-off);
  const lam=solarLon(jd);

  let sy=y; if(mo<=2&&lam<315)sy=y-1;
  const yG=((sy-4)%10+10)%10, yJ=((sy-4)%12+12)%12;
  const seg=Math.floor(((lam-315+360)%360)/30);
  const mJ=[2,3,4,5,6,7,8,9,10,11,0,1][seg];
  const mG=((yG%5)*2+2+seg)%10;

  let jdn=jdnOf(y,mo,d);
  if(!timeUnknown&&tmin>=1440)jdn++; if(!timeUnknown&&tmin<0)jdn--;
  let tm=((tmin%1440)+1440)%1440;
  let yaja=false;
  if(!timeUnknown&&uYaja&&tm>=1380){jdn++;yaja=true}
  const di=((jdn+49)%60+60)%60, dG=di%10, dJ=di%12;

  let hG=null,hJ=null;
  if(!unk){hJ=Math.floor(((tm+60)%1440)/120); hG=((dG%5)*2+hJ)%10}

  /* 대운 */
  const fwd=(GAN_YIN[yG]===0)===(sex==='M');
  const cur=315+seg*30;
  const prev=findTerm(((cur%360)+360)%360,jd-15), next=findTerm(((cur+30)%360+360)%360,jd+15);
  const startAge=Math.max(1,Math.round((fwd?next-jd:jd-prev)/3*10)/10);
  const daeun=[];
  for(let i=0;i<10;i++){const st=fwd?i+1:-(i+1);
    daeun.push({g:((mG+st)%10+10)%10,j:((mJ+st)%12+12)%12,
      age:Math.floor(startAge)+i*10, year:y+Math.floor(startAge)+i*10})}

  if(timeUnknown){
    log.push(['계산 기준','시간 미상 — 정오 기준으로 연·월 기둥 계산']);
    log.push(['일주 기준','입력한 양력 날짜 (시간에 따른 날짜 변경·야자시 미적용)']);
    log.push(['시주','시간 모름 — 미산출']);
    log.push(['태양시 기준값(정오 가정)',fmHM(tm)]);
  }else log.push(['진태양시',fmHM(tm)]);
  log.push(['태양 황경',lam.toFixed(4)+'°']);
  log.push(['사주 연도',sy+'년 (입춘 기준)']);
  log.push(['대운',fwd?'순행':'역행']);
  log.push(['대운수',startAge.toFixed(1)]);
  if(yaja)log.push(['야자시','적용 (일주 +1일)']);

  const gans=[yG,mG,dG]; const jis=[yJ,mJ,dJ];
  if(hG!==null){gans.push(hG);jis.push(hJ)}
  const result=analyze({yG,yJ,mG,mJ,dG,dJ,hG,hJ,gans,jis,daeun,startAge,fwd,log,unk:timeUnknown,sy,seg,y});
  result.calculationNotes=timeUnknown?[
    '출생시간 미상으로 시주를 산출하지 않았습니다.',
    '일주는 입력된 양력 날짜 기준이며 시간 보정과 야자시를 적용하지 않았습니다.',
    '정오를 연·월 기둥 계산 기준으로 사용했습니다. 절기 전환일에는 실제 출생시간 확인이 필요합니다.'
  ]:[];
  return result;
}

/* ═══════════ 심층 분석 ═══════════ */
function analyze(r){
  const {dG,mJ,gans,jis,dJ,yJ,hJ}=r;

  /* ── 십이운성 ── */
  const base=JANGSAENG[dG], up=GAN_YIN[dG]===0;
  const unsungOf=j=>{const diff=up?(j-base+12)%12:(base-j+12)%12; return UNSUNG[diff]};
  r.unsung=jis.map(unsungOf);

  /* ── 십신 ── */
  r.sipsinGan=gans.map(g=>sipsin(dG,g));
  r.sipsinJi=jis.map(j=>{
    if(j===null||j===undefined)return null;
    const jg=JIJANG[j][JIJANG[j].length-1][0];
    return sipsin(dG,GAN.indexOf(jg));
  });

  /* ── 오행 세력 (가중) ── */
  const W_GAN=[1.0,1.2,1.0,1.0];              // 년 월 일 시 천간
  const W_JI =[1.2,3.0,2.0,1.2];              // 년 월 일 시 지지
  const power=[0,0,0,0,0];
  gans.forEach((g,i)=>power[GAN_OH[g]]+=W_GAN[i]||1);
  jis.forEach((j,i)=>{
    const w=W_JI[i]||1, tot=JIJANG[j].reduce((a,b)=>a+b[1],0);
    JIJANG[j].forEach(([kr,amt])=>power[GAN_OH[GAN.indexOf(kr)]]+=w*amt/tot);
  });
  const totalP=power.reduce((a,b)=>a+b,0);
  r.power=power.map(v=>+(v).toFixed(2));
  r.powerPct=power.map(v=>+(v/totalP*100).toFixed(1));

  /* ── 신강 신약 ── */
  const me=GAN_OH[dG];
  const mine=power[me]+power[(me+4)%5];       // 비겁 + 인성
  const other=power[(me+1)%5]+power[(me+2)%5]+power[(me+3)%5];
  r.myPct=+(mine/totalP*100).toFixed(1);
  const deukryeong = JI_OH[mJ]===me || JI_OH[mJ]===(me+4)%5;
  const deukji = JIJANG[dJ].some(([k])=>{const o=GAN_OH[GAN.indexOf(k)];return o===me||o===(me+4)%5});
  r.deukryeong=deukryeong; r.deukji=deukji;
  let lvl;
  if(r.myPct>=62) lvl='극신강';
  else if(r.myPct>=50) lvl='신강';
  else if(r.myPct>=42) lvl='중화';
  else if(r.myPct>=30) lvl='신약';
  else lvl='극신약';
  r.strength=lvl;
  r.isStrong = r.myPct>=46;

  /* ── 통근 · 투출 ── */
  const roots=[];
  const names=['년','월','일','시'];
  gans.forEach((g,i)=>{
    const hit=[];
    jis.forEach((j,k)=>{
      JIJANG[j].forEach(([kr])=>{
        const idx=GAN.indexOf(kr);
        if(idx===g) hit.push({at:names[k]+'지', kind:'같은 글자', ji:j});
        else if(GAN_OH[idx]===GAN_OH[g]) hit.push({at:names[k]+'지', kind:'같은 오행', ji:j});
      });
    });
    if(hit.length) roots.push({type:'통근', gan:g, at:names[i]+'간', hits:hit});
  });
  const tuchul=[];
  jis.forEach((j,k)=>{
    JIJANG[j].forEach(([kr])=>{
      const idx=GAN.indexOf(kr);
      if(gans.includes(idx)){
        const at=names[gans.indexOf(idx)]+'간';
        tuchul.push({type:'투출', ji:j, gan:idx, from:names[k]+'지', to:at});
      }
    });
  });
  r.roots=roots; r.tuchul=tuchul;

  /* ── 합충형파해 ── */
  const rel=[];
  const pos=i=>names[i];
  for(let a=0;a<gans.length;a++)for(let b=a+1;b<gans.length;b++){
    GAN_HAP.forEach(([x,y,oh])=>{
      if((gans[a]===x&&gans[b]===y)||(gans[a]===y&&gans[b]===x))
        rel.push({k:'천간합',t:`${GANH[gans[a]]}${GANH[gans[b]]} 합 → ${OH[oh]}`,at:`${pos(a)}간·${pos(b)}간`});
    });
    GAN_CHUNG.forEach(([x,y])=>{
      if((gans[a]===x&&gans[b]===y)||(gans[a]===y&&gans[b]===x))
        rel.push({k:'천간충',t:`${GANH[gans[a]]}${GANH[gans[b]]} 충`,at:`${pos(a)}간·${pos(b)}간`});
    });
  }
  for(let a=0;a<jis.length;a++)for(let b=a+1;b<jis.length;b++){
    const A=jis[a],B=jis[b];
    JI_YUKHAP.forEach(([x,y,oh])=>{if((A===x&&B===y)||(A===y&&B===x))
      rel.push({k:'육합',t:`${JIH[A]}${JIH[B]} 합 → ${OH[oh]}`,at:`${pos(a)}지·${pos(b)}지`})});
    JI_CHUNG.forEach(([x,y])=>{if((A===x&&B===y)||(A===y&&B===x))
      rel.push({k:'충',t:`${JIH[A]}${JIH[B]} 충`,at:`${pos(a)}지·${pos(b)}지`})});
    JI_PA.forEach(([x,y])=>{if((A===x&&B===y)||(A===y&&B===x))
      rel.push({k:'파',t:`${JIH[A]}${JIH[B]} 파`,at:`${pos(a)}지·${pos(b)}지`})});
    JI_HAE.forEach(([x,y])=>{if((A===x&&B===y)||(A===y&&B===x))
      rel.push({k:'해',t:`${JIH[A]}${JIH[B]} 해`,at:`${pos(a)}지·${pos(b)}지`})});
    SANGHYUNG.forEach(([x,y])=>{if((A===x&&B===y)||(A===y&&B===x))
      rel.push({k:'상형',t:`${JIH[A]}${JIH[B]} 형`,at:`${pos(a)}지·${pos(b)}지`})});
    if(A===B&&JAHYUNG.includes(A))
      rel.push({k:'자형',t:`${JIH[A]}${JIH[B]} 자형`,at:`${pos(a)}지·${pos(b)}지`});
  }
  SAMHAP.forEach(([a,b,c,oh])=>{
    const has=[a,b,c].filter(x=>jis.includes(x));
    if(has.length===3) rel.push({k:'삼합',t:`${JIH[a]}${JIH[b]}${JIH[c]} 삼합 → ${OH[oh]}국`,at:'완전'});
    else if(has.length===2&&has.includes(b)) rel.push({k:'반합',t:`${has.map(x=>JIH[x]).join('')} 반합 → ${OH[oh]}`,at:'왕지 포함'});
  });
  BANGHAP.forEach(([a,b,c,oh])=>{
    if([a,b,c].every(x=>jis.includes(x))) rel.push({k:'방합',t:`${JIH[a]}${JIH[b]}${JIH[c]} 방합 → ${OH[oh]}국`,at:'완전'});
  });
  SAMHYUNG.forEach(tri=>{
    const has=tri.filter(x=>jis.includes(x));
    if(has.length===3) rel.push({k:'삼형',t:`${tri.map(x=>JIH[x]).join('')} 삼형`,at:'완전'});
    else if(has.length===2) rel.push({k:'형',t:`${has.map(x=>JIH[x]).join('')} 형`,at:'부분'});
  });
  r.rel=rel;

  /* ── 신살 ── */
  const sinsal=[];
  const push=(n,w,d)=>sinsal.push({n,w,d});
  (CHEONEUL[dG]||[]).forEach(j=>{if(jis.includes(j))
    push('천을귀인',JIH[j],'위기에 도움이 오는 자리')});
  if(jis.includes(MUNCHANG[dG])) push('문창귀인',JIH[MUNCHANG[dG]],'글과 학문의 별');
  if(YANGIN[dG]!==undefined&&jis.includes(YANGIN[dG])) push('양인',JIH[YANGIN[dG]],'극단의 칼날');
  if(jis.includes(HONGYEOM[dG])) push('홍염',JIH[HONGYEOM[dG]],'끌어당기는 매력');
  const dp=GAN[dG]+JI[dJ];
  if(BAEKHO.includes(dp)) push('백호대살',GANH[dG]+JIH[dJ],'강렬하고 급한 기운');
  if(GWAEGANG.includes(dp)) push('괴강',GANH[dG]+JIH[dJ],'극단적 통솔력');
  [[yJ,'년지'],[dJ,'일지']].forEach(([base,label])=>{
    SAMHAP.forEach((s,idx)=>{
      if(s.slice(0,3).includes(base)){
        if(jis.includes(DOHWA[idx])) push('도화',JIH[DOHWA[idx]],label+' 기준 · 매력과 인기');
        if(jis.includes(YEOKMA[idx])) push('역마',JIH[YEOKMA[idx]],label+' 기준 · 이동과 변화');
        if(jis.includes(HWAGAE[idx])) push('화개',JIH[HWAGAE[idx]],label+' 기준 · 예술과 고독');
      }
    });
  });
  /* 공망 */
  const dIdx=(GANH.indexOf(GANH[dG]));
  const seq=(dG-dJ+12)%12;                 // 순 시작 위치
  const gongmang=[(10-seq+12)%12,(11-seq+12)%12];
  const gmHit=jis.filter(j=>gongmang.includes(j));
  if(gmHit.length) push('공망',gmHit.map(j=>JIH[j]).join(''),'비어 있어 채워야 하는 자리');
  r.sinsal=sinsal;

  /* ── 격국 ── */
  const jeonggi=JIJANG[mJ][JIJANG[mJ].length-1][0];
  const jgIdx=GAN.indexOf(jeonggi);
  const jgSip=sipsin(dG,jgIdx);
  let guk, gukWhy;
  const tuchulYn=gans.includes(jgIdx);
  if(jgSip==='비견'||jgSip==='겁재'){
    guk = (YANGIN[dG]===mJ) ? '양인격' : '건록격';
    gukWhy = `월지 ${JIH[mJ]}의 정기가 ${jgSip} — 자기 세력이 월령을 잡음`;
  }else{
    guk = jgSip+'격';
    gukWhy = tuchulYn
      ? `월지 ${JIH[mJ]} 정기 ${GANH[jgIdx]}가 천간에 투출`
      : `월지 ${JIH[mJ]} 정기 ${GANH[jgIdx]} 기준 (미투출)`;
  }
  r.guk=guk; r.gukWhy=gukWhy; r.gukTuchul=tuchulYn;

  /* ── 용신 ── */
  const need = r.isStrong ? [(me+1)%5,(me+2)%5,(me+3)%5] : [(me+4)%5,me];
  const scored = need.map(o=>({o,p:power[o]}));
  scored.sort((a,b)=> r.isStrong ? b.p-a.p : a.p-b.p);
  r.yongsin = scored[0].o;
  r.huisin  = scored[1]?scored[1].o:scored[0].o;
  r.gisin   = r.isStrong ? (me+4)%5 : (me+2)%5;
  r.yongWhy = r.isStrong
    ? `일간 세력 ${r.myPct}% — 넘치므로 덜어내는 오행이 용신`
    : `일간 세력 ${r.myPct}% — 부족하므로 채워주는 오행이 용신`;

  /* ── 조후 ── */
  const winter=[11,0,1].includes(mJ), summer=[5,6,7].includes(mJ);
  if(winter){ r.johu='화 火'; r.johuWhy=`${JIH[mJ]}월 — 한랭한 계절, 따뜻하게 하는 불이 먼저 필요` }
  else if(summer){ r.johu='수 水'; r.johuWhy=`${JIH[mJ]}월 — 조열한 계절, 식혀주는 물이 먼저 필요` }
  else if([3,4].includes(mJ)){ r.johu='금 金'; r.johuWhy=`${JIH[mJ]}월 — 목기가 왕성, 다듬는 금이 필요` }
  else { r.johu='—'; r.johuWhy=`${JIH[mJ]}월 — 한난조습이 치우치지 않아 억부가 우선` }

  return r;
}

const pad=n=>String(n).padStart(2,'0');
const fm=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1)+'분';
const fmHM=m=>pad(Math.floor(m/60))+':'+pad(Math.round(m%60));

/* ═══════════ 세운 / 월운 (saju-studio-9.html 원본) ═══════════ */
function sewoonList(r, n){
  const now=new Date().getFullYear(), out=[];
  const base=JANGSAENG[r.dG], up=GAN_YIN[r.dG]===0;
  for(let i=0;i<n;i++){
    const y=now+i, g=((y-4)%10+10)%10, j=((y-4)%12+12)%12;
    out.push({year:y, age:y-r.y, g, j,
      sg:sipsin(r.dG,g), sj:sipsin(r.dG,GAN.indexOf(JIJANG[j][JIJANG[j].length-1][0])),
      un:UNSUNG[up?(j-base+12)%12:(base-j+12)%12]});
  }
  return out;
}
function wolwoonList(r, n){
  const d=new Date(), out=[];
  const base=JANGSAENG[r.dG], up=GAN_YIN[r.dG]===0;
  for(let i=0;i<n;i++){
    const dt=new Date(d.getFullYear(), d.getMonth()+i, 20);
    const Y=dt.getFullYear(), M=dt.getMonth()+1;
    const jd=toJD(Y,M,20,3);                 // 표준시 정오 근처
    const lam=solarLon(jd);
    let sy=Y; if(M<=2&&lam<315) sy=Y-1;
    const yG=((sy-4)%10+10)%10;
    const seg=Math.floor(((lam-315+360)%360)/30);
    const mJ=[2,3,4,5,6,7,8,9,10,11,0,1][seg];
    const mG=((yG%5)*2+2+seg)%10;
    out.push({label:`${Y}.${String(M).padStart(2,'0')}`, g:mG, j:mJ,
      sg:sipsin(r.dG,mG), sj:sipsin(r.dG,GAN.indexOf(JIJANG[mJ][JIJANG[mJ].length-1][0])),
      un:UNSUNG[up?(mJ-base+12)%12:(base-mJ+12)%12]});
  }
  return out;
}

/* ═══════════ AI 프롬프트용 데이터 변환 (saju-studio-9.html 원본) ═══════════ */
function toData(r, meta){
  const cnt={};
  r.sipsinGan.forEach((s,i)=>{ if(i!==2) cnt[s]=(cnt[s]||0)+1 });
  (r.sipsinJi||[]).forEach(s=>{if(s)cnt[s]=(cnt[s]||0)+1});
  return {
    이름: meta.buyer||null, 성별: meta.sex==='M'?'남':'여',
    생년월일시: `${meta.y}-${String(meta.mo).padStart(2,'0')}-${String(meta.d).padStart(2,'0')} ${meta.unk?'시간 모름':String(meta.hh).padStart(2,'0')+':'+String(meta.mi).padStart(2,'0')}`,
    '계산 참고': r.calculationNotes||[],
    원국:{연:GANH[r.yG]+JIH[r.yJ],월:GANH[r.mG]+JIH[r.mJ],일:GANH[r.dG]+JIH[r.dJ],
      시:r.hG!==null?GANH[r.hG]+JIH[r.hJ]:null},
    일간:GANH[r.dG]+'('+GAN[r.dG]+')', 일간오행:OH[GAN_OH[r.dG]],
    십이운성:{연:r.unsung[0],월:r.unsung[1],일:r.unsung[2],시:r.unsung[3]||null},
    오행세력:Object.fromEntries(OH.map((k,i)=>[k,r.powerPct[i]+'%'])),
    신강신약:{판정:r.strength,일간세력:r.myPct+'%',득령:r.deukryeong,득지:r.deukji},
    격국:{이름:r.guk,근거:r.gukWhy},
    용신:{용신:OH[r.yongsin],희신:OH[r.huisin],기신:OH[r.gisin],근거:r.yongWhy},
    조후:{필요:r.johu,근거:r.johuWhy},
    십신분포:cnt,
    통근:r.roots.map(x=>`${GANH[x.gan]}(${x.at}) → ${x.hits.map(h=>h.at).join(',')}`),
    투출:r.tuchul.map(x=>`${JIH[x.ji]} 지장간 ${GANH[x.gan]} → ${x.to}`),
    관계:r.rel.map(x=>x.k+' · '+x.t),
    신살:r.sinsal.map(x=>`${x.n}(${x.w}) — ${x.d}`),
    대운:r.daeun.map(u=>`${u.age}세 ${GANH[u.g]}${JIH[u.j]} (${sipsin(r.dG,u.g)}) ${u.year}년~`),
    세운:sewoonList(r,3).map(y=>`${y.year}년(${y.age}세) ${GANH[y.g]}${JIH[y.j]} (${y.sg}/${y.un})`),
    월운:wolwoonList(r,12).map(m=>`${m.label} ${GANH[m.g]}${JIH[m.j]} (${m.sg}/${m.un})`)
  };
}

module.exports = { compute, toData, sipsin, sewoonList, wolwoonList };
