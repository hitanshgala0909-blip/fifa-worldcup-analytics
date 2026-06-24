"""
Data loader for WC 2026 Intelligence Platform.
Tries to load real model outputs and CSVs; falls back to realistic demo data.
"""
import os
import json
import numpy as np
import pandas as pd
import streamlit as st

# ── Path resolution ────────────────────────────────────────────────────────────
BASE_DIR    = os.environ.get("WC2026_BASE_DIR", os.path.dirname(os.path.dirname(__file__)))
DATA_DIR    = os.path.join(BASE_DIR, "data")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR  = os.path.join(BASE_DIR, "models")

# ── WC 2026 Teams ─────────────────────────────────────────────────────────────
WC26_GROUPS = {
    "A": ["USA",       "Panama",      "Uruguay",     "Bolivia"],
    "B": ["Mexico",    "Jamaica",     "Venezuela",   "New Zealand"],
    "C": ["Canada",    "Honduras",    "Peru",        "Morocco"],
    "D": ["Brazil",    "Colombia",    "Paraguay",    "Egypt"],
    "E": ["Argentina", "Chile",       "Ecuador",     "Albania"],
    "F": ["Spain",     "Portugal",    "Poland",      "Cameroon"],
    "G": ["England",   "France",      "Netherlands", "Senegal"],
    "H": ["Germany",   "Belgium",     "Croatia",     "South Korea"],
    "I": ["Italy",     "Switzerland", "Austria",     "Qatar"],
    "J": ["Japan",     "Australia",   "Iran",        "Tunisia"],
    "K": ["Serbia",    "Czechia",     "Denmark",     "Saudi Arabia"],
    "L": ["Nigeria",   "South Africa","Curacao",     "Togo"],
}

ALL_TEAMS = [t for teams in WC26_GROUPS.values() for t in teams]

# ── ELO ratings (realistic for WC 2026 era) ───────────────────────────────────
ELO_BASE = {
    "France":       2086, "Brazil":      2077, "England":     2072,
    "Spain":        2068, "Argentina":   2064, "Germany":     2055,
    "Portugal":     2051, "Netherlands": 2044, "Belgium":     2038,
    "Italy":        2031, "Denmark":     2018, "Croatia":     2012,
    "Uruguay":      2005, "USA":         1998, "Colombia":    1995,
    "Japan":        1988, "Mexico":      1981, "Switzerland": 1978,
    "Senegal":      1971, "Morocco":     1968, "Poland":      1962,
    "Australia":    1955, "Serbia":      1951, "South Korea": 1944,
    "Ecuador":      1937, "Peru":        1931, "Czechia":     1924,
    "Iran":         1918, "Nigeria":     1912, "Chile":       1908,
    "Canada":       1903, "Austria":     1897, "Paraguay":    1891,
    "Venezuela":    1883, "Tunisia":     1877, "Cameroon":    1871,
    "Saudi Arabia": 1864, "Honduras":    1851, "Egypt":       1847,
    "Albania":      1842, "South Africa":1836, "New Zealand": 1824,
    "Jamaica":      1818, "Panama":      1815, "Qatar":       1808,
    "Bolivia":      1798, "Togo":        1791, "Curacao":     1784,
}


def _csv(path: str) -> pd.DataFrame | None:
    """Load a CSV if it exists."""
    if os.path.exists(path):
        return pd.read_csv(path)
    return None


# ── DEMO DATA GENERATORS ───────────────────────────────────────────────────────

def _demo_elo() -> pd.DataFrame:
    rows = []
    for rank, (team, elo) in enumerate(sorted(ELO_BASE.items(), key=lambda x: -x[1]), 1):
        group = next((g for g, t in WC26_GROUPS.items() if team in t), "?")
        rows.append({"elo_rank": rank, "team": team, "elo": elo, "group": group})
    return pd.DataFrame(rows)


