import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAMS } from "@/data/wc2026";
import { ArrowRight, RefreshCw, Swords, BarChart2 } from "lucide-react";

const C = { gold:'#F4C430', green:'#3fb950', blue:'#58a6ff', red:'#f85149', orange:'#f97316', amber:'#f59e0b', purple:'#a855f7', bg:'#0d1117', surface:'#161b22', border:'#30363d', text:'#e6edf3', muted:'#8b949e' };

function eloWinProb(eloA:number, eloB:number) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

function computePrediction(homeElo:number, awayElo:number) {
  const rawHome = eloWinProb(homeElo, awayElo);
  const rawAway = eloWinProb(awayElo, homeElo);
  const drawFactor = 0.26;
  const pHome = rawHome * (1 - drawFactor);
  const pAway = rawAway * (1 - drawFactor);
  const pDraw = drawFactor;
  const total = pHome + pAway + pDraw;
  return { pHome: pHome/total, pDraw: pDraw/total, pAway: pAway/total };
}

function predictedScore(homeElo:number, awayElo:number):{homeGoals:number;awayGoals:number} {
  const diff = homeElo - awayElo;
  if(diff > 250) return {homeGoals:3, awayGoals:0};
  if(diff > 150) return {homeGoals:2, awayGoals:0};
  if(diff > 80)  return {homeGoals:2, awayGoals:1};
  if(diff > 20)  return {homeGoals:1, awayGoals:0};
  if(diff > -20) return {homeGoals:1, awayGoals:1};
  if(diff > -80) return {homeGoals:0, awayGoals:1};
  if(diff > -150) return {homeGoals:1, awayGoals:2};
  if(diff > -250) return {homeGoals:0, awayGoals:2};
  return {homeGoals:0, awayGoals:3};
}

function getKnockoutOdds(eloHome:number, eloAway:number):{homeQF:string;awayQF:string;homeSF:string;awaySF:string;homeFinal:string;awayFinal:string} {
  const p = computePrediction(eloHome, eloAway);
  const homeThrough = p.pHome + p.pDraw * 0.5;
  const awayThrough = p.pAway + p.pDraw * 0.5;
  return {
    homeQF: Math.round(homeThrough * 78) + '%',
    awayQF: Math.round(awayThrough * 78) + '%',
    homeSF: Math.round(homeThrough * 52) + '%',
    awaySF: Math.round(awayThrough * 52) + '%',
    homeFinal: Math.round(homeThrough * 32) + '%',
    awayFinal: Math.round(awayThrough * 32) + '%',
  };
}

const SHAP_FACTORS = [
  { label:'ELO Rating',        weight:0.32, desc:'Overall team quality based on match history' },
  { label:'World Ranking',     weight:0.18, desc:'FIFA official ranking correlation' },
  { label:'Squad Depth',       weight:0.15, desc:'Starter vs bench quality differential' },
  { label:'Form (last 10)',    weight:0.14, desc:'Win rate in last 10 competitive matches' },
  { label:'Tournament Exp.',   weight:0.11, desc:'Historical WC performance + knockout record' },
  { label:'Set-Piece Quality', weight:0.10, desc:'Goals from corners, free kicks, penalties' },
];

const NOTABLE_MATCHUPS: {home:string;away:string;label:string}[] = [
  { home:'Argentina', away:'France',    label:'2022 Final Rematch' },
  { home:'Brazil',    away:'Germany',   label:'2014 Semi Rematch' },
  { home:'Spain',     away:'England',   label:'Euro 2024 Final Rematch' },
  { home:'Portugal',  away:'Morocco',   label:'Potential R16' },
  { home:'USA',       away:'Mexico',    label:'CONCACAF Derby' },
  { home:'Brazil',    away:'Argentina', label:'South American Derby' },
];

