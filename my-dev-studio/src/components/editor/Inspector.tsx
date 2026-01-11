// src/components/editor/Inspector.tsx
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { getDefinition } from '../../registry';
import { Trash2, Plus, Play, Square, Code2, Edit3, ArrowLeft } from 'lucide-react';

export const Inspector: React.FC = () => {
  const { 
      selectedObjectId, project, updateObject, currentTime, 
      addNudge, updateNudge, removeNudge 
  } = useStore();
  
  const selectedObj = project.objects.find(o => o.id === selectedObjectId);
  
  // UI STATE
  // 'props' = Master View (Fields + Stack)
  // 'code'  = Detail View (Editor)
  const [activeTab, setActiveTab] = useState<'props' | 'code'>('props');
  
  // Editing Context:
  // null = Base Logic
  // string = Nudge ID
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  
  // Local code buffer for the editor
  const [localCode, setLocalCode] = useState('');

  // --- SYNC CODE EDITOR ---
  useEffect(() => {
    if (!selectedObj) return;
    
    if (editingTarget === null) {
        // Load Base Logic
        setLocalCode(selectedObj.logic);
    } else {
        // Load Nudge Logic
        const nudge = selectedObj.nudges?.find(n => n.id === editingTarget);
        if (nudge) setLocalCode(nudge.logic);
    }
  }, [selectedObj, editingTarget]); // Re-run when selection or target changes

  if (!selectedObj) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest">
        No Object Selected
      </div>
    );
  }

  const Def = getDefinition(selectedObj.type);

  // --- ACTIONS ---

  const handleSaveCode = () => {
      if (editingTarget === null) {
          updateObject(selectedObj.id, { logic: localCode });
      } else {
          updateNudge(selectedObj.id, editingTarget, { logic: localCode });
      }
  };

  const handleAddNudge = () => {
      const id = `nudge_${Date.now()}`;
      // Create new nudge starting at current time
      addNudge(selectedObj.id, {
          id,
          name: 'New Modifier',
          start: Number(currentTime.toFixed(2)),
          duration: 9999, // Default to infinite/rest of scene
          active: true,
          logic: `// Additive Modifier\nreturn {\n  ...prev,\n  // x: prev.x + 50\n};`
      });
      
      // Auto-focus the new nudge
      setEditingTarget(id);
      setActiveTab('code');
  };

  const switchToLogic = (targetId: string | null) => {
      setEditingTarget(targetId);
      setActiveTab('code');
  };

  // Helpers for simple field updates
  const updateMain = (key: string, val: any) => updateObject(selectedObj.id, { [key]: val });
  const updateProp = (key: string, val: any) => {
    updateObject(selectedObj.id, {
      properties: { ...selectedObj.properties, [key]: val }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333]">
      
      {/* --- TABS HEADER --- */}
      <div className="flex border-b border-[#333] bg-[#1e1e1e] shrink-0">
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
            Logic / Patches
         </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        
        {/* ================= PROPERTIES TAB (MASTER VIEW) ================= */}
        {activeTab === 'props' && (
          <div className="p-4 flex flex-col gap-6">
            
            {/* 1. IDENTITY & TIMING */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-gray-500 font-bold">Name</label>
                    <input 
                       className="inspector-input font-bold text-blue-100 text-sm" 
                       value={selectedObj.name} 
                       onChange={(e) => updateMain('name', e.target.value)} 
                       placeholder="Object Name"
                    />
                </div>
                
                {selectedObj.type !== 'stage' && (
                    <div className="grid grid-cols-2 gap-3">
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase text-gray-500 font-bold">Start (s)</label>
                            <input type="number" step="0.1" className="inspector-input font-mono text-yellow-100" value={selectedObj.start} onChange={(e) => updateMain('start', parseFloat(e.target.value))} />
                         </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase text-gray-500 font-bold">Duration (s)</label>
                            <input type="number" step="0.1" className="inspector-input font-mono text-yellow-100" value={selectedObj.duration} onChange={(e) => updateMain('duration', parseFloat(e.target.value))} />
                         </div>
                    </div>
                )}
            </div>

            <div className="h-[1px] bg-[#333] w-full" />

            {/* 2. FIELDS (From Registry) */}
            <div className="space-y-4">
                {Def?.fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase text-gray-500 font-bold">{field.label}</label>
                        
                        {/* Render Field Inputs based on Type */}
                        {field.type === 'color' ? (
                             <div className="flex gap-2 items-center">
                                <div className="w-6 h-6 rounded border border-[#444] overflow-hidden shrink-0 relative">
                                    <input type="color" className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" value={selectedObj.properties[field.key]} onChange={(e) => updateProp(field.key, e.target.value)} />
                                </div>
                                <input type="text" className="inspector-input font-mono uppercase text-gray-300" value={selectedObj.properties[field.key]} onChange={(e) => updateProp(field.key, e.target.value)} />
                             </div>
                        ) : field.type === 'textarea' ? (
                            <textarea className="inspector-input min-h-[60px]" value={selectedObj.properties[field.key]} onChange={(e) => updateProp(field.key, e.target.value)} />
                        ) : (
                            <input className="inspector-input" value={selectedObj.properties[field.key]} onChange={(e) => updateProp(field.key, e.target.value)} />
                        )}
                    </div>
                ))}
            </div>

            <div className="h-[1px] bg-[#333] w-full" />

            {/* 3. LOGIC PIPELINE (THE STACK) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] uppercase text-blue-400 font-bold tracking-widest">Logic Pipeline</label>
                    <button onClick={handleAddNudge} className="text-xs bg-blue-900/30 hover:bg-blue-800 text-blue-300 p-1 rounded border border-blue-800 transition-colors" title="Add Nudge">
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    
                    {/* A. BASE LAYER */}
                    <div className="bg-[#111] border border-[#333] rounded p-2 flex items-center justify-between group hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => switchToLogic(null)}>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                            <span className="text-xs font-bold text-gray-200">Base Behavior</span>
                        </div>
                        <button className="opacity-50 group-hover:opacity-100 hover:text-white transition-opacity">
                            <Edit3 size={14} />
                        </button>
                    </div>

                    {/* B. NUDGE LAYERS */}
                    {(selectedObj.nudges || []).map((nudge) => {
                        const isActive = currentTime >= nudge.start && currentTime < (nudge.start + nudge.duration);
                        return (
                            <div key={nudge.id} className="bg-[#181818] border border-[#2a2a2a] rounded p-2 flex flex-col gap-2 group hover:border-yellow-500/30 transition-colors">
                                {/* Header Row */}
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateNudge(selectedObj.id, nudge.id, { active: !nudge.active }); }}
                                        title={nudge.active ? "Mute Nudge" : "Unmute Nudge"}
                                    >
                                        {nudge.active ? <Play size={10} className="text-green-500 fill-current" /> : <Square size={10} className="text-gray-600 fill-current" />}
                                    </button>
                                    
                                    <input 
                                        className="bg-transparent text-xs font-mono text-gray-300 focus:text-white outline-none w-full placeholder-gray-600"
                                        value={nudge.name}
                                        onChange={(e) => updateNudge(selectedObj.id, nudge.id, { name: e.target.value })}
                                        placeholder="Nudge Name"
                                    />
                                    
                                    {/* Indicator Dot (Context Aware) */}
                                    <div 
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive && nudge.active ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`} 
                                        title={isActive ? "Active in current frame" : "Inactive in current frame"} 
                                    />
                                </div>

                                {/* Meta Row */}
                                <div className="flex items-center gap-2 pl-4">
                                    <span className="text-[9px] text-gray-500 font-mono">T:</span>
                                    <input type="number" className="w-12 bg-[#111] border border-[#333] text-[9px] text-gray-400 rounded px-1 focus:border-blue-500 outline-none" 
                                        value={nudge.start} onChange={(e) => updateNudge(selectedObj.id, nudge.id, { start: parseFloat(e.target.value) })}
                                    />
                                    <span className="text-[9px] text-gray-500 font-mono">D:</span>
                                    <input type="number" className="w-12 bg-[#111] border border-[#333] text-[9px] text-gray-400 rounded px-1 focus:border-blue-500 outline-none" 
                                        value={nudge.duration} onChange={(e) => updateNudge(selectedObj.id, nudge.id, { duration: parseFloat(e.target.value) })}
                                    />
                                    
                                    <div className="flex-1" />
                                    
                                    <button onClick={() => switchToLogic(nudge.id)} className="text-gray-500 hover:text-yellow-400 transition-colors p-1" title="Edit Logic">
                                        <Code2 size={12} />
                                    </button>
                                    <button onClick={() => removeNudge(selectedObj.id, nudge.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Delete">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

          </div>
        )}

        {/* ================= LOGIC TAB (DETAIL VIEW) ================= */}
        {activeTab === 'code' && (
           <div className="h-full flex flex-col bg-[#1e1e1e]">
             {/* Breadcrumb Header */}
             <div className="flex items-center gap-2 p-2 bg-[#111] border-b border-[#333] shrink-0">
                <button onClick={() => setActiveTab('props')} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
                    <ArrowLeft size={14} />
                </button>
                <span className="text-xs font-mono text-gray-400 truncate">
                    Editing: <span className="text-yellow-400 font-bold ml-1">
                        {editingTarget === null 
                            ? "Base Behavior" 
                            : selectedObj.nudges?.find(n => n.id === editingTarget)?.name || "Unknown Nudge"
                        }
                    </span>
                </span>
             </div>

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
             
             <div className="p-4 border-t border-[#333] bg-[#1e1e1e] shrink-0">
                <button 
                    onClick={handleSaveCode} 
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