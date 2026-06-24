import { TEAMS, MATCHES, SIMULATION, TOP_SCORERS, GROUPS, getTeamsByGroup } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Calendar, TrendingUp, Zap, Globe2, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GOLD = "#F0B429";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
      <Card data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`} className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-1">{label}</p>
              <p className="text-3xl font-display font-bold text-foreground">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FormBadge({ result }: { result: string }) {
  const color = result === 'W' ? 'bg-emerald-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`inline-block w-6 h-6 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center`}>{result}</span>;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const playedMatches = MATCHES.filter(m => m.homeGoals !== null);
  const upcomingMatches = MATCHES.filter(m => m.homeGoals === null);
  const top10Sim = SIMULATION.filter((s, i, arr) => arr.findIndex(x => x.team === s.team) === i).slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">FIFA World Cup 2026 — Live Intelligence Platform</p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary px-3 py-1 text-xs tracking-widest">
          <Activity className="w-3 h-3 mr-1.5" />
          GROUP STAGE
        </Badge>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}><StatCard icon={Globe2} label="Teams" value="48" sub="12 groups" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={Calendar} label="Matches Played" value={String(playedMatches.length)} sub={`of ${MATCHES.length} shown`} /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={Trophy} label="Top Contender" value="Brazil" sub="15.2% win probability" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={Zap} label="Top Scorer" value="Mbappe" sub="8 goals" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top contenders chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Championship Probabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={top10Sim} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="team" type="category" tick={{ fill: '#d1d5db', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(220 25% 14%)', border: '1px solid hsl(220 20% 22%)', borderRadius: 6 }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Win %']}
                    labelStyle={{ color: '#d1d5db' }}
                  />
                  <Bar dataKey="winPct" radius={[0, 4, 4, 0]}>
                    {top10Sim.map((entry, index) => (
                      <Cell key={entry.team} fill={index === 0 ? GOLD : index < 3 ? '#60a5fa' : 'hsl(220 25% 25%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top scorers */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/50">
                {TOP_SCORERS.slice(0, 6).map((s, i) => (
                  <li key={s.playerName} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`w-5 text-xs font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                    <span className="text-lg">{s.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.playerName}</p>
                      <p className="text-[10px] text-muted-foreground">{s.country}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary">{s.goals}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">G</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent results */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base tracking-widest">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playedMatches.slice(0, 5).map(m => {
              const home = TEAMS.find(t => t.id === m.home);
              const away = TEAMS.find(t => t.id === m.away);
              return (
                <div key={m.id} data-testid={`match-result-${m.id}`} className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground px-1.5 py-0.5">GRP {m.group}</Badge>
                  <span className="text-sm">{home?.flagEmoji}</span>
                  <span className="text-xs font-medium text-foreground flex-1">{home?.name}</span>
                  <div className="px-2 py-0.5 bg-card rounded text-xs font-bold text-primary font-display tabular-nums">
                    {m.homeGoals} – {m.awayGoals}
                  </div>
                  <span className="text-xs font-medium text-foreground flex-1 text-right">{away?.name}</span>
                  <span className="text-sm">{away?.flagEmoji}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming matches */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base tracking-widest">Upcoming Fixtures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingMatches.slice(0, 5).map(m => {
              const home = TEAMS.find(t => t.id === m.home);
              const away = TEAMS.find(t => t.id === m.away);
              const date = new Date(m.date);
              return (
                <div key={m.id} data-testid={`match-upcoming-${m.id}`} className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground px-1.5 py-0.5">GRP {m.group}</Badge>
                  <span className="text-sm">{home?.flagEmoji}</span>
                  <span className="text-xs font-medium text-foreground flex-1">{home?.name}</span>
                  <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-medium text-primary">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <span className="text-xs font-medium text-foreground flex-1 text-right">{away?.name}</span>
                  <span className="text-sm">{away?.flagEmoji}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Group standings preview */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base tracking-widest">Group Leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {GROUPS.slice(0, 6).map(g => {
              const leader = getTeamsByGroup(g)[0];
              return (
                <div key={g} data-testid={`group-leader-${g}`} className="p-3 rounded-lg bg-muted/40 text-center hover:bg-muted/70 transition-colors">
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest mb-2">GROUP {g}</p>
                  <p className="text-2xl mb-1">{leader.flagEmoji}</p>
                  <p className="text-xs font-medium text-foreground truncate">{leader.name}</p>
                  <p className="text-[10px] text-primary font-bold">{leader.projectedPoints} pts</p>
                  <div className="flex justify-center gap-0.5 mt-1.5">
                    {leader.form.split('').map((r, i) => <FormBadge key={i} result={r} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
