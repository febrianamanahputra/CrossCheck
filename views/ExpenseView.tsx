import React, { useState, useRef } from 'react';
import { Plus, Trash2, Receipt, Share2, Wallet, ChevronDown, Minus, X, Camera, ImagePlus, Loader2 } from 'lucide-react';
import { LocationData, FundLog, ExpenseItem, Unit } from '../types.ts';
import { UNITS, GOOGLE_SCRIPT_URL } from '../constants.ts';
import { AutoInput } from '../components/ui/AutoInput.tsx';

interface ExpenseViewProps {
  data: LocationData;
  updateData: (updates: Partial<LocationData>) => void;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const ExpenseView: React.FC<ExpenseViewProps> = ({ data, updateData }) => {
  const [activeFundId, setActiveFundId] = useState<string>(data.funds[0]?.id || '');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFundNumber, setNewFundNumber] = useState('1');

  const [showShareModal, setShowShareModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFund = data.funds.find(f => f.id === activeFundId);

  // --- Fund Management ---
  const handleAddFund = () => {
    if (!newFundNumber) return;
    
    const newFund: FundLog = {
        id: Date.now().toString(),
        number: newFundNumber,
        items: []
    };
    updateData({ funds: [...data.funds, newFund] });
    setActiveFundId(newFund.id);
    setShowAddModal(false);
    // Reset to next number prediction
    setNewFundNumber((parseInt(newFundNumber) + 1).toString());
  };

  const adjustNewFundNumber = (delta: number) => {
      const current = parseInt(newFundNumber) || 0;
      setNewFundNumber(Math.max(1, current + delta).toString());
  };

  // --- Item Management ---
  const addItemToFund = (fundId: string) => {
    const newItem: ExpenseItem = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        item: '',
        unit: 'Pcs',
        price: 0,
        total: 0
    };
    
    const updatedFunds = data.funds.map(f => {
        if (f.id === fundId) return { ...f, items: [...f.items, newItem] };
        return f;
    });
    updateData({ funds: updatedFunds });
  };

  const updateItem = (fundId: string, itemId: string, updates: Partial<ExpenseItem>) => {
    const updatedFunds = data.funds.map(f => {
        if (f.id === fundId) {
            const updatedItems = f.items.map(i => {
                if (i.id === itemId) {
                    const newItem = { ...i, ...updates };
                    if (updates.price !== undefined || (updates as any).qty !== undefined) {
                         const q = (newItem as any).qty || 1; 
                         newItem.total = q * newItem.price;
                    }
                    return newItem;
                }
                return i;
            });
            return { ...f, items: updatedItems };
        }
        return f;
    });
    updateData({ funds: updatedFunds });
  };

  const updateItemQty = (fundId: string, itemId: string, qty: number) => {
      const updatedFunds = data.funds.map(f => {
        if (f.id === fundId) {
            const updatedItems = f.items.map(i => {
                if (i.id === itemId) {
                    return { ...i, qty, total: qty * i.price };
                }
                return i;
            });
            return { ...f, items: updatedItems };
        }
        return f;
    });
    updateData({ funds: updatedFunds });
  }

  const deleteItem = (fundId: string, itemId: string) => {
      const updatedFunds = data.funds.map(f => {
          if (f.id === fundId) return { ...f, items: f.items.filter(i => i.id !== itemId) };
          return f;
      });
      updateData({ funds: updatedFunds });
  }

