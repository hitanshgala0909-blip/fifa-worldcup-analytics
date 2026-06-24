import { useState } from "react";
import { SIMULATION, CONFEDERATIONS, TEAMS } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Trophy, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GOLD = "#F0B429";

function PctBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-primary rounded-full"
      />
    </div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function Simulator() {
  const [conf, setConf] = useState<string>("all");

  const deduped = SIMULATION.filter((s, i, arr) => arr.findIndex(x => x.team === s.team) === i);
  const champion = deduped[0];

  const filtered = deduped.filter(s => {
    if (conf === "all") return true;
    const team = TEAMS.find(t => t.name === s.team);
    return team?.confederation === conf;
  });

  const top10 = deduped.slice(0, 10);
  const maxWin = top10[0]?.winPct || 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Tournament Simulator</h1>
          <p className="text-muted-foreground text-sm mt-1">Monte Carlo simulation — 100,000 tournament iterations</p>
        </div>
        <Select value={conf} onValueChange={setConf}>
          <SelectTrigger data-testid="select-confederation" className="w-40 bg-muted/40 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confederations</SelectItem>
            {CONFEDERATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Champion card */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-1">Most Likely Champion</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{champion?.flag}</span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground tracking-wider">{champion?.team}</h2>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-bold">{champion?.winPct.toFixed(1)}%</span> championship probability
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground tracking-widest">R16</p>
                  <p className="text-xl font-bold font-display text-primary">{champion?.r16Pct}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground tracking-widest">QF</p>
                  <p className="text-xl font-bold font-display text-primary">{champion?.qfPct}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground tracking-widest">SF</p>
                  <p className="text-xl font-bold font-display text-primary">{champion?.sfPct}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground tracking-widest">FINAL</p>
                  <p className="text-xl font-bold font-display text-primary">{champion?.finalPct}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base tracking-widest">Top 10 — Win Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top10} layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="team"
                  type="category"
                  tick={{ fill: '#d1d5db', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                  tickFormatter={(v, i) => `${top10[i]?.flag || ''} ${v}`}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 25% 14%)', border: '1px solid hsl(220 20% 22%)', borderRadius: 6 }}
                  formatter={(v: number) => [`${v.toFixed(1)}%`, 'Win Probability']}
                  labelStyle={{ color: '#d1d5db' }}
                />
                <Bar dataKey="winPct" radius={[0, 4, 4, 0]}>
                  {top10.map((entry, index) => (
                    <Cell key={entry.team} fill={index === 0 ? GOLD : index < 3 ? '#60a5fa' : 'hsl(220 25% 28%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progression grid */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Stage Progression Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground tracking-widest grid grid-cols-5 gap-2 mb-3 font-medium">
              <span>Team</span><span className="text-center">R16</span><span className="text-center">QF</span><span className="text-center">SF</span><span className="text-center">WIN</span>
            </div>
            <div className="space-y-2">
              {top10.map((s, i) => (
                <div key={s.team} className="grid grid-cols-5 gap-2 items-center text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <span className="text-sm shrink-0">{s.flag}</span>
                    <span className="text-foreground truncate">{s.team}</span>
                  </div>
                  <span className="text-center font-medium" style={{ color: s.r16Pct > 80 ? '#F0B429' : '#9ca3af' }}>{s.r16Pct}%</span>
                  <span className="text-center font-medium" style={{ color: s.qfPct > 50 ? '#F0B429' : '#9ca3af' }}>{s.qfPct}%</span>
                  <span className="text-center font-medium" style={{ color: s.sfPct > 30 ? '#F0B429' : '#9ca3af' }}>{s.sfPct}%</span>
                  <span className="text-center font-bold" style={{ color: i === 0 ? '#F0B429' : '#d1d5db' }}>{s.winPct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full team table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base tracking-widest">
            All Teams {conf !== 'all' && <Badge variant="outline" className="ml-2 border-primary/50 text-primary text-xs">{conf}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s, i) => (
              <motion.div
                key={s.team}
                variants={itemVariants}
                data-testid={`sim-team-${s.team}`}
                className="p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-lg">{s.flag}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{s.team}</span>
                  <span className="text-sm font-bold text-primary">{s.winPct.toFixed(1)}%</span>
                </div>
                <PctBar value={s.winPct} max={maxWin} />
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>R16: {s.r16Pct}%</span>
                  <span>QF: {s.qfPct}%</span>
                  <span>SF: {s.sfPct}%</span>
                  <span>F: {s.finalPct}%</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
