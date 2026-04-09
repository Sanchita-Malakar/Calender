# 📅 Interactive Wall Calendar Component

A polished, production-grade interactive wall calendar built with **Next.js 14**, **Tailwind CSS**, and **date-fns**.

## ✨ Features

- **Wall Calendar Aesthetic** — Faithfully reproduces the physical wall calendar look with spiral top decoration, hero image, diagonal shape divider, and blue chevron accents
- **Month-Themed Hero Images** — Each of the 12 months has a unique Unsplash hero photo with a matching accent color palette that cascades throughout the UI
- **Day Range Selector** — Click to set a start date, hover to preview the range, click to set an end date. Clear visual states for start, end, in-range, today, and weekends
- **Integrated Notes Panel** — Write notes tied to a specific date or date range; auto-saved to `localStorage`; recent notes listed below with delete support
- **Month Switcher** — 12 colored swatches at the bottom let you jump to any month and see the theme change instantly
- **Fully Responsive** — Desktop: image left + calendar right. Mobile: stacked vertically. Both are fully usable
- **Micro-interactions** — Day cell hover scale + color, button hover lifts, save confirmation, smooth image fade-in, range strip animation

## 📁 Project Structure

```
/app
  layout.tsx         # Google Fonts (Barlow Condensed + Lora)
  page.tsx           # Entry page
  globals.css

/components/calendar
  Calendar.tsx       # Main orchestrator + spiral + theme swatches
  CalendarGrid.tsx   # 7-col grid with weekday headers
  DayCell.tsx        # Single day cell with all visual states
  HeroImage.tsx      # Photo + gradient + diagonal shape + month label
  MonthNavigator.tsx # Prev/Next chevrons + month label
  NotesPanel.tsx     # Textarea + save + recent notes list

/lib
  calendar.ts        # All date logic (date-fns), note storage, image map
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | Framework |
| Tailwind CSS | Utility styling |
| date-fns v3 | Date math |
| Google Fonts | Barlow Condensed + Lora |
| Unsplash | Month hero images |
| localStorage | Note persistence |

## 🎨 Design Decisions

- **Barlow Condensed** for all UI labels, headings — tight, bold, sporty
- **Lora** for notes text — warm, readable serif
- **Per-month accent color** — the entire UI (weekend numbers, range highlights, save button, badge) shifts with the month's palette
- **Diagonal clip-path** on hero image bottom edge — exact match to the reference image
- **Range strip uses opacity-tinted accent** — subtle but clear, not garish
- Today marker is a small dot under the number when not selected
