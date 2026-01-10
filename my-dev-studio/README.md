# DevStudio: The Programmable Non-Linear Video Editor

**DevStudio** is a specialized video production environment built for software engineers who need to create technical explanatory videos (DSA, System Design, Tutorials) efficiently.

It replaces the "Drag-and-Drop Hell" of traditional tools (Premiere Pro, Final Cut) with a **"Code-First, Visual-Second"** workflow. You define object behavior using CSS/JavaScript logic, but arrange and preview them on a familiar visual timeline.

---

## 🚀 The Core Philosophy

**"State = f(Time)"**

In traditional editors, moving an object requires setting Keyframe A and Keyframe B.
In **DevStudio**, you write a render function. The engine calls this function 60 times a second, passing the current timestamp (`t`). Your code simply returns the CSS state for that specific millisecond.

* **No Keyframes:** You don't "move" objects. You define their existence relative to time.
* **Infinite Control:** You have full access to `Math.sin()`, interpolation, and conditional logic inside every object.
* **Browser Native:** If you can do it in CSS/HTML (Flexbox, Grid, Borders, Shadows), you can do it in your video.

---

## 🛠 Feature Breakdown

### 1. The Stage (Global Frame Properties)
The "Stage" is the canvas container. Unlike a static video background, the Stage itself is programmable.
* **Global Variables:** You can animate global properties based on the timeline.
    * *Example:* At `t=10s`, change background from `#000` to `#333` and `zoom` to `1.2x`.
* **Camera Control:** The stage supports CSS transforms (Scale/Translate) to simulate camera pans and zooms programmatically.

### 2. The Object System (HTML/CSS/JS)
Every element on screen (Text, Box, Image, SVG) is a standard DOM element wrapped in a "Smart Container."
* **Definition:** You define objects via a config object or the GUI.
* **Properties:**
    * `id`: Unique identifier (e.g., `obj_array_box`).
    * `start`: Timestamp when it appears.
    * `duration`: How long it stays.
* **Styling (The "Logic" Hook):**
    Instead of static CSS, every object has a `logic` function string that executes every frame.
    * **Input:** `t` (Current Time), `start`, `duration`, `props` (Static Props), `query` (Find other objects), `ease` (GSAP Library).
    * **Output:** A CSS Object (e.g., `{ opacity: 0.5, transform: '...' }`).

    ```javascript
    // Example: A box that slides in with an Elastic easing
    const p = (t - start) / duration; // 0 to 1 progress
    
    // Use the injected 'ease' (GSAP) for smooth animation
    const y = ease.elastic.out(p) * 200; 

    return {
       display: 'flex',
       transform: `translateY(${y}px)`,
       background: p > 0.5 ? 'red' : 'blue' // Conditional Styling!
    };
    ```

### 3. The Timeline (Sequencer)
A visual interface to manage the "When," while code manages the "How."
* **Tracks:**
    * **Audio Track (Top):** Fixed waveform visualization. "Locked" to the master clock.
    * **Object Tracks (Bottom):** Draggable bars representing the lifespan (`start` to `end`) of visual objects.
* **Scrubbing:** Dragging the playhead updates the global `currentTime` variable, instantly triggering a re-render of all active objects. No "rendering" wait time—it's live DOM manipulation.

### 4. Audio Syncing
Audio is treated as a "Global Reference."
* **Workflow:** You upload an MP3 (e.g., voiceover).
* **Sync:** You play the audio. When you hear a specific word (e.g., "Binary Search" at 0:05), you simply drag your "Array Object" on the timeline to start at 0:05.

### 5. Advanced System Design (Querying)
Objects can "talk" to each other using the `query()` function. This is critical for connecting arrows or dynamic layouts.
* *Example:* An Arrow object can ask for the position of "Box A" and "Box B" and draw a line between them automatically, even if the boxes are moving.

---

## 🏗 System Architecture & Performance

This project is a Single Page Application (SPA) optimized for 60fps playback.

