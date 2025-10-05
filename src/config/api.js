// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://data-entry-backend-pkeo.onrender.com'
    : 'http://localhost:5000');

export { API_BASE_URL };