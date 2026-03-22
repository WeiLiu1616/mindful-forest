import { Leaf } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'focus', label: '专注' },
  { id: 'diary', label: '日记' },
  { id: 'calendar', label: '日历' },
];

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="flex items-center gap-2">
        <Leaf size={20} className="text-nature-green" />
        <span className="font-serif text-lg font-semibold text-foreground">静心</span>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-card/80 p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-20" />
    </nav>
  );
};

export default Navbar;
