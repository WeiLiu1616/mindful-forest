import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface FocusSession {
  duration: number;
  date: string;
}

interface FocusCalendarProps {
  sessions: FocusSession[];
  onViewDiary?: (date: string) => void;
}

const FocusCalendar = ({ sessions, onViewDiary }: FocusCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const sessionMap = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.date] = (map[s.date] || 0) + s.duration;
    });
    return map;
  }, [sessions]);

  // Count sessions per date
  const sessionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.date] = (map[s.date] || 0) + 1;
    });
    return map;
  }, [sessions]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h${m}m`;
    return `${m}m`;
  };

  const maxDuration = Math.max(...Object.values(sessionMap), 1);

  const getIntensity = (secs: number) => {
    if (secs === 0) return 0;
    const ratio = secs / maxDuration;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  const intensityColors: Record<number, string> = {
    0: 'bg-transparent',
    1: 'bg-nature-green/20',
    2: 'bg-nature-green/40',
    3: 'bg-nature-green/60',
    4: 'bg-nature-green/80',
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date().toISOString().split('T')[0];

  const totalThisMonth = useMemo(() => {
    const prefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    return Object.entries(sessionMap)
      .filter(([date]) => date.startsWith(prefix))
      .reduce((acc, [, dur]) => acc + dur, 0);
  }, [sessionMap, year, month]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {year}年{month + 1}月
        </h3>
        <div className="flex items-center gap-1">
          <span className="mr-3 text-xs text-muted-foreground">
            本月专注 {formatDuration(totalThisMonth)}
          </span>
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const duration = sessionMap[dateStr] || 0;
          const count = sessionCountMap[dateStr] || 0;
          const intensity = getIntensity(duration);
          const isToday = dateStr === today;

          return (
            <div
              key={day}
              className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${intensityColors[intensity]} ${
                isToday ? 'ring-2 ring-nature-green/50' : ''
              }`}
            >
              <span className={`font-medium ${duration > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {day}
              </span>
              {duration > 0 && (
                <>
                  <span className="text-[10px] text-nature-green font-medium">{formatDuration(duration)}</span>
                  {/* Session count dots */}
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(count, 4) }).map((_, idx) => (
                      <div key={idx} className="h-1 w-1 rounded-full bg-nature-green" />
                    ))}
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-nature-dark px-2.5 py-1.5 text-xs text-nature-dark-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    专注 {count}次 · {formatDuration(duration)}
                  </div>
                </>
              )}
              {/* Diary link button */}
              {onViewDiary && (
                <button
                  onClick={() => onViewDiary(dateStr)}
                  className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded text-muted-foreground/0 transition-all group-hover:text-nature-gold hover:!text-nature-green"
                  title={`查看 ${dateStr} 的日记`}
                >
                  <BookOpen size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>少</span>
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className={`h-3 w-3 rounded ${intensityColors[level]}`} />
          ))}
          <span>多</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen size={12} />
          <span>悬停日期可跳转日记</span>
        </div>
      </div>
    </div>
  );
};

export default FocusCalendar;
