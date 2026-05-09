import { NavLink } from "react-router-dom";
import {
  Bell,
  Plus,
  ChevronDown,
  Search,
  X,
  Shield
} from "lucide-react";

import {
  useState,
  useEffect,
  useRef
} from "react";

function GithubSecureLogo() {

  return (

    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 4C9.37 4 4 9.37 4 16C4 21.31 7.43 25.8 12.21 27.37C12.81 27.48 13.03 27.12 13.03 26.81C13.03 26.53 13.02 25.77 13.02 24.69C10 25.25 9.22 23.77 8.98 23C8.85 22.65 8.25 21.4 7.75 21.12C7.35 20.9 6.75 20.34 7.73 20.33C8.65 20.32 9.31 21.19 9.53 21.56C10.59 23.33 12.38 22.81 13.08 22.5C13.19 21.74 13.5 21.23 13.84 20.93C11.09 20.63 8.22 19.58 8.22 14.84C8.22 13.49 8.7 12.38 9.56 11.52C9.43 11.22 9 9.95 9.69 8.24C9.69 8.24 10.67 7.92 13.03 9.52C14.03 9.25 15.09 9.11 16.15 9.11C17.21 9.11 18.27 9.25 19.27 9.52C21.63 7.91 22.61 8.24 22.61 8.24C23.3 9.95 22.87 11.22 22.74 11.52C23.6 12.38 24.08 13.48 24.08 14.84C24.08 19.59 21.2 20.63 18.45 20.93C18.88 21.3 19.25 22.01 19.25 23.1C19.25 24.66 19.24 25.91 19.24 26.81C19.24 27.12 19.46 27.49 20.07 27.37C24.84 25.8 28 21.3 28 16C28 9.37 22.63 4 16 4Z"
        fill="#ffffff"
      />

      <circle
        cx="24"
        cy="24"
        r="8"
        fill="#0a0a0a"
      />

      <path
        d="M24 17L19 19.5V24C19 27 21.5 29.5 24 30C26.5 29.5 29 27 29 24V19.5L24 17Z"
        fill="#ff7a00"
        stroke="#ff9d2e"
        strokeWidth="0.5"
      />

      <rect
        x="21.5"
        y="23"
        width="5"
        height="4"
        rx="0.8"
        fill="#0d1117"
      />

      <path
        d="M22.2 23V21.8C22.2 20.8 23 20 24 20C25 20 25.8 20.8 25.8 21.8V23"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="25"
        r="0.7"
        fill="#ffffff"
      />

    </svg>
  );
}

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "PR Feed", path: "/prs" },
  { name: "Findings", path: "/findings" },
  { name: "Developers", path: "/developers" },
];

