"""
Player Analytics — search, rankings, award leaderboards, position deep-dives.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="Player Analytics · WC 2026", page_icon="👤", layout="wide")
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
[data-testid="stMetricValue"]{font-size:1.4rem!important}
button[data-baseweb="tab"][aria-selected="true"]{border-bottom:2px solid #F0B429;color:#F0B429!important}
</style>""", unsafe_allow_html=True)

from utils.data_loader import load_players, WC26_GROUPS

st.markdown("# 👤 Player Analytics")
st.caption("1,248 players · Overall Index · Form Score · Award predictions · Position rankings")
st.divider()

@st.cache_data(show_spinner=False)
def get_players():
    return load_players()

players = get_players()

tab1, tab2, tab3, tab4, tab5 = st.tabs(
    ["🔍 Player Search", "📋 All Rankings", "🥇 Award Leaderboards",
     "🎯 Position Rankings", "📈 Performance Charts"]
)

# ── TAB 1: Player Search ───────────────────────────────────────────────────────
with tab1:
    st.subheader("Player Search")
    search_q = st.text_input("Search by name", placeholder="e.g. Mbappé, Messi, Bellingham…")

    col_team, col_pos = st.columns(2)
    team_filter = col_team.multiselect("Filter by team", sorted(players["team"].unique()),
                                        placeholder="All teams")
    pos_filter  = col_pos.multiselect("Filter by position", ["GK","DF","MF","FW"],
                                       placeholder="All positions")

    view = players.copy()
    if search_q:
        view = view[view["player"].str.contains(search_q, case=False, na=False)]
    if team_filter:
        view = view[view["team"].isin(team_filter)]
    if pos_filter:
        view = view[view["position"].isin(pos_filter)]

    view = view.sort_values("overall_index", ascending=False).head(50)

    if view.empty:
        st.info("No players matched your search. Try a different name or filter.")
    else:
        st.caption(f"Showing {len(view)} player(s)")

        for _, p in view.iterrows():
            with st.expander(f"**{p['player']}** — {p['team']} · {p['position']} · Overall {p['overall_index']:.0f}"):
                c1, c2, c3, c4 = st.columns(4)
                c1.metric("Overall Index", f"{p['overall_index']:.1f}")
                c2.metric("Form Score",    f"{p['form_score']:.1f}")
                c3.metric("xG/90",         f"{p['xG_/90']:.2f}")
                c4.metric("xA/90",         f"{p['xA_/90']:.2f}")

                c5, c6, c7, c8 = st.columns(4)
                c5.metric("Club",          str(p.get("club","—")))
                c6.metric("Age",           str(p.get("age","—")))
                c7.metric("Caps",          str(int(p.get("caps",0))))
                c8.metric("Starter Prob",  f"{p.get('starter_prob',0)*100:.0f}%")

                c9, c10, c11, c12 = st.columns(4)
                c9.metric("Fitness",       f"{p.get('fitness',0):.0f}%")
                c10.metric("Injury Risk",  f"{p.get('injury_risk',0):.0f}%")
                c11.metric("xWC Goals",    f"{p.get('expected_wc_goals',0):.2f}")
                c12.metric("xWC Assists",  f"{p.get('expected_wc_assists',0):.2f}")

                st.markdown(f"**Performance Tier:** {p.get('performance_tier','—')}")
                st.markdown(f"**Tournament Projection:** {p.get('tournament_projection',0):.1f}")

