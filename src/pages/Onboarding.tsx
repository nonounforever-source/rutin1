import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { Sun, Moon, Bell, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingPage() {
  const { settings, updateSettings } = useApp();
  const [wakeTime, setWakeTime] = useState(settings.wakeTime || "06:00");
  const [sleepTime, setSleepTime] = useState(settings.sleepTime || "22:30");
  const [notifications, setNotifications] = useState(settings.notifications || false);

  const handleFinish = () => {
    updateSettings({
      wakeTime,
      sleepTime,
      notifications,
      isFirstTime: false,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-900 text-foreground flex flex-col items-center justify-center p-6 font-sans direction-rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md ios-card p-8 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">أهلاً بك في أساسياتي</h1>
          <p className="text-muted-foreground font-medium">لنقم بضبط أوقاتك الأساسية لنساعدك في بناء أساسياتك اليومية.</p>
        </div>

        <div className="space-y-6">
          {/* Wake Time */}
          <div className="bg-secondary/40 rounded-2xl p-4 flex items-center justify-between border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Sun size={20} />
              </div>
              <div>
                <h3 className="font-bold">وقت الاستيقاظ</h3>
                <p className="text-xs text-muted-foreground font-medium">متى تبدأ يومك عادةً؟</p>
              </div>
            </div>
            <input 
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="bg-secondary/50 border-none rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 font-black font-number text-lg"
            />
          </div>

          {/* Sleep Time */}
          <div className="bg-secondary/40 rounded-2xl p-4 flex items-center justify-between border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Moon size={20} />
              </div>
              <div>
                <h3 className="font-bold">وقت النوم</h3>
                <p className="text-xs text-muted-foreground font-medium">متى تنهي يومك؟</p>
              </div>
            </div>
            <input 
              type="time" 
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="bg-secondary/50 border-none rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 font-black font-number text-lg"
            />
          </div>

          {/* Notifications */}
          <div className="bg-secondary/40 rounded-2xl p-4 flex items-center justify-between border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold">الإشعارات</h3>
                <p className="text-xs text-muted-foreground font-medium">تذكير بالأساسيات ووقت النوم</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                notifications ? "bg-emerald-500" : "bg-secondary"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                notifications ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleFinish}
          className="ios-button-primary w-full mt-10 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          البدء
          <ChevronLeft size={20} />
        </button>
      </motion.div>
    </div>
  );
}
