import { NavLink } from "react-router-dom";
import { LayoutDashboard, GitPullRequest, AlertTriangle, Users, Shield } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "PR Feed", path: "/prs", icon: GitPullRequest },
  { name: "Findings", path: "/findings", icon: AlertTriangle },
  { name: "Developers", path: "/developers", icon: Users },
];

function SecureLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* GitHub-style octocat base shape as shield */}
      <path
        d="M16 2L4 7.5V16.5C4 22.8 9.2 28.6 16 30C22.8 28.6 28 22.8 28 16.5V7.5L16 2Z"
        fill="#21262d"
        stroke="#30363d"
        strokeWidth="1"
      />
      {/* GitHub mark inside shield */}
      <path
        d="M16 8C12.13 8 9 11.13 9 15C9 18.09 10.97 20.71 13.72 21.65C14.07 21.72 14.2 21.5 14.2 21.31C14.2 21.14 14.19 20.63 14.19 20.01C12.5 20.36 12.05 19.27 11.9 18.7C11.82 18.4 11.45 17.44 11.13 17.16C10.86 17 10.51 16.65 11.12 16.64C11.7 16.63 12.12 17.21 12.27 17.48C12.93 18.59 13.98 18.27 14.23 18.09C14.3 17.6 14.49 17.27 14.71 17.09C13.03 16.9 11.27 16.25 11.27 13.41C11.27 12.6 11.57 11.94 12.09 11.42C12.01 11.22 11.74 10.46 12.17 9.44C12.17 9.44 12.78 9.23 14.2 10.18C14.84 10 15.51 9.91 16.18 9.91C16.85 9.91 17.52 10 18.16 10.18C19.58 9.22 20.19 9.44 20.19 9.44C20.62 10.46 20.35 11.22 20.27 11.42C20.79 11.94 21.09 12.59 21.09 13.41C21.09 16.26 19.32 16.9 17.64 17.09C17.92 17.33 18.16 17.79 18.16 18.5C18.16 19.52 18.15 20.34 18.15 20.61C18.15 20.8 18.28 21.03 18.64 20.96C21.37 20.01 23 17.4 23 15C23 11.13 19.87 8 16 8Z"
        fill="white"
      />
      {/* Lock overlay bottom-right */}
      <rect x="19" y="19" width="10" height="10" rx="2" fill="#0d1117" />
      <path
        d="M22 22V21C22 19.9 22.9 19 24 19C25.1 19 26 19.9 26 21V22"
        stroke="#3fb950"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="21" y="22" width="6" height="5" rx="1" fill="#3fb950" />
      <circle cx="24" cy="24.5" r="0.8" fill="#0d1117" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside style={{
      width: "240px",
      background: "#0d1117",
      borderRight: "1px solid #21262d",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace",
    }}>

      {/* Logo */}
      <div style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 16px",
        borderBottom: "1px solid #21262d",
      }}>
        <SecureLogo />
        <div>
          <div style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 600, letterSpacing: "0.01em" }}>
            RepoGuardian
          </div>
          <div style={{ color: "#3fb950", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Secure AI Review
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#f0f6fc" : "#8b949e",
                background: isActive ? "#21262d" : "transparent",
                borderLeft: isActive ? "2px solid #3fb950" : "2px solid transparent",
                transition: "all 0.15s ease",
              })}
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #21262d",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <Shield size={12} color="#3fb950" />
        <span style={{ color: "#484f58", fontSize: "11px" }}>v1.0 • Protected</span>
      </div>
    </aside>
  );
}