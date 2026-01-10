# DevStudio: The Programmable Non-Linear Video Editor

**DevStudio** is a specialized video production environment built for software engineers who need to create technical explanatory videos (DSA, System Design, Tutorials) efficiently.

It replaces the "Drag-and-Drop Hell" of traditional tools (Premiere Pro, Final Cut) with a **"Code-First, Visual-Second"** workflow. You define object behavior using CSS/JavaScript logic, but arrange and preview them on a familiar visual timeline.

---

## 🚀 The Core Philosophy

**"State = f(Time)"**

In traditional editors, moving an object requires setting Keyframe A and Keyframe B.
In **DevStudio**, you write a render function. The engine calls this function 60 times a second, passing the current timestamp (`t`). Your code simply returns the CSS state for that specific millisecond.

* **No Keyframes:** You don't "move" objects. You define their existence relative to time.
* **Infinite Control:** You have full access to Math.sin(), interpolation, and conditional logic inside every object.
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
    * `type`: Div, Image, or Custom Component.
* **Styling (The "Logic" Hook):**
    Instead of static CSS, every object has a `logic` function string that executes every frame.
    * **Input:** `t` (Current Time), `start`, `duration`.
    * **Output:** A CSS Object (e.g., `{ opacity: 0.5, transform: '...' }`).

    ```javascript
    // Example: A box that slides in and pulses color
    const progress = (t - start) / duration;
    const slide = progress * 100; // Move 100px
    return {
       display: 'block',
       transform: `translateX(${slide}px)`,
       background: progress > 0.5 ? 'red' : 'blue' // Conditional Styling!
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
* **Preview:** Pressing Spacebar plays the audio via `Howler.js` and runs the `requestAnimationFrame` loop in perfect sync.

### 5. Export (Rendering)
Since the output is just an HTML Canvas/DOM stream:
* **Technique:** We use the native `MediaRecorder` API.
* **Process:** The engine locks the timeline, steps through it frame-by-frame (or plays realtime), captures the canvas stream, and compiles it into a `.webm` or `.mp4` video file directly in the browser.

---

## 🏗 System Architecture & Tech Stack

This project is a Single Page Application (SPA) built for performance.

### Tech Stack
* **Core:** [React 18](https://react.dev/) (UI Components) + [Vite](https://vitejs.dev/) (Build Tool).
* **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing for Schema validation).
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Handling the high-frequency 60fps loop outside React's render cycle).
* **Editor:** [Monaco Editor](https://github.com/suren-atoyan/monaco-react) (The VS Code editing experience embedded).
* **Animation Engine:** [GSAP](https://greensock.com/gsap/) (For timeline seeking and easing math).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Layout) + [Lucide React](https://lucide.dev/) (Icons).

### File Structure & Responsibilities

```text
src/
├── types/
│   └── schema.ts          # DEFINES THE SAVE FILE FORMAT.
│                          # Interfaces for Project, Track, VisualObject.
├── store/
│   └── useStore.ts        # THE BRAIN.
│                          # Holds 'currentTime', 'isPlaying', and the big 'project' JSON.
│                          # Actions: addTrack, updateObject, play, pause.
├── engine/
│   └── loop.ts            # THE HEARTBEAT.
│                          # Runs requestAnimationFrame.
│                          # Calculates 'delta' time.
│                          # Triggers the 'render()' function for all objects.
├── components/
│   ├── stage/
│   │   ├── Stage.tsx      # The 1920x1080 Container.
│   │   └── Renderer.tsx   # The component that actually maps JSON -> DOM elements.
│   ├── editor/
│   │   └── Inspector.tsx  # The Right Panel.
│   │                      # Contains the Monaco Editor where you write the JS logic.
│   └── timeline/
│       ├── Timeline.tsx   # The Bottom Panel.
│       ├── TrackBar.tsx   # The draggable green bars.
│       └── AudioTrack.tsx # The visual waveform.
└── App.tsx                # Layout Grid.


```

Developer Workflow (How to use it)
Setup:

Clone repo.

npm install

npm run dev

Import Assets:

Drag voiceover.mp3 into the timeline.

Drafting:

Scrub to a timestamp.

Click "Add Object" (Text, Div, or Image).

A default object appears.

Coding Behavior:

Select the object.

In the Inspector, switch to "Code" tab.

Write your CSS logic: return { opacity: (t-start)/duration }.

Hit Ctrl+S to apply instantly.

Refining:

Drag the timeline bars to adjust timing.

Use the "Scrubber" to verify the animation frame-by-frame.

Export:

Click "Render Video".

Download the final .webm file.
```