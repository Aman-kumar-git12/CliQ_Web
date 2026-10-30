import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { UserContextProvider } from './context/userContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter basename="/">
        <UserContextProvider>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </UserContextProvider>
    </BrowserRouter>
)
