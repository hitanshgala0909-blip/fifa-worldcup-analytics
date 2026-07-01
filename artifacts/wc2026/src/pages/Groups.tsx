import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAMS, MATCHES, getTeamsByGroup, getMatchesByGroup, GROUPS } from "@/data/wc2026";
import { ChevronDown, ChevronUp } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

function tierColor(elo: number) {
  if (elo >= 1950) return C.gold;
  if (elo >= 1850) return C.blue;
  if (elo >= 1750) return C.green;
  return C.orange;
}
function tierLabel(elo: number) {
  if (elo >= 1950) return '⚡ Elite';
  if (elo >= 1850) return '🔵 Contender';
  if (elo >= 1750) return '🟡 Competitive';
  return '🟤 Underdog';
}

function computeStandings(group: string) {
  const gm = MATCHES.filter(m => m.group === group && m.homeGoals !== null);
  const gt = TEAMS.filter(t => t.group === group);
  const tbl: Record<string,{pts:number;w:number;d:number;l:number;gf:number;ga:number}> = {};
  gt.forEach(t => { tbl[t.id] = {pts:0,w:0,d:0,l:0,gf:0,ga:0}; });
  gm.forEach(m => {
    const hg=m.homeGoals!,ag=m.awayGoals!;
    if(!tbl[m.home]) tbl[m.home]={pts:0,w:0,d:0,l:0,gf:0,ga:0};
    if(!tbl[m.away]) tbl[m.away]={pts:0,w:0,d:0,l:0,gf:0,ga:0};
    tbl[m.home].gf+=hg; tbl[m.home].ga+=ag;
    tbl[m.away].gf+=ag; tbl[m.away].ga+=hg;
    if(hg>ag){tbl[m.home].pts+=3;tbl[m.home].w++;tbl[m.away].l++;}
    else if(hg===ag){tbl[m.home].pts+=1;tbl[m.home].d++;tbl[m.away].pts+=1;tbl[m.away].d++;}
    else{tbl[m.away].pts+=3;tbl[m.away].w++;tbl[m.home].l++;}
  });
  return gt.map(t=>({...t,...tbl[t.id],gd:tbl[t.id].gf-tbl[t.id].ga,played:tbl[t.id].w+tbl[t.id].d+tbl[t.id].l}))
    .sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

function MatchRow({m}:{m:ReturnType<typeof getMatchesByGroup>[number]}) {
  const home = TEAMS.find(t=>t.id===m.home);
  const away = TEAMS.find(t=>t.id===m.away);
  const done = m.homeGoals !== null;
  const predWin = m.homeProbWin > m.awayProbWin ? 'home' : m.awayProbWin > m.homeProbWin ? 'away' : 'draw';
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 0.75rem',borderBottom:`1px solid ${C.border}30`,fontSize:13}}>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:'0.5rem',justifyContent:'flex-end'}}>
        <span style={{fontWeight:predWin==='home'?700:400,color:predWin==='home'?C.green:C.text}}>{home?.name}</span>
        <span style={{fontSize:18}}>{home?.flagEmoji}</span>
      </div>
      <div style={{textAlign:'center',minWidth:80,padding:'0.25rem 0.5rem',background:'#ffffff08',borderRadius:6}}>
        {done
          ? <span style={{fontWeight:700,color:C.text}}>{m.homeGoals} – {m.awayGoals}</span>
          : <span style={{color:C.muted,fontSize:11}}>{Math.round(m.homeProbWin*100)}% – {Math.round(m.awayProbWin*100)}%</span>
        }
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:'0.5rem'}}>
        <span style={{fontSize:18}}>{away?.flagEmoji}</span>
        <span style={{fontWeight:predWin==='away'?700:400,color:predWin==='away'?C.green:C.text}}>{away?.name}</span>
      </div>
      <span style={{fontSize:10,color:C.muted,minWidth:24,textAlign:'right'}}>{done?'FT':'→'}</span>
    </div>
  );
}

