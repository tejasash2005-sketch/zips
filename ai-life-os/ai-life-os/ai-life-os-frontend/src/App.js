import React, { useState, useEffect, useCallback } from "react";
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiAskAI,
  apiGetAIStatus,
  apiGetTasks,
  apiCreateTask,
  apiUpdateTask,
  apiGetFinance,
  apiUpdateFinance,
  apiGetWatchlist,
  apiAddWatchlist,
  apiGetCoachClients,
  apiGetClientDetails,
  apiAssignCoachTask,
  apiGetAdminStats,
  apiGetAdminUsers,
  apiUpdateUserRole,
  apiDeleteUser,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
} from "./services/api";

// ── Palette — Warm Amber / Coral / Sage / Violet ─────────────────────────────
const C = {
  bg: "#faf7f2",
  surface: "#ffffff",
  card: "#fdf9f4",
  border: "#e8ddd0",
  borderHover: "#c8a882",
  accent: "#d97706",       // amber
  accent2: "#e85d4a",      // coral-red
  accent3: "#059669",      // sage-green
  accent4: "#7c3aed",      // violet
  accent5: "#db2777",      // rose
  gold: "#f59e0b",
  green: "#10b981",
  red: "#ef4444",
  text: "#1c1410",
  muted: "#78716c",
  dim: "#f5efe8",
  dimBorder: "#ede4d8",
  sidebarBg: "#1c1410",
  sidebarText: "#e8d5b7",
  sidebarMuted: "#9c8470",
  sidebarActive: "#d97706",
};

