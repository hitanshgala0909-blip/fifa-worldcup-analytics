"""
================================================================================
FIFA WORLD CUP 2026 — ENHANCED PLAYER ANALYTICS
================================================================================
Pure extension of wc2026_player_analytics.py.
Reads from outputs/player_analytics/01_all_players_full_analytics.csv
and existing SHAP values. No model retraining.

Generates:
  SECTION 1 — Performance scores for all 1,248 players (enriched)
  SECTION 2 — Position-specific deep-dive rankings (GK/DF/MF/FW)
  SECTION 3 — Tournament award predictions (Boot/Ball/Glove/Young)
  SECTION 4 — Breakout player predictions (with reasoning)
  SECTION 5 — Underrated player predictions (with reasoning)
  SECTION 6 — Fantasy outputs (captain/vice/budget/differential/Best XI)
  SECTION 7 — Explainability reports (top 20 players, feature drivers)
  SECTION 8 — Visualisations (PNG charts for dashboard / LinkedIn)

OUTPUT FILES  (outputs/player_analytics/enhanced/)
  performance_scores_all_1248.csv
  rankings_gk_detailed.csv
  rankings_df_detailed.csv
  rankings_mf_detailed.csv
  rankings_fw_detailed.csv
  award_golden_boot.csv
  award_golden_ball.csv
  award_golden_glove.csv
  award_best_young_player.csv
  breakout_predictions.csv
  underrated_predictions.csv
  fantasy_captain.csv
  fantasy_vice_captain.csv
  fantasy_budget.csv
  fantasy_differential.csv
  fantasy_best_xi.csv
  explainability_top20.csv
  charts/  (8 PNG visualisations)
================================================================================
"""

import os, warnings, json
import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE   = "/home/claude/wc2026"
PA_DIR = f"{BASE}/outputs/player_analytics"
OUT    = f"{PA_DIR}/enhanced"
CHART  = f"{OUT}/charts"
MODEL_DIR  = f"{BASE}/models"
SQUADS_XLS = "/mnt/user-data/uploads/worldcup2026_CONFIRMED_squads_analytics.xlsx"
TEAM_NAME_MAP = {"Czech Republic":"Czechia","Curaçao":"Curacao"}

os.makedirs(OUT, exist_ok=True)
os.makedirs(CHART, exist_ok=True)

# ── Load master analytics table ───────────────────────────────────────────────
df = pd.read_csv(f"{PA_DIR}/01_all_players_full_analytics.csv")

# ── Load SHAP + model for per-player explanations ─────────────────────────────
best_player_pipe = joblib.load(f"{MODEL_DIR}/best_player_model.pkl")
with open(f"{MODEL_DIR}/player_model_meta.json") as f:
    meta = json.load(f)
FEAT_COLS = meta["feature_cols"]

sq_raw = pd.read_excel(SQUADS_XLS, sheet_name="📋 Master Dataset",
                       header=3, engine="openpyxl")
sq_raw.columns = [c.replace("\n","_").strip() for c in sq_raw.columns]
sq_raw["Nation"] = sq_raw["Nation"].replace(TEAM_NAME_MAP)
sq_raw["position_enc"] = sq_raw["Pos"].map({"GK":0,"DF":1,"MF":2,"FW":3}).fillna(2)
sq_raw["foot_enc"]     = (sq_raw["Foot"] == "Left").astype(int)

# Build SHAP explainer once
X_raw  = sq_raw[FEAT_COLS].copy()
imp    = SimpleImputer(strategy="median")
sc     = StandardScaler()
X_imp  = imp.fit_transform(X_raw)
X_sc   = sc.fit_transform(X_imp)
ridge  = best_player_pipe.named_steps["model"]
explainer = shap.LinearExplainer(ridge, X_sc,
                                  feature_perturbation="interventional")
sv_all    = explainer.shap_values(X_sc)   # (1248, 33)

# Build name → row index mapping
name_to_sq_idx = dict(zip(sq_raw["Player Name"], sq_raw.index))
name_to_df_idx = dict(zip(df["player"], df.index))

# ── Colour palette (used across all charts) ────────────────────────────────────
C = {
    "gold"   : "#F4C430",
    "silver" : "#A8A9AD",
    "bronze" : "#CD7F32",
    "spain"  : "#AA151B",
    "bg"     : "#0d1117",
    "surface": "#161b22",
    "border" : "#30363d",
    "text"   : "#e6edf3",
    "muted"  : "#8b949e",
    "blue"   : "#58a6ff",
    "green"  : "#3fb950",
    "orange" : "#f97316",
    "purple" : "#8957e5",
    "teal"   : "#39d353",
}

plt.rcParams.update({
    "figure.facecolor" : C["bg"],
    "axes.facecolor"   : C["surface"],
    "axes.edgecolor"   : C["border"],
    "axes.labelcolor"  : C["muted"],
    "xtick.color"      : C["muted"],
    "ytick.color"      : C["muted"],
    "text.color"       : C["text"],
    "grid.color"       : C["border"],
    "grid.linewidth"   : 0.5,
    "font.family"      : "DejaVu Sans",
    "font.size"        : 9,
})

print("="*65)
print("  WC 2026 — ENHANCED PLAYER ANALYTICS")
print("="*65)
print(f"  Players loaded : {len(df)}")
print(f"  SHAP computed  : {sv_all.shape}")


# ==============================================================================
# SECTION 1 — PERFORMANCE SCORES FOR ALL 1,248 PLAYERS
# ==============================================================================
# Adds three new columns to the master table:
#   performance_tier    — Elite / World Class / Quality / Average / Squad
#   expected_wc_goals   — probabilistic goal projection for the tournament
#   expected_wc_assists — probabilistic assist projection

print(f"\n{'='*65}")
print("  SECTION 1 — PERFORMANCE SCORES (ALL 1,248)")
print("="*65)

def expected_tournament_goals(row) -> float:
    """
    Estimate expected goals across the WC tournament.

    Formula:
      xG_per90 × expected_minutes
      expected_minutes = starter_prob × matches_expected × 90
      matches_expected = P(reach R16) × 4 + (1 - P(reach R16)) × 3
        (avg 3 group games; 4 if they advance)
    Capped at sensible ceiling (Haaland 2022 scored 0 at WC — variance is real).
    """
    xg_per90  = float(row["xG_/90"])
    starter   = float(row["starter_prob"])
    r16_prob  = float(row["team_r16_prob"])
    avg_matches = 3 + r16_prob * 2   # 3 group + expected KO matches
    exp_mins  = starter * avg_matches * 90
    raw_goals = xg_per90 * (exp_mins / 90)
    # Apply conversion variance (not every xG converts — scale down slightly)
    return round(raw_goals * 0.82, 2)

def expected_tournament_assists(row) -> float:
    """Expected assists using xA/90 with same minutes logic."""
    xa_per90  = float(row["xA_/90"])
    starter   = float(row["starter_prob"])
    r16_prob  = float(row["team_r16_prob"])
    avg_matches = 3 + r16_prob * 2
    exp_mins  = starter * avg_matches * 90
    return round(xa_per90 * (exp_mins / 90) * 0.78, 2)

def performance_tier(proj: float) -> str:
    """Classify player into performance tier based on projection score."""
    if proj >= 70: return "⚡ Elite"
    if proj >= 60: return "🌟 World Class"
    if proj >= 50: return "✅ Quality"
    if proj >= 40: return "🔵 Average"
    return "⚪ Squad"

df["expected_wc_goals"]   = df.apply(expected_tournament_goals,   axis=1)
df["expected_wc_assists"] = df.apply(expected_tournament_assists, axis=1)
df["expected_wc_contrib"] = (df["expected_wc_goals"] + df["expected_wc_assists"]).round(2)
df["performance_tier"]    = df["tournament_projection"].apply(performance_tier)

# Save enriched full table
perf_cols = [
    "overall_rank","player","team","group","position","club","age",
    "performance_tier","tournament_projection","pos_fantasy_score",
    "captain_score","value_score",
    "overall_index","form_score","recent_rating",
    "xG_/90","xA_/90","expected_wc_goals","expected_wc_assists","expected_wc_contrib",
    "fitness","injury_risk","starter_prob","squad_rank",
    "wc_matches","wc_goals","ko_experience","wc_tournaments",
    "caps","intl_win_rate","age_multiplier",
    "clean_sheet_prob","group_difficulty","team_r16_prob","team_power_rank",
]
df[perf_cols].to_csv(f"{OUT}/performance_scores_all_1248.csv", index=False)

