import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure loader to use the local npm package instead of CDN
loader.config({ monaco });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
