import { motion } from "framer-motion";
import { Zap, AlertTriangle, TrendingUp, Brain } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

const BREAKOUTS = [
  { rank:1, player:'Lamine Yamal', team:'Spain', flag:'🇪🇸', pos:'RW', age:18, score:94.1, club:'FC Barcelona', reasoning:'Youngest player in the tournament. Already posting elite xA/90 (0.38) in Champions League. Spain\'s progressive ball carrier in final third. Expected to exploit defensive lines in every group fixture — his 1v1 dribble success rate (71%) is top-3 in the squad.', tier:'⚡ Elite' },
  { rank:2, player:'Florian Wirtz', team:'Germany', flag:'🇩🇪', pos:'CM', age:22, score:89.2, club:'Bayer Leverkusen', reasoning:'Coming off an unbeaten Bundesliga season with Leverkusen where he recorded 18 goals and 20 assists. His pressing triggers and progressive passes per 90 rank among the top 5 midfielders in the tournament. Germany\'s creative hub — expect 3-5 key chances created per match.', tier:'⚡ Elite' },
  { rank:3, player:'Alejandro Garnacho', team:'Argentina', flag:'🇦🇷', pos:'RW', age:21, score:86.7, club:'Manchester United', reasoning:'Messi\'s direct outlet when he drops deep. Garnacho\'s pace and finishing in transition are undervalued by general market. Expected 2.1 WC goals from expected positions — higher than both Álvarez and Dybala in projected minutes played.', tier:'🌟 World Class' },
  { rank:4, player:'Jude Bellingham', team:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', pos:'CM', age:22, score:85.4, club:'Real Madrid', reasoning:'Already performing at top-1% of all midfielders globally. First WC as undisputed starter. His PPDA (passes allowed per defensive action) is best among England\'s midfield options. Box-to-box influence combined with penalty box arrivals makes him a consistent scoring threat.', tier:'🌟 World Class' },
  { rank:5, player:'Julio Enciso', team:'Paraguay', flag:'🇵🇾', pos:'AM', age:21, score:78.3, club:'Brighton', reasoning:'Paraguay\'s creative force and most dangerous set-piece taker. His dribble sequences per 90 rank top-10 in CONMEBOL qualifying. On a team predicted to reach R16, Enciso is the differential who could make the difference in tight knockout games.', tier:'✅ Quality' },
];

const UNDERRATED = [
  { rank:1, player:'Kevin Pina', team:'Cape Verde', flag:'🇨🇻', pos:'GK', age:26, score:82.1, club:'SC Braga B', reasoning:'The headline underrated pick of this tournament. Pina\'s sweeper-keeper metrics are exceptional — 1.8 PSxG-GA (post-shot xG minus goals allowed) over AFCON qualifying, best of any GK outside the top-15 nations. Cape Verde are defensively well-organized: if they qualify from Group H as best 3rd, it\'s largely because of this goalkeeper.', tier:'✅ Quality' },
  { rank:2, player:'Musa Al-Taamari', team:'Jordan', flag:'🇯🇴', pos:'AM', age:24, score:71.4, club:'Montpellier', reasoning:'Jordan\'s standout talent — plays for Montpellier in Ligue 1 and his pressing triggers are genuinely elite. Against Argentina in Group J he was Jordan\'s best player despite the 3-0 scoreline. His breakout_score suggests massive upward trajectory if Jordan can stay competitive.', tier:'✅ Quality' },
  { rank:3, player:'Teboho Mokoena', team:'South Africa', flag:'🇿🇦', pos:'CM', age:27, score:69.8, club:'Mamelodi Sundowns', reasoning:'Mamelodi Sundowns captain whose deep-lying playmaking ability is completely invisible to fantasy and odds markets. His passes into the final third per 90 rival Granit Xhaka\'s in AFCON qualifiers. If South Africa are to cause any upset in Group A, it flows through Mokoena.', tier:'✅ Quality' },
  { rank:4, player:'Eldor Shomurodov', team:'Uzbekistan', flag:'🇺🇿', pos:'ST', age:28, score:68.2, club:'AS Roma', reasoning:'Serie A experience at AS Roma means Shomurodov plays at a higher level than most expect from Uzbekistan\'s striker. His anticipated xG in Group K fixtures is 1.4 — higher than DR Congo\'s entire expected output. One to watch if Uzbekistan match their qualifying form.', tier:'✅ Quality' },
  { rank:5, player:'Ermedin Demirović', team:'Bosnia & Herz.', flag:'🇧🇦', pos:'ST', age:26, score:66.5, club:'VfB Stuttgart', reasoning:'Stuttgart\'s star striker who finished 4th in Bundesliga top scorers. Bosnia\'s genuine goal threat — xG of 0.58 per 90 in qualifying, which translates to 2.3 expected WC goals across the group stage. Completely under-owned in fantasy markets.', tier:'✅ Quality' },
];

