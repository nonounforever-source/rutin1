import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { WaterSchedule } from "@/lib/store";
import { Edit2, Sunrise, Sun, CloudSun, Sunset, Moon, Droplets, BookOpen, Sparkles } from "lucide-react";

// --- Prayer Modal ---
export function PrayerModal({ isOpen, onClose, completed, onUpdate }: any) {
  const prayers = [
    { id: "fajr", label: "الفجر", icon: Sunrise, color: "text-orange-500" },
    { id: "dhuhr", label: "الظهر", icon: Sun, color: "text-yellow-500" },
    { id: "asr", label: "العصر", icon: CloudSun, color: "text-amber-500" },
    { id: "maghrib", label: "المغرب", icon: Sunset, color: "text-rose-500" },
    { id: "isha", label: "العشاء", icon: Moon, color: "text-indigo-500" },
  ];

  const status = completed || {};

  const toggle = (id: string) => {
    onUpdate({ ...status, [id]: !status[id] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الصلوات الخمس">
      <div className="space-y-3">
        {prayers.map((p) => (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300",
              status[p.id]
                ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                : "bg-card border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/80",
                status[p.id] ? "bg-emerald-500/20" : ""
              )}>
                <p.icon className={cn("transition-colors", status[p.id] ? "text-emerald-500" : p.color)} size={22} />
              </div>
              <span className="font-bold text-lg">{p.label}</span>
            </div>
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300",
                status[p.id]
                  ? "bg-emerald-500 border-emerald-500 text-white scale-110"
                  : "border-muted-foreground/20 bg-transparent"
              )}
            >
              {status[p.id] && <span className="text-xs font-bold">✓</span>}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// --- Quran Modal ---
export function QuranModal({ isOpen, onClose, completed, onUpdate }: any) {
  const pages = completed?.pages || 0;

  const updatePages = (delta: number) => {
    const newPages = Math.max(0, pages + delta);
    onUpdate({ ...completed, pages: newPages });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="قراءة القرآن">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
          <BookOpen size={48} strokeWidth={1.5} />
        </div>
        <div className="text-7xl font-black mb-2 tracking-tighter text-foreground">{pages}</div>
        <div className="text-muted-foreground font-semibold mb-10">صفحات مقروءة اليوم</div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => updatePages(-1)}
            className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold hover:bg-secondary/80 transition-colors"
          >
            -
          </button>
          <button 
            onClick={() => updatePages(1)}
            className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            +
          </button>
        </div>
        
        <div className="mt-10 grid grid-cols-3 gap-3 w-full">
            <button onClick={() => updatePages(2)} className="py-3 px-2 rounded-xl bg-secondary/50 text-xs font-bold hover:bg-secondary transition-colors">صفحتين</button>
            <button onClick={() => updatePages(10)} className="py-3 px-2 rounded-xl bg-secondary/50 text-xs font-bold hover:bg-secondary transition-colors">10 صفحات</button>
            <button onClick={() => updatePages(20)} className="py-3 px-2 rounded-xl bg-secondary/50 text-xs font-bold hover:bg-secondary transition-colors">جزء كامل</button>
        </div>
      </div>
    </Modal>
  );
}

// --- Adhkar Modal ---
export function AdhkarModal({ isOpen, onClose, completed, onUpdate }: any) {
  const [tab, setTab] = useState<"morning" | "evening">("morning");
  const counts = completed?.[tab] || {};

  const adhkarList = {
    morning: [
      { id: "m1", text: "سبحان الله وبحمده", target: 100 },
      { id: "m2", text: "أستغفر الله وأتوب إليه", target: 100 },
      { id: "m3", text: "لا إله إلا الله وحده لا شريك له...", target: 10 },
      { id: "m4", text: "اللهم بك أصبحنا وبك أمسينا...", target: 1 },
    ],
    evening: [
      { id: "e1", text: "سبحان الله وبحمده", target: 100 },
      { id: "e2", text: "أستغفر الله وأتوب إليه", target: 100 },
      { id: "e3", text: "أعوذ بكلمات الله التامات من شر ما خلق", target: 3 },
      { id: "e4", text: "اللهم بك أمسينا وبك أصبحنا...", target: 1 },
    ]
  };

  const increment = (id: string, target: number) => {
    const current = counts[id] || 0;
    if (current < target) {
      const newCounts = { ...counts, [id]: current + 1 };
      onUpdate({ ...completed, [tab]: newCounts });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الأذكار">
      <div className="flex p-1.5 bg-secondary/50 rounded-2xl mb-6">
        <button
          onClick={() => setTab("morning")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            tab === "morning" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
          )}
        >
          <Sun size={16} className={tab === "morning" ? "text-yellow-500" : ""} />
          أذكار الصباح
        </button>
        <button
          onClick={() => setTab("evening")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            tab === "evening" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
          )}
        >
          <Moon size={16} className={tab === "evening" ? "text-indigo-500" : ""} />
          أذكار المساء
        </button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
        {adhkarList[tab].map((item) => {
          const count = counts[item.id] || 0;
          const isDone = count >= item.target;
          
          return (
            <button
              key={item.id}
              onClick={() => increment(item.id, item.target)}
              disabled={isDone}
              className={cn(
                "w-full text-right p-4 rounded-2xl border transition-all relative overflow-hidden",
                isDone ? "bg-emerald-500/10 border-emerald-500/30 opacity-60" : "bg-card border-border active:scale-[0.98] hover:bg-secondary/30"
              )}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300"
                style={{ width: `${(count / item.target) * 100}%` }}
              />
              <div className="relative z-10 flex justify-between items-center">
                <span className="text-sm font-bold flex-1 ml-4">{item.text}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-secondary/80 px-2.5 py-1.5 rounded-lg min-w-[50px] text-center">
                    {count} / {item.target}
                  </span>
                  {isDone && <Sparkles size={14} className="text-emerald-500" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// --- Water Modal ---
export function WaterModal({ isOpen, onClose, completed, schedule, onUpdate, onEditSchedule }: any) {
  const completedIds = Array.isArray(completed) ? completed : [];

  const toggle = (id: string) => {
    const newIds = completedIds.includes(id)
      ? completedIds.filter((i: string) => i !== id)
      : [...completedIds, id];
    onUpdate(newIds);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="شرب الماء">
       <div className="space-y-8">
          <div className="flex items-center justify-between bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10">
             <div>
               <h3 className="text-4xl font-black text-blue-500">{completedIds.length} <span className="text-xl text-blue-500/50">/ {schedule.length}</span></h3>
               <p className="text-sm font-bold text-blue-500/70 mt-1">أكواب اليوم</p>
             </div>
             <div className="h-20 w-20 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
               <Droplets size={40} strokeWidth={1.5} />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {schedule.map((s: WaterSchedule) => {
              const isDone = completedIds.includes(s.id);
              return (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                      isDone 
                        ? "bg-blue-500/10 border-blue-500/30 shadow-sm" 
                        : "bg-card border-border hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300",
                      isDone ? "bg-blue-500 border-blue-500 text-white scale-110" : "border-muted-foreground/20 text-transparent bg-transparent"
                    )}>
                      <span className="text-[10px] font-bold">✓</span>
                    </div>
                    <div className="text-right flex-1">
                      <div className="text-sm font-black">{s.time}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{s.label}</div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTime = prompt("أدخل الوقت الجديد:", s.time);
                      if (newTime) onEditSchedule(s.id, newTime);
                    }}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-secondary rounded-lg transition-all"
                  >
                    <Edit2 size={12} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
    </Modal>
  );
}
