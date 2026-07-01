import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PLAYERS, Player } from "@/data/wc2026";
import { Star, Shield, Zap, TrendingUp, Trophy, AlertTriangle } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', purple:'#a855f7', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

const BEST_XI: { name:string; team:string; flag:string; pos:string; slot:string; captain?:boolean; fantasyPts:number; value:number; reason:string }[] = [
  { name:'Mike Maignan',     team:'France',    flag:'🇫🇷', pos:'GK', slot:'GK',  fantasyPts:62, value:9,  reason:'Best shot-stopper in the tournament. 62% clean sheet probability with France.' },
  { name:'Achraf Hakimi',    team:'Morocco',   flag:'🇲🇦', pos:'RB', slot:'DEF', fantasyPts:58, value:10, reason:'Attacking wingback with 4 key passes per 90. Differential pick with Morocco going deep.' },
  { name:'William Saliba',   team:'France',    flag:'🇫🇷', pos:'CB', slot:'DEF', fantasyPts:54, value:9,  reason:'France\'s defensive anchor. Aerial dominance and distribution from deep.' },
  { name:'Virgil van Dijk',  team:'Netherlands',flag:'🇳🇱',pos:'CB', slot:'DEF', fantasyPts:55, value:10, reason:'Elite leadership. Netherlands solid R16 contenders — van Dijk key to clean sheets.' },
  { name:'Alphonso Davies',  team:'Canada',    flag:'🇨🇦', pos:'LB', slot:'DEF', fantasyPts:59, value:10, reason:'Most dynamic LB in the tournament. Consistent attacking output + home CONCACAF advantage.' },
  { name:'Martin Ødegaard',  team:'Norway',    flag:'🇳🇴', pos:'CM', slot:'MID', fantasyPts:66, value:11, reason:'Norway\'s creative spine. Ødegaard + Haaland = most lethal midfield-forward connection.' },
  { name:'Lamine Yamal',     team:'Spain',     flag:'🇪🇸', pos:'RW', slot:'MID', fantasyPts:72, value:12, reason:'Youngest player but highest breakout score. Spain play well and Yamal starts every game.' },
  { name:'Jude Bellingham',  team:'England',   flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',pos:'CM', slot:'MID', fantasyPts:70, value:13, reason:'Box-to-box and goal-scoring midfielder. England expected to go deep — Bellingham involved in everything.' },
  { name:'Kylian Mbappé',    team:'France',    flag:'🇫🇷', pos:'ST', slot:'FWD', fantasyPts:82, value:15, reason:'Golden Ball prediction. France\'s finals-level team guarantees Mbappé will play deep into the tournament.' },
  { name:'Erling Haaland',   team:'Norway',    flag:'🇳🇴', pos:'ST', slot:'FWD', fantasyPts:78, value:14, reason:'First World Cup — extremely motivated. 78 fantasy pts projection. Set-piece threat + aerial dominance.' },
  { name:'Vinicius Jr',      team:'Brazil',    flag:'🇧🇷', pos:'LW', slot:'FWD', fantasyPts:74, value:14, reason:'Brazil\'s most dangerous outlet. Pace and dribbling create constant high-xG chances in transition.' },
];

const CAPTAIN_PICKS = [
  { rank:1, name:'Bruno Fernandes', team:'Portugal', flag:'🇵🇹', pos:'AM', pts:88, value:13, reason:'Best captain pick. Portugal likely to score 3+ goals per match in Group K. Fernandes takes penalties and set-pieces — ceiling is unlimited in favourable fixtures against UZB and COD.' },
  { rank:2, name:'Kylian Mbappé',   team:'France',   flag:'🇫🇷', pos:'ST', pts:82, value:15, reason:'Top Golden Ball pick. France face Iraq (walkover) + Senegal + Norway in Group I. Mbappé should rack up 4-6 goal contributions across the group stage alone.' },
  { rank:3, name:'Erling Haaland',  team:'Norway',   flag:'🇳🇴', pos:'ST', pts:78, value:14, reason:'Differential vice-captain. Norway have a favourable Group I path vs Senegal and Iraq. Haaland\'s first WC — he\'ll be motivated. High ceiling in knockout fantasy formats.' },
  { rank:4, name:'Jude Bellingham', team:'England',  flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',pos:'CM', pts:70, value:13, reason:'Safe and consistent England midfield captain. Scores and assists across most games. Group L draws Croatia and South Korea — England expected to dominate both.' },
  { rank:5, name:'Florian Wirtz',   team:'Germany',  flag:'🇩🇪', pos:'AM', pts:68, value:12, reason:'Undervalued as a captain option — priced below Mbappé and Haaland but Germany score freely. Wirtz\'s key pass and shot-creating actions are second-to-none in the squad.' },
];

const BUDGET_PICKS = [
  { name:'Julio Enciso',        team:'Paraguay',      flag:'🇵🇾', pts:52, value:6, reason:'Low cost, high ceiling. Paraguay surprise package — Enciso creates chances and takes set-pieces.' },
  { name:'Kevin Pina',          team:'Cape Verde',    flag:'🇨🇻', pts:48, value:4, reason:'Cheapest GK with real upside. Cape Verde organised defensively — Pina key to any clean sheets.' },
  { name:'Teboho Mokoena',      team:'South Africa',  flag:'🇿🇦', pts:45, value:5, reason:'Budget midfielder with high minutes guarantee. South Africa\'s midfield engine — Mokoena touches the ball constantly.' },
  { name:'Ermedin Demirović',   team:'Bosnia & Herz.',flag:'🇧🇦', pts:50, value:6, reason:'Bundesliga quality at budget price. Bosnia\'s main goal threat — favourable Group B fixtures against Qatar.' },
];

const DIFFERENTIALS = [
  { name:'Musa Al-Taamari',    team:'Jordan',       flag:'🇯🇴', pos:'AM', ownership:'3%',  upside:'HIGH',  reason:'Jordan are a 3% owned team. Al-Taamari already proved his quality vs Argentina (3-0 loss, but he was excellent). If Jordan draw vs ALG, he erupts.' },
  { name:'Takefusa Kubo',      team:'Japan',        flag:'🇯🇵', pos:'AM', ownership:'8%',  upside:'HIGH',  reason:'Japan dark horse QF pick. Kubo\'s 1v1 creativity at Real Sociedad carries over — low ownership, high ceiling if Japan progress.' },
  { name:'Valentín Castellanos',team:'Argentina',   flag:'🇦🇷', pos:'ST', ownership:'6%',  upside:'MED',   reason:'Backing up Lautaro Martínez in a team projected to reach the final. One injury or rotation away from mega-points as a starter.' },
  { name:'Romeo Lavia',        team:'England',      flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',pos:'DM', ownership:'4%',  upside:'MED',   reason:'Underrated England DM. England likely to rotate, making Lavia a clean-sheet asset if he starts — cheap and effective.' },
];

const AWARD_PREDS = [
  { award:'Golden Boot',         player:'Marcus Thuram',  team:'France',  flag:'🇫🇷', stat:'8.2 xG',       color:C.gold },
  { award:'Golden Ball',         player:'Kylian Mbappé',  team:'France',  flag:'🇫🇷', stat:'97.4 index',    color:C.gold },
  { award:'Golden Glove',        player:'Mike Maignan',   team:'France',  flag:'🇫🇷', stat:'62% CS prob',   color:C.blue },
  { award:'Best Young Player',   player:'Lamine Yamal',   team:'Spain',   flag:'🇪🇸', stat:'Score 94.1',    color:C.green },
];

const POS_COLORS: Record<string,string> = { GK:C.gold, DEF:C.blue, MF:C.green, FWD:C.orange, MID:C.green };

const PITCH_ROWS = [
  { slot:'FWD', label:'Forwards',  count:3 },
  { slot:'MID', label:'Midfielders', count:3 },
  { slot:'DEF', label:'Defenders', count:4 },
  { slot:'GK',  label:'Goalkeeper', count:1 },
];

function PitchRow({ slot, players }: { slot:string; players:typeof BEST_XI }) {
  const col = POS_COLORS[slot] ?? C.muted;
  return (
    <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'0.75rem'}}>
      {players.map(p=>(
        <motion.div key={p.name} whileHover={{scale:1.05}} style={{textAlign:'center',width:90}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:`${col}20`,border:`2px solid ${p.captain?C.gold:col}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.3rem',position:'relative',flexShrink:0}}>
            <span style={{fontSize:22}}>{p.flag}</span>
            {p.captain && <div style={{position:'absolute',top:-6,right:-6,background:C.gold,borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'black'}}>C</div>}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:C.text,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:88}}>{p.name.split(' ').pop()}</div>
          <div style={{fontSize:10,color:col,fontWeight:600}}>{p.pos}</div>
          <div style={{fontSize:10,color:C.muted}}>{p.fantasyPts}pts</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Fantasy() {
  const [tab, setTab] = useState<'xi'|'captains'|'budget'|'awards'>('xi');
  const totalCost = BEST_XI.reduce((s,p)=>s+p.value,0);

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Fantasy Football</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.5rem'}}>WC 2026 <span style={{color:C.gold}}>Fantasy Guide</span></h1>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            {([['xi','Best XI'],['captains','Captain Picks'],['budget','Budget & Differentials'],['awards','Award Predictions']] as [string,string][]).map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k as any)} style={{padding:'5px 14px',borderRadius:6,border:`1px solid ${tab===k?C.gold:C.border}`,background:tab===k?`${C.gold}15`:'transparent',color:tab===k?C.gold:C.muted,fontSize:13,fontWeight:tab===k?700:400,cursor:'pointer'}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem 2rem'}}>

        {/* Best XI */}
        {tab==='xi' && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.5rem'}}>
              <div>
                <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 0.25rem'}}>Recommended Best XI <span style={{fontSize:13,color:C.muted,fontWeight:400}}>(4-3-3)</span></h2>
                <p style={{fontSize:13,color:C.muted,margin:0}}>Projected total: <span style={{color:C.gold,fontWeight:700}}>{BEST_XI.reduce((s,p)=>s+p.fantasyPts,0)}</span> pts · Budget: <span style={{color:C.green,fontWeight:700}}>${totalCost}M</span> / $100M</p>
              </div>
              <div style={{padding:'0.5rem 1rem',background:`${C.gold}15`,border:`1px solid ${C.gold}30`,borderRadius:8,fontSize:12,color:C.gold}}>
                Captain: <strong>Mike Maignan</strong> (× this XI) · See Captains tab for match-by-match picks
              </div>
            </div>

            {/* Pitch */}
            <div style={{background:`linear-gradient(180deg,#0d2a14,#0a1f10,#0d2a14)`,border:`1px solid ${C.green}30`,borderRadius:14,padding:'1.5rem 1rem',marginBottom:'1.5rem',position:'relative',overflow:'hidden'}}>
              {/* Pitch lines */}
              <div style={{position:'absolute',top:'50%',left:'5%',right:'5%',height:1,background:`${C.green}20`}} />
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translateX(-50%)',width:80,height:80,borderRadius:'50%',border:`1px solid ${C.green}20`}} />
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'space-around',padding:'0.5rem'}}>
                {/* FWD row */}
                <PitchRow slot="FWD" players={BEST_XI.filter(p=>p.slot==='FWD')} />
                {/* MID row */}
                <PitchRow slot="MID" players={BEST_XI.filter(p=>p.slot==='MID')} />
                {/* DEF row */}
                <PitchRow slot="DEF" players={BEST_XI.filter(p=>p.slot==='DEF')} />
                {/* GK row */}
                <PitchRow slot="GK" players={BEST_XI.filter(p=>p.slot==='GK')} />
              </div>
              {/* empty spacer to push layout */}
              <div style={{height:360}} />
            </div>

            {/* Player cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
              {BEST_XI.map((p,i)=>(
                <motion.div key={p.name} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'0.75rem 1rem',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:POS_COLORS[p.slot]??C.muted}} />
                  <div style={{paddingLeft:'0.5rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                      <span style={{fontSize:20}}>{p.flag}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>{p.team} · {p.pos}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontSize:15,fontWeight:800,color:C.gold}}>{p.fantasyPts}pts</div>
                        <div style={{fontSize:11,color:C.muted}}>${p.value}M</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{p.reason}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Captain Picks */}
        {tab==='captains' && (
          <div>
            <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 1rem'}}>Captain Picks <span style={{fontSize:13,color:C.muted,fontWeight:400}}>— ranked by expected pts return</span></h2>
            {CAPTAIN_PICKS.map((p,i)=>(
              <motion.div key={p.name} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}} style={{background:C.surface,border:`1px solid ${i===0?C.gold:C.border}`,borderRadius:10,padding:'1.25rem',marginBottom:'0.75rem',display:'flex',gap:'1rem',alignItems:'flex-start',position:'relative',overflow:'hidden'}}>
                {i===0 && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.gold},${C.orange})`}} />}
                <div style={{width:40,height:40,borderRadius:'50%',background:i===0?`${C.gold}25`:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:i===0?C.gold:C.muted,flexShrink:0}}>
                  {p.rank}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.35rem'}}>
                    <span style={{fontSize:22}}>{p.flag}</span>
                    <span style={{fontSize:16,fontWeight:700}}>{p.name}</span>
                    <span style={{fontSize:12,color:C.muted}}>{p.team} · {p.pos}</span>
                    {i===0 && <span style={{fontSize:10,background:`${C.gold}20`,color:C.gold,padding:'2px 8px',borderRadius:4,fontWeight:700}}>★ TOP PICK</span>}
                    <div style={{marginLeft:'auto',display:'flex',gap:'0.5rem'}}>
                      <span style={{fontSize:13,background:`${C.gold}18`,color:C.gold,padding:'3px 10px',borderRadius:4,fontWeight:700}}>{p.pts} pts</span>
                      <span style={{fontSize:13,background:`${C.green}15`,color:C.green,padding:'3px 10px',borderRadius:4,fontWeight:600}}>${p.value}M</span>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>{p.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Budget & Differentials */}
        {tab==='budget' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
                  <TrendingUp size={16} color={C.green} />
                  <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Budget Picks</h2>
                  <span style={{fontSize:11,color:C.muted}}>Under $7M · solid value</span>
                </div>
                {BUDGET_PICKS.map((p,i)=>(
                  <motion.div key={p.name} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem',marginBottom:'0.6rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.35rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:20}}>{p.flag}</span>
                      <span style={{fontSize:14,fontWeight:700}}>{p.name}</span>
                      <span style={{fontSize:12,color:C.muted,flex:1}}>{p.team}</span>
                      <span style={{fontSize:13,background:`${C.green}18`,color:C.green,padding:'2px 8px',borderRadius:4,fontWeight:700}}>{p.pts}pts</span>
                      <span style={{fontSize:12,color:C.muted}}>${p.value}M</span>
                    </div>
                    <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.5}}>{p.reason}</p>
                  </motion.div>
                ))}
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
                  <Zap size={16} color={C.orange} />
                  <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Differentials</h2>
                  <span style={{fontSize:11,color:C.muted}}>Under 10% ownership · high upside</span>
                </div>
                {DIFFERENTIALS.map((p,i)=>(
                  <motion.div key={p.name} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.06}} style={{background:C.surface,border:`1px solid ${C.orange}25`,borderRadius:10,padding:'1rem',marginBottom:'0.6rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.35rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:20}}>{p.flag}</span>
                      <span style={{fontSize:14,fontWeight:700}}>{p.name}</span>
                      <span style={{fontSize:12,color:C.muted}}>{p.team} · {p.pos}</span>
                      <span style={{marginLeft:'auto',fontSize:11,background:`${C.orange}18`,color:C.orange,padding:'2px 8px',borderRadius:4,fontWeight:700}}>Own: {p.ownership}</span>
                    </div>
                    <div style={{marginBottom:'0.35rem'}}>
                      <span style={{fontSize:10,background:p.upside==='HIGH'?`${C.red}20`:`${C.gold}18`,color:p.upside==='HIGH'?C.red:C.gold,padding:'2px 7px',borderRadius:4,fontWeight:700}}>
                        {p.upside} UPSIDE
                      </span>
                    </div>
                    <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.5}}>{p.reason}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Award Predictions */}
        {tab==='awards' && (
          <div>
            <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 1rem'}}>Award Predictions</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
              {AWARD_PREDS.map((a,i)=>(
                <motion.div key={a.award} initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{delay:i*0.07}} style={{background:C.surface,border:`1px solid ${a.color}30`,borderRadius:12,padding:'1.5rem',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:a.color,opacity:0.7}} />
                  <div style={{fontSize:11,color:a.color,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem'}}>{a.award}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                    <span style={{fontSize:40}}>{a.flag}</span>
                    <div>
                      <div style={{fontSize:20,fontWeight:800}}>{a.player}</div>
                      <div style={{fontSize:13,color:C.muted}}>{a.team}</div>
                    </div>
                  </div>
                  <div style={{background:`${a.color}18`,border:`1px solid ${a.color}30`,borderRadius:8,padding:'0.6rem 1rem',display:'inline-block'}}>
                    <span style={{fontSize:18,fontWeight:700,color:a.color}}>{a.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1.25rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem'}}>Model Confidence</div>
              {AWARD_PREDS.map(a=>(
                <div key={a.award} style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.6rem'}}>
                  <span style={{fontSize:13,color:C.text,width:140,flexShrink:0}}>{a.award}</span>
                  <div style={{flex:1,height:6,background:'#ffffff10',borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:a.award.includes('Boot')?'78%':a.award.includes('Ball')?'72%':a.award.includes('Glove')?'68%':'65%',height:'100%',background:a.color,borderRadius:99}} />
                  </div>
                  <span style={{fontSize:12,color:a.color,fontWeight:700,width:36}}>{a.award.includes('Boot')?'78%':a.award.includes('Ball')?'72%':a.award.includes('Glove')?'68%':'65%'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
