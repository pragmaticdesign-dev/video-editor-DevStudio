import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';

export const Inspector: React.FC = () => {
  const selectedId = useStore((state) => state.selectedObjectId);
  const project = useStore((state) => state.project);
  const updateObject = useStore((state) => state.updateObject);

  // Find the actual object data based on ID
  const selectedObj = project.objects.find(o => o.id === selectedId);

  // Local state for the editor value (to prevent stuttering while typing)
  const [code, setCode] = useState('');

  // Sync local state when selection changes
  useEffect(() => {
    if (selectedObj) {
      setCode(selectedObj.logic);
    }
  }, [selectedObj?.id]); // Only reset when switching objects

  if (!selectedObj) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select an object on the stage to edit its logic.
      </div>
    );
  }

  const handleSave = () => {
    if (selectedId) {
      updateObject(selectedId, { logic: code });
      alert('Logic Updated!'); // Temporary feedback
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333]">
      {/* Header */}
      <div className="p-3 bg-[#252526] border-b border-[#333] flex justify-between items-center">
        <span className="font-bold text-gray-300 text-sm">{selectedObj.name} (JS)</span>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
        >
          Apply (Ctrl+S)
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'off',
            folding: false,
          }}
        />
      </div>

      {/* Helper Footer */}
      <div className="p-2 text-[10px] text-gray-500 bg-[#252526] border-t border-[#333]">
        Available: <code>t</code> (time), <code>start</code>, <code>duration</code>
      </div>
    </div>
  );
};