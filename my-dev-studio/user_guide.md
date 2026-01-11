# DevStudio User Guide

**DevStudio** is a specialized video production environment designed for developers. It replaces the traditional "Keyframe" model with a **"Code-First"** philosophy. You define behavior using JavaScript and CSS, and the engine renders it in real-time.

---

## 🧠 The Core Philosophy

**"State = f(Time)"**

In traditional video editors, you drag objects around and set keyframes. In DevStudio, every object is a function. The engine calls this function 60 times per second, passing in the current time (`t`). Your job is simply to return the CSS properties for that specific moment.

* **No "Move" Tool:** You don't move things; you define where they *are* based on `t`.
* **Infinite Precision:** You can use math (`Math.sin`, `Math.random`) to drive animation.
* **Web Native:** If it works in CSS (Flexbox, Grid, Box Shadows, Filters), it works in your video.

---

## 🌟 Key Features

### 1. The Object System
Everything on the timeline is a programmable object.
* **Standard Objects:** Text, Images, Shapes (Box, Circle), Diagrams (Arrows, Database, etc.).
* **Custom Code:** A special object type that lets you render raw HTML/SVG strings dynamically.
* **The Stage:** The background itself is an object. You can animate the camera (Zoom/Pan) and background color programmatically.

### 2. The Logic Editor
Select any object and switch to the **Logic** tab. This is where you write the Render Function.
* **Input:** `t`, `props` (Inspector fields), `start`, `duration`.
* **Output:** A JSON object representing CSS styles (e.g., `{ opacity: 1, left: '100px' }`).
* **Libraries:** Built-in access to **GSAP Easing** (`ease.elastic`, `ease.power2`) for smooth motion.

### 3. Project Settings & Audio
* **Settings:** Configure your canvas resolution (e.g., 1920x1080), Frame Rate (FPS), and total Duration.
* **Audio:** Upload MP3/WAV files for voiceovers or background music. The waveform is visualized on the top track to help you sync animation to speech.

### 4. Code-Driven Layouts
Objects can "talk" to each other.
* Use the `query('object_id')` function to get the live position of another element.
* *Example:* Make an arrow automatically point from "Server A" to "Database B," even if they are moving.

---

## 🎛 The Nudge System (Middleware Stack)

Sometimes you want to manually adjust an object (e.g., "Move this 50px right") without breaking its code-driven animation (e.g., "Bounce forever").

DevStudio uses a **Middleware Pipeline**. An object's final state is calculated layer-by-layer:
`Base Logic` $\to$ `Nudge 1` $\to$ `Nudge 2` $\to$ `Final State`

### How to Use Nudges
1.  **Select an Object** and look at the "Logic Pipeline" in the **Properties Panel**.
2.  Click **[+ Add Nudge]**. This creates a new "patch" layer.
3.  **Configure:**
    * **Time/Duration:** When does this patch apply? (Use `9999` duration for permanent changes).
    * **Code:** Click the `{}` icon to edit the specific logic for this nudge.

### The `prev` Variable
Nudges receive a special variable called `prev`, containing the state *before* the nudge ran.

* **Additive (Relative):**
    ```javascript
    return { ...prev, x: prev.x + 50 }; // Shift existing position
    ```
* **Override (Absolute):**
    ```javascript
    return { ...prev, opacity: 0 }; // Force hide
    ```

---

## 📚 Variable Reference

These variables are available inside any Logic or Nudge function:

| Variable | Type | Description |
| :--- | :--- | :--- |
| `t` | `number` | Current global timestamp (seconds). |
| `start` | `number` | The start time of the object (seconds). |
| `duration` | `number` | The duration of the object (seconds). |
| `props` | `object` | Static properties set in the UI (Color, Text, etc.). |
| `prev` | `object` | **(Nudges Only)** The calculated state from the previous layer. |
| `ease` | `GSAP` | The GSAP Easing library (e.g., `ease.elastic.out(p)`). |
| `query` | `func` | `query('id')` returns the state of another object. |
| `utils` | `object` | Helpers like `utils.followPath(t, pathArray)`. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + K` (or Ctrl+K) | Play / Pause |
| `Cmd + S` (or Ctrl+S) | Save Project (`.json`) |
| `Cmd + Enter` | Reset Timeline to `0s` |
| `Space` | (If timeline focused) Play / Pause |
| `Home` | Jump to Start |

---

## 🛠 Best Practices

1.  **Statelessness:** Your logic function should calculate the state for *right now*. Avoid side effects (like setting global variables).
2.  **Use `p` (Progress):** A common pattern is calculating progress:
    ```javascript
    const p = (t - start) / duration; // 0.0 to 1.0
    // Use p to drive animations
    ```
3.  **Naming:** Give your objects clear IDs (e.g., `server_icon`, `user_text`) so you can easily `query()` them later.
4.  **Nudge for Layout:** Write your complex animation logic (bouncing, fading) in the **Base Logic**, but use **Nudges** for final positioning on the screen. This keeps your code clean and reusable.

---

## 🎥 Export & Production Workflow

DevStudio is a **Real-Time Renderer**. There is no "Render to MP4" button yet. We use a "Screen Recording" workflow to ensure WYSIWYG (What You See Is What You Get) fidelity.

### Step 1: Presentation Mode
1.  Click the **PRESENT** button in the top right.
2.  This maximizes the stage to full screen and hides the UI.
3.  Hide your mouse cursor (move it to the edge).

### Step 2: Record (Mac/Windows)
1.  Open **QuickTime Player** (Mac) or **OBS** (Windows/Linux).
2.  Start a **Screen Recording**.
3.  Select the entire screen.
4.  In DevStudio, press `Ctrl + Enter` (Reset) and then `Ctrl+K` (Play).
5.  Let the video play through.

### Step 3: Crop & Polish
1.  Import your screen recording into a simple editor (CapCut, iMovie, Premiere).
2.  **Crop** the video to the stage bounds (usually 1920x1080).
3.  Add final background music or sound effects if needed.
4.  Export your final `.mp4`.