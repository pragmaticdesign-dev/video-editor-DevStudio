// src/hooks/useAutosave.ts
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

// CHANGE: Added 'export' so App.tsx can clear this key
export const AUTOSAVE_KEY = 'devstudio_autosave_v1';

export const useAutosave = () => {
  const { project, loadProject } = useStore();
  const projectRef = useRef(project);

  // Keep ref updated
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // 1. Load on Startup
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.objects) {
          console.log("[Autosave] Restoring project:", parsed.name);
          loadProject(parsed);
        }
      } catch (e) {
        console.error("Failed to load autosave", e);
      }
    }
  }, []);

  // 2. Save Interval (Every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProject = projectRef.current;
      
      try {
        // --- OPTIMIZATION: STRIP BASE64 DATA ---
        const safeJson = JSON.stringify(currentProject, (key, value) => {
          if (typeof value === 'string' && value.startsWith('data:')) {
            return undefined; 
          }
          return value;
        });

        localStorage.setItem(AUTOSAVE_KEY, safeJson);
      } catch (err) {
        console.warn("[Autosave] Quota exceeded or error", err);
      }
      
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
};