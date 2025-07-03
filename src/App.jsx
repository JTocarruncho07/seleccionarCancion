import { Routes, Route, Navigate } from 'react-router-dom'
import Usuario from './components/Usuario'
import Admin from './components/Admin'
import LoginAdmin from './components/LoginAdmin'
import { useEffect, useState } from 'react'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay sesión activa
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession) {
      const sessionData = JSON.parse(adminSession)
      const now = new Date().getTime()
      
      // Verificar si la sesión no ha expirado (24 horas)
      if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminSession')
      }
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    // Guardar sesión
    localStorage.setItem('adminSession', JSON.stringify({
      timestamp: new Date().getTime(),
      authenticated: true
    }))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminSession')
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/usuario" replace />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? 
              <Admin onLogout={handleLogout} /> : 
              <LoginAdmin onLogin={handleLogin} />
          } 
        />
        <Route path="*" element={<Navigate to="/usuario" replace />} />
      </Routes>
    </div>
  )
}

export default App