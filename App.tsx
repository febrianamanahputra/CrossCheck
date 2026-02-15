import React, { useState, useEffect } from 'react';
import { AppState, Tab, LocationData } from './types.ts';
import { INITIAL_CATEGORIES, DEFAULT_AVATARS } from './constants.ts';
import { TopBar } from './components/TopBar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { ReportView } from './views/ReportView.tsx';
import { NoteView } from './views/NoteView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { ExpenseView } from './views/ExpenseView.tsx';
import { ProfileView } from './views/ProfileView.tsx';

const createEmptyLocation = (id: string, name: string): LocationData => ({
  id,
  name,
  inventory: [
      { id: '1', name: 'Semen', qty: 50, unit: 'Zak', icon: 'package' },
      { id: '2', name: 'Pasir', qty: 2, unit: 'M3', icon: 'shovel' }
  ],
  requests: [], // Initialize empty requests
  report: {
    plan: Array(5).fill(null).map((_, i) => ({ id: `p${i}`, text: '', photos: [] })),
    progress: Array(5).fill(null).map((_, i) => ({ id: `pg${i}`, text: '', photos: [] })),
    photos: []
  },
  projectProgress: {
    manpower: 0,
    weather: 'Cerah',
    categories: [...INITIAL_CATEGORIES]
  },
  funds: [
      { id: 'f1', number: '001', items: [] }
  ]
});

const INITIAL_STATE: AppState = {
  currentLocationId: 'loc1',
  locations: {
    loc1: createEmptyLocation('loc1', 'Lokasi 1'),
    loc2: createEmptyLocation('loc2', 'Lokasi 2')
  },
  userAvatar: DEFAULT_AVATARS[0],
  userName: 'Febrian Renovki',
  quickNotes: [],
  quickLinks: [],
  managedProjectsCount: 2
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
        const saved = localStorage.getItem('renovki_dashboard_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Robust validation to prevent white screen
            if (parsed && parsed.locations && Object.keys(parsed.locations).length > 0) {
                // Ensure current location exists
                if (!parsed.locations[parsed.currentLocationId]) {
                    parsed.currentLocationId = Object.keys(parsed.locations)[0];
                }
                
                // Ensure requests array exists (migration)
                Object.keys(parsed.locations).forEach(key => {
                    if (!parsed.locations[key].requests) {
                        parsed.locations[key].requests = [];
                    }
                    // Ensure funds exist
                    if (!parsed.locations[key].funds) {
                        parsed.locations[key].funds = [{ id: 'f1', number: '001', items: [] }];
                    }
                });

                // Ensure userName exists (migration)
                if (!parsed.userName) {
                    parsed.userName = 'Febrian Renovki';
                }
                
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
    return INITIAL_STATE;
  });

  const [currentTab, setCurrentTab] = useState<Tab>('note');
  const [isMenuHidden, setMenuHidden] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('renovki_dashboard_state', JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, [state]);

  // Error Boundary for rendering
  if (hasError) {
      return (
          <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">Terjadi Kesalahan</h2>
              <p className="text-gray-500 text-sm mb-4">Aplikasi mengalami masalah saat memuat data.</p>
              <button 
                onClick={() => {
                    localStorage.removeItem('renovki_dashboard_state');
                    window.location.reload();
                }}
                className="bg-primary text-white px-4 py-2 rounded-xl font-bold"
              >
                Reset Data & Reload
              </button>
          </div>
      );
  }

  const updateCurrentLocationData = (updates: Partial<LocationData>) => {
    setState(prev => ({
      ...prev,
      locations: {
        ...prev.locations,
        [prev.currentLocationId]: {
          ...prev.locations[prev.currentLocationId],
          ...updates
        }
      }
    }));
  };

  const renderContent = () => {
    try {
        const currentData = state.locations[state.currentLocationId];
        if (!currentData) {
            // Self-healing if location missing
            if (Object.keys(state.locations).length > 0) {
                const firstKey = Object.keys(state.locations)[0];
                setState(prev => ({ ...prev, currentLocationId: firstKey }));
                return <div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;
            }
            return <div className="p-10 text-center text-gray-500">Lokasi tidak ditemukan.</div>;
        }
        
        switch (currentTab) {
          case 'report':
            return <ReportView data={currentData} updateData={updateCurrentLocationData} setMenuHidden={setMenuHidden} />;
          case 'note':
            return <NoteView data={currentData} updateData={updateCurrentLocationData} userName={state.userName} userAvatar={state.userAvatar} setMenuHidden={setMenuHidden} />;
          case 'progress':
            return <ProgressView data={currentData} updateData={updateCurrentLocationData} />;
          case 'dana':
            return <ExpenseView data={currentData} updateData={updateCurrentLocationData} />;
          case 'profile':
            return <ProfileView state={state} setState={setState} setMenuHidden={setMenuHidden} />;
          default:
            return null;
        }
    } catch (err) {
        console.error("Render error:", err);
        setHasError(true);
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden md:rounded-xl">
      <TopBar state={state} setState={setState} setMenuHidden={setMenuHidden} />
      
      {/* Scrollable Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderContent()}
        </div>
      </main>

      {!isMenuHidden && (
        <BottomNav 
          currentTab={currentTab} 
          setTab={setCurrentTab} 
          userAvatar={state.userAvatar} 
        />
      )}
    </div>
  );
};

export default App;