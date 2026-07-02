import { Link } from "wouter";
import { motion } from "framer-motion";
import { TEAMS, SIMULATION } from "@/data/wc2026";
import { Trophy, Users, Database, BarChart3, Zap, Target, Brain, Grid3X3, TrendingUp, AlertTriangle } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

const AWARDS = [
  { title:'Golden Boot', icon:'⚽', player:'Marcus Thuram', team:'France', flag:'🇫🇷', stat:'8.2 xG', sub:'Expected WC Goals', color:C.gold },
  { title:'Golden Ball', icon:'🏆', player:'Kylian Mbappé', team:'France', flag:'🇫🇷', stat:'97.4', sub:'Overall Index', color:C.gold },
  { title:'Golden Glove', icon:'🧤', player:'Mike Maignan', team:'France', flag:'🇫🇷', stat:'62%', sub:'Clean Sheet Prob', color:C.blue },
  { title:'Best Young Player', icon:'⭐', player:'Lamine Yamal', team:'Spain', flag:'🇪🇸', stat:'18 yrs', sub:'Breakout Score 94.1', color:C.green },
];

const DARK_HORSES = [
  { team:'Japan', flag:'🇯🇵', qfPct:26, r16Pct:66, reason:'Elite defensive organization + clinical counter-attack' },
  { team:'Ecuador', flag:'🇪🇨', qfPct:27, r16Pct:65, reason:'Hincapié & Caicedo dominant in midfield; underrated xG' },
  { team:'Morocco', flag:'🇲🇦', qfPct:26, r16Pct:72, reason:'QF pedigree from 2022; Hakimi world-class on right flank' },
  { team:'Senegal', flag:'🇸🇳', qfPct:18, r16Pct:58, reason:'Mané + Jackson = explosive front two; Mendy elite in goal' },
];

const QUICK_NAV = [
  { href:'/bracket',     icon:Trophy,    label:'Bracket',      sub:'R32 predictions & live odds', color:C.gold },
  { href:'/groups',      icon:Grid3X3,   label:'Groups',       sub:'All 12 groups & standings',   color:C.blue },
  { href:'/teams',       icon:Users,     label:'Teams',        sub:'Power rankings, all 48 teams', color:C.green },
  { href:'/players',     icon:Database,  label:'Players',      sub:'1,248 players, xG, projections', color:C.orange },
  { href:'/fantasy',     icon:Trophy,    label:'Fantasy',      sub:'Best XI, captains, differentials', color:'#a855f7' },
  { href:'/intelligence',icon:Brain,     label:'Intelligence', sub:'Breakout & underrated picks',  color:C.red },
];

const fade = { hidden:{opacity:0,y:16}, visible:(i:number)=>({opacity:1,y:0,transition:{delay:i*0.06}}) };

