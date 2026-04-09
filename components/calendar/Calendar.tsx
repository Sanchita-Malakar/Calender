"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { isSameDay, format } from "date-fns";
import { DateRange, MONTH_IMAGES } from "@/lib/calendar";
import { HeroImage } from "./HeroImage";
import { MonthNavigator } from "./MonthNavigator";
import { NotesPanel } from "./NotesPanel";

type FlipDir = "next" | "prev" | null;

// =============================================================================
// TYPES
// =============================================================================
export type EventCategory = "work" | "study" | "personal" | "health" | "travel" | "other";
export type EventColor = "rose" | "amber" | "emerald" | "sky" | "violet" | "slate";

export interface PersonalEvent {
  id: string;
  date: string;
  title: string;
  category: EventCategory;
  color: EventColor;
}

export interface PublicHoliday {
  date: string;
  name: string;
  country: string;
  type: "national" | "observance" | "season";
}

export interface PublicEvent {
  date: string;
  name: string;
  category: "festival" | "global" | "awareness";
  icon: string;
}

// =============================================================================
// STATIC DATA
// =============================================================================
const PUBLIC_HOLIDAYS: PublicHoliday[] = [
  { date: "2026-01-01", name: "New Year's Day",       country: "Global", type: "national"   },
  { date: "2026-01-14", name: "Makar Sankranti",       country: "IN",     type: "national"   },
  { date: "2026-01-26", name: "Republic Day",           country: "IN",     type: "national"   },
  { date: "2026-02-14", name: "Valentine's Day",        country: "Global", type: "observance" },
  { date: "2026-03-06", name: "Maha Shivaratri",        country: "IN",     type: "national"   },
  { date: "2026-03-21", name: "Holi",                   country: "IN",     type: "national"   },
  { date: "2026-04-02", name: "Ram Navami",             country: "IN",     type: "national"   },
  { date: "2026-04-03", name: "Good Friday",            country: "Global", type: "national"   },
  { date: "2026-04-05", name: "Easter Sunday",          country: "Global", type: "national"   },
  { date: "2026-04-14", name: "Dr. Ambedkar Jayanti",  country: "IN",     type: "national"   },
  { date: "2026-05-01", name: "Labour Day",             country: "Global", type: "national"   },
  { date: "2026-05-23", name: "Buddha Purnima",         country: "IN",     type: "national"   },
  { date: "2026-06-21", name: "International Yoga Day", country: "IN",     type: "observance" },
  { date: "2026-07-17", name: "Muharram",               country: "IN",     type: "national"   },
  { date: "2026-08-15", name: "Independence Day",        country: "IN",     type: "national"   },
  { date: "2026-08-26", name: "Janmashtami",             country: "IN",     type: "national"   },
  { date: "2026-09-17", name: "Ganesh Chaturthi",        country: "IN",     type: "national"   },
  { date: "2026-10-02", name: "Gandhi Jayanti",          country: "IN",     type: "national"   },
  { date: "2026-10-20", name: "Dussehra",                country: "IN",     type: "national"   },
  { date: "2026-11-08", name: "Diwali",                  country: "IN",     type: "national"   },
  { date: "2026-11-10", name: "Bhai Dooj",               country: "IN",     type: "national"   },
  { date: "2026-11-25", name: "Guru Nanak Jayanti",      country: "IN",     type: "national"   },
  { date: "2026-12-25", name: "Christmas Day",           country: "Global", type: "national"   },
  { date: "2026-12-31", name: "New Year's Eve",          country: "Global", type: "observance" },
];

const PUBLIC_EVENTS: PublicEvent[] = [
  { date: "2026-01-01", name: "New Year",      category: "global",    icon: "🎆" },
  { date: "2026-02-14", name: "Valentine's",   category: "festival",  icon: "💝" },
  { date: "2026-03-08", name: "Women's Day",   category: "awareness", icon: "♀️" },
  { date: "2026-03-21", name: "Holi",          category: "festival",  icon: "🎨" },
  { date: "2026-04-22", name: "Earth Day",     category: "awareness", icon: "🌍" },
  { date: "2026-05-01", name: "Labour Day",    category: "global",    icon: "✊" },
  { date: "2026-06-05", name: "World Env Day", category: "awareness", icon: "🌿" },
  { date: "2026-06-21", name: "Yoga Day",      category: "awareness", icon: "🧘" },
  { date: "2026-08-15", name: "Independence",  category: "festival",  icon: "🇮🇳" },
  { date: "2026-10-02", name: "Gandhi Jayanti",category: "global",    icon: "☮️" },
  { date: "2026-10-31", name: "Halloween",     category: "festival",  icon: "🎃" },
  { date: "2026-11-08", name: "Diwali",        category: "festival",  icon: "🪔" },
  { date: "2026-12-25", name: "Christmas",     category: "festival",  icon: "🎄" },
  { date: "2026-12-31", name: "NYE",           category: "festival",  icon: "🎉" },
];

// =============================================================================
// CONFIG
// =============================================================================
const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bg: string; darkBg: string; darkColor: string }> = {
  work:     { label: "Work",     color: "#2563eb", bg: "#dbeafe", darkBg: "#1e3a6e", darkColor: "#93c5fd" },
  study:    { label: "Study",    color: "#7c3aed", bg: "#ede9fe", darkBg: "#3b1f6e", darkColor: "#c4b5fd" },
  personal: { label: "Personal", color: "#db2777", bg: "#fce7f3", darkBg: "#6e1f4e", darkColor: "#f9a8d4" },
  health:   { label: "Health",   color: "#059669", bg: "#d1fae5", darkBg: "#1a4a3a", darkColor: "#6ee7b7" },
  travel:   { label: "Travel",   color: "#d97706", bg: "#fef3c7", darkBg: "#5a3a0e", darkColor: "#fcd34d" },
  other:    { label: "Other",    color: "#6b7280", bg: "#f3f4f6", darkBg: "#374151", darkColor: "#d1d5db" },
};

const COLOR_CONFIG: Record<EventColor, { hex: string; label: string }> = {
  rose:    { hex: "#f43f5e", label: "Rose"    },
  amber:   { hex: "#f59e0b", label: "Amber"   },
  emerald: { hex: "#10b981", label: "Emerald" },
  sky:     { hex: "#0ea5e9", label: "Sky"     },
  violet:  { hex: "#8b5cf6", label: "Violet"  },
  slate:   { hex: "#64748b", label: "Slate"   },
};

