import { useState } from "react";
import { motion } from "framer-motion";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', amber:'#f59e0b', purple:'#a855f7', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

type Status = 'FT'|'LIVE'|'UPCOMING'|'FT-PENS';
interface BracketMatch {
  id:string; round:string; home:string; homeFlag:string; homeElo:number;
  away:string; awayFlag:string; awayElo:number;
  pHome:number; pDraw:number; pAway:number;
  predictedWinner:string; confidence:number; upset:boolean;
  status:Status; homeGoals?:number; awayGoals?:number;
  penWinner?:string; penScore?:string;
  date:string; venue:string; note?:string;
}

const R32: BracketMatch[] = [
  { id:'r32-1',  round:'R32', home:'Germany',       homeFlag:'🇩🇪', homeElo:1950, away:'Paraguay',      awayFlag:'🇵🇾', awayElo:1690, pHome:0.66,pDraw:0.20,pAway:0.14, predictedWinner:'Germany',       confidence:66, upset:false, status:'FT-PENS', homeGoals:1, awayGoals:1, penWinner:'Paraguay',    penScore:'4-3', date:'Jul 1',  venue:'MetLife Stadium, New York',      note:'Germany eliminated · Paraguay advance on penalties' },
  { id:'r32-2',  round:'R32', home:'France',        homeFlag:'🇫🇷', homeElo:2090, away:'Sweden',        awayFlag:'🇸🇪', awayElo:1820, pHome:0.74,pDraw:0.16,pAway:0.10, predictedWinner:'France',         confidence:74, upset:false, status:'UPCOMING', date:'Jul 2',  venue:'AT&T Stadium, Dallas' },
  { id:'r32-3',  round:'R32', home:'South Africa',  homeFlag:'🇿🇦', homeElo:1640, away:'Canada',        awayFlag:'🇨🇦', awayElo:1750, pHome:0.32,pDraw:0.28,pAway:0.40, predictedWinner:'Canada',          confidence:40, upset:false, status:'UPCOMING', date:'Jul 2',  venue:'Hard Rock Stadium, Miami' },
  { id:'r32-4',  round:'R32', home:'Netherlands',   homeFlag:'🇳🇱', homeElo:1960, away:'Morocco',       awayFlag:'🇲🇦', awayElo:1880, pHome:0.48,pDraw:0.26,pAway:0.26, predictedWinner:'Netherlands',    confidence:48, upset:false, status:'FT-PENS', homeGoals:0, awayGoals:0, penWinner:'Morocco',     penScore:'5-4', date:'Jul 1',  venue:'SoFi Stadium, Los Angeles',      note:'Netherlands eliminated · Morocco advance on penalties' },
  { id:'r32-5',  round:'R32', home:'Portugal',      homeFlag:'🇵🇹', homeElo:1980, away:'Croatia',       awayFlag:'🇭🇷', awayElo:1900, pHome:0.52,pDraw:0.26,pAway:0.22, predictedWinner:'Portugal',        confidence:52, upset:false, status:'UPCOMING', date:'Jul 3',  venue:'Rose Bowl, Los Angeles' },
  { id:'r32-6',  round:'R32', home:'Spain',         homeFlag:'🇪🇸', homeElo:2050, away:'Austria',       awayFlag:'🇦🇹', awayElo:1810, pHome:0.72,pDraw:0.18,pAway:0.10, predictedWinner:'Spain',           confidence:72, upset:false, status:'UPCOMING', date:'Jul 3',  venue:'Gillette Stadium, Boston' },
  { id:'r32-7',  round:'R32', home:'USA',           homeFlag:'🇺🇸', homeElo:1850, away:'Bosnia & Herz.',awayFlag:'🇧🇦', awayElo:1720, pHome:0.60,pDraw:0.22,pAway:0.18, predictedWinner:'USA',             confidence:60, upset:false, status:'UPCOMING', date:'Jul 4',  venue:'NRG Stadium, Houston' },
  { id:'r32-8',  round:'R32', home:'Belgium',       homeFlag:'🇧🇪', homeElo:1920, away:'Senegal',       awayFlag:'🇸🇳', awayElo:1820, pHome:0.55,pDraw:0.25,pAway:0.20, predictedWinner:'Belgium',         confidence:55, upset:false, status:'UPCOMING', date:'Jul 4',  venue:'Empower Field, Denver' },
  { id:'r32-9',  round:'R32', home:'Brazil',        homeFlag:'🇧🇷', homeElo:2100, away:'Japan',         awayFlag:'🇯🇵', awayElo:1870, pHome:0.68,pDraw:0.20,pAway:0.12, predictedWinner:'Brazil',          confidence:68, upset:false, status:'FT',      homeGoals:2, awayGoals:0, date:'Jul 1',  venue:'Mercedes-Benz Stadium, Atlanta', note:'Japan eliminated' },
  { id:'r32-10', round:'R32', home:"Côte d'Ivoire", homeFlag:'🇨🇮', homeElo:1780, away:'Norway',        awayFlag:'🇳🇴', awayElo:1830, pHome:0.38,pDraw:0.28,pAway:0.34, predictedWinner:'Norway',          confidence:34, upset:false, status:'UPCOMING', date:'Jul 2',  venue:'Arrowhead Stadium, Kansas City' },
  { id:'r32-11', round:'R32', home:'Mexico',        homeFlag:'🇲🇽', homeElo:1800, away:'Ecuador',       awayFlag:'🇪🇨', awayElo:1740, pHome:0.52,pDraw:0.26,pAway:0.22, predictedWinner:'Mexico',          confidence:52, upset:false, status:'UPCOMING', date:'Jul 3',  venue:'Estadio Azteca, Mexico City' },
  { id:'r32-12', round:'R32', home:'England',       homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeElo:2020, away:'DR Congo',      awayFlag:'🇨🇩', awayElo:1620, pHome:0.78,pDraw:0.14,pAway:0.08, predictedWinner:'England',         confidence:78, upset:false, status:'UPCOMING', date:'Jul 3',  venue:'BC Place, Vancouver' },
  { id:'r32-13', round:'R32', home:'Argentina',     homeFlag:'🇦🇷', homeElo:2080, away:'Cape Verde',    awayFlag:'🇨🇻', awayElo:1580, pHome:0.82,pDraw:0.12,pAway:0.06, predictedWinner:'Argentina',       confidence:82, upset:false, status:'UPCOMING', date:'Jul 4',  venue:'BMO Field, Toronto' },
  { id:'r32-14', round:'R32', home:'Australia',     homeFlag:'🇦🇺', homeElo:1720, away:'Egypt',         awayFlag:'🇪🇬', awayElo:1700, pHome:0.42,pDraw:0.32,pAway:0.26, predictedWinner:'Australia',       confidence:42, upset:false, status:'UPCOMING', date:'Jul 4',  venue:"Levi's Stadium, San Jose" },
  { id:'r32-15', round:'R32', home:'Switzerland',   homeFlag:'🇨🇭', homeElo:1840, away:'Algeria',       awayFlag:'🇩🇿', awayElo:1800, pHome:0.45,pDraw:0.30,pAway:0.25, predictedWinner:'Switzerland',     confidence:45, upset:false, status:'UPCOMING', date:'Jul 5',  venue:'Saputo Stadium, Montreal' },
  { id:'r32-16', round:'R32', home:'Colombia',      homeFlag:'🇨🇴', homeElo:1810, away:'Ghana',         awayFlag:'🇬🇭', awayElo:1720, pHome:0.58,pDraw:0.24,pAway:0.18, predictedWinner:'Colombia',        confidence:58, upset:false, status:'UPCOMING', date:'Jul 5',  venue:'BMO Field, Toronto' },
];

