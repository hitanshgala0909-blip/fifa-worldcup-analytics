"""
Match Predictor — head-to-head predictions with calibrated ML model.
"""
import streamlit as st
import plotly.graph_objects as go
import numpy as np

st.set_page_config(page_title="Match Predictor · WC 2026", page_icon="⚽", layout="wide")
st.markdown("""<style>
[data-testid="stMetricLabel"]{color:#F0B429!important;font-weight:600}
[data-testid="stMetricValue"]{font-size:1.5rem!important}
</style>""", unsafe_allow_html=True)

from utils.data_loader import (
    ALL_TEAMS, load_elo, load_power_rankings, predict_match_live,
)

st.markdown("# ⚽ Match Predictor")
st.caption("Calibrated 17-feature ML model · ELO + squad strength + rolling form")
st.divider()

elo_df = load_elo()
rnk_df = load_power_rankings()

# ── Team selector ──────────────────────────────────────────────────────────────
teams_sorted = sorted(ALL_TEAMS)
col_a, col_vs, col_b = st.columns([5, 1, 5])

with col_a:
    st.markdown("### Team A")
    team_a = st.selectbox("Select Team A", teams_sorted,
                          index=teams_sorted.index("Brazil") if "Brazil" in teams_sorted else 0,
                          key="team_a_sel")

with col_vs:
    st.markdown("<br><br><div style='text-align:center;font-size:1.5rem;color:#F0B429;font-weight:800;'>VS</div>",
                unsafe_allow_html=True)

with col_b:
    st.markdown("### Team B")
    default_b = "France" if "France" in teams_sorted else teams_sorted[1]
    team_b = st.selectbox("Select Team B", teams_sorted,
                          index=teams_sorted.index(default_b),
                          key="team_b_sel")

st.markdown("")
predict_btn = st.button("🔮 Predict Match", type="primary", use_container_width=True)

if team_a == team_b:
    st.warning("Please select two different teams.")
    st.stop()

# ── Auto-predict or on button ──────────────────────────────────────────────────
if "last_pred" not in st.session_state:
    st.session_state.last_pred = None

if predict_btn or st.session_state.last_pred is None:
    with st.spinner("Running prediction…"):
        result = predict_match_live(team_a, team_b)
        st.session_state.last_pred = result

result = st.session_state.last_pred
if result is None:
    st.stop()

# Force re-predict when teams change
if result["team_a"] != team_a or result["team_b"] != team_b:
    with st.spinner("Running prediction…"):
        result = predict_match_live(team_a, team_b)
        st.session_state.last_pred = result

st.divider()

# ── Result headline ────────────────────────────────────────────────────────────
winner = result["predicted_winner"]
conf   = result["confidence"]

if winner == "Draw":
    headline = f"🤝 Draw predicted ({conf*100:.0f}% confidence)"
    headline_colour = "#8A9BAD"
else:
    headline = f"🏆 {winner} predicted to win"
    headline_colour = "#F0B429"

st.markdown(
    f"<h2 style='text-align:center;color:{headline_colour};margin:.5rem 0;'>{headline}</h2>",
    unsafe_allow_html=True,
)

# ── Probability display ────────────────────────────────────────────────────────
pa   = result["p_a_win"]
pd_  = result["p_draw"]
pb   = result["p_b_win"]
up   = result["upset_probability"]

m1, m2, m3, m4 = st.columns(4)
m1.metric(f"{team_a} Win",  f"{pa*100:.1f}%")
m2.metric("Draw",           f"{pd_*100:.1f}%")
m3.metric(f"{team_b} Win",  f"{pb*100:.1f}%")
m4.metric("Upset Prob",     f"{up*100:.1f}%",
          help="Probability the lower-rated team wins")

# ── Stacked probability bar ────────────────────────────────────────────────────
fig_bar = go.Figure(go.Bar(
    x=[pa * 100], y=[""], orientation="h", name=team_a,
    marker_color="#F0B429",
    text=[f"{team_a}  {pa*100:.0f}%"], textposition="inside",
    insidetextanchor="middle",
))
fig_bar.add_trace(go.Bar(
    x=[pd_ * 100], y=[""], orientation="h", name="Draw",
    marker_color="#4A5A6A",
    text=[f"Draw  {pd_*100:.0f}%"], textposition="inside",
    insidetextanchor="middle",
))
fig_bar.add_trace(go.Bar(
    x=[pb * 100], y=[""], orientation="h", name=team_b,
    marker_color="#3A7BD5",
    text=[f"{team_b}  {pb*100:.0f}%"], textposition="inside",
    insidetextanchor="middle",
))
fig_bar.update_layout(
    barmode="stack", height=80,
    paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
    font_color="#E8EDF2", showlegend=False,
    margin=dict(l=0, r=0, t=0, b=0),
    xaxis=dict(showticklabels=False, showgrid=False, range=[0, 100]),
    yaxis=dict(showticklabels=False),
)
st.plotly_chart(fig_bar, use_container_width=True)

