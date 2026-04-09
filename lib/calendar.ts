import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isToday,
  addMonths,
  subMonths,
  getDay,
  parseISO,
} from "date-fns";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

export type NoteEntry = {
  id: string;
  text: string;
  rangeStart: string;
  rangeEnd: string | null;
  createdAt: string;
};

export function getCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

export function getDayStatus(
  day: Date,
  currentMonth: Date,
  range: DateRange,
  hoverDate: Date | null
): {
  isCurrentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isHoverRange: boolean;
  isWeekend: boolean;
} {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);
  const isStart = range.start ? isSameDay(day, range.start) : false;
  const isEnd = range.end ? isSameDay(day, range.end) : false;

  let isInRange = false;
  if (range.start && range.end) {
    isInRange =
      isWithinInterval(day, {
        start: range.start < range.end ? range.start : range.end,
        end: range.start < range.end ? range.end : range.start,
      }) &&
      !isStart &&
      !isEnd;
  }

  let isHoverRange = false;
  if (range.start && !range.end && hoverDate) {
    const hoverStart = range.start < hoverDate ? range.start : hoverDate;
    const hoverEnd = range.start < hoverDate ? hoverDate : range.start;
    isHoverRange =
      isWithinInterval(day, { start: hoverStart, end: hoverEnd }) &&
      !isSameDay(day, range.start);
  }

  const dayOfWeek = getDay(day);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return { isCurrentMonth, isToday: today, isStart, isEnd, isInRange, isHoverRange, isWeekend };
}

export function formatMonthYear(date: Date): { month: string; year: string } {
  return {
    month: format(date, "MMMM").toUpperCase(),
    year: format(date, "yyyy"),
  };
}

export function navigateMonth(date: Date, direction: "prev" | "next"): Date {
  return direction === "next" ? addMonths(date, 1) : subMonths(date, 1);
}

export function loadNotes(): NoteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("calendar_notes");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: NoteEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("calendar_notes", JSON.stringify(notes));
}

export function getNotesForRange(notes: NoteEntry[], range: DateRange): NoteEntry[] {
  if (!range.start) return [];
  return notes.filter((note) => {
    const noteStart = parseISO(note.rangeStart);
    return isSameDay(noteStart, range.start!);
  });
}

// Fixed images: Jan = snowy pine forest, Feb = frost/ice, others kept or improved
export const MONTH_IMAGES: Record<number, { url: string; credit: string; palette: string }> = {
  0:  { url: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80", credit: "Snowy Pine Forest",    palette: "#1a6fa8" },
  1:  { url: "https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?w=800&q=80", credit: "Frosty Morning",        palette: "#5b8fd4" },
  2:  { url: "https://images.unsplash.com/photo-1490750967868-88df5691cc8f?w=800&q=80", credit: "Spring Bloom",          palette: "#e91e8c" },
  3:  { url: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80", credit: "Cherry Blossoms",       palette: "#f06292" },
  4:  { url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", credit: "Summer Meadow",         palette: "#2e7d32" },
  5:  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", credit: "Beach Horizon",         palette: "#0097a7" },
  6:  { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", credit: "Mountain Lake",         palette: "#1565c0" },
  7:  { url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80", credit: "Summer Dusk",           palette: "#e65100" },
  8:  { url: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80", credit: "Autumn Forest",         palette: "#bf360c" },
  9:  { url: "https://images.unsplash.com/photo-1445887374063-34abd495852b?w=800&q=80", credit: "Fall Leaves",           palette: "#e65100" },
  10: { url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80", credit: "Foggy November",        palette: "#546e7a" },
  11: { url: "https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?w=800&q=80", credit: "Winter Wonderland",     palette: "#1a237e" },
};