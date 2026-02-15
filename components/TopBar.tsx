import React, { useState } from 'react';
import { Heart, Send, Plus, X, Trash2, ExternalLink, MapPin, Check, ChevronDown, Edit3, ArrowLeft, Save } from 'lucide-react';
import { AppState, QuickLink, LocationData } from '../types.ts';
import { AutoInput } from './ui/AutoInput.tsx';

interface TopBarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setMenuHidden: (hidden: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ state, setState, setMenuHidden }) => {
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // State untuk Link Manager
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const toggleQuickNotes = (show: boolean) => {
    setShowQuickNotes(show);
    setMenuHidden(show);
  };

  const toggleLinks = (show: boolean) => {
    setShowLinks(show);
    setMenuHidden(show);
    if (!show) setIsAddingLink(false); // Reset state saat tutup
  };

  const toggleLocationModal = (show: boolean) => {
    setShowLocationModal(show);
    setMenuHidden(show);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setState(prev => ({
      ...prev,
      quickNotes: [newNote, ...prev.quickNotes]
    }));
    setNewNote('');
  };

  const removeNote = (index: number) => {
    setState(prev => ({
      ...prev,
      quickNotes: prev.quickNotes.filter((_, i) => i !== index)
    }));
  };

  const addLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    const link: QuickLink = {
      id: Date.now().toString(),
      name: newLinkName,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`
    };
    setState(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, link]
    }));
    setNewLinkName('');
    setNewLinkUrl('');
    setIsAddingLink(false); // Kembali ke list view
  };

  const removeLink = (id: string) => {
    setState(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.filter(l => l.id !== id)
    }));
  };

  const switchLocation = (id: string) => {
    setState(prev => ({
      ...prev,
      currentLocationId: id
    }));
  };

  const renameLocation = (id: string, newName: string) => {
    setState(prev => ({
      ...prev,
      locations: {
        ...prev.locations,
        [id]: {
          ...prev.locations[id],
          name: newName
        }
      }
    }));
  };

  // Safety check to prevent crash if location doesn't exist
  const currentLocation = state.locations[state.currentLocationId];
  const currentLocationName = currentLocation ? currentLocation.name : 'Loading...';

  return (
    <>
      <div className="h-18 py-3 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-40 transition-all duration-300">
        {/* Branding Section */}
        <div className="flex flex-col justify-center select-none">
           <h1 className="text-lg font-extrabold tracking-tighter text-primary leading-none">RENOVKI.COM</h1>
           <span className="text-[10px] text-gray-400 font-medium tracking-wide">Bikin Rumah Impian</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Highlighted Location Pill */}
          <button 
            onClick={() => toggleLocationModal(true)}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-full border border-blue-100 transition-all active:scale-95 shadow-sm group"
          >
            <div className="p-1 bg-white rounded-full shadow-sm text-accent group-hover:text-primary transition-colors">
               <MapPin size={10} className="fill-current" />
            </div>
            <span className="text-xs font-bold max-w-[80px] sm:max-w-[120px] truncate">{currentLocationName}</span>
            <ChevronDown size={12} className="text-primary/70" />
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <button onClick={() => toggleQuickNotes(true)} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
              {state.quickNotes.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <button onClick={() => toggleLinks(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
              {/* DM / Paper Plane Icon */}
              <Send className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors -rotate-12 mt-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Manager Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-full"><MapPin className="w-5 h-5 text-primary" /></div>
                Pilih Proyek
              </h3>
              <button onClick={() => toggleLocationModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-3 mb-6">
              {(Object.values(state.locations) as LocationData[]).map((loc) => {
                const isActive = state.currentLocationId === loc.id;
                return (
                  <div 
                    key={loc.id} 
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isActive 
                        ? 'border-primary bg-blue-50/50 shadow-sm' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <button 
                      onClick={() => switchLocation(loc.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {isActive ? <Check size={20} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {loc.id === 'loc1' ? 'Lokasi 1' : 'Lokasi 2'}
                        </span>
                        <Edit3 size={10} className="text-gray-300" />
                      </div>
                      <AutoInput
                        value={loc.name}
                        onChange={(e) => renameLocation(loc.id, e.target.value)}
                        className={`w-full font-bold bg-transparent border-b border-transparent focus:border-primary focus:outline-none transition-colors ${
                           isActive ? 'text-primary' : 'text-gray-700'
                        }`}
                        placeholder="Nama Proyek..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => toggleLocationModal(false)} 
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Quick Notes Modal */}
      {showQuickNotes && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-full"><Heart className="w-5 h-5 text-red-500 fill-red-500" /></div>
                Quick Notes
              </h3>
              <button onClick={() => toggleQuickNotes(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ingatkan saya..."
                className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <button onClick={addNote} className="bg-primary hover:bg-secondary text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {state.quickNotes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">Belum ada catatan.</p>
                </div>
              ) : (
                state.quickNotes.map((note, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 group hover:shadow-sm transition-shadow">
                    <p className="text-sm text-gray-800 break-words flex-1 leading-relaxed">{note}</p>
                    <button onClick={() => removeNote(idx)} className="text-gray-300 hover:text-red-500 ml-3 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Manager Modal */}
      {showLinks && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-full"><Send className="w-5 h-5 text-blue-500" /></div>
                {isAddingLink ? 'Tambah Link' : 'Link Manager'}
              </h3>
              <button onClick={() => toggleLinks(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {!isAddingLink ? (
              // Tampilan List Link
              <div className="space-y-4">
                 <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[150px]">
                    {state.quickLinks.length === 0 ? (
                      <div className="text-center py-10 flex flex-col items-center justify-center text-gray-300">
                        <ExternalLink size={32} className="mb-2 opacity-50"/>
                        <p className="text-sm font-medium">Belum ada link tersimpan.</p>
                      </div>
                    ) : (
                      state.quickLinks.map((link) => (
                        <div key={link.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-700 hover:text-primary truncate">
                              {link.name}
                            </a>
                          </div>
                          <button onClick={() => removeLink(link.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={() => setIsAddingLink(true)} 
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-secondary"
                  >
                    <Plus className="w-5 h-5" /> Tambah Link Baru
                  </button>
              </div>
            ) : (
              // Tampilan Form Input
              <div className="space-y-4 animate-in slide-in-from-right duration-200">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Nama Link</label>
                        <AutoInput
                            autoFocus
                            type="text"
                            value={newLinkName}
                            onChange={(e) => setNewLinkName(e.target.value)}
                            placeholder="Contoh: Spreadsheet Proyek"
                            className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all text-gray-800"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">URL / Alamat Web</label>
                        <AutoInput
                            type="text"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-gray-600"
                        />
                    </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                   <button 
                      onClick={() => setIsAddingLink(false)} 
                      className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={18} /> Batal
                   </button>
                   <button 
                      onClick={addLink} 
                      className="flex-1 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-secondary py-3"
                    >
                      <Save size={18} /> Simpan
                   </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};