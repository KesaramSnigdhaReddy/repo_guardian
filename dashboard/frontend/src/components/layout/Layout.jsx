import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#e6edf3",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      fontSize: "14px",
    }}>
      <Topbar />
      <main style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "24px 16px",
      }}>
        {children}
      </main>
    </div>
  );
}