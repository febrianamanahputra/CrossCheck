import React, { useState } from 'react';
import { User, Briefcase, RefreshCw, ChevronRight, Edit3, MessageCircle } from 'lucide-react';
import { AppState } from '../types.ts';
import { DEFAULT_AVATARS } from '../constants.ts';
import { AutoInput } from '../components/ui/AutoInput.tsx';

interface ProfileViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setMenuHidden: (hidden: boolean) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ state, setState, setMenuHidden }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(state.userName);

  const toggleModal = (show: boolean) => {
    setShowProjectModal(show);
    setMenuHidden(show);
  };
  
  const toggleNameModal = (show: boolean) => {
    setShowNameModal(show);
    setMenuHidden(show);
    if (show) setTempName(state.userName);
  };

  const changeAvatar = () => {
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    setState(prev => ({ ...prev, userAvatar: randomAvatar }));
  };

  const updateProjectCount = (count: number) => {
    setState(prev => ({ ...prev, managedProjectsCount: count }));
    toggleModal(false);
  };

  const updateName = () => {
      if (tempName.trim()) {
          setState(prev => ({ ...prev, userName: tempName }));
      }
      toggleNameModal(false);
  }

  const contactSupport = () => {
      window.open('https://wa.me/6285255002368', '_blank');
  };

  return (
    <div className="pt-10 px-6 space-y-8 flex flex-col items-center">
        <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-primary/10 p-1 bg-white">
                <img src={state.userAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <button 
                onClick={changeAvatar}
                className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-secondary active:scale-95 transition-all"
            >
                <RefreshCw size={16} />
            </button>
        </div>

        <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">{state.userName}</h2>
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
                Site Manager
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
            <div 
                onClick={() => toggleModal(true)}
                className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="p-3 bg-blue-50 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <span className="block text-3xl font-bold text-gray-900">{state.managedProjectsCount}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Proyek</span>
                </div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex flex-col items-center gap-3">
                <div className="p-3 bg-green-50 rounded-2xl text-green-500">
                    <User className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <span className="block text-3xl font-bold text-gray-900">Active</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</span>
                </div>
            </div>
        </div>
        
        <div className="w-full bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden">
            <button 
                onClick={() => toggleNameModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-primary">
                        <Edit3 size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Ubah Nama Profil</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button 
                onClick={contactSupport}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-xl text-green-600">
                        <MessageCircle size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Bantuan & Support</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
            </button>
        </div>

        {/* Project Count Modal */}
        {showProjectModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl text-center animate-in zoom-in duration-200">
                    <h3 className="font-bold text-lg mb-6 text-gray-800">Update Jumlah Proyek</h3>
                    <div className="relative w-24 mx-auto mb-8">
                        <AutoInput
                            type="number"
                            defaultValue={state.managedProjectsCount}
                            className="w-full text-center text-4xl font-bold border-b-2 border-primary pb-2 focus:outline-none bg-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateProjectCount(parseInt((e.target as HTMLInputElement).value) || 0);
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={() => updateProjectCount(state.managedProjectsCount)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        )}

        {/* Edit Name Modal */}
        {showNameModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl text-center animate-in zoom-in duration-200">
                    <h3 className="font-bold text-lg mb-6 text-gray-800">Ubah Nama</h3>
                    <div className="relative w-full mx-auto mb-8">
                        <AutoInput
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full text-center text-xl font-bold border-b-2 border-primary pb-2 focus:outline-none bg-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateName();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={updateName}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};