def _demo_power_rankings() -> pd.DataFrame:
    rng = np.random.default_rng(42)
    rows = []
    for rank, (team, elo) in enumerate(sorted(ELO_BASE.items(), key=lambda x: -x[1]), 1):
        group = next((g for g, t in WC26_GROUPS.items() if team in t), "?")
        squad_idx = round(elo / 2100 * 85 + rng.uniform(-3, 3), 1)
        xg        = round(1.4 + (elo - 1784) / 302 * 0.8 + rng.uniform(-0.1, 0.1), 2)
        form      = round(60 + (elo - 1784) / 302 * 30 + rng.uniform(-5, 5), 1)
        power     = round((elo / 2086 * 50) + (squad_idx / 85 * 30) + (form / 100 * 20), 2)
        rows.append({
            "power_rank": rank, "team": team, "group": group,
            "power_score": power, "elo": elo, "squad_index": squad_idx,
            "team_xg": xg, "avg_form": form, "fifa_rank": rank + rng.integers(-2, 3),
        })
    return pd.DataFrame(rows)


def _demo_simulation() -> pd.DataFrame:
    rng = np.random.default_rng(7)
    rows = []
    elo_sorted = sorted(ELO_BASE.items(), key=lambda x: -x[1])
    for rank, (team, elo) in enumerate(elo_sorted, 1):
        group = next((g for g, t in WC26_GROUPS.items() if team in t), "?")
        strength = (elo - 1784) / (2086 - 1784)
        p_win    = round(max(0.001, min(0.35, 0.12 * strength**1.8 + rng.uniform(-0.01, 0.01))), 4)
        p_ru     = round(max(0.002, min(0.45, 0.18 * strength**1.5 + rng.uniform(-0.01, 0.01))), 4)
        p_sf     = round(max(0.01, min(0.55,  0.28 * strength**1.2 + rng.uniform(-0.02, 0.02))), 4)
        p_qf     = round(max(0.02, min(0.70,  0.42 * strength**1.0 + rng.uniform(-0.02, 0.02))), 4)
        p_r16    = round(max(0.05, min(0.85,  0.62 * strength**0.8 + rng.uniform(-0.03, 0.03))), 4)
        p_r32    = round(max(0.10, min(0.95,  0.80 * strength**0.6 + rng.uniform(-0.03, 0.03))), 4)
        p_group  = round(1 - p_r32 * 0.1, 4)
        rows.append({
            "sim_rank": rank, "team": team, "group": group,
            "p_group_stage": p_group, "p_r32": p_r32, "p_r16": p_r16,
            "p_qf": p_qf, "p_sf": p_sf, "p_runner_up": p_ru, "p_winner": p_win,
            "reach_r32_pct":       round(p_r32 * 100, 1),
            "reach_r16_pct":       round(p_r16 * 100, 1),
            "reach_qf_pct":        round(p_qf * 100, 1),
            "reach_sf_pct":        round(p_sf * 100, 1),
            "reach_runner_up_pct": round(p_ru * 100, 1),
            "reach_winner_pct":    round(p_win * 100, 1),
        })
    return pd.DataFrame(rows)


