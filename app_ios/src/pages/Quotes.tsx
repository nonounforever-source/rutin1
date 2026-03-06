import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/store";

const CATEGORIES = ["الكل", "نجاح", "تحفيز", "عادات", "تطوير", "إيمان", "صبر", "قوة", "وقت", "علاقات"];

export function QuotesPage() {
  const { state, dispatch } = useApp();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Pick a daily quote based on the day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyQuote = state.quotes[dayOfYear % state.quotes.length];

  const filtered = state.quotes.filter((q) => {
    if (showFavOnly && !q.favorite) return false;
    if (activeCategory !== "الكل" && q.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 px-4 pt-14 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="ios-large-title">إلهام</h1>
        <button
          onClick={() => setShowFavOnly(!showFavOnly)}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
            showFavOnly ? "bg-yellow-400/20 text-yellow-500" : "bg-secondary text-muted-foreground"
          }`}
        >
          ♥ المفضلة
        </button>
      </div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ios-card p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
      >
        <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">اقتباس اليوم</p>
        <p className="text-lg font-bold text-foreground leading-relaxed mb-3">❝ {dailyQuote.text} ❞</p>
        <p className="text-muted-foreground text-sm font-medium">— {dailyQuote.author}</p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ direction: "rtl" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((quote, i) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="ios-card p-5 flex gap-3"
            >
              <div className="flex-1">
                <p className="text-foreground font-semibold leading-relaxed mb-2">❝ {quote.text} ❞</p>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">— {quote.author}</p>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{quote.category}</span>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: "TOGGLE_QUOTE_FAVORITE", payload: quote.id })}
                className={`text-xl transition-all active:scale-90 ${quote.favorite ? "text-yellow-400" : "text-muted-foreground/40"}`}
              >
                {quote.favorite ? "♥" : "♡"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">❝</div>
            <p>لا توجد اقتباسات في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  );
}
