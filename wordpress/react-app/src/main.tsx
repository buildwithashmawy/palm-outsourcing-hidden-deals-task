import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/reset.css';

import { App } from './App';

const root = document.getElementById('hidden-deals-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
