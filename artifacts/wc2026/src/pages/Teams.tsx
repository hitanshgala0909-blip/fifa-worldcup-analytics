import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAMS, SIMULATION, getMatchesByGroup, Team } from "@/data/wc2026";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

const ELIMINATED_GROUP: Set<string> = new Set([
  'South Africa','Czechia','Qatar','Bosnia & Herz.','Scotland','Haiti','Türkiye',
  'Curaçao','Tunisia','New Zealand','Algeria','Jordan','Uzbekistan','Ghana','Panama','Cape Verde',
]);
const ELIMINATED_R32: Set<string> = new Set([
  'Germany','Netherlands','Japan',
]);
function eliminatedBadge(name:string):{show:boolean;label:string;color:string;bg:string}|null {
  if(ELIMINATED_R32.has(name)) return {show:true,label:'Out R32',color:'#9ca3af',bg:'#9ca3af18'};
  if(ELIMINATED_GROUP.has(name)) return {show:true,label:'Eliminated',color:'#6b7280',bg:'#6b728018'};
  return null;
}

function tier(elo:number):{label:string;color:string;bg:string} {
  if(elo>=1950) return {label:'⚡ Elite',color:C.gold,bg:`${C.gold}18`};
  if(elo>=1850) return {label:'🔵 Contender',color:C.blue,bg:`${C.blue}18`};
  if(elo>=1750) return {label:'🟡 Competitive',color:C.orange,bg:`${C.orange}18`};
  return {label:'🟤 Underdog',color:'#9e7b2c',bg:'#3d2b0020'};
}

type SortKey = 'eloRating'|'worldRank'|'simWinPct'|'name';

