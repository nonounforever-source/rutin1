import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { useApp, JournalEntry } from "@/lib/store";
import { 
  Search, Plus, Pin, Trash2, Palette, 
  ListOrdered, X, Image as ImageIcon,
  LayoutGrid, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const COLORS = [
  { id: "default", bg: "bg-card", border: "border-border/40" },
  { id: "red", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20" },
  { id: "orange", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
  { id: "yellow", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20" },
  { id: "green", bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/20" },
  { id: "teal", bg: "bg-teal-50 dark:bg-teal-500/10", border: "border-teal-200 dark:border-teal-500/20" },
  { id: "blue", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  { id: "purple", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20" },
];

export function JournalPage() {
  // --- App State & Context ---
  const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();

  // --- Local UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [initialContent, setInitialContent] = useState<string>("");
  
  useLockBodyScroll(isEditorOpen);

  // --- Computed Data ---
  // Filtered Notes based on search query
  const filteredJournal = journal.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredJournal.filter(j => j.isPinned);
  const otherNotes = filteredJournal.filter(j => !j.isPinned);

  const handleCreateNew = (startWithList: boolean = false) => {
    setSelectedEntry(null);
    setInitialContent(startWithList ? "- " : "");
    setIsEditorOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setInitialContent(entry.content);
    setIsEditorOpen(true);
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-5xl mx-auto min-h-screen font-sans">
      {/* Apple-style Header */}
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 font-number">
            {journal.length} ملاحظات
          </p>
          <h1 className="ios-large-title">التدوين</h1>
        </div>
        <div className="flex gap-3 mb-1">
          <button 
            onClick={() => handleCreateNew()}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={22} />
          </button>
        </div>
      </header>

      {/* iOS Search Bar */}
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في مذكراتك..." 
          className="ios-input pr-12"
        />
      </div>

      {/* Notes Grid (Masonry Layout) */}
      <div className="columns-1 gap-4 space-y-4">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="break-inside-avoid-column mb-6 w-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-3 px-2 flex items-center gap-1.5">
              <Pin size={14} className="fill-current" />
              المثبتة
            </h3>
            <div className="flex flex-col gap-4">
              {pinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onClick={() => handleEdit(note)} 
                  onPin={() => updateJournalEntry(note.id, { isPinned: !note.isPinned })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Notes */}
        {otherNotes.length > 0 && (
          <>
            {pinnedNotes.length > 0 && (
              <h3 className="text-sm font-bold text-muted-foreground mb-3 px-2 break-inside-avoid-column w-full mt-2">
                ملاحظات
              </h3>
            )}
            {otherNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onClick={() => handleEdit(note)} 
                onPin={() => updateJournalEntry(note.id, { isPinned: !note.isPinned })}
              />
            ))}
          </>
        )}

        {journal.length === 0 && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
             className="break-inside-avoid-column flex flex-col items-center justify-center py-20 text-muted-foreground ios-card w-full"
           >
             <LayoutGrid size={48} className="opacity-20 mb-4" />
             <p className="font-semibold text-lg text-foreground">لا توجد ملاحظات</p>
             <p className="text-sm mt-1 mb-6">ابدأ بتدوين أفكارك ويومياتك</p>
             <button 
               onClick={() => handleCreateNew()}
               className="text-primary font-bold hover:opacity-70 transition-opacity"
             >
               تدوين ملاحظة جديدة
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
            <Editor 
              initialData={selectedEntry} 
              initialContent={initialContent}
              onClose={() => setIsEditorOpen(false)} 
              onSave={(data) => {
                if (selectedEntry) {
                  updateJournalEntry(selectedEntry.id, data);
                } else {
                  addJournalEntry({
                    ...data,
                    mood: "",
                    tags: [],
                    date: new Date().toISOString().split("T")[0],
                  });
                }
                setIsEditorOpen(false);
              }}
              onDelete={(id) => {
                if (id) deleteJournalEntry(id);
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

function NoteCard({ note, onClick, onPin }: { note: JournalEntry; onClick: () => void; onPin: () => void }) {
  const color = COLORS.find(c => c.id === note.color) || COLORS[0];

  return (
    <motion.div
      layoutId={`note-${note.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "group relative break-inside-avoid-column ios-card overflow-hidden transition-all cursor-pointer hover:shadow-xl mb-4 active:scale-[0.98] border-none",
        color.bg,
        color.id !== "default" && "border border-border/20"
      )}
    >
      {/* Cover Image */}
      {note.coverImage && (
        <div className="-mx-4 -mt-4 mb-4 h-48 relative overflow-hidden">
          <img 
            src={note.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className={cn("font-bold text-xl leading-tight truncate", !note.title && "text-muted-foreground italic")}>
            {note.title || "بدون عنوان"}
          </h3>
          <button 
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className={cn(
              "p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2",
              note.isPinned ? "opacity-100 bg-primary/10 text-primary" : "hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            <Pin size={16} className={cn(note.isPinned && "fill-current")} />
          </button>
        </div>
        
        <div className="text-[15px] text-foreground/80 leading-relaxed font-medium line-clamp-[8]">
          <ReactMarkdown 
            components={{
              img: ({node, ...props}) => props.src ? <img {...props} className="rounded-xl max-w-full h-auto my-2 border border-border/20" referrerPolicy="no-referrer" /> : null,
              p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
              ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside mb-2" />,
              ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside mb-2" />,
              li: ({node, ...props}) => <li {...props} className="mb-1" />,
              a: ({node, ...props}) => <a {...props} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer" />,
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {note.tags.map(tag => (
              <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-full text-foreground/70">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-xs font-medium text-muted-foreground/80">
          {note.date}
        </div>
      </div>
    </motion.div>
  );
}

function Editor({ initialData, initialContent, onClose, onSave, onDelete }: { 
  initialData: JournalEntry | null, 
  initialContent: string,
  onClose: () => void, 
  onSave: (data: any) => void,
  onDelete: (id?: string) => void
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialContent || "");
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [color, setColor] = useState(initialData?.color || "default");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [showColors, setShowColors] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeColor = COLORS.find(c => c.id === color) || COLORS[0];

  // Auto-focus textarea on open
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  const handleSave = () => {
    if (!title.trim() && !content.trim() && !coverImage) {
      onClose();
      return;
    }
    onSave({ title, content, isPinned, color, coverImage });
  };

  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const prefix = text.substring(0, start).endsWith("\n") || start === 0 ? "- " : "\n- ";
    const newText = text.substring(0, start) + prefix + text.substring(end);
    const newCursorPos = start + prefix.length;

    setContent(newText);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCoverImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "w-full max-w-3xl h-[90dvh] sm:h-[85vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden transition-colors relative z-10",
        activeColor.bg === "bg-card" ? "bg-secondary/95 backdrop-blur-xl" : activeColor.bg
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 shrink-0">
        <button onClick={onClose} className="text-primary font-semibold text-lg flex items-center gap-1">
          <ChevronLeft size={24} className="-ml-1" />
          رجوع
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isPinned ? "bg-primary/10 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
            )}
            title="تثبيت الملاحظة"
          >
            <Pin size={20} className={cn(isPinned && "fill-current")} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowColors(!showColors)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-muted-foreground"
              title="تغيير اللون"
            >
              <Palette size={20} />
            </button>
            {showColors && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-popover rounded-2xl shadow-xl border border-border flex gap-2 z-50 min-w-[220px] flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setColor(c.id); setShowColors(false); }}
                    className={cn(
                      "w-8 h-8 rounded-full border border-black/10",
                      c.bg,
                      color === c.id && "ring-2 ring-primary ring-offset-2"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {initialData && (
            <button 
              onClick={() => onDelete(initialData.id)}
              className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
              title="حذف الملاحظة"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={handleSave}
            className="text-primary font-bold text-lg ml-2"
          >
            تم
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col p-6 pt-2">
        {/* Cover Image Preview */}
        {coverImage && (
          <div className="relative h-48 sm:h-64 shrink-0 group rounded-2xl overflow-hidden mb-6 border border-border/20">
            <img 
              src={coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setCoverImage("")}
              className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="العنوان"
          className="w-full bg-transparent text-3xl font-bold placeholder:text-muted-foreground/40 border-none outline-none mb-4 shrink-0 text-foreground"
        />
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب ملاحظتك هنا..."
          className="w-full flex-1 bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground/40 border-none outline-none resize-none text-foreground/90 font-medium min-h-[200px]"
        />
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 border-t border-border/20 bg-background/50 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
         <div className="flex items-center gap-2">
            <button onClick={insertList} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-muted-foreground transition-colors" title="قائمة نقطية">
              <ListOrdered size={20} />
            </button>
            
            <button onClick={() => coverInputRef.current?.click()} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-muted-foreground transition-colors" title="صورة عرض">
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleCoverUpload}
            />
         </div>
         <div className="text-xs font-semibold text-muted-foreground">
           {content.length} حرف
         </div>
      </div>
    </motion.div>
  );
}
