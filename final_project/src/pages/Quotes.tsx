import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { Plus, Trash2, Quote as QuoteIcon, Copy, Sparkles, Check, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn, hapticFeedback } from "@/lib/utils";
import { ARABIC_QUOTES } from "@/data/quotes";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export function QuotesPage() {
  const { userQuotes, addUserQuote, deleteUserQuote } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: "", author: "", source: "", reflection: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyQuote, setDailyQuote] = useState(ARABIC_QUOTES[0]);
  
  useLockBodyScroll(isAddOpen);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ARABIC_QUOTES.length);
    setDailyQuote(ARABIC_QUOTES[randomIndex]);
  }, []);

  const filteredQuotes = userQuotes.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.source && q.source.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = () => {
    if (!newQuote.text) return;
    addUserQuote({
      text: newQuote.text,
      author: newQuote.author || "مجهول",
      source: newQuote.source,
      reflection: newQuote.reflection,
    });
    setNewQuote({ text: "", author: "", source: "", reflection: "" });
    setIsAddOpen(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string, author: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'اقتباس ملهم',
          text: `"${text}"\n- ${author}`,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopy(`"${text}"\n- ${author}`, 'share');
    }
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-2xl mx-auto min-h-screen font-sans">
      {/* Apple-style Header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="ios-large-title">اقتباساتي</h1>
          <p className="text-muted-foreground mt-1 font-medium">كلمات تلامس الروح وتلهم العقل</p>
        </div>
        <div className="flex gap-3 mb-1">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={26} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-8 relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="ابحث في اقتباساتك..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ios-input pr-12"
        />
      </div>

      {/* Quote of the Day */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-6 rounded-[2rem] bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 relative overflow-hidden group"
        >
          <Sparkles className="absolute -top-6 -left-6 text-primary/5 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} />
                اقتباس
              </span>
              <button 
                onClick={() => handleCopy(dailyQuote.text, 'daily')}
                className="h-8 w-8 flex items-center justify-center text-primary/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                {copiedId === 'daily' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xl font-serif leading-relaxed text-foreground/90 italic mb-4">
              "{dailyQuote.text}"
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-primary/20" />
              <span className="text-xs font-bold text-muted-foreground">{dailyQuote.author}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="columns-1 gap-6 space-y-6">
        {filteredQuotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-24 px-8 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150" />
              <div className="relative h-24 w-24 rounded-[2rem] bg-card border border-border/50 flex items-center justify-center shadow-xl shadow-primary/5">
                <QuoteIcon className="h-10 w-10 text-primary/20 -rotate-12" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {searchQuery ? "لم نجد ما تبحث عنه" : "مساحتك الخاصة للإلهام"}
            </h3>
            <p className="text-muted-foreground max-w-[280px] leading-relaxed mb-10">
              {searchQuery 
                ? "جرب البحث بكلمات مفتاحية مختلفة أو تحقق من الإملاء" 
                : "ابدأ بتدوين الكلمات التي تلامس قلبك وتغير نظرتك للحياة. كل اقتباس هو نافذة جديدة."}
            </p>
            
            {!searchQuery && (
              <button 
                onClick={() => setIsAddOpen(true)}
                className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3"
              >
                <Plus size={20} />
                أضف اقتباسك الأول
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredQuotes.map((quote, i) => (
              <motion.div
                layout
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="break-inside-avoid group relative ios-card p-8 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-6 mb-6 border-primary/5"
              >
                <QuoteIcon className="absolute top-6 right-6 text-primary/5 -rotate-12" size={60} />
                
                <p className="text-2xl font-serif leading-[1.6] text-foreground/90 relative z-10 italic">
                  "{quote.text}"
                </p>
                
                {quote.reflection && (
                  <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/10 mt-2 relative z-10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-bold text-primary block mb-2 text-xs uppercase tracking-widest">تأملاتي:</span>
                      {quote.reflection}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 relative z-10 border-t border-border/40">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-foreground">{quote.author}</span>
                    {quote.source && (
                      <span className="text-xs text-muted-foreground/80 font-medium mt-0.5">{quote.source}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleCopy(quote.text, quote.id)}
                      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      title="نسخ"
                    >
                      {copiedId === quote.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={() => deleteUserQuote(quote.id)}
                      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* iOS Style Add Quote Sheet */}
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
                  <h3 className="font-bold text-xl">إضافة اقتباس</h3>
                  <button 
                    onClick={handleAdd}
                    disabled={!newQuote.text}
                    className="text-primary font-semibold text-lg disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
                
                {/* iOS Grouped Form */}
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 p-4">
                    <textarea
                      autoFocus
                      value={newQuote.text}
                      onChange={e => setNewQuote({ ...newQuote, text: e.target.value })}
                      placeholder="اكتب الاقتباس هنا..."
                      className="w-full min-h-[120px] bg-transparent text-lg font-medium resize-none outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
                    <div className="flex items-center px-4 py-3 border-b border-border/50">
                      <span className="text-sm font-semibold w-20 text-muted-foreground">القائل</span>
                      <input
                        value={newQuote.author}
                        onChange={e => setNewQuote({ ...newQuote, author: e.target.value })}
                        placeholder="اسم القائل"
                        className="flex-1 bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="flex items-center px-4 py-3">
                      <span className="text-sm font-semibold w-20 text-muted-foreground">المصدر</span>
                      <input
                        value={newQuote.source}
                        onChange={e => setNewQuote({ ...newQuote, source: e.target.value })}
                        placeholder="اسم الكتاب أو المرجع (اختياري)"
                        className="flex-1 bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 p-4">
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">ماذا فهمت من الاقتباس؟ (اختياري)</label>
                    <textarea
                      value={newQuote.reflection}
                      onChange={e => setNewQuote({ ...newQuote, reflection: e.target.value })}
                      placeholder="تأملاتك وأفكارك حول هذا الاقتباس..."
                      className="w-full min-h-[80px] bg-transparent text-sm font-medium resize-none outline-none placeholder:text-muted-foreground/50"
                    />
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