const R16: BracketMatch[] = [
  { id:'r16-1', round:'R16', home:'Paraguay',     homeFlag:'🇵🇾', homeElo:1690, away:'France',       awayFlag:'🇫🇷', awayElo:2090, pHome:0.22,pDraw:0.24,pAway:0.54, predictedWinner:'France',       confidence:54, upset:false, status:'UPCOMING', date:'Jul 8',  venue:'MetLife Stadium' },
  { id:'r16-2', round:'R16', home:'Canada',       homeFlag:'🇨🇦', homeElo:1750, away:'Morocco',      awayFlag:'🇲🇦', awayElo:1880, pHome:0.38,pDraw:0.28,pAway:0.34, predictedWinner:'Morocco',      confidence:34, upset:false, status:'UPCOMING', date:'Jul 8',  venue:'AT&T Stadium' },
  { id:'r16-3', round:'R16', home:'Portugal',     homeFlag:'🇵🇹', homeElo:1980, away:'Spain',        awayFlag:'🇪🇸', awayElo:2050, pHome:0.42,pDraw:0.28,pAway:0.30, predictedWinner:'Spain',        confidence:42, upset:false, status:'UPCOMING', date:'Jul 9',  venue:'Rose Bowl' },
  { id:'r16-4', round:'R16', home:'USA',          homeFlag:'🇺🇸', homeElo:1850, away:'Belgium',      awayFlag:'🇧🇪', awayElo:1920, pHome:0.40,pDraw:0.28,pAway:0.32, predictedWinner:'Belgium',      confidence:40, upset:false, status:'UPCOMING', date:'Jul 9',  venue:'SoFi Stadium' },
  { id:'r16-5', round:'R16', home:'Brazil',       homeFlag:'🇧🇷', homeElo:2100, away:'Norway',       awayFlag:'🇳🇴', awayElo:1830, pHome:0.65,pDraw:0.21,pAway:0.14, predictedWinner:'Brazil',       confidence:65, upset:false, status:'UPCOMING', date:'Jul 10', venue:'Hard Rock Stadium' },
  { id:'r16-6', round:'R16', home:'Mexico',       homeFlag:'🇲🇽', homeElo:1800, away:'England',      awayFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayElo:2020, pHome:0.28,pDraw:0.26,pAway:0.46, predictedWinner:'England',      confidence:46, upset:false, status:'UPCOMING', date:'Jul 10', venue:'Gillette Stadium' },
  { id:'r16-7', round:'R16', home:'Argentina',    homeFlag:'🇦🇷', homeElo:2080, away:'Australia',    awayFlag:'🇦🇺', awayElo:1720, pHome:0.72,pDraw:0.18,pAway:0.10, predictedWinner:'Argentina',    confidence:72, upset:false, status:'UPCOMING', date:'Jul 11', venue:'Empower Field' },
  { id:'r16-8', round:'R16', home:'Switzerland',  homeFlag:'🇨🇭', homeElo:1840, away:'Colombia',     awayFlag:'🇨🇴', awayElo:1810, pHome:0.46,pDraw:0.28,pAway:0.26, predictedWinner:'Switzerland',  confidence:46, upset:false, status:'UPCOMING', date:'Jul 11', venue:'Mercedes-Benz Stadium' },
];

