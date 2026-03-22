import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FocusTimer from '@/components/FocusTimer';
import DiaryEditor from '@/components/DiaryEditor';
import FocusCalendar from '@/components/FocusCalendar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FocusSession {
  duration: number;
  date: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focus-sessions', []);

  const handleSessionComplete = useCallback((duration: number, date: string) => {
    setSessions((prev) => [...prev, { duration, date }]);
  }, [setSessions]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HeroSection onStart={() => setActiveTab('focus')} />;
      case 'focus':
        return (
          <div className="flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
            <div className="w-full max-w-md animate-fade-up">
              <h2 className="mb-8 text-center font-serif text-2xl font-semibold text-foreground">专注时刻</h2>
              <FocusTimer onSessionComplete={handleSessionComplete} />
            </div>
          </div>
        );
      case 'diary':
        return (
          <div className="mx-auto min-h-screen max-w-4xl px-4 pt-24 pb-12">
            <h2 className="mb-6 animate-fade-up font-serif text-2xl font-semibold text-foreground">我的日记</h2>
            <div className="animate-fade-up-delay-1">
              <DiaryEditor />
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="mx-auto min-h-screen max-w-2xl px-4 pt-24 pb-12">
            <h2 className="mb-6 animate-fade-up font-serif text-2xl font-semibold text-foreground">专注记录</h2>
            <div className="animate-fade-up-delay-1">
              <FocusCalendar sessions={sessions} />
            </div>
            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 animate-fade-up-delay-2">
              {[
                { label: '总专注次数', value: sessions.length },
                { label: '总时长', value: `${Math.floor(sessions.reduce((a, s) => a + s.duration, 0) / 60)}分钟` },
                { label: '今日专注', value: `${Math.floor(sessions.filter((s) => s.date === new Date().toISOString().split('T')[0]).reduce((a, s) => a + s.duration, 0) / 60)}分钟` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                  <div className="font-serif text-2xl font-semibold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default Index;
