import { useState } from 'react'
import PropTypes from 'prop-types'

const LoginAdmin = ({ onLogin }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Contraseña maestra codificada localmente
  const ADMIN_PASSWORD = 'admin123'

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simular un pequeño delay para la experiencia de usuario
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin()
      } else {
        setError('Contraseña incorrecta')
        setPassword('')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Acceso Administrador
          </h1>
          <p className="text-white/80">
            Ingresa la contraseña para acceder al panel de administración
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

LoginAdmin.propTypes = {
  onLogin: PropTypes.func.isRequired
}

export default LoginAdmin