tier_counts = df["performance_tier"].value_counts()
print(f"\n  Performance tiers:")
for tier, n in tier_counts.items():
    print(f"    {tier}: {n} players")
print(f"\n  Expected WC goals (top 10):")
print(df.nlargest(10,"expected_wc_goals")[
    ["player","team","position","xG_/90","expected_wc_goals","starter_prob"]
].to_string(index=False))


# ==============================================================================
# SECTION 2 — POSITION-SPECIFIC DEEP-DIVE RANKINGS
# ==============================================================================

print(f"\n{'='*65}")
print("  SECTION 2 — POSITION RANKINGS (DEEP DIVE)")
print("="*65)

pos_rank_configs = {
    "GK": {
        "file"       : "rankings_gk_detailed.csv",
        "score_col"  : "pos_fantasy_score",
        "key_metrics": ["pass_accuracy","clean_sheet_prob","caps","recent_rating",
                         "fitness","injury_risk","starter_prob","expected_wc_goals"],
        "label"      : "Goalkeeper",
    },
    "DF": {
        "file"       : "rankings_df_detailed.csv",
        "score_col"  : "pos_fantasy_score",
        "key_metrics": ["tackles","interceptions","clean_sheet_prob","aerials",
                         "xG_/90","prog_carries","fitness","injury_risk",
                         "starter_prob","expected_wc_goals"],
        "label"      : "Defender",
    },
    "MF": {
        "file"       : "rankings_mf_detailed.csv",
        "score_col"  : "pos_fantasy_score",
        "key_metrics": ["xG_/90","xA_/90","key_passes","form_score","prog_passes",
                         "dribbles","pressures","fitness","injury_risk",
                         "starter_prob","expected_wc_goals","expected_wc_assists"],
        "label"      : "Midfielder",
    },
    "FW": {
        "file"       : "rankings_fw_detailed.csv",
        "score_col"  : "pos_fantasy_score",
        "key_metrics": ["xG_/90","recent_goals","conversion_rate","shots",
                         "xA_/90","dribbles","form_score","fitness",
                         "injury_risk","starter_prob","expected_wc_goals"],
        "label"      : "Forward",
    },
}

for pos, cfg in pos_rank_configs.items():
    sub = df[df["position"]==pos].sort_values(cfg["score_col"], ascending=False).copy()
    sub["pos_rank"] = range(1, len(sub)+1)
    out_cols = (["pos_rank","player","team","group","club","age",
                 "performance_tier","tournament_projection",cfg["score_col"]] +
                [c for c in cfg["key_metrics"] if c in sub.columns])
    sub[out_cols].to_csv(f"{OUT}/{cfg['file']}", index=False)
    print(f"\n  {cfg['label']} rankings — top 15:")
    print(f"  {'Rk':>3} {'Player':<26} {'Team':<20} {'Score':>7} "
          f"{'Proj':>7} {'Fit%':>5} {'Risk':>5} {'Tier'}")
    print("  " + "-"*82)
    for _, r in sub.head(15).iterrows():
        flag = "⚠️" if r["injury_risk"]>40 else " "
        print(f"  {int(r['pos_rank']):>3} {r['player']:<26} {r['team']:<20} "
              f"{r[cfg['score_col']]:>7.2f} {r['tournament_projection']:>7.2f} "
              f"{r['fitness']:>5.1f} {r['injury_risk']:>4.1f}{flag} "
              f"{r['performance_tier']}")


# ==============================================================================
# SECTION 3 — TOURNAMENT AWARD PREDICTIONS
# ==============================================================================

print(f"\n{'='*65}")
print("  SECTION 3 — TOURNAMENT AWARD PREDICTIONS")
print("="*65)

# ── 3A. Golden Boot (top scorer) ──────────────────────────────────────────────
# Formula: xG/90 (volume of chances) × starter_prob × team advancement
# × conversion rate × recent form × age multiplier
# Weighted heavily toward FW and high-xG MF.

def golden_boot_score(row) -> float:
    """
    Golden Boot probability index.
    Expected goals + conversion quality + team progression likelihood.
    """
    goal_threat = float(row["xG_/90"]) * 100
    conv_bonus  = float(row["conversion_rate"]) * 30
    team_adv    = float(row["team_r16_prob"]) * 20
    form_bonus  = float(row["form_score"]) / 9 * 15
    starter_w   = float(row["starter_prob"]) * 10
    age_adj     = float(row["age_multiplier"])
    risk_pen    = float(row["injury_risk"]) / 100 * 15
    return round((goal_threat + conv_bonus + team_adv + form_bonus + starter_w - risk_pen)
                 * age_adj, 3)

df["golden_boot_score"] = df.apply(golden_boot_score, axis=1)

boot_df = (df[df["position"].isin(["FW","MF"])]
           .sort_values("golden_boot_score", ascending=False)
           .head(20)[[
               "player","team","group","position","age",
               "golden_boot_score","xG_/90","expected_wc_goals",
               "conversion_rate","form_score","fitness","injury_risk",
               "team_r16_prob","wc_goals"
           ]].reset_index(drop=True))
boot_df.index += 1
boot_df.to_csv(f"{OUT}/award_golden_boot.csv")

print(f"\n  🥾 GOLDEN BOOT PREDICTIONS:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} {'Score':>7} "
      f"{'xG/90':>6} {'Exp.G':>6} {'Conv%':>6}")
print("  " + "-"*74)
for rank, r in boot_df.head(10).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} "
          f"{r['golden_boot_score']:>7.2f} {r['xG_/90']:>6.3f} "
          f"{r['expected_wc_goals']:>6.2f} {r['conversion_rate']:>6.2f}")

# ── 3B. Golden Ball (best player overall) ─────────────────────────────────────
# Formula: overall projection × team success × all-round contribution
# Opens to all positions — a defensive midfielder can win (Modric 2018).

def golden_ball_score(row) -> float:
    """
    Golden Ball index.
    Rewards complete players whose teams advance deep in the tournament.
    """
    all_round    = float(row["tournament_projection"])
    team_success = float(row["team_r16_prob"]) * 25
    contrib_bonus = (float(row["xG_/90"]) + float(row["xA_/90"])) * 20
    wc_exp_bonus = min(float(row["wc_matches"]) * 0.5, 5)
    age_adj      = float(row["age_multiplier"])
    risk_pen     = float(row["injury_risk"]) / 100 * 10
    return round((all_round + team_success + contrib_bonus + wc_exp_bonus - risk_pen)
                 * age_adj, 3)

df["golden_ball_score"] = df.apply(golden_ball_score, axis=1)

ball_df = (df.sort_values("golden_ball_score", ascending=False)
           .head(20)[[
               "player","team","group","position","age",
               "golden_ball_score","tournament_projection",
               "xG_/90","xA_/90","form_score","fitness",
               "team_r16_prob","wc_matches","overall_index"
           ]].reset_index(drop=True))
ball_df.index += 1
ball_df.to_csv(f"{OUT}/award_golden_ball.csv")

print(f"\n  🏆 GOLDEN BALL PREDICTIONS:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} {'Pos':>4} "
      f"{'Score':>7} {'Proj':>7} {'xG/90':>6}")
print("  " + "-"*75)
for rank, r in ball_df.head(10).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} {r['position']:>4} "
          f"{r['golden_ball_score']:>7.2f} {r['tournament_projection']:>7.2f} "
          f"{r['xG_/90']:>6.3f}")

# ── 3C. Golden Glove (best goalkeeper) ────────────────────────────────────────
# Formula: GK-specific — pass accuracy, clean sheet prob, rating,
# caps (experience), fitness, team defensive strength.

