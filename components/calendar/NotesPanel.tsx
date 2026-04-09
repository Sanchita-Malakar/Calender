"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { DateRange, NoteEntry, loadNotes, saveNotes } from "@/lib/calendar";

interface NotesPanelProps {
  range: DateRange;
  accentColor: string;
  dark?: boolean;
}


function blendHex(hex1: string, hex2: string, t: number): string {
  const p = (h: string) => {
    const c = h.replace("#", "").padEnd(6, "0");
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
  };
  const [r1,g1,b1] = p(hex1);
  const [r2,g2,b2] = p(hex2);
  return `#${[r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t]
    .map(v => Math.round(v).toString(16).padStart(2,"0"))
    .join("")}`;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ range, accentColor, dark }) => {
  const [notes, setNotes]       = useState<NoteEntry[]>([]);
  const [draft, setDraft]       = useState("");
  const [dayDraft, setDayDraft] = useState("");
  const [saved, setSaved]       = useState(false);
  const [daySaved, setDaySaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"range" | "day">("range");
  const textRef    = useRef<HTMLTextAreaElement>(null);
  const dayTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setNotes(loadNotes()); }, []);

  useEffect(() => {
    if (!range.start) return;
    const existing = notes.find(n => isSameDay(parseISO(n.rangeStart), range.start!));
    setDraft(existing?.text ?? "");
    setSaved(false);
    const dayKey  = `day_${format(range.start, "yyyy-MM-dd")}`;
    const dayNote = notes.find(n => n.id === dayKey);
    setDayDraft(dayNote?.text ?? "");
    setDaySaved(false);
  }, [range.start?.toDateString()]);

  const handleSave = () => {
    if (!range.start) return;
    const id = range.start.toISOString();
    const newNote: NoteEntry = {
      id, text: draft,
      rangeStart: range.start.toISOString(),
      rangeEnd:   range.end ? range.end.toISOString() : null,
      createdAt:  new Date().toISOString(),
    };
    const updated = notes.filter(n => n.id !== id).concat(newNote);
    setNotes(updated);
    saveNotes(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleDaySave = () => {
    if (!range.start) return;
    const dayKey  = `day_${format(range.start, "yyyy-MM-dd")}`;
    const newNote: NoteEntry = {
      id: dayKey, text: dayDraft,
      rangeStart: range.start.toISOString(),
      rangeEnd:   null,
      createdAt:  new Date().toISOString(),
    };
    const updated = notes.filter(n => n.id !== dayKey).concat(newNote);
    setNotes(updated);
    saveNotes(updated);
    setDaySaved(true);
    setTimeout(() => setDaySaved(false), 2200);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (range.start && id === range.start.toISOString()) setDraft("");
  };

  const rangeLabel = range.start
    ? range.end
      ? `${format(range.start, "MMM d")} → ${format(range.end, "MMM d")}`
      : format(range.start, "MMMM d, yyyy")
    : null;

  const dayLabel    = range.start ? format(range.start, "EEEE, MMM d") : null;
  const recentNotes    = notes.filter(n => !n.id.startsWith("day_")).slice(-4).reverse();
  const recentDayNotes = notes.filter(n =>  n.id.startsWith("day_")).slice(-4).reverse();

  
  const glassTextarea: React.CSSProperties = {
    backgroundColor: dark ? "rgba(28,24,55,0.85)" : "rgba(247,247,252,0.85)",
    border:          `1.5px solid ${dark ? "rgba(70,60,120,0.35)" : "#eaeaf4"}`,
    color:           dark ? "var(--text-primary,#e0e0f4)" : "#2a2a3e",
    fontFamily:      "'Lora', serif",
    fontSize:        "13px",
    backdropFilter:  "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius:    "12px",
    padding:         "12px",
    width:           "100%",
    resize:          "none" as const,
    outline:         "none",
    transition:      "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
    
    cursor:          "auto",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex:            1,
    padding:         "7px 0",
    fontSize:        "10px",
    fontFamily:      "'Barlow Condensed', sans-serif",
    letterSpacing:   "0.15em",
    fontWeight:      700,
    border:          "none",
    borderRadius:    "10px",
    cursor:          "pointer",
    transition:      "all 0.2s ease",
    backgroundColor: active ? accentColor : "transparent",
    color:           active ? "#fff" : dark ? "rgba(160,150,210,0.7)" : "#a0a0b8",
    boxShadow:       active ? `0 4px 14px ${accentColor}40` : "none",
  });

 
  const daySaveBtnBg = `linear-gradient(135deg, ${accentColor} 0%, ${blendHex(accentColor, "#ff88cc", 0.3)} 100%)`;

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* ── Tabs ── */}
      <div style={{
        display:         "flex",
        gap:             "4px",
        padding:         "4px",
        borderRadius:    "14px",
        marginBottom:    "14px",
        backgroundColor: dark ? "rgba(30,25,60,0.7)" : "rgba(240,240,250,0.8)",
        backdropFilter:  "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border:          `1px solid ${dark ? "rgba(70,60,120,0.35)" : "rgba(220,220,240,0.6)"}`,
      }}>
        <button style={tabStyle(activeTab === "range")} onClick={() => setActiveTab("range")}>
          RANGE NOTES
        </button>
        <button style={tabStyle(activeTab === "day")} onClick={() => setActiveTab("day")}>
          DAY NOTE
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          RANGE NOTES TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "range" && (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M9.5 1.5L12.5 4.5L5 12H2V9L9.5 1.5Z"
                  stroke={accentColor} strokeWidth="1.4" strokeLinejoin="round"
                  fill={`${accentColor}18`}
                />
              </svg>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
                color:  dark ? "rgba(140,130,190,0.8)" : "#a0a0b8",
                fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase",
              }}>
                Range Notes
              </span>
            </div>
            {rangeLabel && (
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                backgroundColor: `${accentColor}18`, color: accentColor,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
                letterSpacing: "0.05em", border: `1px solid ${accentColor}30`,
                backdropFilter: "blur(6px)",
              }}>
                {rangeLabel}
              </span>
            )}
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textRef}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
              placeholder={range.start ? "Write a note for this date range…" : "Select a date to add notes…"}
              disabled={!range.start}
              rows={3}
              style={{
                ...glassTextarea,
                
                border: `1.5px solid ${range.start ? `${accentColor}35` : dark ? "rgba(70,60,120,0.35)" : "#eaeaf4"}`,
                
                opacity: range.start ? 1 : 0.55,
              }}
              onFocus={(e) => {
                e.target.style.borderColor      = `${accentColor}60`;
                e.target.style.boxShadow        = `0 0 0 3px ${accentColor}14`;
                e.target.style.backgroundColor  = dark ? "rgba(35,30,65,0.95)" : "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor     = `${accentColor}35`;
                e.target.style.boxShadow       = "none";
                e.target.style.backgroundColor = dark ? "rgba(28,24,55,0.85)" : "rgba(247,247,252,0.85)";
              }}
            />
          </div>

          {range.start && (
            <div className="flex items-center justify-between mt-2 mb-3">
              <span style={{
                fontSize: "11px",
                color: saved ? "#22c55e" : "transparent",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.06em",
                transition: "color 0.3s ease",
                
                visibility: saved ? "visible" : "hidden",
              }}>
                ✓ Saved
              </span>
              <button
                onClick={handleSave}
                style={{
                  fontSize: "11px", padding: "5px 16px", borderRadius: "20px",
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em",
                  fontWeight: 700, backgroundColor: accentColor, color: "#fff",
                  border: "none", cursor: "pointer", transition: "all 0.2s ease",
                  backdropFilter: "blur(6px)",
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform  = "translateY(-1px)";
                  b.style.boxShadow  = `0 6px 18px ${accentColor}50`;
                  b.style.filter     = "brightness(1.08)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform  = "none";
                  b.style.boxShadow  = "none";
                  b.style.filter     = "none";
                }}
              >
                SAVE NOTE
              </button>
            </div>
          )}

          <div style={{
            height: "1px",
            background: `linear-gradient(to right, ${accentColor}22, ${accentColor}08, transparent)`,
            marginBottom: "14px",
            marginTop: range.start ? "0" : "10px",
          }} />

          {recentNotes.length === 0 ? (
            <div className="space-y-[13px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  height: "1px",
                  backgroundColor: i === 0
                    ? `${accentColor}25`
                    : dark ? "rgba(60,50,100,0.4)" : "#e8e8f0",
                  marginLeft: i === 0 ? "0" : "4px",
                }} />
              ))}
              <p style={{
                fontSize: "11px",
                color: dark ? "rgba(100,90,150,0.7)" : "#c8c8d8",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.1em", textAlign: "center", marginTop: "6px",
              }}>
                NO NOTES YET
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "120px" }}>
              {recentNotes.map(note => (
                <div
                  key={note.id}
                  className="group flex items-start justify-between gap-2 pb-2"
                  style={{ borderBottom: `1px solid ${dark ? "rgba(60,50,100,0.4)" : "#eeeef8"}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{
                      fontSize: "11px", fontWeight: 700, color: accentColor,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "0.06em", marginBottom: "1px",
                    }}>
                      {format(parseISO(note.rangeStart), "MMM d")}
                      {note.rangeEnd && ` → ${format(parseISO(note.rangeEnd), "MMM d")}`}
                    </p>
                    <p className="truncate" style={{
                      fontSize: "12px",
                      color: dark ? "rgba(140,130,190,0.7)" : "#7070a0",
                    }}>
                      {note.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    style={{ color: "#cc4444", flexShrink: 0, marginTop: "2px" }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          DAY NOTE TAB
      ══════════════════════════════════════════════════════ */}
      {activeTab === "day" && (
        <>
          {/* Day note header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <rect x="2" y="2" width="10" height="10" rx="2"
                  stroke={accentColor} strokeWidth="1.4" fill={`${accentColor}18`} />
                <line x1="5" y1="5.5" x2="9"   y2="5.5" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
                <line x1="5" y1="8"   x2="7.5" y2="8"   stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
                color: dark ? "rgba(140,130,190,0.8)" : "#a0a0b8",
                fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase",
              }}>
                Day Note
              </span>
            </div>
            {dayLabel && (
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                backgroundColor: `${accentColor}18`, color: accentColor,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
                letterSpacing: "0.05em", border: `1px solid ${accentColor}30`,
              }}>
                {dayLabel}
              </span>
            )}
          </div>

          {/* Day note glass panel */}
          <div style={{
            background:          dark ? "rgba(25,22,50,0.75)" : "rgba(252,252,255,0.75)",
            backdropFilter:      "blur(12px)",
            WebkitBackdropFilter:"blur(12px)",
            border:              `1px solid ${dark ? `${accentColor}25` : `${accentColor}20`}`,
            borderRadius:        "16px",
            padding:             "14px",
            marginBottom:        "12px",
            boxShadow:           `inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px ${accentColor}10`,
          }}>
            {/* Decorative top accent line */}
            <div style={{
              height: "2px", borderRadius: "2px",
              background: `linear-gradient(to right, ${accentColor}80, ${accentColor}20, transparent)`,
              marginBottom: "12px",
            }} />

            <textarea
              ref={dayTextRef}
              value={dayDraft}
              onChange={(e) => { setDayDraft(e.target.value); setDaySaved(false); }}
              placeholder={range.start
                ? `Jot a quick note for ${format(range.start, "MMM d")}…`
                : "Click a date first…"}
              disabled={!range.start}
              rows={4}
              style={{
                ...glassTextarea,
                backgroundColor: "transparent",
                border:          "none",
                padding:         "0",
                borderRadius:    "0",
                fontSize:        "13.5px",
                lineHeight:      "1.65",
                letterSpacing:   "0.01em",
                opacity:         range.start ? 1 : 0.55,
              }}
              onFocus={(e) => { e.target.style.outline = "none"; }}
              onBlur={(e)  => { e.target.style.outline = "none"; }}
            />

            {/* Word count */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <span style={{
                fontSize: "10px",
                color: dark ? "rgba(100,90,150,0.6)" : "#c0c0d0",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.1em",
              }}>
                {dayDraft.trim() ? `${dayDraft.trim().split(/\s+/).length} words` : ""}
              </span>
            </div>
          </div>

          {range.start && (
            <div className="flex items-center justify-between">
              <span style={{
                fontSize: "11px",
                color: daySaved ? "#22c55e" : "transparent",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.06em",
                transition: "color 0.3s ease",
                
                visibility: daySaved ? "visible" : "hidden",
              }}>
                ✓ Saved
              </span>
              <button
                onClick={handleDaySave}
                style={{
                  fontSize: "11px", padding: "5px 16px", borderRadius: "20px",
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em",
                  fontWeight: 700,
                  
                  background: daySaveBtnBg,
                  color: "#fff", border: "none", cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: `0 4px 14px ${accentColor}30`,
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform = "translateY(-1px)";
                  b.style.boxShadow = `0 8px 22px ${accentColor}55`;
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform = "none";
                  b.style.boxShadow = `0 4px 14px ${accentColor}30`;
                }}
              >
                SAVE DAY NOTE
              </button>
            </div>
          )}

          <div style={{
            height: "1px",
            background: `linear-gradient(to right, ${accentColor}22, ${accentColor}08, transparent)`,
            margin: "14px 0",
          }} />

          {/* Recent day notes */}
          {recentDayNotes.length === 0 ? (
            <p style={{
              fontSize: "11px",
              color: dark ? "rgba(100,90,150,0.7)" : "#c8c8d8",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.1em", textAlign: "center",
            }}>
              NO DAY NOTES YET
            </p>
          ) : (
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "100px" }}>
              {recentDayNotes.map(note => (
                <div
                  key={note.id}
                  className="group flex items-start justify-between gap-2 pb-2"
                  style={{ borderBottom: `1px solid ${dark ? "rgba(60,50,100,0.4)" : "#eeeef8"}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{
                      fontSize: "11px", fontWeight: 700, color: accentColor,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "0.06em", marginBottom: "1px",
                    }}>
                      {format(parseISO(note.rangeStart), "EEE, MMM d")}
                    </p>
                    <p className="truncate" style={{
                      fontSize: "12px",
                      color: dark ? "rgba(140,130,190,0.7)" : "#7070a0",
                    }}>
                      {note.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    style={{ color: "#cc4444", flexShrink: 0, marginTop: "2px" }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};