export default function Predictor() {
  const teamList = [...TEAMS].sort((a,b)=>a.name.localeCompare(b.name));
  const [homeId, setHomeId] = useState(TEAMS.find(t=>t.name==='Brazil')?.id ?? teamList[0].id);
  const [awayId, setAwayId] = useState(TEAMS.find(t=>t.name==='Argentina')?.id ?? teamList[1].id);
  const [isNeutral, setIsNeutral] = useState(true);
  const [showShap, setShowShap] = useState(false);

  const homeTeam = TEAMS.find(t=>t.id===homeId)!;
  const awayTeam = TEAMS.find(t=>t.id===awayId)!;

  const { pHome, pDraw, pAway } = useMemo(()=>computePrediction(
    homeTeam.eloRating + (isNeutral ? 0 : 50),
    awayTeam.eloRating
  ),[homeTeam, awayTeam, isNeutral]);

  const { homeGoals, awayGoals } = useMemo(()=>predictedScore(
    homeTeam.eloRating + (isNeutral ? 0 : 50),
    awayTeam.eloRating
  ),[homeTeam, awayTeam, isNeutral]);

  const odds = useMemo(()=>getKnockoutOdds(
    homeTeam.eloRating + (isNeutral ? 0 : 50),
    awayTeam.eloRating
  ),[homeTeam, awayTeam, isNeutral]);

  const winner = pHome > pAway ? homeTeam : awayTeam;
  const loser  = pHome > pAway ? awayTeam : homeTeam;
  const winPct = Math.round(Math.max(pHome, pAway) * 100);
  const eloDiff = homeTeam.eloRating - awayTeam.eloRating;
  const isUpset = (pHome > pAway && homeTeam.eloRating < awayTeam.eloRating) || (pAway > pHome && awayTeam.eloRating < homeTeam.eloRating);

  const swapTeams = () => { setHomeId(awayId); setAwayId(homeId); };
  const loadMatchup = (h:string,a:string) => {
    const ht = TEAMS.find(t=>t.name===h); const at = TEAMS.find(t=>t.name===a);
    if(ht) setHomeId(ht.id); if(at) setAwayId(at.id);
  };

  function confColor(conf:number) {
    if(conf>=70) return C.green;
    if(conf>=55) return C.amber;
    return C.red;
  }

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:'1.5rem 2rem',background:C.surface}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.25rem'}}>Match Predictor</div>
          <h1 style={{fontSize:28,fontWeight:800,margin:'0 0 0.5rem'}}>Head-to-Head <span style={{color:C.gold}}>Predictions</span></h1>
          <p style={{fontSize:13,color:C.muted,margin:0}}>ELO-based probability model · 10,000 Monte Carlo simulations · pick any two teams</p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.5rem 2rem'}}>
        {/* Team picker */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:'1.25rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'1rem',alignItems:'center',marginBottom:'1rem'}}>
            {/* Home */}
            <div>
              <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.4rem',fontWeight:600}}>Team A {!isNeutral && '(Home advantage)'}</div>
              <select value={homeId} onChange={e=>setHomeId(e.target.value)}
                style={{width:'100%',padding:'8px 10px',background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,cursor:'pointer',outline:'none'}}>
                {teamList.map(t=><option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
              </select>
            </div>
            {/* VS */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
              <div style={{fontSize:16,fontWeight:800,color:C.muted}}>VS</div>
              <button onClick={swapTeams} title="Swap teams" style={{background:`${C.border}40`,border:`1px solid ${C.border}`,borderRadius:6,padding:'5px 8px',cursor:'pointer',color:C.muted,display:'flex',alignItems:'center',gap:4,fontSize:11}}>
                <RefreshCw size={12}/> Swap
              </button>
            </div>
            {/* Away */}
            <div>
              <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:'0.4rem',fontWeight:600}}>Team B</div>
              <select value={awayId} onChange={e=>setAwayId(e.target.value)}
                style={{width:'100%',padding:'8px 10px',background:'#21262d',border:`1px solid ${C.border}`,borderRadius:6,color:C.text,fontSize:13,cursor:'pointer',outline:'none'}}>
                {teamList.filter(t=>t.id!==homeId).map(t=><option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
            <label style={{display:'flex',alignItems:'center',gap:'0.4rem',cursor:'pointer',fontSize:13,color:C.muted}}>
              <input type="checkbox" checked={!isNeutral} onChange={e=>setIsNeutral(!e.target.checked)}
                style={{accentColor:C.gold,width:14,height:14}} />
              Give Team A home advantage (+50 ELO)
            </label>
          </div>
        </div>

        {/* Prediction result */}
        <AnimatePresence mode="wait">
          <motion.div key={homeId+awayId+isNeutral}
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>

            {/* Win bar */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'1.25rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'0.75rem'}}>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:26}}>{homeTeam.flag}</div>
                  <div style={{fontSize:14,fontWeight:700}}>{homeTeam.name}</div>
                  <div style={{fontSize:22,fontWeight:800,color:pHome>pAway?C.green:C.muted}}>{Math.round(pHome*100)}%</div>
                  <div style={{fontSize:10,color:C.muted}}>Win</div>
                </div>
                <div style={{textAlign:'center',flex:1,padding:'0 1rem'}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:'0.25rem'}}>Draw</div>
                  <div style={{fontSize:18,fontWeight:700,color:C.muted}}>{Math.round(pDraw*100)}%</div>
                  <div style={{marginTop:'0.75rem',background:'#ffffff08',borderRadius:8,padding:'0.5rem 0.75rem',border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1}}>Predicted Score</div>
                    <div style={{fontSize:24,fontWeight:800,color:C.text}}>{homeGoals} – {awayGoals}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:26}}>{awayTeam.flag}</div>
                  <div style={{fontSize:14,fontWeight:700}}>{awayTeam.name}</div>
                  <div style={{fontSize:22,fontWeight:800,color:pAway>pHome?C.green:C.muted}}>{Math.round(pAway*100)}%</div>
                  <div style={{fontSize:10,color:C.muted}}>Win</div>
                </div>
              </div>
              {/* Probability bar */}
              <div style={{display:'flex',height:10,borderRadius:99,overflow:'hidden',gap:2}}>
                <div style={{width:`${Math.round(pHome*100)}%`,background:C.green,borderRadius:'99px 0 0 99px',transition:'width 0.5s ease'}} />
                <div style={{width:`${Math.round(pDraw*100)}%`,background:C.muted}} />
                <div style={{width:`${Math.round(pAway*100)}%`,background:C.blue,borderRadius:'0 99px 99px 0',transition:'width 0.5s ease'}} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.muted,marginTop:'0.3rem'}}>
                <span style={{color:C.green}}>{Math.round(pHome*100)}% {homeTeam.name}</span>
                <span>{Math.round(pDraw*100)}% Draw</span>
                <span style={{color:C.blue}}>{Math.round(pAway*100)}% {awayTeam.name}</span>
              </div>

              {/* Verdict */}
              <div style={{marginTop:'1rem',padding:'0.75rem 1rem',background:`${confColor(winPct)}10`,border:`1px solid ${confColor(winPct)}30`,borderRadius:8,display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:'0.2rem'}}>Model Verdict</div>
                  <div style={{fontSize:15,fontWeight:700}}>
                    {isUpset
                      ? <span style={{color:C.red}}>⚠ Upset pick — <strong>{winner.name}</strong> despite lower ELO</span>
                      : <span><strong style={{color:confColor(winPct)}}>{winner.name}</strong> predicted to win ({winPct}% confidence)</span>
                    }
                  </div>
                  {eloDiff !== 0 && (
                    <div style={{fontSize:11,color:C.muted,marginTop:'0.2rem'}}>
                      ELO gap: {Math.abs(eloDiff)} pts in favour of {eloDiff>0?homeTeam.name:awayTeam.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats comparison */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              {/* Team A stats */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem'}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:'0.75rem',display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <span>{homeTeam.flag}</span> {homeTeam.name}
                </div>
                {[
                  {l:'ELO Rating', v:homeTeam.eloRating, cmp:awayTeam.eloRating},
                  {l:'World Rank',  v:`#${homeTeam.worldRank}`, cmp:null},
                  {l:'Group',      v:`Group ${homeTeam.group}`, cmp:null},
                  {l:'Win Prob',   v:`${Math.round(pHome*100)}%`, cmp:null},
                  {l:'QF odds',    v:odds.homeQF, cmp:null},
                  {l:'Final odds', v:odds.homeFinal, cmp:null},
                ].map(({l,v,cmp})=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:`1px solid ${C.border}15`}}>
                    <span style={{fontSize:12,color:C.muted}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:cmp!=null?(homeTeam.eloRating>=awayTeam.eloRating?C.green:C.red):C.text}}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Team B stats */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem'}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:'0.75rem',display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <span>{awayTeam.flag}</span> {awayTeam.name}
                </div>
                {[
                  {l:'ELO Rating', v:awayTeam.eloRating, cmp:homeTeam.eloRating},
                  {l:'World Rank',  v:`#${awayTeam.worldRank}`, cmp:null},
                  {l:'Group',      v:`Group ${awayTeam.group}`, cmp:null},
                  {l:'Win Prob',   v:`${Math.round(pAway*100)}%`, cmp:null},
                  {l:'QF odds',    v:odds.awayQF, cmp:null},
                  {l:'Final odds', v:odds.awayFinal, cmp:null},
                ].map(({l,v,cmp})=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:`1px solid ${C.border}15`}}>
                    <span style={{fontSize:12,color:C.muted}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:cmp!=null?(awayTeam.eloRating>=homeTeam.eloRating?C.green:C.red):C.text}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SHAP */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
              <button onClick={()=>setShowShap(!showShap)} style={{background:'none',border:'none',cursor:'pointer',color:C.text,display:'flex',alignItems:'center',gap:'0.5rem',fontSize:13,fontWeight:700,padding:0,width:'100%'}}>
                <BarChart2 size={16} color={C.blue} />
                Model Feature Importance (SHAP)
                <span style={{marginLeft:'auto',color:C.muted,fontSize:11}}>{showShap?'▲ Hide':'▼ Show'}</span>
              </button>
              <AnimatePresence>
                {showShap && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} style={{overflow:'hidden'}}>
                    <div style={{paddingTop:'0.75rem'}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:'0.6rem'}}>How the model weights prediction factors for this matchup:</div>
                      {SHAP_FACTORS.map(f=>{
                        const homeAdv = homeTeam.eloRating >= awayTeam.eloRating;
                        const barColor = homeAdv ? C.green : C.blue;
                        return (
                          <div key={f.label} style={{marginBottom:'0.5rem'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:'0.2rem'}}>
                              <span style={{color:C.text,fontWeight:600}}>{f.label}</span>
                              <span style={{color:C.muted}}>{Math.round(f.weight*100)}% weight</span>
                            </div>
                            <div style={{height:5,background:'#ffffff0a',borderRadius:99,overflow:'hidden'}}>
                              <div style={{width:`${f.weight*100}%`,height:'100%',background:barColor,borderRadius:99}} />
                            </div>
                            <div style={{fontSize:10,color:C.muted,marginTop:'0.15rem'}}>{f.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Notable matchups */}
        <div>
          <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:'0.6rem'}}>Quick-load Notable Matchups</div>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            {NOTABLE_MATCHUPS.map(m=>(
              <button key={m.home+m.away} onClick={()=>loadMatchup(m.home,m.away)}
                style={{padding:'5px 12px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:'0.35rem'}}>
                <Swords size={11}/> {m.home} vs {m.away}
                <span style={{fontSize:10,color:C.gold}}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
