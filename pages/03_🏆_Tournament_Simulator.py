"""
Tournament Simulator — bracket predictions, champion odds, dark horses.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="Simulator · WC 2026", page_icon="🏆", layout="wide")
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
[data-testid="stMetricValue"]{font-size:1.4rem!important}
</style>""", unsafe_allow_html=True)

from utils.data_loader import (
    load_simulation, load_bracket, load_group_predictions,
)

st.markdown("# 🏆 Tournament Simulator")
st.caption("10,000-run Monte Carlo simulation · Calibrated ELO + squad strength model")
st.divider()

sim = load_simulation()

# ── Top champion stats ─────────────────────────────────────────────────────────
top5 = sim.sort_values("p_winner", ascending=False).head(5)
cols = st.columns(5)
for col, (_, row) in zip(cols, top5.iterrows()):
    col.metric(row["team"], f"{row['p_winner']*100:.1f}%",
               f"SF: {row.get('reach_sf_pct',0):.0f}%")

st.divider()

tab1, tab2, tab3, tab4 = st.tabs(
    ["🗓 Bracket Predictions", "📈 Advancement Probabilities",
     "🌑 Dark Horses", "🔢 Full Simulation Table"]
)

# ── TAB 1: Bracket ─────────────────────────────────────────────────────────────
with tab1:
    st.subheader("Predicted Bracket — Round by Round")

    round_opts = {
        "Round of 32":   "round_of_32",
        "Round of 16":   "round_of_16",
        "Quarterfinals": "quarterfinals",
        "Semifinals":    "semifinals",
        "Final":         "final",
    }
    sel_round = st.selectbox("Select Round", list(round_opts.keys()))
    bracket   = load_bracket(round_opts[sel_round])

    if bracket.empty:
        st.info("No bracket data available for this round.")
    else:
        for _, row in bracket.iterrows():
            ta  = row.get("team_a", "TBD")
            tb  = row.get("team_b", "TBD")
            pa  = float(row.get("p_a_win", 0.5))
            pb  = float(row.get("p_b_win", 0.5))
            pw  = row.get("predicted_winner", ta)
            up  = float(row.get("upset_probability", 0.0))

            c1, c2, c3, c4, c5 = st.columns([3, 1, 3, 1, 2])
            colour_a = "#F0B429" if pw == ta else "#E8EDF2"
            colour_b = "#F0B429" if pw == tb else "#E8EDF2"
            c1.markdown(f"<span style='color:{colour_a};font-weight:{'700' if pw==ta else '400'};'>{ta}</span>",
                        unsafe_allow_html=True)
            c2.markdown(f"<span style='color:#8A9BAD;font-size:.8rem;'>{pa*100:.0f}%</span>",
                        unsafe_allow_html=True)
            c3.markdown(f"<span style='color:{colour_b};font-weight:{'700' if pw==tb else '400'};'>{tb}</span>",
                        unsafe_allow_html=True)
            c4.markdown(f"<span style='color:#8A9BAD;font-size:.8rem;'>{pb*100:.0f}%</span>",
                        unsafe_allow_html=True)
            c5.markdown(f"<span style='color:#F0B429;font-size:.78rem;'>Upset: {up*100:.0f}%</span>",
                        unsafe_allow_html=True)
        st.caption(f"Showing {len(bracket)} matches for {sel_round}")

