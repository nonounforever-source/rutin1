import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, subMonths, addMonths } from "date-fns";
import { ar } from "date-fns/locale";

const WEEKDAYS = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];

export function CalendarPage() {
  const { state, getHabitStreak } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty days (Sunday = 0)
  const startPad = getDay(monthStart);
  const emptyDays = Array(startPad).fill(null);

  const getCompletionRatio = (date: Date) => {
    const str = date.toISOString().split("T")[0];
    if (state.habits.length === 0) return 0;
    const done = state.habits.filter((h) => h.completions.includes(str)).length;
    return done / state.habits.length;
  };

  const selectedStr = selectedDay?.toISOString().split("T")[0];
  const selectedHabits = state.habits.map((h) => ({
    ...h,
    completed: selectedStr ? h.completions.includes(selectedStr) : false,
  }));
  const selectedJournal = state.journal.filter((j) => j.date === selectedStr);

  return (
    <div className="flex flex-col gap-5 px-4 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="ios-large-title">تقويم</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">‹</button>
          <span className="text-sm font-bold text-foreground min-w-[70px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: ar })}
          </span>
          <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">›</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="ios-card p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const ratio = getCompletionRatio(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className="flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all active:scale-90"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : today
                      ? "border-2 border-primary text-primary"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {/* Completion dots */}
                {state.habits.length > 0 && ratio > 0 && (
                  <div className="flex gap-0.5">
                    {ratio >= 1 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    ) : ratio >= 0.5 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span>مكتمل</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span>نصف</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span>بداية</span></div>
      </div>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-bold text-muted-foreground px-1">
              {format(selectedDay, "EEEE، d MMMM", { locale: ar })}
            </p>

            {state.habits.length === 0 ? (
              <div className="ios-card p-4 text-center text-muted-foreground text-sm">
                أضف عادات لتتبعها في التقويم
              </div>
            ) : (
              <div className="ios-card divide-y divide-border/50">
                {selectedHabits.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-3">
                    <span className="text-2xl">{h.icon}</span>
                    <span className={`flex-1 font-medium ${h.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {h.name}
                    </span>
                    <span className={`text-lg ${h.completed ? "text-green-500" : "text-muted-foreground/30"}`}>
                      {h.completed ? "✓" : "○"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedJournal.length > 0 && (
              <div className="ios-card p-4">
                <p className="text-xs font-bold text-muted-foreground mb-2">📔 المذكرة</p>
                <p className="text-foreground leading-relaxed line-clamp-3">{selectedJournal[0].content}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
