import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/myStyles.css'
import 'bootstrap/dist/css/bootstrap.min.css' 
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)