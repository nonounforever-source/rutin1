import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// --- Types & Interfaces ---
export type Theme = "light" | "dark";

export type HabitType = "checkbox" | "counter" | "prayer" | "quran" | "adhkar" | "water";

export interface Habit {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  category: string;
  type: HabitType;
  target?: number; // For counter
  unit?: string;
  // For complex types, the value in completedDates will be an object or number
  completedDates: Record<string, any>; 
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  reflection?: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
  createdAt: number;
  isPinned?: boolean;
  color?: string;
  coverImage?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  target?: number;
  unit?: string;
  current: number;
  deadline?: string;
  milestones: { id: string; text: string; completed: boolean }[];
  completed: boolean;
  createdAt: number;
}

export interface WaterSchedule {
  id: string;
  time: string;
  label: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  color?: string; // Hex or tailwind class
  allDay?: boolean;
  location?: string;
  reminder?: string;
  linkedId?: string;
}

export interface AppState {
  theme: Theme;
  habits: Habit[];
  userQuotes: Quote[]; // Quotes added by the user
  journal: JournalEntry[];
  goals: Goal[];
  events: CalendarEvent[];
  waterSchedule: WaterSchedule[];
  settings: {
    wakeTime: string;
    sleepTime: string;
    notifications: boolean;
    isFirstTime: boolean;
  };
}

// --- Initial Data ---
const INITIAL_HABITS: Habit[] = [
  { id: "h_prayers", title: "الصلوات الخمس", subtitle: "فجر • ظهر • عصر • مغرب • عشاء", icon: "ديني", category: "ديني", type: "prayer", completedDates: {} },
  { id: "h_quran", title: "قراءة القرآن", subtitle: "الورد اليومي", icon: "تعلم", category: "ديني", type: "quran", completedDates: {} },
  { id: "h_adhkar", title: "أذكار الصباح والمساء", subtitle: "حصن المسلم", icon: "ديني", category: "ديني", type: "adhkar", completedDates: {} },
  { id: "h_water", title: "شرب الماء", subtitle: "8 أكواب يومياً", icon: "صحي", category: "صحي", type: "water", completedDates: {} },
  { id: "h_sport", title: "الرياضة", subtitle: "30 دقيقة مشي أو جري", icon: "صحي", category: "رياضي", type: "checkbox", completedDates: {} },
];

const INITIAL_WATER_SCHEDULE: WaterSchedule[] = [
  { id: "w1", time: "07:00", label: "الاستيقاظ" },
  { id: "w2", time: "09:00", label: "الصباح" },
  { id: "w3", time: "11:00", label: "قبل الغداء" },
  { id: "w4", time: "13:00", label: "الغداء" },
  { id: "w5", time: "15:00", label: "العصر" },
  { id: "w6", time: "17:00", label: "المساء" },
  { id: "w7", time: "19:00", label: "المغرب" },
  { id: "w8", time: "21:00", label: "قبل النوم" },
];

// Context
interface AppContextType extends AppState {
  setTheme: (theme: Theme) => void;
  