st.divider()

# ── ELO comparison + detail ────────────────────────────────────────────────────
col_left, col_right = st.columns(2)

with col_left:
    st.subheader("ELO Comparison")
    ea = result["elo_a"]
    eb = result["elo_b"]
    gap = result["elo_gap"]

    fig_elo = go.Figure()
    fig_elo.add_bar(x=[team_a], y=[ea], marker_color="#F0B429", name=team_a,
                    text=[f"{ea}"], textposition="outside")
    fig_elo.add_bar(x=[team_b], y=[eb], marker_color="#3A7BD5", name=team_b,
                    text=[f"{eb}"], textposition="outside")
    fig_elo.update_layout(
        paper_bgcolor="#0F1923", plot_bgcolor="#0F1923",
        font_color="#E8EDF2", showlegend=False,
        height=260, margin=dict(l=20, r=20, t=20, b=20),
        yaxis=dict(gridcolor="#1A2633"),
    )
    st.plotly_chart(fig_elo, use_container_width=True)
    st.metric("ELO Gap", f"{int(gap)}", help="Absolute ELO difference between teams")

with col_right:
    st.subheader("Model Detail")
    rnk_a = rnk_df[rnk_df["team"] == team_a].iloc[0] if team_a in rnk_df["team"].values else None
    rnk_b = rnk_df[rnk_df["team"] == team_b].iloc[0] if team_b in rnk_df["team"].values else None

    detail_rows = [
        ("Team A ELO",        f"{int(ea)}",       f"{int(eb)}", "Team B ELO"),
        ("A Win Prob",         f"{pa*100:.1f}%",   f"{pb*100:.1f}%",  "B Win Prob"),
        ("Draw Prob",          f"{pd_*100:.1f}%",  "—",          ""),
        ("ELO Gap",            f"{int(gap)}",      "—",          ""),
        ("Confidence",         f"{conf*100:.0f}%", "—",          ""),
        ("Upset Probability",  f"{up*100:.1f}%",   "—",          ""),
    ]
    if rnk_a is not None:
        detail_rows.append(("Power Rank", f"#{int(rnk_a['power_rank'])}", f"#{int(rnk_b['power_rank'])}" if rnk_b is not None else "—", "Power Rank"))
        detail_rows.append(("Squad Index", f"{rnk_a['squad_index']:.1f}", f"{rnk_b['squad_index']:.1f}" if rnk_b is not None else "—", "Squad Index"))

    for label_a, val_a, val_b, label_b in detail_rows:
        c1, c2, c3, c4 = st.columns([2, 1, 1, 2])
        c1.markdown(f"<span style='color:#8A9BAD;font-size:.82rem;'>{label_a}</span>", unsafe_allow_html=True)
        c2.markdown(f"**{val_a}**")
        c3.markdown(f"**{val_b}**")
        c4.markdown(f"<span style='color:#8A9BAD;font-size:.82rem;'>{label_b}</span>", unsafe_allow_html=True)

st.divider()

# ── Radar chart comparing teams ────────────────────────────────────────────────
if rnk_a is not None and rnk_b is not None:
    st.subheader("Team Comparison Radar")
    metrics = ["elo", "squad_index", "team_xg", "avg_form", "power_score"]
    labels  = ["ELO (norm)", "Squad Index", "xG/90", "Form", "Power Score"]

    def normalise(series, val):
        mn, mx = series.min(), series.max()
        return (val - mn) / (mx - mn + 1e-6)

    vals_a = [normalise(rnk_df[m], rnk_a[m]) for m in metrics]
    vals_b = [normalise(rnk_df[m], rnk_b[m]) for m in metrics]

    fig_radar = go.Figure()
    fig_radar.add_scatterpolar(r=vals_a + [vals_a[0]], theta=labels + [labels[0]],
                               fill="toself", name=team_a, line_color="#F0B429",
                               fillcolor="rgba(240,180,41,0.15)")
    fig_radar.add_scatterpolar(r=vals_b + [vals_b[0]], theta=labels + [labels[0]],
                               fill="toself", name=team_b, line_color="#3A7BD5",
                               fillcolor="rgba(58,123,213,0.15)")
    fig_radar.update_layout(
        polar=dict(
            bgcolor="#1A2633",
            radialaxis=dict(visible=True, range=[0, 1], showticklabels=False, gridcolor="#2A3A4A"),
            angularaxis=dict(gridcolor="#2A3A4A"),
        ),
        paper_bgcolor="#0F1923", font_color="#E8EDF2",
        height=380, margin=dict(l=60, r=60, t=30, b=30),
        legend=dict(orientation="h", y=-0.1),
    )
    st.plotly_chart(fig_radar, use_container_width=True)
