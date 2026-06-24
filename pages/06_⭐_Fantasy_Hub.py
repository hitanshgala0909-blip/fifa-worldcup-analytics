"""
Fantasy Hub — Best XI, captain picks, budget options, differential picks.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="Fantasy Hub · WC 2026", page_icon="⭐", layout="wide")
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
[data-testid="stMetricValue"]{font-size:1.3rem!important}
button[data-baseweb="tab"][aria-selected="true"]{border-bottom:2px solid #F0B429;color:#F0B429!important}
.pitch-card{background:#1A2633;border:1px solid #2A3A4A;border-radius:8px;padding:.7rem;text-align:center;}
</style>""", unsafe_allow_html=True)

from utils.data_loader import load_fantasy, load_players

st.markdown("# ⭐ Fantasy Hub")
st.caption("ML-powered fantasy recommendations · Best XI · Captains · Budget picks · Differentials")
st.divider()

@st.cache_data(show_spinner=False)
def get_fantasy():
    return load_fantasy()

@st.cache_data(show_spinner=False)
def get_players():
    return load_players()

fantasy  = get_fantasy()
players  = get_players()

tab1, tab2, tab3, tab4 = st.tabs(
    ["🏟 Best XI", "🎖 Captain Picks", "💰 Budget Picks", "🎯 Differential Picks"]
)

# ── Helpers ────────────────────────────────────────────────────────────────────
def player_card(name: str, team: str, pos: str, score: float, colour: str = "#F0B429") -> str:
    short_name = name.split()[-1] if " " in name else name
    return (
        f"<div class='pitch-card'>"
        f"<div style='font-size:1.4rem;'>{'🧤' if pos=='GK' else '🛡' if pos=='DF' else '⚙️' if pos=='MF' else '⚽'}</div>"
        f"<div style='color:{colour};font-weight:700;font-size:.82rem;'>{short_name}</div>"
        f"<div style='color:#8A9BAD;font-size:.72rem;'>{team}</div>"
        f"<div style='color:#E8EDF2;font-size:.75rem;margin-top:.2rem;'>{score:.0f} pts</div>"
        f"</div>"
    )


def picks_table(df: pd.DataFrame, score_col: str, title: str):
    st.subheader(title)
    if df.empty:
        st.info("No data available.")
        return

    # Top 3 podium
    top3 = df.sort_values(score_col, ascending=False).head(3)
    c1, c2, c3 = st.columns(3)
    icons = ["🥇", "🥈", "🥉"]
    for col, icon, (_, row) in zip([c1, c2, c3], icons, top3.iterrows()):
        col.markdown(
            f"<div style='background:#1A2633;border:1px solid #2A3A4A;border-radius:8px;"
            f"padding:1rem;text-align:center;'>"
            f"<div style='font-size:2rem;'>{icon}</div>"
            f"<div style='color:#F0B429;font-weight:700;'>{row['player']}</div>"
            f"<div style='color:#8A9BAD;font-size:.8rem;'>{row['team']} · {row['position']}</div>"
            f"<div style='color:#E8EDF2;margin-top:.4rem;'>{row[score_col]:.1f} pts</div>"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.markdown("")
    # Full table
    cols_show = ["player","team","group","position","age",score_col,
                 "overall_index","form_score","xG_/90","xA_/90",
                 "starter_prob","injury_risk","expected_wc_goals"]
    cols_show = [c for c in cols_show if c in df.columns]
    rename = {
        "player":"Player","team":"Team","group":"Grp","position":"Pos","age":"Age",
        score_col:"Score","overall_index":"Overall","form_score":"Form",
        "xG_/90":"xG/90","xA_/90":"xA/90","starter_prob":"Start%",
        "injury_risk":"Risk%","expected_wc_goals":"xWC Goals",
    }
    top_full = df.sort_values(score_col, ascending=False).head(25).reset_index(drop=True)
    top_full.index = top_full.index + 1
    st.dataframe(
        top_full[cols_show].rename(columns=rename),
        use_container_width=True,
        column_config={
            "Score": st.column_config.ProgressColumn("Score", min_value=0, max_value=top_full[score_col].max(), format="%.1f"),
        },
    )

    # Bar chart
    top15 = df.sort_values(score_col, ascending=False).head(15)
    fig = go.Figure(go.Bar(
        x=top15["player"], y=top15[score_col],
        marker_color="#F0B429",
        hovertemplate="<b>%{x}</b><br>Score: %{y:.2f}<extra></extra>",
    ))
    fig.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
        font_color="#E8EDF2",
        height=280, margin=dict(l=20,r=20,t=10,b=60),
        xaxis_tickangle=-30,
        yaxis=dict(gridcolor="#1A2633"),
    )
    st.plotly_chart(fig, use_container_width=True)


