import { useState } from "react";
import { TEAMS, PLAYERS, GROUPS, CONFEDERATIONS, getTeamsByGroup, getPlayersByCountry, Team } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X, Users, Zap, Shield } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

function FormBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    D: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    L: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold border ${styles[result] || ''}`}>
      {result}
    </span>
  );
}

function TeamDetail({ team, onClose }: { team: Team; onClose: () => void }) {
  const players = getPlayersByCountry(team.name);
  const groupTeams = getTeamsByGroup(team.group);

  const radarData = [
    { axis: 'Attack', value: Math.round((team.eloRating / 2100) * 90 + 5) },
    { axis: 'Defense', value: Math.round((team.eloRating / 2100) * 85 + 5) },
    { axis: 'Midfield', value: Math.round((team.eloRating / 2100) * 88 + 5) },
    { axis: 'Set Pieces', value: Math.round((team.eloRating / 2100) * 80 + 5) },
    { axis: 'Experience', value: Math.round((team.eloRating / 2100) * 82 + 5) },
    { axis: 'Form', value: Math.round(team.form.split('').filter(r => r === 'W').length / 5 * 90 + 10) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl h-full bg-card border-l border-border overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{team.flagEmoji}</span>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground tracking-wider">{team.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-primary/50 text-primary text-xs">Group {team.group}</Badge>
                  <Badge variant="outline" className="border-border/50 text-muted-foreground text-xs">{team.confederation}</Badge>
                  <span className="text-xs text-muted-foreground">#{team.worldRank} World</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} data-testid="close-team-detail" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground tracking-widest">ELO</p>
              <p className="text-xl font-bold font-display text-primary">{team.eloRating}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground tracking-widest">Group Pts</p>
              <p className="text-xl font-bold font-display text-foreground">{team.projectedPoints}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-xs text-muted-foreground tracking-widest">Win%</p>
              <p className="text-xl font-bold font-display text-primary">{team.simWinPct}%</p>
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-2">Recent Form</p>
            <div className="flex gap-2">
              {team.form.split('').map((r, i) => <FormBadge key={i} result={r} />)}
            </div>
          </div>

          {/* Radar */}
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-2">Team Profile</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220 20% 22%)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar dataKey="value" stroke="#F0B429" fill="#F0B429" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Group standings */}
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-2">Group {team.group} Standings</p>
            <div className="space-y-1">
              {groupTeams.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${t.id === team.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/40'}`}>
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span>{t.flagEmoji}</span>
                  <span className={`text-sm flex-1 ${t.id === team.id ? 'text-primary font-medium' : 'text-foreground'}`}>{t.name}</span>
                  <span className="text-xs font-bold text-foreground">{t.projectedPoints} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Players */}
          {players.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-2">Key Players ({players.length} in database)</p>
              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.position} · {p.club}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] border-0 ${p.injuryRisk === 'high' ? 'bg-red-500/20 text-red-400' : p.injuryRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {p.injuryRisk}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{p.rating}</p>
                      <p className="text-[10px] text-muted-foreground">rating</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Teams() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [confFilter, setConfFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const filtered = TEAMS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = group === "all" || t.group === group;
    const matchesConf = confFilter === "all" || t.confederation === confFilter;
    return matchesSearch && matchesGroup && matchesConf;
  });

  return (
    <div className="p-6 space-y-6 relative">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Team Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">48 teams, 12 groups — full squad intelligence</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="search-teams"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-muted/40 border-border"
          />
        </div>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger data-testid="filter-group" className="w-36 bg-muted/40 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {GROUPS.map(g => <SelectItem key={g} value={g}>Group {g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={confFilter} onValueChange={setConfFilter}>
          <SelectTrigger data-testid="filter-confederation" className="w-44 bg-muted/40 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confederations</SelectItem>
            {CONFEDERATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} teams</div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
      >
        {filtered.map(team => (
          <motion.div
            key={team.id}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <Card
              data-testid={`team-card-${team.id}`}
              className="border-border/60 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelectedTeam(team)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{team.flagEmoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{team.name}</p>
                      <p className="text-[10px] text-muted-foreground">Group {team.group} · #{team.worldRank}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {team.form.split('').map((r, i) => {
                      const c = r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-yellow-500' : 'bg-red-500';
                      return <span key={i} className={`w-3 h-3 rounded-sm ${c}`} />;
                    })}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{team.simWinPct}%</span>
                    <span className="text-[10px] text-muted-foreground ml-1">win</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(team.eloRating / 2100) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{team.eloRating} ELO</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedTeam && (
          <TeamDetail team={selectedTeam} onClose={() => setSelectedTeam(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
