import React from 'react';
import { Cloud, Users, TrendingUp } from 'lucide-react';
import { LocationData, ProgressData } from '../types.ts';
import { AutoInput } from '../components/ui/AutoInput.tsx';

interface ProgressViewProps {
  data: LocationData;
  updateData: (updates: Partial<LocationData>) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ data, updateData }) => {
  const { projectProgress } = data;

  const updateProgress = (updates: Partial<ProgressData>) => {
    updateData({
        projectProgress: { ...projectProgress, ...updates }
    });
  };

  const updateCategory = (id: string, val: number) => {
    const newCats = projectProgress.categories.map(c => 
        c.id === id ? { ...c, percentage: val } : c
    );
    updateProgress({ categories: newCats });
  };

  const totalProgress = Math.round(
      projectProgress.categories.reduce((acc, curr) => acc + curr.percentage, 0) / projectProgress.categories.length
  );

  return (
    <div className="pt-6 px-5 space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoring</h2>
            <p className="text-xs text-gray-500 font-medium">Status Proyek Terkini</p>
         </div>
         <div className="bg-white border border-gray-100 shadow-soft px-4 py-2 rounded-2xl flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${totalProgress === 100 ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
            <span className="text-sm font-bold text-gray-800">{totalProgress}%</span>
         </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-orange-50 rounded-full text-orange-500 mb-1">
                <Users className="w-6 h-6" />
            </div>
            <div className="text-center w-full">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tenaga Kerja</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                    <AutoInput 
                        type="number"
                        value={projectProgress.manpower}
                        onChange={(e) => updateProgress({ manpower: parseInt(e.target.value) || 0 })}
                        className="w-16 text-center text-2xl font-bold text-gray-800 bg-transparent border-none p-0 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-gray-400">Org</span>
                </div>
            </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-blue-50 rounded-full text-blue-500 mb-1">
                <Cloud className="w-6 h-6" />
            </div>
            <div className="text-center w-full">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cuaca</span>
                <AutoInput 
                    type="text"
                    value={projectProgress.weather}
                    onChange={(e) => updateProgress({ weather: e.target.value })}
                    placeholder="Cerah"
                    className="w-full text-center text-xl font-bold text-gray-800 bg-transparent border-none p-0 focus:ring-0 mt-1"
                />
            </div>
        </div>
      </div>

      {/* Categories Sliders */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-50 p-6 space-y-6">
        <h3 className="font-bold text-lg text-gray-800">Detail Pekerjaan</h3>
        <div className="space-y-6">
            {projectProgress.categories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-semibold text-gray-600">{cat.name}</span>
                        <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">{cat.percentage}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                            style={{ width: `${cat.percentage}%` }}
                        ></div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={cat.percentage}
                            onChange={(e) => updateCategory(cat.id, parseInt(e.target.value))}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};