### Tech Stack
* **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Handling the high-frequency loop outside React's render cycle).
* **Editor:** [Monaco Editor](https://github.com/suren-atoyan/monaco-react).
* **Animation Engine:** [GSAP](https://greensock.com/gsap/) (Injected as `ease` into user scope).

### The Rendering Pipeline
1. **The Loop:** `requestAnimationFrame` updates `currentTime` in the Zustand store.
2. **The Renderer:** The `Renderer` component subscribes to the store.
3. **JIT Compilation (Caching):**
   To avoid the performance hit of `new Function()` on every frame, the Renderer maintains a **Logic Cache**. User code is only compiled when the string changes.
4. **Frame Cache:**
   To allow objects to query each other without infinite recursion or double-calculation, the state of every object is cached for the duration of the single frame.

### File Structure

```text
src/
├── types/
│   └── schema.ts          # DEFINES THE SAVE FILE FORMAT.
├── store/
│   └── useStore.ts        # THE BRAIN (Time & Project State).
├── engine/
│   └── loop.ts            # THE HEARTBEAT (RAF Loop).
├── registry/              # OBJECT DEFINITIONS
│   ├── index.ts           # Central registry of all object types
│   └── definitions/       # Individual object logic (Box, Text, Custom)
├── components/
│   ├── stage/
│   │   ├── Renderer.tsx   # THE ENGINE. Handles JIT Compilation & Rendering.
│   │   └── AudioRenderer.tsx
│   ├── editor/
│   │   └── Inspector.tsx  # Monaco Editor Integration.
│   └── timeline/          # Visual Timeline Components.
└── App.tsx
```

## 🧩 How to Create Custom Objects

DevStudio is designed to be extensible. You can add new types of objects (e.g., a "Tweet Card," "Terminal Window," or "Progress Bar") by following these two steps.

### Step 1: Create the Component Definition
Create a new file: `src/registry/definitions/ProgressBar.tsx`.

A custom object definition has two parts:
1. **The Config:** Metadata like the display name and default properties.
2. **The Component:** A standard React component that receives the computed `state`.

```
// src/registry/definitions/ProgressBar.tsx
import React from 'react';
import { ObjectDefinition, ObjectProps } from '../types';

// 1. The React Component
// 'state' is the calculated result from the user's Logic code (CSS/JS).
const ProgressBarComponent: React.FC<ObjectProps> = ({ state }) => {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        // We allow the user to override background color via logic
        background: state.backgroundColor || '#1e1e1e' 
      }}
    >
      <div 
        style={{
          height: '100%',
          background: state.barColor || '#00ff00',
          // The width is controlled by the logic engine!
          width: `${state.progress || 0}%`, 
          transition: 'width 0.1s linear'
        }} 
      />
    </div>
  );
};

// 2. The Definition
export const ProgressBarDefinition: ObjectDefinition = {
  id: 'progress_bar', // Internal type ID
  label: 'Progress Bar', // UI Label
  Component: ProgressBarComponent,
  
  // These properties appear in the "Inspector" panel
  defaultProperties: {
    backgroundColor: '#1e1e1e',
    barColor: '#00ff00',
    progress: 0
  },
  
  // The default Logic code that users will see when they add this object
  defaultLogic: `
// Standard Progress Logic
const p = (t - start) / duration; // 0.0 to 1.0
return {
  progress: p * 100, // Drive the width
  barColor: p > 0.8 ? 'red' : '#00ff00' // Change color near end
};
`
};

```

### Step 2: Register it

Open `src/registry/index.ts` and add your new definition to the list.

```typescript
// src/registry/index.ts
import { ProgressBarDefinition } from './definitions/ProgressBar'; 

// ... other imports

export const OBJECT_DEFINITIONS: Record<string, ObjectDefinition> = {
    // ... existing objects
    progress_bar: ProgressBarDefinition, // <--- Add this line
};

```

That's it! The "Progress Bar" will now appear in your "Add Object" menu.

---

## 🧠 Writing Logic Code (The User Guide)

When you select an object in the editor, you see a code editor. This is the **Render Function**. It runs 60 times a second.

### Available Variables

| Variable | Type | Description |
| --- | --- | --- |
| `t` | `number` | Current global time (in seconds). |
| `start` | `number` | When this object appears (seconds). |
| `duration` | `number` | How long this object lasts (seconds). |
| `props` | `object` | The static properties set in the inspector (e.g., color, text). |
| `ease` | `GSAP` | The full GSAP Easing library. |
| `query` | `fn` | `query('id')` returns the current state of another object. |

### Recipes

#### 1. Basic Movement

```javascript
// Slide from left (0px) to right (500px)
const p = (t - start) / duration; // 0 to 1
const x = p * 500;
return { transform: `translateX(${x}px)` };

```

#### 2. Smooth Animation (Easing)

```javascript
const p = (t - start) / duration;
// Use Elastic easing for a bouncy effect
const scale = ease.elastic.out(p); 
return { 
    transform: `scale(${scale})`,
    opacity: p
};

```

#### 3. Connecting Objects (The Arrow)

*Scenario: You want an arrow to always point from "Box A" to "Box B", even if they move.*

```javascript
// Get the LIVE state of other objects
const boxA = query('box_a');
const boxB = query('box_b');

if (!boxA || !boxB) return { opacity: 0 };

// Calculate distance/angle (simplified)
const dx = boxB.x - boxA.x;
const dy = boxB.y - boxA.y;
const angle = Math.atan2(dy, dx) * (180 / Math.PI);

return {
    left: boxA.x,
    top: boxA.y,
    width: Math.sqrt(dx*dx + dy*dy),
    transform: `rotate(${angle}deg)`
};

```