def _demo_players() -> pd.DataFrame:
    rng = np.random.default_rng(13)
    squads = {
        "France":       ["Mbappé",    "Griezmann", "Dembélé",   "Kanté",    "Camavinga", "Tchouaméni", "Theo Hernández", "Upamecano", "Saliba", "Lloris",    "Camara"],
        "Brazil":       ["Vinicius",  "Rodrygo",   "Raphinha",   "Casemiro", "Bruno Guim","Endrick",    "Militão",        "Marquinhos","Gabriel Silva","Alisson","Gerson"],
        "England":      ["Bellingham","Saka",      "Foden",      "Alexander-Arnold","Rice","Gallagher","Trippier",       "Stones",   "Maguire",  "Pickford",  "Rashford"],
        "Spain":        ["Pedri",     "Yamal",     "Morata",     "Rodri",    "Gavi",      "Williams",   "Carvajal",       "Le Normand","Laporte",  "Unai Simón","Joselu"],
        "Argentina":    ["Messi",     "Di María",  "Lautaro",    "Mac Allister","De Paul","Fernández","Molina",         "Romero",   "Otamendi", "Martínez",  "Almada"],
        "Germany":      ["Müller",    "Musiala",   "Wirtz",      "Kimmich",  "Kroos",     "Gnabry",     "Kimmich",        "Rüdiger",  "Schlotterbeck","Neuer", "Hofmann"],
        "Portugal":     ["Ronaldo",   "Leão",      "B. Fernandes","Vitinha",  "Neves",     "Conceiçao",  "Cancelo",        "Pepe",     "Dias",     "Costa",     "André"],
        "Netherlands":  ["van Dijk",  "Dumfries",  "Gakpo",      "de Jong",  "Reijnders", "Simons",     "Ake",            "De Ligt",  "Frimpong", "Flekken",   "Depay"],
        "Belgium":      ["De Bruyne", "Lukaku",    "Doku",       "Tielemans","Vanaken",   "Castagne",   "Vertonghen",     "Faes",     "Debast",   "Casteels",  "Onana"],
        "Italy":        ["Chiesa",    "Barella",   "Verratti",   "Donnarumma","Jorginho",  "Pellegrini", "Di Lorenzo",     "Bastoni",  "Acerbi",   "Mancini",   "Raspadori"],
        "Denmark":      ["Eriksen",   "Dolberg",   "Maehle",     "Hojbjerg", "Skov Olsen","Lindstrom",  "Andersen",       "Christensen","Vestergaard","Schmeichel","Wind"],
        "Croatia":      ["Modric",    "Kovacic",   "Brozovic",   "Perisic",  "Kramaric",  "Sucic",      "Sosa",           "Gvardiol", "Vida",     "Livakovic",  "Budimir"],
        "Uruguay":      ["Suárez",    "Cavani",    "Valverde",   "Bentancur","Ugarte",    "Araújo",     "Vina",           "Godín",    "Giménez",  "Olivera",   "Núñez"],
        "USA":          ["Pulisic",   "Reyna",     "McKennie",   "Adams",    "Musah",     "Weah",       "Dest",           "Richards", "Zimmerman","Turner",    "Balogun"],
        "Colombia":     ["James",     "Díaz",      "Falcao",     "Arias",    "Lerma",     "Cuadrado",   "Mojica",         "Sánchez",  "Dávinson", "Vargas",    "Córdoba"],
        "Japan":        ["Minamino",  "Doan",      "Kamada",     "Endo",     "Tanaka",    "Saito",      "Nagatomo",       "Yoshida",  "Itakura",  "Gonda",     "Suzuki"],
        "Morocco":      ["Hakimi",    "Ziyech",    "En-Nesyri",  "Amrabat",  "Ounahi",    "Boufal",     "Mazraoui",       "Saiss",    "Dari",     "Bounou",    "Sabiri"],
        "Mexico":       ["Lozano",    "Vega",      "Guardado",   "Herrera",  "Tecatito",  "Jiménez",    "Gallardo",       "Moreno",   "Sánchez",  "Ochoa",     "Antuna"],
        "Switzerland":  ["Shaqiri",   "Seferovic", "Zakaria",    "Xhaka",    "Ndoye",     "Zeqiri",     "Widmer",         "Akanji",   "Elvedi",   "Sommer",    "Vargas"],
        "Senegal":      ["Mané",      "Dia",       "Gueye",      "Sarr",     "Kouyaté",   "Diatta",     "Sabaly",         "Koulibaly","Nianzou",  "Mendy",     "Diedhiou"],
    }

    positions = {
        "GK": 1, "DF": 4, "MF": 5, "FW": 3,
    }
    pos_list  = ["GK","DF","DF","DF","DF","MF","MF","MF","MF","FW","FW"]
    clubs_by_pos = {
        "GK": ["PSG","Bayern","Arsenal","Chelsea","Milan","Juventus","Man City","Atletico","Real Madrid","Barca"],
        "DF": ["Real Madrid","Bayern","Arsenal","Chelsea","Liverpool","Man City","PSG","Juventus","Atletico","Barca"],
        "MF": ["Man City","Real Madrid","Bayern","PSG","Liverpool","Arsenal","Juventus","Chelsea","Barca","Atletico"],
        "FW": ["PSG","Man City","Real Madrid","Arsenal","Chelsea","Liverpool","Bayern","Atletico","Juventus","Barca"],
    }

    rows = []
    overall_rank = 1
    for team, players in squads.items():
        group = next((g for g, t in WC26_GROUPS.items() if team in t), "A")
        elo   = ELO_BASE.get(team, 1900)
        strength = (elo - 1784) / (2086 - 1784)
        for i, player in enumerate(players):
            pos = pos_list[i % len(pos_list)]
            age = int(rng.integers(20, 35))
            base_ovr = 60 + strength * 30 + rng.uniform(-5, 5)
            ovr  = round(min(99, max(50, base_ovr - i * 1.5 + rng.uniform(-2, 2))), 1)
            form = round(max(40, min(99, ovr - 10 + rng.uniform(-10, 10))), 1)
            xg90 = round(max(0, (0.3 if pos == "FW" else 0.1 if pos == "MF" else 0.02) + rng.uniform(-0.05, 0.15)), 2)
            xa90 = round(max(0, (0.15 if pos in ["MF","FW"] else 0.05) + rng.uniform(-0.03, 0.1)), 2)
            starter = round(max(0.3, min(1.0, 0.9 - i * 0.05 + rng.uniform(-0.05, 0.05))), 2)
            r16 = round(max(0.1, min(0.9, 0.4 + strength * 0.5 + rng.uniform(-0.05, 0.05))), 2)
            rows.append({
                "overall_rank": overall_rank,
                "player": player,
                "team": team,
                "group": group,
                "position": pos,
                "club": rng.choice(clubs_by_pos[pos]),
                "age": age,
                "overall_index": ovr,
                "form_score": form,
                "recent_rating": round(ovr / 10 + rng.uniform(-0.3, 0.3), 1),
                "xG_/90": xg90,
                "xA_/90": xa90,
                "starter_prob": starter,
                "team_r16_prob": r16,
                "fitness": round(rng.uniform(75, 99), 1),
                "injury_risk": round(rng.uniform(5, 35), 1),
                "caps": int(rng.integers(10, 120)),
                "wc_goals": int(rng.integers(0, 6)),
                "tournament_projection": round(ovr * starter * 0.9 + rng.uniform(-3, 3), 1),
                "expected_wc_goals":   round(xg90 * starter * (3 + r16 * 2) * 0.82, 2),
                "expected_wc_assists": round(xa90 * starter * (3 + r16 * 2) * 0.78, 2),
                "pos_fantasy_score":   round(ovr * 0.4 + form * 0.3 + xg90 * 100 * 0.2 + starter * 10, 2),
                "captain_score":       round(ovr * 0.5 + form * 0.3 + starter * 20, 2),
                "value_score":         round((ovr + form) / 2 + rng.uniform(-5, 5), 2),
                "squad_rank":          i + 1,
                "performance_tier":    "⚡ Elite" if ovr >= 85 else "🌟 World Class" if ovr >= 75 else "✅ Quality" if ovr >= 65 else "🔵 Average",
                "conversion_rate":     round(rng.uniform(0.10, 0.35) if pos == "FW" else rng.uniform(0.05, 0.20), 2),
                "golden_boot_score":   round(xg90 * 100 + (0.3 if pos == "FW" else 0.1) * 30 + r16 * 20 + form / 9 * 15, 2) if pos in ["FW","MF"] else 0,
                "golden_ball_score":   round(ovr * 0.6 + form * 0.2 + r16 * 20, 2),
                "best_young_score":    round(ovr + form / 2, 2) if age <= 23 else 0,
                "differential_score":  round(form * 0.4 + (1 - starter) * 30 + rng.uniform(0, 10), 2),
            })
            overall_rank += 1

    # Fill to ~200 players with generic data
    extra_teams = [t for t in ALL_TEAMS if t not in squads]
    for team in extra_teams:
        group = next((g for g, t in WC26_GROUPS.items() if team in t), "A")
        elo   = ELO_BASE.get(team, 1850)
        strength = (elo - 1784) / (2086 - 1784)
        for i in range(11):
            pos = pos_list[i % len(pos_list)]
            age = int(rng.integers(20, 35))
            ovr  = round(min(85, max(50, 50 + strength * 25 + rng.uniform(-5, 5) - i * 1.0)), 1)
            form = round(max(40, min(85, ovr - 10 + rng.uniform(-8, 8))), 1)
            xg90 = round(max(0, (0.2 if pos == "FW" else 0.07 if pos == "MF" else 0.01) + rng.uniform(-0.03, 0.1)), 2)
            xa90 = round(max(0, (0.1 if pos in ["MF","FW"] else 0.03) + rng.uniform(-0.02, 0.08)), 2)
            starter = round(max(0.3, min(1.0, 0.85 - i * 0.04)), 2)
            r16 = round(max(0.05, min(0.7, 0.3 + strength * 0.4)), 2)
            rows.append({
                "overall_rank": overall_rank,
                "player": f"Player {overall_rank}",
                "team": team,
                "group": group,
                "position": pos,
                "club": rng.choice(["Domestic Club A","Domestic Club B","International Club"]),
                "age": age,
                "overall_index": ovr,
                "form_score": form,
                "recent_rating": round(ovr / 10 + rng.uniform(-0.2, 0.2), 1),
                "xG_/90": xg90,
                "xA_/90": xa90,
                "starter_prob": starter,
                "team_r16_prob": r16,
                "fitness": round(rng.uniform(72, 98), 1),
                "injury_risk": round(rng.uniform(5, 40), 1),
                "caps": int(rng.integers(5, 80)),
                "wc_goals": int(rng.integers(0, 3)),
                "tournament_projection": round(ovr * starter * 0.85, 1),
                "expected_wc_goals":   round(xg90 * starter * (3 + r16 * 2) * 0.82, 2),
                "expected_wc_assists": round(xa90 * starter * (3 + r16 * 2) * 0.78, 2),
                "pos_fantasy_score":   round(ovr * 0.4 + form * 0.3 + xg90 * 100 * 0.2 + starter * 10, 2),
                "captain_score":       round(ovr * 0.5 + form * 0.3 + starter * 20, 2),
                "value_score":         round((ovr + form) / 2 + rng.uniform(-5, 5), 2),
                "squad_rank":          i + 1,
                "performance_tier":    "✅ Quality" if ovr >= 65 else "🔵 Average",
                "conversion_rate":     round(rng.uniform(0.08, 0.25), 2),
                "golden_boot_score":   round(xg90 * 100, 2) if pos in ["FW","MF"] else 0,
                "golden_ball_score":   round(ovr * 0.5 + form * 0.2, 2),
                "best_young_score":    round(ovr + form / 2, 2) if age <= 23 else 0,
                "differential_score":  round(form * 0.3 + rng.uniform(0, 8), 2),
            })
            overall_rank += 1

    return pd.DataFrame(rows)


