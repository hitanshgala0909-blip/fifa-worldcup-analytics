"""
Team Analytics — ELO, power rankings, squad strength, group analysis.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="Team Analytics · WC 2026", page_icon="📊", layout="wide")
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
button[data-baseweb="tab"][aria-selected="true"]{border-bottom:2px solid #F0B429;color:#F0B429!important}
</style>""", unsafe_allow_html=True)

from utils.data_loader import load_elo, load_power_rankings, load_simulation, WC26_GROUPS, ALL_TEAMS

st.markdown("# 📊 Team Analytics")
st.caption("ELO rankings · Power scores · Squad strength · Group-by-group analysis")
st.divider()

elo = load_elo()
rnk = load_power_rankings()
sim = load_simulation()

# Merge group into elo/rnk if missing
for df in [elo, rnk]:
    if "group" not in df.columns:
        df["group"] = df["team"].map({t: g for g, ts in WC26_GROUPS.items() for t in ts})

tab1, tab2, tab3, tab4 = st.tabs(
    ["🏅 Power Rankings", "📡 ELO Rankings", "💪 Squad Strength", "🌍 Group Analysis"]
)

# ── TAB 1: Power Rankings ──────────────────────────────────────────────────────
with tab1:
    st.subheader("Power Rankings — All 48 Teams")

    col_filter, col_sort = st.columns([2, 2])
    grp_sel  = col_filter.multiselect("Filter by Group", sorted(rnk["group"].dropna().unique()), placeholder="All groups")
    sort_by  = col_sort.selectbox("Sort by", ["power_score", "elo", "squad_index", "team_xg", "avg_form"])

    view_df = rnk.copy()
    if grp_sel:
        view_df = view_df[view_df["group"].isin(grp_sel)]
    view_df = view_df.sort_values(sort_by, ascending=False).reset_index(drop=True)
    view_df.index = view_df.index + 1

    # Highlight chart
    fig = go.Figure(go.Bar(
        x=view_df["team"], y=view_df[sort_by],
        marker=dict(
            color=view_df[sort_by],
            colorscale=[[0,"#1A2633"],[0.5,"#3A7BD5"],[1,"#F0B429"]],
            showscale=False,
        ),
        hovertemplate="<b>%{x}</b><br>%{y:.2f}<extra></extra>",
    ))
    fig.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
        font_color="#E8EDF2",
        height=360, margin=dict(l=20,r=20,t=10,b=80),
        xaxis_tickangle=-40,
        yaxis=dict(gridcolor="#1A2633"),
    )
    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Rankings Table")
    cols_show = [c for c in ["power_rank","team","group","power_score","elo",
                              "squad_index","team_xg","avg_form","fifa_rank"]
                 if c in view_df.columns]
    rename = {
        "power_rank":"Rank","team":"Team","group":"Grp","power_score":"Power",
        "elo":"ELO","squad_index":"Squad Idx","team_xg":"xG/90",
        "avg_form":"Form","fifa_rank":"FIFA Rank",
    }
    st.dataframe(
        view_df[cols_show].rename(columns=rename),
        use_container_width=True,
        column_config={
            "Power":     st.column_config.ProgressColumn("Power", min_value=0, max_value=100, format="%.1f"),
            "ELO":       st.column_config.NumberColumn("ELO", format="%d"),
        },
    )

# ── TAB 2: ELO Rankings ───────────────────────────────────────────────────────
with tab2:
    st.subheader("ELO Ratings — World Cup 2026")

    elo_view = elo.sort_values("elo", ascending=False).reset_index(drop=True)
    elo_view.index = elo_view.index + 1

    c1, c2 = st.columns([3, 2])
    with c1:
        fig_elo = go.Figure(go.Bar(
            x=elo_view["team"],
            y=elo_view["elo"],
            marker=dict(
                color=elo_view["elo"],
                colorscale=[[0,"#1A2633"],[0.5,"#3A7BD5"],[1,"#F0B429"]],
                showscale=True,
                colorbar=dict(title="ELO", thickness=12, tickfont_color="#E8EDF2"),
            ),
            hovertemplate="<b>%{x}</b><br>ELO: %{y}<extra></extra>",
        ))
        fig_elo.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
            font_color="#E8EDF2",
            height=450, margin=dict(l=20,r=50,t=10,b=80),
            xaxis_tickangle=-45,
            yaxis=dict(gridcolor="#1A2633", title="ELO Rating"),
        )
        st.plotly_chart(fig_elo, use_container_width=True)

    with c2:
        st.markdown("**ELO — Full Table**")
        disp = elo_view[["team","group","elo"]].rename(
            columns={"team":"Team","group":"Grp","elo":"ELO"}
        )
        st.dataframe(disp, use_container_width=True, height=430)

    # ELO distribution by group
    st.subheader("ELO Distribution by Group")
    fig_box = px.box(
        elo_view.rename(columns={"group":"Group","elo":"ELO"}),
        x="Group", y="ELO",
        color="Group",
        color_discrete_sequence=px.colors.qualitative.Bold,
        points="all",
    )
    fig_box.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
        font_color="#E8EDF2",
        showlegend=False, height=380,
        margin=dict(l=20,r=20,t=10,b=20),
    )
    st.plotly_chart(fig_box, use_container_width=True)

