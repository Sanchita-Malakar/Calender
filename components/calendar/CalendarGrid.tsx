"use client";

import React from "react";
import { format } from "date-fns";
import { DayCell } from "./DayCell";
import { getCalendarDays, getDayStatus, DateRange } from "@/lib/calendar";

interface CalendarGridProps {
  currentMonth: Date;
  range: DateRange;
  hoverDate: Date | null;
  accentColor: string;
  dark?: boolean;
  onDayClick: (day: Date) => void;
  onDayHover: (day: Date) => void;
}

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  range,
  hoverDate,
  accentColor,
  dark,
  onDayClick,
  onDayHover,
}) => {
  const days = getCalendarDays(currentMonth);

  return (
    <div className="w-full">
      {/* Week-day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => {
          const isWknd = d === "SAT" || d === "SUN";
          return (
            <div
              key={d}
              className="text-center text-[10px] font-bold tracking-widest py-2"
              style={{
                color: isWknd
                  ? accentColor
                  : dark ? "rgba(140,130,180,0.7)" : "#b0b0c0",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.12em",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Thin accent divider under headers */}
      <div
        className="mb-2 mx-1"
        style={{
          height: "1px",
          background: `linear-gradient(to right, transparent, ${accentColor}40, transparent)`,
        }}
      />

     
      <div
        className="grid grid-cols-7"
        onMouseLeave={() => onDayHover(new Date(0))}
      >
        {days.map((day) => {
          const status = getDayStatus(day, currentMonth, range, hoverDate);
          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              accentColor={accentColor}
              dark={dark}
              onClick={() => status.isCurrentMonth && onDayClick(day)}
              onMouseEnter={() => status.isCurrentMonth && onDayHover(day)}
              {...status}
            />
          );
        })}
      </div>
    </div>
  );
};