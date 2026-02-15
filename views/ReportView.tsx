import React, { useState } from 'react';
import { 
  Minus, Plus, Share2, Send, ShoppingCart, List, CheckCircle, Trash2, Archive, X,
  Package, BrickWall, PaintBucket, Hammer, Shovel, Ruler, Box, Layers,
  Droplet, Zap, Lightbulb, Plug, Wrench, DoorOpen, HardHat, Truck, Pickaxe,
  Cylinder, Cable, Scroll, Anchor, Drill
} from 'lucide-react';
import { MaterialItem, Unit, LocationData, RequestItem } from '../types.ts';
import { UNITS } from '../constants.ts';
import { AutoInput } from '../components/ui/AutoInput.tsx';

interface ReportViewProps {
  data: LocationData;
  updateData: (updates: Partial<LocationData>) => void;
  setMenuHidden: (hidden: boolean) => void;
}

// Icon Mapping Configuration
const MATERIAL_ICONS: { id: string, icon: React.ElementType, label: string }[] = [
  { id: 'package', icon: Package, label: 'Umum' },
  { id: 'brick', icon: BrickWall, label: 'Bata/Dinding' },
  { id: 'paint', icon: PaintBucket, label: 'Cat' },
  { id: 'hammer', icon: Hammer, label: 'Kayu' },
  { id: 'shovel', icon: Shovel, label: 'Pasir/Tanah' },
  { id: 'ruler', icon: Ruler, label: 'Besi/Ukuran' },
  { id: 'box', icon: Box, label: 'Keramik/Dus' },
  { id: 'layers', icon: Layers, label: 'Triplek' },
  { id: 'droplet', icon: Droplet, label: 'Air' },
  { id: 'zap', icon: Zap, label: 'Listrik' },
  { id: 'lightbulb', icon: Lightbulb, label: 'Lampu' },
  { id: 'plug', icon: Plug, label: 'Stop Kontak' },
  { id: 'cable', icon: Cable, label: 'Kabel' },
  { id: 'wrench', icon: Wrench, label: 'Pipa/Keran' },
  { id: 'cylinder', icon: Cylinder, label: 'Pipa PVC' },
  { id: 'door', icon: DoorOpen, label: 'Pintu/Jendela' },
  { id: 'hardhat', icon: HardHat, label: 'Safety' },
  { id: 'truck', icon: Truck, label: 'Urug/Truck' },
  { id: 'pickaxe', icon: Pickaxe, label: 'Batu Kali' },
  { id: 'anchor', icon: Anchor, label: 'Besi Berat' },
  { id: 'drill', icon: Drill, label: 'Mesin' },
  { id: 'scroll', icon: Scroll, label: 'Semen' },
];

