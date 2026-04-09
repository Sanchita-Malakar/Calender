"use client";
import { Calendar } from "@/components/calendar";
import { useEffect, useState } from "react";

export default function Home() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <main
      className="min-h-screen flex items-start justify-center px-6 py-10 md:py-16"
      style={{ background: "var(--bg-body)", transition: "background 0.4s ease" }}
    >
      {}
      <div className="w-full max-w-[900px]">
        {/* Page heading */}
        <div className="flex items-center justify-between mb-8 px-1 gap-4">
          {}
          <div className="text-center flex-1 min-w-0">
            <h1
              className="text-5xl font-black tracking-tight mb-1"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "-0.01em",
                
                color: dark ? "#c0a0ff" : "#5a3aab",
                textShadow: dark
                  ? "0 0 40px rgba(192,160,255,0.35)"
                  : "0 2px 12px rgba(90,58,171,0.18)",
              }}
            >
              WALL CALENDAR
            </h1>
            <p
              className="text-sm tracking-widest"
              style={{
                color: "var(--text-muted)",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              SELECT A DATE RANGE · ADD YOUR NOTES
            </p>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(d => !d)}
            aria-label="Toggle dark mode"
            style={{
              background:     "var(--toggle-bg)",
              border:         "1px solid var(--glass-border)",
              borderRadius:   "999px",
              padding:        "7px 12px",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              gap:            "6px",
              fontSize:       "18px",
              backdropFilter: "blur(8px)",
              transition:     "all 0.25s ease",
              flexShrink:     0,
            }}
          >
            <span style={{
              transition:    "transform 0.3s ease",
              display:       "inline-block",
              transform:     dark ? "rotate(180deg)" : "rotate(0deg)",
            }}>
              {dark ? "☀️" : "🌙"}
            </span>
          </button>
        </div>

        <Calendar dark={dark} />
      </div>
    </main>
  );
}