const HOLIDAY_COLORS = {
  national:   { bg: "#fee2e2", color: "#dc2626", darkBg: "#5a1a1a", darkColor: "#fca5a5", dot: "#dc2626" },
  observance: { bg: "#fef3c7", color: "#b45309", darkBg: "#4a3000", darkColor: "#fcd34d", dot: "#f59e0b" },
  season:     { bg: "#d1fae5", color: "#065f46", darkBg: "#0a3a2a", darkColor: "#6ee7b7", dot: "#10b981" },
};

const EVENT_CAT_COLORS = {
  festival:  { bg: "#fdf4ff", color: "#a21caf", darkBg: "#4a0a5e", darkColor: "#e879f9", dot: "#c026d3" },
  global:    { bg: "#eff6ff", color: "#1d4ed8", darkBg: "#1a2d6e", darkColor: "#93c5fd", dot: "#3b82f6" },
  awareness: { bg: "#f0fdf4", color: "#166534", darkBg: "#0a3a1a", darkColor: "#86efac", dot: "#22c55e" },
};

// =============================================================================
// LOCAL STORAGE
// =============================================================================
const LS_KEY = "cal_personal_events_v1";
function loadEvents(): PersonalEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveEvents(ev: PersonalEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(ev));
}

// =============================================================================
// AUDIO
// =============================================================================
let _audioCtx: AudioContext | null = null;
function initAudio() { if (_audioCtx) return; _audioCtx = new AudioContext(); }
function playDoubleSnap(ac: AudioContext) {
  const t = ac.currentTime;
  const snap = (when: number, freq: number, vol: number) => {
    const buf = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.015));
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 2;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.055);
    src.connect(bp); bp.connect(g); g.connect(ac.destination);
    src.start(when); src.stop(when + 0.062);
  };
  snap(t, 3200, 0.6); snap(t + 0.14, 2400, 0.5);
}
function playPageFlip() {
  try { if (!_audioCtx) _audioCtx = new AudioContext(); if (_audioCtx.state === "suspended") _audioCtx.resume(); playDoubleSnap(_audioCtx); } catch { /**/ }
}

