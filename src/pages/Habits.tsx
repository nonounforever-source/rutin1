import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { Plus, Settings, LayoutGrid, CheckCircle2, ChevronLeft, Trash2, Sprout, Sparkles, Dumbbell, Briefcase, BookOpen, Droplets, TrendingUp } from "lucide-react";
import { useApp, Habit } from "@/lib/store";
import { cn, hapticFeedback } from "@/lib/utils";
import { PrayerModal, QuranModal, AdhkarModal, WaterModal } from "@/components/HabitModals";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { subDays, format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const HABIT_CATEGORIES = [
  { label: "شخصي", icon: Sprout, color: "text-amber-500" },
  { label: "ديني", icon: Sparkles, color: "text-indigo-500" },
  { label: "صحي", icon: Droplets, color: "text-blue-500" },
  { label: "رياضي", icon: Dumbbell, color: "text-rose-500" },
  { label: "عمل", icon: Briefcase, color: "text-slate-500" },
  { label: "تعلم", icon: BookOpen, color: "text-blue-500" }
];

export function HabitsPage() {
  // --- App State & Context ---
  const { 
    habits, addHabit, deleteHabit, updateHabitProgress, 
    waterSchedule, updateWaterSchedule, 
    settings, updateSettings
  } = useApp();

  // --- Local UI State ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  
  useLockBodyScroll(isAddOpen || isSettingsOpen);

  const [newHabit, setNewHabit] = useState({ title: "", category: "شخصي", icon: "Sprout" });
  const today = new Date().toISOString().split("T")[0];

  // --- Computed Data ---
  
  const isHabitCompleted = (habit: Habit, date: string) => {
    const val = habit.completedDates[date];
    if (!val) return false;
    if (habit.type === 'checkbox') return val === true;
    if (habit.type === 'prayer') return val.fajr && val.dhuhr && val.asr && val.maghrib && val.isha;
    if (habit.type === 'quran') return (val?.pages || 0) > 0;
    if (habit.type === 'water') return (val?.length || 0) >= 8;
    return !!val;
  };

  // Weekly Stats Data for the chart
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = date.toISOString().split("T")[0];
      const completedOnDay = habits.filter(h => isHabitCompleted(h, dateStr)).length;

      return {
        name: format(date, "EEE", { locale: arSA }),
        count: completedOnDay,
        fullDate: dateStr
      };
    });
  }, [habits]);

  // Calculate today's overall progress
  const completedCount = habits.filter(h => isHabitCompleted(h, today)).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // --- Handlers ---

  const handleAdd = () => {
    if (!newHabit.title) return;
    addHabit({
      title: newHabit.title,
      category: newHabit.category,
      icon: newHabit.icon,
      type: "checkbox",
    });
    setNewHabit({ title: "", category: "شخصي", icon: "Sprout" });
    setIsAddOpen(false);
  };

  const handleHabitClick = (habit: Habit) => {
    if (habit.type === 'checkbox') {
      const isCompleted = !habit.completedDates[today];
      hapticFeedback(isCompleted ? "success" : "light");
      updateHabitProgress(habit.id, today, isCompleted);
    } else {
      hapticFeedback("light");
      setSelectedHabitId(habit.id);
      setActiveModal(habit.type);
    }
  };

  const categories = ["الكل", ...Array.from(new Set(habits.map(h => h.category)))];
  const filteredHabits = activeCategory === "الكل" ? habits : habits.filter(h => h.category === activeCategory);

  const getCurrentValue = () => {
    if (!selectedHabitId) return null;
    const habit = habits.find(h => h.id === selectedHabitId);
    return habit?.completedDates[today];
  };

  const handleUpdateProgress = (value: any) => {
    if (selectedHabitId) {
      updateHabitProgress(selectedHabitId, today, value);
    }
  };

  const getHabitIcon = (iconName: string, isCompleted: boolean) => {
    const iconMap: Record<string, { icon: any, color: string }> = {
      "🕌": { icon: Sparkles, color: "text-indigo-500" },
      "📿": { icon: Sparkles, color: "text-indigo-500" },
      "💪": { icon: Dumbbell, color: "text-rose-500" },
      "🏃": { icon: Dumbbell, color: "text-rose-500" },
      "📚": { icon: BookOpen, color: "text-blue-500" },
      "📖": { icon: BookOpen, color: "text-blue-500" },
      "💼": { icon: Briefcase, color: "text-slate-500" },
      "🌱": { icon: Sprout, color: "text-amber-500" },
      "💧": { icon: Droplets, color: "text-blue-500" },
    };

    const config = iconMap[iconName] || HABIT_CATEGORIES.find(c => c.label === iconName) || { icon: Sprout, color: "text-amber-500" };
    const IconComponent = (config as any).icon || (config as any).Found?.icon || Sprout;
    const iconColor = isCompleted ? "text-emerald-500" : (config.color || "text-amber-500");

    return <IconComponent size={22} className={iconColor} />;
  };

  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    let curr = new Date();
    
    while (true) {
      const dateStr = curr.toISOString().split("T")[0];
      if (isHabitCompleted(habit, dateStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        if (streak === 0 && dateStr === today) {
           curr.setDate(curr.getDate() - 1);
           continue;
        }
        break;
      }
      if (streak > 365) break;
    }
    return streak;
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-2xl mx-auto min-h-screen font-sans">
      {/* Apple-style Header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {new Date().toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="ios-large-title">الأساسيات</h1>
        </div>
        <div className="flex gap-3 mb-1">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="h-10 w-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground hover:bg-secondary active:scale-95 transition-all"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={22} />
          </button>
        </div>
      </header>

      {/* Widgets Section */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Progress Widget */}
        <div className="ios-card p-6 flex items-center gap-6 bg-gradient-to-br from-card to-secondary/30">
          <div className="relative h-20 w-20 flex-shrink-0">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary/50" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * progress) / 100}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black font-number text-foreground">{progress}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black font-number text-foreground tracking-tighter">{completedCount} <span className="text-lg text-muted-foreground font-bold">/ {habits.length}</span></h3>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">عادات مكتملة</p>
          </div>
        </div>

        {/* Weekly Insights Widget */}
        <div className="ios-card p-6 flex flex-col bg-gradient-to-br from-card to-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-foreground">نشاط الأسبوع</span>
            </div>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-2 rounded-xl shadow-xl border-none">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-wider">{payload[0].payload.name}</p>
                          <p className="text-xs font-black text-primary">{payload[0].value} عادات</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* iOS Segmented Control for Categories */}
      <div className="bg-secondary/50 p-1.5 rounded-2xl flex mb-8 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex-1 min-w-[80px] py-2 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeCategory === cat 
                ? "bg-card shadow-sm text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* iOS Card-based List for Habits */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-4 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit) => {
              const isCompleted = isHabitCompleted(habit, today);
              const categoryInfo = HABIT_CATEGORIES.find(c => c.label === habit.category) || HABIT_CATEGORIES[0];
              const streak = calculateStreak(habit);

              return (
                <motion.div
                  layout
                  key={habit.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    "group relative flex items-center p-5 transition-all cursor-pointer active:scale-[0.97] bg-card rounded-[1.75rem] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-border/40",
                    isCompleted ? "bg-secondary/20 opacity-90 border-transparent shadow-none" : "hover:shadow-md hover:border-primary/20"
                  )}
                  onClick={() => handleHabitClick(habit)}
                >
                  {/* Left Color Indicator (iOS style) */}
                  <div className={cn(
                    "absolute right-0 top-6 bottom-6 w-1.5 rounded-l-full transition-all duration-500",
                    isCompleted ? "bg-emerald-500" : categoryInfo.color.replace('text-', 'bg-')
                  )} />

                  {/* Icon Container */}
                  <div className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-2xl ml-4 transition-all duration-500 shadow-sm",
                    isCompleted ? "bg-emerald-500/10 rotate-6" : "bg-secondary/40 group-hover:bg-secondary/60"
                  )}>
                    {getHabitIcon(habit.icon, isCompleted)}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full",
                        isCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary/80 text-muted-foreground"
                      )}>
                        {habit.category}
                      </span>
                      {streak > 0 && (
                        <motion.span 
                          initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                          className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                          <TrendingUp size={10} />
                          {streak} يوم
                        </motion.span>
                      )}
                    </div>
                    <h4 className={cn(
                      "font-black text-xl truncate transition-all duration-500 tracking-tight",
                      isCompleted ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
                    )}>
                      {habit.title}
                    </h4>
                    {habit.subtitle && (
                      <p className="text-sm text-muted-foreground truncate font-semibold mt-0.5">
                        {habit.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 mr-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                      className="p-2.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    {habit.type === 'checkbox' ? (
                      <div className="relative flex items-center justify-center w-12 h-12">
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.div 
                              key="checked"
                              initial={{ scale: 0.4, opacity: 0, rotate: -45 }} 
                              animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                              exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
                              transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 className="text-white" size={24} />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="unchecked"
                              initial={{ scale: 0.8, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              <div className="w-10 h-10 rounded-full border-[3px] border-muted-foreground/15 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {isCompleted && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-500" size={18} />
                          </motion.div>
                        )}
                        <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground/70 group-hover:text-primary transition-colors">
                          <ChevronLeft size={22} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )})}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 text-muted-foreground ios-card mt-6"
        >
          <LayoutGrid className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p className="font-semibold text-lg text-foreground">لا توجد عادات هنا</p>
          <p className="text-sm mt-1 mb-6">ابدأ ببناء أساسياتك اليومية الآن</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-primary font-bold hover:opacity-70 transition-opacity"
          >
            أضف عادة جديدة
          </button>
        </motion.div>
      )}

      {/* Modals */}
      <PrayerModal 
        isOpen={activeModal === 'prayer'} 
        onClose={() => setActiveModal(null)}
        completed={getCurrentValue()}
        onUpdate={handleUpdateProgress}
      />
      
      <QuranModal 
        isOpen={activeModal === 'quran'} 
        onClose={() => setActiveModal(null)}
        completed={getCurrentValue()}
        onUpdate={handleUpdateProgress}
      />
      
      <AdhkarModal 
        isOpen={activeModal === 'adhkar'} 
        onClose={() => setActiveModal(null)}
        completed={getCurrentValue()}
        onUpdate={handleUpdateProgress}
      />
      
      <WaterModal 
        isOpen={activeModal === 'water'} 
        onClose={() => setActiveModal(null)}
        completed={getCurrentValue()}
        schedule={waterSchedule}
        onUpdate={handleUpdateProgress}
        onEditSchedule={(id: string, time: string) => {
            const newSchedule = waterSchedule.map(s => s.id === id ? { ...s, time } : s);
            updateWaterSchedule(newSchedule);
        }}
      />

      {/* iOS Style Add Habit Sheet */}
      <Portal>
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
              onClick={() => setIsAddOpen(false)}
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
                  <button onClick={() => setIsAddOpen(false)} className="text-primary font-semibold text-lg">إلغاء</button>
                  <h3 className="font-bold text-xl">أساسيات جديدة</h3>
                  <button 
                    onClick={handleAdd}
                    disabled={!newHabit.title}
                    className="text-primary font-semibold text-lg disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
                
                {/* iOS Grouped Form */}
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                    <div className="flex items-center px-4 py-4 border-b border-border/40">
                      <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center ml-4 shadow-inner">
                        {getHabitIcon(newHabit.icon, false)}
                      </div>
                      <input
                        autoFocus
                        value={newHabit.title}
                        onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                        placeholder="اسم الأساسيات..."
                        className="flex-1 bg-transparent text-xl font-black outline-none placeholder:text-muted-foreground/30 tracking-tight"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground/80 mb-1 block uppercase tracking-[0.15em] ml-4">الفئة والأيقونة</label>
                    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm divide-y divide-border/40">
                      {HABIT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => setNewHabit({ ...newHabit, category: cat.label, icon: cat.label })}
                          className={cn(
                            "w-full flex items-center justify-between px-5 py-4 bg-transparent transition-all active:bg-secondary/50",
                            newHabit.category === cat.label && "bg-secondary/20"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/40 shadow-sm")}>
                              <cat.icon size={20} className={cat.color} />
                            </div>
                            <span className="font-black text-lg text-foreground tracking-tight">{cat.label}</span>
                          </div>
                          {newHabit.category === cat.label && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="text-primary" size={22} />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </Portal>

      {/* iOS Style Settings Sheet */}
      <Portal>
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-secondary/30 backdrop-blur-xl w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 flex flex-col relative z-10 overscroll-contain"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
              </div>
              
              <div className="p-6 pt-2 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-12" /> {/* Spacer */}
                  <h3 className="font-bold text-xl">الإعدادات</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-primary font-semibold text-lg w-12 text-left">تم</button>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider ml-2">أوقات الأساسيات</label>
                  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-semibold text-foreground">وقت الاستيقاظ</span>
                      <input 
                        type="time" 
                        value={settings.wakeTime}
                        onChange={(e) => updateSettings({ wakeTime: e.target.value })}
                        className="bg-secondary/50 border border-border/50 rounded-lg px-2 py-1 outline-none font-medium text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-semibold text-foreground">وقت النوم</span>
                      <input 
                        type="time" 
                        value={settings.sleepTime}
                        onChange={(e) => updateSettings({ sleepTime: e.target.value })}
                        className="bg-secondary/50 border border-border/50 rounded-lg px-2 py-1 outline-none font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider ml-2">الإشعارات</label>
                  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-semibold text-foreground">تذكير بالعادات اليومية</span>
                      <button 
                        onClick={() => updateSettings({ notifications: !settings.notifications })}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          settings.notifications ? "bg-emerald-500" : "bg-secondary"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                          settings.notifications ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}
