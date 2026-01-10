import React from 'react';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';

export const ProjectSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const project = useStore((state) => state.project);
  
  const updateMeta = (field: string, val: number) => {
    useStore.setState(state => ({
        project: {
            ...state.project,
            meta: { ...state.project.meta, [field]: val }
        }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#1e1e1e] border border-[#333] w-80 p-4 rounded shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
            <h3 className="font-bold text-white">Project Settings</h3>
            <button onClick={onClose}><X size={16}/></button>
        </div>
        
        <div className="flex flex-col gap-4">
            <div>
                <label className="text-xs text-gray-400">Total Duration (sec)</label>
                <input type="number" 
                    className="w-full bg-black border border-[#333] p-2 text-white rounded mt-1"
                    value={project.meta.duration}
                    onChange={(e) => updateMeta('duration', parseInt(e.target.value))}
                />
            </div>
            
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-xs text-gray-400">Width (px)</label>
                    <input type="number" 
                        className="w-full bg-black border border-[#333] p-2 text-white rounded mt-1"
                        value={project.meta.width}
                        onChange={(e) => updateMeta('width', parseInt(e.target.value))}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-400">Height (px)</label>
                    <input type="number" 
                        className="w-full bg-black border border-[#333] p-2 text-white rounded mt-1"
                        value={project.meta.height}
                        onChange={(e) => updateMeta('height', parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-400">FPS</label>
                <input type="number" 
                    className="w-full bg-black border border-[#333] p-2 text-white rounded mt-1"
                    value={project.meta.fps}
                    onChange={(e) => updateMeta('fps', parseInt(e.target.value))}
                />
            </div>
        </div>
      </div>
    </div>
  );
};