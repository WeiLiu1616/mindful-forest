import { useState } from 'react';
import { BookOpen, Save, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}

const DiaryEditor = () => {
  const [entries, setEntries] = useLocalStorage<DiaryEntry[]>('diary-entries', []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const activeEntry = entries.find((e) => e.id === activeId);

  const createEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const id = Date.now().toString();
    const entry: DiaryEntry = { id, date: today, content: '', createdAt: new Date().toISOString() };
    setEntries([entry, ...entries]);
    setActiveId(id);
    setContent('');
  };

  const saveEntry = () => {
    if (!activeId) return;
    setEntries(entries.map((e) => (e.id === activeId ? { ...e, content } : e)));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setContent('');
    }
  };

  const selectEntry = (entry: DiaryEntry) => {
    setActiveId(entry.id);
    setContent(entry.content);
  };

  return (
    <div className="flex h-[500px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-border bg-muted/30">
        <div className="flex items-center justify-between p-4">
          <h3 className="flex items-center gap-2 font-serif text-sm font-semibold text-foreground">
            <BookOpen size={16} /> 日记本
          </h3>
          <button
            onClick={createEntry}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-2" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => selectEntry(entry)}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                activeId === entry.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <div>
                <div className="font-medium">{entry.date}</div>
                <div className="mt-0.5 line-clamp-1 text-xs opacity-70">
                  {entry.content.slice(0, 30) || '空白日记'}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                className="hidden h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive group-hover:flex"
              >
                <Trash2 size={12} />
              </button>
            </button>
          ))}
          {entries.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              点击 + 创建第一篇日记
            </p>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col">
        {activeEntry ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-serif text-sm text-muted-foreground">{activeEntry.date}</span>
              <button
                onClick={saveEntry}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                <Save size={12} /> 保存
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下今天的思考与感悟..."
              className="flex-1 resize-none bg-transparent p-5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              style={{ overflowWrap: 'break-word' }}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <BookOpen size={32} className="opacity-30" />
            <p className="text-sm">选择或创建一篇日记</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEditor;