# ── TAB 2: All Rankings ────────────────────────────────────────────────────────
with tab2:
    st.subheader("All Player Rankings")

    col_f1, col_f2, col_f3 = st.columns(3)
    rank_pos  = col_f1.multiselect("Position", ["GK","DF","MF","FW"], placeholder="All", key="rk_pos")
    rank_grp  = col_f2.multiselect("Group", sorted(players["group"].unique()), placeholder="All", key="rk_grp")
    rank_sort = col_f3.selectbox("Sort by", ["overall_index","form_score","tournament_projection",
                                              "xG_/90","xA_/90","expected_wc_goals"], key="rk_sort")

    rk_view = players.copy()
    if rank_pos: rk_view = rk_view[rk_view["position"].isin(rank_pos)]
    if rank_grp: rk_view = rk_view[rk_view["group"].isin(rank_grp)]
    rk_view = rk_view.sort_values(rank_sort, ascending=False).head(100).reset_index(drop=True)
    rk_view.index = rk_view.index + 1

    cols_show = ["player","team","group","position","overall_index","form_score",
                 "xG_/90","xA_/90","expected_wc_goals","performance_tier","age"]
    cols_show = [c for c in cols_show if c in rk_view.columns]
    rename = {
        "player":"Player","team":"Team","group":"Grp","position":"Pos",
        "overall_index":"Overall","form_score":"Form","xG_/90":"xG/90",
        "xA_/90":"xA/90","expected_wc_goals":"xWC Goals","performance_tier":"Tier","age":"Age",
    }
    st.dataframe(
        rk_view[cols_show].rename(columns=rename),
        use_container_width=True,
        column_config={
            "Overall": st.column_config.ProgressColumn("Overall", min_value=0, max_value=100, format="%.1f"),
            "Form":    st.column_config.ProgressColumn("Form",    min_value=0, max_value=100, format="%.1f"),
        },
    )

# ── TAB 3: Award Leaderboards ─────────────────────────────────────────────────
with tab3:
    st.subheader("Tournament Award Predictions")
    award_tab1, award_tab2, award_tab3 = st.tabs(
        ["🥾 Golden Boot", "⚽ Golden Ball", "🌟 Best Young Player"]
    )

    def award_table(df: pd.DataFrame, score_col: str, label: str, top_n: int = 20):
        top = df.sort_values(score_col, ascending=False).head(top_n).reset_index(drop=True)
        top.index = top.index + 1

        # Bar chart
        fig = go.Figure(go.Bar(
            x=top["player"][:15], y=top[score_col][:15],
            marker_color="#F0B429",
            hovertemplate="<b>%{x}</b><br>" + label + ": %{y:.2f}<extra></extra>",
        ))
        fig.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
            font_color="#E8EDF2",
            height=300, margin=dict(l=20,r=20,t=10,b=60),
            xaxis_tickangle=-35,
            yaxis=dict(gridcolor="#1A2633", title=label),
        )
        st.plotly_chart(fig, use_container_width=True)

        # Podium
        if len(top) >= 3:
            p1, p2, p3 = st.columns(3)
            for col, rank, icon in zip([p1,p2,p3], [0,1,2], ["🥇","🥈","🥉"]):
                row = top.iloc[rank]
                col.markdown(
                    f"<div style='background:#1A2633;border:1px solid #2A3A4A;border-radius:8px;"
                    f"padding:.8rem;text-align:center;'>"
                    f"<div style='font-size:1.8rem;'>{icon}</div>"
                    f"<div style='color:#F0B429;font-weight:700;font-size:.9rem;'>{row['player']}</div>"
                    f"<div style='color:#8A9BAD;font-size:.78rem;'>{row['team']} · {row['position']}</div>"
                    f"<div style='color:#E8EDF2;font-size:.82rem;margin-top:.3rem;'>{row[score_col]:.1f} pts</div>"
                    f"</div>",
                    unsafe_allow_html=True,
                )

        st.markdown("")
        cols_show = ["player","team","group","position","age", score_col, "form_score","xG_/90","expected_wc_goals"]
        cols_show = [c for c in cols_show if c in top.columns]
        st.dataframe(top[cols_show], use_container_width=True)

    with award_tab1:
        boot_df = players[players["position"].isin(["FW","MF"])].copy()
        if "golden_boot_score" not in boot_df.columns:
            boot_df["golden_boot_score"] = boot_df["xG_/90"] * 100 + boot_df.get("form_score", 50) / 5
        award_table(boot_df, "golden_boot_score", "Boot Score")

    with award_tab2:
        ball_df = players.copy()
        if "golden_ball_score" not in ball_df.columns:
            ball_df["golden_ball_score"] = ball_df["overall_index"] * 0.6 + ball_df["form_score"] * 0.4
        award_table(ball_df, "golden_ball_score", "Ball Score")

    with award_tab3:
        young_df = players[players["age"] <= 23].copy() if "age" in players.columns else players.copy()
        if "best_young_score" not in young_df.columns:
            young_df["best_young_score"] = young_df["overall_index"] + young_df["form_score"] / 2
        award_table(young_df, "best_young_score", "Young Player Score")