# ── TAB 1: Best XI ─────────────────────────────────────────────────────────────
with tab1:
    st.subheader("Predicted Best XI — 4-3-3 Formation")

    best_xi_df = fantasy.get("best_xi", pd.DataFrame())
    if best_xi_df.empty:
        st.info("Best XI data not available.")
    else:
        # Select 1 GK, 4 DF, 3 MF, 3 FW
        formation = {"GK": 1, "DF": 4, "MF": 3, "FW": 3}
        xi = []
        for pos, n in formation.items():
            pos_players = best_xi_df[best_xi_df["position"] == pos].sort_values(
                "pos_fantasy_score", ascending=False
            ).head(n)
            xi.append(pos_players)
        xi_df = pd.concat(xi, ignore_index=True) if xi else pd.DataFrame()

        if not xi_df.empty:
            # Render pitch layout
            st.markdown(
                "<div style='background:#0d2818;border-radius:12px;padding:1.2rem;"
                "border:2px solid #1a5c32;'>",
                unsafe_allow_html=True,
            )

            row_gk  = xi_df[xi_df["position"] == "GK"]
            row_df  = xi_df[xi_df["position"] == "DF"]
            row_mf  = xi_df[xi_df["position"] == "MF"]
            row_fw  = xi_df[xi_df["position"] == "FW"]

            def render_row(row_df_sub, label, colour="#E8EDF2"):
                st.markdown(
                    f"<div style='text-align:center;color:#4CAF50;font-size:.7rem;"
                    f"letter-spacing:.1em;margin:.3rem 0;'>{label}</div>",
                    unsafe_allow_html=True,
                )
                cols = st.columns(len(row_df_sub))
                for col, (_, p) in zip(cols, row_df_sub.iterrows()):
                    col.markdown(
                        player_card(p["player"], p["team"], p["position"],
                                    p.get("pos_fantasy_score", 0), colour),
                        unsafe_allow_html=True,
                    )

            render_row(row_fw,  "FORWARDS",   "#F0B429")
            st.markdown("")
            render_row(row_mf,  "MIDFIELDERS","#3A7BD5")
            st.markdown("")
            render_row(row_df,  "DEFENDERS",  "#2ECC71")
            st.markdown("")
            render_row(row_gk,  "GOALKEEPER", "#8A9BAD")

            st.markdown("</div>", unsafe_allow_html=True)
            st.markdown("")

            # Stats table
            st.subheader("Best XI — Stats")
            xi_show = xi_df[["player","team","position","overall_index","form_score",
                              "pos_fantasy_score","xG_/90","xA_/90","expected_wc_goals",
                              "starter_prob","injury_risk"]].copy()
            xi_show.columns = ["Player","Team","Pos","Overall","Form","Fantasy Pts",
                                "xG/90","xA/90","xWC Goals","Start%","Risk%"]
            st.dataframe(xi_show, use_container_width=True, hide_index=True)

            # Team breakdown
            st.markdown("**Nation Breakdown**")
            nation_counts = xi_df["team"].value_counts().reset_index()
            nation_counts.columns = ["Nation","Players"]
            for _, row in nation_counts.iterrows():
                st.markdown(f"- **{row['Nation']}**: {row['Players']} player(s)")

