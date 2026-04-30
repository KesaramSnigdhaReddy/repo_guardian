import { NavLink } from "react-router-dom";
import { Bell, Plus, ChevronDown, Search, X, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function GithubSecureLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M16 4C9.37 4 4 9.37 4 16C4 21.31 7.43 25.8 12.21 27.37C12.81 27.48 13.03 27.12 13.03 26.81C13.03 26.53 13.02 25.77 13.02 24.69C10 25.25 9.22 23.77 8.98 23C8.85 22.65 8.25 21.4 7.75 21.12C7.35 20.9 6.75 20.34 7.73 20.33C8.65 20.32 9.31 21.19 9.53 21.56C10.59 23.33 12.38 22.81 13.08 22.5C13.19 21.74 13.5 21.23 13.84 20.93C11.09 20.63 8.22 19.58 8.22 14.84C8.22 13.49 8.7 12.38 9.56 11.52C9.43 11.22 9 9.95 9.69 8.24C9.69 8.24 10.67 7.92 13.03 9.52C14.03 9.25 15.09 9.11 16.15 9.11C17.21 9.11 18.27 9.25 19.27 9.52C21.63 7.91 22.61 8.24 22.61 8.24C23.3 9.95 22.87 11.22 22.74 11.52C23.6 12.38 24.08 13.48 24.08 14.84C24.08 19.59 21.2 20.63 18.45 20.93C18.88 21.3 19.25 22.01 19.25 23.1C19.25 24.66 19.24 25.91 19.24 26.81C19.24 27.12 19.46 27.49 20.07 27.37C24.84 25.8 28 21.3 28 16C28 9.37 22.63 4 16 4Z"
        fill="#e6edf3" />
      <circle cx="24" cy="24" r="8" fill="#0d1117" />
      <path d="M24 17L19 19.5V24C19 27 21.5 29.5 24 30C26.5 29.5 29 27 29 24V19.5L24 17Z"
        fill="#238636" stroke="#2ea043" strokeWidth="0.5" />
      <rect x="21.5" y="23" width="5" height="4" rx="0.8" fill="#0d1117" />
      <path d="M22.2 23V21.8C22.2 20.8 23 20 24 20C25 20 25.8 20.8 25.8 21.8V23"
        stroke="#e6edf3" strokeWidth="1" strokeLinecap="round" />
      <circle cx="24" cy="25" r="0.7" fill="#e6edf3" />
    </svg>
  );
}

const navItems = [
  { name: "Dashboard",  path: "/" },
  { name: "PR Feed",    path: "/prs" },
  { name: "Findings",   path: "/findings" },
  { name: "Developers", path: "/developers" },
];