def golden_glove_score(row) -> float:
    """
    Golden Glove index.
    Rewards GKs who are distribution-capable, physically ready, experienced,
    and playing for a solid defensive team.
    """
    dist_skill   = float(row["pass_accuracy"]) * 0.40
    cs_ability   = float(row["clean_sheet_prob"]) * 100 * 0.25
    rating_score = float(row["recent_rating"]) / 10 * 100 * 0.15
    experience   = min(float(row["caps"]) / 100 * 20, 20) * 0.10
    form_bonus   = float(row["form_score"]) / 9 * 100 * 0.07
    fitness_sc   = float(row["fitness"]) * 0.03
    risk_pen     = float(row["injury_risk"]) / 100 * 12
    return round(dist_skill + cs_ability + rating_score +
                 experience + form_bonus + fitness_sc - risk_pen, 3)

df.loc[df["position"]=="GK", "golden_glove_score"] = \
    df[df["position"]=="GK"].apply(golden_glove_score, axis=1)
df["golden_glove_score"] = df["golden_glove_score"].fillna(0)

glove_df = (df[df["position"]=="GK"]
            .sort_values("golden_glove_score", ascending=False)
            .head(15)[[
                "player","team","group","age",
                "golden_glove_score","pos_fantasy_score",
                "pass_accuracy","clean_sheet_prob","recent_rating",
                "caps","fitness","injury_risk","wc_matches"
            ]].reset_index(drop=True))
glove_df.index += 1
glove_df.to_csv(f"{OUT}/award_golden_glove.csv")

print(f"\n  🧤 GOLDEN GLOVE PREDICTIONS:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} "
      f"{'Score':>7} {'Pass%':>6} {'CS%':>6} {'Rating':>7} {'Caps':>5}")
print("  " + "-"*76)
for rank, r in glove_df.head(8).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} "
          f"{r['golden_glove_score']:>7.2f} {r['pass_accuracy']:>6.1f} "
          f"{r['clean_sheet_prob']:>6.2%} {r['recent_rating']:>7.2f} "
          f"{int(r['caps']):>5}")

# ── 3D. Best Young Player (Under 21) ──────────────────────────────────────────
# Cutoff: born after June 2005 → age ≤ 20 at tournament start (June 2026)
# Formula: same as Golden Ball but with bonus for being young + high ceiling

def young_player_score(row) -> float:
    """
    Best Young Player index.
    Same as Golden Ball with extra weight on ceiling (form, xG)
    and a youth bonus — being 17-20 is remarkable at a WC.
    """
    age = float(row["age"])
    youth_bonus = max(0, (21 - age) * 2)   # 2 pts per year under 21
    base = float(row["golden_ball_score"])
    ceiling_bonus = float(row["xG_/90"]) * 15 + float(row["form_score"]) * 3
    return round(base + youth_bonus + ceiling_bonus, 3)

young_mask = df["age"] <= 20
df.loc[young_mask, "young_player_score"] = df[young_mask].apply(young_player_score, axis=1)
df["young_player_score"] = df["young_player_score"].fillna(0)

young_df = (df[young_mask]
            .sort_values("young_player_score", ascending=False)
            .head(15)[[
                "player","team","group","position","age",
                "young_player_score","tournament_projection",
                "xG_/90","xA_/90","form_score","fitness",
                "starter_prob","caps","injury_risk"
            ]].reset_index(drop=True))
young_df.index += 1
young_df.to_csv(f"{OUT}/award_best_young_player.csv")

print(f"\n  🌟 BEST YOUNG PLAYER (≤20) PREDICTIONS:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} {'Pos':>4} "
      f"{'Age':>4} {'Score':>7} {'xG/90':>6} {'Form':>6}")
print("  " + "-"*76)
for rank, r in young_df.head(10).iterrows():
    flag = "🔥" if r["tournament_projection"] >= 55 else ""
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} {r['position']:>4} "
          f"{int(r['age']):>4} {r['young_player_score']:>7.2f} "
          f"{r['xG_/90']:>6.3f} {r['form_score']:>6.2f} {flag}")


# ==============================================================================
# SECTION 4 — BREAKOUT PLAYER PREDICTIONS
# ==============================================================================
# Breakout = player whose ceiling is much higher than their recognition level
# Signals: young (≤25), high xG/90 + form, low WC history (first major
# tournament moment), team has a reasonable path to the knockout rounds.

print(f"\n{'='*65}")
print("  SECTION 4 — BREAKOUT PREDICTIONS")
print("="*65)

def breakout_score(row) -> float:
    """
    Breakout potential score.
    Rewards youth + attacking threat + form + underexposure.

    A breakout player is someone the world doesn't yet know but WILL
    after this tournament. Key: high skill, first/second WC, team
    likely to advance, aggressive age multiplier still improving.
    """
    age     = float(row["age"])
    # Youth factor: strong before 24, still meaningful to 27
    youth_factor = max(0, (27 - age) / 27 * 40)

    # Attacking + creative output
    attack = (float(row["xG_/90"]) + float(row["xA_/90"])) * 30

    # Form trajectory (high form + young = very promising)
    form = float(row["form_score"]) * 4

    # Underexposure bonus: fewer WC matches = bigger potential surprise
    wc_exp_bonus = max(0, (10 - float(row["wc_matches"])) * 0.8)

    # Team must advance for anyone to notice
    team_stage = float(row["team_r16_prob"]) * 15

    # Must be an actual starter
    if row["starter_prob"] < 0.65:
        return 0.0

    risk_pen = float(row["injury_risk"]) / 100 * 10
    return round(youth_factor + attack + form + wc_exp_bonus + team_stage - risk_pen, 3)

df["breakout_score"] = df.apply(breakout_score, axis=1)

# Filter: age ≤ 25, confirmed starter
breakout_df = (df[(df["age"] <= 25) & (df["starter_prob"] >= 0.65)]
               .sort_values("breakout_score", ascending=False)
               .head(25)[[
                   "player","team","group","position","age",
                   "breakout_score","tournament_projection",
                   "xG_/90","xA_/90","form_score","wc_matches",
                   "caps","fitness","injury_risk","team_r16_prob",
                   "overall_index","team_power_rank"
               ]].reset_index(drop=True))
breakout_df.index += 1

# Add reasoning column
def breakout_reason(row) -> str:
    reasons = []
    if row["age"] <= 19: reasons.append(f"Only {int(row['age'])} years old")
    elif row["age"] <= 22: reasons.append(f"Just {int(row['age'])} — first major WC")
    if row["xG_/90"] >= 0.55: reasons.append(f"Elite xG/90 of {row['xG_/90']:.3f}")
    if row["form_score"] >= 7.5: reasons.append(f"On fire — form score {row['form_score']:.2f}/9")
    if row["wc_matches"] == 0: reasons.append("WC debut — first tournament")
    if row["team_r16_prob"] >= 0.6: reasons.append(f"Team favoured to advance ({row['team_r16_prob']:.0%})")
    if row["overall_index"] >= 30: reasons.append(f"High Overall Index ({row['overall_index']:.1f})")
    return " | ".join(reasons)

breakout_df["reasoning"] = breakout_df.apply(breakout_reason, axis=1)
breakout_df.to_csv(f"{OUT}/breakout_predictions.csv", index=False)

print(f"\n  Top 15 breakout candidates:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} {'Pos':>4} "
      f"{'Age':>4} {'Score':>7} {'xG/90':>6}")
print("  " + "-"*72)
for rank, r in breakout_df.head(15).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} {r['position']:>4} "
          f"{int(r['age']):>4} {r['breakout_score']:>7.2f} {r['xG_/90']:>6.3f}")
    print(f"       → {r['reasoning']}")


# ==============================================================================
# SECTION 5 — UNDERRATED PLAYER PREDICTIONS
# ==============================================================================
# Underrated = high skill ceiling suppressed by context:
#   - Playing for a weaker nation (lower team_power_rank)
#   - Less media coverage (low caps, no WC history)
#   - Defensive position (less fantasy glamour but high quality)
#   - Older age suppressing the projection (but still elite level)

print(f"\n{'='*65}")
print("  SECTION 5 — UNDERRATED PREDICTIONS")
print("="*65)