def _demo_group_predictions() -> pd.DataFrame:
    rng = np.random.default_rng(3)
    rows = []
    matchday = 1
    for group, teams in WC26_GROUPS.items():
        pairs = [(0,1),(2,3),(0,2),(1,3),(0,3),(1,2)]
        for md, (i, j) in enumerate(pairs, 1):
            ta, tb = teams[i], teams[j]
            ea, eb = ELO_BASE[ta], ELO_BASE[tb]
            gap = ea - eb
            exp = 1 / (1 + 10 ** (-gap / 400))
            pa = round(min(0.78, max(0.10, exp * 0.65 + 0.08 + rng.uniform(-0.03, 0.03))), 3)
            pd_ = round(max(0.12, 0.28 - abs(gap) / 3000 + rng.uniform(-0.02, 0.02)), 3)
            pb = round(max(0.10, 1 - pa - pd_), 3)
            s = pa + pd_ + pb
            pa, pd_, pb = round(pa/s,3), round(pd_/s,3), round(pb/s,3)
            rows.append({
                "group": group, "matchday": md,
                "team_a": ta, "team_b": tb,
                "elo_a": ea, "elo_b": eb,
                "elo_gap": abs(gap),
                "p_a_win": pa, "p_draw": pd_, "p_b_win": pb,
                "predicted_winner": ta if pa > pb else ("Draw" if pd_ > max(pa,pb) else tb),
                "confidence": round(max(pa, pb), 3),
                "upset_probability": round(min(pa, pb), 3),
            })
    return pd.DataFrame(rows)


