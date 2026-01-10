import React from 'react';
import { Monitor, Music } from 'lucide-react';
import type { ObjectDefinition, RenderProps } from '../types';

// --- STAGE (The Container) ---
// Note: Stage component logic is often handled by the Renderer wrapper, 
// but we define it here for the Inspector properties.
const StageComponent: React.FC<RenderProps> = () => null; // Rendered specially

export const StageObject: ObjectDefinition = {
  type: 'stage',
  label: 'Stage',
  icon: Monitor,
  category: 'special',
  create: () => ({ 
      name: 'Stage', duration: 9999, properties: { background: '#000000', zoom: 1, x: 0, y: 0 }, logic: '' 
  }),
  Component: StageComponent,
  fields: [
    { key: 'background', label: 'Background', type: 'color' },
    { key: 'zoom', label: 'Zoom Level', type: 'number', props: { step: 0.1 } },
    { key: 'x', label: 'Pan X', type: 'number' },
    { key: 'y', label: 'Pan Y', type: 'number' },
  ]
};

// --- AUDIO ---
const AudioComponent: React.FC<RenderProps> = () => null; // Rendered by AudioRenderer

export const AudioObject: ObjectDefinition = {
  type: 'audio',
  label: 'Audio',
  icon: Music,
  category: 'special',
  create: () => ({
    name: 'Audio', duration: 10, properties: { volume: 1, playbackRate: 1 }, 
    logic: `return { volume: props.volume, playbackRate: props.playbackRate }`
  }),
  Component: AudioComponent,
  fields: [
    { key: 'volume', label: 'Volume (0-1)', type: 'range', props: { min: 0, max: 1, step: 0.05 } },
    { key: 'playbackRate', label: 'Speed (x)', type: 'number', props: { step: 0.1 } },
    { key: 'src', label: 'File Source', type: 'readonly' }
  ]
};