# ── TAB 2: Advancement probabilities ──────────────────────────────────────────
with tab2:
    st.subheader("Advancement Probabilities — All 48 Teams")

    view = st.selectbox("View by", ["Champion", "Semifinal", "Quarterfinal", "Round of 16"])
    col_map = {
        "Champion":     ("reach_winner_pct",    "#F0B429"),
        "Semifinal":    ("reach_sf_pct",        "#3A7BD5"),
        "Quarterfinal": ("reach_qf_pct",        "#2ECC71"),
        "Round of 16":  ("reach_r16_pct",       "#8A9BAD"),
    }
    col_key, bar_col = col_map[view]

    top_n = st.slider("Top N teams", 8, 48, 24, key="adv_slider")
    plot_df = sim.sort_values(col_key, ascending=False).head(top_n)

    fig = go.Figure(go.Bar(
        x=plot_df["team"],
        y=plot_df[col_key],
        marker_color=bar_col,
        hovertemplate="<b>%{x}</b><br>" + view + ": %{y:.1f}%<extra></extra>",
    ))
    fig.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
        font_color="#E8EDF2",
        yaxis=dict(title=f"{view} %", gridcolor="#1A2633"),
        xaxis_tickangle=-40,
        height=400, margin=dict(l=20, r=20, t=10, b=80),
    )
    st.plotly_chart(fig, use_container_width=True)

    # Group-level advancement heatmap
    st.subheader("Group-by-Group Advancement Rates")
    from utils.data_loader import WC26_GROUPS
    hm_data = []
    for group in sorted(WC26_GROUPS.keys()):
        for team in WC26_GROUPS[group]:
            row = sim[sim["team"] == team]
            if not row.empty:
                hm_data.append({
                    "Group": group, "Team": team,
                    "R16 %":  float(row["reach_r16_pct"].values[0]),
                    "QF %":   float(row["reach_qf_pct"].values[0]),
                    "SF %":   float(row["reach_sf_pct"].values[0]),
                    "Win %":  float(row["reach_winner_pct"].values[0]),
                })
    hm_df = pd.DataFrame(hm_data)
    if not hm_df.empty:
        fig_hm = px.density_heatmap(
            hm_df, x="Group", y="Team", z="R16 %",
            color_continuous_scale=[[0,"#0F1923"],[0.5,"#3A7BD5"],[1,"#F0B429"]],
            height=520,
        )
        fig_hm.update_layout(
            paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
            font_color="#E8EDF2", margin=dict(l=20, r=20, t=10, b=20),
        )
        st.plotly_chart(fig_hm, use_container_width=True)

# ── TAB 3: Dark horses ─────────────────────────────────────────────────────────
with tab3:
    st.subheader("Top Dark Horses")
    st.caption("Teams outside the top 8 favourites with the highest upset potential")

    dark = sim[sim["sim_rank"] > 8].sort_values("p_winner", ascending=False).head(12).reset_index(drop=True)

    for i, row in dark.iterrows():
        c1, c2, c3, c4, c5 = st.columns([1, 3, 2, 2, 2])
        c1.markdown(f"**#{i+1}**")
        c2.markdown(f"**{row['team']}**  <span style='color:#8A9BAD;font-size:.8rem;'>Grp {row.get('group','?')}</span>",
                    unsafe_allow_html=True)
        c3.markdown(f"<span style='color:#F0B429;'>Win: {row['p_winner']*100:.1f}%</span>",
                    unsafe_allow_html=True)
        c4.markdown(f"SF: {row.get('reach_sf_pct',0):.1f}%")
        c5.markdown(f"QF: {row.get('reach_qf_pct',0):.1f}%")

    st.divider()
    st.subheader("Dark Horse Scatter — QF vs SF Probability")
    fig_scatter = px.scatter(
        dark, x="reach_qf_pct", y="reach_sf_pct",
        text="team", size="p_winner",
        color="reach_winner_pct",
        color_continuous_scale=[[0,"#1A2633"],[1,"#F0B429"]],
        labels={"reach_qf_pct":"QF %","reach_sf_pct":"SF %"},
        height=380,
    )
    fig_scatter.update_traces(textposition="top center", textfont_color="#E8EDF2")
    fig_scatter.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#1A2633",
        font_color="#E8EDF2", margin=dict(l=20,r=20,t=10,b=20),
    )
    st.plotly_chart(fig_scatter, use_container_width=True)

# ── TAB 4: Full table ──────────────────────────────────────────────────────────
with tab4:
    st.subheader("Full Simulation Table — All 48 Teams")
    grp_filter = st.multiselect("Filter by Group", sorted(sim["group"].unique()) if "group" in sim.columns else [],
                                placeholder="All groups")
    display_sim = sim.copy()
    if grp_filter:
        display_sim = display_sim[display_sim["group"].isin(grp_filter)]

    cols_show = ["sim_rank","team","group",
                 "reach_r16_pct","reach_qf_pct","reach_sf_pct",
                 "reach_runner_up_pct","reach_winner_pct"]
    cols_show = [c for c in cols_show if c in display_sim.columns]
    rename = {
        "sim_rank":"Rank","team":"Team","group":"Grp",
        "reach_r16_pct":"R16 %","reach_qf_pct":"QF %","reach_sf_pct":"SF %",
        "reach_runner_up_pct":"Final %","reach_winner_pct":"Win %",
    }
    st.dataframe(
        display_sim[cols_show].rename(columns=rename).reset_index(drop=True),
        use_container_width=True, hide_index=True,
    )
