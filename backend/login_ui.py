"""Login screen for Streamlit — replace login_user() with real API auth later."""

import streamlit as st


def login_styles():
    st.markdown(
        """
        <style>
        #MainMenu, footer, header { visibility: hidden; }
        .stApp {
            background: linear-gradient(160deg, #050a14 0%, #0a1628 45%, #071a12 100%);
        }
        [data-testid="stForm"] {
            border: 1px solid rgba(0, 212, 255, 0.25);
            border-radius: 20px;
            padding: 1.5rem;
            background: rgba(13, 31, 60, 0.85);
            backdrop-filter: blur(12px);
        }
        .login-brand {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffd700, #ff6b2b, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.25rem;
        }
        .login-tagline { color: #9ca3af; margin-bottom: 1.5rem; }
        .preview-card {
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 16px;
            padding: 1.25rem;
            background: rgba(0, 0, 0, 0.35);
            margin-bottom: 1rem;
        }
        .preview-stat {
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            background: rgba(255,255,255,0.04);
            margin-bottom: 0.5rem;
        }
        .preview-stat strong { color: #00d4ff; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def login_preview_panel():
    st.markdown(
        """
        <div class="preview-card">
            <p style="color:#9ca3af;font-size:0.75rem;letter-spacing:0.15em;">IPL • LIVE PREVIEW</p>
            <p style="font-size:1.25rem;font-weight:700;color:#fff;">RCB vs CSK</p>
            <p style="font-size:1.75rem;font-weight:800;color:#ffd700;">186/4 <span style="font-size:0.85rem;color:#9ca3af;">(18.2)</span></p>
        </div>
        <div class="preview-stat"><span style="color:#9ca3af;">Batter</span><br><strong>V Kohli</strong> — 78 (52)</div>
        <div class="preview-stat"><span style="color:#9ca3af;">vs Bowler</span><br><strong style="color:#ff6b2b;">J Bumrah</strong> — 24 off 18</div>
        <div class="preview-stat">Strike rate <strong>142.8</strong> · Dot % <strong style="color:#ffd700;">31.2%</strong></div>
        <p style="color:#6b7280;font-size:0.85rem;margin-top:1rem;">
            Matchups, player stats, teams &amp; AI chat — unlock after sign-in.
        </p>
        """,
        unsafe_allow_html=True,
    )


def login_user():
    """
    Show login UI. Returns True if authenticated.
    Later: call your API here and set st.session_state.user + token.
    """
    if st.session_state.get("authenticated"):
        return True

    login_styles()

    left, right = st.columns([1, 1], gap="large")

    with left:
        st.markdown('<p class="login-brand">IPL Nexus AI</p>', unsafe_allow_html=True)
        st.markdown(
            '<p class="login-tagline">Smart IPL Stats &amp; Matchup Analyzer</p>',
            unsafe_allow_html=True,
        )

        with st.form("login_form", clear_on_submit=False):
            email = st.text_input("Email", placeholder="you@example.com")
            password = st.text_input("Password", type="password", placeholder="••••••••")
            submitted = st.form_submit_button("Login", use_container_width=True)

        if submitted:
            if email.strip() and password.strip():
                st.session_state.authenticated = True
                st.session_state.user_email = email.strip()
                st.rerun()
            else:
                st.error("Please enter email and password.")

        c1, c2 = st.columns(2)
        with c1:
            st.caption("Forgot password? — connect API later")
        with c2:
            st.caption("Create account — connect API later")

        st.info("Demo login: any non-empty email and password.")

    with right:
        st.markdown("### Analytics preview")
        login_preview_panel()

    return False