# ── TAB 3: Squad Strength ─────────────────────────────────────────────────────
with tab3:
    st.subheader("Squad Strength Rankings")
    st.caption("Based on player overall index aggregates")

    if "squad_index" in rnk.columns:
        sq_view = rnk.sort_values("squad_index", ascending=False).reset_index(drop=True)

        # Bubble chart: ELO vs Squad Index, sized by power score
        fig_bubble = px.scatter(
            sq_view.head(32),
            x="elo", y="squad_index",
            size="power_score",
            color="group",
            text="team",
            color_discrete_sequence=px.colors.qualitative.Bold,
            labels={"elo":"ELO Rating","squad_index":"Squad Index","group":"Group"},
            height=480,
        )
        fig_bubble.update_traces(textposition="top center", textfont_color="#E8EDF2",
                                 textfont_size=9)
        fig_bubble.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
            font_color="#E8EDF2",
            margin=dict(l=20,r=20,t=10,b=20),
        )
        st.plotly_chart(fig_bubble, use_container_width=True)

        st.subheader("Top 20 — Squad Strength")
        sq_top = sq_view.head(20)[["power_rank","team","group","squad_index","elo","team_xg","avg_form"]]
        sq_top.columns = ["Rank","Team","Grp","Squad Idx","ELO","xG/90","Form"]
        st.dataframe(sq_top, use_container_width=True, hide_index=True)
    else:
        st.info("Squad strength data not available — run the ML pipeline to generate squad features.")

# ── TAB 4: Group Analysis ─────────────────────────────────────────────────────
with tab4:
    st.subheader("Group-by-Group Analysis")

    group_sel = st.selectbox("Select Group", sorted(WC26_GROUPS.keys()))
    teams_in_group = WC26_GROUPS[group_sel]

    st.markdown(f"### Group {group_sel}")
    g_col1, g_col2, g_col3, g_col4 = st.columns(4)
    for col, team in zip([g_col1, g_col2, g_col3, g_col4], teams_in_group):
        team_elo  = int(elo[elo["team"] == team]["elo"].values[0]) if team in elo["team"].values else 0
        team_rank = int(rnk[rnk["team"] == team]["power_rank"].values[0]) if team in rnk["team"].values else 0
        team_r16  = float(sim[sim["team"] == team]["reach_r16_pct"].values[0]) if team in sim["team"].values else 0
        col.metric(team, f"ELO {team_elo}", f"Rank #{team_rank}")
        col.markdown(f"<span style='color:#F0B429;font-size:.85rem;'>R16: {team_r16:.0f}%</span>",
                     unsafe_allow_html=True)

    st.divider()

    # Head-to-head within group
    st.subheader("Head-to-Head — Group Advancement Probabilities")
    g_data = []
    for team in teams_in_group:
        row_sim = sim[sim["team"] == team]
        row_rnk = rnk[rnk["team"] == team]
        row_elo = elo[elo["team"] == team]
        g_data.append({
            "Team": team,
            "ELO": int(row_elo["elo"].values[0]) if not row_elo.empty else 0,
            "Power Score": round(float(row_rnk["power_score"].values[0]),2) if not row_rnk.empty else 0,
            "xG/90": round(float(row_rnk["team_xg"].values[0]),2) if not row_rnk.empty and "team_xg" in row_rnk else 0,
            "R16 %": round(float(row_sim["reach_r16_pct"].values[0]),1) if not row_sim.empty else 0,
            "QF %":  round(float(row_sim["reach_qf_pct"].values[0]),1) if not row_sim.empty else 0,
            "SF %":  round(float(row_sim["reach_sf_pct"].values[0]),1) if not row_sim.empty else 0,
            "Win %": round(float(row_sim["reach_winner_pct"].values[0]),1) if not row_sim.empty else 0,
        })
    g_df = pd.DataFrame(g_data).sort_values("ELO", ascending=False)
    st.dataframe(g_df, use_container_width=True, hide_index=True)

    # Radar for group
    st.subheader(f"Group {group_sel} — Comparative Radar")
    metrics_radar = ["ELO","Power Score","R16 %","QF %","Win %"]
    fig_radar = go.Figure()
    colours = ["#F0B429","#3A7BD5","#2ECC71","#E74C3C"]
    for (_, row_g), colour in zip(g_df.iterrows(), colours):
        vals = [row_g.get(m, 0) for m in metrics_radar]
        max_vals = [g_df[m].max() + 1e-6 for m in metrics_radar]
        norm = [v / mx for v, mx in zip(vals, max_vals)]
        fig_radar.add_scatterpolar(
            r=norm + [norm[0]], theta=metrics_radar + [metrics_radar[0]],
            fill="toself", name=row_g["Team"], line_color=colour,
            fillcolor=colour.replace("#","rgba(").rstrip(")") + ",0.1)" if colour.startswith("#") else colour,
        )
    fig_radar.update_layout(
        polar=dict(
            bgcolor="#1A2633",
            radialaxis=dict(visible=True, range=[0,1], showticklabels=False, gridcolor="#2A3A4A"),
            angularaxis=dict(gridcolor="#2A3A4A"),
        ),
        paper_bgcolor="#0F1923", font_color="#E8EDF2",
        height=380, margin=dict(l=60,r=60,t=30,b=60),
        legend=dict(orientation="h", y=-0.15),
    )
    st.plotly_chart(fig_radar, use_container_width=True)
