import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bowlby-one/400.css';
import '@fontsource-variable/nunito/wght.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
