import React, { useState, useRef } from 'react';
import { Camera, Send, X, Calendar, ArrowRight, Trash2, ImagePlus, Plus, MapPin } from 'lucide-react';
import { LocationData, WorkItem } from '../types.ts';
import { AutoInput } from '../components/ui/AutoInput.tsx';

interface NoteViewProps {
  data: LocationData;
  updateData: (updates: Partial<LocationData>) => void;
  userName: string;
  userAvatar: string;
  setMenuHidden: (hidden: boolean) => void;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const NoteView: React.FC<NoteViewProps> = ({ data, updateData, userName, userAvatar, setMenuHidden }) => {
  // State untuk melacak item mana yang sedang dibuka modal fotonya
  const [activeItem, setActiveItem] = useState<{ type: 'plan' | 'progress', id: string, text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format Tanggal
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  // Change format here as requested: Day | Date Month | Year
  const dateStr = `${days[now.getDay()]} | ${now.getDate()} ${months[now.getMonth()]} | ${now.getFullYear()}`;

  const toggleModal = (item: { type: 'plan' | 'progress', id: string, text: string } | null) => {
    setActiveItem(item);
    setMenuHidden(!!item);
  };

  const handleLineChange = (type: 'plan' | 'progress', id: string, text: string) => {
    const updated = data.report[type].map(item => item.id === id ? { ...item, text } : item);
    updateData({
        report: { ...data.report, [type]: updated }
    });
  };

  const handleDeleteLine = (type: 'plan' | 'progress', id: string) => {
    const updated = data.report[type].filter(item => item.id !== id);
    if (updated.length === 0) {
        updated.push({ id: Date.now().toString(), text: '', photos: [] });
    }
    updateData({
        report: { ...data.report, [type]: updated }
    });
  };

  const handleEnterKey = (type: 'plan' | 'progress', index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const list = data.report[type];
        if (index === list.length - 1) {
            const newItem: WorkItem = { id: Date.now().toString(), text: '', photos: [] };
            const newList = [...list, newItem];
            updateData({
                report: { ...data.report, [type]: newList }
            });
        }
        setTimeout(() => {
            const inputs = document.querySelectorAll(`[data-section="${type}"] input`);
            if (inputs[index + 1]) (inputs[index + 1] as HTMLInputElement).focus();
        }, 10);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeItem || !e.target.files || e.target.files.length === 0) return;

    // Cek jumlah foto saat ini
    const currentItem = data.report[activeItem.type].find(i => i.id === activeItem.id);
    const currentPhotos = currentItem?.photos || [];
    
    if (currentPhotos.length >= 4) {
        alert("Maksimal 4 foto per item pekerjaan.");
        return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update data state
        const list = data.report[activeItem.type];
        const updatedList = list.map(item => {
            if (item.id === activeItem.id) {
                const photos = item.photos || [];
                return { ...item, photos: [...photos, base64String] };
            }
            return item;
        });

        updateData({
            report: { ...data.report, [activeItem.type]: updatedList }
        });
        
        // Reset input agar bisa upload file yang sama jika dihapus lalu diupload lagi
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (photoIndex: number) => {
      if (!activeItem) return;
      const list = data.report[activeItem.type];
      const updatedList = list.map(item => {
          if (item.id === activeItem.id) {
              const newPhotos = [...(item.photos || [])];
              newPhotos.splice(photoIndex, 1);
              return { ...item, photos: newPhotos };
          }
          return item;
      });
      updateData({
          report: { ...data.report, [activeItem.type]: updatedList }
      });
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
  };

  const shareItemToWA = async () => {
      if (!activeItem) return;
      
      const list = data.report[activeItem.type];
      const currentItem = list.find(i => i.id === activeItem.id);
      
      if (!currentItem || !currentItem.photos || currentItem.photos.length === 0) {
          alert("Silakan upload foto terlebih dahulu.");
          return;
      }

      // Konversi semua foto ke object File
      const filesArray = currentItem.photos.map((photo, index) => 
          dataURLtoFile(photo, `dokumentasi-${activeItem.id}-${index+1}.jpg`)
      );

      const captionText = `*DOKUMENTASI PEKERJAAN*\nLokasi: ${data.name}\nItem: ${currentItem.text || 'Tanpa Keterangan'}\n\n${dateStr}`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: filesArray })) {
          try {
              await navigator.share({
                  files: filesArray,
                  title: 'Dokumentasi Renovki',
                  text: captionText,
              });
          } catch (error) {
              console.error('Error sharing', error);
          }
      } else {
          alert("Browser Anda tidak mendukung pengiriman file langsung ke WhatsApp Web. Fitur ini optimal berjalan di Smartphone (Android/iOS).");
           window.open(`https://wa.me/?text=${encodeURIComponent(captionText)}`, '_blank');
      }
  };

