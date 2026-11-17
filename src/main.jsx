import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "An unexpected error occurred." };
  }
  componentDidCatch(error) {
    console.error("LabDesk rendering error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f6f7fb", color: "#263047", fontFamily: "Arial, sans-serif" }}>
          <section style={{ maxWidth: 560, background: "white", border: "1px solid #e5e8ef", borderRadius: 14, padding: 28, boxShadow: "0 12px 40px #17213a12" }}>
            <h1 style={{ marginTop: 0 }}>LabDesk could not load</h1>
            <p>The app hit a saved-data or rendering error. Your browser may contain older demo data.</p>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7fb", padding: 12, borderRadius: 8 }}>{this.state.message}</pre>
            <button onClick={() => { try { ["lab_bookings", "lab_wait", "lab_reports", "lab_max_hours", "lab_student_identity", "lab_qr_booking"].forEach(key => localStorage.removeItem(key)); } catch {} window.location.reload(); }} style={{ border: 0, borderRadius: 7, padding: "11px 16px", background: "#665bd8", color: "white", cursor: "pointer" }}>
              Reset demo data and reload
            </button>
            <p style={{ fontSize: 12, color: "#778194" }}>This clears only LabDesk demo data stored in this browser.</p>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>
);
