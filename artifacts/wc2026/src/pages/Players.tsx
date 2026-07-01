import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLAYERS, Player } from "@/data/wc2026";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

const SHAP_REASONS: Record<string,{pos:string[];neg:string[]}> = {
  GK: { pos:['Elite shot-stopping metrics (save %)','Sweeper-keeper distribution quality','Command of box on set-pieces'], neg:['Limited direct offensive contribution','Dependent on team defensive shape','High-pressure situations reduce consistency'] },
  CB: { pos:['Aerial duel win rate (top quartile)','Progressive ball-carry from deep','High tackle success in 1v1 situations'], neg:['Vulnerability on counter-attacks','Recovery pace limits high defensive line','Prone to set-piece exposure vs tall strikers'] },
  RB: { pos:['Overlapping run frequency and quality','Defensive interceptions and clearances','Crossing accuracy into final third'], neg:['Exposed in wide 1v1 vs pace wingers','Energy depletion in high-tempo matches','Limited central contribution metrics'] },
  LB: { pos:['Offensive contribution via progressive carries','Crossing accuracy and delivery','Defensive positional discipline'], neg:['Vulnerability to fast right wingers','Impact lower in deep defensive systems','Fatigue in high-intensity pressing games'] },
  DM: { pos:['PPDA (pressing intensity) top-10%','Ball recovery and interception frequency','Accurate short passing to dictate tempo'], neg:['Limited goal threat from midfield','Pressed wide overloads expose positioning','Below average aerial duel win rate'] },
  CM: { pos:['Key passes per 90 above tournament average','Progressive ball movement through lines','Box-to-box energy and defensive output'], neg:['Decision-making slows in tight spaces','Aerial duel weakness vs physical midfields','Set-piece delivery consistency'] },
  AM: { pos:['xA/90 (expected assists) highly rated','Through-ball accuracy under pressure','Creative overloads in tight defensive blocks'], neg:['Defensive press contribution below average','Loses effectiveness vs compact mid-block','High output variance (feast-or-famine)'] },
  LW: { pos:['1v1 dribble success rate (top quartile)','Progressive run frequency creating overloads','High xG generation from wide positions'], neg:['Defensive tracking can be incomplete','Crossing under pressure below xA expectations','Inconsistent in low-block breakdown'] },
  RW: { pos:['Cutting in creates final-third overloads','Shot creation from wide angles above avg','Defensive press triggers at high frequency'], neg:['Channel defense commitment bypassed by pace','Left-foot quality limits cross-field options','Drops off vs elite left-backs in transition'] },
  ST: { pos:['xG/90 among top-tier strikers in tournament','Hold-up play and link-up with runners','Movement patterns create defensive gaps'], neg:['Pressing workrate reduces late-game sharpness','Aerial success volatile vs elite CBs','Supply-dependent on midfield form'] },
};

function tierBadge(rating:number):{label:string;color:string;bg:string} {
  if(rating>=9.0) return {label:'⚡ Elite',color:C.gold,bg:`${C.gold}20`};
  if(rating>=8.2) return {label:'🌟 World Class',color:C.blue,bg:`${C.blue}20`};
  if(rating>=7.5) return {label:'✅ Quality',color:C.green,bg:`${C.green}18`};
  if(rating>=6.8) return {label:'🔵 Average',color:C.muted,bg:'#ffffff10'};
  return {label:'⚪ Squad',color:'#555',bg:'#ffffff06'};
}

function riskColor(risk:Player['injuryRisk']):{color:string;label:string;bg:string} {
  if(risk==='low') return {color:C.green,label:'Safe',bg:`${C.green}15`};
  if(risk==='medium') return {color:C.gold,label:'Watch',bg:`${C.gold}15`};
  return {color:C.red,label:'Risk',bg:`${C.red}15`};
}

