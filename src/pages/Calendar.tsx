import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, 
  addWeeks, subWeeks, addDays, getHours, getMinutes, setHours, setMinutes,
  differenceInMinutes, parseISO, isWithinInterval
} from "date-fns";
import { arSA } from "date-fns/locale";
import { useApp, CalendarEvent } from "@/lib/store";
import { 
  ChevronRight, ChevronLeft, Calendar as CalendarIcon, 
  Clock, MapPin, Plus, X, MoreHorizontal, AlignLeft,
  Check, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, Tooltip } from "recharts";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

// --- Constants ---
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/30" },
  { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/30" },
  { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/30" },
  { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/30" },
  { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30" },
  { bg: "bg-slate-100 dark:bg-slate-500/20", text: "text-slate-700 dark:text-slate-400", border: "border-slate-200 dark:border-slate-500/30" },
];

// --- Main Component ---
export function CalendarPage() {
  // --- App State & Context ---
  const { events, addEvent, updateEvent, deleteEvent } = useApp();

  // --- Local UI State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  
  useLockBodyScroll(isEventModalOpen);

  // Navigation
  const next = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, -1));
  };

  const today = () => setCurrentDate(new Date());

  // Weekly Density Data
  const weeklyDensity = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    
    return days.map(day => {
      const count = events.filter(e => isSameDay(parseISO(e.startDate), day)).length;
      return {
        name: format(day, "EEE", { locale: arSA }),
        count,
        isToday: isToday(day)
      };
    });
  }, [currentDate, events]);

  // Event Handling
  const handleCreateEvent = (start: Date, end: Date) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsEventModalOpen(true);
  };

  const handleUpdateEventTime = (id: string, newStart: Date, newEnd: Date) => {
    updateEvent(id, { 
      startDate: newStart.toISOString(), 
      endDate: newEnd.toISOString() 
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem-env(safe-area-inset-bottom))] bg-background text-foreground overflow-hidden direction-rtl">
      {/* Sidebar (Desktop only) */}
      <div className="hidden lg:flex w-64 flex-col border-l border-border bg-card/50 p-4 gap-6">
        <div className="flex items-center gap-2 font-bold text-xl px-2">
          <CalendarIcon className="text-primary" />
          <span>التقويم</span>
        </div>
        
        <MiniCalendar 
          currentDate={currentDate} 
          onDateSelect={(date) => {
            setCurrentDate(date);
            if (view === "month") setView("day");
          }} 
        />

        <div className="px-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">كثافة الأحداث</h3>
          </div>
          <div className="h-24 w-full bg-secondary/20 rounded-xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyDensity}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/90 backdrop-blur-md border border-border p-2 rounded-xl shadow-xl">
                          <p className="text-[10px] font-bold text-foreground">{payload[0].payload.name}</p>
                          <p className="text-xs font-black text-primary">{payload[0].value} أحداث</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weeklyDensity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? "var(--primary)" : "var(--primary-foreground)"} 
                      opacity={entry.isToday ? 1 : 0.3}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">الأحداث القادمة</h3>
          <div className="space-y-2">
            {events
              .filter(e => new Date(e.startDate) >= new Date())
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map(e => {
                let colorStyle = { bg: 'bg-primary' };
                try {
                  colorStyle = e.color ? JSON.parse(e.color) : { bg: 'bg-primary' };
                } catch (err) {
                  // ignore
                }
                return (
                <div 
                  key={e.id} 
                  onClick={() => handleEditEvent(e)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer text-sm"
                >
                  <div className={`w-2 h-2 rounded-full ${colorStyle.bg}`} />
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground/80">
                      {format(new Date(e.startDate), "d MMM • h:mm a", { locale: arSA })}
                    </div>
                  </div>
                </div>
              )})}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex flex-col p-4 gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
              <button onClick={prev} className="p-1.5 hover:bg-card rounded-lg transition-all active:scale-90"><ChevronRight size={18} /></button>
              <button onClick={next} className="p-1.5 hover:bg-card rounded-lg transition-all active:scale-90"><ChevronLeft size={18} /></button>
            </div>
            <h2 className="text-lg font-black tracking-tight text-center">
              {view === "day" 
                ? format(currentDate, "d MMMM yyyy", { locale: arSA })
                : format(currentDate, "MMMM yyyy", { locale: arSA })}
            </h2>
            <button onClick={today} className="text-xs font-black text-primary hover:bg-primary/10 px-3 py-2 rounded-full transition-all active:scale-[0.97]">
              اليوم
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex bg-secondary/50 p-1 rounded-2xl text-xs font-black uppercase tracking-widest flex-1 justify-center">
              <button 
                onClick={() => setView("month")}
                className={cn("px-4 py-1.5 rounded-xl transition-all flex-1", view === "month" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                شهر
              </button>
              <button 
                onClick={() => setView("day")}
                className={cn("px-4 py-1.5 rounded-xl transition-all flex-1", view === "day" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                يوم
              </button>
            </div>
            <button 
              onClick={() => handleCreateEvent(new Date(), addDays(new Date(), 0))}
              className="ios-button-primary h-10 px-4 rounded-full text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 shrink-0"
            >
              <Plus size={20} />
              <span>حدث جديد</span>
            </button>
          </div>
        </header>

        {/* Views */}
        <div className="flex-1 overflow-hidden relative">
          {view === "day" ? (
            <DayView 
              currentDate={currentDate} 
              events={events} 
              onEventClick={handleEditEvent}
              onSlotClick={handleCreateEvent}
              onEventUpdate={handleUpdateEventTime}
              onDayClick={(day: Date) => {
                setCurrentDate(day);
                setView("day");
              }}
            />
          ) : (
            <MonthView 
              currentDate={currentDate} 
              events={events} 
              onEventClick={handleEditEvent}
              onSlotClick={handleCreateEvent}
              onDayClick={(day: Date) => {
                setCurrentDate(day);
                setView("day");
              }}
            />
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Portal>
      <AnimatePresence>
        {isEventModalOpen && (
          <EventModal 
            isOpen={isEventModalOpen}
            onClose={() => setIsEventModalOpen(false)}
            event={selectedEvent}
            initialSlot={selectedSlot}
            onSave={(e) => {
              if (selectedEvent) updateEvent(selectedEvent.id, e);
              else addEvent(e);
              setIsEventModalOpen(false);
            }}
            onDelete={(id) => {
              deleteEvent(id);
              setIsEventModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}

// --- Sub Components ---

function MiniCalendar({ currentDate, onDateSelect }: { currentDate: Date, onDateSelect: (d: Date) => void }) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startDayIndex = start.getDay(); // 0 = Sunday

  return (
    <div className="p-2">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map(d => (
          <span key={d} className="text-xs text-muted-foreground/80 font-medium">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "h-7 w-7 rounded-full text-xs font-number flex items-center justify-center transition-colors",
              isSameDay(day, currentDate) ? "bg-primary text-primary-foreground font-bold" : "hover:bg-secondary",
              isToday(day) && !isSameDay(day, currentDate) && "text-primary font-bold"
            )}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Helper for Overlap Layout ---
function calculateEventLayout(events: CalendarEvent[]) {
  const sorted = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const columns: CalendarEvent[][] = [];

  sorted.forEach(event => {
    let placed = false;
    for (const column of columns) {
      const lastEventInColumn = column[column.length - 1];
      if (new Date(event.startDate).getTime() >= new Date(lastEventInColumn.endDate).getTime()) {
        column.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  });

  const layout: Record<string, { left: number; width: number }> = {};
  columns.forEach((column, colIndex) => {
    column.forEach(event => {
      layout[event.id] = {
        left: (colIndex / columns.length) * 100,
        width: 100 / columns.length
      };
    });
  });

  return layout;
}

function DayView({ currentDate, events, onEventClick, onSlotClick, onEventUpdate, onDayClick }: any) {
  const start = currentDate;
    
  const days = [start];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag & Drop State
  const [draggedEvent, setDraggedEvent] = useState<{ id: string, offsetMinutes: number, originalStart: Date, duration: number } | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60; 
    }
  }, []);

  // Handlers for Drag & Drop
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const offsetMinutes = Math.floor(clickY); // 1px = 1 min roughly
    
    setDraggedEvent({
      id: event.id,
      offsetMinutes,
      originalStart: parseISO(event.startDate),
      duration: differenceInMinutes(parseISO(event.endDate), parseISO(event.startDate))
    });
    
    e.dataTransfer.effectAllowed = 'move';
    // Create a ghost image or hide the default one if preferred
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    
    // Calculate new time
    // dropY is pixels from top of container. 1px = 1 min.
    // Adjust for where the user clicked within the event (offsetMinutes)
    const newStartMinutes = Math.max(0, Math.floor(dropY - draggedEvent.offsetMinutes));
    
    // Snap to 15 mins
    const snappedMinutes = Math.round(newStartMinutes / 15) * 15;
    
    const newStart = setMinutes(setHours(day, 0), snappedMinutes);
    const newEnd = addDays(newStart, 0); // Clone
    newEnd.setMinutes(newStart.getMinutes() + draggedEvent.duration);

    onEventUpdate(draggedEvent.id, newStart, newEnd);
    setDraggedEvent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="flex flex-col h-full select-none bg-background">
      {/* Week Header & All Day */}
      <div className="flex border-b border-border/60 pr-14 bg-card/30 backdrop-blur-sm sticky top-0 z-30">
        {days.map(day => {
          const dayEvents = events.filter((e: CalendarEvent) => 
            isSameDay(parseISO(e.startDate), day) && e.allDay
          );
          
          return (
            <div key={day.toISOString()} className={cn(
              "flex-1 py-3 text-center border-l border-border/60 last:border-l-0 min-h-[90px] transition-colors",
              isToday(day) ? "bg-primary/5" : "hover:bg-secondary/20"
            )}>
              <div className={cn("text-[11px] font-bold uppercase tracking-wider mb-1.5", isToday(day) ? "text-primary" : "text-muted-foreground/80")}>
                {format(day, "EEEE", { locale: arSA })}
              </div>
              <button 
                onClick={() => onDayClick(day)}
                className={cn(
                "text-2xl font-black font-number w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 transition-all hover:bg-secondary",
                isToday(day) ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90" : "text-foreground"
              )}>
                {format(day, "d")}
              </button>
              
              {/* All Day Events */}
              <div className="space-y-1.5 px-1.5">
                {dayEvents.map((e: CalendarEvent) => {
                  let colorStyle;
                  try {
                    colorStyle = e.color ? JSON.parse(e.color) : COLORS[0];
                  } catch (err) {
                    colorStyle = COLORS[0];
                  }
                  if (!colorStyle || typeof colorStyle !== 'object') colorStyle = COLORS[0];
                  return (
                    <div 
                      key={e.id}
                      onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md truncate font-semibold border cursor-pointer text-right shadow-sm",
                        colorStyle.bg, colorStyle.text, colorStyle.border
                      )}
                    >
                      {e.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth">
        <CurrentTimeIndicator start={start} />

        <div className="flex relative min-h-[1440px]">
          {/* Time Labels */}
          <div className="w-14 flex-shrink-0 border-l border-border/60 bg-background/95 backdrop-blur sticky right-0 z-20">
            {HOURS.map(hour => (
              <div key={hour} className="h-[60px] text-[10px] font-medium text-muted-foreground/80 text-center relative -top-2.5">
                {format(setHours(new Date(), hour), "h a")}
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          {days.map(day => {
            const dayEvents = events.filter((e: CalendarEvent) => 
              isSameDay(parseISO(e.startDate), day) && !e.allDay
            );
            const layout = calculateEventLayout(dayEvents);

            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "flex-1 border-l border-border/60 relative group",
                  isToday(day) && "bg-primary/[0.02]"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                {HOURS.map(hour => (
                  <div 
                    key={hour} 
                    className="h-[60px] border-b border-border/30 group-hover:bg-secondary/10 transition-colors cursor-pointer"
                    onClick={() => {
                      const s = setHours(setMinutes(day, 0), hour);
                      const e = setHours(setMinutes(day, 0), hour + 1);
                      onSlotClick(s, e);
                    }}
                  />
                ))}

                {dayEvents.map((e: CalendarEvent) => {
                  const start = parseISO(e.startDate);
                  const end = parseISO(e.endDate);
                  const top = getHours(start) * 60 + getMinutes(start);
                  const height = Math.max(differenceInMinutes(end, start), 30);
                  let colorStyle;
                  try {
                    colorStyle = e.color ? JSON.parse(e.color) : COLORS[0];
                  } catch (err) {
                    colorStyle = COLORS[0];
                  }
                  if (!colorStyle || typeof colorStyle !== 'object') colorStyle = COLORS[0];
                  const { left, width } = layout[e.id] || { left: 0, width: 100 };

                  return (
                    <motion.div
                      key={e.id}
                      draggable
                      onDragStart={(ev) => handleDragStart(ev as any, e)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                      className={cn(
                        "absolute rounded-xl p-2.5 text-xs cursor-pointer overflow-hidden hover:brightness-95 active:scale-[0.98] transition-all z-10 shadow-sm group/event border-r-4",
                        colorStyle.bg, colorStyle.text, colorStyle.border
                      )}
                      style={{ 
                        top: `${top + 1}px`, 
                        height: `${height - 2}px`,
                        left: `${left}%`,
                        width: `${width}%`
                      }}
                    >
                      <div className="font-bold truncate leading-tight mb-0.5">{e.title}</div>
                      <div className="opacity-90 truncate text-[10px] font-medium">
                        {format(start, "h:mm")} - {format(end, "h:mm a")}
                      </div>
                      
                      {/* Resize Handle */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover/event:opacity-100 bg-gradient-to-t from-black/10 to-transparent transition-opacity"
                        onMouseDown={(ev) => {
                          ev.stopPropagation();
                          // Implement resize logic here if needed, or stick to drag for now
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthView({ currentDate, events, onEventClick, onSlotClick, onDayClick }: any) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startDayIndex = start.getDay(); // 0 = Sunday

  // Fill empty slots at start
  const blanks = Array.from({ length: startDayIndex });

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-2 text-center text-sm font-medium text-muted-foreground/80 border-l border-border last:border-l-0">
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="border-b border-l border-border/50 bg-secondary/5" />
        ))}
        {days.map(day => {
          const dayEvents = events.filter((e: CalendarEvent) => isSameDay(parseISO(e.startDate), day));
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "border-b border-l border-border/50 p-1 relative hover:bg-secondary/10 transition-colors cursor-pointer min-h-[100px]",
                isToday(day) && "bg-primary/5"
              )}
              onClick={() => onSlotClick(day, day)}
            >
              <div className="flex justify-center mb-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                  className={cn(
                  "text-xs font-medium font-number w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-secondary",
                  isToday(day) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground/80"
                )}>
                  {format(day, "d")}
                </button>
              </div>
              <div className="space-y-1">
                {/* Mobile Events (Dots) */}
                <div className="flex flex-wrap justify-center gap-0.5 px-1">
                  {dayEvents.slice(0, 4).map((e: CalendarEvent) => {
                     let colorStyle;
                     try {
                       colorStyle = e.color ? JSON.parse(e.color) : COLORS[0];
                     } catch (err) {
                       colorStyle = COLORS[0];
                     }
                     if (!colorStyle || typeof colorStyle !== 'object') colorStyle = COLORS[0];
                     return (
                      <div 
                        key={e.id}
                        className={cn("w-1.5 h-1.5 rounded-full", colorStyle.bg.replace('/20', ''))}
                      />
                    );
                  })}
                  {dayEvents.length > 4 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function CurrentTimeIndicator({ start }: { start: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!isSameDay(now, start)) return null;

  const minutes = getHours(now) * 60 + getMinutes(now);

  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${minutes}px` }}
    >
      <div className="w-14 text-[10px] font-bold text-red-500 text-center bg-background pr-1">
        {format(now, "h:mm")}
      </div>
      <div className="flex-1 relative">
         <div className="absolute h-[1px] w-full bg-red-500/50" />
         <div 
           className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -mt-[5px] shadow-[0_0_8px_rgba(239,68,68,0.6)] right-0"
           style={{ transform: 'translateX(50%)' }} // RTL adjustment
         >
           <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
         </div>
      </div>
    </div>
  );
}

import { hapticFeedback } from "@/lib/utils";

function EventModal({ isOpen, onClose, event, initialSlot, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: initialSlot?.start ? format(initialSlot.start, "yyyy-MM-dd'T'HH:mm") : "",
    endDate: initialSlot?.end ? format(initialSlot.end, "yyyy-MM-dd'T'HH:mm") : "",
    color: JSON.stringify(COLORS[0]),
    allDay: false,
    reminder: "none"
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color || JSON.stringify(COLORS[0]),
        allDay: event.allDay || false,
        reminder: event.reminder || "none"
      });
    }
  }, [event]);

  const handleSave = () => {
    hapticFeedback("success");
    onSave(formData);
  };

  const handleDelete = () => {
    hapticFeedback("heavy");
    onDelete(event.id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-secondary/30 backdrop-blur-xl w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 flex flex-col relative z-10 max-h-[90dvh] overflow-y-auto overscroll-contain"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
        </div>
        
        <div className="p-6 pt-2 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <button onClick={onClose} className="text-primary font-semibold text-lg">إلغاء</button>
            <h3 className="font-bold text-xl">{event ? "تعديل الحدث" : "حدث جديد"}</h3>
            <button 
              onClick={handleSave}
              disabled={!formData.title}
              className="text-primary font-semibold text-lg disabled:opacity-50"
            >
              {event ? "حفظ" : "إضافة"}
            </button>
          </div>
          
          {/* iOS Grouped Form */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
              <div className="flex items-center px-4 py-3">
                <input
                  autoFocus
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="العنوان"
                  className="flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden border border-border/50 divide-y divide-border/40">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-foreground">طوال اليوم</span>
                <button 
                  onClick={() => {
                    hapticFeedback("light");
                    setFormData({ ...formData, allDay: !formData.allDay });
                  }}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    formData.allDay ? "bg-emerald-500" : "bg-secondary"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                    formData.allDay ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              {!formData.allDay ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-semibold text-foreground">يبدأ</span>
                    <input 
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-secondary/50 border border-border/50 rounded-lg px-2 py-1 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-semibold text-foreground">ينتهي</span>
                    <input 
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-secondary/50 border border-border/50 rounded-lg px-2 py-1 outline-none font-medium text-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold text-foreground">التاريخ</span>
                  <input 
                    type="date"
                    value={formData.startDate.split('T')[0]}
                    onChange={e => {
                        const date = e.target.value;
                        setFormData({ 
                          ...formData, 
                          startDate: `${date}T00:00`,
                          endDate: `${date}T23:59`
                        });
                    }}
                    className="bg-secondary/50 border border-border/50 rounded-lg px-2 py-1 outline-none font-medium text-sm"
                  />
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl overflow-hidden border border-border/50 divide-y divide-border/40">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-foreground">التنبيه</span>
                <select 
                  value={formData.reminder}
                  onChange={e => setFormData({ ...formData, reminder: e.target.value })}
                  className="bg-transparent text-muted-foreground/80 outline-none text-sm font-medium cursor-pointer appearance-none text-left"
                  dir="ltr"
                >
                  <option value="none" className="bg-background text-foreground">بدون</option>
                  <option value="5m" className="bg-background text-foreground">قبل 5 دقائق</option>
                  <option value="10m" className="bg-background text-foreground">قبل 10 دقائق</option>
                  <option value="30m" className="bg-background text-foreground">قبل 30 دقيقة</option>
                  <option value="1h" className="bg-background text-foreground">قبل ساعة</option>
                  <option value="1d" className="bg-background text-foreground">قبل يوم</option>
                </select>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-foreground">اللون</span>
                <div className="flex gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        hapticFeedback("light");
                        setFormData({ ...formData, color: JSON.stringify(c) });
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        c.bg.replace('bg-', 'bg-'),
                        formData.color === JSON.stringify(c) ? "border-foreground scale-110 shadow-sm" : "border-transparent"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-border/50 p-4">
              <textarea 
                placeholder="ملاحظات..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[100px] bg-transparent text-sm font-medium resize-none outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {event && (
              <button 
                onClick={handleDelete}
                className="w-full bg-card dark:bg-[#1c1c1e] text-destructive font-semibold py-3 rounded-2xl border border-border/50 hover:bg-destructive/10 transition-colors"
              >
                حذف الحدث
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
