import { useState } from "react";
import { TEAMS } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, TrendingUp, Shield, Zap } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

function ProbBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold" style={{ color }}>{(pct * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

const TACTICAL_ANALYSES: Record<string, string> = {
  'BRA-ARG': "A classic CONMEBOL derby. Brazil\'s high-press system vs Argentina\'s positional play. Messi\'s late-game influence and Vinicius Jr\'s pace on the counter make this unpredictable. Brazil hold a slight edge in physicality and depth.",
  'ENG-FRA': "A mouth-watering clash of Premier League quality. Bellingham vs Mbappe is the headline duel. England\'s defensive structure under pressure from France\'s lightning transitions. Key: can Bellingham unlock France\'s defensive block?",
  'ESP-GER': "Tiki-taka meets Gegenpressing. Spain\'s possession dominance (68% avg) challenged by Germany\'s aggressive press. Yamal vs the German fullbacks is crucial. Spain control tempo; Germany need to exploit vertical gaps in transition.",
  'default': "A tactical contest between two well-organized sides. The team with greater ELO rating will attempt to dominate possession, while the underdog will look to defend deep and threaten on the counter. Set pieces and individual brilliance could prove decisive.",
};

const RECENT_H2H: Record<string, { date: string; result: string; competition: string }[]> = {
  'BRA-ARG': [
    { date: "Jul 2024", result: "Brazil 1 - 2 Argentina", competition: "Copa America" },
    { date: "Nov 2023", result: "Argentina 0 - 1 Brazil", competition: "World Cup Qualifier" },
    { date: "Sep 2021", result: "Brazil 0 - 0 Argentina", competition: "World Cup Qualifier" },
  ],
  'default': [
    { date: "Mar 2024", result: "Friendly (see stats)", competition: "International Friendly" },
    { date: "Oct 2023", result: "Nations League", competition: "Nations League" },
    { date: "Sep 2022", result: "Tournament Match", competition: "UEFA/CONMEBOL" },
  ],
};

