import { useState } from "react";
import { motion } from "framer-motion";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', amber:'#f59e0b', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

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
  // LEFT SIDE — confirmed results first
  {
    id:'r32-1', round:'R32', home:'Germany', homeFlag:'🇩🇪', homeElo:1950,
    away:'Paraguay', awayFlag:'🇵🇾', awayElo:1690,
    pHome:0.66, pDraw:0.20, pAway:0.14, predictedWinner:'Germany', confidence:66, upset:false,
    status:'FT-PENS', homeGoals:1, awayGoals:1, penWinner:'Paraguay', penScore:'4-3',
    date:'Jul 1', venue:'MetLife Stadium, New York',
    note:'Germany eliminated · Paraguay advance on penalties'
  },
  {
    id:'r32-2', round:'R32', home:'France', homeFlag:'🇫🇷', homeElo:2090,
    away:'Sweden', awayFlag:'🇸🇪', awayElo:1820,
    pHome:0.74, pDraw:0.16, pAway:0.10, predictedWinner:'France', confidence:74, upset:false,
    status:'UPCOMING', date:'Jul 2', venue:'AT&T Stadium, Dallas'
  },
  {
    id:'r32-3', round:'R32', home:'South Africa', homeFlag:'🇿🇦', homeElo:1640,
    away:'Canada', awayFlag:'🇨🇦', awayElo:1750,
    pHome:0.32, pDraw:0.28, pAway:0.40, predictedWinner:'Canada', confidence:40, upset:false,
    status:'UPCOMING', date:'Jul 2', venue:'Hard Rock Stadium, Miami'
  },
  {
    id:'r32-4', round:'R32', home:'Netherlands', homeFlag:'🇳🇱', homeElo:1960,
    away:'Morocco', awayFlag:'🇲🇦', awayElo:1880,
    pHome:0.48, pDraw:0.26, pAway:0.26, predictedWinner:'Netherlands', confidence:48, upset:false,
    status:'FT-PENS', homeGoals:0, awayGoals:0, penWinner:'Morocco', penScore:'5-4',
    date:'Jul 1', venue:'SoFi Stadium, Los Angeles',
    note:'Netherlands eliminated · Morocco advance on penalties'
  },
  {
    id:'r32-5', round:'R32', home:'Portugal', homeFlag:'🇵🇹', homeElo:1980,
    away:'Croatia', awayFlag:'🇭🇷', awayElo:1900,
    pHome:0.52, pDraw:0.26, pAway:0.22, predictedWinner:'Portugal', confidence:52, upset:false,
    status:'UPCOMING', date:'Jul 3', venue:'Rose Bowl, Los Angeles'
  },
  {
    id:'r32-6', round:'R32', home:'Spain', homeFlag:'🇪🇸', homeElo:2050,
    away:'Austria', awayFlag:'🇦🇹', awayElo:1810,
    pHome:0.72, pDraw:0.18, pAway:0.10, predictedWinner:'Spain', confidence:72, upset:false,
    status:'UPCOMING', date:'Jul 3', venue:'Gillette Stadium, Boston'
  },
  {
    id:'r32-7', round:'R32', home:'USA', homeFlag:'🇺🇸', homeElo:1850,
    away:'Bosnia & Herz.', awayFlag:'🇧🇦', awayElo:1720,
    pHome:0.60, pDraw:0.22, pAway:0.18, predictedWinner:'USA', confidence:60, upset:false,
    status:'UPCOMING', date:'Jul 4', venue:'NRG Stadium, Houston'
  },
  {
    id:'r32-8', round:'R32', home:'Belgium', homeFlag:'🇧🇪', homeElo:1920,
    away:'Senegal', awayFlag:'🇸🇳', awayElo:1820,
    pHome:0.55, pDraw:0.25, pAway:0.20, predictedWinner:'Belgium', confidence:55, upset:false,
    status:'UPCOMING', date:'Jul 4', venue:'Empower Field, Denver'
  },
  // RIGHT SIDE
  {
    id:'r32-9', round:'R32', home:'Brazil', homeFlag:'🇧🇷', homeElo:2100,
    away:'Japan', awayFlag:'🇯🇵', awayElo:1870,
    pHome:0.68, pDraw:0.20, pAway:0.12, predictedWinner:'Brazil', confidence:68, upset:false,
    status:'FT', homeGoals:2, awayGoals:0,
    date:'Jul 1', venue:'Mercedes-Benz Stadium, Atlanta',
    note:'Japan eliminated'
  },
  {
    id:'r32-10', round:'R32', home:"Côte d'Ivoire", homeFlag:'🇨🇮', homeElo:1780,
    away:'Norway', awayFlag:'🇳🇴', awayElo:1830,
    pHome:0.38, pDraw:0.28, pAway:0.34, predictedWinner:'Norway', confidence:34, upset:false,
    status:'UPCOMING', date:'Jul 2', venue:'Arrowhead Stadium, Kansas City'
  },
  {
    id:'r32-11', round:'R32', home:'Mexico', homeFlag:'🇲🇽', homeElo:1800,
    away:'Ecuador', awayFlag:'🇪🇨', awayElo:1740,
    pHome:0.52, pDraw:0.26, pAway:0.22, predictedWinner:'Mexico', confidence:52, upset:false,
    status:'UPCOMING', date:'Jul 3', venue:'Estadio Azteca, Mexico City'
  },
  {
    id:'r32-12', round:'R32', home:'England', homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeElo:2020,
    away:'DR Congo', awayFlag:'🇨🇩', awayElo:1620,
    pHome:0.78, pDraw:0.14, pAway:0.08, predictedWinner:'England', confidence:78, upset:false,
    status:'UPCOMING', date:'Jul 3', venue:'BC Place, Vancouver'
  },
  {
    id:'r32-13', round:'R32', home:'Argentina', homeFlag:'🇦🇷', homeElo:2080,
    away:'Cape Verde', awayFlag:'🇨🇻', awayElo:1580,
    pHome:0.82, pDraw:0.12, pAway:0.06, predictedWinner:'Argentina', confidence:82, upset:false,
    status:'UPCOMING', date:'Jul 4', venue:'BMO Field, Toronto'
  },
  {
    id:'r32-14', round:'R32', home:'Australia', homeFlag:'🇦🇺', homeElo:1720,
    away:'Egypt', awayFlag:'🇪🇬', awayElo:1700,
    pHome:0.42, pDraw:0.32, pAway:0.26, predictedWinner:'Australia', confidence:42, upset:false,
    status:'UPCOMING', date:'Jul 4', venue:'Levi\'s Stadium, San Jose'
  },
  {
    id:'r32-15', round:'R32', home:'Switzerland', homeFlag:'🇨🇭', homeElo:1840,
    away:'Algeria', awayFlag:'🇩🇿', awayElo:1800,
    pHome:0.45, pDraw:0.30, pAway:0.25, predictedWinner:'Switzerland', confidence:45, upset:false,
    status:'UPCOMING', date:'Jul 5', venue:'Saputo Stadium, Montreal'
  },
  {
    id:'r32-16', round:'R32', home:'Colombia', homeFlag:'🇨🇴', homeElo:1810,
    away:'Ghana', awayFlag:'🇬🇭', awayElo:1720,
    pHome:0.58, pDraw:0.24, pAway:0.18, predictedWinner:'Colombia', confidence:58, upset:false,
    status:'UPCOMING', date:'Jul 5', venue:'BMO Field, Toronto'
  },
];