# ── TAB 4: Position Rankings ──────────────────────────────────────────────────
with tab4:
    st.subheader("Position-Specific Rankings")
    pos_sel = st.radio("Position", ["GK","DF","MF","FW"], horizontal=True)

    pos_df = players[players["position"] == pos_sel].copy()
    pos_df = pos_df.sort_values("pos_fantasy_score", ascending=False).reset_index(drop=True)
    pos_df.index = pos_df.index + 1

    pos_cols = ["player","team","group","club","age","overall_index","form_score",
                "pos_fantasy_score","xG_/90","xA_/90","expected_wc_goals",
                "fitness","injury_risk","starter_prob","performance_tier"]
    pos_cols = [c for c in pos_cols if c in pos_df.columns]
    rename_pos = {
        "player":"Player","team":"Team","group":"Grp","club":"Club","age":"Age",
        "overall_index":"Overall","form_score":"Form","pos_fantasy_score":"Fantasy Pts",
        "xG_/90":"xG/90","xA_/90":"xA/90","expected_wc_goals":"xWC Goals",
        "fitness":"Fit%","injury_risk":"Risk%","starter_prob":"Start%",
        "performance_tier":"Tier",
    }
    st.caption(f"{len(pos_df)} {pos_sel}s in the tournament")
    st.dataframe(
        pos_df[pos_cols].rename(columns=rename_pos).head(80),
        use_container_width=True,
        column_config={
            "Overall": st.column_config.ProgressColumn("Overall", min_value=0, max_value=100, format="%.1f"),
        },
    )

# ── TAB 5: Performance Charts ─────────────────────────────────────────────────
with tab5:
    st.subheader("Performance Visualisations")

    # xG vs Overall bubble chart
    st.markdown("**xG/90 vs Overall Index — Top 60 Players**")
    bubble_df = players.sort_values("overall_index", ascending=False).head(60)
    fig_b = px.scatter(
        bubble_df,
        x="overall_index", y="xG_/90",
        size="form_score",
        color="position",
        text="player",
        color_discrete_map={"GK":"#8A9BAD","DF":"#2ECC71","MF":"#3A7BD5","FW":"#F0B429"},
        labels={"overall_index":"Overall Index","xG_/90":"xG per 90","position":"Position"},
        height=500,
    )
    fig_b.update_traces(textposition="top center", textfont_size=8, textfont_color="#E8EDF2")
    fig_b.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
        font_color="#E8EDF2", margin=dict(l=20,r=20,t=10,b=20),
    )
    st.plotly_chart(fig_b, use_container_width=True)

    # Performance tier distribution
    st.markdown("**Performance Tier Distribution**")
    tier_counts = players["performance_tier"].value_counts().reset_index()
    tier_counts.columns = ["Tier","Count"]
    fig_pie = px.pie(
        tier_counts, names="Tier", values="Count",
        color_discrete_sequence=["#F0B429","#3A7BD5","#2ECC71","#8A9BAD","#E74C3C"],
        hole=0.4,
    )
    fig_pie.update_layout(
        paper_bgcolor="#0F1923", font_color="#E8EDF2",
        height=320, margin=dict(l=20,r=20,t=10,b=20),
    )
    c_pie1, c_pie2 = st.columns([1,2])
    c_pie2.plotly_chart(fig_pie, use_container_width=True)
    with c_pie1:
        st.markdown("**Tier breakdown:**")
        for _, row in tier_counts.iterrows():
            pct = row["Count"] / len(players) * 100
            st.markdown(f"- {row['Tier']}: **{row['Count']}** ({pct:.0f}%)")

    # Age distribution
    st.markdown("**Age Distribution**")
    if "age" in players.columns:
        fig_age = px.histogram(
            players, x="age", color="position",
            nbins=18,
            color_discrete_map={"GK":"#8A9BAD","DF":"#2ECC71","MF":"#3A7BD5","FW":"#F0B429"},
            labels={"age":"Age","position":"Position"},
            barmode="stack",
            height=320,
        )
        fig_age.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
            font_color="#E8EDF2", margin=dict(l=20,r=20,t=10,b=20),
        )
        st.plotly_chart(fig_age, use_container_width=True)