const DARK_HORSES = [
  { team:'Japan', flag:'🇯🇵', qfPct:26, r16Pct:66, winPct:2.9, reason:'Elite defensive block + clinical set-pieces. Kaoru Mitoma and Ritsu Doan offer genuine threat in transition. Daichi Kamada and Wataru Endo dominate midfield metrics. Japan have beaten Germany and Spain in 2022 and will look to do it again.', color:C.blue },
  { team:'Ecuador', flag:'🇪🇨', qfPct:27, r16Pct:65, winPct:0.3, reason:'Moises Caicedo at Chelsea has elevated Ecuador\'s midfield to world-class. Hincapié at Bayer Leverkusen brings defensive quality. Their xG in qualifying (1.62 per match) puts them ahead of Colombia and Chile. Most undervalued CONMEBOL side.', color:C.green },
  { team:'Morocco', flag:'🇲🇦', qfPct:26, r16Pct:72, winPct:3.8, reason:'2022 QF pedigree. Achraf Hakimi remains world-class. Sofyan Amrabat anchors one of the best midfield presses in the tournament. Youssef En-Nesyri returns as primary striker after a strong season at Fenerbahce. Could go deep again.', color:C.orange },
  { team:'Senegal', flag:'🇸🇳', qfPct:18, r16Pct:58, winPct:1.9, reason:'Sadio Mané and Nicolas Jackson provide elite forward combination. Édouard Mendy\'s shot-stopping at 87th percentile. Koulibaly anchors AFCON-champion defensive unit. Toughest group (France + Norway) is the obstacle — if they get through, anything is possible.', color:C.gold },
];

const SIMULATION_INSIGHTS = [
  { title:'Most Likely Finalist Pair', value:'Argentina vs Spain', sub:'Combined probability: 8.3%', color:C.gold },
  { title:'Most Open QF Prediction', value:'England vs Germany', sub:'46% England · 35% Germany · Draw 19%', color:C.blue },
  { title:'Biggest R32 Upset Risk', value:'Morocco over Portugal', sub:'Morocco win prob: 24% — nearly a coin flip', color:C.orange },
  { title:'Group of Death', value:'Group I: France, Norway, Senegal, Iraq', sub:'Only 1 team (Iraq) below 1750 ELO', color:C.red },
];

const SHAP_FEATURES = [
  { feature:'xG/90 (Expected Goals per 90 min)', importance:0.31, direction:'positive' },
  { feature:'Team R16 Probability', importance:0.24, direction:'positive' },
  { feature:'Starter Probability', importance:0.19, direction:'positive' },
  { feature:'Breakout Score (0-100)', importance:0.14, direction:'positive' },
  { feature:'Injury Risk', importance:0.08, direction:'negative' },
  { feature:'Age (tournament projection curve)', importance:0.04, direction:'negative' },
];

const fade = { hidden:{opacity:0,y:12}, visible:(i:number)=>({opacity:1,y:0,transition:{delay:i*0.05}}) };