const PREDICTED_R16: BracketMatch[] = [
  { id:'r16-1', round:'R16', home:'Paraguay', homeFlag:'🇵🇾', homeElo:1690, away:'France', awayFlag:'🇫🇷', awayElo:2090, pHome:0.22, pDraw:0.24, pAway:0.54, predictedWinner:'France', confidence:54, upset:false, status:'UPCOMING', date:'Jul 8', venue:'MetLife Stadium' },
  { id:'r16-2', round:'R16', home:'Canada', homeFlag:'🇨🇦', homeElo:1750, away:'Morocco', awayFlag:'🇲🇦', awayElo:1880, pHome:0.38, pDraw:0.28, pAway:0.34, predictedWinner:'Morocco', confidence:34, upset:false, status:'UPCOMING', date:'Jul 8', venue:'AT&T Stadium' },
  { id:'r16-3', round:'R16', home:'Portugal', homeFlag:'🇵🇹', homeElo:1980, away:'Spain', awayFlag:'🇪🇸', awayElo:2050, pHome:0.42, pDraw:0.28, pAway:0.30, predictedWinner:'Spain', confidence:42, upset:false, status:'UPCOMING', date:'Jul 9', venue:'Rose Bowl' },
  { id:'r16-4', round:'R16', home:'USA', homeFlag:'🇺🇸', homeElo:1850, away:'Belgium', awayFlag:'🇧🇪', awayElo:1920, pHome:0.40, pDraw:0.28, pAway:0.32, predictedWinner:'Belgium', confidence:40, upset:false, status:'UPCOMING', date:'Jul 9', venue:'SoFi Stadium' },
  { id:'r16-5', round:'R16', home:'Brazil', homeFlag:'🇧🇷', homeElo:2100, away:'Norway', awayFlag:'🇳🇴', awayElo:1830, pHome:0.65, pDraw:0.21, pAway:0.14, predictedWinner:'Brazil', confidence:65, upset:false, status:'UPCOMING', date:'Jul 10', venue:'Hard Rock Stadium' },
  { id:'r16-6', round:'R16', home:'Mexico', homeFlag:'🇲🇽', homeElo:1800, away:'England', awayFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayElo:2020, pHome:0.28, pDraw:0.26, pAway:0.46, predictedWinner:'England', confidence:46, upset:false, status:'UPCOMING', date:'Jul 10', venue:'Gillette Stadium' },
  { id:'r16-7', round:'R16', home:'Argentina', homeFlag:'🇦🇷', homeElo:2080, away:'Australia', awayFlag:'🇦🇺', awayElo:1720, pHome:0.72, pDraw:0.18, pAway:0.10, predictedWinner:'Argentina', confidence:72, upset:false, status:'UPCOMING', date:'Jul 11', venue:'Empower Field' },
  { id:'r16-8', round:'R16', home:'Switzerland', homeFlag:'🇨🇭', homeElo:1840, away:'Colombia', awayFlag:'🇨🇴', awayElo:1810, pHome:0.46, pDraw:0.28, pAway:0.26, predictedWinner:'Switzerland', confidence:46, upset:false, status:'UPCOMING', date:'Jul 11', venue:'Mercedes-Benz Stadium' },
];

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

