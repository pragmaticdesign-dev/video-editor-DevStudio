import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { getDefinition } from '../../registry';

export const Inspector: React.FC = () => {
  const { selectedObjectId, project, updateObject } = useStore();
  const selectedObj = project.objects.find(o => o.id === selectedObjectId);
  
  const [activeTab, setActiveTab] = useState<'props' | 'code'>('props');
  const [localCode, setLocalCode] = useState('');

  // Sync code editor when selection changes
  useEffect(() => {
    if (selectedObj) setLocalCode(selectedObj.logic);
  }, [selectedObj?.id]);

  if (!selectedObj) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest">
        No Object Selected
      </div>
    );
  }

  const Def = getDefinition(selectedObj.type);

  // Helper: Update top-level fields (name, start, duration)
  const updateMain = (key: string, val: any) => updateObject(selectedObj.id, { [key]: val });
  
  // Helper: Update nested properties
  const updateProp = (key: string, val: any) => {
    updateObject(selectedObj.id, {
      properties: { ...selectedObj.properties, [key]: val }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333]">
      
      {/* --- TABS --- */}
      <div className="flex border-b border-[#333] bg-[#1e1e1e]">
         <button 
            onClick={() => setActiveTab('props')} 
            className={`flex-1 py-3 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'props' 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-[#111]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#252526]'
            }`}
         >
            Properties
         </button>
         <button 
            onClick={() => setActiveTab('code')} 
            className={`flex-1 py-3 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'code' 
                ? 'text-yellow-400 border-b-2 border-yellow-500 bg-[#111]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#252526]'
            }`}
         >
            Logic
         </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* --- PROPERTIES TAB --- */}
        {activeTab === 'props' && (
          <div className="p-4 flex flex-col gap-6">
            
            {/* A. IDENTITY (Name, ID) */}
            <div className="space-y-3">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Name</label>
                 <input 
                    className="inspector-input font-semibold text-blue-100" 
                    value={selectedObj.name} 
                    onChange={(e) => updateMain('name', e.target.value)} 
                    placeholder="Object Name"
                 />
               </div>
            </div>

            <div className="h-[1px] bg-[#333] w-full" />

            {/* B. TIMING (Start, Duration) */}
            {selectedObj.type !== 'stage' && (
               <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Start (s)</label>
                    <input 
                        type="number" step="0.1" min="0"
                        className="inspector-input font-mono text-yellow-100" 
                        value={selectedObj.start} 
                        onChange={(e) => updateMain('start', parseFloat(e.target.value))} 
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Duration (s)</label>
                    <input 
                        type="number" step="0.1" min="0.1"
                        className="inspector-input font-mono text-yellow-100" 
                        value={selectedObj.duration} 
                        onChange={(e) => updateMain('duration', parseFloat(e.target.value))} 
                    />
                 </div>
               </div>
            )}

             {selectedObj.type !== 'stage' && <div className="h-[1px] bg-[#333] w-full" />}

            {/* C. DYNAMIC FIELDS (From Registry) */}
            <div className="space-y-4">
                {Def?.fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{field.label}</label>
                        
                        {/* 1. TEXTAREA */}
                        {field.type === 'textarea' && (
                            <textarea 
                                className="inspector-input min-h-[80px] font-sans leading-relaxed resize-y"
                                value={selectedObj.properties[field.key]} 
                                onChange={(e) => updateProp(field.key, e.target.value)}
                                placeholder="Enter text content..." 
                            />
                        )}

                        {/* 2. NUMBER */}
                        {field.type === 'number' && (
                            <input 
                                type="number" 
                                className="inspector-input font-mono"
                                {...field.props}
                                value={selectedObj.properties[field.key]} 
                                onChange={(e) => updateProp(field.key, parseFloat(e.target.value))} 
                            />
                        )}

                        {/* 3. RANGE SLIDER */}
                         {field.type === 'range' && (
                            <div className="flex gap-3 items-center bg-[#111] border border-[#333] p-2 rounded">
                                <input 
                                    type="range" 
                                    className="flex-1 accent-blue-500 cursor-pointer h-1 bg-gray-700 rounded-lg appearance-none"
                                    {...field.props}
                                    value={selectedObj.properties[field.key]} 
                                    onChange={(e) => updateProp(field.key, parseFloat(e.target.value))} 
                                />
                                <span className="text-xs font-mono text-blue-400 w-10 text-right">
                                    {selectedObj.properties[field.key]}
                                </span>
                            </div>
                        )}

                        {/* 4. COLOR PICKER */}
                        {field.type === 'color' && (
                             <div className="flex gap-2 items-center">
                                <div className="relative w-8 h-8 rounded border border-[#444] overflow-hidden shrink-0">
                                    <input 
                                        type="color" 
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 m-0"
                                        value={selectedObj.properties[field.key]} 
                                        onChange={(e) => updateProp(field.key, e.target.value)} 
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    className="inspector-input font-mono uppercase text-gray-300"
                                    value={selectedObj.properties[field.key]} 
                                    onChange={(e) => updateProp(field.key, e.target.value)}
                                    maxLength={7}
                                />
                             </div>
                        )}
                        
                        {/* 5. READONLY / FILE INFO */}
                         {field.type === 'readonly' && (
                            <div className="inspector-input bg-[#1a1a1a] text-gray-500 truncate border-dashed italic select-all">
                                {String(selectedObj.properties[field.key])}
                            </div>
                        )}

                        {/* 6. GENERIC TEXT FALLBACK */}
                        {field.type === 'text' && (
                            <input 
                                type="text" 
                                className="inspector-input"
                                value={selectedObj.properties[field.key]} 
                                onChange={(e) => updateProp(field.key, e.target.value)} 
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Debug ID */}
            <div className="mt-auto pt-8">
                <div className="text-[10px] text-gray-600 font-mono text-center select-all">
                    ID: {selectedObj.id}
                </div>
            </div>

          </div>
        )}

        {/* --- LOGIC TAB --- */}
        {activeTab === 'code' && (
           <div className="h-full flex flex-col bg-[#1e1e1e]">
             <div className="flex-1 relative">
                <Editor 
                    height="100%" 
                    defaultLanguage="javascript" 
                    theme="vs-dark" 
                    value={localCode} 
                    onChange={(v) => setLocalCode(v||'')} 
                    options={{ 
                        minimap: { enabled: false }, 
                        fontSize: 13, 
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 }
                    }} 
                />
             </div>
             <div className="p-4 border-t border-[#333] bg-[#1e1e1e]">
                <button 
                    onClick={() => updateObject(selectedObj.id, { logic: localCode })} 
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                    Apply Changes (Ctrl+S)
                </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};