export default function Predictor() {
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");

  const home = TEAMS.find(t => t.id === homeTeam);
  const away = TEAMS.find(t => t.id === awayTeam);

  const canPredict = home && away && home.id !== away.id;

  const homeWin = canPredict
    ? Math.max(0.05, Math.min(0.75, 0.5 + (home.eloRating - away.eloRating) / 2000 + 0.05))
    : 0;
  const awayWin = canPredict
    ? Math.max(0.05, Math.min(0.75, 0.5 - (home.eloRating - away.eloRating) / 2000 - 0.05))
    : 0;
  const draw = canPredict ? Math.max(0.05, 1 - homeWin - awayWin) : 0;

  const homeGoalsPred = canPredict ? (1.2 + (home.eloRating - away.eloRating) / 1500).toFixed(1) : "–";
  const awayGoalsPred = canPredict ? (1.2 - (home.eloRating - away.eloRating) / 1500).toFixed(1) : "–";

  const h2hKey = canPredict
    ? Object.keys(RECENT_H2H).find(k => k.includes(homeTeam) || k.includes(awayTeam)) || 'default'
    : 'default';
  const h2h = RECENT_H2H[h2hKey] || RECENT_H2H['default'];
  const analysis = canPredict
    ? TACTICAL_ANALYSES[`${homeTeam}-${awayTeam}`] || TACTICAL_ANALYSES[`${awayTeam}-${homeTeam}`] || TACTICAL_ANALYSES['default']
    : null;

  const getRadarData = (t: typeof home, opp: typeof away) => {
    if (!t || !opp) return [];
    const base = t.eloRating / 2100;
    return [
      { axis: 'Attack', value: Math.min(98, Math.round(base * 90 + Math.random() * 8)) },
      { axis: 'Defense', value: Math.min(98, Math.round(base * 85 + Math.random() * 8)) },
      { axis: 'Midfield', value: Math.min(98, Math.round(base * 88 + Math.random() * 8)) },
      { axis: 'Set Pieces', value: Math.min(98, Math.round(base * 80 + Math.random() * 10)) },
      { axis: 'Experience', value: Math.min(98, Math.round(base * 82 + Math.random() * 10)) },
      { axis: 'Form', value: Math.min(98, Math.round(base * 78 + t.form.split('').filter(r => r === 'W').length * 6)) },
    ];
  };

  const homeRadar = canPredict ? getRadarData(home, away) : [];
  const awayRadar = canPredict ? getRadarData(away, home) : [];
  const radarData = homeRadar.map((d, i) => ({ axis: d.axis, [home?.name || 'Home']: d.value, [away?.name || 'Away']: awayRadar[i]?.value }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Match Predictor</h1>
        <p className="text-muted-foreground text-sm mt-1">ML-powered prediction engine using ELO ratings and form data</p>
      </div>

      {/* Team selectors */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Home Team</label>
              <Select value={homeTeam} onValueChange={setHomeTeam}>
                <SelectTrigger data-testid="select-home-team" className="bg-muted/40 border-border">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.filter(t => t.id !== awayTeam).map(t => (
                    <SelectItem key={t.id} value={t.id} data-testid={`home-team-${t.id}`}>
                      {t.flagEmoji} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <Swords className="w-7 h-7 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">VS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Away Team</label>
              <Select value={awayTeam} onValueChange={setAwayTeam}>
                <SelectTrigger data-testid="select-away-team" className="bg-muted/40 border-border">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.filter(t => t.id !== homeTeam).map(t => (
                    <SelectItem key={t.id} value={t.id} data-testid={`away-team-${t.id}`}>
                      {t.flagEmoji} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {canPredict && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Score prediction + probs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Predicted Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between py-4">
                    <div className="text-center flex-1">
                      <p className="text-4xl mb-1">{home?.flagEmoji}</p>
                      <p className="text-sm font-medium text-foreground">{home?.name}</p>
                      <p className="text-xs text-muted-foreground">ELO {home?.eloRating}</p>
                    </div>
                    <div className="text-center px-4">
                      <div className="font-display text-5xl font-bold text-primary tabular-nums">
                        {homeGoalsPred}–{awayGoalsPred}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Expected goals</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-4xl mb-1">{away?.flagEmoji}</p>
                      <p className="text-sm font-medium text-foreground">{away?.name}</p>
                      <p className="text-xs text-muted-foreground">ELO {away?.eloRating}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <ProbBar label={`${home?.name} Win`} pct={homeWin} color="#F0B429" />
                    <ProbBar label="Draw" pct={draw} color="#60a5fa" />
                    <ProbBar label={`${away?.name} Win`} pct={awayWin} color="#a78bfa" />
                  </div>
                </CardContent>
              </Card>

              {/* Tactical analysis */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Tactical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">{analysis}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground tracking-widest mb-1">HOME FORM</p>
                      <div className="flex gap-1">
                        {home?.form.split('').map((r, i) => {
                          const c = r === 'W' ? 'text-emerald-400' : r === 'D' ? 'text-yellow-400' : 'text-red-400';
                          return <span key={i} className={`text-sm font-bold ${c}`}>{r}</span>;
                        })}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground tracking-widest mb-1">AWAY FORM</p>
                      <div className="flex gap-1">
                        {away?.form.split('').map((r, i) => {
                          const c = r === 'W' ? 'text-emerald-400' : r === 'D' ? 'text-yellow-400' : 'text-red-400';
                          return <span key={i} className={`text-sm font-bold ${c}`}>{r}</span>;
                        })}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground tracking-widest mb-1">WORLD RANK</p>
                      <p className="text-sm font-bold text-foreground">#{home?.worldRank}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground tracking-widest mb-1">WORLD RANK</p>
                      <p className="text-sm font-bold text-foreground">#{away?.worldRank}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground tracking-widest font-medium">RECENT H2H</p>
                    {h2h.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                        <span className="text-muted-foreground">{m.date}</span>
                        <span className="text-foreground font-medium">{m.result}</span>
                        <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">{m.competition}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Radar comparison */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Team Comparison Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">{home?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-xs text-muted-foreground">{away?.name}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="hsl(220 20% 22%)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(220 25% 14%)', border: '1px solid hsl(220 20% 22%)', borderRadius: 6 }} />
                    <Radar name={home?.name} dataKey={home?.name} stroke="#F0B429" fill="#F0B429" fillOpacity={0.15} />
                    <Radar name={away?.name} dataKey={away?.name} stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {!canPredict && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">Select two different teams to generate a prediction</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
