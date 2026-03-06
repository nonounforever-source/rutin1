import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { v4 as uuid } from "uuid";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  completions: string[]; // ISO date strings
  createdAt: string;
}

export type Mood = "amazing" | "good" | "okay" | "bad" | "terrible";

export interface JournalEntry {
  id: string;
  content: string;
  mood: Mood;
  date: string; // ISO date string
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  completed: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  favorite: boolean;
  category: string;
}

export interface AppSettings {
  isFirstTime: boolean;
  theme: "light" | "dark" | "system";
  userName: string;
}

export interface AppState {
  habits: Habit[];
  journal: JournalEntry[];
  goals: Goal[];
  quotes: Quote[];
  settings: AppSettings;
}

// ─── Default Quotes ───────────────────────────────────────────────────────────

const defaultQuotes: Quote[] = [
  { id: uuid(), text: "النجاح ليس نهاية الطريق، والفشل ليس نهاية الحياة. الشجاعة هي ما يستمر.", author: "ونستون تشرشل", favorite: false, category: "نجاح" },
  { id: uuid(), text: "ابدأ من حيث أنت، استخدم ما لديك، افعل ما تستطيع.", author: "آرثر آش", favorite: false, category: "تحفيز" },
  { id: uuid(), text: "لا تنتظر الفرصة المثالية. الفرصة المثالية هي الآن.", author: "مجهول", favorite: false, category: "وقت" },
  { id: uuid(), text: "كل يوم هو فرصة جديدة لتصبح نسخة أفضل من نفسك.", author: "مجهول", favorite: false, category: "تطوير" },
  { id: uuid(), text: "الإنسان الناجح يبني الأساس بنفس الحجارة التي يرميها عليه الآخرون.", author: "ديفيد برينكلي", favorite: false, category: "نجاح" },
  { id: uuid(), text: "إذا أردت أن تسير بسرعة، سر وحدك. وإذا أردت أن تسير بعيداً، سر مع الآخرين.", author: "مثل أفريقي", favorite: false, category: "علاقات" },
  { id: uuid(), text: "العادات الصغيرة تصنع الفارق الكبير مع مرور الوقت.", author: "جيمس كلير", favorite: false, category: "عادات" },
  { id: uuid(), text: "التغيير الحقيقي لا يأتي من القمة، بل يبدأ من داخلك.", author: "مجهول", favorite: false, category: "تطوير" },
  { id: uuid(), text: "من لا يتقدم يتقادم. الحركة بركة.", author: "مثل عربي", favorite: false, category: "تحفيز" },
  { id: uuid(), text: "الصبر مفتاح الفرج. وكل شدة بعدها رخاء.", author: "مثل عربي", favorite: true, category: "صبر" },
  { id: uuid(), text: "أعظم مجد ليس أن لا تسقط، بل أن تنهض في كل مرة تسقط فيها.", author: "نيلسون مانديلا", favorite: false, category: "قوة" },
  { id: uuid(), text: "تفاءلوا بالخير تجدوه.", author: "حديث نبوي", favorite: true, category: "إيمان" },
];

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  habits: [],
  journal: [],
  goals: [],
  quotes: defaultQuotes,
  settings: {
    isFirstTime: true,
    theme: "system",
    userName: "",
  },
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOAD_STATE"; payload: AppState }
  // Habits
  | { type: "ADD_HABIT"; payload: Omit<Habit, "id" | "completions" | "createdAt"> }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "TOGGLE_HABIT"; payload: { id: string; date: string } }
  | { type: "EDIT_HABIT"; payload: { id: string } & Partial<Habit> }
  // Journal
  | { type: "ADD_JOURNAL"; payload: Omit<JournalEntry, "id" | "createdAt"> }
  | { type: "DELETE_JOURNAL"; payload: string }
  // Goals
  | { type: "ADD_GOAL"; payload: Omit<Goal, "id" | "completed" | "createdAt"> }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "UPDATE_GOAL_PROGRESS"; payload: { id: string; progress: number } }
  | { type: "TOGGLE_GOAL_COMPLETE"; payload: string }
  // Quotes
  | { type: "TOGGLE_QUOTE_FAVORITE"; payload: string }
  // Settings
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> }
  | { type: "COMPLETE_ONBOARDING"; payload: { userName: string } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;

    case "ADD_HABIT":
      return {
        ...state,
        habits: [
          ...state.habits,
          { ...action.payload, id: uuid(), completions: [], createdAt: new Date().toISOString() },
        ],
      };

    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };

    case "TOGGLE_HABIT": {
      const { id, date } = action.payload;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const hasCompleted = h.completions.includes(date);
          return {
            ...h,
            completions: hasCompleted
              ? h.completions.filter((d) => d !== date)
              : [...h.completions, date],
          };
        }),
      };
    }

    case "EDIT_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload } : h
        ),
      };

    case "ADD_JOURNAL":
      return {
        ...state,
        journal: [
          { ...action.payload, id: uuid(), createdAt: new Date().toISOString() },
          ...state.journal,
        ],
      };

    case "DELETE_JOURNAL":
      return { ...state, journal: state.journal.filter((j) => j.id !== action.payload) };

    case "ADD_GOAL":
      return {
        ...state,
        goals: [
          ...state.goals,
          { ...action.payload, id: uuid(), completed: false, createdAt: new Date().toISOString() },
        ],
      };

    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };

    case "UPDATE_GOAL_PROGRESS":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, progress: action.payload.progress } : g
        ),
      };

    case "TOGGLE_GOAL_COMPLETE":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload ? { ...g, completed: !g.completed, progress: g.completed ? g.progress : 100 } : g
        ),
      };

    case "TOGGLE_QUOTE_FAVORITE":
      return {
        ...state,
        quotes: state.quotes.map((q) =>
          q.id === action.payload ? { ...q, favorite: !q.favorite } : q
        ),
      };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        settings: { ...state.settings, isFirstTime: false, userName: action.payload.userName },
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // helpers
  settings: AppSettings;
  todayStr: string;
  isHabitCompletedToday: (habitId: string) => boolean;
  getHabitStreak: (habit: Habit) => number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "routinely_v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        // Merge default quotes if quotes are missing
        if (!parsed.quotes || parsed.quotes.length === 0) {
          parsed.quotes = defaultQuotes;
        }
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // Apply dark/light theme
  useEffect(() => {
    const { theme } = state.settings;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, [state.settings.theme]);

  const todayStr = new Date().toISOString().split("T")[0];

  const isHabitCompletedToday = (habitId: string) => {
    const habit = state.habits.find((h) => h.id === habitId);
    return habit?.completions.includes(todayStr) ?? false;
  };

  const getHabitStreak = (habit: Habit): number => {
    if (habit.completions.length === 0) return 0;
    const sorted = [...habit.completions].sort().reverse();
    let streak = 0;
    const current = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(current);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split("T")[0];
      if (sorted.includes(str)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <AppContext.Provider
      value={{ state, dispatch, settings: state.settings, todayStr, isHabitCompletedToday, getHabitStreak }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
