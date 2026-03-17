import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// axios baseURL 已在 services/api.js 中统一配置

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);