"""
FIFA World Cup 2026 — Intelligence Platform
Main entry point. Run with: streamlit run app.py
"""
import streamlit as st

st.set_page_config(
    page_title="WC 2026 Intelligence Platform",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
/* Gold accent on metric labels */
[data-testid="stMetricLabel"] { color: #F0B429 !important; font-weight: 600; }
[data-testid="stMetricValue"] { font-size: 1.6rem !important; }
/* Sidebar nav links */
section[data-testid="stSidebar"] a { color: #E8EDF2 !important; }
/* Tab highlight */
button[data-baseweb="tab"][aria-selected="true"] {
    border-bottom: 2px solid #F0B429;
    color: #F0B429 !important;
}
/* Dataframe headers */
[data-testid="stDataFrame"] th { background: #1A2633 !important; color: #F0B429 !important; }
/* Progress bars */
.stProgress > div > div { background: #F0B429 !important; }
/* Hide default page header */
header[data-testid="stHeader"] { background: transparent; }
/* Divider */
hr { border-color: #2A3A4A !important; }
</style>
""", unsafe_allow_html=True)

# ── Sidebar brand ─────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="text-align:center;padding:1rem 0 0.5rem;">
        <div style="font-size:2.5rem;">⚽</div>
        <div style="color:#F0B429;font-weight:700;font-size:1.1rem;letter-spacing:.05em;">WC 2026</div>
        <div style="color:#8A9BAD;font-size:.75rem;">Intelligence Platform</div>
    </div>
    <hr style="margin:.5rem 0 1rem;"/>
    """, unsafe_allow_html=True)

    st.caption("Navigate using the pages below or the top nav.")
    st.markdown("""
    **Pages**
    - 🏠 Home Dashboard
    - ⚽ Match Predictor
    - 🏆 Tournament Simulator
    - 📊 Team Analytics
    - 👤 Player Analytics
    - ⭐ Fantasy Hub
    """)

    st.divider()
    st.caption("Data: WC 2026 ML Pipeline · ELO v2 · 10k Monte Carlo sims")

# ── Home page content ─────────────────────────────────────────────────────────
from utils.data_loader import load_simulation, load_power_rankings, load_elo

st.markdown("""
<div style='text-align:center;padding:2.5rem 0 1.5rem;'>
    <div style='font-size:3.5rem;'>⚽</div>
    <h1 style='color:#F0B429;font-size:2.4rem;font-weight:800;margin:.4rem 0 .2rem;'>
        FIFA World Cup 2026
    </h1>
    <h2 style='color:#E8EDF2;font-size:1.25rem;font-weight:400;margin:0;'>
        Intelligence Platform
    </h2>
    <p style='color:#8A9BAD;font-size:.9rem;margin-top:.6rem;'>
        ML-powered predictions · ELO rankings · 10,000-run Monte Carlo simulation
    </p>
</div>
""", unsafe_allow_html=True)

# ── Key stats row ──────────────────────────────────────────────────────────────
sim  = load_simulation()
rnk  = load_power_rankings()

col1, col2, col3, col4 = st.columns(4)
col1.metric("Teams", "48", "FIFA 2026 Format")
col2.metric("Groups", "12", "4 teams each")
col3.metric("Total Matches", "104", "Group + Knockout")
col4.metric("Simulations", "10,000", "Monte Carlo")

st.divider()

# ── Top champion probabilities ──────────────────────────────────────────────────
st.subheader("🏆 Championship Probabilities — Top 10")
top10 = sim.sort_values("p_winner", ascending=False).head(10).reset_index(drop=True)

for i, row in top10.iterrows():
    c1, c2, c3, c4 = st.columns([2, 4, 1, 1])
    c1.markdown(f"**#{i+1} {row['team']}**  <span style='color:#8A9BAD;font-size:.8rem;'>Grp {row.get('group','?')}</span>", unsafe_allow_html=True)
    pct = float(row["p_winner"])
    c2.progress(min(pct, 1.0))
    c3.markdown(f"<span style='color:#F0B429;font-weight:700;'>{pct*100:.1f}%</span>", unsafe_allow_html=True)
    c4.markdown(f"<span style='color:#8A9BAD;font-size:.8rem;'>SF: {row.get('reach_sf_pct',0):.0f}%</span>", unsafe_allow_html=True)

st.divider()

# ── Power Rankings top 10 ──────────────────────────────────────────────────────
st.subheader("📊 Top 10 Power Rankings")
top_pr = rnk.head(10)[["power_rank","team","group","elo","squad_index","power_score"]].copy()
top_pr.columns = ["Rank","Team","Group","ELO","Squad Index","Power Score"]
st.dataframe(top_pr, use_container_width=True, hide_index=True)

st.divider()

# ── Nav cards ─────────────────────────────────────────────────────────────────
st.subheader("Navigate to")
nav_cols = st.columns(5)
pages = [
    ("⚽", "Match Predictor",       "Predict any head-to-head"),
    ("🏆", "Tournament Simulator",  "Full bracket & champion odds"),
    ("📊", "Team Analytics",        "Rankings, ELO, group analysis"),
    ("👤", "Player Analytics",      "1,248 players ranked & scored"),
    ("⭐", "Fantasy Hub",           "Best XI, captains & differentials"),
]
for col, (icon, title, desc) in zip(nav_cols, pages):
    with col:
        st.markdown(f"""
        <div style='background:#1A2633;border:1px solid #2A3A4A;border-radius:8px;
                    padding:1rem;text-align:center;height:110px;'>
            <div style='font-size:1.8rem;'>{icon}</div>
            <div style='color:#F0B429;font-weight:600;font-size:.85rem;margin:.3rem 0 .2rem;'>{title}</div>
            <div style='color:#8A9BAD;font-size:.73rem;'>{desc}</div>
        </div>
        """, unsafe_allow_html=True)

st.caption("Use the sidebar to navigate between pages.")