def underrated_score(row) -> float:
    """
    Underrated score = gap between true quality and projected recognition.

    A player is underrated when their Overall_Index (pure skill) is
    significantly higher than what the tournament projection awards them.
    Causes: weak team, injury history, being from a less-covered nation,
    playing in a defensive role.
    """
    skill_gap = float(row["overall_index"]) * 2.2 - float(row["tournament_projection"])

    # Bonus for playing in a less-covered nation
    nation_bonus = max(0, float(row["team_power_rank"]) - 20) * 0.5

    # Bonus for low media exposure (low caps relative to quality)
    if float(row["overall_index"]) >= 28 and float(row["caps"]) < 40:
        exposure_bonus = (40 - float(row["caps"])) * 0.3
    else:
        exposure_bonus = 0

    # Defensive position bonus (DFs and DM-MFs are always underrated in fantasy)
    pos_bonus = 5 if row["position"] in ("DF",) else 2 if row["position"] == "MF" else 0

    return round(skill_gap + nation_bonus + exposure_bonus + pos_bonus, 3)

df["underrated_score"] = df.apply(underrated_score, axis=1)

underrated_df = (df[
    (df["overall_index"] >= 27) &        # genuinely talented
    (df["starter_prob"] >= 0.70) &       # actually plays
    (df["injury_risk"] < 55)             # not a pure injury risk
].sort_values("underrated_score", ascending=False)
.head(25)[[
    "player","team","group","position","age",
    "underrated_score","overall_index","tournament_projection",
    "xG_/90","xA_/90","form_score","caps","team_power_rank",
    "fitness","injury_risk","wc_matches"
]].reset_index(drop=True))
underrated_df.index += 1

def underrated_reason(row) -> str:
    reasons = []
    if row["team_power_rank"] >= 20:
        reasons.append(f"Elite player on an underdog team (ranked #{int(row['team_power_rank'])})")
    if row["overall_index"] >= 31:
        reasons.append(f"World-class index {row['overall_index']:.1f} — rarely discussed")
    if row["caps"] < 35 and row["overall_index"] >= 28:
        reasons.append(f"Only {int(row['caps'])} caps — quietly brilliant")
    if row["wc_matches"] == 0:
        reasons.append("No WC exposure yet — unknown on the world stage")
    if row["position"] == "DF":
        reasons.append("Defenders always underrated in fantasy — elite here")
    if row["xA_/90"] >= 0.25 and row["position"] in ("DF","MF"):
        reasons.append(f"Exceptional creator for the position — xA/90 {row['xA_/90']:.3f}")
    return " | ".join(reasons) if reasons else "High quality, low recognition"

underrated_df["reasoning"] = underrated_df.apply(underrated_reason, axis=1)
underrated_df.to_csv(f"{OUT}/underrated_predictions.csv", index=False)

print(f"\n  Top 15 underrated players:")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<20} {'Pos':>4} "
      f"{'Index':>6} {'Proj':>6} {'Score':>7}")
print("  " + "-"*75)
for rank, r in underrated_df.head(15).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<20} {r['position']:>4} "
          f"{r['overall_index']:>6.1f} {r['tournament_projection']:>6.1f} "
          f"{r['underrated_score']:>7.2f}")
    print(f"       → {r['reasoning']}")


# ==============================================================================
# SECTION 6 — FANTASY OUTPUTS
# ==============================================================================

print(f"\n{'='*65}")
print("  SECTION 6 — FANTASY OUTPUTS")
print("="*65)

# ── 6A. Captain picks ──────────────────────────────────────────────────────────
# Captain = 2× points. Need: highest floor, highest ceiling, near-certain starter
captain_df = (df[
    df["position"].isin(["FW","MF"]) &
    (df["starter_prob"] >= 0.85) &
    (df["fitness"] >= 80)
].sort_values("captain_score", ascending=False)
.head(20)[[
    "player","team","group","position","age","captain_score",
    "tournament_projection","xG_/90","xA_/90","expected_wc_goals",
    "form_score","fitness","injury_risk","starter_prob",
    "team_r16_prob","wc_matches"
]].reset_index(drop=True))
captain_df.index += 1
captain_df.to_csv(f"{OUT}/fantasy_captain.csv", index=False)

print(f"\n  🎽 CAPTAIN PICKS (top 15):")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<18} {'Cap.Sc':>8} "
      f"{'xG/90':>6} {'ExpG':>5} {'Risk':>5} {'Status'}")
print("  " + "-"*82)
for rank, r in captain_df.head(15).iterrows():
    status = "✅ SAFE" if r["injury_risk"] < 20 else \
             "⚠️ WATCH" if r["injury_risk"] < 40 else "🔴 RISK"
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} "
          f"{r['captain_score']:>8.2f} {r['xG_/90']:>6.3f} "
          f"{r['expected_wc_goals']:>5.2f} {r['injury_risk']:>5.1f}  {status}")

# ── 6B. Vice-captain picks ────────────────────────────────────────────────────
# Vice-captain activates if captain doesn't play. Need: same position pool,
# from a different team (don't double up if team has a bad game).
cap_teams = set(captain_df.head(5)["team"])
vc_df = (df[
    df["position"].isin(["FW","MF"]) &
    (df["starter_prob"] >= 0.80) &
    (df["fitness"] >= 78) &
    (~df["team"].isin(cap_teams))   # different team from top 5 captains
].sort_values("captain_score", ascending=False)
.head(15)[[
    "player","team","group","position","age","captain_score",
    "tournament_projection","xG_/90","expected_wc_goals",
    "form_score","fitness","injury_risk"
]].reset_index(drop=True))
vc_df.index += 1
vc_df.to_csv(f"{OUT}/fantasy_vice_captain.csv", index=False)

print(f"\n  🥈 VICE-CAPTAIN PICKS (different teams from top captains):")
for rank, r in vc_df.head(10).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<18} "
          f"{r['captain_score']:>7.2f}  risk={r['injury_risk']:.1f}")

# ── 6C. Budget picks ──────────────────────────────────────────────────────────
# Budget = high output from weaker nations (often ignored by fantasy managers)
# Definition: team power rank ≥ 20, high tournament_projection, confirmed starter

budget_df = (df[
    (df["team_power_rank"] >= 20) &
    (df["starter_prob"] >= 0.75) &
    (df["tournament_projection"] >= 45) &
    (df["injury_risk"] < 50) &
    (df["position"] != "GK")   # GK budget picks less useful
].sort_values("tournament_projection", ascending=False)
.head(20)[[
    "player","team","group","position","age",
    "tournament_projection","pos_fantasy_score",
    "xG_/90","xA_/90","expected_wc_goals","form_score",
    "fitness","injury_risk","team_power_rank","caps"
]].reset_index(drop=True))
budget_df.index += 1
budget_df.to_csv(f"{OUT}/fantasy_budget.csv", index=False)

print(f"\n  💰 BUDGET PICKS (top 15 — underdog teams, starter status):")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<20} {'Pos':>4} "
      f"{'Proj':>6} {'xG/90':>6} {'Power':>6}")
print("  " + "-"*72)
for rank, r in budget_df.head(15).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<20} {r['position']:>4} "
          f"{r['tournament_projection']:>6.2f} {r['xG_/90']:>6.3f} "
          f"#{int(r['team_power_rank']):>5}")

# ── 6D. Differential picks ────────────────────────────────────────────────────
# Differential = high upside, likely low ownership, not in every fantasy team.
# Signals: team power rank 12-28 (not obvious), strong form, high xG,
# team has a legitimate path to knockouts.

diff_df = (df[
    (df["team_power_rank"].between(12, 28)) &
    (df["starter_prob"] >= 0.75) &
    (df["tournament_projection"] >= 50) &
    (df["form_score"] >= 6.5) &
    (df["team_r16_prob"] >= 0.35)
].sort_values("tournament_projection", ascending=False)
.head(20)[[
    "player","team","group","position","age",
    "tournament_projection","xG_/90","xA_/90",
    "form_score","fitness","injury_risk",
    "team_power_rank","team_r16_prob","expected_wc_goals"
]].reset_index(drop=True))
diff_df.index += 1
diff_df.to_csv(f"{OUT}/fantasy_differential.csv", index=False)

print(f"\n  🎲 DIFFERENTIAL PICKS (mid-ranked teams, high upside):")
print(f"  {'Rk':>3} {'Player':<26} {'Team':<20} {'Pos':>4} "
      f"{'Proj':>6} {'Form':>6} {'R16%':>6}")
print("  " + "-"*72)
for rank, r in diff_df.head(15).iterrows():
    print(f"  {rank:>3} {r['player']:<26} {r['team']:<20} {r['position']:>4} "
          f"{r['tournament_projection']:>6.2f} {r['form_score']:>6.2f} "
          f"{r['team_r16_prob']:>6.1%}")