const QF: BracketMatch[] = [
  { id:'qf-1', round:'QF', home:'France',      homeFlag:'🇫🇷', homeElo:2090, away:'Morocco',      awayFlag:'🇲🇦', awayElo:1880, pHome:0.62,pDraw:0.22,pAway:0.16, predictedWinner:'France',      confidence:62, upset:false, status:'UPCOMING', date:'Jul 14', venue:'MetLife Stadium' },
  { id:'qf-2', round:'QF', home:'Spain',       homeFlag:'🇪🇸', homeElo:2050, away:'Belgium',      awayFlag:'🇧🇪', awayElo:1920, pHome:0.60,pDraw:0.23,pAway:0.17, predictedWinner:'Spain',       confidence:60, upset:false, status:'UPCOMING', date:'Jul 14', venue:'AT&T Stadium' },
  { id:'qf-3', round:'QF', home:'Brazil',      homeFlag:'🇧🇷', homeElo:2100, away:'England',      awayFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayElo:2020, pHome:0.55,pDraw:0.24,pAway:0.21, predictedWinner:'Brazil',      confidence:55, upset:false, status:'UPCOMING', date:'Jul 15', venue:'Rose Bowl' },
  { id:'qf-4', round:'QF', home:'Argentina',   homeFlag:'🇦🇷', homeElo:2080, away:'Switzerland',  awayFlag:'🇨🇭', awayElo:1840, pHome:0.68,pDraw:0.20,pAway:0.12, predictedWinner:'Argentina',   confidence:68, upset:false, status:'UPCOMING', date:'Jul 15', venue:'SoFi Stadium', note:'Argentina model favourite to reach SF' },
];