# ── TAB 2: Captain Picks ───────────────────────────────────────────────────────
with tab2:
    captain_df = fantasy.get("captain", pd.DataFrame())
    if captain_df.empty:
        captain_df = players.sort_values("captain_score", ascending=False).head(20)
    score_col = "captain_score" if "captain_score" in captain_df.columns else "overall_index"
    picks_table(captain_df, score_col, "Captain & Vice-Captain Recommendations")

    # Captain reasoning
    st.subheader("Why these captains?")
    st.markdown("""
    - **Captain score** combines Overall Index (50%), Form (30%), and Starter Probability (20%).
    - High injury risk players are penalised in rankings.
    - Players from teams with high R16 probability score higher — more games = more captain points.
    - Forwards and attacking midfielders dominate due to goal and assist potential.
    """)

# ── TAB 3: Budget Picks ────────────────────────────────────────────────────────
with tab3:
    budget_df = fantasy.get("budget", pd.DataFrame())
    if budget_df.empty:
        budget_df = players[players["starter_prob"] >= 0.7].sort_values(
            "value_score", ascending=False
        ).head(20)
    score_col = "value_score" if "value_score" in budget_df.columns else "pos_fantasy_score"
    picks_table(budget_df, score_col, "Budget Picks — Best Value Players")

    st.subheader("Budget pick criteria")
    st.markdown("""
    - Value score favours players with high output relative to their squad standing.
    - Picks include reliable starters from strong teams at lower price tiers.
    - Ideal to fill out your squad while leaving budget for premium captains.
    - Focus: consistent performers, not necessarily star names.
    """)

    # Value scatter
    st.subheader("Value vs Output — Budget Players")
    scatter_df = budget_df.copy() if not budget_df.empty else players.head(40)
    if "value_score" in scatter_df.columns and "pos_fantasy_score" in scatter_df.columns:
        fig_vs = px.scatter(
            scatter_df.head(30),
            x="value_score", y="pos_fantasy_score",
            color="position", text="player",
            color_discrete_map={"GK":"#8A9BAD","DF":"#2ECC71","MF":"#3A7BD5","FW":"#F0B429"},
            labels={"value_score":"Value Score","pos_fantasy_score":"Fantasy Points","position":"Pos"},
            height=360,
        )
        fig_vs.update_traces(textposition="top center", textfont_size=8, textfont_color="#E8EDF2")
        fig_vs.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
            font_color="#E8EDF2", margin=dict(l=20,r=20,t=10,b=20),
        )
        st.plotly_chart(fig_vs, use_container_width=True)

# ── TAB 4: Differential Picks ─────────────────────────────────────────────────
with tab4:
    diff_df = fantasy.get("differential", pd.DataFrame())
    if diff_df.empty:
        diff_df = players[players.get("starter_prob", pd.Series(dtype=float)).lt(0.80)].sort_values(
            "differential_score", ascending=False
        ).head(20) if "starter_prob" in players.columns else players.sort_values("form_score", ascending=False).head(20)
    score_col = "differential_score" if "differential_score" in diff_df.columns else "form_score"
    picks_table(diff_df, score_col, "Differential Picks — Low Ownership, High Ceiling")

    st.subheader("Why differentials?")
    st.markdown("""
    - Differential picks are players with **low expected ownership** but high potential upside.
    - Typically squad rotation players who could break into the starting XI.
    - High form players from unexpected teams — the "dark horse" equivalents in fantasy.
    - Best for gameweeks when you want to separate from the field.
    - Risk is higher — use as a small portion of your squad (1-2 players max).
    """)

    # Differential vs injury risk tradeoff
    st.subheader("Risk vs Reward — Differential Players")
    if not diff_df.empty and "injury_risk" in diff_df.columns and score_col in diff_df.columns:
        fig_rr = px.scatter(
            diff_df.head(25),
            x="injury_risk", y=score_col,
            color="position", text="player",
            size="form_score",
            color_discrete_map={"GK":"#8A9BAD","DF":"#2ECC71","MF":"#3A7BD5","FW":"#F0B429"},
            labels={"injury_risk":"Injury Risk %", score_col:"Differential Score","position":"Pos"},
            height=350,
        )
        fig_rr.update_traces(textposition="top center", textfont_size=8, textfont_color="#E8EDF2")
        fig_rr.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
            font_color="#E8EDF2", margin=dict(l=20,r=20,t=10,b=20),
        )
        st.plotly_chart(fig_rr, use_container_width=True)
