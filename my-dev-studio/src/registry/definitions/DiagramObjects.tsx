import React from 'react';
import { ArrowRight, Minus, Database, GitMerge, SquareAsterisk } from 'lucide-react';
import type { ObjectDefinition, RenderProps } from '../types';

// Shared create logic for diagram shapes
const createDiagram = (name: string, color = '#ffffff') => ({
    name,
    duration: 4,
    properties: { color, strokeWidth: 2 },
    logic: `return { width: '100%', height: '100%', color: props.color }`
});

// Shared fields
const diagramFields: any[] = [
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'strokeWidth', label: 'Thickness', type: 'number' }
];

// --- ARROW ---
const ArrowComponent: React.FC<RenderProps> = ({ state }) => (
    <svg viewBox="0 0 24 24" preserveAspectRatio="none" style={{overflow:'visible', ...state}}>
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth={state.strokeWidth} fill="none" vectorEffect="non-scaling-stroke"/>
    </svg>
);
export const ArrowObject: ObjectDefinition = {
    type: 'arrow', label: 'Arrow', icon: ArrowRight, category: 'diagram',
    create: () => createDiagram('Arrow'),
    Component: ArrowComponent, fields: diagramFields
};

// --- LINE ---
const LineComponent: React.FC<RenderProps> = ({ state }) => (
    <div className="w-full bg-current" style={{ height: (state.strokeWidth || 2) + 'px', backgroundColor: state.color, marginTop: 'auto', marginBottom: 'auto', ...state }} />
);
export const LineObject: ObjectDefinition = {
    type: 'line', label: 'Line', icon: Minus, category: 'diagram',
    create: () => createDiagram('Line'),
    Component: LineComponent, fields: diagramFields
};

// --- CYLINDER (Database) ---
const CylinderComponent: React.FC<RenderProps> = ({ state }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{color:state.color, ...state}}>
        <path d="M12 3c4.418 0 8 1.343 8 3s-3.582 3-8 3-8-1.343-8-3 3.582-3 8-3z"/>
        <path d="M20 6v12c0 1.657-3.582 3-8 3s-8-1.343-8-3V6c0 1.657 3.582 3 8 3s8-1.343 8-3z" opacity="0.8"/>
    </svg>
);
export const CylinderObject: ObjectDefinition = {
    type: 'cylinder', label: 'Database', icon: Database, category: 'diagram',
    create: () => createDiagram('DB', '#10b981'),
    Component: CylinderComponent, fields: [{ key: 'color', label: 'Color', type: 'color' }]
};

// --- RHOMBUS ---
const RhombusComponent: React.FC<RenderProps> = ({ state }) => (
    <div className="w-full h-full bg-current transform rotate-45 scale-75" style={{ backgroundColor: state.color, ...state }} />
);
export const RhombusObject: ObjectDefinition = {
    type: 'rhombus', label: 'Decision', icon: GitMerge, category: 'diagram',
    create: () => createDiagram('Decision', '#f59e0b'),
    Component: RhombusComponent, fields: [{ key: 'color', label: 'Color', type: 'color' }]
};

// --- PARALLELOGRAM ---
const ParallelogramComponent: React.FC<RenderProps> = ({ state }) => (
    <div className="w-full h-full bg-current transform -skew-x-12 origin-center" style={{ backgroundColor: state.color, ...state }} />
);
export const ParallelogramObject: ObjectDefinition = {
    type: 'parallelogram', label: 'I/O', icon: SquareAsterisk, category: 'diagram',
    create: () => createDiagram('Input/Output', '#8b5cf6'),
    Component: ParallelogramComponent, fields: [{ key: 'color', label: 'Color', type: 'color' }]
};