export const ReportView: React.FC<ReportViewProps> = ({ data, updateData, setMenuHidden }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestList, setShowRequestList] = useState(false);
  const [showIconModal, setShowIconModal] = useState<string | null>(null); // Stores ID of item being edited
  const [showDetailText, setShowDetailText] = useState<string | null>(null); // For Double Click Popup
  
  const [requestItem, setRequestItem] = useState('');
  const [requestQty, setRequestQty] = useState('');
  const [requestUnit, setRequestUnit] = useState<Unit>('Pcs');

  const toggleModal = (show: boolean) => {
      setShowRequestModal(show);
      setMenuHidden(show);
  };

  const toggleList = (show: boolean) => {
      setShowRequestList(show);
      setMenuHidden(show);
  };

  const toggleIconModal = (itemId: string | null) => {
      setShowIconModal(itemId);
      setMenuHidden(!!itemId);
  };

  const updateInventory = (id: string, updates: Partial<MaterialItem>) => {
    const newInventory = data.inventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateData({ inventory: newInventory });
  };

  const addInventoryItem = () => {
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      name: '',
      qty: 0,
      unit: 'Pcs',
      icon: 'package'
    };
    updateData({ inventory: [...data.inventory, newItem] });
  };

  const removeInventoryItem = (id: string) => {
      if (window.confirm("Hapus material ini dari daftar stok?")) {
          const newInventory = data.inventory.filter(item => item.id !== id);
          updateData({ inventory: newInventory });
      }
  }

  const sendAllToWA = () => {
    if (data.inventory.length === 0) return;
    
    // Format: Nama Lokasi di paling atas, lalu list material
    const header = `*LAPORAN STOK MATERIAL*\nLokasi: ${data.name}\n\n`;
    const list = data.inventory
      .filter(i => i.name.trim() !== '')
      .map(i => `${i.name} ${i.qty} ${i.unit}`)
      .join('\n');
    
    const fullText = header + list;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
  };

  const sendRequest = () => {
    if (!requestItem) return;

    const newItem: RequestItem = {
        id: Date.now().toString(),
        name: requestItem,
        qty: parseFloat(requestQty) || 0,
        unit: requestUnit,
        date: new Date().toLocaleDateString('id-ID'),
        status: 'pending'
    };

    // Update state requests
    const newRequests = [...(data.requests || []), newItem];
    updateData({ requests: newRequests });

    // Kirim ke WA
    const text = `*REQUEST MATERIAL*\nLokasi: ${data.name}\n\n• ${requestItem} : ${requestQty} ${requestUnit}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    
    toggleModal(false);
    setRequestItem('');
    setRequestQty('');
  };

  const handleRequestDone = (req: RequestItem) => {
      // 1. Tambahkan ke inventory
      // Cek apakah item sudah ada (case insensitive)
      const existingItem = data.inventory.find(
          i => i.name.toLowerCase() === req.name.toLowerCase() && i.unit === req.unit
      );

      let newInventory = [...data.inventory];

      if (existingItem) {
          // Update qty
          newInventory = newInventory.map(i => 
              i.id === existingItem.id ? { ...i, qty: i.qty + req.qty } : i
          );
      } else {
          // Buat item baru
          const newItem: MaterialItem = {
              id: Date.now().toString(),
              name: req.name,
              qty: req.qty,
              unit: req.unit,
              icon: 'package'
          };
          newInventory.push(newItem);
      }

      // 2. Hapus dari list requests
      const newRequests = data.requests.filter(r => r.id !== req.id);

      updateData({
          inventory: newInventory,
          requests: newRequests
      });
  };

  const deleteRequest = (id: string) => {
      const newRequests = data.requests.filter(r => r.id !== id);
      updateData({ requests: newRequests });
  };

  const getIconComponent = (iconName?: string) => {
      const found = MATERIAL_ICONS.find(i => i.id === iconName);
      return found ? found.icon : Package;
  };

  const handleIconSelect = (iconId: string) => {
      if (showIconModal) {
          updateInventory(showIconModal, { icon: iconId });
          toggleIconModal(null);
      }
  };

  return (
    <div className="pt-6 px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Stok Material</h2>
               <p className="text-xs text-gray-500 font-medium">Inventori {data.name}</p>
            </div>
            
            <button 
                onClick={sendAllToWA}
                className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all hover:bg-green-700"
            >
                <Share2 size={14} /> Kirim Semua
            </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
            <button 
              onClick={() => toggleModal(true)}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all hover:bg-secondary"
            >
              <Plus size={18} /> Request Material
            </button>
            <button 
              onClick={() => toggleList(true)}
              className="px-4 bg-white text-primary border border-blue-100 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all relative"
            >
              <List size={18} />
              {data.requests && data.requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border border-white">
                      {data.requests.length}
                  </span>
              )}
            </button>
        </div>
      </div>

      {/* Inventory List - Compact Mode */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daftar Material</span>
            <span className="text-xs font-bold text-gray-400">{data.inventory.length} Item</span>
        </div>
        
        <div className="divide-y divide-gray-50">
            {data.inventory.map((item) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-blue-50/30 transition-colors group">
                    {/* Icon Kecil - Clickable */}
                    <button 
                        onClick={() => toggleIconModal(item.id)}
                        className="w-9 h-9 bg-gray-100 text-gray-500 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90"
                        title="Ganti Icon"
                    >
                        <IconComponent size={16} />
                    </button>
                    
                    {/* Nama Material Input */}
                    <div className="flex-1 min-w-0">
                        <AutoInput
                            value={item.name}
                            onChange={(e) => updateInventory(item.id, { name: e.target.value })}
                            onDoubleClick={() => setShowDetailText(item.name)}
                            placeholder="Nama Item..."
                            className="font-semibold text-gray-800 text-sm w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 truncate cursor-pointer"
                            title="Klik 2x untuk lihat detail"
                        />
                    </div>

                    {/* Controls Qty */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                            onClick={() => updateInventory(item.id, { qty: Math.max(0, item.qty - 1) })}
                            className="w-6 h-6 flex items-center justify-center bg-white text-gray-500 rounded-md shadow-sm active:scale-90 hover:text-red-500 transition-colors"
                        >
                            <Minus size={12} />
                        </button>
                        <div className="flex items-baseline gap-0.5 min-w-[3.5rem] justify-center">
                            <AutoInput
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateInventory(item.id, { qty: parseFloat(e.target.value) || 0 })}
                                className="w-8 text-center text-sm font-bold bg-transparent border-none p-0 focus:ring-0"
                            />
                            <select
                                value={item.unit}
                                onChange={(e) => updateInventory(item.id, { unit: e.target.value as Unit })}
                                className="text-[10px] font-bold uppercase bg-transparent border-none p-0 text-gray-400 focus:ring-0 cursor-pointer"
                            >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={() => updateInventory(item.id, { qty: item.qty + 1 })}
                            className="w-6 h-6 flex items-center justify-center bg-white text-gray-500 rounded-md shadow-sm active:scale-90 hover:text-primary transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button 
                        onClick={() => removeInventoryItem(item.id)} 
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                        title="Hapus Material"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )})}
        </div>
        
        <button 
          onClick={addInventoryItem}
          className="w-full py-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-100 hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Tambah Baris
        </button>
      </div>

      {/* Icon Picker Modal */}
      {showIconModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-800">Pilih Icon Material</h3>
                      <button onClick={() => toggleIconModal(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18} /></button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar p-1">
                      {MATERIAL_ICONS.map((iconData) => {
                          const Icon = iconData.icon;
                          const currentItem = data.inventory.find(i => i.id === showIconModal);
                          const isActive = currentItem?.icon === iconData.id;

                          return (
                              <button
                                  key={iconData.id}
                                  onClick={() => handleIconSelect(iconData.id)}
                                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                      isActive 
                                      ? 'bg-primary text-white border-primary shadow-lg shadow-blue-200' 
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-primary hover:text-primary hover:bg-blue-50'
                                  }`}
                              >
                                  <Icon size={24} />
                                  <span className="text-[10px] font-bold text-center leading-tight">{iconData.label}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Detail Text Modal (Double Click) */}
      {showDetailText !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowDetailText(null)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowDetailText(null)} className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500"><X size={20}/></button>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Detail Material</h3>
                <p className="text-2xl font-bold text-gray-900 leading-relaxed break-words">{showDetailText || "(Kosong)"}</p>
            </div>
        </div>
      )}

      {/* Request Modal (Input) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Request Material</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Material</label>
                  <AutoInput
                    autoFocus
                    value={requestItem}
                    onChange={(e) => setRequestItem(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Nama material..."
                  />
              </div>
              <div className="flex gap-3">
                 <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah</label>
                    <AutoInput
                        type="number"
                        value={requestQty}
                        onChange={(e) => setRequestQty(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="0"
                    />
                 </div>
                 <div className="w-1/3 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Satuan</label>
                    <div className="relative">
                        <select
                            value={requestUnit}
                            onChange={(e) => setRequestUnit(e.target.value as Unit)}
                            className="w-full appearance-none bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => toggleModal(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Batal</button>
              <button onClick={sendRequest} className="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
                <Send size={18} /> Kirim WA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Request Modal (Status) */}
      {showRequestList && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Daftar Request</h3>
                    <button onClick={() => toggleList(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><Archive size={18}/></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {(!data.requests || data.requests.length === 0) ? (
                        <div className="text-center py-10 text-gray-400">
                            <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Belum ada request pending</p>
                        </div>
                    ) : (
                        data.requests.map(req => (
                            <div key={req.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between group">
                                <div>
                                    <h4 className="font-bold text-gray-800">{req.name}</h4>
                                    <div className="flex gap-2 text-sm text-gray-500">
                                        <span>{req.qty} {req.unit}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{req.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => deleteRequest(req.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleRequestDone(req)}
                                        className="bg-green-100 text-green-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <CheckCircle size={14} /> Done
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};