import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Configure axios base URL for production deployment
axios.defaults.baseURL = 'https://data-entry-backend-pkeo.onrender.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
