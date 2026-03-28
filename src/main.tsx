import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

document.body.innerHTML = '<div id="root"></div><div style="position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:9999">TEXLY BOOTING...</div>';

console.log('Texly Main: Initializing...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Texly Main: Root element not found!');
} else {
  console.log('Texly Main: Root element found, rendering...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