const SF: BracketMatch[] = [
  { id:'sf-1', round:'SF', home:'France',    homeFlag:'🇫🇷', homeElo:2090, away:'Spain',      awayFlag:'🇪🇸', awayElo:2050, pHome:0.50,pDraw:0.27,pAway:0.23, predictedWinner:'France',    confidence:50, upset:false, status:'UPCOMING', date:'Jul 18', venue:'MetLife Stadium', note:'Closest semi-final pick — near 50/50' },
  { id:'sf-2', round:'SF', home:'Brazil',    homeFlag:'🇧🇷', homeElo:2100, away:'Argentina',  awayFlag:'🇦🇷', awayElo:2080, pHome:0.45,pDraw:0.28,pAway:0.27, predictedWinner:'Brazil',    confidence:45, upset:false, status:'UPCOMING', date:'Jul 19', venue:'Rose Bowl', note:'Classic South American derby — model leans Brazil (ELO edge)' },
];

const THIRD: BracketMatch[] = [
  { id:'3rd', round:'3rd Place', home:'Spain', homeFlag:'🇪🇸', homeElo:2050, away:'Argentina', awayFlag:'🇦🇷', awayElo:2080, pHome:0.38,pDraw:0.28,pAway:0.34, predictedWinner:'Argentina', confidence:34, upset:false, status:'UPCOMING', date:'Jul 22', venue:'AT&T Stadium', note:'Model predicted 3rd place based on SF losers' },
];

const FINAL: BracketMatch[] = [
  { id:'final', round:'Final', home:'France', homeFlag:'🇫🇷', homeElo:2090, away:'Brazil', awayFlag:'🇧🇷', awayElo:2100, pHome:0.44,pDraw:0.28,pAway:0.28, predictedWinner:'France', confidence:44, upset:false, status:'UPCOMING', date:'Jul 23', venue:'MetLife Stadium, New York', note:'🏆 Model predicted WC 2026 Final — France edge Brazil on set-piece quality and tournament form' },
];

type RoundKey = 'All'|'R32'|'R16'|'QF'|'SF'|'Final';

const ROUND_COLORS: Record<string,string> = {
  R32: C.gold, R16: C.blue, QF: C.orange, SF: C.purple, 'Final': C.red, '3rd Place': C.green
};

function confBadge(conf:number, upset:boolean) {
  if(upset) return {bg:`${C.red}20`,color:C.red,label:'⚠ UPSET'};
  if(conf>=65) return {bg:`${C.green}20`,color:C.green,label:`${conf}% conf`};
  if(conf>=50) return {bg:`${C.amber}20`,color:C.amber,label:`${conf}% conf`};
  return {bg:`${C.red}20`,color:C.red,label:`${conf}% conf`};
}

function StatusBadge({status}:{status:Status}) {
  if(status==='FT'||status==='FT-PENS') return <span style={{fontSize:10,background:'#ffffff12',color:C.muted,padding:'2px 7px',borderRadius:4,fontWeight:600}}>{status==='FT-PENS'?'FT (PENS)':'FT'}</span>;
  if(status==='LIVE') return <span style={{fontSize:10,background:`${C.red}22`,color:C.red,padding:'2px 7px',borderRadius:4,fontWeight:700}}>● LIVE</span>;
  return <span style={{fontSize:10,background:`${C.blue}18`,color:C.blue,padding:'2px 7px',borderRadius:4,fontWeight:600}}>UPCOMING</span>;
}