export default function Topbar() {
  const [search, setSearch]               = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const [githubUser, setGithubUser]       = useState(null);
  const [allFindings, setAllFindings]     = useState([]);
  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard")
      .then(r => r.json())
      .then(data => {
        const findings = data.findings || [];
        setAllFindings(findings);
        const notifs = findings
          .filter(f => f.severity === "critical" || f.severity === "high")
          .slice(0, 10)
          .map((f, i) => ({
            id: i, read: false,
            title:   f.severity === "critical" ? "🔴 Critical finding" : "🟡 High severity",
            message: f.message,
            file:    f.file,
          }));
        setNotifications(notifs);
      })
      .catch(() => {});

    fetch("http://localhost:8000/api/github-user")
      .then(r => r.json())
      .then(setGithubUser)
      .catch(() => setGithubUser({ login: "muski630346", name: "Shaik Muskan", avatar_url: null }));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const q = search.toLowerCase();
    setSearchResults(
      allFindings.filter(f =>
        f.file?.toLowerCase().includes(q) ||
        f.message?.toLowerCase().includes(q) ||
        f.severity?.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [search, allFindings]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread     = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const sColor     = s => s === "critical" ? "#da3633" : s === "high" ? "#e3b341" : "#d29922";

  return (
    <header style={{ background: "#161b22", borderBottom: "1px solid #21262d", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", height: "62px" }}>

        {/* Logo */}
        <GithubSecureLogo />

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative", width: "280px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#0d1117", border: "1px solid #30363d",
            borderRadius: "6px", padding: "5px 12px",
          }} onClick={() => setShowSearch(true)}>
            <Search size={14} color="#8b949e" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
              placeholder="Search findings, files..."
              style={{ background: "transparent", border: "none", outline: "none", color: "#f0f6fc", fontSize: "13px", width: "100%" }}
            />
            {search
              ? <X size={12} color="#8b949e" style={{ cursor: "pointer" }} onClick={() => { setSearch(""); setSearchResults([]); }} />
              : <kbd style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: "3px", color: "#8b949e", fontSize: "10px", padding: "1px 4px" }}>/</kbd>
            }
          </div>

          {showSearch && searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "38px", left: 0, right: 0, background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", overflow: "hidden", zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ padding: "6px 12px", fontSize: "10px", color: "#484f58", borderBottom: "1px solid #21262d" }}>
                {searchResults.length} result(s)
              </div>
              {searchResults.map((f, i) => (
                <div key={i} style={{ padding: "8px 12px", display: "flex", gap: "8px", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sColor(f.severity), marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#58a6ff", fontSize: "11px", fontFamily: "monospace" }}>{f.file}</div>
                    <div style={{ color: "#c9d1d9", fontSize: "12px" }}>{f.message?.slice(0, 55)}...</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearch && search && searchResults.length === 0 && (
            <div style={{ position: "absolute", top: "38px", left: 0, right: 0, background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "12px", fontSize: "12px", color: "#484f58", zIndex: 200 }}>
              No results for "{search}"
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
          {navItems.map(item => (
            <NavLink key={item.name} to={item.path}
              style={({ isActive }) => ({
                color: "#e6edf3", textDecoration: "none",
                padding: "6px 10px", borderRadius: "6px",
                fontSize: "14px", fontWeight: 600,
                background: isActive ? "rgba(177,186,196,0.12)" : "transparent",
                whiteSpace: "nowrap",
              })}>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>

          {/* + button */}
          <button
            onClick={() => {
              const repo = prompt("Enter repo (e.g. muski630346/repo_guardian):");
              const pr   = prompt("Enter PR number (e.g. 1):");
              if (repo && pr && repo.includes("/")) {
                fetch("http://localhost:8000/api/review", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ repo: repo.trim(), pr_number: parseInt(pr) }),
                })
                  .then(r => r.json())
                  .then(d => alert(`✅ Done! Score: ${d.score}/100, Issues: ${d.issues}`))
                  .catch(() => alert("❌ Failed — check backend"));
              } else if (repo && !repo.includes("/")) {
                alert("Use format: owner/repo");
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: "2px", background: "transparent", border: "none", color: "#e6edf3", cursor: "pointer", padding: "6px 8px", borderRadius: "6px" }}>
            <Plus size={16} /><ChevronDown size={12} color="#8b949e" />
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
              style={{ background: "transparent", border: "none", padding: "6px 8px", cursor: "pointer", position: "relative" }}>
              <Bell size={18} color="#e6edf3" />
              {unread > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px", background: "#da3633", color: "white", fontSize: "9px", borderRadius: "10px", padding: "0 4px", minWidth: "14px", textAlign: "center", lineHeight: "14px" }}>
                  {unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div style={{ position: "absolute", top: "44px", right: 0, width: "340px", background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 200 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#e6edf3" }}>
                    Notifications {unread > 0 && <span style={{ color: "#da3633" }}>({unread})</span>}
                  </span>
                  {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#58a6ff", fontSize: "11px", cursor: "pointer" }}>Mark all read</button>}
                </div>
                {notifications.length === 0
                  ? <div style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>No alerts — system healthy ✅</div>
                  : notifications.map((n, i) => (
                    <div key={i} onClick={() => setNotifications(p => p.map((x, j) => j === i ? { ...x, read: true } : x))}
                      style={{ padding: "10px 16px", borderBottom: "1px solid #21262d", background: n.read ? "transparent" : "#1f2937", cursor: "pointer" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#e6edf3" }}>{n.title}</div>
                      <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "2px" }}>{n.message?.slice(0, 60)}...</div>
                      <div style={{ fontSize: "10px", color: "#58a6ff", fontFamily: "monospace", marginTop: "3px" }}>{n.file}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <div onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
              style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "4px 6px", borderRadius: "6px" }}>
              {githubUser?.avatar_url
                ? <img src={githubUser.avatar_url} alt="avatar" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #30363d" }} />
                : <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#388bfd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "white", border: "1px solid #30363d" }}>
                    {(githubUser?.login || "R")[0].toUpperCase()}
                  </div>
              }
              <ChevronDown size={12} color="#8b949e" />
            </div>

            {showProfile && githubUser && (
              <div style={{ position: "absolute", top: "44px", right: 0, width: "240px", background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 200 }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #21262d", textAlign: "center" }}>
                  {githubUser.avatar_url
                    ? <img src={githubUser.avatar_url} alt="avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid #30363d" }} />
                    : <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#388bfd", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px", color: "white" }}>
                        {(githubUser.login || "R")[0].toUpperCase()}
                      </div>
                  }
                  <div style={{ color: "#e6edf3", fontWeight: 600, fontSize: "13px", marginTop: "8px" }}>{githubUser.name || githubUser.login}</div>
                  <div style={{ color: "#8b949e", fontSize: "11px" }}>@{githubUser.login}</div>
                </div>
                <div style={{ padding: "8px" }}>
                  {[["Public repos", githubUser.public_repos], ["Followers", githubUser.followers], ["Following", githubUser.following]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", fontSize: "12px" }}>
                      <span style={{ color: "#8b949e" }}>{label}</span>
                      <span style={{ color: "#e6edf3", fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px", borderTop: "1px solid #21262d" }}>
                  <a href={`https://github.com/${githubUser.login}`} target="_blank" rel="noreferrer"
                    style={{ display: "block", textAlign: "center", padding: "6px", background: "#21262d", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "12px", textDecoration: "none" }}>
                    View GitHub Profile →
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ borderTop: "1px solid #21262d", padding: "0 16px", display: "flex", alignItems: "center", gap: "8px", height: "40px", background: "#0d1117" }}>
        <Shield size={12} color="#2ea043" />
        <span style={{ color: "#8b949e", fontSize: "12px" }}>RepoGuardian</span>
        <span style={{ color: "#30363d" }}>/</span>
        <span style={{ color: "#2ea043", fontSize: "12px", fontWeight: 600 }}>Secure AI Review</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ background: "#1f2937", border: "1px solid #30363d", borderRadius: "12px", padding: "1px 8px", fontSize: "11px", color: "#8b949e" }}>v1.0</span>
        </div>
      </div>
    </header>
  );
}