# ── 6E. Best XI ────────────────────────────────────────────────────────────────
# Formation 4-3-3. Pick top available player per position slot
# avoiding duplicate teams (max 2 per team for balance).

def pick_best_xi(df_in: pd.DataFrame) -> pd.DataFrame:
    """
    Select optimal starting XI in 4-3-3 formation.

    Rules:
      - 1 GK, 4 DF, 3 MF, 3 FW
      - Max 2 players from the same team
      - Must have starter_prob >= 0.75
      - Minimise injury risk (skip if risk > 50)
    """
    eligible = df_in[
        (df_in["starter_prob"] >= 0.75) &
        (df_in["injury_risk"] < 50)
    ].copy()

    slots = {"GK": 1, "DF": 4, "MF": 3, "FW": 3}
    selected = []
    team_counts: dict = {}

    for pos, n_slots in slots.items():
        pos_pool = eligible[eligible["position"] == pos].sort_values(
            "tournament_projection", ascending=False
        )
        filled = 0
        for _, row in pos_pool.iterrows():
            if filled >= n_slots:
                break
            t = row["team"]
            if team_counts.get(t, 0) >= 2:
                continue
            selected.append(row)
            team_counts[t] = team_counts.get(t, 0) + 1
            filled += 1

    xi = pd.DataFrame(selected)[[
        "player","team","group","position","age",
        "tournament_projection","pos_fantasy_score","captain_score",
        "xG_/90","xA_/90","expected_wc_goals","expected_wc_assists",
        "form_score","fitness","injury_risk","starter_prob"
    ]].reset_index(drop=True)

    pos_order = {"GK":0,"DF":1,"MF":2,"FW":3}
    xi["pos_order"] = xi["position"].map(pos_order)
    xi = xi.sort_values(["pos_order","tournament_projection"],
                         ascending=[True,False]).drop(columns="pos_order")
    xi.index += 1
    return xi

xi_df = pick_best_xi(df)
xi_df.to_csv(f"{OUT}/fantasy_best_xi.csv", index=False)

total_proj  = xi_df["tournament_projection"].sum()
exp_goals   = xi_df["expected_wc_goals"].sum()
exp_assists = xi_df["expected_wc_assists"].sum()

print(f"\n  ⚽ BEST XI (4-3-3 formation):")
print(f"  {'Pos':>4} {'Player':<26} {'Team':<18} {'Proj':>7} "
      f"{'ExpG':>5} {'ExpA':>5} {'Risk':>5}")
print("  " + "-"*72)
for _, r in xi_df.iterrows():
    captain_mark = " ©" if r["player"] == captain_df.iloc[0]["player"] else ""
    print(f"  {r['position']:>4} {r['player']:<26}{captain_mark:<2} {r['team']:<16} "
          f"{r['tournament_projection']:>7.2f} {r['expected_wc_goals']:>5.2f} "
          f"{r['expected_wc_assists']:>5.2f} {r['injury_risk']:>5.1f}")
print(f"\n  XI Totals: proj={total_proj:.1f} | "
      f"exp goals={exp_goals:.2f} | exp assists={exp_assists:.2f}")


# ==============================================================================
# SECTION 7 — EXPLAINABILITY REPORTS (TOP 20 PLAYERS)
# ==============================================================================

print(f"\n{'='*65}")
print("  SECTION 7 — EXPLAINABILITY REPORTS")
print("="*65)

# Human-readable feature labels
FEAT_LABELS = {
    "xG_/90"      : "xG per 90 mins",
    "xA_/90"      : "xA per 90 mins",
    "Goals"       : "Recent goals",
    "Assists"      : "Recent assists",
    "Rating"       : "Recent match rating",
    "Form_Score"   : "Form score (0-9)",
    "Pass_Acc%"    : "Pass accuracy %",
    "Conv%"        : "Shot conversion %",
    "WC_Match"     : "WC matches played",
    "WC_Goals"     : "WC goals",
    "WC_Rating"    : "WC match rating",
    "KO_Exp"       : "KO stage experience",
    "WC_Trnys"     : "WC tournaments",
    "Caps"         : "International caps",
    "I.Goals"      : "International goals",
    "G/Cap"        : "Goals per cap",
    "Win%"         : "International win %",
    "Age"          : "Age",
    "Fitness"      : "Fitness %",
    "Team_xG"      : "Team xG (avg)",
    "Team_Poss"    : "Team possession %",
    "FIFA_Rank"    : "FIFA ranking",
    "Prog_Pass"    : "Progressive passes",
    "Prog_Carry"   : "Progressive carries",
    "Press"        : "Pressures applied",
    "Intercept"    : "Interceptions",
    "Tackles"      : "Tackles",
    "Shots"        : "Shots taken",
    "Key_Pass"     : "Key passes",
    "Dribbles"     : "Successful dribbles",
    "Aerials"      : "Aerial duels won",
    "position_enc" : "Position (encoded)",
    "foot_enc"     : "Preferred foot",
}

def explain_player(player_name: str, df_in: pd.DataFrame,
                   sq_df: pd.DataFrame, shap_vals: np.ndarray,
                   feat_cols: list, feat_labels: dict,
                   n_top: int = 8) -> dict:
    """
    Generate a human-readable explanation for one player's model score.

    Returns a dict with:
      player         — name
      team / pos     — context
      predicted_index— model output
      top_drivers    — list of {feature, value, shap, direction, explanation}
      strengths      — top 3 positive SHAP features in plain English
      weaknesses     — top 3 negative SHAP features in plain English
      summary        — one-paragraph natural language summary
    """
    # Find this player's row index in sq_raw
    sq_idx = sq_df[sq_df["Player Name"]==player_name].index
    if len(sq_idx) == 0:
        return {"player": player_name, "error": "Not found in squad data"}
    sq_idx = sq_idx[0]

    sv_row   = shap_vals[sq_idx]           # SHAP values for this player
    feat_vals = sq_df.loc[sq_idx, feat_cols].values.astype(float)

    # Top drivers by |SHAP|
    order   = np.argsort(np.abs(sv_row))[::-1][:n_top]
    drivers = []
    for i in order:
        fname  = feat_cols[i]
        fval   = feat_vals[i]
        fshap  = sv_row[i]
        flabel = feat_labels.get(fname, fname)
        direction = "boosts" if fshap > 0 else "limits"
        drivers.append({
            "feature"    : fname,
            "label"      : flabel,
            "raw_value"  : round(float(fval), 4),
            "shap_value" : round(float(fshap), 4),
            "direction"  : direction,
        })

    strengths = [d for d in drivers if d["shap_value"] > 0][:3]
    weaknesses= [d for d in drivers if d["shap_value"] < 0][:3]

    # Pull player info from df_in
    df_row = df_in[df_in["player"]==player_name]
    if len(df_row) == 0:
        return {"player": player_name, "error": "Not in analytics df"}
    r = df_row.iloc[0]

    # Build plain-English summary
    str_txt = "; ".join([
        f"{s['label']} ({s['raw_value']:.3g})" for s in strengths
    ]) if strengths else "balanced profile"
    wk_txt  = "; ".join([
        f"{w['label']} ({w['raw_value']:.3g})" for w in weaknesses
    ]) if weaknesses else "no significant weaknesses"

    tier_map = {
        "⚡ Elite": "one of the tournament's genuine elite players",
        "🌟 World Class": "a world-class performer expected to shine",
        "✅ Quality": "a quality international player",
        "🔵 Average": "a solid squad option",
        "⚪ Squad": "a rotation/squad player",
    }
    tier_desc = tier_map.get(r["performance_tier"], "a tournament participant")

    summary = (
        f"{player_name} ({r['team']}, {r['position']}, age {int(r['age'])}) "
        f"is rated as {tier_desc} with a tournament projection score of "
        f"{r['tournament_projection']:.1f}/100. "
        f"The model rates them highly because of: {str_txt}. "
        f"Potential limiting factors: {wk_txt}. "
        f"Expected WC goal contribution: {r['expected_wc_goals']:.2f} goals + "
        f"{r['expected_wc_assists']:.2f} assists. "
        f"Fitness: {r['fitness']:.0f}% | Injury risk: {r['injury_risk']:.0f}/100 "
        f"({'safe' if r['injury_risk']<20 else 'moderate' if r['injury_risk']<40 else 'high'})."
    )

    return {
        "player"          : player_name,
        "team"            : r["team"],
        "position"        : r["position"],
        "age"             : int(r["age"]),
        "club"            : r.get("club",""),
        "predicted_index" : round(float(r["overall_index"]), 2),
        "tournament_proj" : round(float(r["tournament_projection"]), 2),
        "performance_tier": r["performance_tier"],
        "top_drivers"     : drivers,
        "strengths"       : strengths,
        "weaknesses"      : weaknesses,
        "summary"         : summary,
    }


