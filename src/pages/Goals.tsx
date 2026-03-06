import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { useApp, Goal } from "@/lib/store";
import { 
  Plus, Target, Trash2, Calendar, 
  CheckCircle2, Circle, Trophy, 
  Edit2, TrendingUp, Flag, Check, X,
  Sparkles, Dumbbell, BookOpen, Briefcase, Sprout, Coins,
  PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const CATEGORIES = [
  { id: "spiritual", label: "ديني", icon: Sparkles, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", chartColor: "#10b981" },
  { id: "health", label: "رياضي", icon: Dumbbell, color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400", chartColor: "#f43f5e" },
  { id: "learning", label: "تعلم", icon: BookOpen, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", chartColor: "#3b82f6" },
  { id: "career", label: "مهني", icon: Briefcase, color: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400", chartColor: "#64748b" },
  { id: "personal", label: "شخصي", icon: Sprout, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", chartColor: "#f59e0b" },
  { id: "financial", label: "مالي", icon: Coins, color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", chartColor: "#8b5cf6" },
];

export function GoalsPage() {
  // --- App State & Context ---
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();

  // --- Local UI State ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  useLockBodyScroll(isEditorOpen);

  // --- Computed Data ---
  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Category Distribution Data
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const count = goals.filter(g => g.category === cat.label).length;
      return {
        name: cat.label,
        value: count,
        color: cat.chartColor
      };
    }).filter(d => d.value > 0);
  }, [goals]);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingGoal(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-5xl mx-auto min-h-screen font-sans">
      {/* Apple-style Header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {totalCount > 0 
                ? `أنجزت ${completedCount} من ${totalCount}`
                : "ابدأ رحلة النجاح"}
          </p>
          <h1 className="ios-large-title">أهدافي</h1>
        </div>
        <div className="flex gap-3 mb-1">
          <button 
            onClick={handleCreate}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={22} />
          </button>
        </div>
      </header>

      {/* Overall Progress Widget */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="ios-card p-6 flex flex-col justify-between bg-gradient-to-br from-card to-secondary/30"
          >
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">الإنجاز العام</p>
                  <p className="text-3xl font-black text-foreground font-number tracking-tighter">{Math.round(progress)}%</p>
                </div>
              </div>
            </div>
            <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <span>{completedCount} مكتمل</span>
              <span>{totalCount - completedCount} متبقي</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="ios-card p-6 flex flex-col bg-gradient-to-br from-card to-secondary/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <PieChartIcon size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-foreground">توزيع الأهداف</span>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass p-2 rounded-xl shadow-xl border-none">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-wider">{payload[0].name}</p>
                            <p className="text-xs font-black" style={{ color: payload[0].payload.color }}>{payload[0].value} أهداف</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onEdit={() => handleEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onUpdate={(updates) => updateGoal(goal.id, updates)}
            />
          ))}
        </AnimatePresence>
        
        {/* Empty State / Add New */}
        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground ios-card"
          >
            <Target className="h-12 w-12 opacity-20 mb-4" />
            <p className="font-semibold text-lg text-foreground">لا توجد أهداف حالياً</p>
            <p className="text-sm mt-1 mb-6">حدد هدفك الأول وابدأ العمل عليه</p>
            <button 
              onClick={handleCreate}
              className="text-primary font-bold hover:opacity-70 transition-opacity"
            >
              أضف هدفاً جديداً
            </button>
          </motion.div>
        )}
      </div>

      {/* iOS Style Editor Sheet */}
      <Portal>
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
              onClick={() => setIsEditorOpen(false)}
            />
            <GoalEditor 
              initialData={editingGoal} 
              onClose={() => setIsEditorOpen(false)} 
              onSave={(data) => {
                if (editingGoal) {
                  updateGoal(editingGoal.id, data);
                } else {
                  addGoal(data);
                }
                setIsEditorOpen(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete, onUpdate }: { 
  goal: Goal; 
  onEdit: () => void; 
  onDelete: () => void;
  onUpdate: (updates: Partial<Goal>) => void;
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  
  const category = CATEGORIES.find(c => c.label === goal.category) || CATEGORIES[4];
  const progress = Math.min(100, Math.round((goal.current / (goal.target || 100)) * 100));
  const isCompleted = progress >= 100;

  const allMilestonesCompleted = goal.milestones && goal.milestones.length > 0 && goal.milestones.every(m => m.completed);
  const showCompletionPrompt = !goal.completed && allMilestonesCompleted && !isPromptDismissed;

  useEffect(() => {
    if (!allMilestonesCompleted) {
      setIsPromptDismissed(false);
    }
  }, [allMilestonesCompleted]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "relative ios-card p-6 overflow-hidden flex flex-col active:scale-[0.98]",
        isCompleted && "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn("px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5", category.color)}>
          <category.icon size={14} />
          <span>{category.label}</span>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 rounded-full transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-6 flex-1">
        <h3 className={cn("text-xl font-bold mb-2 leading-tight", isCompleted && "text-emerald-700 dark:text-emerald-400")}>
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{goal.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
           <Calendar size={14} />
           <span>{new Date(goal.createdAt).toLocaleDateString('ar-EG')}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-muted-foreground">الإنجاز</span>
          <span className={cn("text-sm font-bold", isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-primary")}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0 }}
            className={cn(
              "h-full rounded-full absolute top-0 right-0",
              isCompleted ? "bg-emerald-500" : "bg-primary"
            )}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {showCompletionPrompt ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-secondary/50 p-3 rounded-2xl border border-primary/20 mb-2"
        >
          <span className="text-sm font-semibold">هل أنجزت المهمة؟</span>
          <div className="flex gap-2">
            <button 
              onClick={() => onUpdate({ current: goal.target || 100, completed: true })}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-xs font-bold"
            >
              <Check size={14} />
              نعم
            </button>
            <button 
              onClick={() => {
                setIsPromptDismissed(true);
                onUpdate({ current: (goal.target || 100) * 0.85, completed: false });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-xl transition-colors text-xs font-bold"
            >
              <X size={14} />
              لا
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 mb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => {
              const val = Number(e.target.value);
              const newCurrent = (val / 100) * (goal.target || 100);
              onUpdate({ current: newCurrent, completed: val >= 100 });
            }}
            className={cn(
              "flex-1 h-10 rounded-xl cursor-pointer accent-primary bg-secondary/50 appearance-none px-1",
              isCompleted && "accent-emerald-500"
            )}
          />
          {isCompleted ? (
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Trophy size={20} />
            </div>
          ) : (
            <button 
              onClick={() => {
                const target = goal.target || 100;
                const step = target / 10; 
                const next = Math.min(target, goal.current + step);
                onUpdate({ current: next, completed: next >= target });
              }}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      )}

      {/* Milestones Preview */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-3">
            <Flag size={14} />
            <span>خطوات التنفيذ</span>
          </div>
          <div className="space-y-2.5">
            {goal.milestones.slice(0, showAllMilestones ? undefined : 2).map((ms) => (
              <div key={ms.id} className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => {
                    const newMilestones = goal.milestones.map(m => 
                      m.id === ms.id ? { ...m, completed: !m.completed } : m
                    );
                    
                    const completedCount = newMilestones.filter(m => m.completed).length;
                    const totalCount = newMilestones.length;
                    
                    let newProgress = goal.current;
                    if (totalCount > 0) {
                      newProgress = (completedCount / totalCount) * (goal.target || 100);
                    }
                    
                    const isAllCompleted = totalCount > 0 && completedCount === totalCount;

                    onUpdate({ 
                      milestones: newMilestones,
                      current: newProgress,
                      completed: isAllCompleted ? false : newProgress >= (goal.target || 100)
                    });
                  }}
                  className={cn(
                    "shrink-0 transition-colors",
                    ms.completed ? "text-emerald-500" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {ms.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <span className={cn("font-medium transition-all", ms.completed && "line-through text-muted-foreground opacity-50")}>
                  {ms.text}
                </span>
              </div>
            ))}
            {goal.milestones.length > 2 && (
              <button 
                onClick={() => setShowAllMilestones(!showAllMilestones)}
                className="text-xs font-semibold text-primary mt-2"
              >
                {showAllMilestones ? "عرض أقل" : `+${goal.milestones.length - 2} المزيد...`}
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function GoalEditor({ initialData, onClose, onSave }: { 
  initialData: Goal | null, 
  onClose: () => void, 
  onSave: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    target: initialData?.target || 100,
    unit: initialData?.unit || "%",
    category: initialData?.category || "شخصي",
    deadline: initialData?.deadline || "",
    milestones: initialData?.milestones || [],
    current: initialData?.current || 0
  });

  const [newMilestone, setNewMilestone] = useState("");

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { id: Math.random().toString(), text: newMilestone, completed: false }]
    }));
    setNewMilestone("");
  };

  const handleSave = () => {
    if (!formData.title) return;

    let current = formData.current;
    if (formData.milestones.length > 0) {
       const completedCount = formData.milestones.filter(m => m.completed).length;
       current = (completedCount / formData.milestones.length) * formData.target;
    }

    onSave({
      ...formData,
      current,
      completed: current >= formData.target
    });
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-secondary/30 backdrop-blur-xl w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 flex flex-col relative z-10 max-h-[90dvh]"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
      </div>
      
      <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0">
        <button onClick={onClose} className="text-primary font-semibold text-lg">إلغاء</button>
        <h3 className="font-bold text-xl">{initialData ? "تعديل الهدف" : "هدف جديد"}</h3>
        <button 
          onClick={handleSave}
          disabled={!formData.title}
          className="text-primary font-semibold text-lg disabled:opacity-50"
        >
          حفظ
        </button>
      </div>

      <div className="p-6 pt-0 overflow-y-auto overscroll-contain space-y-6">
        {/* iOS Grouped Form */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
            <div className="flex items-center px-4 py-3 border-b border-border/50">
              <span className="text-sm font-semibold w-24 text-muted-foreground">العنوان</span>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: قراءة 20 كتاب"
                className="flex-1 bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-start px-4 py-3">
              <span className="text-sm font-semibold w-24 text-muted-foreground mt-1">الوصف</span>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="تفاصيل إضافية حول هدفك (اختياري)"
                className="flex-1 bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 resize-none min-h-[60px]"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl overflow-hidden border border-border/50 p-4">
            <label className="text-sm font-semibold text-muted-foreground/80 mb-3 block">تصنيف الهدف</label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({...formData, category: cat.label})}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    formData.category === cat.label 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-secondary/30 border-transparent hover:bg-secondary text-muted-foreground"
                  )}
                >
                  <cat.icon size={20} />
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl overflow-hidden border border-border/50 p-4">
            <label className="text-sm font-semibold text-muted-foreground mb-3 block">خطوات التنفيذ (اختياري)</label>
            <div className="space-y-2 mb-3">
              {formData.milestones.map((ms, idx) => (
                <div key={ms.id} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl group">
                  <span className="text-xs font-bold text-muted-foreground w-6 h-6 flex items-center justify-center bg-background rounded-full">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">{ms.text}</span>
                  <button 
                    onClick={() => setFormData({
                      ...formData, 
                      milestones: formData.milestones.filter(m => m.id !== ms.id)
                    })}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                placeholder="أضف خطوة صغيرة..."
                className="flex-1 bg-secondary/50 border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
              />
              <button 
                onClick={handleAddMilestone}
                className="px-4 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground transition-colors font-semibold"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
