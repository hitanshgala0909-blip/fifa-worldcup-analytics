"""
Home Dashboard — tournament overview, champion odds, power rankings, key stats.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="Home · WC 2026", page_icon="🏠", layout="wide")

from utils.data_loader import load_simulation, load_power_rankings, load_elo, load_group_predictions

# ── Gold accent CSS ────────────────────────────────────────────────────────────
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
[data-testid="stMetricValue"]{font-size:1.5rem!important}
button[data-baseweb="tab"][aria-selected="true"]{border-bottom:2px solid #F0B429;color:#F0B429!important}
</style>""", unsafe_allow_html=True)

st.markdown("# 🏠 Home Dashboard")
st.caption("Tournament overview · Champion probabilities · Power rankings · Key statistics")
st.divider()

sim = load_simulation()
rnk = load_power_rankings()
elo = load_elo()
grp = load_group_predictions()

# ── KPI row ────────────────────────────────────────────────────────────────────
k1, k2, k3, k4, k5 = st.columns(5)
top_team  = sim.sort_values("p_winner", ascending=False).iloc[0]
dark_horse = sim[sim["sim_rank"] > 10].sort_values("p_winner", ascending=False).iloc[0]
top_elo   = elo.sort_values("elo", ascending=False).iloc[0]

k1.metric("Top Favourite",   top_team["team"],    f"{top_team['p_winner']*100:.1f}% win prob")
k2.metric("Highest ELO",     top_elo["team"],     f"{int(top_elo['elo'])} ELO")
k3.metric("Dark Horse",      dark_horse["team"],  f"{dark_horse['p_winner']*100:.1f}% win prob")
k4.metric("Teams",           "48",                "12 Groups · 4 each")
k5.metric("Total Matches",   "104",               "Group + Knockout")

st.divider()

# ── Tabs ───────────────────────────────────────────────────────────────────────
tab1, tab2, tab3 = st.tabs(["🏆 Champion Probabilities", "📊 Power Rankings", "🌍 Group Overview"])

# ── TAB 1: Champion probabilities chart ───────────────────────────────────────
with tab1:
    st.subheader("Championship Win Probabilities — All 48 Teams")
    top_n = st.slider("Show top N teams", 5, 48, 16)
    top = sim.sort_values("p_winner", ascending=False).head(top_n)

    fig = go.Figure()
    fig.add_bar(
        x=top["team"],
        y=(top["p_winner"] * 100).round(2),
        name="Win %",
        marker_color="#F0B429",
        hovertemplate="<b>%{x}</b><br>Win: %{y:.2f}%<extra></extra>",
    )
    fig.add_bar(
        x=top["team"],
        y=(top["p_runner_up"] * 100).round(2),
        name="Runner-up %",
        marker_color="#3A7BD5",
        hovertemplate="<b>%{x}</b><br>Runner-up: %{y:.2f}%<extra></extra>",
    )
    fig.add_bar(
        x=top["team"],
        y=(top["p_sf"] * 100).round(2),
        name="Semifinal %",
        marker_color="#2A3A4A",
        hovertemplate="<b>%{x}</b><br>SF: %{y:.2f}%<extra></extra>",
    )
    fig.update_layout(
        barmode="stack",
        paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
        font_color="#E8EDF2",
        legend=dict(orientation="h", y=-0.15),
        xaxis_tickangle=-35,
        height=420,
        margin=dict(l=20, r=20, t=20, b=80),
    )
    st.plotly_chart(fig, use_container_width=True)

    # Mini leaderboard
    st.subheader("Top 10 — Detailed Probabilities")
    top10 = sim.sort_values("p_winner", ascending=False).head(10).reset_index(drop=True)
    top10.index = top10.index + 1
    display = top10[["team","group","reach_winner_pct","reach_runner_up_pct",
                      "reach_sf_pct","reach_qf_pct","reach_r16_pct"]].copy()
    display.columns = ["Team","Grp","Win %","Runner-up %","SF %","QF %","R16 %"]
    st.dataframe(display, use_container_width=True)

# ── TAB 2: Power Rankings ──────────────────────────────────────────────────────
with tab2:
    st.subheader("Power Rankings — All 48 Teams")

    col_a, col_b = st.columns([3, 2])

    with col_a:
        top24 = rnk.head(24)
        fig2 = go.Figure(go.Bar(
            x=top24["power_score"],
            y=top24["team"],
            orientation="h",
            marker=dict(
                color=top24["power_score"],
                colorscale=[[0,"#1A2633"],[0.5,"#3A7BD5"],[1,"#F0B429"]],
                showscale=False,
            ),
            hovertemplate="<b>%{y}</b><br>Power: %{x:.2f}<extra></extra>",
        ))
        fig2.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
            font_color="#E8EDF2",
            yaxis=dict(autorange="reversed"),
            height=600,
            margin=dict(l=20, r=20, t=10, b=20),
        )
        st.plotly_chart(fig2, use_container_width=True)

    with col_b:
        st.markdown("**ELO Ratings — Top 20**")
        top20_elo = elo.sort_values("elo", ascending=False).head(20).reset_index(drop=True)
        top20_elo.index = top20_elo.index + 1
        st.dataframe(
            top20_elo[["team","group","elo"]].rename(columns={"team":"Team","group":"Grp","elo":"ELO"}),
            use_container_width=True, height=560,
        )

# ── TAB 3: Group overview ──────────────────────────────────────────────────────
with tab3:
    st.subheader("Group Stage Overview — Predicted Winners")

    from utils.data_loader import WC26_GROUPS
    groups = sorted(WC26_GROUPS.keys())
    cols_g = st.columns(4)

    for i, group in enumerate(groups):
        teams = WC26_GROUPS[group]
        col = cols_g[i % 4]
        with col:
            st.markdown(f"**Group {group}**")
            for team in teams:
                elo_val = int(elo[elo["team"] == team]["elo"].values[0]) if team in elo["team"].values else 0
                win_pct = float(sim[sim["team"] == team]["reach_winner_pct"].values[0]) if team in sim["team"].values else 0
                is_fav = elo_val == max(
                    [int(elo[elo["team"] == t]["elo"].values[0]) if t in elo["team"].values else 0 for t in teams]
                )
                colour = "#F0B429" if is_fav else "#E8EDF2"
                st.markdown(
                    f"<div style='color:{colour};font-size:.85rem;padding:.15rem 0;'>"
                    f"{'⭐ ' if is_fav else '  '}{team} "
                    f"<span style='color:#8A9BAD;font-size:.75rem;'>ELO {elo_val}</span>"
                    f"</div>",
                    unsafe_allow_html=True,
                )
            st.markdown("")
