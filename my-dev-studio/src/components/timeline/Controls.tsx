import React from 'react';
import { Plus, Image as ImageIcon, Type } from 'lucide-react'; // Make sure to npm install lucide-react
import { useStore } from '../../store/useStore';

export const TimelineControls: React.FC = () => {
  const addObject = useStore((state) => state.addObject);
  const currentTime = useStore((state) => state.currentTime);

  const handleAddText = () => {
    addObject({
      id: `text_${Date.now()}`,
      type: 'text',
      name: 'New Text',
      content: 'Edit Me...',
      start: currentTime, // Start exactly where the playhead is
      duration: 3,
      logic: `return { 
  opacity: 1, 
  color: 'white',
  fontSize: '24px',
  display: 'flex', alignItems: 'center', justifyContent: 'center' 
}`
    });
  };

  const handleAddImage = () => {
    const url = prompt("Enter Image URL:");
    if (!url) return;
    
    addObject({
      id: `img_${Date.now()}`,
      type: 'img',
      name: 'Image',
      content: url,
      start: currentTime,
      duration: 5,
      logic: `const p = (t-start)/duration; 
return { 
  opacity: p < 0.1 ? p*10 : 1, // Fade in
  width: '100%', height: '100%' 
}`
    });
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-700 bg-gray-800">
      <span className="text-xs text-gray-400 font-bold px-2">ADD:</span>
      
      <button 
        onClick={handleAddText}
        className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
      >
        <Type size={14} /> Text
      </button>

      <button 
        onClick={handleAddImage}
        className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
      >
        <ImageIcon size={14} /> Image
      </button>
    </div>
  );
};