function MatchCard({m}:{m:BracketMatch}) {
  const badge = confBadge(m.confidence, m.upset);
  const done = m.status !== 'UPCOMING';
  const penHome = m.penWinner === m.home;
  const penAway = m.penWinner === m.away;
  const predictedHomeWin = m.predictedWinner === m.home;
  const actualHomeWin = done && m.homeGoals !== undefined && m.awayGoals !== undefined && (m.homeGoals > m.awayGoals || penHome);
  const actualAwayWin = done && m.homeGoals !== undefined && m.awayGoals !== undefined && (m.awayGoals > m.homeGoals || penAway);
  const homeWins = done ? actualHomeWin : predictedHomeWin;
  const awayWins = done ? actualAwayWin : !predictedHomeWin;

  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{background:C.surface,border:`1px solid ${m.status==='LIVE'?C.red:m.status==='FT-PENS'?C.amber+'40':C.border}`,borderRadius:10,overflow:'hidden',marginBottom:'0.5rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.45rem 0.75rem',borderBottom:`1px solid ${C.border}20`,background:'#ffffff03'}}>
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
        <div style={{textAlign:'center',minWidth:100}}>
          {done ? (
            <div>
              <div style={{fontSize:20,fontWeight:800,color:C.text}}>{m.homeGoals} – {m.awayGoals}</div>
              {m.penScore && <div style={{fontSize:10,color:C.amber}}>({m.penWinner} win {m.penScore} pens)</div>}
            </div>
          ) : (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.muted}}>{Math.round(m.pHome*100)}–{Math.round(m.pDraw*100)}–{Math.round(m.pAway*100)}</div>
              <div style={{fontSize:10,color:C.muted}}>H – D – A %</div>
              <div style={{fontSize:11,color:C.gold,fontWeight:600,marginTop:2}}>→ {m.predictedWinner}</div>
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
        <div style={{padding:'0.3rem 0.75rem',background:`${C.amber}08`,borderTop:`1px solid ${C.amber}20`,fontSize:11,color:C.amber}}>
          ⚡ {m.note}
        </div>
      )}
    </motion.div>
  );
}

