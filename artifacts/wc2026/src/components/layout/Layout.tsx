import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X } from "lucide-react";

const DISMISS_KEY = "wc2026_disclaimer_dismissed";

function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.55rem 1.25rem",
      background: "#1c1600",
      borderBottom: "1px solid #f59e0b40",
      fontSize: 12,
      color: "#fbbf24",
      position: "sticky",
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      <span style={{ flexShrink: 0 }}>⚡</span>
      <span style={{ flex: 1 }}>
        <strong>Pre-tournament ML projections</strong> — WC 2026 is now live. Stats shown are model
        forecasts, not real-time match data. Actual results may differ.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#f59e0b",
          padding: "2px 4px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          opacity: 0.7,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DisclaimerBanner />
        <main style={{ flex: 1, overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ height: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
