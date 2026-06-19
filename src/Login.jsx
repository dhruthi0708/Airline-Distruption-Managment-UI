import { useState } from "react";
import { useAuth } from "./AuthContext";
import "./Login.css";

export default function Login({ onGoSignup }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div className="auth-scanline" />

      <div className="auth-left">
        <div className="brand-block">
          <div className="brand-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M8 36L24 8L40 36" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M12 28H36" stroke="currentColor" strokeWidth="2"/>
              <circle cx="24" cy="8" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-name">SKY<span>OPS</span></h1>
            <p className="brand-tagline">Disruption Management Centre</p>
          </div>
        </div>

        <div className="auth-stats">
          <div className="stat-chip critical">
            <span className="chip-dot" />
            <span>6 Active Disruptions</span>
          </div>
          <div className="stat-chip high">
            <span className="chip-dot" />
            <span>1,346 Pax Affected</span>
          </div>
          <div className="stat-chip ok">
            <span className="chip-dot" />
            <span>870 Reacommodated</span>
          </div>
        </div>

        <div className="auth-ticker">
          <div className="ticker-label">LIVE</div>
          <div className="ticker-track">
            <span>SK2047 CANCELLED · SK4401 CANCELLED · SK1872 DELAYED +5H · SK3109 DELAYED +4H · SK5530 DIVERTED CNX · SK7723 DELAYED +3H &nbsp;&nbsp;&nbsp; SK2047 CANCELLED · SK4401 CANCELLED · SK1872 DELAYED +5H</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <h2>Operator Login</h2>
            <p>Authorised personnel only</p>
          </div>

          {error && <div className="auth-error"><span>⚠</span>{error}</div>}

          <div className="field-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input
                type="email"
                placeholder="operator@skyops.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field-group">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button type="submit" className={`auth-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? "Authenticating…" : "Access Operations Centre"}
          </button>

          <div className="auth-divider"><span>New operator?</span></div>

          <button type="button" className="auth-link-btn" onClick={onGoSignup}>
            Request Access / Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
