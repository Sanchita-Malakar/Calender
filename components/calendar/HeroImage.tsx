"use client";

import React, { useState } from "react";
import { formatMonthYear, MONTH_IMAGES } from "@/lib/calendar";

interface HeroImageProps {
  currentMonth: Date;
  accentColor: string;
  dark?: boolean;
}

export const HeroImage: React.FC<HeroImageProps> = ({ currentMonth, accentColor, dark }) => {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const monthIndex = currentMonth.getMonth();
  const imgData = MONTH_IMAGES[monthIndex];
  const { month, year } = formatMonthYear(currentMonth);

  return (
    
    <div
      className="relative w-full h-full"
      style={{
        minHeight: "320px",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Skeleton shimmer while image loads */}
      {!loaded && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}38 50%, ${accentColor}18 100%)`,
        }} />
      )}

      {/* Hero photo */}
      <img
        key={imgData.url}
        src={imgData.url}
        alt={imgData.credit}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: loaded ? 1 : 0,
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "opacity 0.8s ease, transform 0.72s cubic-bezier(0.25,0.46,0.45,0.94)",
          filter: dark ? "brightness(0.75) saturate(1.1)" : "none",
        }}
      />

      {/* Dark overlay — deeper in dark mode */}
      <div className="absolute inset-0" style={{
        background: dark
          ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 78%, rgba(0,0,0,0.85) 100%)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.5) 78%, rgba(0,0,0,0.70) 100%)",
        opacity: hovered ? 0.8 : 1,
        transition: "opacity 0.5s ease",
      }} />

      {/* Accent tint wash */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(160deg, ${accentColor}00 30%, ${accentColor}38 100%)`,
        opacity: hovered ? 0.55 : 1,
        transition: "opacity 0.5s ease",
      }} />

      {/* ── Depth layers (diagonal stacked) ── */}

      {/* Layer 0 — glass blur strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        zIndex: 7,
        height: "110px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        background: dark
          ? `linear-gradient(to top, rgba(10,8,30,0.55) 0%, transparent 100%)`
          : `linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 100%)`,
        clipPath: "polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)",
      }} />

      {/* Layer 1 — deep shadow wedge */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        zIndex: 8, height: "92px",
        background: dark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.20)",
        clipPath: "polygon(0 46%, 100% 0%, 100% 100%, 0% 100%)",
        transform: hovered ? "translateY(3px)" : "translateY(0)",
        transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
      }} />

      {/* Layer 2 — accent colour mid-wedge with glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        zIndex: 9, height: "84px",
        background: `linear-gradient(90deg, ${accentColor}cc 0%, ${accentColor}66 100%)`,
        clipPath: "polygon(0 52%, 100% 5%, 100% 100%, 0% 100%)",
        opacity: hovered ? 0.85 : dark ? 0.65 : 0.5,
        transform: hovered ? "translateY(1.5px)" : "translateY(0)",
        transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94) 0.03s, opacity 0.4s ease",
        boxShadow: `0 -8px 30px ${accentColor}40`,
      }} />

      {/* Layer 3 — frosted glass panel */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        zIndex: 10, height: "78px",
        background: dark ? "rgba(10,8,30,0.15)" : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        clipPath: "polygon(0 60%, 100% 10%, 100% 100%, 0% 100%)",
      }} />

      {/* Layer 4 — accent gloss line */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        zIndex: 11, height: "78px",
        background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}44 100%)`,
        clipPath: "polygon(0 59%, 100% 9%, 100% 12.5%, 0 62.5%)",
        opacity: hovered ? 1 : 0.65,
        transition: "opacity 0.4s ease",
      }} />

      {/* Month + Year badge */}
      <div className="absolute" style={{
        zIndex: 20, bottom: "62px", left: "22px",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "13px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.78)",
          letterSpacing: "0.25em",
          lineHeight: 1,
          marginBottom: "4px",
        }}>
          {year}
        </div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "44px",
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "0.05em",
          lineHeight: 1,
          textShadow: "0 2px 20px rgba(0,0,0,0.35)",
        }}>
          {month}
        </div>
      </div>

      {/* Glassmorphism badge — top right, appears on hover */}
      <div className="absolute" style={{
        zIndex: 20, top: "14px", right: "14px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "12px",
        padding: "5px 10px",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        fontSize: "9px",
        color: "rgba(255,255,255,0.9)",
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.12em",
        fontWeight: 600,
        pointerEvents: "none",
      }}>
        {imgData.credit} · Unsplash
      </div>

      {/* Accent corner triangles — bottom-right */}
      <div className="absolute bottom-0 right-0" style={{
        zIndex: 12, width: 82, height: 78,
        transform: hovered ? "scale(1.08) translateY(-2px)" : "scale(1) translateY(0)",
        transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
        transformOrigin: "bottom right",
      }}>
        <svg width="82" height="78" viewBox="0 0 82 78" fill="none">
          <polygon points="82,78 20,78 82,18" fill="rgba(0,0,0,0.15)" transform="translate(3,3)" />
          <polygon points="82,78 16,78 82,16" fill={accentColor} opacity="0.88" />
          <polygon points="82,78 44,78 82,40" fill={accentColor} opacity="0.45" />
          <line x1="82" y1="16" x2="16" y2="78" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};