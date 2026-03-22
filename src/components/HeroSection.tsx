import heroImage from '@/assets/hero-nature.jpg';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="宁静的自然风景"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1
          className="animate-fade-up font-serif text-5xl font-bold tracking-tight text-foreground md:text-7xl"
          style={{ lineHeight: 1.1, textShadow: '0 2px 20px hsla(var(--background), 0.5)' }}
        >
          静心专注
        </h1>
        <p className="animate-fade-up-delay-1 max-w-md text-base text-muted-foreground md:text-lg" style={{ textShadow: '0 1px 10px hsla(var(--background), 0.8)' }}>
          在自然的宁静中，找到内心的秩序。<br />记录每一刻的专注与成长。
        </p>
        <button
          onClick={onStart}
          className="animate-fade-up-delay-2 mt-4 rounded-full bg-primary px-8 py-3.5 font-serif text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
          开始专注
        </button>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up-delay-3">
        <ArrowDown size={20} className="animate-bounce text-muted-foreground" />
      </div>

      {/* Bottom dark bar inspired by reference */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-nature-dark/90 px-8 py-4 backdrop-blur-sm">
        <span className="font-serif text-xs text-nature-dark-foreground/60">静心 · Focus</span>
        <span className="text-xs text-nature-dark-foreground/40">专注 · 日记 · 成长</span>
        <span className="text-xs text-nature-dark-foreground/40">让每一刻都有意义</span>
      </div>
    </section>
  );
};

export default HeroSection;