function MatchCard({m,accent}:{m:BracketMatch;accent?:string}) {
  const badge = confBadge(m.confidence, m.upset);
  const done = m.status !== 'UPCOMING';
  const penHome = m.penWinner === m.home;
  const penAway = m.penWinner === m.away;
  const actualHomeWin = done && m.homeGoals !== undefined && m.awayGoals !== undefined && (m.homeGoals > m.awayGoals || penHome);
  const actualAwayWin = done && m.homeGoals !== undefined && m.awayGoals !== undefined && (m.awayGoals > m.homeGoals || penAway);
  const homeWins = done ? actualHomeWin : m.predictedWinner === m.home;
  const awayWins = done ? actualAwayWin : m.predictedWinner === m.away;
  const borderColor = accent ?? (m.status==='LIVE' ? C.red : m.status==='FT-PENS' ? C.amber+'60' : C.border);

  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      style={{background:C.surface,border:`1px solid ${borderColor}`,borderRadius:10,overflow:'hidden',marginBottom:'0.5rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.4rem 0.75rem',borderBottom:`1px solid ${C.border}20`,background:'#ffffff03'}}>
        <span style={{fontSize:11,color:C.muted}}>{m.date} · {m.venue.split(',')[0]}</span>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          {!done && <span style={{fontSize:10,padding:'2px 7px',borderRadius:4,fontWeight:700,background:badge.bg,color:badge.color}}>{badge.label}</span>}
          <StatusBadge status={m.status} />
        </div>
      </div>
      <div style={{padding:'0.65rem 0.75rem',display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'0.5rem',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',justifyContent:'flex-end'}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:14,fontWeight:homeWins?700:400,color:homeWins?C.green:C.text}}>{m.home}</div>
            <div style={{fontSize:10,color:C.muted}}>ELO {m.homeElo}</div>
          </div>
          <span style={{fontSize:24}}>{m.homeFlag}</span>
          {homeWins && <span style={{color:C.green,fontSize:11,fontWeight:700}}>✓</span>}
        </div>
        <div style={{textAlign:'center',minWidth:110}}>
          {done ? (
            <div>
              <div style={{fontSize:20,fontWeight:800,color:C.text}}>{m.homeGoals} – {m.awayGoals}</div>
              {m.penScore && <div style={{fontSize:10,color:C.amber}}>({m.penWinner} win {m.penScore} pens)</div>}
            </div>
          ) : (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.muted}}>{Math.round(m.pHome*100)}–{Math.round(m.pDraw*100)}–{Math.round(m.pAway*100)}</div>
              <div style={{fontSize:10,color:C.muted}}>H – D – A %</div>
              <div style={{fontSize:12,color:accent??C.gold,fontWeight:700,marginTop:2}}>→ {m.predictedWinner}</div>
            </div>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          {awayWins && <span style={{color:C.green,fontSize:11,fontWeight:700}}>✓</span>}
          <span style={{fontSize:24}}>{m.awayFlag}</span>
          <div>
            <div style={{fontSize:14,fontWeight:awayWins?700:400,color:awayWins?C.green:C.text}}>{m.away}</div>
            <div style={{fontSize:10,color:C.muted}}>ELO {m.awayElo}</div>
          </div>
        </div>
      </div>
      {m.note && (
        <div style={{padding:'0.3rem 0.75rem',background:`${accent??C.amber}08`,borderTop:`1px solid ${accent??C.amber}20`,fontSize:11,color:accent??C.amber}}>
          ⚡ {m.note}
        </div>
      )}
    </motion.div>
  );
}

function SectionHeader({icon,label,sub,color}:{icon:string;label:string;sub:string;color:string}) {
  return (
    <div style={{fontSize:11,color:color,fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'1.25rem 0 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
      <span>{icon} {label}</span>
      <span style={{color:C.muted,fontWeight:400,fontSize:10}}>— {sub}</span>
    </div>
  );
}

export default function Bracket() {
  const [tab, setTab] = useState<RoundKey>('All');

  const allMatches = [...R32, ...R16, ...QF, ...SF, ...THIRD, ...FINAL];
  const ftCount = R32.filter(m=>m.status==='FT'||m.status==='FT-PENS').length;
  const upcomingCount = R32.filter(m=>m.status==='UPCOMING').length;

  const TABS: {key:RoundKey;label:string;count?:number}[] = [
    {key:'All',   label:'All',    count:allMatches.length},
    {key:'R32',   label:'R32',    count:16},
    {key:'R16',   label:'R16',    count:8},
    {key:'QF',    label:'QF',     count:4},
    {key:'SF',    label:'SF',     count:2},
    {key:'Final', label:'Final',  count:1},
  ];

  const showR32  = tab==='All'||tab==='R32';
  const showR16  = tab==='All'||tab==='R16';
  const showQF   = tab==='All'||tab==='QF';
  const showSF   = tab==='All'||tab==='SF';
  const showFinal= tab==='All'||tab==='Final';

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Knockout Stage</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.4rem'}}>Tournament Bracket</h1>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'0.75rem',fontSize:12,color:C.muted}}>
            <span><strong style={{color:C.text}}>{ftCount}</strong> Completed</span>
            <span><strong style={{color:C.blue}}>{upcomingCount}</strong> Remaining (R32)</span>
            <span><strong style={{color:C.purple}}>31</strong> Total matches predicted</span>
          </div>
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${tab===t.key?(ROUND_COLORS[t.key]??C.gold):C.border}`,background:tab===t.key?`${ROUND_COLORS[t.key]??C.gold}18`:'transparent',color:tab===t.key?(ROUND_COLORS[t.key]??C.gold):C.muted,fontSize:12,fontWeight:tab===t.key?700:400,cursor:'pointer'}}>
                {t.label} {t.count!==undefined?`(${t.count})`:''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.25rem 2rem'}}>
        {/* Legend */}
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1rem',padding:'0.6rem 1rem',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.muted}}>
          <span>✓ = Match winner</span>
          <span>H–D–A = Win probability %</span>
          <span style={{color:C.green}}>≥65% = High conf</span>
          <span style={{color:C.amber}}>50–64% = Medium</span>
          <span style={{color:C.red}}>⚠ UPSET</span>
          <span style={{color:C.amber}}>FT (PENS) = penalties</span>
        </div>

        {/* R32 */}
        {showR32 && (
          <>
            <SectionHeader icon="⚡" label="Round of 32" sub={`official draw · ${ftCount} completed`} color={ROUND_COLORS['R32']} />
            {R32.map(m=><MatchCard key={m.id} m={m} />)}
          </>
        )}

        {/* R16 */}
        {showR16 && (
          <>
            <SectionHeader icon="🔮" label="Round of 16 — Predicted" sub="based on projected R32 winners" color={ROUND_COLORS['R16']} />
            {R16.map(m=><MatchCard key={m.id} m={m} accent={ROUND_COLORS['R16']} />)}
          </>
        )}

        {/* QF */}
        {showQF && (
          <>
            <SectionHeader icon="🏅" label="Quarter-Finals — Predicted" sub="top 8 teams battle for semi spots" color={ROUND_COLORS['QF']} />
            {QF.map(m=><MatchCard key={m.id} m={m} accent={ROUND_COLORS['QF']} />)}
          </>
        )}

        {/* SF */}
        {showSF && (
          <>
            <SectionHeader icon="⭐" label="Semi-Finals — Predicted" sub="four giants, two finals spots" color={ROUND_COLORS['SF']} />
            {SF.map(m=><MatchCard key={m.id} m={m} accent={ROUND_COLORS['SF']} />)}
          </>
        )}

        {/* 3rd Place */}
        {showFinal && (
          <>
            <SectionHeader icon="🥉" label="3rd Place — Predicted" sub="SF losers battle for bronze" color={ROUND_COLORS['3rd Place']} />
            {THIRD.map(m=><MatchCard key={m.id} m={m} accent={ROUND_COLORS['3rd Place']} />)}
          </>
        )}

        {/* Final */}
        {showFinal && (
          <>
            <SectionHeader icon="🏆" label="Final — Predicted" sub="model's predicted WC 2026 champion" color={ROUND_COLORS['Final']} />
            {/* Trophy card for the Final */}
            <div style={{background:`linear-gradient(135deg,#1a1000,#0d1117,#001a10)`,border:`2px solid ${C.gold}60`,borderRadius:14,overflow:'hidden',marginBottom:'0.5rem',position:'relative'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.gold},${C.orange},${C.gold})`}} />
              <div style={{padding:'0.5rem 0.75rem',background:`${C.gold}08`,borderBottom:`1px solid ${C.gold}20`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:C.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>🏆 WC 2026 FINAL · {FINAL[0].date} · {FINAL[0].venue}</span>
                <StatusBadge status="UPCOMING" />
              </div>
              <div style={{padding:'1.5rem 1.25rem',display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1rem',alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:40,marginBottom:'0.25rem'}}>{FINAL[0].homeFlag}</div>
                  <div style={{fontSize:18,fontWeight:800,color:C.gold}}>{FINAL[0].home}</div>
                  <div style={{fontSize:12,color:C.muted}}>ELO {FINAL[0].homeElo}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.green,marginTop:'0.3rem'}}>{Math.round(FINAL[0].pHome*100)}% win</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:22,fontWeight:800,color:C.muted,marginBottom:'0.5rem'}}>VS</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted}}>{Math.round(FINAL[0].pHome*100)}–{Math.round(FINAL[0].pDraw*100)}–{Math.round(FINAL[0].pAway*100)}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:'0.5rem'}}>H – D – A %</div>
                  <div style={{padding:'0.4rem 0.75rem',background:`${C.gold}18`,border:`1px solid ${C.gold}40`,borderRadius:6}}>
                    <div style={{fontSize:10,color:C.gold,textTransform:'uppercase',letterSpacing:1}}>Predicted Champion</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.gold}}>{FINAL[0].predictedWinner} {FINAL[0].home===FINAL[0].predictedWinner?FINAL[0].homeFlag:FINAL[0].awayFlag}</div>
                  </div>
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:40,marginBottom:'0.25rem'}}>{FINAL[0].awayFlag}</div>
                  <div style={{fontSize:18,fontWeight:800,color:C.text}}>{FINAL[0].away}</div>
                  <div style={{fontSize:12,color:C.muted}}>ELO {FINAL[0].awayElo}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.muted,marginTop:'0.3rem'}}>{Math.round(FINAL[0].pAway*100)}% win</div>
                </div>
              </div>
              {FINAL[0].note && (
                <div style={{padding:'0.5rem 1rem',background:`${C.gold}08`,borderTop:`1px solid ${C.gold}20`,fontSize:12,color:C.gold}}>
                  {FINAL[0].note}
                </div>
              )}
            </div>
          </>
        )}

        {/* Summary note */}
        <div style={{marginTop:'1rem',padding:'0.75rem 1rem',background:C.surface,border:`1px solid ${C.border}30`,borderRadius:8,fontSize:12,color:C.muted}}>
          All post-R32 matches are model predictions based on 10,000 Monte Carlo simulations.
          Biggest completed upsets: <span style={{color:C.orange,fontWeight:600}}>Morocco eliminate Netherlands · Paraguay eliminate Germany (both on pens)</span>.
          Model final: <span style={{color:C.gold,fontWeight:600}}>France vs Brazil</span> · Predicted champion: <span style={{color:C.gold,fontWeight:700}}>France 🇫🇷</span>
        </div>
      </div>
    </div>
  );
}
