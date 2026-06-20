const rawConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(arg => {
    if (arg instanceof Error) {
      return arg.message + ' ' + (arg.stack || '');
    }
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');

  if (msg.includes('wps.com') || msg.includes('getUserInfo')) {
    return;
  }
  rawConsoleError(...args);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