type PosTab = 'ALL'|'GK'|'DF'|'MF'|'FW';
const POS_MAP:Record<string,PosTab> = { GK:'GK', CB:'DF', RB:'DF', LB:'DF', DM:'MF', CM:'MF', AM:'MF', LW:'FW', RW:'FW', ST:'FW' };
type SortOpt = 'rating'|'fantasyPoints'|'goals'|'age';

const PAGE_SIZE = 40;

export default function Players() {
  const [posTab, setPosTab] = useState<PosTab>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOpt>('rating');
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Player|null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(()=>{
    let ps = PLAYERS.filter(p=>
      (posTab==='ALL' || POS_MAP[p.position]===posTab) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase()))
    );
    return [...ps].sort((a,b)=>sortAsc?(a as any)[sortBy]-(b as any)[sortBy]:(b as any)[sortBy]-(a as any)[sortBy]);
  },[posTab, search, sortBy, sortAsc]);

  const paged = filtered.slice(0, (page+1)*PAGE_SIZE);
  const shap = selected ? (SHAP_REASONS[selected.position] ?? SHAP_REASONS['CM']) : null;

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Player Analytics</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.75rem'}}>1,248 Players <span style={{color:C.gold}}>Ranked</span></h1>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
            {(['ALL','GK','DF','MF','FW'] as PosTab[]).map(t=>(
              <button key={t} onClick={()=>{setPosTab(t);setPage(0);}} style={{padding:'5px 14px',borderRadius:6,border:`1px solid ${posTab===t?C.gold:C.border}`,background:posTab===t?`${C.gold}15`:'transparent',color:posTab===t?C.gold:C.muted,fontSize:13,fontWeight:posTab===t?700:400,cursor:'pointer'}}>
                {t}
              </button>
            ))}
            <div style={{position:'relative',flex:1,maxWidth:260}}>
              <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.muted,pointerEvents:'none'}} />
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Search player or country…" style={{width:'100%',paddingLeft:32,paddingRight:10,paddingTop:7,paddingBottom:7,background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,outline:'none',boxSizing:'border-box'}} />
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as SortOpt)} style={{padding:'7px 10px',background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,cursor:'pointer',outline:'none'}}>
              <option value="rating">Rating</option>
              <option value="fantasyPoints">Fantasy Pts</option>
              <option value="goals">Goals</option>
              <option value="age">Age</option>
            </select>
            <button onClick={()=>setSortAsc(!sortAsc)} title="Toggle sort direction" style={{padding:'7px 10px',background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:12}}>
              {sortAsc?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'1.25rem 2rem 0'}}>
        <div style={{padding:'0.65rem 1rem',background:'#0d1f2d',border:'1px solid #1d4ed830',borderRadius:8,fontSize:12,color:'#93c5fd',display:'flex',gap:'0.6rem',alignItems:'flex-start',marginBottom:'1rem'}}>
          <span style={{flexShrink:0,marginTop:1}}>ℹ️</span>
          <span>
            <strong style={{color:'#bfdbfe'}}>Projection scores</strong> were generated before the tournament began using historical data, ELO ratings, squad strength, and form.
            They represent what the model <em>expected</em> — not current match statistics. Actual WC 2026 performance may differ significantly.
          </span>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 2rem 1.5rem',display:'flex',gap:'1.25rem',alignItems:'flex-start'}}>
        {/* Player list */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:'0.75rem'}}>{filtered.length} players · showing {Math.min(paged.length, filtered.length)}</div>

          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 50px 45px 120px 80px 58px',gap:'0.5rem',padding:'0.4rem 0.75rem',borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted,fontWeight:500,textTransform:'uppercase',letterSpacing:1}}>
            <span>#</span><span>Player</span><span>Pos</span><span>Age</span><span>Tier</span><span>Rating</span><span>Risk</span>
          </div>

          {paged.map((p,i)=>{
            const {label,color,bg} = tierBadge(p.rating);
            const rk = riskColor(p.injuryRisk);
            const sel = selected?.id===p.id;
            const rank = filtered.indexOf(p)+1;
            return (
              <motion.div key={p.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:Math.min(i*0.007,0.2)}} onClick={()=>setSelected(sel?null:p)}
                style={{display:'grid',gridTemplateColumns:'36px 1fr 50px 45px 120px 80px 58px',gap:'0.5rem',alignItems:'center',padding:'0.55rem 0.75rem',borderBottom:`1px solid ${C.border}20`,cursor:'pointer',background:sel?`${C.gold}08`:'transparent',transition:'background 0.1s'}}>
                <span style={{fontSize:12,color:C.muted}}>{rank}</span>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',minWidth:0}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:p.rating>=8.5?C.gold:p.rating>=8.0?C.green:C.blue,flexShrink:0}} />
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.country} · {p.club}</div>
                  </div>
                </div>
                <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{p.position}</span>
                <span style={{fontSize:12,color:C.muted}}>{p.age}</span>
                <span style={{fontSize:10,background:bg,color:color,padding:'2px 5px',borderRadius:4,fontWeight:600,whiteSpace:'nowrap'}}>{label}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.rating.toFixed(1)}</div>
                  <div style={{height:3,background:'#ffffff10',borderRadius:99,marginTop:2,overflow:'hidden'}}>
                    <div style={{width:`${p.rating*10}%`,height:'100%',background:p.rating>=9?C.gold:p.rating>=8?C.green:C.blue}} />
                  </div>
                </div>
                <span style={{fontSize:10,background:rk.bg,color:rk.color,padding:'2px 5px',borderRadius:4,fontWeight:600}}>{rk.label}</span>
              </motion.div>
            );
          })}

          {paged.length < filtered.length && (
            <div style={{textAlign:'center',padding:'1.5rem 0'}}>
              <button onClick={()=>setPage(page+1)} style={{padding:'8px 24px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,cursor:'pointer',fontSize:13}}>
                Load more ({filtered.length - paged.length} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:310}} exit={{opacity:0,width:0}} style={{flexShrink:0,overflow:'hidden'}}>
              <div style={{width:310,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',position:'sticky',top:'1rem'}}>
                <div style={{padding:'1rem',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'flex-start',gap:'0.5rem'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:700}}>{selected.name}</div>
                    <div style={{fontSize:12,color:C.muted}}>{selected.country} · {selected.position} · {selected.age} yrs</div>
                    <div style={{fontSize:11,color:C.muted}}>{selected.club}</div>
                    <div style={{display:'flex',gap:'0.4rem',marginTop:'0.4rem',flexWrap:'wrap'}}>
                      {(()=>{const {label,color,bg}=tierBadge(selected.rating);return <span style={{fontSize:10,background:bg,color,padding:'2px 7px',borderRadius:4,fontWeight:700}}>{label}</span>})()}
                      {(()=>{const {color,label,bg}=riskColor(selected.injuryRisk);return <span style={{fontSize:10,background:bg,color,padding:'2px 7px',borderRadius:4,fontWeight:600}}>🔵 {label}</span>})()}
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4,borderRadius:4,flexShrink:0}}><X size={16}/></button>
                </div>
                <div style={{padding:'1rem',overflowY:'auto',maxHeight:'calc(85vh - 130px)'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem',marginBottom:'1rem'}}>
                    {[
                      {l:'Rating',v:selected.rating.toFixed(1),c:C.gold},
                      {l:'xG/90',v:(selected.goals/Math.max(selected.minutesPlayed/90,1)).toFixed(2),c:C.green},
                      {l:'Assists',v:selected.assists,c:C.blue},
                      {l:'Fantasy',v:selected.fantasyPoints+'pts',c:C.orange},
                      {l:'Value',v:'$'+selected.marketValueM+'M',c:C.muted},
                      {l:'Minutes',v:selected.minutesPlayed,c:C.muted}
                    ].map(({l,v,c})=>(
                      <div key={l} style={{background:'#ffffff06',borderRadius:6,padding:'0.45rem',textAlign:'center'}}>
                        <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:1}}>{l}</div>
                        <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rating bar */}
                  <div style={{marginBottom:'1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.muted,marginBottom:'0.3rem'}}>
                      <span>Overall Rating</span>
                      <span style={{color:C.gold,fontWeight:700}}>{selected.rating.toFixed(1)} / 10</span>
                    </div>
                    <div style={{height:7,background:'#ffffff10',borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${selected.rating*10}%`,height:'100%',background:selected.rating>=9?C.gold:selected.rating>=8?C.green:C.blue,borderRadius:99}} />
                    </div>
                  </div>

                  {/* Messi special case */}
                  {selected.name === 'Lionel Messi' && (
                    <div style={{marginBottom:'1rem',padding:'0.65rem 0.75rem',background:'#1a0f00',border:'1px solid #f59e0b50',borderRadius:6}}>
                      <div style={{fontSize:10,color:C.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.3rem'}}>⚽ Live Tournament Note</div>
                      <div style={{fontSize:12,color:'#fde68a',lineHeight:1.5}}>
                        Messi has scored <strong>6 goals</strong> in the 2026 World Cup group stage (model projected 2). He is now the <strong>all-time leading scorer</strong> in men's World Cup history with <strong>19 career tournament goals</strong>.
                      </div>
                    </div>
                  )}

                  {/* Fantasy rec */}
                  <div style={{marginBottom:'1rem',padding:'0.6rem 0.75rem',background:`${C.orange}08`,border:`1px solid ${C.orange}20`,borderRadius:6}}>
                    <div style={{fontSize:10,color:C.orange,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.25rem'}}>Fantasy Signal</div>
                    <div style={{fontSize:13,color:C.text,fontWeight:600}}>
                      {selected.fantasyPoints >= 60 ? '⭐ Strong captain candidate' : selected.fantasyPoints >= 40 ? '✅ Solid starter pick' : '🔵 Rotation option'}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:'0.2rem'}}>
                      {selected.fantasyPoints} pts · {selected.injuryRisk==='low'?'Low risk':'Monitor fitness'}
                    </div>
                  </div>

                  {/* SHAP */}
                  {shap && (
                    <div style={{marginBottom:'1rem'}}>
                      <div style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.5rem'}}>🔍 SHAP Explanation</div>
                      <div style={{marginBottom:'0.5rem'}}>
                        <div style={{fontSize:10,color:C.green,fontWeight:700,marginBottom:'0.25rem'}}>STRENGTHS</div>
                        {shap.pos.map((s,i)=>(
                          <div key={i} style={{fontSize:11,color:C.muted,padding:'0.2rem 0',borderBottom:`1px solid ${C.border}20`,display:'flex',gap:'0.4rem',lineHeight:1.4}}>
                            <span style={{color:C.green,flexShrink:0,fontWeight:700}}>+</span>{s}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{fontSize:10,color:C.red,fontWeight:700,marginBottom:'0.25rem'}}>LIMITATIONS</div>
                        {shap.neg.map((s,i)=>(
                          <div key={i} style={{fontSize:11,color:C.muted,padding:'0.2rem 0',borderBottom:`1px solid ${C.border}20`,display:'flex',gap:'0.4rem',lineHeight:1.4}}>
                            <span style={{color:C.red,flexShrink:0,fontWeight:700}}>–</span>{s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stat grid */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
                    {[{l:'Goals',v:selected.goals},{l:'Key Passes',v:selected.keyPasses},{l:'Tackles Won',v:selected.tacklesWon},{l:'Clean Sheets',v:selected.cleanSheets},{l:'Yellow Cards',v:selected.yellowCards},{l:'Red Cards',v:selected.redCards}].map(({l,v})=>(
                      <div key={l} style={{background:'#ffffff05',borderRadius:5,padding:'0.35rem 0.6rem',display:'flex',justifyContent:'space-between'}}>
                        <span style={{fontSize:11,color:C.muted}}>{l}</span>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{v}</span>
                      </div>
                    ))}
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