def _demo_bracket(round_name: str) -> pd.DataFrame:
    rng = np.random.default_rng(99)
    teams_by_strength = sorted(ELO_BASE.items(), key=lambda x: -x[1])
    n_matches = {"round_of_32": 16, "round_of_16": 8, "quarterfinals": 4, "semifinals": 2, "final": 1}
    n = n_matches.get(round_name, 8)
    used = set()
    rows = []
    pool = [t for t,_ in teams_by_strength]
    for i in range(n):
        idx_a = (i * 2) % len(pool)
        idx_b = (i * 2 + 1) % len(pool)
        ta = pool[idx_a]
        tb = pool[idx_b]
        ea, eb = ELO_BASE[ta], ELO_BASE[tb]
        gap = abs(ea - eb)
        exp = 1 / (1 + 10 ** (-(ea - eb) / 400))
        pa = round(min(0.78, max(0.10, exp * 0.6 + 0.1)), 3)
        pd_ = round(max(0.12, 0.25 - gap / 4000), 3)
        pb = round(max(0.10, 1 - pa - pd_), 3)
        rows.append({
            "round": round_name, "match": i + 1,
            "team_a": ta, "team_b": tb,
            "elo_a": ea, "elo_b": eb,
            "p_a_win": pa, "p_draw": pd_, "p_b_win": pb,
            "predicted_winner": ta if pa > pb else tb,
            "upset_probability": round(min(pa, pb), 3),
        })
    return pd.DataFrame(rows)


