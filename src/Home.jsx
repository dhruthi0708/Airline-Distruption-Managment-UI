import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { FLIGHTS, HOTELS, MEAL_VOUCHERS, COMM_TEMPLATES } from "./data";
import "./Home.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLOR = { CANCELLED: "red", DELAYED: "amber", DIVERTED: "blue" };
const PRIORITY_COLOR = { CRITICAL: "red", HIGH: "amber", MEDIUM: "blue" };

function Badge({ label, color }) {
  return <span className={`badge badge-${color}`}>{label}</span>;
}

function ProgressBar({ value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-bar-bg">
        <div className={`progress-fill pf-${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span>{value}/{total}</span>
    </div>
  );
}

// ── MODAL COMPONENTS ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── HOTEL VOUCHER MODAL ──────────────────────────────────────────────────────
function HotelModal({ flight, onClose, onIssue }) {
  const [selected, setSelected] = useState(null);
  const [nights, setNights] = useState(1);
  const [count, setCount] = useState(flight.affectedPax - flight.hotelIssued);
  const [done, setDone] = useState(false);

  const issue = () => {
    if (!selected || count < 1) return;
    onIssue(flight.id, "hotel", count);
    setDone(true);
  };

  return (
    <Modal title={`Hotel Vouchers — ${flight.flightNo}`} onClose={onClose}>
      {done ? (
        <div className="modal-success">
          <div className="success-icon">🏨</div>
          <h4>Vouchers Issued!</h4>
          <p>{count} hotel vouchers issued for {nights} night(s).</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          <div className="modal-info-row">
            <span>Flight</span><strong>{flight.flightNo} · {flight.origin} → {flight.destination}</strong>
          </div>
          <div className="modal-info-row">
            <span>Affected Pax</span><strong>{flight.affectedPax} · Already issued: {flight.hotelIssued}</strong>
          </div>
          <div className="section-label">Select Hotel Partner</div>
          <div className="hotel-list">
            {HOTELS.map((h) => (
              <div
                key={h.id}
                className={`hotel-card ${selected?.id === h.id ? "selected" : ""}`}
                onClick={() => setSelected(h)}
              >
                <div className="hotel-stars">{"★".repeat(h.stars)}</div>
                <div className="hotel-name">{h.name}</div>
                <div className="hotel-meta">{h.city} · {h.rate} · {h.rooms} rooms avail</div>
              </div>
            ))}
          </div>
          <div className="field-row-m">
            <div className="field-group-m">
              <label>No. of Passengers</label>
              <input type="number" min="1" max={flight.affectedPax} value={count}
                onChange={(e) => setCount(+e.target.value)} />
            </div>
            <div className="field-group-m">
              <label>Nights</label>
              <input type="number" min="1" max="5" value={nights}
                onChange={(e) => setNights(+e.target.value)} />
            </div>
          </div>
          <div className="modal-cost">
            Estimated cost: <strong>{selected ? `₹${(parseInt(selected.rate.replace(/[^0-9]/g, "")) * nights * count).toLocaleString("en-IN")}` : "—"}</strong>
          </div>
          <button className="btn-primary" onClick={issue} disabled={!selected}>
            Issue {count} Hotel Voucher{count !== 1 ? "s" : ""}
          </button>
        </>
      )}
    </Modal>
  );
}

// ── MEAL VOUCHER MODAL ───────────────────────────────────────────────────────
function MealModal({ flight, onClose, onIssue }) {
  const [selected, setSelected] = useState(null);
  const [count, setCount] = useState(flight.affectedPax - flight.mealIssued);
  const [done, setDone] = useState(false);

  const issue = () => {
    if (!selected || count < 1) return;
    onIssue(flight.id, "meal", count);
    setDone(true);
  };

  return (
    <Modal title={`Meal Vouchers — ${flight.flightNo}`} onClose={onClose}>
      {done ? (
        <div className="modal-success">
          <div className="success-icon">🍽️</div>
          <h4>Meal Vouchers Issued!</h4>
          <p>{count} × {selected.type} vouchers issued.</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          <div className="modal-info-row">
            <span>Flight</span><strong>{flight.flightNo} · {flight.origin} → {flight.destination}</strong>
          </div>
          <div className="section-label">Select Meal Type</div>
          <div className="meal-list">
            {MEAL_VOUCHERS.map((m) => (
              <div
                key={m.id}
                className={`meal-card ${selected?.id === m.id ? "selected" : ""}`}
                onClick={() => setSelected(m)}
              >
                <div className="meal-type">{m.type}</div>
                <div className="meal-value">{m.value}</div>
                <div className="meal-venue">{m.venue}</div>
              </div>
            ))}
          </div>
          <div className="field-group-m" style={{ marginTop: 16 }}>
            <label>No. of Passengers</label>
            <input type="number" min="1" max={flight.affectedPax} value={count}
              onChange={(e) => setCount(+e.target.value)} />
          </div>
          <div className="modal-cost">
            Total value: <strong>{selected ? `₹${(parseInt(selected.value.replace(/[^0-9]/g, "")) * count).toLocaleString("en-IN")}` : "—"}</strong>
          </div>
          <button className="btn-primary" onClick={issue} disabled={!selected}>
            Issue {count} Meal Voucher{count !== 1 ? "s" : ""}
          </button>
        </>
      )}
    </Modal>
  );
}

// ── REACCOMMODATION MODAL ────────────────────────────────────────────────────
function ReaccomModal({ flight, allFlights, onClose, onIssue }) {
  const [altFlight, setAltFlight] = useState(null);
  const [count, setCount] = useState(flight.affectedPax - flight.reaccomIssued);
  const [done, setDone] = useState(false);
  const alts = allFlights.filter((f) => f.id !== flight.id && f.status !== "CANCELLED" && f.destination === flight.destination);
  const noAlts = alts.length === 0;

  const issue = () => {
    if (!altFlight || count < 1) return;
    onIssue(flight.id, "reaccom", count);
    setDone(true);
  };

  return (
    <Modal title={`Re-accommodation — ${flight.flightNo}`} onClose={onClose}>
      {done ? (
        <div className="modal-success">
          <div className="success-icon">✈️</div>
          <h4>Passengers Re-accommodated!</h4>
          <p>{count} passengers moved to {altFlight.flightNo}.</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          <div className="modal-info-row">
            <span>From</span><strong>{flight.flightNo} ({flight.status})</strong>
          </div>
          <div className="modal-info-row">
            <span>Route</span><strong>{flight.origin} → {flight.destination}</strong>
          </div>
          <div className="section-label">Select Alternate Flight</div>
          {noAlts ? (
            <div className="no-alts">No alternate flights available to {flight.destination} at this time. Consider partner airline options.</div>
          ) : (
            <div className="alt-list">
              {alts.map((a) => (
                <div
                  key={a.id}
                  className={`alt-card ${altFlight?.id === a.id ? "selected" : ""}`}
                  onClick={() => setAltFlight(a)}
                >
                  <div className="alt-flight-no">{a.flightNo}</div>
                  <div className="alt-route">{a.origin} → {a.destination}</div>
                  <div className="alt-time">Sched: {a.scheduled}</div>
                  <Badge label={a.status} color={STATUS_COLOR[a.status]} />
                </div>
              ))}
            </div>
          )}
          {!noAlts && (
            <>
              <div className="field-group-m" style={{ marginTop: 16 }}>
                <label>No. of Passengers</label>
                <input type="number" min="1" max={flight.affectedPax} value={count}
                  onChange={(e) => setCount(+e.target.value)} />
              </div>
              <button className="btn-primary" onClick={issue} disabled={!altFlight}>
                Re-accommodate {count} Passenger{count !== 1 ? "s" : ""}
              </button>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

// ── COMMS MODAL ──────────────────────────────────────────────────────────────
function CommsModal({ flight, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMsg, setCustomMsg] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const fillTemplate = (t) => {
    setSelectedTemplate(t);
    setCustomMsg(t.body.replace(/{flightNo}/g, flight.flightNo).replace(/{gate}/g, flight.gate).replace(/{newTime}/g, "TBC"));
  };

  const send = async () => {
    if (!customMsg.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  return (
    <Modal title={`Passenger Comms — ${flight.flightNo}`} onClose={onClose}>
      {sent ? (
        <div className="modal-success">
          <div className="success-icon">📡</div>
          <h4>Message Sent!</h4>
          <p>{flight.affectedPax} passengers notified via {channel}.</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      ) : (
        <>
          <div className="modal-info-row">
            <span>Recipients</span><strong>{flight.affectedPax} passengers · {flight.flightNo}</strong>
          </div>
          <div className="channel-select">
            {["SMS", "Email", "App Push", "All Channels"].map((c) => (
              <button
                key={c}
                className={`channel-btn ${channel === c ? "active" : ""}`}
                onClick={() => setChannel(c)}
              >{c}</button>
            ))}
          </div>
          <div className="section-label">Quick Templates</div>
          <div className="template-list">
            {COMM_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className={`template-card ${selectedTemplate?.id === t.id ? "selected" : ""}`}
                onClick={() => fillTemplate(t)}
              >
                <div className="template-trigger"><Badge label={t.trigger} color={STATUS_COLOR[t.trigger] || "blue"} /></div>
                <div className="template-subject">{t.subject.replace(/{flightNo}/g, flight.flightNo)}</div>
              </div>
            ))}
          </div>
          <div className="section-label" style={{ marginTop: 14 }}>Message Body</div>
          <textarea
            className="comms-textarea"
            rows={5}
            placeholder="Type a custom message or select a template above…"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
          />
          <div className="comms-footer">
            <span className="char-count">{customMsg.length} chars</span>
            <button className="btn-primary" onClick={send} disabled={!customMsg.trim() || sending}>
              {sending ? "Sending…" : `Send to ${flight.affectedPax} Pax via ${channel}`}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── MAIN HOME COMPONENT ──────────────────────────────────────────────────────
export default function Home() {
  const { user, logout } = useAuth();
  const [flights, setFlights] = useState(FLIGHTS);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState(null); // { type, flightId }
  const [clock, setClock] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleIssue = (flightId, type, count) => {
    setFlights((prev) => prev.map((f) => {
      if (f.id !== flightId) return f;
      return {
        ...f,
        hotelIssued:   type === "hotel"   ? Math.min(f.affectedPax, f.hotelIssued + count)   : f.hotelIssued,
        mealIssued:    type === "meal"     ? Math.min(f.affectedPax, f.mealIssued + count)    : f.mealIssued,
        reaccomIssued: type === "reaccom"  ? Math.min(f.affectedPax, f.reaccomIssued + count) : f.reaccomIssued,
        paxProcessed:  Math.min(f.affectedPax, f.paxProcessed + (type === "reaccom" ? count : 0)),
      };
    }));
    const labels = { hotel: "Hotel vouchers", meal: "Meal vouchers", reaccom: "Re-accommodation" };
    showNotif(`${labels[type]} issued for ${count} passengers`);
  };

  const activeFlight = modal ? flights.find((f) => f.id === modal.flightId) : null;

  // Derived stats
  const totalPax = flights.reduce((a, f) => a + f.affectedPax, 0);
  const totalHotel = flights.reduce((a, f) => a + f.hotelIssued, 0);
  const totalMeal = flights.reduce((a, f) => a + f.mealIssued, 0);
  const totalReaccom = flights.reduce((a, f) => a + f.reaccomIssued, 0);
  const criticalCount = flights.filter((f) => f.priority === "CRITICAL").length;
  const cancelledCount = flights.filter((f) => f.status === "CANCELLED").length;

  const filteredFlights = flights.filter((f) => {
    const matchStatus = filterStatus === "ALL" || f.status === filterStatus;
    const matchSearch = !searchQuery || f.flightNo.includes(searchQuery.toUpperCase()) ||
      f.origin.includes(searchQuery.toUpperCase()) || f.destination.includes(searchQuery.toUpperCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="home">
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-icon-sm">
            <svg viewBox="0 0 48 48" fill="none"><path d="M8 36L24 8L40 36" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M12 28H36" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="8" r="3" fill="currentColor"/></svg>
          </div>
          <div>
            <span className="topbar-brand">SKY<span>OPS</span></span>
            <span className="topbar-subtitle">Disruption Management Centre</span>
          </div>
        </div>

        <div className="topbar-center">
          <nav className="tab-nav">
            {["dashboard", "flights", "vouchers", "comms"].map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="topbar-right">
          <div className="clock-block">
            <span className="clock-time">{clock.toLocaleTimeString("en-IN", { hour12: false })}</span>
            <span className="clock-date">{clock.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          <div className="user-pill">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.badge}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 20 20" fill="none"><path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4M8 15l5-5-5-5M3 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      {/* ── NOTIFICATION TOAST ── */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>{notification.msg}</div>
      )}

      <main className="main-content">
        {/* ══════════════════════ DASHBOARD TAB ══════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="tab-content">
            {/* KPI Row */}
            <div className="kpi-row">
              <div className="kpi-card kpi-red">
                <div className="kpi-icon">⚠</div>
                <div>
                  <div className="kpi-value">{criticalCount}</div>
                  <div className="kpi-label">Critical Disruptions</div>
                </div>
              </div>
              <div className="kpi-card kpi-amber">
                <div className="kpi-icon">✈</div>
                <div>
                  <div className="kpi-value">{flights.length}</div>
                  <div className="kpi-label">Active Disruptions</div>
                </div>
              </div>
              <div className="kpi-card kpi-blue">
                <div className="kpi-icon">👥</div>
                <div>
                  <div className="kpi-value">{totalPax.toLocaleString()}</div>
                  <div className="kpi-label">Passengers Affected</div>
                </div>
              </div>
              <div className="kpi-card kpi-green">
                <div className="kpi-icon">🔄</div>
                <div>
                  <div className="kpi-value">{totalReaccom}</div>
                  <div className="kpi-label">Re-accommodated</div>
                </div>
              </div>
              <div className="kpi-card kpi-green">
                <div className="kpi-icon">🏨</div>
                <div>
                  <div className="kpi-value">{totalHotel}</div>
                  <div className="kpi-label">Hotel Vouchers</div>
                </div>
              </div>
              <div className="kpi-card kpi-green">
                <div className="kpi-icon">🍽️</div>
                <div>
                  <div className="kpi-value">{totalMeal}</div>
                  <div className="kpi-label">Meal Vouchers</div>
                </div>
              </div>
            </div>

            {/* Priority Alerts */}
            <div className="section-title">
              <span className="live-dot" />
              Priority Alerts
            </div>
            <div className="alert-list">
              {flights.filter((f) => f.priority === "CRITICAL").map((f) => (
                <div key={f.id} className="alert-banner">
                  <div className="alert-left">
                    <Badge label="CRITICAL" color="red" />
                    <span className="alert-flight">{f.flightNo}</span>
                    <span className="alert-route">{f.origin} → {f.destination}</span>
                    <Badge label={f.status} color={STATUS_COLOR[f.status]} />
                  </div>
                  <div className="alert-reason">{f.reason}</div>
                  <div className="alert-actions">
                    <button className="act-btn act-hotel" onClick={() => setModal({ type: "hotel", flightId: f.id })}>Hotel</button>
                    <button className="act-btn act-meal" onClick={() => setModal({ type: "meal", flightId: f.id })}>Meal</button>
                    <button className="act-btn act-reaccom" onClick={() => setModal({ type: "reaccom", flightId: f.id })}>Re-accom</button>
                    <button className="act-btn act-comms" onClick={() => setModal({ type: "comms", flightId: f.id })}>Comms</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recovery Progress */}
            <div className="section-title" style={{ marginTop: 28 }}>Recovery Progress</div>
            <div className="recovery-table">
              <div className="rt-head">
                <span>Flight</span><span>Route</span><span>Pax</span>
                <span>Hotel</span><span>Meals</span><span>Re-accom</span><span>Status</span>
              </div>
              {flights.map((f) => (
                <div key={f.id} className="rt-row">
                  <span className="rt-flight">{f.flightNo}</span>
                  <span className="rt-route">{f.origin}→{f.destination}</span>
                  <span>{f.affectedPax}</span>
                  <span><ProgressBar value={f.hotelIssued} total={f.affectedPax} color="blue" /></span>
                  <span><ProgressBar value={f.mealIssued} total={f.affectedPax} color="amber" /></span>
                  <span><ProgressBar value={f.reaccomIssued} total={f.affectedPax} color="green" /></span>
                  <span><Badge label={f.status} color={STATUS_COLOR[f.status]} /></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════ FLIGHTS TAB ══════════════════════ */}
        {activeTab === "flights" && (
          <div className="tab-content">
            <div className="flights-toolbar">
              <div className="search-wrap">
                <svg viewBox="0 0 20 20" fill="none" className="search-icon"><circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M16 16l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input
                  className="search-input"
                  placeholder="Search flight no., origin, destination…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-tabs">
                {["ALL", "CANCELLED", "DELAYED", "DIVERTED"].map((s) => (
                  <button
                    key={s}
                    className={`filter-btn ${filterStatus === s ? "active" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="flight-cards">
              {filteredFlights.map((f) => (
                <div key={f.id} className={`flight-card fc-${STATUS_COLOR[f.status]}`}>
                  <div className="fc-header">
                    <div className="fc-flight-no">{f.flightNo}</div>
                    <Badge label={f.status} color={STATUS_COLOR[f.status]} />
                    <Badge label={f.priority} color={PRIORITY_COLOR[f.priority]} />
                  </div>
                  <div className="fc-route">
                    <span className="fc-airport">{f.origin}</span>
                    <svg viewBox="0 0 40 16" fill="none" className="fc-arrow"><path d="M2 8h36M30 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="fc-airport">{f.destination}</span>
                  </div>
                  <div className="fc-meta">
                    <span>Sched: {f.scheduled}</span>
                    <span>Gate: {f.gate}</span>
                    <span>{f.aircraft}</span>
                  </div>
                  <div className="fc-reason">{f.reason}</div>
                  <div className="fc-stats">
                    <div className="fc-stat">
                      <span className="fcs-label">Affected</span>
                      <span className="fcs-val">{f.affectedPax}</span>
                    </div>
                    <div className="fc-stat">
                      <span className="fcs-label">Hotels</span>
                      <span className="fcs-val">{f.hotelIssued}</span>
                    </div>
                    <div className="fc-stat">
                      <span className="fcs-label">Meals</span>
                      <span className="fcs-val">{f.mealIssued}</span>
                    </div>
                    <div className="fc-stat">
                      <span className="fcs-label">Re-accom</span>
                      <span className="fcs-val">{f.reaccomIssued}</span>
                    </div>
                  </div>
                  <div className="fc-actions">
                    <button className="act-btn act-hotel" onClick={() => setModal({ type: "hotel", flightId: f.id })}>🏨 Hotel</button>
                    <button className="act-btn act-meal" onClick={() => setModal({ type: "meal", flightId: f.id })}>🍽 Meal</button>
                    <button className="act-btn act-reaccom" onClick={() => setModal({ type: "reaccom", flightId: f.id })}>✈ Re-accom</button>
                    <button className="act-btn act-comms" onClick={() => setModal({ type: "comms", flightId: f.id })}>📡 Comms</button>
                  </div>
                </div>
              ))}
              {filteredFlights.length === 0 && (
                <div className="empty-state">No flights match the current filter.</div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ VOUCHERS TAB ══════════════════════ */}
        {activeTab === "vouchers" && (
          <div className="tab-content">
            <div className="section-title">Voucher Summary</div>
            <div className="voucher-summary">
              <div className="vs-card">
                <div className="vs-icon" style={{ color: "#3a8ef6" }}>🏨</div>
                <div className="vs-num">{totalHotel}</div>
                <div className="vs-label">Hotel Vouchers Issued</div>
                <div className="vs-est">Est. cost: ₹{(totalHotel * 4500).toLocaleString("en-IN")}</div>
              </div>
              <div className="vs-card">
                <div className="vs-icon" style={{ color: "#f0a500" }}>🍽️</div>
                <div className="vs-num">{totalMeal}</div>
                <div className="vs-label">Meal Vouchers Issued</div>
                <div className="vs-est">Est. cost: ₹{(totalMeal * 600).toLocaleString("en-IN")}</div>
              </div>
              <div className="vs-card">
                <div className="vs-icon" style={{ color: "#22c97a" }}>✈️</div>
                <div className="vs-num">{totalReaccom}</div>
                <div className="vs-label">Passengers Re-accommodated</div>
                <div className="vs-est">Recovery rate: {totalPax ? Math.round(totalReaccom / totalPax * 100) : 0}%</div>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 28 }}>Per-Flight Breakdown</div>
            <div className="voucher-table">
              <div className="vt-head">
                <span>Flight</span><span>Route</span><span>Pax</span>
                <span>Hotel</span><span>Hotel %</span>
                <span>Meals</span><span>Meals %</span>
                <span>Re-accom</span><span>Recovery</span><span>Actions</span>
              </div>
              {flights.map((f) => (
                <div key={f.id} className="vt-row">
                  <span className="vt-flight">{f.flightNo}</span>
                  <span>{f.origin}→{f.destination}</span>
                  <span>{f.affectedPax}</span>
                  <span>{f.hotelIssued}</span>
                  <span className={f.hotelIssued >= f.affectedPax ? "pct-ok" : "pct-warn"}>
                    {Math.round(f.hotelIssued / f.affectedPax * 100)}%
                  </span>
                  <span>{f.mealIssued}</span>
                  <span className={f.mealIssued >= f.affectedPax ? "pct-ok" : "pct-warn"}>
                    {Math.round(f.mealIssued / f.affectedPax * 100)}%
                  </span>
                  <span>{f.reaccomIssued}</span>
                  <span className={f.reaccomIssued >= f.affectedPax ? "pct-ok" : "pct-warn"}>
                    {Math.round(f.reaccomIssued / f.affectedPax * 100)}%
                  </span>
                  <span className="vt-actions">
                    <button className="act-btn act-hotel" onClick={() => setModal({ type: "hotel", flightId: f.id })}>Hotel</button>
                    <button className="act-btn act-meal" onClick={() => setModal({ type: "meal", flightId: f.id })}>Meal</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════ COMMS TAB ══════════════════════ */}
        {activeTab === "comms" && (
          <div className="tab-content">
            <div className="section-title">Passenger Communication Centre</div>
            <div className="comms-grid">
              {flights.map((f) => (
                <div key={f.id} className={`comms-card cc-${STATUS_COLOR[f.status]}`}>
                  <div className="cc-header">
                    <span className="cc-flight">{f.flightNo}</span>
                    <Badge label={f.status} color={STATUS_COLOR[f.status]} />
                  </div>
                  <div className="cc-route">{f.origin} → {f.destination}</div>
                  <div className="cc-pax">
                    <span>👥 {f.affectedPax} passengers</span>
                  </div>
                  <div className="cc-reason">{f.reason}</div>
                  <button className="btn-comms-send" onClick={() => setModal({ type: "comms", flightId: f.id })}>
                    📡 Send Notification
                  </button>
                </div>
              ))}
            </div>

            <div className="section-title" style={{ marginTop: 32 }}>Available Templates</div>
            <div className="templates-display">
              {COMM_TEMPLATES.map((t) => (
                <div key={t.id} className="template-display-card">
                  <div className="tdc-header">
                    <Badge label={t.trigger} color={STATUS_COLOR[t.trigger] || "blue"} />
                    <span className="tdc-subject">{t.subject}</span>
                  </div>
                  <p className="tdc-body">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {modal && activeFlight && modal.type === "hotel" && (
        <HotelModal flight={activeFlight} onClose={() => setModal(null)} onIssue={handleIssue} />
      )}
      {modal && activeFlight && modal.type === "meal" && (
        <MealModal flight={activeFlight} onClose={() => setModal(null)} onIssue={handleIssue} />
      )}
      {modal && activeFlight && modal.type === "reaccom" && (
        <ReaccomModal flight={activeFlight} allFlights={flights} onClose={() => setModal(null)} onIssue={handleIssue} />
      )}
      {modal && activeFlight && modal.type === "comms" && (
        <CommsModal flight={activeFlight} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