  const sendSpecificReport = (type: 'plan' | 'progress') => {
    const title = type === 'plan' ? 'Rencana Kerja' : 'Progress Kerja';
    const items = data.report[type];
    const header = `Bismillah, Assalamualaikum\n${title} Project ${data.name}\n⬇\n${dateStr}\n\n`;
    const content = items.filter(i => i.text.trim() !== '').map(i => `• Pek. ${i.text}`).join('\n');
    const fullText = `${header}${content || '-'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
  };

  // Mendapatkan item yang sedang aktif
  const activeItemData = activeItem 
    ? data.report[activeItem.type].find(i => i.id === activeItem.id) 
    : null;

  return (
    <div className="pt-6 px-5 space-y-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-3xl text-white shadow-glow relative overflow-hidden flex items-center gap-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        {/* Photo Section */}
        <div className="relative z-10 shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-white/80 overflow-hidden shadow-lg bg-white">
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-primary shadow-sm"></div>
        </div>

        {/* Text Section */}
        <div className="relative z-10">
            <h2 className="text-xl font-bold leading-tight">{userName}</h2>
            
            <div className="flex flex-wrap items-center gap-2 mt-1.5 opacity-90">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-md text-white/90">SITE MANAGER</span>
            </div>

            {/* Location Name - Plain Text, No Bubble */}
            <div className="flex items-center gap-1.5 mt-2 text-white/95">
                 <MapPin size={12} className="text-white fill-white/20" />
                 <span className="text-sm font-bold tracking-wide shadow-sm">{data.name}</span>
            </div>

            <p className="text-[10px] font-medium opacity-75 mt-1">{dateStr}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Rencana Section */}
        <section className="bg-white rounded-3xl p-5 shadow-soft border border-gray-50/50">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-800">Rencana Kerja</h3>
            </div>
            <button onClick={() => sendSpecificReport('plan')} className="p-2 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95">
                <Send size={18} />
            </button>
          </div>
          <div className="space-y-3" data-section="plan">
            {data.report.plan.map((item, index) => (
                <div key={item.id} className="group flex gap-2 items-center">
                    <ArrowRight size={14} className="text-gray-300 group-focus-within:text-primary transition-colors shrink-0" />
                    <div className="flex-1 relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none pointer-events-none">Pek.</span>
                        <AutoInput
                            value={item.text}
                            onChange={(e) => handleLineChange('plan', item.id, e.target.value)}
                            onKeyDown={(e) => handleEnterKey('plan', index, e)}
                            placeholder="Input rencana..."
                            className="w-full pl-8 py-2 bg-transparent border-b border-dashed border-gray-200 focus:border-primary focus:border-solid text-sm text-gray-700 transition-all placeholder:text-gray-300"
                        />
                    </div>
                    {/* Tombol Kamera Per Item */}
                    <button 
                        onClick={() => toggleModal({ type: 'plan', id: item.id, text: item.text })}
                        className={`p-2 rounded-lg transition-all ${
                            item.photos && item.photos.length > 0 
                            ? 'text-primary bg-blue-50' 
                            : 'text-gray-300 hover:text-primary hover:bg-blue-50'
                        }`}
                        title={item.photos && item.photos.length > 0 ? `${item.photos.length} Foto` : "Tambah Foto"}
                    >
                        <div className="relative">
                            <Camera size={16} className={item.photos && item.photos.length > 0 ? "fill-current" : ""} />
                            {item.photos && item.photos.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-primary text-white text-[8px] flex items-center justify-center rounded-full border border-white">
                                    {item.photos.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button 
                        onClick={() => handleDeleteLine('plan', item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus baris"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
          </div>
        </section>

        {/* Progress Section */}
        <section className="bg-white rounded-3xl p-5 shadow-soft border border-gray-50/50">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800">Progress Kerja</h3>
             </div>
             <button onClick={() => sendSpecificReport('progress')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all active:scale-95">
                <Send size={18} />
            </button>
          </div>
          <div className="space-y-3" data-section="progress">
            {data.report.progress.map((item, index) => (
                <div key={item.id} className="group flex gap-2 items-center">
                    <ArrowRight size={14} className="text-gray-300 group-focus-within:text-green-500 transition-colors shrink-0" />
                    <div className="flex-1 relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none pointer-events-none">Pek.</span>
                        <AutoInput
                            value={item.text}
                            onChange={(e) => handleLineChange('progress', item.id, e.target.value)}
                            onKeyDown={(e) => handleEnterKey('progress', index, e)}
                            placeholder="Input progress..."
                            className="w-full pl-8 py-2 bg-transparent border-b border-dashed border-gray-200 focus:border-green-500 focus:border-solid text-sm text-gray-700 transition-all placeholder:text-gray-300"
                        />
                    </div>
                    {/* Tombol Kamera Per Item */}
                    <button 
                        onClick={() => toggleModal({ type: 'progress', id: item.id, text: item.text })}
                        className={`p-2 rounded-lg transition-all ${
                            item.photos && item.photos.length > 0 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-gray-300 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={item.photos && item.photos.length > 0 ? `${item.photos.length} Foto` : "Tambah Foto"}
                    >
                        <div className="relative">
                            <Camera size={16} className={item.photos && item.photos.length > 0 ? "fill-current" : ""} />
                            {item.photos && item.photos.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-green-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white">
                                    {item.photos.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button 
                        onClick={() => handleDeleteLine('progress', item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus baris"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
          </div>
        </section>
      </div>
        
        {/* Item Specific Photo Modal */}
        {activeItem && activeItemData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <div className="max-w-[80%]">
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Dokumentasi (Max 4)</h3>
                        <p className="text-sm font-semibold text-primary truncate">"{activeItem.text || 'Item Baru'}"</p>
                    </div>
                    <button onClick={() => toggleModal(null)} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100"><X size={18} /></button>
                </div>
                
                <div className="p-6">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handlePhotoUpload} 
                    />
                    
                    {/* Photo Grid (2x2) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {/* Render existing photos */}
                        {activeItemData.photos?.map((photo, idx) => (
                            <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square shadow-md border border-gray-100">
                                <img src={photo} alt={`Dokumentasi ${idx+1}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removePhoto(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white transition-colors shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-md backdrop-blur-sm">
                                    {idx + 1}
                                </span>
                            </div>
                        ))}

                        {/* Add Photo Button (Show only if < 4) */}
                        {(!activeItemData.photos || activeItemData.photos.length < 4) && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary hover:text-primary transition-all hover:bg-blue-50/30 group"
                            >
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                     <Plus size={20} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={shareItemToWA}
                        disabled={!activeItemData.photos || activeItemData.photos.length === 0}
                        className={`w-full py-3.5 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            (!activeItemData.photos || activeItemData.photos.length === 0)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-green-200'
                        }`}
                    >
                        <WhatsAppIcon className="w-5 h-5" />
                        <span>Kirim {activeItemData.photos?.length ? `(${activeItemData.photos.length})` : ''} Foto ke WhatsApp</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-3 px-2 leading-relaxed">
                        Fitur ini menggunakan Web Share API untuk mengirim <b>multiple file</b>. Pastikan menggunakan Browser HP (Chrome/Safari) Terbaru.
                    </p>
                </div>
            </div>
        </div>
        )}
    </div>
  );
};