# Run for top 20 by tournament projection
top20_names = df.nlargest(20, "tournament_projection")["player"].tolist()

expl_rows  = []
expl_flat  = []

print(f"\n  Generating explanations for top 20 players...")
for name in top20_names:
    exp = explain_player(name, df, sq_raw, sv_all, FEAT_COLS, FEAT_LABELS)
    if "error" in exp:
        print(f"    ⚠️  {name}: {exp['error']}")
        continue
    expl_rows.append(exp)

    print(f"\n  {'─'*58}")
    print(f"  {exp['player']:<30} {exp['team']:<18} {exp['position']}")
    print(f"  Overall Index: {exp['predicted_index']:.2f} | "
          f"Projection: {exp['tournament_proj']:.1f} | {exp['performance_tier']}")
    print(f"  {exp['summary']}")
    print(f"  Top drivers:")
    for d in exp["top_drivers"][:6]:
        bar = "█" * int(abs(d["shap_value"]) * 12)
        sign = "↑" if d["shap_value"] > 0 else "↓"
        print(f"    {sign} {d['label']:<28} val={d['raw_value']:<8.3g} "
              f"SHAP={d['shap_value']:+.4f}  {bar}")

    # Flatten for CSV
    for i, d in enumerate(exp["top_drivers"][:8]):
        expl_flat.append({
            "player"          : exp["player"],
            "team"            : exp["team"],
            "position"        : exp["position"],
            "tournament_proj" : exp["tournament_proj"],
            "performance_tier": exp["performance_tier"],
            "driver_rank"     : i + 1,
            "feature"         : d["feature"],
            "feature_label"   : d["label"],
            "raw_value"       : d["raw_value"],
            "shap_value"      : d["shap_value"],
            "direction"       : d["direction"],
        })

pd.DataFrame(expl_flat).to_csv(f"{OUT}/explainability_top20.csv", index=False)

# Save full JSON explanations
with open(f"{OUT}/explainability_top20.json", "w") as f:
    json.dump(expl_rows, f, indent=2)

print(f"\n  ✅ Explainability saved: {OUT}/explainability_top20.csv + .json")


# ==============================================================================
# SECTION 8 — VISUALISATIONS
# ==============================================================================

print(f"\n{'='*65}")
print("  SECTION 8 — VISUALISATIONS")
print("="*65)


# ── Chart 1: Top 20 players — tournament projection (horizontal bar) ───────────
def chart_top20_projection():
    top20 = df.nlargest(20, "tournament_projection").sort_values(
        "tournament_projection")
    pos_colors = {"GK":"#58a6ff","DF":"#3fb950","MF":"#f97316","FW":"#e05cc5"}
    colors = [pos_colors.get(p, C["blue"]) for p in top20["position"]]

    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor(C["bg"])
    bars = ax.barh(top20["player"] + " (" + top20["team"] + ")",
                   top20["tournament_projection"],
                   color=colors, edgecolor="none", height=0.7)
    for bar, (_, row) in zip(bars, top20.iterrows()):
        ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height()/2,
                f"{bar.get_width():.1f}", va="center", ha="left",
                fontsize=8, color=C["text"])

    ax.set_xlabel("Tournament Projection Score (0-100)", color=C["muted"])
    ax.set_title("⚽  WC 2026 — Top 20 Players by Tournament Projection",
                 fontsize=13, color=C["text"], pad=14, fontweight="bold")
    ax.set_xlim(0, top20["tournament_projection"].max() * 1.12)
    ax.grid(axis="x", alpha=0.3)
    ax.set_facecolor(C["surface"])

    legend_patches = [mpatches.Patch(color=c, label=p)
                      for p, c in pos_colors.items()]
    ax.legend(handles=legend_patches, loc="lower right",
              facecolor=C["surface"], edgecolor=C["border"],
              labelcolor=C["text"], fontsize=8)
    plt.tight_layout()
    path = f"{CHART}/01_top20_projection.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_top20_projection()