export default function Topbar() {

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [githubUser, setGithubUser] = useState(null);

  const [allFindings, setAllFindings] = useState([]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {

    fetch("http://localhost:8000/api/dashboard")
      .then(r => r.json())
      .then(data => {

        const findings = data.findings || [];

        setAllFindings(findings);

        const notifs = findings
          .filter(
            f =>
              f.severity === "critical" ||
              f.severity === "high"
          )
          .slice(0, 10)
          .map((f, i) => ({
            id: i,
            read: false,
            title:
              f.severity === "critical"
                ? "🔴 Critical finding"
                : "🟠 High severity",
            message: f.message,
            file: f.file,
          }));

        setNotifications(notifs);

      })
      .catch(() => {});

    fetch("http://localhost:8000/api/github-user")
      .then(r => r.json())
      .then(setGithubUser)
      .catch(() =>
        setGithubUser({
          login: "muski630346",
          name: "Shaik Muskan",
          avatar_url: null
        })
      );

  }, []);

  useEffect(() => {

    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const q = search.toLowerCase();

    setSearchResults(
      allFindings
        .filter(
          f =>
            f.file?.toLowerCase().includes(q) ||
            f.message?.toLowerCase().includes(q) ||
            f.severity?.toLowerCase().includes(q)
        )
        .slice(0, 6)
    );

  }, [search, allFindings]);

  useEffect(() => {

    const handler = (e) => {

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) setShowSearch(false);

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) setShowNotifs(false);

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) setShowProfile(false);
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );

  }, []);

  const unread =
    notifications.filter(n => !n.read).length;

  const markAllRead = () =>
    setNotifications(
      p => p.map(n => ({ ...n, read: true }))
    );

  const sColor = s =>
    s === "critical"
      ? "#ff5a1f"
      : s === "high"
      ? "#ff9d2e"
      : "#ffb347";

  return (

    <header
      style={{
        background:
          "linear-gradient(145deg,#050505,#101010)",

        borderBottom:
          "1px solid rgba(255,140,66,0.12)",

        position: "sticky",

        top: 0,

        zIndex: 100,

        boxShadow:
          "0 0 24px rgba(0,0,0,0.45)",
      }}
    >

      <div
        style={{
          display: "flex",

          alignItems: "center",

          gap: "14px",

          padding: "0 18px",

          height: "68px",
        }}
      >

        {/* Logo */}

        <GithubSecureLogo />

        {/* Search */}

        <div
          ref={searchRef}
          style={{
            position: "relative",
            width: "300px",
          }}
        >

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "8px",

              background:
                "linear-gradient(145deg,#0a0a0a,#151515)",

              border:
                "1px solid rgba(255,140,66,0.14)",

              borderRadius: "12px",

              padding: "8px 14px",

              boxShadow:
                "0 0 14px rgba(255,140,66,0.06)",
            }}
            onClick={() => setShowSearch(true)}
          >

            <Search
              size={14}
              color="#ffb066"
            />

            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setShowSearch(true);
              }}
              placeholder="Search findings, risks..."
              style={{
                background: "transparent",

                border: "none",

                outline: "none",

                color: "#f3f4f6",

                fontSize: "13px",

                width: "100%",
              }}
            />

            {search ? (

              <X
                size={12}
                color="#8b949e"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSearch("");
                  setSearchResults([]);
                }}
              />

            ) : (

              <kbd
                style={{
                  background: "#161616",

                  border:
                    "1px solid rgba(255,140,66,0.12)",

                  borderRadius: "4px",

                  color: "#ffb066",

                  fontSize: "10px",

                  padding: "2px 6px",
                }}
              >
                /
              </kbd>
            )}

          </div>

        </div>

        {/* Navigation */}

        <nav
          style={{
            display: "flex",

            alignItems: "center",

            gap: "6px",

            flex: 1,
          }}
        >

          {navItems.map(item => (

            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({

                color:
                  isActive
                    ? "#ffffff"
                    : "#d1d5db",

                textDecoration: "none",

                padding: "10px 14px",

                borderRadius: "12px",

                fontSize: "13px",

                fontWeight: 700,

                letterSpacing: "0.03em",

                background: isActive
                  ? "linear-gradient(135deg,#ff7a00,#ff9d2e)"
                  : "transparent",

                boxShadow: isActive
                  ? "0 0 16px rgba(255,140,66,0.22)"
                  : "none",

                transition: "0.25s ease",
              })}
            >
              {item.name}
            </NavLink>

          ))}

        </nav>

        {/* Right Controls */}

        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: "8px",
          }}
        >

          {/* Plus */}

          <button
            style={{
              display: "flex",

              alignItems: "center",

              gap: "2px",

              background:
                "linear-gradient(145deg,#0a0a0a,#151515)",

              border:
                "1px solid rgba(255,140,66,0.12)",

              color: "#ffb066",

              cursor: "pointer",

              padding: "8px 10px",

              borderRadius: "10px",
            }}
          >

            <Plus size={16} />

            <ChevronDown
              size={12}
              color="#ffb066"
            />

          </button>

          {/* Notifications */}

          <div
            ref={notifRef}
            style={{ position: "relative" }}
          >

            <button
              onClick={() =>
                setShowNotifs(v => !v)
              }
              style={{
                background:
                  "linear-gradient(145deg,#0a0a0a,#151515)",

                border:
                  "1px solid rgba(255,140,66,0.12)",

                padding: "8px 10px",

                borderRadius: "10px",

                cursor: "pointer",

                position: "relative",
              }}
            >

              <Bell
                size={18}
                color="#ffb066"
              />

              {unread > 0 && (

                <span
                  style={{
                    position: "absolute",

                    top: "4px",
                    right: "4px",

                    background: "#ff5a1f",

                    color: "white",

                    fontSize: "9px",

                    borderRadius: "10px",

                    padding: "0 4px",

                    minWidth: "14px",

                    textAlign: "center",

                    lineHeight: "14px",

                    boxShadow:
                      "0 0 10px rgba(255,90,31,0.45)",
                  }}
                >
                  {unread}
                </span>

              )}

            </button>

          </div>

        </div>

      </div>

      {/* Subnav */}

      <div
        style={{
          borderTop:
            "1px solid rgba(255,140,66,0.08)",

          padding: "0 18px",

          display: "flex",

          alignItems: "center",

          gap: "8px",

          height: "42px",

          background:
            "linear-gradient(90deg,#080808,#111111)",
        }}
      >

        <Shield
          size={12}
          color="#ff9d2e"
        />

        <span
          style={{
            color: "#ffb066",
            fontSize: "12px",
          }}
        >
          RepoGuardian
        </span>

        <span style={{ color: "#3f3f46" }}>
          /
        </span>

        <span
          style={{
            color: "#ff9d2e",

            fontSize: "12px",

            fontWeight: 700,
          }}
        >
          Secure AI Review
        </span>

        <div style={{ marginLeft: "auto" }}>

          <span
            style={{
              background:
                "linear-gradient(145deg,#0d0d0d,#151515)",

              border:
                "1px solid rgba(255,140,66,0.12)",

              borderRadius: "999px",

              padding: "3px 10px",

              fontSize: "11px",

              color: "#ffb066",
            }}
          >
            v1.0
          </span>

        </div>

      </div>

    </header>
  );
}