def _demo_fantasy() -> dict[str, pd.DataFrame]:
    players = _demo_players()
    best_xi = (
        players.sort_values("pos_fantasy_score", ascending=False)
        .groupby("position", group_keys=False)
        .apply(lambda g: g.head({"GK":1,"DF":4,"MF":3,"FW":3}.get(g.name, 3)))
        .reset_index(drop=True)
    )
    captain = players.sort_values("captain_score", ascending=False).head(10)
    budget  = players[players["value_score"] < players["value_score"].quantile(0.4)].sort_values("pos_fantasy_score", ascending=False).head(15)
    diff    = players[players["starter_prob"] < 0.75].sort_values("differential_score", ascending=False).head(15)
    return {
        "best_xi": best_xi,
        "captain": captain,
        "budget":  budget,
        "differential": diff,
    }


# ── PUBLIC CACHED LOADERS ──────────────────────────────────────────────────────

@st.cache_data(ttl=3600, show_spinner=False)
def load_elo() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "elo_wc26_teams.csv")
    df = _csv(path)
    if df is not None and "team" in df.columns and "elo" in df.columns:
        if "group" not in df.columns:
            df["group"] = df["team"].map(
                {t: g for g, ts in WC26_GROUPS.items() for t in ts}
            )
        return df
    return _demo_elo()


@st.cache_data(ttl=3600, show_spinner=False)
def load_power_rankings() -> pd.DataFrame:
    path = os.path.join(OUTPUTS_DIR, "rankings", "wc2026_power_rankings.csv")
    df = _csv(path)
    if df is not None and len(df) >= 10:
        if "group" not in df.columns:
            df["group"] = df["team"].map(
                {t: g for g, ts in WC26_GROUPS.items() for t in ts}
            )
        return df
    return _demo_power_rankings()


@st.cache_data(ttl=3600, show_spinner=False)
def load_simulation() -> pd.DataFrame:
    path = os.path.join(OUTPUTS_DIR, "simulation", "wc2026_simulation_v3_calibrated.csv")
    df = _csv(path)
    if df is not None and len(df) >= 10:
        if "group" not in df.columns:
            df["group"] = df["team"].map(
                {t: g for g, ts in WC26_GROUPS.items() for t in ts}
            )
        return df
    return _demo_simulation()


@st.cache_data(ttl=3600, show_spinner=False)
def load_players() -> pd.DataFrame:
    path = os.path.join(OUTPUTS_DIR, "player_analytics", "enhanced",
                        "performance_scores_all_1248.csv")
    df = _csv(path)
    if df is not None and len(df) >= 100:
        return df
    return _demo_players()


@st.cache_data(ttl=3600, show_spinner=False)
def load_group_predictions() -> pd.DataFrame:
    path = os.path.join(OUTPUTS_DIR, "predictions",
                        "group_stage_predictions_calibrated.csv")
    df = _csv(path)
    if df is not None and len(df) >= 10:
        return df
    return _demo_group_predictions()


@st.cache_data(ttl=3600, show_spinner=False)
def load_bracket(round_name: str) -> pd.DataFrame:
    fname = {
        "round_of_32":  "round_of_32_calibrated.csv",
        "round_of_16":  "round_of_16_calibrated.csv",
        "quarterfinals":"quarter_finals_calibrated.csv",
        "semifinals":   "semi_finals_calibrated.csv",
        "final":        "final_calibrated.csv",
    }.get(round_name, f"{round_name}.csv")
    path = os.path.join(OUTPUTS_DIR, "bracket", fname)
    df = _csv(path)
    if df is not None and len(df) >= 1:
        return df
    return _demo_bracket(round_name)