function Typewriter({ text, speed = 8 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span style={{ whiteSpace: "pre-wrap" }}>{displayed}<span style={{ animation: "blink 1s step-end infinite", color: C.accent }}>▋</span></span>;
}

function Spinner({ label = "AI is processing via Groq/Ollama…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, padding: "12px 0" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} />
      {label}
    </div>
  );
}

function AIBox({ response, loading, provider, borderColor }) {
  if (loading) return <Spinner />;
  if (!response) return null;
  return (
    <div style={{ background: C.dim, borderRadius: 14, padding: 20, marginTop: 16, border: `1.5px solid ${borderColor || C.accent}55`, fontSize: 14, color: C.text, lineHeight: 1.8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, fontWeight: 700 }}>✦ AI RESPONSE</div>
        {provider && <span style={{ fontSize: 10, color: C.accent3, background: C.accent3 + "22", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>⚡ {provider}</span>}
      </div>
      <Typewriter text={response} speed={8} />
    </div>
  );
}

function Tag({ children, color, bg }) {
  return <span style={{ background: bg || C.dim, color: color || C.accent, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${color || C.accent}33` }}>{children}</span>;
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      </div>
      {subtitle && <div style={{ fontSize: 13, color: C.muted, marginLeft: 32 }}>{subtitle}</div>}
    </div>
  );
}

const inputStyle = {
  background: C.dim, border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: "10px 14px", color: C.text, fontSize: 14, width: "100%",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const btnPrimary = {
  background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, border: "none",
  borderRadius: 10, padding: "11px 20px", color: "#fff", fontWeight: 700,
  cursor: "pointer", fontSize: 14, transition: "opacity 0.2s, transform 0.15s",
};

const btnSecondary = {
  background: C.dim, border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: "9px 16px", color: C.muted, fontWeight: 600, cursor: "pointer", fontSize: 13,
};

const chipStyle = {
  border: "1.5px solid transparent", borderRadius: 20, padding: "5px 14px",
  cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1.5px solid ${C.border}`, ...style }}>
    {children}
  </div>
);

// ── VIDEO TOUR MODAL ─────────────────────────────────────────────────────────
function VideoTourModal({ onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 12000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 840, background: "#000", borderRadius: 16, overflow: "hidden", border: `1.5px solid ${C.accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: C.sidebarBg, color: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>🎬 AI Life OS — 2-Minute Product Walkthrough</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src="https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&rel=0"
            title="Product Walkthrough Video"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// ── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await apiRegister(name, email, password, role);
      } else {
        res = await apiLogin(email, password);
      }

      setAuthToken(res.token);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 18, width: "100%", maxWidth: 420, padding: 28, border: `1.5px solid ${C.border}`, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: C.text }}>
            {isRegister ? "Join AI Life OS" : "Welcome Back"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}>✕</button>
        </div>

        {error && <div style={{ background: C.red + "15", border: `1px solid ${C.red}`, color: C.red, borderRadius: 8, padding: 10, fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 4 }}>FULL NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Johnson" style={inputStyle} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 4 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="alex@example.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 4 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 6 }}>ACCOUNT ROLE</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[["user", "👤 Individual"], ["coach", "🎓 Coach"], ["admin", "👑 Admin"]].map(([r, label]) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    style={{ ...chipStyle, background: role === r ? C.accent : C.dim, color: role === r ? "#fff" : C.muted, border: `1.5px solid ${role === r ? C.accent : C.border}`, fontSize: 11, textAlign: "center", padding: "8px 4px" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 10, padding: 12 }}>
            {loading ? "Processing…" : isRegister ? "Create Account →" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: C.muted }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => { setIsRegister(!isRegister); setError(""); }} style={{ color: C.accent, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
            {isRegister ? "Sign In" : "Register"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADVANCED WEBSITE HOMEPAGE (LANDING PAGE)
// ══════════════════════════════════════════════════════════════════════════════
function AdvancedHomepage({ onOpenAuth, onSelectModule, aiStatus }) {
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroAIResponse, setHeroAIResponse] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState("individual");

  const samplePrompts = [
    "How can I save $10,000 this year on a $60k income?",
    "Generate a 90-day startup launch roadmap for a SaaS tool.",
    "Give me an optimal daily focus routine for high energy.",
  ];

  const handleLiveQuery = async (pText) => {
    const q = pText || heroPrompt;
    if (!q) return;
    setHeroLoading(true);
    setHeroAIResponse("");
    try {
      const res = await apiAskAI(q, "You are AI Life OS, an ultra-intelligent personal operating system. Give a concise, high-value, actionable answer with exact bullet points.");
      setHeroAIResponse(res.response);
    } catch (err) {
      setHeroAIResponse("⚠️ Error connecting to AI. Please ensure backend is active.");
    } finally {
      setHeroLoading(false);
    }
  };

  const moduleShowcase = [
    { id: "finance", title: "AI Finance Command", desc: "Track cashflow, net worth, automated debt payoff & goal acceleration.", img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80", tag: "Wealth" },
    { id: "startup", title: "Startup Blueprint Builder", desc: "Validate market ideas, generate investor pitch scripts, and calculate CAC/MRR.", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", tag: "Venture" },
    { id: "daily", title: "Daily Habits & Tasks", desc: "AI task sequencing, pomodoro timer, mood tracking & daily journal analytics.", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80", tag: "Focus" },
    { id: "career", title: "Career Intelligence", desc: "Resume ATS optimizer, interview question practice & roadmap to target executive roles.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", tag: "Growth" },
    { id: "movies", title: "Movie Intelligence & Watch", desc: "Watch 10+ legal public domain films free + streaming platform tracking.", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80", tag: "Entertainment" },
    { id: "travel", title: "Smart Travel Planner", desc: "Daily budget calculators, bucket list management, and custom trip itineraries.", img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80", tag: "Adventure" },
    { id: "solver", title: "Universal AI Solver", desc: "Decision matrices, essay drafting, debate arguments, and root cause resolution.", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", tag: "Strategy" },
    { id: "vault", title: "Knowledge & Values Vault", desc: "Lifetime wiki, core principles bank, and reflections catalog.", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80", tag: "Memory" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {showVideo && <VideoTourModal onClose={() => setShowVideo(false)} />}

      {/* Hero Header / Banner */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(250, 247, 242, 0.9)", backdropFilter: "blur(12px)", borderBottom: `1.5px solid ${C.border}`, padding: "14px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 900 }}>⚡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: C.text }}>AI Life OS</span>
            <span style={{ fontSize: 10, background: C.accent3 + "22", color: C.accent3, padding: "3px 8px", borderRadius: 12, fontWeight: 700, marginLeft: 6 }}>v2.0 Production</span>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 13, fontWeight: 600, color: C.muted }}>
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
            <a href="#roles" style={{ color: "inherit", textDecoration: "none" }}>3-Role System</a>
            <a href="#demo" style={{ color: "inherit", textDecoration: "none" }}>Live Demo</a>
            <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={onOpenAuth} style={{ ...btnSecondary, padding: "8px 16px" }}>Sign In</button>
            <button onClick={onOpenAuth} style={{ ...btnPrimary, padding: "8px 18px" }}>Get Started Free →</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "64px 20px 48px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accent + "18", border: `1px solid ${C.accent}44`, padding: "6px 16px", borderRadius: 30, fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 20 }}>
          <span>✨ Powered by Groq AI & Llama 3.3 (0.2s Speed)</span>
          <span style={{ color: C.muted }}>•</span>
          <span style={{ color: C.accent3 }}>100% Data Sync</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, lineHeight: 1.15, marginBottom: 18, color: C.text }}>
          Operate Your Entire Life With<br />
          <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Superhuman Intelligence
          </span>
        </h1>

        <p style={{ fontSize: 18, color: C.muted, maxWidth: 720, margin: "0 auto 32px", lineHeight: 1.6 }}>
          The ultimate unified workspace for personal finances, daily habits, startup ventures, career planning, travel, and role-based life coaching.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          <button onClick={onOpenAuth} style={{ ...btnPrimary, padding: "14px 32px", fontSize: 16 }}>🚀 Launch Free Life OS</button>
          <button onClick={() => setShowVideo(true)} style={{ ...btnSecondary, padding: "14px 26px", fontSize: 15, background: C.surface, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🎬 Watch Product Tour</span>
          </button>
        </div>

        {/* Live AI Playground inside Hero */}
        <div id="demo" style={{ background: C.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 16px 36px rgba(0,0,0,0.06)", maxWidth: 820, margin: "0 auto", textAlign: "left" }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>⚡ TRY LIVE AI DEMO (NO LOGIN REQUIRED)</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={heroPrompt}
              onChange={e => setHeroPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLiveQuery()}
              placeholder="Ask AI Life OS any goal or life question..."
              style={{ ...inputStyle, padding: "12px 16px", fontSize: 14, flex: 1 }}
            />
            <button onClick={() => handleLiveQuery()} style={{ ...btnPrimary, padding: "12px 24px" }} disabled={heroLoading}>
              {heroLoading ? "Thinking…" : "Ask AI ⚡"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {samplePrompts.map((sp, i) => (
              <button key={i} onClick={() => { setHeroPrompt(sp); handleLiveQuery(sp); }} style={{ ...chipStyle, background: C.dim, color: C.muted, border: `1px solid ${C.border}`, fontSize: 11 }}>
                "{sp}"
              </button>
            ))}
          </div>

          <AIBox response={heroAIResponse} loading={heroLoading} provider={aiStatus?.activeProvider} />
        </div>
      </section>

      {/* Real Product Video / Image Showcase Banner */}
      <section style={{ maxWidth: 1100, margin: "0 auto 64px", padding: "0 20px" }}>
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: `2px solid ${C.border}`, boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
          <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80" alt="Dashboard Preview" style={{ width: "100%", height: 420, objectFit: "cover", filter: "brightness(0.75)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(28,20,16,0.95), transparent 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 32 }}>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>Interactive Platform Tour</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Unified Dashboard & Real-Time Sync</div>
            <div style={{ fontSize: 14, color: "#d1d5db", maxWidth: 600, marginBottom: 16 }}>Experience seamless productivity across tasks, finance, venture planning, and life coaching.</div>
            <button onClick={() => setShowVideo(true)} style={{ ...btnPrimary, width: "fit-content", background: "linear-gradient(135deg,#ff0000,#cc0000)", padding: "10px 22px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span>▶ Play Full 2-Minute Walkthrough Video</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section style={{ background: C.sidebarBg, color: "#fff", padding: "28px 20px", marginBottom: 64 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, textAlign: "center" }}>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: C.gold, fontFamily: "'Playfair Display', serif" }}>0.2s</div><div style={{ fontSize: 12, color: C.sidebarMuted }}>AI Response Speed (Groq)</div></div>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: C.accent3, fontFamily: "'Playfair Display', serif" }}>8+</div><div style={{ fontSize: 12, color: C.sidebarMuted }}>Integrated Life Modules</div></div>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: C.accent2, fontFamily: "'Playfair Display', serif" }}>3 Roles</div><div style={{ fontSize: 12, color: C.sidebarMuted }}>User, Coach & Admin</div></div>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: C.accent4, fontFamily: "'Playfair Display', serif" }}>100%</div><div style={{ fontSize: 12, color: C.sidebarMuted }}>Persistent Data Sync</div></div>
        </div>
      </section>

      {/* 3-Role System Section */}
      <section id="roles" style={{ maxWidth: 1100, margin: "0 auto 64px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Tag color={C.accent4}>ROLE-BASED SYSTEM (RBAC)</Tag>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 900, marginTop: 10 }}>Built for Individuals, Life Coaches & Organizations</h2>
          <p style={{ fontSize: 15, color: C.muted }}>Custom tailored workflows for every participant in your life ecosystem.</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          {[["individual", "👤 Individual User"], ["coach", "🎓 Life Coach / Mentor"], ["admin", "👑 System Admin"]].map(([r, label]) => (
            <button key={r} onClick={() => setActiveRoleTab(r)} style={{ ...chipStyle, padding: "10px 20px", background: activeRoleTab === r ? C.accent4 : C.surface, color: activeRoleTab === r ? "#fff" : C.muted, border: `1.5px solid ${activeRoleTab === r ? C.accent4 : C.border}` }}>
              {label}
            </button>
          ))}
        </div>

        <Card style={{ padding: 32 }}>
          {activeRoleTab === "individual" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
              <div>
                <Tag color={C.accent}>PERSONAL LIFE WORKSPACE</Tag>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 10, marginBottom: 12 }}>Empower Your Daily Execution</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14 }}>
                  Track budgets, build 90-day startup blueprints, optimize daily habits with Pomodoro timers, plan trips, and solve complex decisions using Groq-accelerated AI.
                </p>
                <button onClick={onOpenAuth} style={{ ...btnPrimary, marginTop: 16 }}>Start Personal OS →</button>
              </div>
              <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80" alt="Individual UI" style={{ width: "100%", borderRadius: 12, objectFit: "cover", height: 240 }} />
            </div>
          )}

          {activeRoleTab === "coach" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
              <div>
                <Tag color={C.accent4}>COACH & MENTOR PORTAL</Tag>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 10, marginBottom: 12 }}>Guide Clients to Peak Performance</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14 }}>
                  Inspect client progress summaries, track task completion rates, review recent journal moods, and assign targeted life actions directly to your clients' dashboards.
                </p>
                <button onClick={onOpenAuth} style={{ ...btnPrimary, background: C.accent4, marginTop: 16 }}>Open Coach Portal →</button>
              </div>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80" alt="Coach UI" style={{ width: "100%", borderRadius: 12, objectFit: "cover", height: 240 }} />
            </div>
          )}

          {activeRoleTab === "admin" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
              <div>
                <Tag color={C.accent2}>ADMIN COMMAND CENTER</Tag>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 10, marginBottom: 12 }}>Total Governance & User Directory</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14 }}>
                  Full administrative control—reassign roles between Individual, Coach, and Admin, review system health statistics, monitor AI API usage, and manage user data.
                </p>
                <button onClick={onOpenAuth} style={{ ...btnPrimary, background: C.accent2, marginTop: 16 }}>Access Admin Center →</button>
              </div>
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80" alt="Admin UI" style={{ width: "100%", borderRadius: 12, objectFit: "cover", height: 240 }} />
            </div>
          )}
        </Card>
      </section>

      {/* Module Grid with Images */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto 64px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Tag color={C.accent3}>INTEGRATED MODULES</Tag>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 900, marginTop: 10 }}>Every Surface of Your Life, Optimized</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {moduleShowcase.map(m => (
            <Card key={m.id} style={{ padding: 0, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <img src={m.img} alt={m.title} style={{ width: "100%", height: 130, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <Tag color={C.accent}>{m.tag}</Tag>
                <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8, marginBottom: 4, color: C.text }}>{m.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>{m.desc}</div>
                <button onClick={() => onSelectModule(m.id)} style={{ ...btnSecondary, width: "100%", padding: "6px 12px", fontSize: 11 }}>
                  Explore {m.title} →
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: 1000, margin: "0 auto 64px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Tag color={C.gold}>TRANSPARENT PRICING</Tag>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 900, marginTop: 10 }}>Simple Plans for Individuals & Coaches</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>FREE TIER</div>
            <div style={{ fontSize: 32, fontWeight: 900, margin: "8px 0", fontFamily: "'Playfair Display', serif" }}>$0<span style={{ fontSize: 14, color: C.muted }}>/forever</span></div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Essential life tracking for individuals.</div>
            <ul style={{ fontSize: 13, color: C.text, paddingLeft: 18, lineHeight: 1.8, marginBottom: 20 }}>
              <li>Full access to all 8 modules</li>
              <li>Ollama & Groq AI engine</li>
              <li>Database sync</li>
            </ul>
            <button onClick={onOpenAuth} style={{ ...btnSecondary, width: "100%" }}>Get Started Free</button>
          </Card>

          <Card style={{ padding: 24, border: `2px solid ${C.accent}`, background: C.card }}>
            <Tag color={C.accent}>MOST POPULAR</Tag>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginTop: 8 }}>PRO LIFE OS</div>
            <div style={{ fontSize: 32, fontWeight: 900, margin: "8px 0", color: C.accent, fontFamily: "'Playfair Display', serif" }}>$15<span style={{ fontSize: 14, color: C.muted }}>/month</span></div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>High-speed AI for power planners.</div>
            <ul style={{ fontSize: 13, color: C.text, paddingLeft: 18, lineHeight: 1.8, marginBottom: 20 }}>
              <li>Unlimited Groq 0.2s queries</li>
              <li>Priority AI response speed</li>
              <li>Advanced net worth forecasts</li>
            </ul>
            <button onClick={onOpenAuth} style={{ ...btnPrimary, width: "100%" }}>Upgrade to Pro →</button>
          </Card>

          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>COACH & ENTERPRISE</div>
            <div style={{ fontSize: 32, fontWeight: 900, margin: "8px 0", fontFamily: "'Playfair Display', serif" }}>$49<span style={{ fontSize: 14, color: C.muted }}>/month</span></div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>For mentors, coaches & leads.</div>
            <ul style={{ fontSize: 13, color: C.text, paddingLeft: 18, lineHeight: 1.8, marginBottom: 20 }}>
              <li>Unlimited client assignments</li>
              <li>Coach Portal & task assignment</li>
              <li>Admin governance controls</li>
            </ul>
            <button onClick={onOpenAuth} style={{ ...btnSecondary, width: "100%" }}>Join as Coach</button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.sidebarBg, color: C.sidebarMuted, padding: "40px 20px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>⚡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.gold, fontWeight: 700 }}>AI Life OS</span>
          </div>
          <div style={{ fontSize: 12 }}>Powered by Groq Cloud API, Express.js & MongoDB Atlas</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12 }}>© 2025 AI Life OS. All rights reserved. Production Ready Release.</div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COACH PORTAL MODULE
// ══════════════════════════════════════════════════════════════════════════════
function CoachModule() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({ label: "", priority: "high", category: "personal" });
  const [taskMsg, setTaskMsg] = useState("");

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiGetCoachClients();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const selectClient = async (client) => {
    setSelectedClient(client);
    try {
      const details = await apiGetClientDetails(client._id);
      setClientDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const assignTask = async () => {
    if (!newTask.label || !selectedClient) return;
    try {
      await apiAssignCoachTask(selectedClient._id, newTask);
      setTaskMsg(`✅ Task assigned to ${selectedClient.name}`);
      setNewTask({ label: "", priority: "high", category: "personal" });
      selectClient(selectedClient);
      setTimeout(() => setTaskMsg(""), 3000);
    } catch (err) {
      setTaskMsg(`⚠️ Error: ${err.message}`);
    }
  };

  return (
    <div>
      <SectionTitle icon="🎓" title="Coach & Mentor Portal" subtitle="Oversee client progress, review habits, and assign targeted life actions" />

      {loading ? <Spinner label="Loading assigned clients..." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          {/* Clients List */}
          <Card>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>YOUR CLIENTS ({clients.length})</div>
            {clients.map(c => (
              <div key={c._id} onClick={() => selectClient(c)}
                style={{
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
                  background: selectedClient?._id === c._id ? C.accent + "18" : C.dim,
                  border: `1.5px solid ${selectedClient?._id === c._id ? C.accent : C.border}`,
                }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.email}</div>
              </div>
            ))}
            {clients.length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 20 }}>No clients currently assigned to you.</div>}
          </Card>

          {/* Client Details */}
          <div>
            {selectedClient && clientDetails ? (
              <div>
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>{selectedClient.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{selectedClient.email}</div>
                    </div>
                    <Tag color={C.accent3}>Active Client</Tag>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    <div style={{ background: C.dim, padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>TASKS COMPLETED</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.accent3 }}>{clientDetails.summary.completedTasks} / {clientDetails.summary.totalTasks}</div>
                    </div>
                    <div style={{ background: C.dim, padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>MONTHLY INCOME</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>${clientDetails.summary.finance.income || 0}</div>
                    </div>
                    <div style={{ background: C.dim, padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>RECENT MOOD</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.accent4, textTransform: "capitalize" }}>{clientDetails.summary.recentJournalMood}</div>
                    </div>
                  </div>
                </Card>

                <Card style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>ASSIGN COACHING ACTION TO CLIENT</div>
                  {taskMsg && <div style={{ fontSize: 12, color: C.accent3, marginBottom: 8, fontWeight: 600 }}>{taskMsg}</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Describe task for client…" value={newTask.label} onChange={e => setNewTask({ ...newTask, label: e.target.value })} style={{ ...inputStyle, flex: 2 }} />
                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                    </select>
                    <button onClick={assignTask} style={btnPrimary}>Assign Task</button>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>CLIENT'S RECENT TASKS</div>
                  {clientDetails.tasks.map(t => (
                    <div key={t._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? C.muted : C.text }}>{t.label}</span>
                      <Tag color={t.done ? C.green : C.accent}>{t.done ? "Done" : "Pending"}</Tag>
                    </div>
                  ))}
                </Card>
              </div>
            ) : (
              <Card style={{ textAlign: "center", padding: 40, color: C.muted }}>Select a client from the list to view life metrics and assign coaching actions.</Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN MODULE
// ══════════════════════════════════════════════════════════════════════════════
function AdminModule() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, uData] = await Promise.all([apiGetAdminStats(), apiGetAdminUsers(search)]);
      setStats(sData);
      setUsers(uData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiUpdateUserRole(userId, newRole);
      setMsg(`✅ Role updated to ${newRole}`);
      loadData();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(`⚠️ ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their data?")) return;
    try {
      await apiDeleteUser(userId);
      setMsg("✅ User deleted");
      loadData();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(`⚠️ ${err.message}`);
    }
  };

  return (
    <div>
      <SectionTitle icon="👑" title="Admin Command Center" subtitle="Role-Based Access Control, user directory, system statistics, and platform health" />

      {msg && <div style={{ background: C.accent3 + "22", border: `1px solid ${C.accent3}`, color: C.accent3, padding: 10, borderRadius: 8, marginBottom: 14, fontWeight: 600, fontSize: 13 }}>{msg}</div>}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>TOTAL USERS</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.accent }}>{stats.metrics.totalUsers}</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>COACHES / MENTORS</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.accent4 }}>{stats.metrics.totalCoaches}</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>SYSTEM ADMINS</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.accent2 }}>{stats.metrics.totalAdmins}</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>TOTAL TASKS</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>{stats.metrics.totalTasks}</div>
          </Card>
        </div>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>USER DIRECTORY & ROLE MANAGEMENT</div>
          <input placeholder="🔍 Search users by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 240, padding: "6px 12px" }} />
        </div>

        {loading ? <Spinner label="Loading user directory..." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.muted, fontSize: 11 }}>
                  <th style={{ padding: "8px 10px" }}>NAME</th>
                  <th style={{ padding: "8px 10px" }}>EMAIL</th>
                  <th style={{ padding: "8px 10px" }}>CURRENT ROLE</th>
                  <th style={{ padding: "8px 10px" }}>ASSIGN ROLE</th>
                  <th style={{ padding: "8px 10px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px", fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: "10px", color: C.muted }}>{u.email}</td>
                    <td style={{ padding: "10px" }}>
                      <Tag color={u.role === "admin" ? C.accent2 : u.role === "coach" ? C.accent4 : C.accent3}>{u.role.toUpperCase()}</Tag>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12 }}>
                        <option value="user">User</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <button onClick={() => handleDeleteUser(u._id)} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 11, color: C.red, borderColor: C.red + "44" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE & MEMORY VAULT MODULE
