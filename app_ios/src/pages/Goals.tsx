import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, type Goal } from "@/lib/store";
import { Modal } from "@/components/Modal";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function GoalsPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [viewGoal, setViewGoal] = useState<string | null>(null);

  const active = state.goals.filter((g) => !g.completed);
  const done = state.goals.filter((g) => g.completed);

  const handleAdd = () => {
    if (!title.trim()) return;
    dispatch({
      type: "ADD_GOAL",
      payload: { title: title.trim(), description: description.trim(), targetDate, progress: 0 },
    });
    setTitle(""); setDescription(""); setTargetDate("");
    setShowAdd(false);
  };

  const viewed = state.goals.find((g) => g.id === viewGoal);

  return (
    <div className="flex flex-col gap-5 px-4 pt-14 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="ios-large-title">أهدافي</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white text-2xl shadow-lg"
        >
          +
        </motion.button>
      </div>

      {/* Stats */}
      {state.goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "الكل", value: state.goals.length, color: "text-foreground" },
            { label: "قيد التنفيذ", value: active.length, color: "text-primary" },
            { label: "مكتمل", value: done.length, color: "text-green-500" },
          ].map((s) => (
            <div key={s.label} className="ios-card p-4 text-center">
              <p className={`text-2xl font-extrabold font-number ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {state.goals.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-6xl">◎</div>
          <p className="text-xl font-bold text-foreground">ضع هدفك الأول</p>
          <p className="text-muted-foreground">حدد ما تريد تحقيقه وابدأ الآن</p>
        </motion.div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="flex flex-col gap-3">
              {active.map((goal, i) => <GoalCard key={goal.id} goal={goal} index={i} onTap={() => setViewGoal(goal.id)} />)}
            </div>
          )}
          {done.length > 0 && (
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-3 px-1">مكتملة ✓</p>
              <div className="flex flex-col gap-3">
                {done.map((goal, i) => <GoalCard key={goal.id} goal={goal} index={i} onTap={() => setViewGoal(goal.id)} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold">هدف جديد</h2>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground text-2xl w-8 h-8 flex items-center justify-center">×</button>
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الهدف..." className="ios-input" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف تفصيلي (اختياري)..." className="ios-input resize-none" style={{ height: 90, paddingTop: 14 }} />
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-2">الموعد النهائي</p>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="ios-input" />
          </div>
          <button onClick={handleAdd} disabled={!title.trim()} className="ios-button-primary">إضافة الهدف</button>
        </div>
      </Modal>

      {/* View Goal Modal */}
      <Modal isOpen={!!viewGoal} onClose={() => setViewGoal(null)}>
        {viewed && (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-foreground">{viewed.title}</h2>
                {viewed.targetDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    الموعد: {format(new Date(viewed.targetDate), "d MMMM yyyy", { locale: ar })}
                  </p>
                )}
              </div>
              <button onClick={() => setViewGoal(null)} className="text-muted-foreground text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>

            {viewed.description && <p className="text-muted-foreground leading-relaxed">{viewed.description}</p>}

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold">التقدم</span>
                <span className="text-sm font-bold font-number text-primary">{viewed.progress}%</span>
              </div>
              <input
                type="range"
                min={0} max={100}
                value={viewed.progress}
                onChange={(e) => dispatch({ type: "UPDATE_GOAL_PROGRESS", payload: { id: viewed.id, progress: Number(e.target.value) } })}
                className="w-full accent-primary"
                style={{ touchAction: "auto" }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { dispatch({ type: "TOGGLE_GOAL_COMPLETE", payload: viewed.id }); setViewGoal(null); }}
                className={viewed.completed ? "ios-button-secondary flex-1" : "ios-button-primary flex-1"}
              >
                {viewed.completed ? "إعادة فتح" : "إتمام الهدف ✓"}
              </button>
              <button
                onClick={() => { dispatch({ type: "DELETE_GOAL", payload: viewed.id }); setViewGoal(null); }}
                className="ios-button-secondary px-4 text-destructive"
              >
                حذف
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GoalCard({ goal, index, onTap }: { goal: Goal; index: number; onTap: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onTap}
      className={`ios-card p-5 active:scale-[0.98] transition-all cursor-pointer ${goal.completed ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className={`font-bold text-base flex-1 ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {goal.title}
        </p>
        {goal.completed && <span className="text-green-500 text-lg mr-2">✓</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <span className="text-xs font-bold text-primary font-number w-8">{goal.progress}%</span>
      </div>
    </motion.div>
  );
}
