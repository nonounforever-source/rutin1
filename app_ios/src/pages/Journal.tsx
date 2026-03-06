import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, type Mood } from "@/lib/store";
import { Modal } from "@/components/Modal";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: "amazing", emoji: "🤩", label: "رائع",    color: "#ffd60a" },
  { value: "good",    emoji: "😊", label: "جيد",     color: "#34c759" },
  { value: "okay",    emoji: "😐", label: "عادي",    color: "#007aff" },
  { value: "bad",     emoji: "😔", label: "سيء",     color: "#ff9500" },
  { value: "terrible",emoji: "😞", label: "صعب",     color: "#ff3b30" },
];

export function JournalPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("good");
  const [viewEntry, setViewEntry] = useState<string | null>(null);

  const handleAdd = () => {
    if (!content.trim()) return;
    dispatch({
      type: "ADD_JOURNAL",
      payload: { content: content.trim(), mood, date: new Date().toISOString().split("T")[0] },
    });
    setContent("");
    setMood("good");
    setShowAdd(false);
  };

  const viewed = state.journal.find((j) => j.id === viewEntry);

  return (
    <div className="flex flex-col gap-5 px-4 pt-14 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="ios-large-title">مذكرتي</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white text-2xl shadow-lg"
        >
          +
        </motion.button>
      </div>

      {/* Mood summary */}
      {state.journal.length > 0 && (
        <div className="ios-card p-4">
          <p className="text-sm font-bold text-muted-foreground mb-3">مشاعرك هذا الأسبوع</p>
          <div className="flex justify-around">
            {MOODS.map((m) => {
              const count = state.journal.filter((j) => j.mood === m.value).length;
              return (
                <div key={m.value} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-bold font-number" style={{ color: m.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entries */}
      {state.journal.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-6xl">✎</div>
          <p className="text-xl font-bold text-foreground">سجّل يومك</p>
          <p className="text-muted-foreground">اكتب أفكارك ومشاعرك بحرية</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {state.journal.map((entry, i) => {
              const moodData = MOODS.find((m) => m.value === entry.mood)!;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setViewEntry(entry.id)}
                  className="ios-card p-5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{moodData.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold" style={{ color: moodData.color }}>{moodData.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.createdAt), "d MMM", { locale: ar })}
                        </span>
                      </div>
                      <p className="text-foreground font-medium leading-relaxed line-clamp-2">{entry.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold">يوميتي</h2>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground text-2xl w-8 h-8 flex items-center justify-center">×</button>
          </div>

          <div>
            <p className="text-sm font-bold text-muted-foreground mb-3">كيف حالك اليوم؟</p>
            <div className="flex justify-around">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mood === m.value ? "bg-secondary scale-110" : ""}`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-bold text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب ما يدور في ذهنك..."
            className="ios-input resize-none"
            style={{ height: 140, paddingTop: 14, paddingBottom: 14 }}
          />

          <button onClick={handleAdd} className="ios-button-primary" disabled={!content.trim()}>
            حفظ
          </button>
        </div>
      </Modal>

      {/* View Entry Modal */}
      <Modal isOpen={!!viewEntry} onClose={() => setViewEntry(null)}>
        {viewed && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{MOODS.find((m) => m.value === viewed.mood)?.emoji}</span>
                <div>
                  <p className="font-bold text-foreground">{MOODS.find((m) => m.value === viewed.mood)?.label}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(viewed.createdAt), "EEEE، d MMMM yyyy", { locale: ar })}</p>
                </div>
              </div>
              <button onClick={() => setViewEntry(null)} className="text-muted-foreground text-2xl">×</button>
            </div>
            <p className="text-foreground leading-relaxed">{viewed.content}</p>
            <button
              onClick={() => {
                dispatch({ type: "DELETE_JOURNAL", payload: viewed.id });
                setViewEntry(null);
              }}
              className="ios-button-secondary text-destructive"
            >
              حذف
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