// ══════════════════════════════════════════════════════════════════════════════
function VaultModule() {
  const [notes, setNotes] = useState([
    { id: 1, title: "Long term 10 year vision", content: "Build financial independence, mentor young founders, write a book on life OS systems.", tag: "Vision" },
    { id: 2, title: "Key Principles for High Energy", content: "Hydrate immediately on waking, 20min sun exposure, no phones in bed.", tag: "Health" },
  ]);
  const [newNote, setNewNote] = useState({ title: "", content: "", tag: "General" });
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askVault = async () => {
    setLoading(true); setAiResponse("");
    const vaultContext = notes.map(n => `[${n.tag}] ${n.title}: ${n.content}`).join("\n");
    const r = await apiAskAI(`Here are my saved life vault entries:\n${vaultContext}\n\nBased on my vault entries, synthesize a lifetime action plan and key patterns.`, "You are a life strategist analyzing lifetime notes.");
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="📚" title="Knowledge & Memory Vault" subtitle="Store life principles, core values, and lifetime reflections" />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>ADD NEW VAULT ENTRY</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
          <input placeholder="Title (e.g. Core Family Values)" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} style={inputStyle} />
          <input placeholder="Tag (e.g. Vision, Rules)" value={newNote.tag} onChange={e => setNewNote({ ...newNote, tag: e.target.value })} style={inputStyle} />
        </div>
        <textarea placeholder="Write content or life reflection..." value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <button onClick={() => { if (newNote.title) { setNotes([...notes, { ...newNote, id: Date.now() }]); setNewNote({ title: "", content: "", tag: "General" }); }}} style={{ ...btnPrimary, marginTop: 10 }}>Save to Vault</button>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {notes.map(n => (
          <Card key={n.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{n.title}</span>
              <Tag color={C.accent4}>{n.tag}</Tag>
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{n.content}</div>
          </Card>
        ))}
      </div>

      <button onClick={askVault} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Analyzing Vault..." : "🤖 Ask AI to Synthesize Vault Principles"}
      </button>
      <AIBox response={aiResponse} loading={loading} borderColor={C.accent4} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXISTING MODULES (FINANCE, MOVIES, CAREER, TRAVEL, STARTUP, DAILY, SOLVER)
// ══════════════════════════════════════════════════════════════════════════════

// FINANCE MODULE
function FinanceModule() {
  const [income, setIncome] = useState("5000");
  const [expenses, setExpenses] = useState([]);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [newExp, setNewExp] = useState({ name: "", amount: "", category: "other" });

  useEffect(() => {
    apiGetFinance().then(data => {
      if (data.income) setIncome(data.income.toString());
      if (data.expenses) setExpenses(data.expenses);
    }).catch(err => console.error(err));
  }, []);

  const handleAddExpense = async () => {
    if (!newExp.name || !newExp.amount) return;
    try {
      const updated = await apiUpdateFinance({ income: Number(income), expenses: [...expenses, { ...newExp, amount: Number(newExp.amount) }] });
      setExpenses(updated.expenses);
      setNewExp({ name: "", amount: "", category: "other" });
    } catch (err) {
      console.error(err);
    }
  };

  const analyze = async () => {
    setLoading(true);
    const r = await apiAskAI(`Analyze my budget: Income $${income}/mo. Expenses: ${expenses.map(e => `${e.name}: $${e.amount}`).join(", ")}. Provide wealth projection & savings optimization.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="💰" title="AI Finance Command" subtitle="Track monthly income, recurring expenses, and wealth goals" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><label style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>MONTHLY INCOME ($)</label><input value={income} onChange={e => setIncome(e.target.value)} style={inputStyle} type="number" /></div>
          <div><label style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>TOTAL EXPENSES</label><div style={{ fontSize: 20, fontWeight: 900, color: C.accent2 }}>${expenses.reduce((a, b) => a + Number(b.amount || 0), 0)}</div></div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>EXPENSE ITEMS</div>
        {expenses.map((e, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span>{e.name} ({e.category})</span>
            <span style={{ fontWeight: 700, color: C.accent2 }}>${e.amount}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input placeholder="Expense name" value={newExp.name} onChange={e => setNewExp({ ...newExp, name: e.target.value })} style={{ ...inputStyle, flex: 2 }} />
          <input placeholder="$" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: e.target.value })} style={{ ...inputStyle, flex: 1 }} type="number" />
          <button onClick={handleAddExpense} style={btnPrimary}>+ Add</button>
        </div>
      </Card>
      <button onClick={analyze} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Analyzing..." : "🤖 Get AI Financial Intelligence"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// DAILY MODULE
function DailyModule() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const data = await apiGetTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreateTask = async () => {
    if (!newTask.trim()) return;
    try {
      const created = await apiCreateTask({ label: newTask, priority: "high" });
      setTasks([created, ...tasks]);
      setNewTask("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (task) => {
    try {
      const updated = await apiUpdateTask(task._id, { done: !task.done });
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    const r = await apiAskAI(`Here are my tasks for today: ${tasks.map(t => t.label).join(", ")}. Give me the optimal sequence to execute them.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="📊" title="Daily Tasks & AI Schedule" subtitle="Synchronized with database & powered by AI task sequencing" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input placeholder="Add new task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreateTask()} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleCreateTask} style={btnPrimary}>+ Add Task</button>
        </div>
        {tasks.map(t => (
          <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            <div onClick={() => handleToggle(t)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${t.done ? C.green : C.border}`, background: t.done ? C.green : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>
              {t.done && "✓"}
            </div>
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none", color: t.done ? C.muted : C.text, fontSize: 14 }}>{t.label}</span>
            <Tag color={C.accent}>{t.priority}</Tag>
          </div>
        ))}
      </Card>
      <button onClick={handleOptimize} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Optimizing..." : "⚡ Get AI Task Sequence Plan"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// MOVIES MODULE
function MoviesModule() {
  const [watchlist, setWatchlist] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    apiGetWatchlist().then(setWatchlist).catch(err => console.error(err));
  }, []);

  const addMovie = async () => {
    if (!title) return;
    try {
      const added = await apiAddWatchlist({ movieId: String(Date.now()), title, status: "watchlist" });
      setWatchlist([added, ...watchlist]);
      setTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <SectionTitle icon="🎬" title="Movie Watchlist & AI Recommendations" subtitle="Save films and generate personalized cinematic suggestions" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input placeholder="Movie Title..." value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addMovie} style={btnPrimary}>+ Add to Watchlist</button>
        </div>
        {watchlist.map(m => (
          <div key={m._id || m.movieId} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{m.title}</span>
            <Tag color={C.accent2}>{m.status}</Tag>
          </div>
        ))}
      </Card>
    </div>
  );
}

// STARTUP MODULE
function StartupModule() {
  const [idea, setIdea] = useState("");
  const [industry] = useState("SaaS");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBlueprint = async () => {
    if (!idea) return;
    setLoading(true);
    const r = await apiAskAI(`Startup Idea: ${idea}. Industry: ${industry}. Provide market validation, MVP core features, and 90-day launch roadmap.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="💡" title="Startup Blueprint Builder" subtitle="Validate ideas, generate pitch deck hooks, and outline growth loops" />
      <Card style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 6 }}>DESCRIBE STARTUP IDEA</label>
        <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={3} placeholder="AI platform for micro-learning..." style={{ ...inputStyle, resize: "none" }} />
      </Card>
      <button onClick={generateBlueprint} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Generating Blueprint..." : "🚀 Generate Startup Intelligence"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// SOLVER MODULE
function SolverModule() {
  const [problem, setProblem] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const solve = async () => {
    if (!problem) return;
    setLoading(true);
    const r = await apiAskAI(`Problem: "${problem}". Provide a 5-step strategic action plan and immediate next step.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="🧠" title="Universal Problem Solver" subtitle="Instant root cause analysis, action steps, and decision matrices" />
      <Card style={{ marginBottom: 16 }}>
        <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={4} placeholder="Describe any challenge or decision you are facing..." style={{ ...inputStyle, resize: "vertical" }} />
      </Card>
      <button onClick={solve} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Solving..." : "🧠 Resolve Problem with AI"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// CAREER MODULE
function CareerModule() {
  const [targetRole, setTargetRole] = useState("CTO");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    const r = await apiAskAI(`I want to achieve the role of ${targetRole}. Provide skill gaps, certifications to get, and networking strategy.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="🚀" title="Career Intelligence" subtitle="Roadmaps, interview prep, and skill gap analysis" />
      <Card style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 6 }}>TARGET ROLE</label>
        <input value={targetRole} onChange={e => setTargetRole(e.target.value)} style={inputStyle} />
      </Card>
      <button onClick={generatePlan} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Building Plan..." : "🎯 Generate Career Strategy"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// TRAVEL MODULE
function TravelModule() {
  const [budget, setBudget] = useState("2000");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const planTrip = async () => {
    setLoading(true);
    const r = await apiAskAI(`Plan a trip with a total budget of $${budget}. Suggest destinations, daily spending breakdown, and itinerary.`);
    setAiResponse(r.response);
    setLoading(false);
  };

  return (
    <div>
      <SectionTitle icon="✈️" title="Travel Command" subtitle="Smart trip planning, daily budgets, and bucket list tracking" />
      <Card style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, display: "block", marginBottom: 6 }}>TOTAL BUDGET ($)</label>
        <input value={budget} onChange={e => setBudget(e.target.value)} style={inputStyle} type="number" />
      </Card>
      <button onClick={planTrip} style={{ ...btnPrimary, width: "100%", padding: 13 }} disabled={loading}>
        {loading ? "Planning..." : "🌍 Generate AI Trip Plan"}
      </button>
      <AIBox response={aiResponse} loading={loading} />
    </div>
  );
}

// APP DASHBOARD FOR LOGGED IN USERS
function AppDashboard({ setTab, user }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: C.accent, marginBottom: 6, fontWeight: 700 }}>AI LIFE OPERATING SYSTEM</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.text, fontFamily: "'Playfair Display', serif" }}>
          Welcome back, <span style={{ color: C.accent }}>{user ? user.name : "Explorer"}</span>!
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          Role: <Tag color={user?.role === "admin" ? C.accent2 : user?.role === "coach" ? C.accent4 : C.accent3}>{(user?.role || "GUEST").toUpperCase()}</Tag>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { id: "finance", icon: "💰", label: "Finance", desc: "Wealth & Expenses", color: C.accent3 },
          { id: "movies", icon: "🎬", label: "Movies", desc: "Watchlist & Ratings", color: C.accent2 },
          { id: "career", icon: "🚀", label: "Career", desc: "Target Role Strategy", color: C.accent4 },
          { id: "travel", icon: "✈️", label: "Travel", desc: "Smart Trip Planning", color: C.gold },
          { id: "startup", icon: "💡", label: "Startup", desc: "Blueprint & Pitch", color: C.accent5 },
          { id: "daily", icon: "📊", label: "Daily AI", desc: "Tasks & Productivity", color: C.accent },
          { id: "solver", icon: "🧠", label: "Solver", desc: "Problem Resolution", color: C.accent4 },
          { id: "vault", icon: "📚", label: "Vault", desc: "Knowledge & Values", color: C.accent3 },
          ...(user?.role === "coach" || user?.role === "admin" ? [{ id: "coach", icon: "🎓", label: "Coach Portal", desc: "Manage Client Goals", color: C.accent4 }] : []),
          ...(user?.role === "admin" ? [{ id: "admin", icon: "👑", label: "Admin Panel", desc: "User Roles & Stats", color: C.accent2 }] : []),
        ].map(m => (
          <Card key={m.id} style={{ cursor: "pointer" }} onClick={() => setTab(m.id)}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{m.label}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{m.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("homepage");
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    if (getAuthToken()) {
      apiGetMe().then(u => {
        setUser(u);
        setTab("dashboard");
      }).catch(() => removeAuthToken());
    }
    apiGetAIStatus().then(setAiStatus).catch(err => console.error("AI Status offline:", err));
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setTab("homepage");
  };

  const navItems = [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "finance", icon: "💰", label: "Finance" },
    { id: "movies", icon: "🎬", label: "Movies" },
    { id: "career", icon: "🚀", label: "Career" },
    { id: "travel", icon: "✈️", label: "Travel" },
    { id: "startup", icon: "💡", label: "Startup" },
    { id: "daily", icon: "📊", label: "Daily AI" },
    { id: "solver", icon: "🧠", label: "Solver" },
    { id: "vault", icon: "📚", label: "Vault" },
    ...(user?.role === "coach" || user?.role === "admin" ? [{ id: "coach", icon: "🎓", label: "Coach Portal" }] : []),
    ...(user?.role === "admin" ? [{ id: "admin", icon: "👑", label: "Admin Panel" }] : []),
  ];

  const modules = {
    dashboard: <AppDashboard setTab={setTab} user={user} />,
    finance: <FinanceModule />,
    movies: <MoviesModule />,
    career: <CareerModule />,
    travel: <TravelModule />,
    startup: <StartupModule />,
    daily: <DailyModule />,
    solver: <SolverModule />,
    vault: <VaultModule />,
    coach: <CoachModule />,
    admin: <AdminModule />,
  };

  if (tab === "homepage" && !user) {
    return (
      <>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={(u) => { setUser(u); setTab("dashboard"); }} />}
        <AdvancedHomepage
          onOpenAuth={() => setShowAuthModal(true)}
          onSelectModule={(modId) => {
            if (user) setTab(modId);
            else setShowAuthModal(true);
          }}
          aiStatus={aiStatus}
        />
      </>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={setUser} />}

      {/* Sidebar */}
      <div style={{ width: 220, background: C.sidebarBg, color: C.sidebarText, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: C.gold }}>AI Life OS</span>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setTab(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                cursor: "pointer", marginBottom: 2, fontSize: 13, fontWeight: 600,
                background: tab === n.id ? `${C.accent}22` : "transparent",
                color: tab === n.id ? C.gold : C.sidebarMuted,
                borderLeft: tab === n.id ? `3px solid ${C.accent}` : "3px solid transparent",
              }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {user ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: C.sidebarMuted, marginBottom: 8 }}>{user.email}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Tag color={C.gold}>{user.role.toUpperCase()}</Tag>
                <button onClick={handleLogout} style={{ ...btnSecondary, padding: "2px 8px", fontSize: 10, color: C.red }}>Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ ...btnPrimary, width: "100%", padding: 9, fontSize: 12 }}>
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Main App Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <header style={{ background: C.surface, padding: "12px 28px", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚡ Active AI Engine:</span>
            <Tag color={C.accent3}>
              {aiStatus ? aiStatus.activeProvider : "Groq API / Ollama"}
            </Tag>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setTab("homepage")} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 11 }}>🌐 Homepage</button>
            {!user && (
              <button onClick={() => setShowAuthModal(true)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 12 }}>
                Login
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: "30px 40px", overflowY: "auto", maxWidth: 960 }}>
          {modules[tab]}
        </main>
      </div>
    </div>
  );
}
