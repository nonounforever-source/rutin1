import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, type Habit } from "@/lib/store";
import { Modal } from "@/components/Modal";

const HABIT_ICONS = ["🏃","💪","📚","🧘","💧","🥗","😴","🎯","✍️","🎨","🎵","🌿","🧹","💊","☀️","🌙"];
const HABIT_COLORS = ["#007aff","#34c759","#ff9500","#ff2d55","#af52de","#5ac8fa","#ff6b35","#30d158"];

export function HabitsPage() {
  const { state, dispatch, settings, todayStr, isHabitCompletedToday, getHabitStreak } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏃");
  const [newColor, setNewColor] = useState("#007aff");

  const completedToday = state.habits.filter((h) => isHabitCompletedToday(h.id)).length;
  const total = state.habits.length;
  const progress = total > 0 ? (completedToday / total) * 100 : 0;

  const handleAdd = () => {
    if (!newName.trim()) return;
    dispatch({ type: "ADD_HABIT", payload: { name: newName.trim(), icon: newIcon, color: newColor, frequency: "daily" } });
    setNewName("");
    setNewIcon("🏃");
    setNewColor("#007aff");
    setShowAdd(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 18) return "مساء الخير";
    return "مساء النور";
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{greeting()}</p>
          <h1 className="ios-large-title">{settings.userName || "روتيني"}</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white text-2xl shadow-lg"
        >
          +
        </motion.button>
      </div>

      {/* Progress Card */}
      {total > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ios-card p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-foreground">إنجاز اليوم</span>
            <span className="text-primary font-bold font-number">{completedToday}/{total}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="h-full rounded-full bg-primary"
            />
          </div>
          {progress === 100 && (
            <p className="text-center text-primary font-bold mt-3">🎉 أتممت كل عاداتك اليوم!</p>
          )}
        </motion.div>
      )}

      {/* Habits List */}
      {state.habits.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-6xl">✦</div>
          <p className="text-xl font-bold text-foreground">ابدأ رحلتك</p>
          <p className="text-muted-foreground">أضف عادتك الأولى بالضغط على +</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {state.habits.map((habit, i) => (
              <HabitCard key={habit.id} habit={habit} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold">عادة جديدة</h2>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground text-2xl w-8 h-8 flex items-center justify-center">×</button>
          </div>

          <div className="text-center text-5xl py-2">{newIcon}</div>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم العادة..."
            className="ios-input"
          />

          <div>
            <p className="text-sm font-bold text-muted-foreground mb-3">الأيقونة</p>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewIcon(icon)}
                  className={`text-2xl p-1 rounded-xl transition-all ${newIcon === icon ? "bg-primary/20 scale-110" : ""}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-muted-foreground mb-3">اللون</p>
            <div className="flex gap-3">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`w-9 h-9 rounded-full transition-all ${newColor === color ? "scale-125 ring-2 ring-offset-2 ring-offset-card" : ""}`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>

          <button onClick={handleAdd} className="ios-button-primary" disabled={!newName.trim()}>
            إضافة العادة
          </button>
        </div>
      </Modal>
    </div>
  );
}

function HabitCard({ habit, index }: { habit: Habit; index: number }) {
  const { dispatch, todayStr, isHabitCompletedToday, getHabitStreak } = useApp();
  const completed = isHabitCompletedToday(habit.id);
  const streak = getHabitStreak(habit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ delay: index * 0.05 }}
      className="ios-card flex items-center gap-4 p-4"
    >
      <div className="text-3xl">{habit.icon}</div>
      <div className="flex-1">
        <p className={`font-bold text-base ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-orange-500 font-bold mt-0.5">🔥 {streak} يوم متتالي</p>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => dispatch({ type: "TOGGLE_HABIT", payload: { id: habit.id, date: todayStr } })}
        className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 ${
          completed
            ? "border-transparent text-white"
            : "border-border bg-transparent"
        }`}
        style={completed ? { backgroundColor: habit.color, borderColor: habit.color } : { borderColor: habit.color }}
      >
        {completed ? "✓" : ""}
      </motion.button>
    </motion.div>
  );
}
