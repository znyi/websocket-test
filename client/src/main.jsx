import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SerialProvider from './providers/SerialProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SerialProvider>
      <App />
    </SerialProvider>
  </React.StrictMode>,
)
