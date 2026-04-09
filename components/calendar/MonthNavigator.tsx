"use client";

import React from "react";
import { format } from "date-fns";
import { navigateMonth } from "@/lib/calendar";

interface MonthNavigatorProps {
  currentMonth: Date;
  accentColor: string;
  dark?: boolean;
  onChange: (date: Date) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  accentColor,
  dark,
  onChange,
}) => {
  const navBtnBase: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: `1.5px solid ${dark ? "rgba(100,80,160,0.35)" : "#e8e8f0"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    color: dark ? "rgba(180,170,220,0.7)" : "#b0b0c4",
    backgroundColor: dark ? "rgba(40,35,75,0.5)" : "transparent",
    cursor: "pointer",
    transition: "all 0.18s ease",
    lineHeight: 1,
    backdropFilter: "blur(6px)",
    flexShrink: 0,
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={() => onChange(navigateMonth(currentMonth, "prev"))}
        style={navBtnBase}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = accentColor;
          b.style.borderColor = `${accentColor}55`;
          b.style.backgroundColor = `${accentColor}18`;
          b.style.transform = "scale(1.1)";
          b.style.boxShadow = `0 4px 14px ${accentColor}30`;
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = dark ? "rgba(180,170,220,0.7)" : "#b0b0c4";
          b.style.borderColor = dark ? "rgba(100,80,160,0.35)" : "#e8e8f0";
          b.style.backgroundColor = dark ? "rgba(40,35,75,0.5)" : "transparent";
          b.style.transform = "scale(1)";
          b.style.boxShadow = "none";
        }}
        aria-label="Previous month"
      >
        ‹
      </button>

      
      <div className="text-center" style={{ flex: 1 }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.18em",
            fontFamily: "'Barlow Condensed', sans-serif",
            // Solid accent colour — always visible in both light and dark mode
            color: accentColor,
            // Subtle text-shadow for depth without relying on gradient clip
            textShadow: `0 0 20px ${accentColor}50`,
          }}
        >
          {format(currentMonth, "MMMM yyyy").toUpperCase()}
        </span>
      </div>

      <button
        onClick={() => onChange(navigateMonth(currentMonth, "next"))}
        style={navBtnBase}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = accentColor;
          b.style.borderColor = `${accentColor}55`;
          b.style.backgroundColor = `${accentColor}18`;
          b.style.transform = "scale(1.1)";
          b.style.boxShadow = `0 4px 14px ${accentColor}30`;
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.color = dark ? "rgba(180,170,220,0.7)" : "#b0b0c4";
          b.style.borderColor = dark ? "rgba(100,80,160,0.35)" : "#e8e8f0";
          b.style.backgroundColor = dark ? "rgba(40,35,75,0.5)" : "transparent";
          b.style.transform = "scale(1)";
          b.style.boxShadow = "none";
        }}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
};