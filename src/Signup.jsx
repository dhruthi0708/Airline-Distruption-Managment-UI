import { useState } from "react";
import { useAuth } from "./AuthContext";
import "./Signup.css";

const ROLES = [
  "Operations Analyst",
  "Senior Disruption Manager",
  "Hub Controller",
  "Passenger Relations Lead",
  "Ground Operations Supervisor",
];

export default function Signup({ onGoLogin }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.role) return "Please select your operational role.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    await new Promise((r) => setTimeout(r, 800));
    const result = signup(form.name.trim(), form.email.trim(), form.password, form.role);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthClass = ["", "weak", "fair", "good", "strong"][strength];

  return (
    <div className="auth-page signup-page">
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

        <div className="onboard-info">
          <h3>Join the Operations Team</h3>
          <p>SkyOps is the nerve centre of Sky Airlines disruption response. As an operator you will:</p>
          <ul>
            <li><span className="li-icon">✈</span> Monitor live disruptions across the network</li>
            <li><span className="li-icon">🏨</span> Issue hotel & meal vouchers instantly</li>
            <li><span className="li-icon">🔄</span> Re-accommodate passengers on alternate flights</li>
            <li><span className="li-icon">📡</span> Send mass communications to affected pax</li>
            <li><span className="li-icon">📊</span> Track real-time recovery metrics</li>
          </ul>
        </div>

        <div className="already-block">
          Already have an account?
          <button onClick={onGoLogin}>Sign in here →</button>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card signup-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <h2>Request Access</h2>
            <p>Create your operator account</p>
          </div>

          {error && <div className="auth-error"><span>⚠</span>{error}</div>}

          <div className="field-row">
            <div className="field-group">
              <label>Full Name</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <input type="text" placeholder="Your full name" value={form.name} onChange={update("name")} />
              </div>
            </div>

            <div className="field-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input type="email" placeholder="you@airline.com" value={form.email} onChange={update("email")} />
              </div>
            </div>
          </div>

          <div className="field-group">
            <label>Operational Role</label>
            <div className="input-wrap select-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 7h8M6 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              <select value={form.role} onChange={update("role")}>
                <option value="">Select your role…</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="select-arrow">▾</span>
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={update("password")} />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
              {form.password && (
                <div className={`strength-bar strength-${strengthClass}`}>
                  <div className="strength-fill" style={{ width: `${strength * 25}%` }} />
                  <span>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="field-group">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5"/><path d="M10 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <input type={showPass ? "text" : "password"} placeholder="Re-enter password" value={form.confirm} onChange={update("confirm")} />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="field-hint error-hint">Passwords don't match</p>
              )}
              {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
                <p className="field-hint ok-hint">✓ Passwords match</p>
              )}
            </div>
          </div>

          <button type="submit" className={`auth-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? "Creating Account…" : "Create Operator Account"}
          </button>

          <div className="auth-divider"><span>Already registered?</span></div>
          <button type="button" className="auth-link-btn" onClick={onGoLogin}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