export default function Teams() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('simWinPct');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team|null>(null);

  const sorted = useMemo(()=>{
    let ts = TEAMS.filter(t=>
      (!search || t.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterGroup || t.group === filterGroup)
    );
    return [...ts].sort((a,b)=>{
      if(sortKey==='name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if(sortKey==='worldRank') return sortAsc ? a.worldRank-b.worldRank : b.worldRank-a.worldRank;
      return sortAsc ? (a as any)[sortKey]-(b as any)[sortKey] : (b as any)[sortKey]-(a as any)[sortKey];
    });
  },[search, sortKey, sortAsc, filterGroup]);

  const toggleSort = (k:SortKey)=>{ if(sortKey===k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false); } };
  const sim = selectedTeam ? SIMULATION.find(s=>s.team===selectedTeam.name) : null;
  const fixtures = selectedTeam ? getMatchesByGroup(selectedTeam.group).filter(m=>m.home===selectedTeam.id||m.away===selectedTeam.id) : [];
  const groups = Array.from(new Set(TEAMS.map(t=>t.group))).sort();

  const SortBtn = ({k,l}:{k:SortKey,l:string}) => (
    <button onClick={()=>toggleSort(k)} style={{background:'none',border:'none',cursor:'pointer',color:sortKey===k?C.gold:C.muted,fontSize:11,fontWeight:sortKey===k?700:500,textTransform:'uppercase',letterSpacing:1,display:'flex',alignItems:'center',gap:2,padding:0}}>
      {l}{sortKey===k?sortAsc?<ChevronUp size={10}/>:<ChevronDown size={10}/>:null}
    </button>
  );

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Power Rankings</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.75rem'}}>All 48 Teams</h1>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,maxWidth:280}}>
              <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.muted,pointerEvents:'none'}} />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search team…" style={{width:'100%',paddingLeft:32,paddingRight:10,paddingTop:7,paddingBottom:7,background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,outline:'none',boxSizing:'border-box'}} />
            </div>
            <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} style={{padding:'7px 10px',background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:filterGroup?C.text:C.muted,fontSize:13,cursor:'pointer',outline:'none'}}>
              <option value="">All Groups</option>
              {groups.map(g=><option key={g} value={g}>Group {g}</option>)}
            </select>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {['⚡ Elite','🔵 Contender','🟡 Competitive','🟤 Underdog'].map(l=>(
                <span key={l} style={{fontSize:11,color:C.muted,padding:'3px 8px',borderRadius:4,background:'#ffffff08'}}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'1.5rem 2rem',display:'flex',gap:'1.25rem',alignItems:'flex-start'}}>
        {/* Table */}
        <div style={{flex:1,minWidth:0,overflowX:'auto'}}>
          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 60px 80px 90px 80px',gap:'0.5rem',padding:'0.4rem 0.75rem',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:11,color:C.muted,fontWeight:600}}>#</span>
            <SortBtn k="name" l="Team" />
            <SortBtn k="eloRating" l="ELO" />
            <SortBtn k="worldRank" l="Rank" />
            <SortBtn k="simWinPct" l="Win %" />
            <span style={{fontSize:11,color:C.muted,fontWeight:500,textTransform:'uppercase',letterSpacing:1}}>Tier</span>
            <span style={{fontSize:11,color:C.muted,fontWeight:500,textTransform:'uppercase',letterSpacing:1}}>Form</span>
          </div>

          {sorted.map((t,i)=>{
            const {label,color,bg} = tier(t.eloRating);
            const isSelected = selectedTeam?.id === t.id;
            return (
              <motion.div key={t.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:Math.min(i*0.012,0.3)}}
                onClick={()=>setSelectedTeam(isSelected?null:t)}
                style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 60px 80px 90px 80px',gap:'0.5rem',alignItems:'center',padding:'0.55rem 0.75rem',borderBottom:`1px solid ${C.border}20`,cursor:'pointer',background:isSelected?`${C.gold}08`:'transparent',transition:'background 0.1s'}}>
                <span style={{fontSize:12,color:C.muted,fontWeight:600}}>{i+1}</span>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',minWidth:0}}>
                  <span style={{fontSize:20,flexShrink:0,opacity:eliminatedBadge(t.name)?0.5:1}}>{t.flagEmoji}</span>
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:600,color:eliminatedBadge(t.name)?C.muted:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',textDecoration:eliminatedBadge(t.name)?'line-through':undefined}}>{t.name}</span>
                      {(()=>{const b=eliminatedBadge(t.name);return b?<span style={{fontSize:9,background:b.bg,color:b.color,padding:'1px 5px',borderRadius:3,fontWeight:600,flexShrink:0,whiteSpace:'nowrap'}}>{b.label}</span>:null})()}
                    </div>
                    <div style={{fontSize:10,color:C.muted}}>Grp {t.group} · {t.confederation}</div>
                  </div>
                </div>
                <span style={{fontSize:13,color:C.text,fontWeight:600}}>{t.eloRating}</span>
                <span style={{fontSize:13,color:C.muted}}>#{t.worldRank}</span>
                <span style={{fontSize:13,color:C.gold,fontWeight:700}}>{t.simWinPct}%</span>
                <span style={{fontSize:10,background:bg,color:color,padding:'2px 5px',borderRadius:4,fontWeight:600,whiteSpace:'nowrap'}}>{label}</span>
                <div style={{display:'flex',gap:'2px'}}>
                  {t.form.split('').map((f,fi)=>(
                    <span key={fi} style={{width:13,height:13,borderRadius:'50%',background:f==='W'?C.green:f==='D'?C.gold:C.red,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'black',fontWeight:700}}>{f}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
          {sorted.length===0 && <div style={{padding:'3rem',textAlign:'center',color:C.muted}}>No teams match your search</div>}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:300}} exit={{opacity:0,width:0}} style={{flexShrink:0,overflow:'hidden'}}>
              <div style={{width:300,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',position:'sticky',top:'1rem'}}>
                <div style={{padding:'1rem',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span style={{fontSize:36}}>{selectedTeam.flagEmoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:17,fontWeight:700}}>{selectedTeam.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>Group {selectedTeam.group} · {selectedTeam.confederation}</div>
                  </div>
                  <button onClick={()=>setSelectedTeam(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,borderRadius:4}}><X size={16}/></button>
                </div>
                <div style={{padding:'1rem',overflowY:'auto',maxHeight:'calc(80vh - 80px)'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'1rem'}}>
                    {[{l:'ELO',v:selectedTeam.eloRating,c:C.blue},{l:'World Rank',v:'#'+selectedTeam.worldRank,c:C.muted},{l:'Win Prob',v:selectedTeam.simWinPct+'%',c:C.gold},{l:'Proj. Pts',v:selectedTeam.projectedPoints+'pts',c:C.green}].map(({l,v,c})=>(
                      <div key={l} style={{background:'#ffffff06',borderRadius:6,padding:'0.6rem'}}>
                        <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.2rem'}}>{l}</div>
                        <div style={{fontSize:17,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {sim && (
                    <div style={{marginBottom:'1rem'}}>
                      <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.5rem'}}>Tournament Path</div>
                      {[{l:'R16',v:sim.r16Pct,c:C.blue},{l:'QF',v:sim.qfPct,c:C.blue},{l:'SF',v:sim.sfPct,c:C.orange},{l:'Final',v:sim.finalPct,c:C.orange},{l:'🏆 Win',v:sim.winPct,c:C.gold}].map(({l,v,c})=>(
                        <div key={l} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.4rem'}}>
                          <span style={{fontSize:12,color:C.muted,width:36,flexShrink:0}}>{l}</span>
                          <div style={{flex:1,height:5,background:'#ffffff10',borderRadius:99,overflow:'hidden'}}>
                            <div style={{width:`${Math.min(v,100)}%`,height:'100%',background:c,borderRadius:99,transition:'width 0.5s'}} />
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:c,width:38,textAlign:'right'}}>{v}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.4rem'}}>Group {selectedTeam.group} Fixtures</div>
                    {fixtures.map(m=>{
                      const oppId = m.home===selectedTeam.id?m.away:m.home;
                      const opp = TEAMS.find(t=>t.id===oppId);
                      const isHome = m.home===selectedTeam.id;
                      const done = m.homeGoals!==null;
                      const myGoals = done?(isHome?m.homeGoals:m.awayGoals):null;
                      const oppGoals = done?(isHome?m.awayGoals:m.homeGoals):null;
                      const result = done&&myGoals!==null&&oppGoals!==null?(myGoals>oppGoals?'W':myGoals===oppGoals?'D':'L'):null;
                      return (
                        <div key={m.id} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.4rem 0',borderBottom:`1px solid ${C.border}20`,fontSize:12}}>
                          <span style={{color:C.muted,fontSize:10,width:16}}>{isHome?'H':'A'}</span>
                          <span style={{fontSize:16}}>{opp?.flagEmoji}</span>
                          <span style={{flex:1,color:C.text}}>{opp?.name}</span>
                          {done&&result ? (
                            <span style={{fontWeight:700,color:result==='W'?C.green:result==='D'?C.gold:C.red}}>{myGoals}–{oppGoals}</span>
                          ) : (
                            <span style={{color:C.blue,fontSize:11}}>{Math.round((isHome?m.homeProbWin:m.awayProbWin)*100)}%</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{marginTop:'0.75rem',padding:'0.6rem',background:`${C.gold}08`,border:`1px solid ${C.gold}20`,borderRadius:6}}>
                    <div style={{fontSize:10,color:C.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.25rem'}}>Form</div>
                    <div style={{display:'flex',gap:'4px'}}>
                      {selectedTeam.form.split('').map((f,i)=>(
                        <span key={i} style={{width:22,height:22,borderRadius:'50%',background:f==='W'?C.green:f==='D'?C.gold:C.red,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'black',fontWeight:700}}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