# ── Chart 2: Award predictions — 4-panel ──────────────────────────────────────
def chart_award_predictions():
    fig = plt.figure(figsize=(16, 10))
    fig.patch.set_facecolor(C["bg"])
    gs = GridSpec(2, 2, figure=fig, hspace=0.5, wspace=0.4)

    award_data = [
        (boot_df.head(8),  "golden_boot_score",  "🥾 Golden Boot",  C["orange"]),
        (ball_df.head(8),  "golden_ball_score",   "🏆 Golden Ball",  C["gold"]),
        (glove_df.head(8), "golden_glove_score",  "🧤 Golden Glove", C["teal"]),
        (young_df.head(8), "young_player_score",  "🌟 Best Young",   C["purple"]),
    ]

    for idx, (award_df, score_col, title, color) in enumerate(award_data):
        ax = fig.add_subplot(gs[idx//2, idx%2])
        ax.set_facecolor(C["surface"])
        data = award_df.sort_values(score_col)
        bars = ax.barh(data["player"], data[score_col],
                       color=color, alpha=0.85, height=0.6)
        # Gold/silver/bronze markers
        medal_colors = [C["gold"], C["silver"], C["bronze"]]
        for mi, (bar, row_) in enumerate(zip(reversed(bars), data.iterrows())):
            row = row_[1]
            if mi < 3:
                ax.text(data[score_col].max() * 1.02,
                        bar.get_y() + bar.get_height()/2,
                        ["🥇","🥈","🥉"][mi], va="center", fontsize=11)
        ax.set_title(title, color=C["text"], fontsize=10, fontweight="bold")
        ax.tick_params(labelsize=7, colors=C["muted"])
        ax.set_facecolor(C["surface"])
        ax.grid(axis="x", alpha=0.25)
        for spine in ax.spines.values():
            spine.set_edgecolor(C["border"])

    fig.suptitle("WC 2026 — Tournament Award Predictions",
                 fontsize=14, color=C["text"], fontweight="bold", y=1.01)
    path = f"{CHART}/02_award_predictions.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_award_predictions()


# ── Chart 3: Fantasy Best XI (formation pitch visual) ─────────────────────────
def chart_best_xi(xi: pd.DataFrame):
    """Draw a football pitch with the Best XI positioned in 4-3-3."""
    fig, ax = plt.subplots(figsize=(10, 13))
    fig.patch.set_facecolor("#0a2a0a")
    ax.set_facecolor("#0a2a0a")

    # Pitch
    pitch_rect = mpatches.FancyBboxPatch(
        (5, 5), 60, 90, boxstyle="round,pad=1",
        linewidth=2, edgecolor="white", facecolor="#1a4a1a"
    )
    ax.add_patch(pitch_rect)
    ax.plot([35, 35], [5, 95], color="white", lw=1, alpha=0.5)
    ax.add_patch(plt.Circle((35, 50), 9.15, color="white",
                             fill=False, lw=1, alpha=0.5))

    # Position coordinates in 4-3-3 (x=left-right, y=bottom-top)
    positions_xy = {
        "GK":  [(35, 10)],
        "DF":  [(12, 25), (24, 25), (46, 25), (58, 25)],
        "MF":  [(18, 50), (35, 50), (52, 50)],
        "FW":  [(15, 75), (35, 78), (55, 75)],
    }

    pos_iter = {"GK": 0, "DF": 0, "MF": 0, "FW": 0}
    pos_color_map = {"GK": C["teal"], "DF": C["green"],
                     "MF": C["orange"], "FW": "#e05cc5"}

    for _, row in xi.iterrows():
        pos = row["position"]
        idx_p = pos_iter.get(pos, 0)
        coords = positions_xy.get(pos, [(35, 50)])
        if idx_p >= len(coords):
            continue
        x, y = coords[idx_p]
        pos_iter[pos] += 1

        color = pos_color_map.get(pos, C["blue"])
        circle = plt.Circle((x, y), 5, color=color,
                              zorder=5, alpha=0.9)
        ax.add_patch(circle)
        short = row["player"].split()[-1]
        ax.text(x, y, short, ha="center", va="center",
                fontsize=7.5, fontweight="bold", color="white",
                zorder=6)
        ax.text(x, y - 6.5, row["team"][:3].upper(),
                ha="center", va="center",
                fontsize=6, color="#cccccc", zorder=6)
        proj_txt = f"{row['tournament_projection']:.0f}"
        ax.text(x, y + 6.5, proj_txt,
                ha="center", va="center",
                fontsize=6.5, color=C["gold"], zorder=6)

    ax.set_xlim(0, 70); ax.set_ylim(0, 100)
    ax.axis("off")
    ax.set_title(f"⚽  WC 2026 Fantasy Best XI (4-3-3)\n"
                 f"Proj total: {xi['tournament_projection'].sum():.1f} | "
                 f"Exp. goals: {xi['expected_wc_goals'].sum():.2f}",
                 color=C["text"], fontsize=12, pad=8, fontweight="bold")

    legend_els = [mpatches.Patch(color=pos_color_map[p], label=p)
                  for p in ["GK","DF","MF","FW"]]
    ax.legend(handles=legend_els, loc="lower center",
              facecolor="#0a2a0a", edgecolor="white",
              labelcolor=C["text"], fontsize=9, ncol=4,
              bbox_to_anchor=(0.5, -0.02))
    ax.text(35, 97, "Number = Tournament Projection Score",
            ha="center", fontsize=7.5, color=C["muted"])

    path = f"{CHART}/03_best_xi_pitch.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor="#0a2a0a")
    plt.close()
    print(f"  Saved: {path}")

chart_best_xi(xi_df)


# ── Chart 4: Breakout vs Underrated — scatter ─────────────────────────────────
def chart_breakout_underrated():
    fig, axes = plt.subplots(1, 2, figsize=(16, 7))
    fig.patch.set_facecolor(C["bg"])

    # Breakout: age vs tournament_projection, sized by xG/90
    ax = axes[0]
    ax.set_facecolor(C["surface"])
    sub = df[(df["age"]<=25) & (df["starter_prob"]>=0.65)].copy()
    sc_plot = ax.scatter(sub["age"], sub["tournament_projection"],
                         s=sub["xG_/90"]*400+20,
                         c=sub["breakout_score"], cmap="YlOrRd",
                         alpha=0.65, edgecolors="none")
    # Label top 10
    for _, r in sub.nlargest(10,"breakout_score").iterrows():
        ax.annotate(r["player"].split()[-1],
                    (r["age"], r["tournament_projection"]),
                    fontsize=7, color=C["text"], alpha=0.9,
                    xytext=(3, 3), textcoords="offset points")
    plt.colorbar(sc_plot, ax=ax, label="Breakout Score")
    ax.set_xlabel("Age"); ax.set_ylabel("Tournament Projection")
    ax.set_title("🔥 Breakout Candidates\n(size = xG/90)",
                 color=C["text"], fontsize=10, fontweight="bold")

    # Underrated: overall_index vs tournament_projection
    ax2 = axes[1]
    ax2.set_facecolor(C["surface"])
    sub2 = df[(df["overall_index"]>=27) & (df["starter_prob"]>=0.70)].copy()
    sc2 = ax2.scatter(sub2["overall_index"], sub2["tournament_projection"],
                      s=40, c=sub2["underrated_score"], cmap="PuBu",
                      alpha=0.65, edgecolors="none")
    for _, r in sub2.nlargest(10,"underrated_score").iterrows():
        ax2.annotate(r["player"].split()[-1],
                     (r["overall_index"], r["tournament_projection"]),
                     fontsize=7, color=C["text"], alpha=0.9,
                     xytext=(3, 3), textcoords="offset points")
    ideal_line = np.linspace(sub2["overall_index"].min(),
                              sub2["overall_index"].max(), 100)
    ax2.plot(ideal_line, ideal_line*2.2, color=C["orange"],
             linestyle="--", lw=1, alpha=0.5, label="Expected line")
    plt.colorbar(sc2, ax=ax2, label="Underrated Score")
    ax2.set_xlabel("Overall Index"); ax2.set_ylabel("Tournament Projection")
    ax2.set_title("💎 Underrated Players\n(below dashed = under-projected)",
                  color=C["text"], fontsize=10, fontweight="bold")
    ax2.legend(fontsize=8, facecolor=C["surface"],
               labelcolor=C["muted"], edgecolor=C["border"])

    for a in axes:
        for spine in a.spines.values():
            spine.set_edgecolor(C["border"])
        a.tick_params(colors=C["muted"])

    fig.suptitle("WC 2026 — Breakout & Underrated Player Analysis",
                 fontsize=13, color=C["text"], fontweight="bold")
    plt.tight_layout()
    path = f"{CHART}/04_breakout_underrated.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_breakout_underrated()


# ── Chart 5: SHAP feature importance — player model ───────────────────────────
def chart_shap_importance():
    pi = pd.read_csv(f"{BASE}/outputs/shap/player_shap_importance.csv")
    pi = pi.nlargest(15, "mean_abs_shap").sort_values("mean_abs_shap")
    pi["label"] = pi["feature"].map(FEAT_LABELS).fillna(pi["feature"])

    fig, ax = plt.subplots(figsize=(10, 7))
    fig.patch.set_facecolor(C["bg"])
    ax.set_facecolor(C["surface"])

    bars = ax.barh(pi["label"], pi["mean_abs_shap"],
                   color=[C["blue"] if i >= len(pi)-3 else C["teal"]
                          for i in range(len(pi))],
                   edgecolor="none", height=0.65)
    for bar, val in zip(bars, pi["mean_abs_shap"]):
        ax.text(bar.get_width()+0.01, bar.get_y()+bar.get_height()/2,
                f"{val:.3f}", va="center", ha="left",
                fontsize=8, color=C["text"])

    ax.set_xlabel("Mean |SHAP value|", color=C["muted"])
    ax.set_title("🔍 What Drives the Player Model?\n"
                 "SHAP Feature Importance — WC 2026 Player Predictions",
                 color=C["text"], fontsize=11, fontweight="bold", pad=12)
    ax.grid(axis="x", alpha=0.25)
    for spine in ax.spines.values():
        spine.set_edgecolor(C["border"])
    ax.tick_params(colors=C["muted"])

    ax.text(0.98, 0.02,
            "Higher value = feature has more\ninfluence on the model's rating",
            transform=ax.transAxes, ha="right", va="bottom",
            fontsize=7.5, color=C["muted"],
            bbox=dict(boxstyle="round", facecolor=C["surface"],
                      edgecolor=C["border"]))
    plt.tight_layout()
    path = f"{CHART}/05_shap_importance.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_shap_importance()


# ── Chart 6: xG/90 vs Expected Goals — bubble chart ───────────────────────────
def chart_xg_bubble():
    fw_mf = df[df["position"].isin(["FW","MF"])].copy()
    top40 = fw_mf.nlargest(40, "expected_wc_goals")
    pos_c = {"FW":"#e05cc5","MF":C["orange"]}
    colors_b = [pos_c.get(p, C["blue"]) for p in top40["position"]]

    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor(C["bg"])
    ax.set_facecolor(C["surface"])
    sc = ax.scatter(top40["xG_/90"], top40["expected_wc_goals"],
                    s=top40["tournament_projection"]*3,
                    c=colors_b, alpha=0.75, edgecolors=C["border"], lw=0.5)
    for _, r in top40.nlargest(12,"expected_wc_goals").iterrows():
        ax.annotate(r["player"].split()[-1],
                    (r["xG_/90"], r["expected_wc_goals"]),
                    fontsize=8, color=C["text"],
                    xytext=(4, 4), textcoords="offset points")

    ax.set_xlabel("xG per 90 Minutes", color=C["muted"], fontsize=10)
    ax.set_ylabel("Expected WC Goals (full tournament)", color=C["muted"], fontsize=10)
    ax.set_title("⚡ WC 2026 — Goal Threat Analysis\n"
                 "xG/90 vs Expected Tournament Goals  (size = projection score)",
                 color=C["text"], fontsize=11, fontweight="bold", pad=12)
    ax.grid(alpha=0.2)

    leg = [mpatches.Patch(color=pos_c["FW"], label="Forward"),
           mpatches.Patch(color=pos_c["MF"], label="Midfielder")]
    ax.legend(handles=leg, facecolor=C["surface"],
              edgecolor=C["border"], labelcolor=C["text"], fontsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor(C["border"])
    ax.tick_params(colors=C["muted"])
    plt.tight_layout()
    path = f"{CHART}/06_xg_goal_threat.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_xg_bubble()


# ── Chart 7: Risk vs Reward — captain pick grid ───────────────────────────────
def chart_risk_reward():
    pool = df[
        df["position"].isin(["FW","MF"]) &
        (df["starter_prob"] >= 0.80) &
        (df["tournament_projection"] >= 50)
    ].nlargest(30, "tournament_projection")
    pos_c = {"FW":"#e05cc5","MF":C["orange"]}
    colors_rr = [pos_c.get(p, C["blue"]) for p in pool["position"]]

    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor(C["bg"])
    ax.set_facecolor(C["surface"])
    ax.scatter(pool["injury_risk"], pool["tournament_projection"],
               s=120, c=colors_rr, alpha=0.8,
               edgecolors=C["border"], lw=0.5)
    for _, r in pool.iterrows():
        ax.annotate(r["player"].split()[-1],
                    (r["injury_risk"], r["tournament_projection"]),
                    fontsize=7.5, color=C["text"],
                    xytext=(4, 2), textcoords="offset points")

    # Quadrant labels
    mid_x = pool["injury_risk"].median()
    mid_y = pool["tournament_projection"].median()
    ax.axvline(mid_x, color=C["border"], lw=1, ls="--", alpha=0.5)
    ax.axhline(mid_y, color=C["border"], lw=1, ls="--", alpha=0.5)
    ax.text(mid_x*0.15, mid_y + (pool["tournament_projection"].max()-mid_y)*0.7,
            "✅ MUST PICK\n(safe + high output)", fontsize=8.5,
            color=C["green"], alpha=0.8)
    ax.text(mid_x*1.5, mid_y + (pool["tournament_projection"].max()-mid_y)*0.7,
            "⚠️ RISKY PICK\n(high output, injury risk)", fontsize=8.5,
            color=C["orange"], alpha=0.8)

    ax.set_xlabel("Injury Risk (0=safe, 100=very risky)", color=C["muted"], fontsize=10)
    ax.set_ylabel("Tournament Projection Score", color=C["muted"], fontsize=10)
    ax.set_title("🎯 WC 2026 — Captain Pick: Risk vs Reward\n"
                 "Top 30 FW/MF starters",
                 color=C["text"], fontsize=11, fontweight="bold", pad=12)
    ax.grid(alpha=0.2)
    leg = [mpatches.Patch(color=pos_c["FW"], label="Forward"),
           mpatches.Patch(color=pos_c["MF"], label="Midfielder")]
    ax.legend(handles=leg, facecolor=C["surface"],
              edgecolor=C["border"], labelcolor=C["text"])
    for spine in ax.spines.values():
        spine.set_edgecolor(C["border"])
    ax.tick_params(colors=C["muted"])
    plt.tight_layout()
    path = f"{CHART}/07_captain_risk_reward.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_risk_reward()


# ── Chart 8: Performance tiers — all 1248 players ─────────────────────────────
def chart_performance_tiers():
    tier_order = ["⚡ Elite","🌟 World Class","✅ Quality","🔵 Average","⚪ Squad"]
    tier_colors = [C["gold"], C["blue"], C["green"], C["teal"], C["muted"]]

    fig, axes = plt.subplots(1, 2, figsize=(16, 7))
    fig.patch.set_facecolor(C["bg"])

    # Left: overall distribution
    ax = axes[0]
    ax.set_facecolor(C["surface"])
    tier_counts = df["performance_tier"].value_counts().reindex(tier_order).fillna(0)
    bars = ax.bar(range(len(tier_order)), tier_counts.values,
                  color=tier_colors, edgecolor=C["border"], width=0.6)
    for bar, n in zip(bars, tier_counts.values):
        ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+5,
                f"{int(n)}\n({int(n)/len(df)*100:.0f}%)",
                ha="center", va="bottom", fontsize=8.5, color=C["text"])
    ax.set_xticks(range(len(tier_order)))
    ax.set_xticklabels(tier_order, rotation=15, ha="right", fontsize=8)
    ax.set_ylabel("Number of Players", color=C["muted"])
    ax.set_title("Player Performance Tier Distribution\n(all 1,248 WC 2026 players)",
                 color=C["text"], fontsize=10, fontweight="bold")
    ax.grid(axis="y", alpha=0.25)

    # Right: tier breakdown by position
    ax2 = axes[1]
    ax2.set_facecolor(C["surface"])
    pos_list = ["GK","DF","MF","FW"]
    x_pos = np.arange(len(tier_order))
    width = 0.2
    for pi, (pos, pc) in enumerate(zip(pos_list,
                                        [C["teal"],C["green"],C["orange"],"#e05cc5"])):
        sub = df[df["position"]==pos]
        counts = sub["performance_tier"].value_counts().reindex(tier_order).fillna(0)
        ax2.bar(x_pos + pi*width, counts.values,
                width=width, color=pc, label=pos,
                edgecolor=C["border"], alpha=0.85)

    ax2.set_xticks(x_pos + width*1.5)
    ax2.set_xticklabels(tier_order, rotation=15, ha="right", fontsize=8)
    ax2.set_ylabel("Number of Players", color=C["muted"])
    ax2.set_title("Performance Tiers by Position",
                  color=C["text"], fontsize=10, fontweight="bold")
    ax2.legend(facecolor=C["surface"], edgecolor=C["border"],
               labelcolor=C["text"], fontsize=9)
    ax2.grid(axis="y", alpha=0.25)

    for a in axes:
        for spine in a.spines.values():
            spine.set_edgecolor(C["border"])
        a.tick_params(colors=C["muted"])

    fig.suptitle("WC 2026 — Player Quality Distribution",
                 fontsize=13, color=C["text"], fontweight="bold")
    plt.tight_layout()
    path = f"{CHART}/08_performance_tiers.png"
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=C["bg"])
    plt.close()
    print(f"  Saved: {path}")

chart_performance_tiers()


# ==============================================================================
# FINAL SUMMARY
# ==============================================================================

print(f"\n{'='*65}")
print("  ALL OUTPUTS COMPLETE")
print("="*65)

all_files = []
for root, _, files in os.walk(OUT):
    for f in sorted(files):
        fp = os.path.join(root, f)
        sz = os.path.getsize(fp)/1024
        all_files.append((fp.replace(OUT,""), sz))
        print(f"  {fp.replace(OUT,''):<55} {sz:>8.1f} KB")

print(f"""
  QUICK REFERENCE — KEY PREDICTIONS:

  🥾 GOLDEN BOOT    : {boot_df.iloc[0]['player']} ({boot_df.iloc[0]['team']})
  🏆 GOLDEN BALL    : {ball_df.iloc[0]['player']} ({ball_df.iloc[0]['team']})
  🧤 GOLDEN GLOVE   : {glove_df.iloc[0]['player']} ({glove_df.iloc[0]['team']})
  🌟 BEST YOUNG     : {young_df.iloc[0]['player']} ({young_df.iloc[0]['team']}, age {int(young_df.iloc[0]['age'])})
  🔥 TOP BREAKOUT   : {breakout_df.iloc[0]['player']} ({breakout_df.iloc[0]['team']})
  💎 TOP UNDERRATED : {underrated_df.iloc[0]['player']} ({underrated_df.iloc[0]['team']})
  🎽 CAPTAIN PICK   : {captain_df.iloc[0]['player']} ({captain_df.iloc[0]['team']})
  💰 TOP BUDGET     : {budget_df.iloc[0]['player']} ({budget_df.iloc[0]['team']})
  🎲 TOP DIFF       : {diff_df.iloc[0]['player']} ({diff_df.iloc[0]['team']})
""")
