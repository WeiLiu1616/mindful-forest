import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Clock } from 'lucide-react';

type TimerMode = 'countdown' | 'countup';

interface FocusTimerProps {
  onSessionComplete?: (duration: number, date: string) => void;
}

const PRESET_MINUTES = [15, 25, 45, 60];

const FocusTimer = ({ onSessionComplete }: FocusTimerProps) => {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playAlert = useCallback(() => {
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;
      // Play a pleasant chime sequence
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = delay === 0.3 ? 660 : 520;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.8);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.8);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      if (mode === 'countdown') {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlert();
            onSessionComplete?.(countdownMinutes * 60, new Date().toISOString().split('T')[0]);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, countdownMinutes, playAlert, onSessionComplete]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'countdown' ? 1 - seconds / (countdownMinutes * 60) : 0;
  const displayTime = mode === 'countdown' ? seconds : elapsed;

  const reset = () => {
    setIsRunning(false);
    if (mode === 'countup' && elapsed > 60) {
      onSessionComplete?.(elapsed, new Date().toISOString().split('T')[0]);
    }
    setSeconds(countdownMinutes * 60);
    setElapsed(0);
  };

  const toggleMode = (m: TimerMode) => {
    setIsRunning(false);
    setMode(m);
    setSeconds(countdownMinutes * 60);
    setElapsed(0);
  };

  const circumference = 2 * Math.PI * 120;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Toggle */}
      <div className="flex gap-2 rounded-full bg-card p-1 shadow-sm">
        <button
          onClick={() => toggleMode('countdown')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
            mode === 'countdown' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Timer size={16} /> 倒计时
        </button>
        <button
          onClick={() => toggleMode('countup')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
            mode === 'countup' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={16} /> 正计时
        </button>
      </div>

      {/* Presets for countdown */}
      {mode === 'countdown' && !isRunning && (
        <div className="flex gap-3 animate-fade-up">
          {PRESET_MINUTES.map((m) => (
            <button
              key={m}
              onClick={() => { setCountdownMinutes(m); setSeconds(m * 60); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                countdownMinutes === m
                  ? 'bg-nature-green text-secondary-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:shadow-sm'
              }`}
            >
              {m}分钟
            </button>
          ))}
        </div>
      )}

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center">
        {isRunning && (
          <div className="absolute inset-0 rounded-full border-2 border-nature-green/30 animate-pulse-ring" 
               style={{ width: 272, height: 272, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        )}
        <svg width="272" height="272" className="transform -rotate-90">
          <circle cx="136" cy="136" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          {mode === 'countdown' && (
            <circle
              cx="136" cy="136" r="120" fill="none"
              stroke="hsl(var(--nature-green))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-serif text-5xl font-semibold tracking-tight tabular-nums text-foreground" style={{ lineHeight: 1.1 }}>
            {formatTime(displayTime)}
          </span>
          <span className="mt-2 text-sm text-muted-foreground">
            {mode === 'countdown' ? '专注倒计时' : '已专注时间'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:text-foreground active:scale-95"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <div className="w-12" />
      </div>
    </div>
  );
};

export default FocusTimer;