  // --- Receipt Photo & Sharing ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !activeFund) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          const updatedFunds = data.funds.map(f => {
              if (f.id === activeFundId) return { ...f, receiptPhoto: base64String };
              return f;
          });
          updateData({ funds: updatedFunds });
      };
      reader.readAsDataURL(file);
  };

  const removePhoto = () => {
      const updatedFunds = data.funds.map(f => {
          if (f.id === activeFundId) return { ...f, receiptPhoto: undefined };
          return f;
      });
      updateData({ funds: updatedFunds });
  }

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

  const sendToSpreadsheet = async () => {
    if (!activeFund || !GOOGLE_SCRIPT_URL) return;

    try {
        setIsSyncing(true);
        // Format Data Sesuai Request:
        // Col A: No Dana | B: Tanggal | C: Nama | D: - | E: Nama | F: "Bahan" | G: - | H: Qty
        const rows = activeFund.items.map(item => [
            activeFund.number,      // A
            item.date,              // B
            item.item,              // C
            "",                     // D
            item.item,              // E
            "Bahan",                // F
            "",                     // G
            (item as any).qty || 1  // H
        ]);

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk menghindari blokir CORS browser
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: rows })
        });
        
        // Karena mode no-cors, kita anggap sukses jika tidak throw error
        console.log("Data sent to sheet");
    } catch (error) {
        console.error("Failed to send to sheet", error);
        alert("Gagal sinkronisasi ke Spreadsheet. Cek koneksi internet.");
    } finally {
        setIsSyncing(false);
    }
  };

  const shareToWA = async () => {
      if (!activeFund) return;

      // 1. Trigger Sync ke Spreadsheet (Fire and forget / await)
      if (GOOGLE_SCRIPT_URL) {
          await sendToSpreadsheet();
      } else {
          console.warn("URL Google Script belum diatur di constants.ts");
      }

      // 2. Lanjut Share WA
      const grandTotal = activeFund.items.reduce((acc, curr) => acc + curr.total, 0);
      const header = `*DANA LAPANGAN NO ${activeFund.number}*\nLokasi: ${data.name}\n\n`;
      const items = activeFund.items.map((i, idx) => {
         return `${idx+1}. ${i.item} (${(i as any).qty || 1} ${i.unit}) - Rp ${i.total.toLocaleString('id-ID')}`;
      }).join('\n');
      const footer = `\n\n*Total: Rp ${grandTotal.toLocaleString('id-ID')}*`;
      const text = header + items + footer;

      // Logic Send
      const filesArray = activeFund.receiptPhoto 
          ? [dataURLtoFile(activeFund.receiptPhoto, `nota-dl-${activeFund.number}.jpg`)] 
          : [];

      if (filesArray.length > 0 && navigator.share && navigator.canShare && navigator.canShare({ files: filesArray })) {
          try {
              await navigator.share({
                  files: filesArray,
                  title: `Dana Lapangan ${activeFund.number}`,
                  text: text,
              });
          } catch (error) {
              console.error('Error sharing', error);
          }
      } else {
          // Fallback if no photo or web share not supported
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
      setShowShareModal(false);
  };

  return (
    <div className="pt-6 px-5 space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-gray-900">Dana Lapangan</h2>
            <p className="text-xs text-gray-500 font-medium">Log Pengeluaran</p>
         </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-2">
          {/* Dropdown Selector */}
          <div className="relative flex-1">
              <select
                  value={activeFundId}
                  onChange={(e) => setActiveFundId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 pl-4 pr-10 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft"
              >
                  {data.funds.map(fund => (
                      <option key={fund.id} value={fund.id}>Dana Lapangan #{fund.number}</option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown size={18} />
              </div>
          </div>
          
          {/* Add Button */}
          <button 
              onClick={() => setShowAddModal(true)} 
              className="bg-primary hover:bg-secondary text-white w-12 h-auto rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
              <Plus size={24} />
          </button>
      </div>

      {activeFund ? (
          <div className="bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden min-h-[400px] flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-xl text-green-600">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pengeluaran</p>
                        <h3 className="font-bold text-gray-800 text-lg">Rp {activeFund.items.reduce((a, b) => a + b.total, 0).toLocaleString('id-ID')}</h3>
                    </div>
                  </div>
                  <button onClick={() => setShowShareModal(true)} className="text-gray-400 hover:text-green-600 p-2 hover:bg-green-50 rounded-xl transition-all">
                      <Share2 size={20} />
                  </button>
              </div>
              
              <div className="divide-y divide-gray-50 flex-1">
                  {activeFund.items.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                          <Receipt size={32} className="mb-2 opacity-50" />
                          <p className="text-sm">Belum ada item</p>
                      </div>
                  )}
                  {activeFund.items.map(item => (
                      <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors group">
                          <div className="flex gap-3 mb-2">
                              <AutoInput
                                type="date"
                                value={item.date}
                                onChange={(e) => updateItem(activeFund.id, item.id, { date: e.target.value })}
                                className="w-auto text-[10px] font-medium text-gray-400 bg-gray-100 rounded-md px-2 py-1 border-none focus:ring-0"
                              />
                              <div className="flex-1"></div>
                              <button onClick={() => deleteItem(activeFund.id, item.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={14} />
                              </button>
                          </div>
                          
                          <div className="flex items-start gap-3 mb-2">
                             <AutoInput
                                placeholder="Nama Barang..."
                                value={item.item}
                                onChange={(e) => updateItem(activeFund.id, item.id, { item: e.target.value })}
                                className="flex-1 font-semibold text-gray-800 border-none p-0 focus:ring-0 placeholder:text-gray-300 text-base"
                              />
                          </div>

                          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                              <div className="flex items-center bg-white rounded-lg border border-gray-100 px-2 py-1 shadow-sm">
                                  <AutoInput
                                    type="number"
                                    placeholder="0"
                                    value={(item as any).qty || 1}
                                    onChange={(e) => updateItemQty(activeFund.id, item.id, parseFloat(e.target.value) || 0)}
                                    className="w-8 text-sm font-bold text-center border-none p-0 focus:ring-0"
                                  />
                                  <select 
                                    value={item.unit}
                                    onChange={(e) => updateItem(activeFund.id, item.id, { unit: e.target.value as Unit })}
                                    className="text-[10px] uppercase font-bold text-gray-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                  >
                                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                  </select>
                              </div>
                              <span className="text-xs text-gray-400">x</span>
                              <div className="flex-1 relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rp</span>
                                  <AutoInput
                                    type="number"
                                    value={item.price || ''}
                                    onChange={(e) => updateItem(activeFund.id, item.id, { price: parseFloat(e.target.value) || 0 })}
                                    className="w-full text-sm font-medium border-none rounded-lg pl-6 pr-2 py-1 bg-white focus:ring-1 focus:ring-primary/20 text-right"
                                    placeholder="0"
                                  />
                              </div>
                          </div>
                          <div className="text-right text-xs font-bold text-primary mt-2">
                              = Rp {item.total.toLocaleString('id-ID')}
                          </div>
                      </div>
                  ))}
              </div>
              <button onClick={() => addItemToFund(activeFund.id)} className="w-full py-4 text-sm text-primary font-bold hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-2">
                  <Plus size={16} /> Tambah Item
              </button>
          </div>
      ) : (
          <div className="text-center py-20">
              <p className="text-gray-400 font-medium">Silakan Buat Dana Lapangan Baru</p>
          </div>
      )}

      {/* Add Fund Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-gray-800">Buat Dana Lapangan</h3>
                      <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18} /></button>
                  </div>
                  
                  <div className="text-center mb-6">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nomor Dana Lapangan</label>
                      <div className="flex items-center justify-center gap-4">
                          <button onClick={() => adjustNewFundNumber(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600"><Minus size={20}/></button>
                          <AutoInput 
                              type="number"
                              value={newFundNumber}
                              onChange={(e) => setNewFundNumber(e.target.value)}
                              className="w-24 text-center text-4xl font-bold text-primary border-none p-0 focus:ring-0"
                              autoFocus
                          />
                          <button onClick={() => adjustNewFundNumber(1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600"><Plus size={20}/></button>
                      </div>
                  </div>

                  <button 
                      onClick={handleAddFund}
                      className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-secondary transition-all active:scale-95"
                  >
                      Buat Sekarang
                  </button>
              </div>
          </div>
      )}

      {/* Share / Proof Modal */}
      {showShareModal && activeFund && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-800">Bukti Nota (Receipt)</h3>
                      <button onClick={() => setShowShareModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18} /></button>
                  </div>

                  <div className="mb-6">
                      <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handlePhotoUpload} 
                      />
                      
                      {activeFund.receiptPhoto ? (
                          <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-[3/4] group">
                              <img src={activeFund.receiptPhoto} alt="Nota" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-gray-700 hover:text-primary"><Camera size={20}/></button>
                                  <button onClick={removePhoto} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500"><Trash2 size={20}/></button>
                              </div>
                          </div>
                      ) : (
                          <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-[3/2] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary hover:text-primary hover:bg-blue-50/20 transition-all"
                          >
                              <ImagePlus size={32} className="mb-2" />
                              <span className="text-xs font-bold uppercase">Upload Foto Nota</span>
                          </div>
                      )}
                  </div>
                  
                  <div className="space-y-3">
                      <button 
                          onClick={shareToWA}
                          disabled={!activeFund.receiptPhoto || isSyncing}
                          className={`w-full py-3.5 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              activeFund.receiptPhoto && !isSyncing
                              ? 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-green-200' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                          {isSyncing ? <Loader2 className="w-5 h-5 animate-spin"/> : <WhatsAppIcon className="w-5 h-5" />}
                          <span>{isSyncing ? "Menyimpan ke Spreadsheet..." : "Kirim ke WhatsApp"}</span>
                      </button>
                      <p className="text-[10px] text-center text-gray-400 px-2 leading-relaxed">
                          {!activeFund.receiptPhoto 
                              ? "Harap sertakan foto bukti nota sebelum mengirim." 
                              : isSyncing 
                                ? "Sedang menyinkronkan data ke Google Sheet..."
                                : "Data akan otomatis disimpan ke Google Sheet dan WhatsApp terbuka."}
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};