function GroupCard({group}:{group:string}) {
  const [open, setOpen] = useState(false);
  const teams = getTeamsByGroup(group);
  const matches = getMatchesByGroup(group);
  const standings = computeStandings(group);

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
      {/* Header */}
      <button onClick={()=>setOpen(!open)} style={{width:'100%',padding:'1rem',display:'flex',alignItems:'center',gap:'0.75rem',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
        <div style={{width:36,height:36,borderRadius:8,background:`${C.gold}18`,border:`1px solid ${C.gold}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:800,color:C.gold}}>G{group}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            {teams.map(t=>(
              <span key={t.id} style={{fontSize:11,color:C.text,display:'flex',alignItems:'center',gap:'0.2rem'}}>
                {t.flagEmoji} <span style={{color:C.muted}}>{t.name}</span>
              </span>
            ))}
          </div>
        </div>
        {open ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
      </button>

      {/* Team mini cards */}
      <div style={{padding:'0 1rem 0.75rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
        {teams.map((t,i)=>(
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.4rem 0.6rem',background:'#ffffff06',borderRadius:6,border:i<2?`1px solid ${C.green}30`:`1px solid ${C.border}30`}}>
            <span style={{fontSize:16}}>{t.flagEmoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.name}</div>
              <div style={{fontSize:10,color:C.muted}}>ELO {t.eloRating} · Rank #{t.worldRank}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,color:tierColor(t.eloRating),fontWeight:600}}>{tierLabel(t.eloRating)}</div>
              <div style={{fontSize:11,color:C.gold,fontWeight:700}}>{t.simWinPct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} style={{overflow:'hidden'}}>
            <div style={{borderTop:`1px solid ${C.border}`,padding:'0.75rem 1rem'}}>

              {/* Standings */}
              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.4rem'}}>Current Standings</div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{color:C.muted}}>
                      <th style={{textAlign:'left',padding:'0.2rem 0.3rem',fontWeight:500}}>Team</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500}}>P</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500}}>W</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500}}>D</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500}}>L</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500}}>GD</th>
                      <th style={{textAlign:'center',padding:'0.2rem 0.3rem',fontWeight:500,color:C.gold}}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((t,i)=>(
                      <tr key={t.id} style={{background:i<2?`${C.green}08`:'transparent',borderBottom:`1px solid ${C.border}20`}}>
                        <td style={{padding:'0.3rem 0.3rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                          {i<2 && <span style={{fontSize:8,color:C.green}}>●</span>}
                          <span style={{fontSize:14}}>{t.flagEmoji}</span>
                          <span style={{color:C.text}}>{t.name}</span>
                        </td>
                        <td style={{textAlign:'center',color:C.muted}}>{t.played}</td>
                        <td style={{textAlign:'center',color:C.muted}}>{t.w}</td>
                        <td style={{textAlign:'center',color:C.muted}}>{t.d}</td>
                        <td style={{textAlign:'center',color:C.muted}}>{t.l}</td>
                        <td style={{textAlign:'center',color:t.gd>0?C.green:t.gd<0?C.red:C.muted}}>{t.gd>0?'+':''}{t.gd}</td>
                        <td style={{textAlign:'center',color:C.gold,fontWeight:700}}>{t.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{fontSize:10,color:C.green,marginTop:'0.3rem'}}>● Predicted to qualify for R32</div>
              </div>

              {/* Fixtures */}
              <div>
                <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.4rem'}}>Fixtures</div>
                {matches.map(m=><MatchRow key={m.id} m={m} />)}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Groups() {
  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Group Stage</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.25rem'}}>All 12 Groups</h1>
          <p style={{color:C.muted,fontSize:13,margin:0}}>Click any group to see standings, fixtures, and qualification predictions</p>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'1.5rem 2rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
          {GROUPS.map(g=><GroupCard key={g} group={g} />)}
        </div>
      </div>
    </div>
  );
}