@st.cache_data(ttl=3600, show_spinner=False)
def load_fantasy() -> dict:
    base = os.path.join(OUTPUTS_DIR, "player_analytics", "enhanced")
    keys = {
        "best_xi":      "fantasy_best_xi.csv",
        "captain":      "fantasy_captain.csv",
        "budget":       "fantasy_budget.csv",
        "differential": "fantasy_differential.csv",
    }
    result = {}
    all_found = True
    for key, fname in keys.items():
        df = _csv(os.path.join(base, fname))
        if df is not None:
            result[key] = df
        else:
            all_found = False
    if all_found:
        return result
    return _demo_fantasy()


def predict_match_live(team_a: str, team_b: str) -> dict:
    """
    Live prediction using saved models, or calibrated ELO fallback.
    """
    try:
        import joblib
        scaler = joblib.load(os.path.join(MODELS_DIR, "scaler_match_v2.pkl"))
        lr     = joblib.load(os.path.join(MODELS_DIR, "lr_match_v2.pkl"))

        elo = load_elo().set_index("team")["elo"].to_dict()
        ea  = elo.get(team_a, 1900)
        eb  = elo.get(team_b, 1900)
        gap = ea - eb
        exp_h = 1 / (1 + 10 ** (-gap / 400))

        # Minimal 17-feature vector (squad diffs zeroed)
        feat = np.array([[
            gap, exp_h, 0, 0, 0, 0, 4, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0
        ]])
        feat_s = scaler.transform(feat)
        probs  = lr.predict_proba(feat_s)[0]
        # class order: [away_win, draw, home_win]
        pa, pd_, pb = probs[2], probs[1], probs[0]
        return _calibrated(team_a, team_b, ea, eb, pa, pd_, pb)
    except Exception:
        return _elo_predict(team_a, team_b)


def _elo_predict(team_a: str, team_b: str) -> dict:
    elo = load_elo().set_index("team")["elo"].to_dict()
    ea  = elo.get(team_a, 1900)
    eb  = elo.get(team_b, 1900)
    gap = ea - eb
    exp_h = 1 / (1 + 10 ** (-gap / 400))
    pa = round(min(0.75, max(0.12, exp_h * 0.65 + 0.08)), 3)
    pd_ = round(max(0.12, 0.26 - abs(gap) / 3000), 3)
    pb = round(max(0.12, 1 - pa - pd_), 3)
    return _calibrated(team_a, team_b, ea, eb, pa, pd_, pb)


def _calibrated(ta, tb, ea, eb, pa, pd_, pb) -> dict:
    gap = abs(ea - eb)
    if gap < 50:    alpha, fav_p, draw_p, und_p = 0.35, 0.33, 0.28, 0.39
    elif gap < 100: alpha, fav_p, draw_p, und_p = 0.45, 0.47, 0.23, 0.30
    elif gap < 150: alpha, fav_p, draw_p, und_p = 0.55, 0.43, 0.23, 0.34
    elif gap < 200: alpha, fav_p, draw_p, und_p = 0.55, 0.44, 0.22, 0.34
    elif gap < 300: alpha, fav_p, draw_p, und_p = 0.65, 0.56, 0.16, 0.28
    else:           alpha, fav_p, draw_p, und_p = 0.70, 0.57, 0.13, 0.30

    if ea >= eb:
        pr_a = alpha * pa + (1 - alpha) * fav_p
        pr_d = alpha * pd_ + (1 - alpha) * draw_p
        pr_b = alpha * pb + (1 - alpha) * und_p
    else:
        pr_a = alpha * pa + (1 - alpha) * und_p
        pr_d = alpha * pd_ + (1 - alpha) * draw_p
        pr_b = alpha * pb + (1 - alpha) * fav_p

    pr_a = max(0.10, min(0.80, pr_a))
    pr_b = max(0.10, min(0.80, pr_b))
    pr_d = max(0.10, pr_d)
    s = pr_a + pr_d + pr_b
    pr_a, pr_d, pr_b = pr_a/s, pr_d/s, pr_b/s

    winner = ta if pr_a > pr_b else ("Draw" if pr_d > max(pr_a, pr_b) else tb)
    confidence = max(pr_a, pr_b)
    upset = min(pr_a, pr_b)

    return {
        "team_a": ta, "team_b": tb,
        "elo_a": ea, "elo_b": eb, "elo_gap": abs(ea - eb),
        "p_a_win": round(pr_a, 3), "p_draw": round(pr_d, 3), "p_b_win": round(pr_b, 3),
        "predicted_winner": winner,
        "confidence": round(confidence, 3),
        "upset_probability": round(upset, 3),
    }
