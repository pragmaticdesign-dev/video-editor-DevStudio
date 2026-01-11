// src/components/timeline/Controls.tsx
import React, { useRef } from 'react';
import { Trash2, Music, Image as ImageIcon, Code2 } from 'lucide-react'; // <--- Added Code2 Icon
import { useStore } from '../../store/useStore';
import { AVAILABLE_OBJECTS, getDefinition } from '../../registry';

export const TimelineControls: React.FC = () => {
  const { addObject, removeObject, selectedObjectId, currentTime } = useStore();
  
  // Hidden inputs for file imports
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null); 

  const generateId = (prefix: string) => `${prefix}_${Date.now()}`;
  const btnClass = "flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // --- Handlers ---
  const handleGenericAdd = (type: string) => {
    const def = getDefinition(type);
    if (!def) return;
    
    const base = def.create();
    addObject({
        id: generateId(def.type),
        type: def.type as any, // Schema type casting
        start: currentTime,
        nudges: [],
        ...base
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'img' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const def = getDefinition(type);
      if(!def) return;

      const base = def.create();
      // Override the specific property for files
      base.properties.src = result;
      base.name = file.name;

      addObject({
        id: generateId(type),
        type: type,
        start: currentTime,
        nudges: [],
        ...base
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Group objects for the UI
  const media = AVAILABLE_OBJECTS.filter(o => o.category === 'media' && o.type !== 'img');
  const shapes = AVAILABLE_OBJECTS.filter(o => o.category === 'shape');
  const diagrams = AVAILABLE_OBJECTS.filter(o => o.category === 'diagram');

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-gray-800 overflow-x-auto">
      <span className="text-xs text-gray-400 font-bold px-2">ADD:</span>
      
      {/* 1. Media Group */}
      {media.map(def => (
        <button key={def.type} onClick={() => handleGenericAdd(def.type)} className={btnClass} title={def.label}>
          <def.icon size={14} />
        </button>
      ))}
      
      {/* Special: Image Import */}
      <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Import Image">
        <ImageIcon size={14} />
      </button>
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileImport(e, 'img')} accept="image/*" hidden />

      {/* Special: Custom Code Object (NEW) */}
      <button onClick={() => handleGenericAdd('custom_html')} className={`${btnClass} text-yellow-400 border border-yellow-400/30`} title="Custom Code Object">
        <Code2 size={14} />
      </button>

      <div className="w-[1px] h-4 bg-gray-600 mx-1 opacity-50"></div>

      {/* 2. Basic Shapes */}
      {shapes.map(def => (
        <button key={def.type} onClick={() => handleGenericAdd(def.type)} className={btnClass} title={def.label}>
           <def.icon size={14} />
        </button>
      ))}

      <div className="w-[1px] h-4 bg-gray-600 mx-1 opacity-50"></div>

      {/* 3. Diagrams */}
      {diagrams.map(def => (
        <button key={def.type} onClick={() => handleGenericAdd(def.type)} className={btnClass} title={def.label}>
           <def.icon size={14} />
        </button>
      ))}

      <div className="flex-1"></div>

      {/* 4. Audio Import */}
      <button onClick={() => audioInputRef.current?.click()} className={btnClass} title="Import Audio">
        <Music size={14} />
      </button>
      <input type="file" ref={audioInputRef} onChange={(e) => handleFileImport(e, 'audio')} accept="audio/*" hidden />

      <div className="w-[1px] h-4 bg-gray-600 mx-1 opacity-50"></div>

      {/* 5. Delete */}
      <button 
        onClick={() => selectedObjectId && confirm('Delete?') && removeObject(selectedObjectId)} 
        className="flex items-center gap-1 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white text-xs px-3 py-1.5 rounded transition-colors"
        disabled={!selectedObjectId}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};