  addHabit: (habit: Omit<Habit, "id" | "completedDates">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  // Generic toggle for simple habits, or specific update for complex ones
  updateHabitProgress: (id: string, date: string, value: any) => void;
  
  addUserQuote: (quote: Omit<Quote, "id" | "date">) => void;
  deleteUserQuote: (id: string) => void;
  
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "completed">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  updateWaterSchedule: (schedule: WaterSchedule[]) => void;
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// --- App Provider Component ---
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("routinely_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure events array exists for migration
        if (!parsed.events) parsed.events = [];
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      theme: "dark",
      habits: INITIAL_HABITS,
      userQuotes: [],
      journal: [],
      goals: [],
      events: [],
      waterSchedule: INITIAL_WATER_SCHEDULE,
      settings: {
        wakeTime: "06:00",
        sleepTime: "22:30",
        notifications: false,
        isFirstTime: true,
      },
    };
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem("routinely_v2", JSON.stringify(state));
  }, [state]);

  // --- State Actions ---
  const setTheme = (theme: Theme) => setState(s => ({ ...s, theme }));

  /**
   * Adds a new habit and creates a corresponding calendar event
   */
  const addHabit = (habit: Omit<Habit, "id" | "completedDates">) => {
    setState(s => {
      const newHabit = { ...habit, id: uuidv4(), completedDates: {} };
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        title: `أساسيات: ${habit.title}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        allDay: true,
        color: JSON.stringify({ bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" }),
        linkedId: newHabit.id
      };
      return { ...s, habits: [...s.habits, newHabit], events: [...s.events, newEvent] };
    });
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setState(s => {
      const newHabits = s.habits.map(h => h.id === id ? { ...h, ...updates } : h);
      let newEvents = s.events;
      if (updates.title) {
        newEvents = s.events.map(e => e.linkedId === id ? { ...e, title: `أساسيات: ${updates.title}` } : e);
      }
      return { ...s, habits: newHabits, events: newEvents };
    });
  };

  const deleteHabit = (id: string) => {
    setState(s => ({ 
      ...s, 
      habits: s.habits.filter(h => h.id !== id),
      events: s.events.filter(e => e.linkedId !== id)
    }));
  };

  const updateHabitProgress = (id: string, date: string, value: any) => {
    setState(s => ({
      ...s,
      habits: s.habits.map(h => {
        if (h.id !== id) return h;
        return { ...h, completedDates: { ...h.completedDates, [date]: value } };
      })
    }));
  };

  const addUserQuote = (quote: Omit<Quote, "id" | "date">) => {
    setState(s => ({ ...s, userQuotes: [{ ...quote, id: uuidv4(), date: new Date().toISOString() }, ...s.userQuotes] }));
  };

  const deleteUserQuote = (id: string) => {
    setState(s => ({ ...s, userQuotes: s.userQuotes.filter(q => q.id !== id) }));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id" | "createdAt">) => {
    setState(s => {
      const newEntry = { ...entry, id: uuidv4(), createdAt: Date.now() };
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        title: `تدوينة: ${entry.title || 'بدون عنوان'}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        allDay: true,
        color: JSON.stringify({ bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" }),
        linkedId: newEntry.id
      };
      return { ...s, journal: [newEntry, ...s.journal], events: [...s.events, newEvent] };
    });
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setState(s => {
      const newJournal = s.journal.map(j => j.id === id ? { ...j, ...updates } : j);
      let newEvents = s.events;
      if (updates.title) {
        newEvents = s.events.map(e => e.linkedId === id ? { ...e, title: `تدوينة: ${updates.title}` } : e);
      }
      return { ...s, journal: newJournal, events: newEvents };
    });
  };

  const deleteJournalEntry = (id: string) => {
    setState(s => ({ 
      ...s, 
      journal: s.journal.filter(j => j.id !== id),
      events: s.events.filter(e => e.linkedId !== id)
    }));
  };

  const addGoal = (goal: Omit<Goal, "id" | "createdAt" | "completed">) => {
    setState(s => {
      const newGoal = { ...goal, id: uuidv4(), createdAt: Date.now(), completed: false };
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        title: `هدف: ${goal.title}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        allDay: true,
        color: JSON.stringify({ bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" }),
        linkedId: newGoal.id
      };
      return { ...s, goals: [newGoal, ...s.goals], events: [...s.events, newEvent] };
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(s => {
      const newGoals = s.goals.map(g => g.id === id ? { ...g, ...updates } : g);
      let newEvents = s.events;
      if (updates.title) {
        newEvents = s.events.map(e => e.linkedId === id ? { ...e, title: `هدف: ${updates.title}` } : e);
      }
      return { ...s, goals: newGoals, events: newEvents };
    });
  };

  const deleteGoal = (id: string) => {
    setState(s => ({ 
      ...s, 
      goals: s.goals.filter(g => g.id !== id),
      events: s.events.filter(e => e.linkedId !== id)
    }));
  };

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    setState(s => ({ ...s, events: [...s.events, { ...event, id: uuidv4() }] }));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setState(s => ({ ...s, events: s.events.map(e => e.id === id ? { ...e, ...updates } : e) }));
  };

  const deleteEvent = (id: string) => {
    setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
  };

  const updateWaterSchedule = (schedule: WaterSchedule[]) => {
    setState(s => ({ ...s, waterSchedule: schedule }));
  };

  const updateSettings = (settings: Partial<AppState["settings"]>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...settings } }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setTheme,
      addHabit, updateHabit, deleteHabit, updateHabitProgress,
      addUserQuote, deleteUserQuote,
      addJournalEntry, updateJournalEntry, deleteJournalEntry,
      addGoal, updateGoal, deleteGoal,
      addEvent, updateEvent, deleteEvent,
      updateWaterSchedule,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
