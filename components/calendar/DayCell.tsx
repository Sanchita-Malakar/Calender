"use client";

import React, { useRef, useCallback } from "react";
import { format, isPast, isToday as checkToday } from "date-fns";

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isHoverRange: boolean;
  isWeekend: boolean;
  accentColor: string;
  dark?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

// Module-level AudioContext — shared across all DayCell instances
let audioCtx: AudioContext | null = null;

function playTap(accentColor: string) {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;
    const hueNum = parseInt(accentColor.replace("#", "").slice(0, 2), 16);
    const freq = 420 + (hueNum % 80);
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch { /* silent */ }
}

function spawnRipple(btn: HTMLButtonElement, accentColor: string) {
  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position:absolute;inset:0;border-radius:50%;
    background:${accentColor}40;transform:scale(0);
    animation:daycell-ripple 0.38s cubic-bezier(0.22,0.61,0.36,1) forwards;
    pointer-events:none;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 420);
}


let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes daycell-ripple  { to { transform: scale(2.2); opacity: 0; } }
    @keyframes daycell-pop     { 0% { transform:scale(1); } 40% { transform:scale(1.22); } 70% { transform:scale(0.95); } 100% { transform:scale(1); } }
    @keyframes daycell-today-pulse {
      0%,100% { box-shadow:0 0 0 0px var(--today-color,#1a6fa8); opacity:1; }
      50%      { box-shadow:0 0 0 5px var(--today-color,#1a6fa8); opacity:0; }
    }
    .daycell-btn {
      position:relative; z-index:10; width:36px; height:36px;
      display:flex; align-items:center; justify-content:center;
      border-radius:50%; border:none; font-size:13px;
      user-select:none; overflow:hidden;
      transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                  background-color 0.15s ease,
                  box-shadow 0.18s ease,
                  color 0.15s ease;
    }
    .daycell-btn:hover:not(.daycell-edge):not(.daycell-disabled) {
      transform: scale(1.18) translateY(-1px);
    }
    .daycell-btn:active:not(.daycell-disabled) {
      animation: daycell-pop 0.28s ease forwards;
    }
    .daycell-today-ring {
      position:absolute; inset:-3px; border-radius:50%;
      border:1.5px solid currentColor; opacity:0.55;
      animation:daycell-today-pulse 2.4s ease-in-out infinite;
      pointer-events:none;
    }
  `;
  document.head.appendChild(style);
}

export const DayCell: React.FC<DayCellProps> = ({
  day, isCurrentMonth, isToday, isStart, isEnd,
  isInRange, isHoverRange, isWeekend, accentColor, dark,
  onClick, onMouseEnter,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  
  const isEdge = isStart || isEnd;

  
  const isPastDate = isCurrentMonth && !checkToday(day) && !isStart && !isEnd && isPast(day);

  const dayNum        = format(day, "d");
  const isHighlighted = isInRange || isHoverRange;

  // ── Colour logic ──
  let color: string;
  if (isEdge)                            color = "#fff";
  else if (isToday)                      color = accentColor;
  else if (isWeekend && isCurrentMonth)  color = accentColor;
  else if (!isCurrentMonth)             color = dark ? "rgba(120,110,160,0.35)" : "#d0d0de";
  else                                   color = dark ? "var(--day-color, #d8d8f0)" : "#1a1a2e";

  const bgColor = isEdge ? accentColor : "transparent";


  const opacity = !isCurrentMonth ? 0.22 : isPastDate ? 0.38 : 1;

  let shadow = "none";
  if (isStart) shadow = `0 4px 18px ${accentColor}60, 0 2px 6px ${accentColor}40`;
  else if (isEnd) shadow = `0 4px 18px ${accentColor}50, 0 2px 6px ${accentColor}30`;

  const fontWeight = isEdge ? "800" : isToday ? "700" : isWeekend ? "600" : "400";

  const rangeStripStyle: React.CSSProperties = {
    position: "absolute", top: "4px", bottom: "4px", left: 0, right: 0, zIndex: 0,
    background: dark
      ? `linear-gradient(to bottom, ${accentColor}18, ${accentColor}2a)`
      : `linear-gradient(to bottom, ${accentColor}10, ${accentColor}1c)`,
    borderTop:    `1px solid ${accentColor}20`,
    borderBottom: `1px solid ${accentColor}20`,
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: "44px" }}
      onMouseEnter={() => onMouseEnter()}
    >
      {/* Range strip — full width for mid-range cells */}
      {isHighlighted && <div style={rangeStripStyle} />}

      {/* Start cell — strip on the right half only */}
      {isStart && (
        <div style={{ ...rangeStripStyle, left: "50%", right: 0, borderLeft: "none" }} />
      )}

      {/* End cell — strip on the left half only */}
      {isEnd && (
        <div style={{ ...rangeStripStyle, left: 0, right: "50%", borderRight: "none" }} />
      )}

      {/* Hover preview strip (dashed) */}
      {isHoverRange && !isHighlighted && (
        <div style={{
          position: "absolute", top: "4px", bottom: "4px", left: 0, right: 0, zIndex: 0,
          background: `linear-gradient(to bottom, ${accentColor}0a, ${accentColor}14)`,
          borderTop:    `1px dashed ${accentColor}25`,
          borderBottom: `1px dashed ${accentColor}25`,
        }} />
      )}

      <button
        ref={btnRef}
        onClick={() => {
          if (!isCurrentMonth) return;
          if (btnRef.current) spawnRipple(btnRef.current, accentColor);
          onClick();
        }}
        onMouseEnter={() => {
          
          ensureStyles();
          onMouseEnter();
          if (!isEdge && isCurrentMonth && !isPastDate) playTap(accentColor);
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget;
          
          b.style.backgroundColor = isEdge ? accentColor : "transparent";
          b.style.boxShadow       = isEdge ? shadow : "none";
        }}
        className={[
          "daycell-btn",
          isEdge         ? "daycell-edge"     : "",
          !isCurrentMonth ? "daycell-disabled" : "",
        ].join(" ")}
        style={{
          backgroundColor: bgColor,
          color,
          fontWeight,
          opacity,
          boxShadow: shadow,
          cursor:    isCurrentMonth ? "pointer" : "default",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize:   isEdge ? "14px" : "13px",
          letterSpacing: isEdge ? "0.02em" : "0",
          
          outline:       isEdge ? `2px solid ${accentColor}30` : "none",
          outlineOffset: "2px",
        }}
        aria-label={format(day, "PPP")}
      >
        {/* Today pulsing ring */}
        {isToday && !isEdge && (
          <span
            className="daycell-today-ring"
            style={{ color: accentColor, "--today-color": accentColor } as React.CSSProperties}
          />
        )}

        {/* Weekend dot accent */}
        {isWeekend && isCurrentMonth && !isEdge && !isToday && (
          <span style={{
            position: "absolute",
            top: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            backgroundColor: `${accentColor}70`,
          }} />
        )}

        <span style={{ position: "relative", zIndex: 1, lineHeight: 1 }}>{dayNum}</span>

        {/* FROM / TO labels on edge cells */}
        {isStart && (
          <span style={{
            position: "absolute", bottom: "-1px", left: "50%",
            transform: "translateX(-50%)",
            fontSize: "7px", fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em", lineHeight: 1,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            FROM
          </span>
        )}
        {isEnd && (
          <span style={{
            position: "absolute", bottom: "-1px", left: "50%",
            transform: "translateX(-50%)",
            fontSize: "7px", fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em", lineHeight: 1,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            TO
          </span>
        )}
      </button>
    </div>
  );
};