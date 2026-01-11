// src/components/common/ProjectSettings.tsx
import React, { useState } from 'react';
import { X, Upload, Music, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { fileToBase64 } from '../../utils/file';

interface ProjectSettingsProps {
  onClose: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ onClose }) => {
  const { project, loadProject, setProjectName } = useStore();
  
  const [meta, setMeta] = useState(project.meta);
  const [name, setName] = useState(project.name || 'Untitled Project');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    // 1. Save Name
    setProjectName(name);

    // 2. Save Meta
    loadProject({
      ...project,
      name: name,
      meta: meta
    });
    onClose();
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      loadProject({
        ...project,
        audioSrc: base64
      });
      alert("Audio loaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to load audio");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-96 rounded-lg border border-gray-700 shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-white">Project Settings</h2>
        
        <div className="space-y-4">
          
          {/* --- Name Input --- */}
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 uppercase">Project Name</label>
             <input 
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
               placeholder="Enter project name..."
             />
          </div>

          {/* --- Dimensions --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Width</label>
              <input 
                type="number" 
                value={meta.width}
                onChange={(e) => setMeta({ ...meta, width: parseInt(e.target.value) || 1920 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Height</label>
              <input 
                type="number" 
                value={meta.height}
                onChange={(e) => setMeta({ ...meta, height: parseInt(e.target.value) || 1080 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
          </div>

          {/* --- Time & FPS (Added Back) --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Duration (s)</label>
              <input 
                type="number" 
                value={meta.duration}
                onChange={(e) => setMeta({ ...meta, duration: parseInt(e.target.value) || 10 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">FPS</label>
              <input 
                type="number" 
                value={meta.fps}
                onChange={(e) => setMeta({ ...meta, fps: parseInt(e.target.value) || 60 })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
              />
            </div>
          </div>
          
          {/* Audio Section */}
          <div className="space-y-2 pt-4 border-t border-gray-700">
            <label className="text-xs font-bold text-gray-400 uppercase">Background Audio</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 w-full p-3 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded cursor-pointer transition-colors">
                 <Music size={16} />
                 <span className="text-sm">{isUploading ? 'Encoding...' : 'Upload MP3/WAV'}</span>
                 <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleAudioUpload}
                    disabled={isUploading}
                 />
              </label>
              {project.audioSrc && (
                 <div className="text-xs text-green-500 truncate">Audio Loaded</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
           <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold">
             <Save size={14} />
             Save Settings
           </button>
        </div>
      </div>
    </div>
  );
};