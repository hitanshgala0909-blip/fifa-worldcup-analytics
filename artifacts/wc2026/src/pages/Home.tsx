import { useState, useMemo } from "react";
import { TEAMS, MATCHES, SIMULATION, TOP_SCORERS, GROUPS, getTeamsByGroup, PLAYERS } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Calendar, TrendingUp, Zap, Globe2, Activity, Target, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GOLD = "#F0B429";

function computeStandings(group: string) {
  const groupMatches = MATCHES.filter(m => m.group === group && m.homeGoals !== null);
  const groupTeams = TEAMS.filter(t => t.group === group);
  const table: Record<string, { pts: number; w: number; d: number; l: number; gf: number; ga: number }> = {};
  for (const t of groupTeams) table[t.id] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  for (const m of groupMatches) {
    const hg = m.homeGoals!, ag = m.awayGoals!;
    if (!(m.home in table)) table[m.home] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    if (!(m.away in table)) table[m.away] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    table[m.home].gf += hg; table[m.home].ga += ag;
    table[m.away].gf += ag; table[m.away].ga += hg;
    if (hg > ag) { table[m.home].pts += 3; table[m.home].w++; table[m.away].l++; }
    else if (hg === ag) { table[m.home].pts += 1; table[m.home].d++; table[m.away].pts += 1; table[m.away].d++; }
    else { table[m.away].pts += 3; table[m.away].w++; table[m.home].l++; }
  }
  return groupTeams
    .map(t => ({ ...t, ...table[t.id], gd: table[t.id].gf - table[t.id].ga, played: table[t.id].w + table[t.id].d + table[t.id].l }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function StatPill({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.15 }}>
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">{label}</p>
              <p className="text-xl font-display font-bold text-foreground leading-tight">{value}</p>
              {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const [activeGroup, setActiveGroup] = useState("A");

  const playedMatches = MATCHES.filter(m => m.homeGoals !== null);
  const totalGoals = playedMatches.reduce((s, m) => s + (m.homeGoals ?? 0) + (m.awayGoals ?? 0), 0);
  const avgGoals = playedMatches.length > 0 ? (totalGoals / playedMatches.length).toFixed(2) : "0";
  const upcomingMatches = MATCHES.filter(m => m.homeGoals === null);

  const standings = useMemo(() => computeStandings(activeGroup), [activeGroup]);
  const top8Sim = SIMULATION.slice(0, 8);
  const maxWinPct = Math.max(...top8Sim.map(s => s.winPct));

  // Goals by team for bar chart (top 10 teams by total goals from players)
  const goalsByTeam = useMemo(() => {
    const map: Record<string, { goals: number; flag: string }> = {};
    for (const p of PLAYERS) {
      if (p.goals > 0) {
        const team = TEAMS.find(t => t.name === p.country);
        if (!team) continue;
        if (!map[team.name]) map[team.name] = { goals: 0, flag: team.flagEmoji };
        map[team.name].goals += p.goals;
      }
    }
    return Object.entries(map)
      .map(([name, { goals, flag }]) => ({ name: `${flag} ${name.split(' ')[0]}`, goals }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your live command centre for FIFA World Cup 2026 — standings, contenders, scorers, and fixtures updated in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/50 text-primary px-3 py-1 text-xs tracking-widest">
            <Activity className="w-3 h-3 mr-1.5 animate-pulse" />
            GROUP STAGE LIVE
          </Badge>
        </div>
      </div>

      {/* Key Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}><StatPill icon={Globe2} label="Teams" value="48" sub="Across 12 groups" /></motion.div>
        <motion.div variants={itemVariants}><StatPill icon={Target} label="Goals Scored" value={String(totalGoals)} sub={`${avgGoals} per game`} /></motion.div>
        <motion.div variants={itemVariants}><StatPill icon={Calendar} label="Matches Played" value={String(playedMatches.length)} sub={`${upcomingMatches.length} remaining`} /></motion.div>
        <motion.div variants={itemVariants}><StatPill icon={Zap} label="Top Scorer" value="Mbappé" sub="8 goals — France" /></motion.div>
      </motion.div>

      {/* Group Standings + Golden Boot Race */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Standings */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Group Standings
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {GROUPS.map(g => (
                    <button
                      key={g}
                      onClick={() => setActiveGroup(g)}
                      className={`w-7 h-7 rounded text-xs font-bold font-display transition-colors ${activeGroup === g ? 'bg-primary text-background' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium tracking-wider">TEAM</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">P</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">W</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">D</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">L</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">GD</th>
                    <th className="text-center px-2 py-2 text-muted-foreground font-medium">GF</th>
                    <th className="text-center px-3 py-2 text-primary font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, i) => (
                    <motion.tr
                      key={team.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${i < 2 ? 'bg-primary/3' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-5 rounded-full ${i < 2 ? 'bg-primary' : 'bg-transparent'}`} />
                          <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                          <span className="text-base">{team.flagEmoji}</span>
                          <span className="font-medium text-foreground">{team.name}</span>
                        </div>
                      </td>
                      <td className="text-center px-2 py-2.5 text-muted-foreground">{team.played}</td>
                      <td className="text-center px-2 py-2.5 text-muted-foreground">{team.w}</td>
                      <td className="text-center px-2 py-2.5 text-muted-foreground">{team.d}</td>
                      <td className="text-center px-2 py-2.5 text-muted-foreground">{team.l}</td>
                      <td className={`text-center px-2 py-2.5 font-medium ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>
                      <td className="text-center px-2 py-2.5 text-muted-foreground">{team.gf}</td>
                      <td className="text-center px-3 py-2.5 font-display font-bold text-primary text-sm">{team.pts}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-muted-foreground px-4 py-2">🟡 Top 2 advance to Round of 32</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Golden Boot Race */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                Golden Boot Race
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TOP_SCORERS.slice(0, 8).map((s, i) => (
                <div key={s.playerName} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                    <span className="text-sm">{s.flag}</span>
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{s.playerName}</span>
                    <span className="text-sm font-bold text-primary font-display">{s.goals}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.goals / TOP_SCORERS[0].goals) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? GOLD : i < 3 ? '#60a5fa' : 'hsl(220 25% 35%)' }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Championship Contenders + Goals by Nation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contenders */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Championship Contenders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {top8Sim.map((s, i) => (
              <div key={s.team} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.flag}</span>
                  <span className="text-xs font-medium text-foreground flex-1">{s.team}</span>
                  <span className="text-xs font-bold text-primary font-display">{s.winPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.winPct / maxWinPct) * 100}%` }}
                    transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? GOLD : i === 1 ? '#a78bfa' : i === 2 ? '#60a5fa' : 'hsl(220 25% 35%)' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Goals by Nation */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Goals by Nation (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={goalsByTeam} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#d1d5db', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 25% 14%)', border: '1px solid hsl(220 20% 22%)', borderRadius: 6 }}
                  formatter={(v: number) => [v, 'Goals']}
                  labelStyle={{ color: '#d1d5db' }}
                />
                <Bar dataKey="goals" radius={[0, 4, 4, 0]}>
                  {goalsByTeam.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? GOLD : i < 3 ? '#60a5fa' : 'hsl(220 25% 28%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playedMatches.slice(-6).reverse().map(m => {
              const home = TEAMS.find(t => t.id === m.home);
              const away = TEAMS.find(t => t.id === m.away);
              const homeWon = (m.homeGoals ?? 0) > (m.awayGoals ?? 0);
              const awayWon = (m.awayGoals ?? 0) > (m.homeGoals ?? 0);
              return (
                <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                  <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground px-1.5 py-0.5">GRP {m.group}</Badge>
                  <span className={`text-sm ${homeWon ? 'opacity-100' : 'opacity-50'}`}>{home?.flagEmoji}</span>
                  <span className={`text-xs font-medium flex-1 truncate ${homeWon ? 'text-foreground' : 'text-muted-foreground'}`}>{home?.name}</span>
                  <div className="px-2.5 py-1 bg-card rounded font-display font-bold text-sm text-primary tabular-nums">
                    {m.homeGoals}–{m.awayGoals}
                  </div>
                  <span className={`text-xs font-medium flex-1 text-right truncate ${awayWon ? 'text-foreground' : 'text-muted-foreground'}`}>{away?.name}</span>
                  <span className={`text-sm ${awayWon ? 'opacity-100' : 'opacity-50'}`}>{away?.flagEmoji}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingMatches.slice(0, 6).map(m => {
              const home = TEAMS.find(t => t.id === m.home);
              const away = TEAMS.find(t => t.id === m.away);
              const date = new Date(m.date);
              return (
                <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                  <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground px-1.5 py-0.5">GRP {m.group}</Badge>
                  <span className="text-sm">{home?.flagEmoji}</span>
                  <span className="text-xs font-medium text-foreground flex-1 truncate">{home?.name}</span>
                  <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-medium text-primary whitespace-nowrap">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <span className="text-xs font-medium text-foreground flex-1 text-right truncate">{away?.name}</span>
                  <span className="text-sm">{away?.flagEmoji}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
