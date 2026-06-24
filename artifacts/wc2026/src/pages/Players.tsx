import { useState, useMemo } from "react";
import { PLAYERS, POSITIONS, TEAMS, Player } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star, Zap, Shield } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function InjuryBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    high: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${styles[risk] || ''}`}>{risk}</span>;
}

function PosBadge({ pos }: { pos: string }) {
  const colors: Record<string, string> = {
    GK: 'bg-amber-500/20 text-amber-400',
    CB: 'bg-blue-500/20 text-blue-400', RB: 'bg-blue-500/20 text-blue-400', LB: 'bg-blue-500/20 text-blue-400',
    CM: 'bg-purple-500/20 text-purple-400', AM: 'bg-purple-500/20 text-purple-400',
    LW: 'bg-emerald-500/20 text-emerald-400', RW: 'bg-emerald-500/20 text-emerald-400', ST: 'bg-emerald-500/20 text-emerald-400',
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${colors[pos] || 'bg-muted text-muted-foreground'}`}>{pos}</span>;
}

function PlayerDetail({ player, onClose }: { player: Player; onClose: () => void }) {
  const team = TEAMS.find(t => t.name === player.country);
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md h-full bg-card border-l border-border overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground tracking-wider">{player.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <PosBadge pos={player.position} />
                <span className="text-sm">{team?.flagEmoji}</span>
                <span className="text-xs text-muted-foreground">{player.country}</span>
                <InjuryBadge risk={player.injuryRisk} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{player.club} · Age {player.age}</p>
            </div>
            <button onClick={onClose} data-testid="close-player-detail" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground tracking-widest">Rating</p>
              <p className="text-2xl font-bold font-display text-primary">{player.rating}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground tracking-widest">Goals</p>
              <p className="text-2xl font-bold font-display text-foreground">{player.goals}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-center">
              <p className="text-[10px] text-muted-foreground tracking-widest">Assists</p>
              <p className="text-2xl font-bold font-display text-foreground">{player.assists}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Season Stats</p>
            {[
              { label: 'Minutes Played', value: player.minutesPlayed },
              { label: 'Key Passes', value: player.keyPasses },
              { label: 'Tackles Won', value: player.tacklesWon },
              { label: 'Clean Sheets', value: player.cleanSheets },
              { label: 'Yellow Cards', value: player.yellowCards },
              { label: 'Red Cards', value: player.redCards },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-sm font-medium text-foreground">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Fantasy Value</p>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Fantasy Points</p>
                  <p className="text-3xl font-bold font-display text-primary">{player.fantasyPoints}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Market Value</p>
                  <p className="text-xl font-bold font-display text-foreground">€{player.marketValueM}M</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Value score</span>
                  <span>{(player.fantasyPoints / player.marketValueM * 10).toFixed(1)} pts/€10M</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (player.fantasyPoints / 100) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Players() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [country, setCountry] = useState("all");
  const [selected, setSelected] = useState<Player | null>(null);

  const countries = useMemo(() => [...new Set(PLAYERS.map(p => p.country))].sort(), []);

  const filtered = PLAYERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase());
    const matchesPos = position === "all" || p.position === position;
    const matchesCountry = country === "all" || p.country === country;
    return matchesSearch && matchesPos && matchesCountry;
  });

  const scatterData = PLAYERS.map(p => ({ x: p.rating, y: p.fantasyPoints, name: p.name, country: p.country }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Player Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">{PLAYERS.length} players across {countries.length} nations</p>
      </div>

      {/* Scatter chart */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Rating vs Fantasy Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
              <XAxis dataKey="x" name="Rating" domain={[7.5, 10]} tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'Rating', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="y" name="Fantasy Pts" tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'Pts', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(220 25% 14%)', border: '1px solid hsl(220 20% 22%)', borderRadius: 6, fontSize: 12 }}
                formatter={(v: number, name: string) => [v, name === 'x' ? 'Rating' : 'Fantasy Pts']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                labelStyle={{ color: '#F0B429', fontWeight: 'bold' }}
              />
              <Scatter data={scatterData} fill="#F0B429" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="search-players"
            placeholder="Search players or clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-muted/40 border-border"
          />
        </div>
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger data-testid="filter-position" className="w-32 bg-muted/40 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger data-testid="filter-country" className="w-44 bg-muted/40 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} players</div>

      {/* Player grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
      >
        {filtered.map(p => {
          const team = TEAMS.find(t => t.name === p.country);
          return (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
            >
              <Card
                data-testid={`player-card-${p.id}`}
                className="border-border/60 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setSelected(p)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{team?.flagEmoji}</span>
                      <PosBadge pos={p.position} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <InjuryBadge risk={p.injuryRisk} />
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{p.club}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-primary font-bold text-base">{p.rating}</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{p.goals}G</span>
                        <span>{p.assists}A</span>
                        <span className="ml-auto text-primary font-medium">{p.fantasyPoints}pts</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(p.rating / 10) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground">€{p.marketValueM}M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selected && <PlayerDetail player={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