// =============================================================================
// BLEND UTILITY
// =============================================================================
function blendHex(hex1: string, hex2: string, t: number): string {
  const p = (h: string) => { const c = h.replace("#","").padEnd(6,"0"); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
  const [r1,g1,b1] = p(hex1); const [r2,g2,b2] = p(hex2);
  return `#${[r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")}`;
}

// =============================================================================
// MODAL STYLES (keyframe injected once)
// =============================================================================
const MODAL_STYLES = `
  @keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
`;

// =============================================================================
// EVENT MODAL — add / edit personal event
// =============================================================================
interface EventModalProps {
  date: Date;
  event?: PersonalEvent;
  accentColor: string;
  dark?: boolean;
  onSave: (e: PersonalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ date, event, accentColor, dark, onSave, onDelete, onClose }) => {
  const [title,    setTitle]    = useState(event?.title    || "");
  const [category, setCategory] = useState<EventCategory>(event?.category || "personal");
  const [color,    setColor]    = useState<EventColor>(event?.color || "violet");

  const bg          = dark ? "rgba(14,12,32,0.99)"        : "rgba(255,255,255,0.99)";
  const borderClr   = dark ? "rgba(80,65,140,0.55)"       : "rgba(220,215,245,0.95)";
  const textMain    = dark ? "#e8e4ff"                    : "#1a1535";
  const textSub     = dark ? "#9890c0"                    : "#6b6490";
  const inputBg     = dark ? "rgba(30,25,60,0.85)"        : "rgba(248,246,255,0.95)";
  const inputBorder = dark ? "rgba(80,65,140,0.4)"        : "rgba(210,205,235,0.8)";

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ id: event?.id || `${format(date,"yyyy-MM-dd")}_${Date.now()}`, date: format(date,"yyyy-MM-dd"), title: title.trim(), category, color });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.48)", backdropFilter:"blur(7px)", animation:"overlayIn 0.18s ease" }} onClick={onClose}>
      <style>{MODAL_STYLES}</style>
      <div onClick={e => e.stopPropagation()} style={{ width:"min(430px,94vw)", borderRadius:"22px", background:bg, border:`1px solid ${borderClr}`, boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(80,65,140,0.25)" : "0 24px 64px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.95)", overflow:"hidden", animation:"modalIn 0.24s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {/* Header */}
        <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${dark?"rgba(80,65,140,0.18)":"rgba(200,195,235,0.4)"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:"10px", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.14em", color:accentColor, fontWeight:700, marginBottom:"3px" }}>{event?"EDIT EVENT":"NEW EVENT"}</div>
            <div style={{ fontSize:"16px", fontWeight:700, color:textMain, fontFamily:"'Lora',serif" }}>{format(date,"MMMM d, yyyy")}</div>
          </div>
          <button onClick={onClose} style={{ width:"30px",height:"30px",borderRadius:"50%",border:`1px solid ${inputBorder}`,background:inputBg,color:textSub,cursor:"pointer",fontSize:"18px",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 22px 22px", display:"flex", flexDirection:"column", gap:"18px" }}>
          {/* Title */}
          <div>
            <label style={{ display:"block", fontSize:"10px", fontWeight:700, letterSpacing:"0.12em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>EVENT TITLE</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSave()} placeholder="What's happening?" autoFocus style={{ width:"100%", padding:"11px 14px", borderRadius:"11px", border:`1.5px solid ${title?accentColor+"70":inputBorder}`, background:inputBg, color:textMain, fontSize:"14px", fontFamily:"'Lora',serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }} />
          </div>

          {/* Category */}
          <div>
            <label style={{ display:"block", fontSize:"10px", fontWeight:700, letterSpacing:"0.12em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>CATEGORY</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const sel = category === cat;
                return (
                  <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:"5px 13px", borderRadius:"20px", cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.05em", background:sel?cfg.color:(dark?cfg.darkBg:cfg.bg), color:sel?"#fff":(dark?cfg.darkColor:cfg.color), border:`1.5px solid ${sel?cfg.color:"transparent"}`, transition:"all 0.18s" }}>{cfg.label}</button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ display:"block", fontSize:"10px", fontWeight:700, letterSpacing:"0.12em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>COLOR LABEL</label>
            <div style={{ display:"flex", gap:"9px", alignItems:"center" }}>
              {(Object.keys(COLOR_CONFIG) as EventColor[]).map(c => (
                <button key={c} onClick={()=>setColor(c)} title={COLOR_CONFIG[c].label} style={{ width:"27px", height:"27px", borderRadius:"50%", cursor:"pointer", background:COLOR_CONFIG[c].hex, border:`3px solid ${color===c?(dark?"#fff":"#1a1535"):"transparent"}`, outline:color===c?`2.5px solid ${COLOR_CONFIG[c].hex}`:"none", outlineOffset:"2px", transition:"all 0.18s", flexShrink:0 }} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:"8px", marginTop:"2px" }}>
            {event && onDelete && (
              <button onClick={()=>{onDelete(event.id);onClose();}} style={{ padding:"10px 14px", borderRadius:"11px", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", background:dark?"rgba(100,20,20,0.5)":"#fee2e2", color:dark?"#fca5a5":"#dc2626", border:`1px solid ${dark?"rgba(220,38,38,0.3)":"#fca5a5"}`, letterSpacing:"0.06em", transition:"all 0.2s" }}>DELETE</button>
            )}
            <button onClick={onClose} style={{ flex:1, padding:"10px 14px", borderRadius:"11px", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", background:"transparent", color:textSub, border:`1px solid ${inputBorder}`, letterSpacing:"0.06em" }}>CANCEL</button>
            <button onClick={handleSave} disabled={!title.trim()} style={{ flex:2, padding:"10px 20px", borderRadius:"11px", cursor:title.trim()?"pointer":"default", fontSize:"12px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", background:title.trim()?`linear-gradient(135deg,${accentColor},${blendHex(accentColor,"#8b5cf6",0.4)})`:inputBg, color:title.trim()?"#fff":textSub, border:"none", letterSpacing:"0.08em", boxShadow:title.trim()?`0 4px 16px ${accentColor}40`:"none", transition:"all 0.2s" }}>{event?"SAVE CHANGES":"ADD EVENT"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DAY DETAIL PANEL
// =============================================================================
interface DayDetailProps {
  date: Date;
  holidays: PublicHoliday[];
  publicEvents: PublicEvent[];
  personalEvents: PersonalEvent[];
  accentColor: string;
  dark?: boolean;
  onAddEvent: () => void;
  onEditEvent: (e: PersonalEvent) => void;
  onClose: () => void;
}

const DayDetailPanel: React.FC<DayDetailProps> = ({ date, holidays, publicEvents, personalEvents, accentColor, dark, onAddEvent, onEditEvent, onClose }) => {
  const bg        = dark ? "rgba(14,12,32,0.99)"  : "rgba(255,255,255,0.99)";
  const borderClr = dark ? "rgba(80,65,140,0.55)" : "rgba(220,215,245,0.95)";
  const textMain  = dark ? "#e8e4ff"              : "#1a1535";
  const textSub   = dark ? "#9890c0"              : "#6b6490";
  const divider   = dark ? "rgba(80,65,140,0.18)" : "rgba(200,195,235,0.4)";
  const inputBg   = dark ? "rgba(30,25,60,0.85)"  : "rgba(248,246,255,0.95)";
  const inputBdr  = dark ? "rgba(80,65,140,0.4)"  : "rgba(210,205,235,0.8)";
  const hasAny    = holidays.length > 0 || publicEvents.length > 0 || personalEvents.length > 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.44)", backdropFilter:"blur(7px)", animation:"overlayIn 0.18s ease" }} onClick={onClose}>
      <style>{MODAL_STYLES}</style>
      <div onClick={e=>e.stopPropagation()} style={{ width:"min(420px,94vw)", maxHeight:"82vh", borderRadius:"22px", background:bg, border:`1px solid ${borderClr}`, boxShadow:dark?"0 32px 80px rgba(0,0,0,0.75)":"0 24px 64px rgba(0,0,0,0.20)", overflow:"hidden", display:"flex", flexDirection:"column", animation:"modalIn 0.24s cubic-bezier(0.34,1.56,0.64,1)" }}>

        {/* Header */}
        <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${divider}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:"10px", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.14em", color:accentColor, fontWeight:700, marginBottom:"3px" }}>{format(date,"EEEE").toUpperCase()}</div>
            <div style={{ fontSize:"18px", fontWeight:700, color:textMain, fontFamily:"'Lora',serif" }}>{format(date,"MMMM d, yyyy")}</div>
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <button onClick={onAddEvent} style={{ padding:"7px 16px", borderRadius:"10px", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", background:`linear-gradient(135deg,${accentColor},${blendHex(accentColor,"#8b5cf6",0.4)})`, color:"#fff", border:"none", letterSpacing:"0.06em", boxShadow:`0 4px 12px ${accentColor}40` }}>+ ADD</button>
            <button onClick={onClose} style={{ width:"30px",height:"30px",borderRadius:"50%",border:`1px solid ${inputBdr}`,background:inputBg,color:textSub,cursor:"pointer",fontSize:"18px",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY:"auto", padding:"16px 22px 22px", display:"flex", flexDirection:"column", gap:"16px" }}>
          {!hasAny && (
            <div style={{ textAlign:"center", padding:"28px 0", color:textSub }}>
              <div style={{ fontSize:"28px", marginBottom:"10px" }}>📅</div>
              <div style={{ fontSize:"14px", fontFamily:"'Lora',serif" }}>No events on this day.</div>
              <div style={{ fontSize:"12px", opacity:0.6, marginTop:"4px" }}>Tap "+ ADD" to create your first one.</div>
            </div>
          )}

          {/* Public Holidays */}
          {holidays.length > 0 && (
            <div>
              <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.14em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>🎌 PUBLIC HOLIDAYS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {holidays.map((h,i) => {
                  const cfg = HOLIDAY_COLORS[h.type];
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", borderRadius:"12px", background:dark?cfg.darkBg:cfg.bg, border:`1px solid ${cfg.dot}25` }}>
                      <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:cfg.dot,flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px",fontWeight:600,color:dark?cfg.darkColor:cfg.color }}>{h.name}</div>
                        <div style={{ fontSize:"11px",color:textSub,marginTop:"2px" }}>{h.country} · <span style={{ textTransform:"capitalize" }}>{h.type}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Public Events */}
          {publicEvents.length > 0 && (
            <div>
              <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.14em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>🌐 PUBLIC EVENTS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {publicEvents.map((ev,i) => {
                  const cfg = EVENT_CAT_COLORS[ev.category];
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", borderRadius:"12px", background:dark?cfg.darkBg:cfg.bg, border:`1px solid ${cfg.dot}25` }}>
                      <span style={{ fontSize:"22px" }}>{ev.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px",fontWeight:600,color:dark?cfg.darkColor:cfg.color }}>{ev.name}</div>
                        <div style={{ fontSize:"11px",color:textSub,marginTop:"2px",textTransform:"capitalize" }}>{ev.category}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal Events */}
          {personalEvents.length > 0 && (
            <div>
              <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.14em", color:textSub, marginBottom:"8px", fontFamily:"'Barlow Condensed',sans-serif" }}>✏️ MY EVENTS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {personalEvents.map(ev => {
                  const catCfg = CATEGORY_CONFIG[ev.category];
                  const colHex = COLOR_CONFIG[ev.color].hex;
                  return (
                    <div key={ev.id} onClick={()=>onEditEvent(ev)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", borderRadius:"12px", cursor:"pointer", background:dark?catCfg.darkBg:catCfg.bg, border:`1.5px solid ${colHex}35`, transition:"opacity 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="0.78"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                    >
                      <div style={{ width:"10px",height:"10px",borderRadius:"50%",background:colHex,flexShrink:0,boxShadow:`0 0 6px ${colHex}60` }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px",fontWeight:600,color:dark?catCfg.darkColor:catCfg.color }}>{ev.title}</div>
                        <div style={{ fontSize:"11px",color:textSub,marginTop:"2px" }}>{catCfg.label}</div>
                      </div>
                      <span style={{ fontSize:"13px",opacity:0.5 }}>›</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HOLIDAY TOOLTIP
// =============================================================================
const HolidayTooltip: React.FC<{ name: string; type: string; dark?: boolean }> = ({ name, type, dark }) => (
  <div style={{ position:"absolute", bottom:"calc(100% + 7px)", left:"50%", transform:"translateX(-50%)", background:dark?"rgba(18,14,42,0.98)":"rgba(255,255,255,0.98)", border:`1px solid ${dark?"rgba(80,65,140,0.5)":"rgba(200,195,230,0.85)"}`, borderRadius:"9px", padding:"7px 11px", fontSize:"11px", fontWeight:600, whiteSpace:"nowrap", color:dark?"#e8e4ff":"#1a1535", boxShadow:"0 6px 20px rgba(0,0,0,0.22)", zIndex:200, pointerEvents:"none", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.04em" }}>
    {name}
    <div style={{ fontSize:"10px", opacity:0.55, textTransform:"capitalize", marginTop:"1px" }}>{type}</div>
    <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:`5px solid ${dark?"rgba(80,65,140,0.5)":"rgba(200,195,230,0.85)"}` }} />
  </div>
);

// =============================================================================
// ENHANCED CALENDAR GRID
// =============================================================================
const DAY_HEADERS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

interface EnhancedGridProps {
  currentMonth: Date;
  range: DateRange;
  hoverDate: Date | null;
  accentColor: string;
  dark?: boolean;
  personalEvents: PersonalEvent[];
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
}

const EnhancedCalendarGrid: React.FC<EnhancedGridProps> = ({ currentMonth, range, hoverDate, accentColor, dark, personalEvents, onDayClick, onDayHover }) => {
  const [tooltip, setTooltip] = useState<string|null>(null);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const days: (Date|null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: last.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (days.length % 7 !== 0) days.push(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const ds  = (d: Date) => format(d, "yyyy-MM-dd");
  const hols = (d: Date) => PUBLIC_HOLIDAYS.filter(h => h.date === ds(d));
  const pubs = (d: Date) => PUBLIC_EVENTS.filter(e => e.date === ds(d));
  const pers = (d: Date) => personalEvents.filter(e => e.date === ds(d));

  const inRange = (d: Date) => {
    if (!range.start) return false;
    const end = range.end || hoverDate;
    if (!end) return false;
    const [s,e] = range.start <= end ? [range.start, end] : [end, range.start];
    return d >= s && d <= e;
  };

  const textPrimary = dark ? "#e8e4ff" : "#1a1535";
  const textMuted   = dark ? "#7068a0" : "#a09ab8";

  return (
    <div style={{ userSelect:"none" }}>
      {/* Headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"5px" }}>
        {DAY_HEADERS.map((d,i) => (
          <div key={d} style={{ textAlign:"center", padding:"3px 0", fontSize:"10px", fontWeight:700, letterSpacing:"0.10em", fontFamily:"'Barlow Condensed',sans-serif", color:(i===5||i===6)?(dark?"rgba(244,63,94,0.5)":"rgba(244,63,94,0.6)"):textMuted }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
        {days.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} style={{ minHeight:"50px" }} />;

          const d        = ds(day);
          const holidays = hols(day);
          const pubEvs   = pubs(day);
          const perEvs   = pers(day);
          const isToday  = d === todayStr;
          const isSel    = (range.start && isSameDay(day, range.start)) || (range.end && isSameDay(day, range.end));
          const isRange  = inRange(day);
          const isHol    = holidays.length > 0;
          const dow      = (day.getDay() + 6) % 7;
          const isWknd   = dow === 5 || dow === 6;

          // Badges: show up to 2 total
          const allBadges = [
            ...pubEvs.map(e => ({ type:"pub" as const, data:e })),
            ...perEvs.map(e => ({ type:"per" as const, data:e })),
          ];
          const shown  = allBadges.slice(0, 2);
          const extras = allBadges.length - shown.length + (isHol && !isSel ? 0 : 0);

          return (
            <div
              key={d}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
              style={{
                position:"relative", borderRadius:"8px", padding:"4px 3px 4px", minHeight:"52px",
                cursor:"pointer",
                background: isSel
                  ? `linear-gradient(135deg,${accentColor},${blendHex(accentColor,"#8b5cf6",0.4)})`
                  : isRange ? `${accentColor}18` : "transparent",
                border: isToday
                  ? `2px solid ${accentColor}`
                  : isRange ? `1.5px solid ${accentColor}28` : "1.5px solid transparent",
                transition:"all 0.14s ease",
                display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
              }}
              onMouseOver={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = isRange?`${accentColor}25`:(dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"); }}
              onMouseOut={e  => { if (!isSel) (e.currentTarget as HTMLElement).style.background = isRange?`${accentColor}18`:"transparent"; }}
            >
              {/* Holiday dot (top-right) */}
              {isHol && !isSel && (
                <div
                  onMouseEnter={()=>setTooltip(d)}
                  onMouseLeave={()=>setTooltip(null)}
                  style={{ position:"absolute", top:"4px", right:"4px", width:"6px", height:"6px", borderRadius:"50%", background:HOLIDAY_COLORS[holidays[0].type].dot, cursor:"help", zIndex:10 }}
                />
              )}
              {tooltip === d && isHol && <HolidayTooltip name={holidays[0].name} type={holidays[0].type} dark={dark} />}

              {/* Day number */}
              <div style={{
                fontSize:"13px", fontWeight: isToday||isSel ? 800 : 500, lineHeight:1,
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em",
                color: isSel  ? "#fff"
                     : isToday ? accentColor
                     : isHol  ? HOLIDAY_COLORS[holidays[0].type].dot
                     : isWknd ? (dark?"rgba(244,63,94,0.55)":"rgba(244,63,94,0.65)")
                     : textPrimary,
              }}>{day.getDate()}</div>

              {/* Event badges */}
              <div style={{ display:"flex", flexDirection:"column", gap:"1px", width:"100%", padding:"0 1px" }}>
                {shown.map((b,bi) => {
                  if (b.type === "pub") {
                    const cfg = EVENT_CAT_COLORS[(b.data as PublicEvent).category];
                    const ev  = b.data as PublicEvent;
                    return (
                      <div key={bi} style={{ fontSize:"9px", lineHeight:1.25, fontWeight:600, padding:"1px 3px", borderRadius:"3px", background:isSel?"rgba(255,255,255,0.25)":(dark?cfg.darkBg:cfg.bg), color:isSel?"#fff":(dark?cfg.darkColor:cfg.color), fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.icon} {ev.name}</div>
                    );
                  }
                  const ev  = b.data as PersonalEvent;
                  const hex = COLOR_CONFIG[ev.color].hex;
                  return (
                    <div key={bi} style={{ fontSize:"9px", lineHeight:1.25, fontWeight:600, padding:"1px 3px", borderRadius:"3px", background:isSel?"rgba(255,255,255,0.25)":`${hex}20`, color:isSel?"#fff":hex, borderLeft:`2px solid ${hex}`, fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.title}</div>
                  );
                })}
                {allBadges.length > 2 && (
                  <div style={{ fontSize:"9px", lineHeight:1.2, fontWeight:700, color:isSel?"rgba(255,255,255,0.85)":accentColor, fontFamily:"'Barlow Condensed',sans-serif", padding:"0 3px" }}>+{allBadges.length-2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// SLIDING MONTH PLATE
// =============================================================================
const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface SlideMonthProps { currentMonth: Date; accentColor: string; dark?: boolean; onChange: (d: Date) => void; }

const SlidingMonthPlate: React.FC<SlideMonthProps> = ({ currentMonth, accentColor, dark, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdx = currentMonth.getMonth();

  useEffect(() => {
    if (!scrollRef.current) return;
    const c = scrollRef.current;
    const el = c.children[activeIdx] as HTMLElement;
    if (el) c.scrollTo({ left: el.offsetLeft - c.clientWidth/2 + el.clientWidth/2, behavior:"smooth" });
  }, [activeIdx]);

  return (
    <div style={{ position:"relative", padding:"16px 0 14px", background:"transparent" }}>
      <div style={{ height:"76px", display:"flex", alignItems:"flex-end", paddingBottom:"6px" }}>
        <div ref={scrollRef} style={{ display:"flex", gap:"10px", overflowX:"auto", paddingLeft:"28px", paddingRight:"28px", paddingTop:"10px", paddingBottom:"2px", scrollbarWidth:"none", msOverflowStyle:"none", WebkitOverflowScrolling:"touch" as React.CSSProperties["WebkitOverflowScrolling"], scrollSnapType:"x mandatory", alignItems:"flex-end", width:"100%" }} className="no-scrollbar">
          {Object.entries(MONTH_IMAGES).map(([idx, data]) => {
            const i = Number(idx);
            const isActive = activeIdx === i;
            const d = new Date(currentMonth.getFullYear(), i, 1);
            return (
              <button key={i} onClick={()=>onChange(d)} style={{ flexShrink:0, scrollSnapAlign:"center", width:"58px", height:"58px", borderRadius:isActive?"17px":"14px", background:isActive?`linear-gradient(135deg,${data.palette},${blendHex(data.palette,"#ff88cc",0.35)})`:(dark?"rgba(30,25,60,0.7)":"rgba(240,238,252,0.8)"), border:isActive?"2px solid rgba(255,255,255,0.4)":`1.5px solid ${dark?"rgba(70,60,120,0.4)":"rgba(200,195,230,0.6)"}`, boxShadow:isActive?`0 6px 20px ${data.palette}55, inset 0 1px 0 rgba(255,255,255,0.3)`:`0 2px 8px rgba(0,0,0,0.06)`, backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", cursor:"pointer", transition:"all 0.28s cubic-bezier(0.34,1.56,0.64,1)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", transform:isActive?"translateY(-3px) scale(1.05)":"translateY(0) scale(1)" }} aria-label={MONTH_NAMES_SHORT[i]}>
                <div style={{ width:isActive?"12px":"10px", height:isActive?"12px":"10px", borderRadius:"50%", background:isActive?"rgba(255,255,255,0.85)":data.palette, transition:"all 0.25s", boxShadow:isActive?"0 0 8px rgba(255,255,255,0.5)":"none" }} />
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:isActive?"13px":"11px", fontWeight:isActive?800:600, color:isActive?"#fff":(dark?"rgba(160,150,210,0.75)":"#8080a8"), letterSpacing:"0.08em", transition:"all 0.25s", lineHeight:1 }}>{MONTH_NAMES_SHORT[i]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"24px", background:`linear-gradient(to right,${dark?"rgba(13,10,26,0.95)":"rgba(245,243,255,0.95)"},transparent)`, pointerEvents:"none", zIndex:2 }} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"24px", background:`linear-gradient(to left,${dark?"rgba(13,10,26,0.95)":"rgba(245,243,255,0.95)"},transparent)`, pointerEvents:"none", zIndex:2 }} />
    </div>
  );
};

// =============================================================================
// PROFESSIONAL HEADER BAR
// =============================================================================
const CalendarHeader: React.FC<{ accentColor: string; dark?: boolean }> = ({ accentColor, dark }) => {
  const year = new Date().getFullYear();
  return (
    <div style={{ position:"relative", borderRadius:"20px 20px 0 0", overflow:"hidden", background:dark?`linear-gradient(135deg,rgba(14,11,32,1) 0%,${blendHex(accentColor,"#0c0a28",0.55)} 50%,rgba(18,14,42,1) 100%)`:`linear-gradient(135deg,${blendHex(accentColor,"#ffffff",0.88)} 0%,${blendHex(accentColor,"#f5f3ff",0.72)} 50%,${blendHex(accentColor,"#ece8ff",0.60)} 100%)`, padding:"0 28px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${dark?`${accentColor}30`:`${accentColor}25`}`, boxShadow:dark?"inset 0 -1px 0 rgba(255,255,255,0.04)":"inset 0 -1px 0 rgba(255,255,255,0.7)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"3px", height:"22px", borderRadius:"2px", background:`linear-gradient(to bottom,${accentColor},${blendHex(accentColor,"#ffffff",0.3)})`, opacity:0.9 }} />
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.20em", textTransform:"uppercase" as const, color:dark?`${accentColor}cc`:blendHex(accentColor,"#000000",0.42), opacity:0.85 }}>CALENDAR</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", opacity:0.35 }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ width:i===2?"5px":"3px", height:i===2?"5px":"3px", borderRadius:"50%", background:dark?accentColor:blendHex(accentColor,"#000000",0.5) }} />)}
      </div>
      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"13px", fontWeight:700, letterSpacing:"0.14em", color:dark?`${accentColor}bb`:blendHex(accentColor,"#000000",0.45), opacity:0.8 }}>{year}</span>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:dark?"linear-gradient(to right,transparent,rgba(255,255,255,0.12) 30%,rgba(255,255,255,0.18) 70%,transparent)":"linear-gradient(to right,transparent,rgba(255,255,255,0.95) 30%,rgba(255,255,255,1) 70%,transparent)", pointerEvents:"none" }} />
    </div>
  );
};

// =============================================================================
// MAIN CALENDAR
// =============================================================================
interface CalendarProps { dark?: boolean; }

export const Calendar: React.FC<CalendarProps> = ({ dark }) => {
  const [currentMonth,  setCurrentMonth]  = useState(new Date());
  const [range,         setRange]         = useState<DateRange>({ start: null, end: null });
  const [hoverDate,     setHoverDate]     = useState<Date | null>(null);
  const [flipDir,       setFlipDir]       = useState<FlipDir>(null);
  const [isAnimating,   setIsAnimating]   = useState(false);
  const [displayMonth,  setDisplayMonth]  = useState(new Date());
  const [slideClass,    setSlideClass]    = useState("");
  const [isSliding,     setIsSliding]     = useState(false);
  const [personalEvents,setPersonalEvents]= useState<PersonalEvent[]>([]);
  const [modalState,    setModalState]    = useState<{ mode:"add"|"edit"|"detail"|null; date:Date|null; event?:PersonalEvent }>({ mode:null, date:null });

  useEffect(() => { setPersonalEvents(loadEvents()); }, []);

  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const slideRef       = useRef<ReturnType<typeof setTimeout>|null>(null);
  const touchStartX    = useRef<number|null>(null);
  const touchStartY    = useRef<number|null>(null);
  const wheelDebounce  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const wheelAccum     = useRef<number>(0);
  const cardRef        = useRef<HTMLDivElement>(null);

  const monthIndex  = currentMonth.getMonth();
  const accentColor = MONTH_IMAGES[monthIndex].palette;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const chk = () => setIsMobile(window.innerWidth < 768); chk(); window.addEventListener("resize",chk); return () => window.removeEventListener("resize",chk); }, []);
  useEffect(() => { const warm = () => { initAudio(); document.removeEventListener("pointerdown",warm); }; document.addEventListener("pointerdown",warm,{once:true}); }, []);

  const handleSaveEvent = useCallback((ev: PersonalEvent) => {
    setPersonalEvents(prev => { const upd = [...prev.filter(e=>e.id!==ev.id), ev]; saveEvents(upd); return upd; });
  }, []);
  const handleDeleteEvent = useCallback((id: string) => {
    setPersonalEvents(prev => { const upd = prev.filter(e=>e.id!==id); saveEvents(upd); return upd; });
  }, []);

  const handleDayClick  = useCallback((day: Date) => { setModalState({ mode:"detail", date:day }); }, []);
  const handleDayHover  = useCallback((day: Date) => { if (range.start&&!range.end) setHoverDate(day); }, [range]);
  const handleGridLeave = useCallback(() => { if (range.start&&!range.end) setHoverDate(null); }, [range]);

  const handleSwipeStart = useCallback((e: React.TouchEvent) => { touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }, []);
  const handleSwipeEnd   = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current===null||touchStartY.current===null) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current, dy=e.changedTouches[0].clientY-touchStartY.current;
    touchStartX.current=null; touchStartY.current=null;
    if (Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.4) return;
    const next=new Date(currentMonthRef.current);
    if (dx<0) next.setMonth(next.getMonth()+1); else next.setMonth(next.getMonth()-1);
    handleMonthChange(next);
  }, []); // eslint-disable-line

  const handleMonthChange = (date: Date) => {
    if (isAnimating||isSliding) return;
    const dir: FlipDir = date>currentMonth?"next":"prev";
    playPageFlip();
    if (isMobile) {
      setIsSliding(true); setSlideClass(`month-slide-out-${dir}`);
      if (slideRef.current) clearTimeout(slideRef.current);
      slideRef.current = setTimeout(() => { setCurrentMonth(date); setDisplayMonth(date); setSlideClass(`month-slide-in-${dir}`); setTimeout(()=>{setSlideClass("");setIsSliding(false);},340); }, 290);
    } else {
      setFlipDir(dir); setIsAnimating(true);
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = setTimeout(() => { setCurrentMonth(date); setDisplayMonth(date); setFlipDir(null); setTimeout(()=>setIsAnimating(false),480); }, 250);
    }
  };

  const currentMonthRef = useRef(currentMonth);
  const isAnimatingRef  = useRef(isAnimating);
  const isSlidingRef    = useRef(isSliding);
  const isMobileRef     = useRef(isMobile);
  useEffect(()=>{currentMonthRef.current=currentMonth;},[currentMonth]);
  useEffect(()=>{isAnimatingRef.current=isAnimating;},[isAnimating]);
  useEffect(()=>{isSlidingRef.current=isSliding;},[isSliding]);
  useEffect(()=>{isMobileRef.current=isMobile;},[isMobile]);

  useEffect(() => {
    const el=cardRef.current; if (!el) return;
    const onWheel=(e:WheelEvent)=>{
      if (Math.abs(e.deltaX)<Math.abs(e.deltaY)*0.8) return;
      e.preventDefault(); wheelAccum.current+=e.deltaX;
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current);
      wheelDebounce.current=setTimeout(()=>{
        const tot=wheelAccum.current; wheelAccum.current=0;
        if (Math.abs(tot)<30||isAnimatingRef.current||isSlidingRef.current) return;
        const next=new Date(currentMonthRef.current);
        if (tot>0) next.setMonth(next.getMonth()+1); else next.setMonth(next.getMonth()-1);
        const dir:FlipDir=tot>0?"next":"prev"; playPageFlip();
        if (isMobileRef.current) {
          setIsSliding(true); setSlideClass(`month-slide-out-${dir}`);
          if (slideRef.current) clearTimeout(slideRef.current);
          slideRef.current=setTimeout(()=>{setCurrentMonth(next);setDisplayMonth(next);setSlideClass(`month-slide-in-${dir}`);setTimeout(()=>{setSlideClass("");setIsSliding(false);},340);},290);
        } else {
          setFlipDir(dir); setIsAnimating(true);
          if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
          flipTimeoutRef.current=setTimeout(()=>{setCurrentMonth(next);setDisplayMonth(next);setFlipDir(null);setTimeout(()=>setIsAnimating(false),480);},250);
        }
      },80);
    };
    el.addEventListener("wheel",onWheel,{passive:false});
    return ()=>el.removeEventListener("wheel",onWheel);
  },[]);

  useEffect(()=>()=>{ if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current); if (slideRef.current) clearTimeout(slideRef.current); },[]);

  const cardBg     = dark ? `rgba(14,12,32,0.92)`       : `rgba(255,255,255,0.82)`;
  const cardBorder = dark ? `rgba(80,65,140,0.55)`      : `rgba(255,255,255,0.95)`;

  const mDate    = modalState.date;
  const mDateStr = mDate ? format(mDate,"yyyy-MM-dd") : "";
  const mHols    = mDate ? PUBLIC_HOLIDAYS.filter(h=>h.date===mDateStr) : [];
  const mPubs    = mDate ? PUBLIC_EVENTS.filter(e=>e.date===mDateStr)   : [];
  const mPers    = mDate ? personalEvents.filter(e=>e.date===mDateStr)   : [];

  return (
    <div className="w-full" style={{ fontFamily:"'Lora',serif" }}>
      <div style={{ maxWidth:"860px", margin:"0 auto", perspective:"1200px", perspectiveOrigin:"50% -10%", position:"relative", paddingBottom:"16px" }}>

        {/* Backdrop glow */}
        <div style={{ position:"absolute", top:"-18px", left:"-22px", right:"-22px", bottom:"0px", borderRadius:"32px", background:dark?`radial-gradient(ellipse at 30% 40%,${accentColor}18 0%,rgba(8,6,22,0) 65%),radial-gradient(ellipse at 75% 20%,rgba(80,60,160,0.18) 0%,transparent 55%)`:`radial-gradient(ellipse at 30% 40%,${accentColor}12 0%,rgba(255,255,255,0) 65%),radial-gradient(ellipse at 75% 20%,rgba(200,185,255,0.22) 0%,transparent 55%)`, filter:"blur(28px)", zIndex:-1, pointerEvents:"none" }} />

        <div className="relative" style={{ borderRadius:"20px" }}>
          <div style={{ position:"absolute", left:"5px", right:"5px", top:0, bottom:"-3px", borderRadius:"20px", background:dark?"rgba(22,18,52,0.88)":"rgba(235,235,242,0.9)", zIndex:0 }} />
          <div style={{ position:"absolute", left:"9px", right:"9px", top:0, bottom:"-6px", borderRadius:"20px", background:dark?"rgba(18,14,44,0.75)":"rgba(224,224,234,0.85)", zIndex:-1 }} />

          <div ref={cardRef} className={isMobile?slideClass:(flipDir!==null?"cal-flip-out":isAnimating?"cal-flip-in":"")} style={{ borderRadius:"20px", position:"relative", zIndex:2 }} onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
            <div style={{ borderRadius:"20px", overflow:"hidden", background:cardBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${cardBorder}`, boxShadow:dark?"inset 0 1px 0 rgba(255,255,255,0.07),0 0 0 1px rgba(60,50,110,0.4),0 28px 70px rgba(0,0,0,0.65),0 8px 24px rgba(0,0,0,0.4)":"inset 4px 0 10px -4px rgba(0,0,0,0.09),0 24px 60px rgba(0,0,0,0.13),0 6px 20px rgba(0,0,0,0.08)" }}>

              <CalendarHeader accentColor={accentColor} dark={dark} />

              <div className="flex flex-col md:flex-row">
                {/* Hero image */}
                <div className="relative w-full md:w-[44%] flex-shrink-0" style={{ minHeight:"260px", maxHeight:"360px", padding:"14px 0 0 12px", background:"transparent" }}>
                  <div style={{ position:"relative", width:"100%", height:"100%", borderRadius:"14px", overflow:"hidden" }}>
                    <HeroImage currentMonth={displayMonth} accentColor={accentColor} dark={dark} />
                  </div>
                  <div style={{ position:"absolute", top:"10%", right:0, bottom:"10%", width:"1px", background:dark?`linear-gradient(to bottom,transparent,${accentColor}40,transparent)`:"linear-gradient(to bottom,transparent,rgba(0,0,0,0.08),transparent)", zIndex:5 }} />
                </div>

                {/* Right pane */}
                <div className="flex-1 flex flex-col" style={{ padding:"20px 24px 16px 20px", background:dark?`linear-gradient(135deg,rgba(16,14,38,0) 0%,rgba(${parseInt(accentColor.slice(1,3),16)},${parseInt(accentColor.slice(3,5),16)},${parseInt(accentColor.slice(5,7),16)},0.04) 100%)`:"transparent" }} onMouseLeave={handleGridLeave}>
                  <MonthNavigator currentMonth={displayMonth} accentColor={accentColor} dark={dark} onChange={handleMonthChange} />
                  <div style={{ marginTop:"10px" }}>
                    <EnhancedCalendarGrid
                      currentMonth={displayMonth}
                      range={range}
                      hoverDate={hoverDate}
                      accentColor={accentColor}
                      dark={dark}
                      personalEvents={personalEvents}
                      onDayClick={handleDayClick}
                      onDayHover={handleDayHover}
                    />
                  </div>

                  {/* Legend + hint */}
                  <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"10px", alignItems:"center" }}>
                    {[{ dot:"#dc2626",label:"Holiday"},{dot:"#c026d3",label:"Festival"},{dot:"#3b82f6",label:"Global"},{dot:"#22c55e",label:"Awareness"}].map(({ dot,label }) => (
                      <div key={label} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                        <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:dot }} />
                        <span style={{ fontSize:"10px",fontFamily:"'Barlow Condensed',sans-serif",color:dark?"rgba(120,110,170,0.7)":"#aaa",letterSpacing:"0.06em" }}>{label}</span>
                      </div>
                    ))}
                    <div style={{ marginLeft:"auto" }}>
                      <span style={{ fontSize:"10px",fontFamily:"'Barlow Condensed',sans-serif",color:dark?"rgba(100,90,160,0.6)":"#bbb",letterSpacing:"0.05em" }}>TAP DATE TO MANAGE EVENTS</span>
                    </div>
                  </div>

                  {/* Range hint */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"6px" }}>
                    <p style={{ fontSize:"10px",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.06em",color:dark?"rgba(100,90,160,0.7)":"#bbb" }}>
                      {!range.start?"CLICK A DAY TO SELECT":!range.end?"CLICK AN END DATE":"RANGE SELECTED ✓"}
                    </p>
                    {range.start && (
                      <button onClick={()=>{setRange({start:null,end:null});setHoverDate(null);}} style={{ fontSize:"10px",color:dark?"rgba(120,110,170,0.7)":"#ccc",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em",padding:"3px 10px",borderRadius:"20px",border:`1px solid ${dark?"rgba(80,70,130,0.4)":"#e8e8f0"}`,background:dark?"rgba(30,25,60,0.5)":"transparent",cursor:"pointer",transition:"all 0.2s" }} onMouseEnter={e=>{const b=e.currentTarget;b.style.color=accentColor;b.style.borderColor=`${accentColor}50`;b.style.backgroundColor=`${accentColor}14`;}} onMouseLeave={e=>{const b=e.currentTarget;b.style.color=dark?"rgba(120,110,170,0.7)":"#ccc";b.style.borderColor=dark?"rgba(80,70,130,0.4)":"#e8e8f0";b.style.backgroundColor=dark?"rgba(30,25,60,0.5)":"transparent";}}>CLEAR</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider + Notes */}
              <div style={{ margin:"0 24px", height:"1px", background:`linear-gradient(to right,transparent,${accentColor}30,transparent)` }} />
              <div style={{ margin:"0 24px", paddingBottom:"24px", paddingTop:"16px" }}>
                <NotesPanel range={range} accentColor={accentColor} dark={dark} />
              </div>

              <div style={{ position:"absolute",top:0,left:0,bottom:0,width:"3px",borderRadius:"20px 0 0 20px",background:"linear-gradient(to right,rgba(0,0,0,0.07),transparent)",zIndex:10,pointerEvents:"none" }} />
              {!dark&&<div style={{ position:"absolute",top:52,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(255,255,255,0.8) 30%,rgba(255,255,255,0.9) 70%,transparent)",zIndex:3,pointerEvents:"none" }} />}
            </div>
          </div>
        </div>

        {/* Month strip */}
        <div style={{ marginTop:"20px", borderRadius:"20px", overflow:"hidden", background:dark?`linear-gradient(135deg,rgba(20,16,48,0.95) 0%,${accentColor}22 50%,rgba(14,11,35,0.95) 100%)`:`linear-gradient(135deg,rgba(245,243,255,0.98) 0%,${accentColor}14 50%,rgba(238,236,252,0.98) 100%)`, border:`1px solid ${dark?accentColor+"28":accentColor+"18"}`, boxShadow:dark?"0 8px 32px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.06)":"0 4px 20px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.9)" }}>
          <SlidingMonthPlate currentMonth={currentMonth} accentColor={accentColor} dark={dark} onChange={handleMonthChange} />
        </div>
      </div>

      {/* ─── MODALS ─── */}
      {modalState.mode==="detail" && mDate && (
        <DayDetailPanel
          date={mDate} holidays={mHols} publicEvents={mPubs} personalEvents={mPers}
          accentColor={accentColor} dark={dark}
          onAddEvent={()=>setModalState({mode:"add",date:mDate})}
          onEditEvent={ev=>setModalState({mode:"edit",date:mDate,event:ev})}
          onClose={()=>setModalState({mode:null,date:null})}
        />
      )}
      {modalState.mode==="add" && mDate && (
        <EventModal date={mDate} accentColor={accentColor} dark={dark} onSave={handleSaveEvent} onClose={()=>setModalState({mode:null,date:null})} />
      )}
      {modalState.mode==="edit" && mDate && modalState.event && (
        <EventModal date={mDate} event={modalState.event} accentColor={accentColor} dark={dark} onSave={handleSaveEvent} onDelete={handleDeleteEvent} onClose={()=>setModalState({mode:null,date:null})} />
      )}
    </div>
  );
};