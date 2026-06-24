import { useState, useMemo } from "react";
import { PLAYERS, Player } from "@/data/wc2026";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Star, AlertTriangle, TrendingUp, DollarSign, X, Check } from "lucide-react";

const BUDGET = 100;
const fantasyPrice = (p: Player) => Math.max(4, Math.round((p.marketValueM / 20) + (p.fantasyPoints / 30)));


type PositionSlot = { pos: string; label: string; count: number };
const FORMATION: PositionSlot[] = [
  { pos: 'GK', label: 'GK', count: 1 },
  { pos: 'DEF', label: 'DEF', count: 4 },
  { pos: 'MID', label: 'MID', count: 4 },
  { pos: 'FWD', label: 'FWD', count: 2 },
];

const POS_MAP: Record<string, string> = {
  GK: 'GK', CB: 'DEF', RB: 'DEF', LB: 'DEF',
  CM: 'MID', AM: 'MID', LW: 'MID',
  RW: 'FWD', ST: 'FWD',
};

function getBestXI(players: Player[]): Player[] {
  const slots: Record<string, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  const sorted = [...players].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  
  for (const p of sorted) {
    const slot = POS_MAP[p.position];
    if (!slot) continue;
    const limit = FORMATION.find(f => f.pos === slot)?.count || 0;
    if (slots[slot].length < limit) slots[slot].push(p);
  }
  return [...slots.GK, ...slots.DEF, ...slots.MID, ...slots.FWD];
}

function PitchPlayer({ player, slot, isInTeam, onToggle }: { player: Player; slot: string; isInTeam: boolean; onToggle: () => void }) {
  const riskColor = player.injuryRisk === 'high' ? 'border-red-500/50 bg-red-500/5' : player.injuryRisk === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-primary/30 bg-primary/5';
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      data-testid={`pitch-player-${player.id}`}
      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all cursor-pointer text-center ${isInTeam ? 'border-primary/50 bg-primary/10' : riskColor}`}
      style={{ minWidth: 70 }}
    >
      <span className="text-xs font-bold text-foreground truncate w-full text-center">{player.name.split(' ').slice(-1)[0]}</span>
      <span className="text-[9px] text-muted-foreground">{player.position}</span>
      <span className="text-[10px] font-bold text-primary">{player.fantasyPoints}pts</span>
      {isInTeam && <Check className="w-3 h-3 text-primary" />}
    </motion.button>
  );
}

export default function Fantasy() {
  const eligiblePlayers = useMemo(() =>
    PLAYERS.filter(p => p.injuryRisk !== 'high' && p.minutesPlayed > 0)
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints),
    []
  );

  const recommendedXI = useMemo(() => getBestXI(eligiblePlayers), [eligiblePlayers]);
  const [myTeam, setMyTeam] = useState<Set<string>>(new Set(recommendedXI.map(p => p.id)));

  const myPlayers = PLAYERS.filter(p => myTeam.has(p.id));
  const totalValue = myPlayers.reduce((s, p) => s + fantasyPrice(p), 0);
  const totalPoints = myPlayers.reduce((s, p) => s + p.fantasyPoints, 0);
  const budgetLeft = BUDGET - totalValue;

  const togglePlayer = (pid: string) => {
    setMyTeam(prev => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else if (next.size < 11) next.add(pid);
      return next;
    });
  };

  const injuryAlerts = PLAYERS.filter(p => p.injuryRisk === 'high').slice(0, 3);
  const differentials = PLAYERS.filter(p => p.fantasyPoints > 50 && fantasyPrice(p) < 8).slice(0, 4);
  const topByPos: Record<string, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of eligiblePlayers) {
    const slot = POS_MAP[p.position];
    if (slot && topByPos[slot].length < 3) topByPos[slot].push(p);
  }

  // Build pitch rows
  const pitchRows: Record<string, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of myPlayers) {
    const slot = POS_MAP[p.position];
    if (slot) pitchRows[slot].push(p);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">Fantasy Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Build your XI within a €{BUDGET}M budget</p>
        </div>
        <div className="flex gap-3">
          <div className="p-3 rounded-lg bg-muted/40 text-center min-w-20">
            <p className="text-[10px] text-muted-foreground tracking-widest">Budget</p>
            <p className={`text-lg font-bold font-display ${budgetLeft < 0 ? 'text-red-400' : 'text-primary'}`}>€{budgetLeft.toFixed(0)}M</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 text-center min-w-20">
            <p className="text-[10px] text-muted-foreground tracking-widest">Total Pts</p>
            <p className="text-lg font-bold font-display text-primary">{totalPoints}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 text-center min-w-20">
            <p className="text-[10px] text-muted-foreground tracking-widest">Selected</p>
            <p className="text-lg font-bold font-display text-foreground">{myTeam.size}/11</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch formation */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base tracking-widest">My XI — 4-4-2</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl p-4 space-y-4"
                style={{
                  background: 'linear-gradient(180deg, hsl(145 60% 12%) 0%, hsl(145 55% 10%) 100%)',
                  border: '1px solid hsl(145 40% 20%)'
                }}
              >
                {(['GK', 'DEF', 'MID', 'FWD'] as const).map(row => (
                  <div key={row} className="space-y-1">
                    <p className="text-[9px] text-center text-white/40 tracking-widest font-bold">{row}</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {pitchRows[row]?.map(p => (
                        <PitchPlayer key={p.id} player={p} slot={row} isInTeam={myTeam.has(p.id)} onToggle={() => togglePlayer(p.id)} />
                      ))}
                      {Array.from({ length: Math.max(0, (FORMATION.find(f => f.pos === row)?.count || 0) - (pitchRows[row]?.length || 0)) }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-dashed border-white/10 text-white/20" style={{ minWidth: 70, minHeight: 56 }}>
                          <span className="text-[9px]">Empty</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Injury alerts */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm tracking-widest flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Injury Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {injuryAlerts.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground flex-1">{p.name}</span>
                  <Badge className="bg-red-500/20 text-red-400 border-0 text-[9px]">HIGH RISK</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Differentials */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Differential Picks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {differentials.map(p => (
                <div key={p.id} data-testid={`differential-${p.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">{p.position} · €{fantasyPrice(p)}M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{p.fantasyPoints}pts</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top picks by position */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base tracking-widest flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Top Picks by Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['GK', 'DEF', 'MID', 'FWD'] as const).map(slot => (
              <div key={slot}>
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-2">{slot === 'GK' ? 'Goalkeeper' : slot === 'DEF' ? 'Defender' : slot === 'MID' ? 'Midfielder' : 'Forward'}</p>
                <div className="space-y-2">
                  {topByPos[slot]?.map((p, i) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ x: 3 }}
                      data-testid={`top-pick-${slot}-${i}`}
                      onClick={() => togglePlayer(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${myTeam.has(p.id) ? 'bg-primary/10 border border-primary/20' : 'bg-muted/40 hover:bg-muted/70'}`}
                    >
                      <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">€{fantasyPrice(p)}M</span>
                          {p.injuryRisk !== 'low' && <AlertTriangle className="w-2.5 h-2.5 text-yellow-400" />}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">{p.fantasyPoints}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