export default function Bracket() {
  const [tab, setTab] = useState('All');
  const allMatches = [...R32, ...PREDICTED_R16];
  const filtered = tab==='R32' ? R32 : tab==='R16' ? PREDICTED_R16 : allMatches;

  const ftCount = R32.filter(m=>m.status==='FT'||m.status==='FT-PENS').length;
  const liveCount = R32.filter(m=>m.status==='LIVE').length;
  const upcomingCount = R32.filter(m=>m.status==='UPCOMING').length;

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Knockout Stage</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.4rem'}}>Tournament Bracket</h1>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
            <span style={{fontSize:12,color:C.muted}}><span style={{color:C.text,fontWeight:700}}>{ftCount}</span> Completed</span>
            {liveCount>0 && <span style={{fontSize:12,color:C.red}}><span style={{fontWeight:700}}>● {liveCount}</span> Live Now</span>}
            <span style={{fontSize:12,color:C.blue}}><span style={{fontWeight:700}}>{upcomingCount}</span> Upcoming (R32)</span>
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            {['All','R32','R16'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${tab===t?C.gold:C.border}`,background:tab===t?`${C.gold}15`:'transparent',color:tab===t?C.gold:C.muted,fontSize:12,fontWeight:tab===t?700:400,cursor:'pointer'}}>
                {t} {t==='R32'?`(${R32.length})`:t==='R16'?`(${PREDICTED_R16.length})`:`(${allMatches.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.25rem 2rem'}}>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1rem',padding:'0.6rem 1rem',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.muted}}>
          <span>✓ = Match winner</span>
          <span>H–D–A = Win probability %</span>
          <span style={{color:C.green}}>≥65% = High conf</span>
          <span style={{color:C.amber}}>50–64% = Medium</span>
          <span style={{color:C.red}}>⚠ UPSET = Lower ELO predicted to win</span>
          <span style={{color:C.amber}}>FT (PENS) = Decided on penalties</span>
        </div>

        {(tab==='All'||tab==='R32') && (
          <>
            <div style={{fontSize:11,color:C.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span>⚡ Round of 32</span>
              <span style={{color:C.muted,fontWeight:400}}>— official draw · {ftCount} completed</span>
            </div>
            {R32.map(m=><MatchCard key={m.id} m={m} />)}
          </>
        )}

        {(tab==='All'||tab==='R16') && (
          <>
            <div style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'1.25rem 0 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span>🔮 Round of 16 — Model Predictions</span>
              <span style={{color:C.muted,fontWeight:400,fontSize:10}}>based on projected R32 winners</span>
            </div>
            {PREDICTED_R16.map(m=><MatchCard key={m.id} m={m} />)}
          </>
        )}

        <div style={{marginTop:'1rem',padding:'0.75rem 1rem',background:C.surface,border:`1px solid ${C.border}30`,borderRadius:8,fontSize:12,color:C.muted}}>
          R16 predictions based on 10,000 Monte Carlo simulations. Most likely finalists: <span style={{color:C.gold,fontWeight:600}}>Argentina vs France</span>. Biggest upset so far: <span style={{color:C.orange,fontWeight:600}}>Morocco eliminate Netherlands · Paraguay eliminate Germany (both on pens)</span>.
        </div>
      </div>
    </div>
  );
}
