import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registrar Service Worker para PWA
// Registra o Service Worker (produção); em dev ficará desabilitado pela config do plugin
registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(<App />);
