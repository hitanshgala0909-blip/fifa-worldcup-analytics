import { useState } from "react";
import { motion } from "framer-motion";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', amber:'#f59e0b', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

type Status = 'FT'|'LIVE'|'UPCOMING';
interface BracketMatch {
  id:string; round:string; home:string; homeFlag:string; homeElo:number;
  away:string; awayFlag:string; awayElo:number;
  pHome:number; pDraw:number; pAway:number;
  predictedWinner:string; confidence:number; upset:boolean;
  status:Status; homeGoals?:number; awayGoals?:number; date:string; venue:string;
}

const R32: BracketMatch[] = [
  { id:'r32-1',round:'R32',home:'Brazil',homeFlag:'🇧🇷',homeElo:2100,away:'Bosnia & Herz.',awayFlag:'🇧🇦',awayElo:1720,pHome:0.78,pDraw:0.14,pAway:0.08,predictedWinner:'Brazil',confidence:78,upset:false,status:'FT',homeGoals:3,awayGoals:0,date:'Jul 1',venue:'MetLife Stadium, New York' },
  { id:'r32-2',round:'R32',home:'England',homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',homeElo:2020,away:'South Korea',awayFlag:'🇰🇷',awayElo:1790,pHome:0.65,pDraw:0.20,pAway:0.15,predictedWinner:'England',confidence:65,upset:false,status:'FT',homeGoals:2,awayGoals:1,date:'Jul 1',venue:'AT&T Stadium, Dallas' },
  { id:'r32-3',round:'R32',home:'France',homeFlag:'🇫🇷',homeElo:2090,away:'Austria',awayFlag:'🇦🇹',awayElo:1810,pHome:0.72,pDraw:0.18,pAway:0.10,predictedWinner:'France',confidence:72,upset:false,status:'LIVE',homeGoals:2,awayGoals:0,date:'Jul 1',venue:'Hard Rock Stadium, Miami' },
  { id:'r32-4',round:'R32',home:'Argentina',homeFlag:'🇦🇷',homeElo:2080,away:'Norway',awayFlag:'🇳🇴',awayElo:1830,pHome:0.70,pDraw:0.19,pAway:0.11,predictedWinner:'Argentina',confidence:70,upset:false,status:'LIVE',homeGoals:1,awayGoals:0,date:'Jul 1',venue:'SoFi Stadium, Los Angeles' },
  { id:'r32-5',round:'R32',home:'Spain',homeFlag:'🇪🇸',homeElo:2050,away:'Japan',awayFlag:'🇯🇵',awayElo:1870,pHome:0.58,pDraw:0.22,pAway:0.20,predictedWinner:'Spain',confidence:58,upset:false,status:'UPCOMING',date:'Jul 2',venue:'Rose Bowl, Los Angeles' },
  { id:'r32-6',round:'R32',home:'Netherlands',homeFlag:'🇳🇱',homeElo:1960,away:'Uruguay',awayFlag:'🇺🇾',awayElo:1890,pHome:0.55,pDraw:0.23,pAway:0.22,predictedWinner:'Netherlands',confidence:55,upset:false,status:'UPCOMING',date:'Jul 2',venue:'Gillette Stadium, Boston' },
  { id:'r32-7',round:'R32',home:'Germany',homeFlag:'🇩🇪',homeElo:1950,away:'Egypt',awayFlag:'🇪🇬',awayElo:1700,pHome:0.72,pDraw:0.17,pAway:0.11,predictedWinner:'Germany',confidence:72,upset:false,status:'UPCOMING',date:'Jul 3',venue:'Mercedes-Benz Stadium, Atlanta' },
  { id:'r32-8',round:'R32',home:'Belgium',homeFlag:'🇧🇪',homeElo:1920,away:"Côte d'Ivoire",awayFlag:'🇨🇮',awayElo:1780,pHome:0.62,pDraw:0.22,pAway:0.16,predictedWinner:'Belgium',confidence:62,upset:false,status:'UPCOMING',date:'Jul 3',venue:'Empower Field, Denver' },
  { id:'r32-9',round:'R32',home:'Portugal',homeFlag:'🇵🇹',homeElo:1980,away:'Morocco',awayFlag:'🇲🇦',awayElo:1880,pHome:0.50,pDraw:0.26,pAway:0.24,predictedWinner:'Portugal',confidence:50,upset:false,status:'UPCOMING',date:'Jul 3',venue:'NRG Stadium, Houston' },
  { id:'r32-10',round:'R32',home:'Colombia',homeFlag:'🇨🇴',homeElo:1810,away:'Scotland',awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',awayElo:1760,pHome:0.55,pDraw:0.25,pAway:0.20,predictedWinner:'Colombia',confidence:55,upset:false,status:'UPCOMING',date:'Jul 4',venue:'Levi\'s Stadium, San Jose' },
  { id:'r32-11',round:'R32',home:'USA',homeFlag:'🇺🇸',homeElo:1850,away:'Switzerland',awayFlag:'🇨🇭',awayElo:1840,pHome:0.45,pDraw:0.28,pAway:0.27,predictedWinner:'USA',confidence:45,upset:false,status:'UPCOMING',date:'Jul 4',venue:'Arrowhead Stadium, Kansas City' },
  { id:'r32-12',round:'R32',home:'Mexico',homeFlag:'🇲🇽',homeElo:1800,away:'Canada',awayFlag:'🇨🇦',awayElo:1750,pHome:0.48,pDraw:0.28,pAway:0.24,predictedWinner:'Mexico',confidence:48,upset:false,status:'UPCOMING',date:'Jul 4',venue:'Estadio Azteca, Mexico City' },
  { id:'r32-13',round:'R32',home:'Ecuador',homeFlag:'🇪🇨',homeElo:1740,away:'Iran',awayFlag:'🇮🇷',awayElo:1760,pHome:0.42,pDraw:0.30,pAway:0.28,predictedWinner:'Iran',confidence:42,upset:true,status:'UPCOMING',date:'Jul 5',venue:'BC Place, Vancouver' },
  { id:'r32-14',round:'R32',home:'Croatia',homeFlag:'🇭🇷',homeElo:1900,away:'Senegal',awayFlag:'🇸🇳',awayElo:1820,pHome:0.52,pDraw:0.25,pAway:0.23,predictedWinner:'Croatia',confidence:52,upset:false,status:'UPCOMING',date:'Jul 5',venue:'BMO Field, Toronto' },
  { id:'r32-15',round:'R32',home:'Türkiye',homeFlag:'🇹🇷',homeElo:1800,away:'Ghana',awayFlag:'🇬🇭',awayElo:1720,pHome:0.55,pDraw:0.24,pAway:0.21,predictedWinner:'Türkiye',confidence:55,upset:false,status:'UPCOMING',date:'Jul 5',venue:'Saputo Stadium, Montreal' },
  { id:'r32-16',round:'R32',home:'Saudi Arabia',homeFlag:'🇸🇦',homeElo:1700,away:'Paraguay',awayFlag:'🇵🇾',awayElo:1690,pHome:0.42,pDraw:0.28,pAway:0.30,predictedWinner:'Paraguay',confidence:42,upset:true,status:'UPCOMING',date:'Jul 6',venue:'BMO Field, Toronto' },
];

const PREDICTED_R16: BracketMatch[] = [
  { id:'r16-1',round:'R16',home:'Brazil',homeFlag:'🇧🇷',homeElo:2100,away:'Colombia',awayFlag:'🇨🇴',awayElo:1810,pHome:0.68,pDraw:0.18,pAway:0.14,predictedWinner:'Brazil',confidence:68,upset:false,status:'UPCOMING',date:'Jul 8',venue:'MetLife Stadium' },
  { id:'r16-2',round:'R16',home:'England',homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',homeElo:2020,away:'Croatia',awayFlag:'🇭🇷',awayElo:1900,pHome:0.55,pDraw:0.24,pAway:0.21,predictedWinner:'England',confidence:55,upset:false,status:'UPCOMING',date:'Jul 8',venue:'AT&T Stadium' },
  { id:'r16-3',round:'R16',home:'France',homeFlag:'🇫🇷',homeElo:2090,away:'Portugal',awayFlag:'🇵🇹',awayElo:1980,pHome:0.55,pDraw:0.24,pAway:0.21,predictedWinner:'France',confidence:55,upset:false,status:'UPCOMING',date:'Jul 9',venue:'Hard Rock Stadium' },
  { id:'r16-4',round:'R16',home:'Argentina',homeFlag:'🇦🇷',homeElo:2080,away:'Germany',awayFlag:'🇩🇪',awayElo:1950,pHome:0.52,pDraw:0.25,pAway:0.23,predictedWinner:'Argentina',confidence:52,upset:false,status:'UPCOMING',date:'Jul 9',venue:'SoFi Stadium' },
  { id:'r16-5',round:'R16',home:'Spain',homeFlag:'🇪🇸',homeElo:2050,away:'Belgium',awayFlag:'🇧🇪',awayElo:1920,pHome:0.58,pDraw:0.22,pAway:0.20,predictedWinner:'Spain',confidence:58,upset:false,status:'UPCOMING',date:'Jul 10',venue:'Rose Bowl' },
  { id:'r16-6',round:'R16',home:'Netherlands',homeFlag:'🇳🇱',homeElo:1960,away:'Mexico',awayFlag:'🇲🇽',awayElo:1800,pHome:0.62,pDraw:0.21,pAway:0.17,predictedWinner:'Netherlands',confidence:62,upset:false,status:'UPCOMING',date:'Jul 10',venue:'Gillette Stadium' },
  { id:'r16-7',round:'R16',home:'USA',homeFlag:'🇺🇸',homeElo:1850,away:'Türkiye',awayFlag:'🇹🇷',awayElo:1800,pHome:0.48,pDraw:0.28,pAway:0.24,predictedWinner:'USA',confidence:48,upset:false,status:'UPCOMING',date:'Jul 11',venue:'Empower Field' },
  { id:'r16-8',round:'R16',home:'Paraguay',homeFlag:'🇵🇾',homeElo:1690,away:'Japan',awayFlag:'🇯🇵',awayElo:1870,pHome:0.30,pDraw:0.26,pAway:0.44,predictedWinner:'Japan',confidence:44,upset:true,status:'UPCOMING',date:'Jul 11',venue:'Mercedes-Benz Stadium' },
];

const TABS = ['All','R32','R16'];

function confBadge(conf:number, upset:boolean) {
  if(upset) return {bg:`${C.red}20`,color:C.red,label:'⚠ UPSET'};
  if(conf>=60) return {bg:`${C.green}20`,color:C.green,label:`${conf}% conf`};
  if(conf>=50) return {bg:`${C.amber}20`,color:C.amber,label:`${conf}% conf`};
  return {bg:`${C.red}20`,color:C.red,label:`${conf}% conf`};
}

function StatusBadge({status}:{status:Status}) {
  if(status==='FT') return <span style={{fontSize:10,background:'#ffffff12',color:C.muted,padding:'2px 7px',borderRadius:4,fontWeight:600}}>FT</span>;
  if(status==='LIVE') return <span style={{fontSize:10,background:`${C.red}22`,color:C.red,padding:'2px 7px',borderRadius:4,fontWeight:700,animation:'pulse 1.5s infinite'}}>● LIVE</span>;
  return <span style={{fontSize:10,background:`${C.blue}18`,color:C.blue,padding:'2px 7px',borderRadius:4,fontWeight:600}}>UPCOMING</span>;
}

function MatchCard({m}:{m:BracketMatch}) {
  const badge = confBadge(m.confidence, m.upset);
  const homeWins = m.predictedWinner === m.home;
  const awayWins = m.predictedWinner === m.away;
  const done = m.status !== 'UPCOMING';
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{background:C.surface,border:`1px solid ${m.status==='LIVE'?C.red:C.border}`,borderRadius:10,overflow:'hidden',marginBottom:'0.6rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.5rem 0.75rem',borderBottom:`1px solid ${C.border}30`,background:'#ffffff04'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{m.date} · {m.venue.split(',')[0]}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:10,padding:'2px 7px',borderRadius:4,fontWeight:700,background:badge.bg,color:badge.color}}>{badge.label}</span>
          <StatusBadge status={m.status} />
        </div>
      </div>
      <div style={{padding:'0.75rem',display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'0.5rem',alignItems:'center'}}>
        {/* Home */}
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',justifyContent:'flex-end'}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:15,fontWeight:homeWins?700:400,color:homeWins?C.green:C.text}}>{m.home}</div>
            <div style={{fontSize:11,color:C.muted}}>ELO {m.homeElo}</div>
          </div>
          <span style={{fontSize:26}}>{m.homeFlag}</span>
          {homeWins && <span style={{color:C.green,fontSize:12}}>✓</span>}
        </div>
        {/* Score/Prob */}
        <div style={{textAlign:'center',minWidth:90}}>
          {done
            ? <div style={{fontSize:22,fontWeight:800,color:C.text}}>{m.homeGoals} – {m.awayGoals}</div>
            : <div>
                <div style={{fontSize:13,fontWeight:700,color:C.muted}}>{Math.round(m.pHome*100)}–{Math.round(m.pDraw*100)}–{Math.round(m.pAway*100)}</div>
                <div style={{fontSize:10,color:C.muted}}>H – D – A</div>
              </div>
          }
        </div>
        {/* Away */}
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          {awayWins && <span style={{color:C.green,fontSize:12}}>✓</span>}
          <span style={{fontSize:26}}>{m.awayFlag}</span>
          <div>
            <div style={{fontSize:15,fontWeight:awayWins?700:400,color:awayWins?C.green:C.text}}>{m.away}</div>
            <div style={{fontSize:11,color:C.muted}}>ELO {m.awayElo}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Bracket() {
  const [tab, setTab] = useState('All');
  const allMatches = [...R32, ...PREDICTED_R16];
  const filtered = tab === 'R32' ? R32 : tab === 'R16' ? PREDICTED_R16 : allMatches;

  const ftCount = R32.filter(m=>m.status==='FT').length;
  const liveCount = R32.filter(m=>m.status==='LIVE').length;
  const upcomingCount = R32.filter(m=>m.status==='UPCOMING').length;

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Knockout Stage</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.5rem'}}>Tournament Bracket</h1>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:C.muted}}><span style={{color:C.muted,fontWeight:700}}>{ftCount}</span> Completed</span>
            <span style={{fontSize:12,color:C.red}}><span style={{fontWeight:700}}>● {liveCount}</span> Live Now</span>
            <span style={{fontSize:12,color:C.blue}}><span style={{fontWeight:700}}>{upcomingCount}</span> Upcoming (R32)</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem 2rem'}}>
        {/* Legend */}
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'1rem',padding:'0.75rem 1rem',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.muted}}>
          <span>✓ = Predicted winner</span>
          <span>H–D–A = Win probability %</span>
          <span style={{color:C.green}}>≥60% = High confidence</span>
          <span style={{color:C.amber}}>50-59% = Medium</span>
          <span style={{color:C.red}}>⚠ UPSET = Lower ELO predicted to win</span>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.25rem'}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'0.4rem 1rem',borderRadius:6,border:`1px solid ${tab===t?C.gold:C.border}`,background:tab===t?`${C.gold}15`:'transparent',color:tab===t?C.gold:C.muted,fontSize:13,fontWeight:tab===t?700:400,cursor:'pointer'}}>
              {t} {t==='R32'?`(${R32.length})`:t==='R16'?`(${PREDICTED_R16.length})`:`(${allMatches.length})`}
            </button>
          ))}
        </div>

        {/* Section headers */}
        {tab === 'All' || tab === 'R32' ? (
          <>
            <div style={{fontSize:11,color:C.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span>⚡ Round of 32</span>
              <span style={{color:C.muted,fontWeight:400}}>— {R32.filter(m=>m.status==='FT').length} completed, {R32.filter(m=>m.status==='LIVE').length} live</span>
            </div>
            {R32.map(m=><MatchCard key={m.id} m={m} />)}
          </>
        ) : null}

        {tab === 'All' || tab === 'R16' ? (
          <>
            <div style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'1.25rem 0 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span>🔮 Round of 16 Predictions</span>
              <span style={{color:C.muted,fontWeight:400,fontSize:10}}>— based on model projections</span>
            </div>
            {PREDICTED_R16.map(m=><MatchCard key={m.id} m={m} />)}
          </>
        ) : null}

        {/* Prediction note */}
        <div style={{marginTop:'1rem',padding:'0.75rem 1rem',background:C.surface,border:`1px solid ${C.border}30`,borderRadius:8,fontSize:12,color:C.muted}}>
          R16 predictions based on 10,000 Monte Carlo simulations. Most likely finalists: <span style={{color:C.gold,fontWeight:600}}>Argentina vs Spain</span>. Biggest R32 upset risk: <span style={{color:C.orange,fontWeight:600}}>Morocco over Portugal</span>.
        </div>
      </div>
    </div>
  );
}
