import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
