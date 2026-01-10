// src/hooks/useAutosave.ts
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const AUTOSAVE_KEY = 'devstudio_autosave_v1';

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
        // We use a custom 'replacer' function for JSON.stringify.
        // If a value is a huge Base64 string (Image/Audio), we skip it to save space.
        const safeJson = JSON.stringify(currentProject, (key, value) => {
          if (typeof value === 'string' && value.startsWith('data:')) {
            return undefined; // Do not save this heavy data to LocalStorage
          }
          return value;
        });

        localStorage.setItem(AUTOSAVE_KEY, safeJson);
        // console.log(`[Autosave] Saved lightweight state for ${currentProject.name}`);
      } catch (err) {
        console.warn("[Autosave] Quota exceeded or error", err);
      }
      
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
};