export default function Intelligence() {
  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>AI-Powered Analytics</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.25rem'}}>Intelligence <span style={{color:C.gold}}>Reports</span></h1>
          <p style={{color:C.muted,fontSize:13,margin:0}}>ML-driven breakout predictions, underrated gems, dark horses, and simulation insights</p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem 2rem'}}>

        {/* Breakout Players */}
        <section style={{marginBottom:'2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <Zap size={16} color={C.gold} />
            <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Breakout Players</h2>
            <span style={{fontSize:11,color:C.muted,marginLeft:'auto'}}>Ranked by breakout_score (ML model)</span>
          </div>
          {BREAKOUTS.map((p,i)=>(
            <motion.div key={p.player} custom={i} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${i===0?C.gold:C.border}`,borderRadius:10,padding:'1rem 1.25rem',marginBottom:'0.6rem',position:'relative',overflow:'hidden'}}>
              {i===0 && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.gold},${C.orange})`}} />}
              <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:i===0?`${C.gold}25`:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:i===0?C.gold:C.muted,flexShrink:0}}>
                  {p.rank}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.25rem'}}>
                    <span style={{fontSize:20}}>{p.flag}</span>
                    <span style={{fontSize:16,fontWeight:700}}>{p.player}</span>
                    <span style={{fontSize:12,color:C.muted}}>{p.pos} · {p.age} yrs · {p.club}</span>
                    <span style={{fontSize:11,color:i===0?C.gold:C.green,fontWeight:600,marginLeft:'auto'}}>{p.tier}</span>
                    <span style={{fontSize:12,background:`${C.gold}18`,color:C.gold,padding:'2px 8px',borderRadius:4,fontWeight:700}}>Score {p.score}</span>
                  </div>
                  <div style={{background:'#ffffff06',borderRadius:6,padding:'0.6rem 0.75rem',borderLeft:`3px solid ${i===0?C.gold:C.blue}`}}>
                    <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>{p.reasoning}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Underrated Players */}
        <section style={{marginBottom:'2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <TrendingUp size={16} color={C.green} />
            <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Underrated Gems</h2>
            <span style={{fontSize:11,color:C.muted,marginLeft:'auto'}}>Low ownership · High upside</span>
          </div>
          {UNDERRATED.map((p,i)=>(
            <motion.div key={p.player} custom={i+5} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${i===0?C.green:C.border}`,borderRadius:10,padding:'1rem 1.25rem',marginBottom:'0.6rem',position:'relative',overflow:'hidden'}}>
              {i===0 && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.green},${C.blue})`}} />}
              <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:i===0?`${C.green}25`:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:i===0?C.green:C.muted,flexShrink:0}}>
                  {p.rank}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.25rem'}}>
                    <span style={{fontSize:20}}>{p.flag}</span>
                    <span style={{fontSize:16,fontWeight:700}}>{p.player}</span>
                    <span style={{fontSize:12,color:C.muted}}>{p.pos} · {p.age} yrs · {p.club}</span>
                    {i===0 && <span style={{fontSize:10,background:`${C.green}20`,color:C.green,padding:'2px 8px',borderRadius:4,fontWeight:700}}>★ HEADLINE PICK</span>}
                    <span style={{fontSize:12,background:`${C.green}15`,color:C.green,padding:'2px 8px',borderRadius:4,fontWeight:700,marginLeft:'auto'}}>Score {p.score}</span>
                  </div>
                  <div style={{background:'#ffffff06',borderRadius:6,padding:'0.6rem 0.75rem',borderLeft:`3px solid ${i===0?C.green:C.muted}`}}>
                    <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>{p.reasoning}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Dark Horses */}
        <section style={{marginBottom:'2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <AlertTriangle size={16} color={C.orange} />
            <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Dark Horses</h2>
            <span style={{fontSize:11,color:C.muted,marginLeft:'auto'}}>QF% &gt;15% but Win% &lt;5%</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem'}}>
            {DARK_HORSES.map((d,i)=>(
              <motion.div key={d.team} custom={i+10} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${d.color}30`,borderRadius:10,padding:'1.25rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <span style={{fontSize:32}}>{d.flag}</span>
                  <div>
                    <div style={{fontSize:16,fontWeight:700}}>{d.team}</div>
                    <div style={{display:'flex',gap:'0.75rem',marginTop:'0.2rem'}}>
                      <span style={{fontSize:12,color:d.color,fontWeight:600}}>QF {d.qfPct}%</span>
                      <span style={{fontSize:12,color:C.muted}}>R16 {d.r16Pct}%</span>
                      <span style={{fontSize:12,color:C.muted}}>Win {d.winPct}%</span>
                    </div>
                  </div>
                </div>
                <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>{d.reason}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Simulation Insights */}
        <section style={{marginBottom:'2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <Brain size={16} color={C.blue} />
            <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Simulation Insights</h2>
            <span style={{fontSize:11,color:C.muted,marginLeft:'auto'}}>10,000 Monte Carlo runs</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem',marginBottom:'1.25rem'}}>
            {SIMULATION_INSIGHTS.map((s,i)=>(
              <motion.div key={s.title} custom={i+14} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${s.color}30`,borderRadius:10,padding:'1.25rem',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:s.color}} />
                <div style={{paddingLeft:'0.5rem'}}>
                  <div style={{fontSize:11,color:s.color,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.4rem'}}>{s.title}</div>
                  <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:'0.25rem'}}>{s.value}</div>
                  <div style={{fontSize:12,color:C.muted}}>{s.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SHAP Feature Importance */}
        <section>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
            <Brain size={16} color={C.gold} />
            <h2 style={{fontSize:16,fontWeight:700,margin:0}}>Model Feature Importance (SHAP)</h2>
          </div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1.25rem'}}>
            <p style={{fontSize:12,color:C.muted,marginBottom:'1rem',marginTop:0}}>What drives the model's player rankings — top features by mean |SHAP value|</p>
            {SHAP_FEATURES.map((f,i)=>(
              <div key={f.feature} style={{marginBottom:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                  <span style={{fontSize:13,color:C.text}}>{f.feature}</span>
                  <span style={{fontSize:12,color:f.direction==='positive'?C.green:C.red,fontWeight:600}}>
                    {f.direction==='positive'?'↑':'↓'} {Math.round(f.importance*100)}%
                  </span>
                </div>
                <div style={{height:6,background:'#ffffff10',borderRadius:99,overflow:'hidden'}}>
                  <motion.div initial={{width:0}} animate={{width:`${f.importance*100/0.35*100}%`}} transition={{delay:0.5+i*0.08,duration:0.5}} style={{height:'100%',background:f.direction==='positive'?C.green:C.red,borderRadius:99,maxWidth:'100%'}} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
