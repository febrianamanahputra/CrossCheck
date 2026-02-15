import React from 'react';
import { ClipboardList, NotebookPen, TrendingUp, Wallet } from 'lucide-react';
import { Tab } from '../types.ts';

interface BottomNavProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  userAvatar: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab, userAvatar }) => {
  const navItems: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'note', icon: NotebookPen, label: 'Note' },
    { id: 'report', icon: ClipboardList, label: 'Report' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'dana', icon: Wallet, label: 'Dana' },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md z-50 px-4 pb-6 pt-0 pointer-events-none">
       {/* Glass container */}
       <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-3xl px-1 py-3 flex items-center justify-between pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="group flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 relative flex-1 active:scale-90"
            >
              <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                 <Icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive 
                      ? 'text-primary stroke-[2.5px] drop-shadow-sm' 
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
              </div>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in zoom-in duration-300 shadow-[0_0_10px_rgba(0,119,182,0.8)]"></div>
              )}
            </button>
          );
        })}
        
        {/* Profile Avatar */}
        <button
          onClick={() => setTab('profile')}
          className="flex-1 flex justify-center p-1 transition-all duration-300 active:scale-90"
        >
          <div className={`w-9 h-9 rounded-full overflow-hidden transition-all duration-300 ${currentTab === 'profile' ? 'ring-2 ring-primary ring-offset-2' : 'ring-2 ring-white shadow-sm opacity-80'}`}>
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </button>
      </div>
    </div>
  );
};