export default function Home() {
  const top5 = SIMULATION.slice(0,5);
  const champion = TEAMS.find(t => t.id === 'ARG')!;

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Hero Banner */}
      <div style={{background:`linear-gradient(135deg,#0d1117 0%,#1a1f2e 50%,#0d1117 100%)`,borderBottom:`1px solid ${C.border}`,padding:'2rem 2rem 1.5rem'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <span style={{background:C.red,color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:4,letterSpacing:1,animation:'pulse 2s infinite'}}>● LIVE</span>
            <span style={{color:C.muted,fontSize:13}}>GROUP STAGE UNDERWAY — June/July 2026</span>
            <span style={{marginLeft:'auto',color:C.muted,fontSize:12}}>Updated: {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
          </div>
          <h1 style={{fontSize:'clamp(24px,4vw,42px)',fontWeight:800,margin:'0 0 0.25rem',letterSpacing:'-0.5px'}}>
            WC 2026 <span style={{color:C.gold}}>Intelligence</span>
          </h1>
          <p style={{color:C.muted,fontSize:14,margin:0}}>ML-powered analytics · 10,000 Monte Carlo simulations · 1,248 players ranked</p>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'1.5rem 2rem'}}>

        {/* Quick Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
          {[
            {icon:Users,label:'Teams',value:'48',color:C.blue},
            {icon:Database,label:'Players',value:'1,248',color:C.green},
            {icon:BarChart3,label:'Simulations',value:'10K',color:C.gold},
            {icon:Target,label:'Matches Predicted',value:'72',color:C.orange},
          ].map(({icon:Icon,label,value,color},i)=>(
            <motion.div key={label} custom={i} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>{label}</div>
                <div style={{fontSize:22,fontWeight:800,color:C.text,lineHeight:1.2}}>{value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Win Probabilities — full width */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:'1.5rem'}}>
          <div style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'1rem'}}>🎯 Top Win Probabilities</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.5rem'}}>
            {top5.map((s,i)=>(
              <motion.div key={s.team} custom={i+4} variants={fade} initial="hidden" animate="visible"
                style={{background:'#ffffff05',border:`1px solid ${C.border}40`,borderRadius:10,padding:'0.9rem 1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.6rem'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:`${C.gold}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:C.gold,flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:22}}>{s.flag}</span>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{s.team}</span>
                </div>
                <div style={{fontSize:28,fontWeight:800,color:i===0?C.gold:C.text,lineHeight:1}}>{s.winPct}%</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:'0.5rem'}}>Win Probability</div>
                <div style={{height:4,background:'#ffffff12',borderRadius:99,overflow:'hidden',marginBottom:'0.5rem'}}>
                  <motion.div initial={{width:0}} animate={{width:`${(s.winPct/16)*100}%`}} transition={{delay:0.3+i*0.08,duration:0.6}}
                    style={{height:'100%',background:i===0?C.gold:i<3?C.green:C.blue,borderRadius:99}} />
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:10,color:C.muted}}>QF {s.qfPct}%</span>
                  <span style={{fontSize:10,color:C.muted}}>SF {s.sfPct}%</span>
                  <span style={{fontSize:10,color:C.muted}}>F {s.finalPct}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Award Predictions */}
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem'}}>🏅 Award Predictions</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
            {AWARDS.map((a,i)=>(
              <motion.div key={a.title} custom={i+8} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${a.color}30`,borderRadius:10,padding:'1rem',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:a.color,opacity:0.6}} />
                <div style={{fontSize:22,marginBottom:'0.4rem'}}>{a.icon}</div>
                <div style={{fontSize:10,color:a.color,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.25rem'}}>{a.title}</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:'0.1rem'}}>{a.player}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:'0.5rem'}}>{a.flag} {a.team}</div>
                <div style={{background:`${a.color}18`,borderRadius:6,padding:'0.3rem 0.5rem',display:'inline-block'}}>
                  <span style={{fontSize:13,fontWeight:700,color:a.color}}>{a.stat}</span>
                </div>
                <div style={{fontSize:10,color:C.muted,marginTop:'0.25rem'}}>{a.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dark Horses */}
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem'}}>
            <AlertTriangle size={14} color={C.orange} />
            <span style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1}}>Dark Horse Alert</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
            {DARK_HORSES.map((d,i)=>(
              <motion.div key={d.team} custom={i+12} variants={fade} initial="hidden" animate="visible" style={{background:C.surface,border:`1px solid ${C.orange}30`,borderRadius:10,padding:'1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
                  <span style={{fontSize:24}}>{d.flag}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:700}}>{d.team}</div>
                    <div style={{fontSize:11,color:C.muted}}>R16: {d.r16Pct}% · QF: {d.qfPct}%</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{d.reason}</div>
                <div style={{marginTop:'0.5rem',background:`${C.orange}18`,borderRadius:5,padding:'0.25rem 0.5rem',display:'inline-block'}}>
                  <span style={{fontSize:11,fontWeight:700,color:C.orange}}>QF {d.qfPct}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem'}}>🧭 Explore</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
            {QUICK_NAV.map(({href,icon:Icon,label,sub,color},i)=>(
              <motion.div key={href} custom={i+16} variants={fade} initial="hidden" animate="visible">
                <Link href={href} style={{display:'block',textDecoration:'none'}}>
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:'0.75rem',cursor:'pointer',transition:'border-color 0.15s',}} onMouseEnter={e=>(e.currentTarget.style.borderColor=color)} onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
                    <div style={{width:36,height:36,borderRadius:8,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text}}>{label}</div>
                      <div style={{fontSize:12,color:C.muted}}>{sub}</div>
                    </div>
                    <TrendingUp size={14} color={C.muted} style={{marginLeft:'auto'}} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
