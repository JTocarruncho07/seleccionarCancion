import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import PropTypes from 'prop-types'
import { Music } from 'lucide-react'

const Admin = ({ onLogout }) => {
  const [solicitudes, setSolicitudes] = useState([])
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [reproducidas, setReproducidas] = useState(new Set())

  const QR_URL = 'https://seleccionarcancion.netlify.app/usuario'

  useEffect(() => {
    // Cargar solicitudes iniciales
    cargarSolicitudes()
    
    // Cargar canciones reproducidas
    const reproducidasGuardadas = JSON.parse(localStorage.getItem('cancionesReproducidas') || '[]')
    setReproducidas(new Set(reproducidasGuardadas))

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'solicitudesCanciones') {
        cargarSolicitudes()
        
        // Mostrar notificación si está habilitada
        if (notificationsEnabled && e.newValue) {
          const solicitudes = JSON.parse(e.newValue)
          const ultimaSolicitud = solicitudes[solicitudes.length - 1]
          
          if (ultimaSolicitud && 'Notification' in window) {
            new Notification('🎵 Nueva solicitud de canción', {
              body: ultimaSolicitud.cancion,
              icon: '/icon.svg',
              tag: 'nueva-cancion'
            })
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Manejar instalación PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Verificar estado de notificaciones
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [notificationsEnabled])

  const cargarSolicitudes = () => {
    const solicitudesGuardadas = JSON.parse(localStorage.getItem('solicitudesCanciones') || '[]')
    setSolicitudes(solicitudesGuardadas.reverse()) // Más recientes primero
  }

  const agruparSolicitudesPorFecha = () => {
    const grupos = {}
    
    solicitudes.forEach(solicitud => {
      const fecha = new Date(solicitud.timestamp).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!grupos[fecha]) {
        grupos[fecha] = []
      }
      grupos[fecha].push(solicitud)
    })
    
    return grupos
  }

  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
      
      if (permission === 'granted') {
        new Notification('🎵 Notificaciones activadas', {
          body: 'Recibirás notificaciones de nuevas solicitudes de canciones',
          icon: '/icon.svg'
        })
      }
    }
  }

  const instalarPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      }
    }
  }

  const imprimirQR = () => {
    setShowQRModal(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const eliminarSolicitud = (id) => {
    const solicitudesFiltradas = solicitudes.filter(s => s.id !== id)
    setSolicitudes(solicitudesFiltradas)
    localStorage.setItem('solicitudesCanciones', JSON.stringify(solicitudesFiltradas.reverse()))
  }

  const limpiarTodas = () => {
    if (confirm('¿Estás seguro de que deseas eliminar todas las solicitudes?')) {
      setSolicitudes([])
      setReproducidas(new Set())
      localStorage.setItem('solicitudesCanciones', '[]')
      localStorage.setItem('cancionesReproducidas', '[]')
    }
  }

  const toggleReproducida = (id) => {
    const nuevasReproducidas = new Set(reproducidas)
    if (nuevasReproducidas.has(id)) {
      nuevasReproducidas.delete(id)
    } else {
      nuevasReproducidas.add(id)
    }
    setReproducidas(nuevasReproducidas)
    
    // Guardar en localStorage
    localStorage.setItem('cancionesReproducidas', JSON.stringify(Array.from(nuevasReproducidas)))
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                <p className="text-white/70 text-sm">Gestiona las solicitudes musicales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botón PWA */}
              {showInstallPrompt && (
                <button
                  onClick={instalarPWA}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>📱</span>
                  <span>Instalar App</span>
                </button>
              )}
              
              {/* Botón Notificaciones */}
              {!notificationsEnabled && (
                <button
                  onClick={solicitarPermisoNotificaciones}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🔔</span>
                  <span>Activar Notificaciones</span>
                </button>
              )}
              
              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Solicitudes */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Canciones</h2>
                  <p className="text-gray-600">Total: {solicitudes.length} solicitudes</p>
                </div>
                {solicitudes.length > 0 && (
                  <button
                    onClick={limpiarTodas}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>

              {/* Lista de solicitudes */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {solicitudes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <Music className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No hay solicitudes</h3>
                    <p className="text-gray-400">Las nuevas solicitudes aparecerán aquí automáticamente</p>
                  </div>
                ) : (
                  Object.entries(agruparSolicitudesPorFecha()).map(([fecha, solicitudesDelDia]) => (
                    <div key={fecha} className="space-y-3">
                      <div className="sticky top-0 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-700 text-sm capitalize">
                          📅 {fecha}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {solicitudesDelDia.map((solicitud) => {
                          const isReproducida = reproducidas.has(solicitud.id)
                          return (
                            <div key={solicitud.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 animate-fade-in">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 flex items-start space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={isReproducida}
                                    onChange={() => toggleReproducida(solicitud.id)}
                                    className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                  />
                                  <div className="flex-1">
                                    <h3 className={`font-semibold text-lg ${isReproducida ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                      {solicitud.cancion}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                      🕐 {new Date(solicitud.timestamp).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => eliminarSolicitud(solicitud.id)}
                                  className="text-red-500 hover:text-red-700 ml-4 p-1 hover:bg-red-50 rounded"
                                  title="Eliminar solicitud"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel de QR y Controles */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Código QR</h3>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                  <QRCodeSVG 
                    value={QR_URL}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 mb-4">
                  Escanea para solicitar canciones
                </p>
                <div className="space-y-2">
                  <button
                    onClick={imprimirQR}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    🖨️ Imprimir QR
                  </button>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    👁️ Ver QR Grande
                  </button>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total solicitudes:</span>
                  <span className="font-bold text-purple-600">{solicitudes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reproducidas:</span>
                  <span className="font-bold text-green-600">{reproducidas.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-bold text-orange-600">{solicitudes.length - reproducidas.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Notificaciones:</span>
                  <span className={`font-bold ${notificationsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationsEnabled ? '✅ Activas' : '❌ Inactivas'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PWA:</span>
                  <span className="font-bold text-blue-600">
                    {showInstallPrompt ? '📱 Instalable' : '✅ Instalada'}
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modal QR Grande */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Código QR - Solicitar Canción</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <QRCodeSVG 
                  value={QR_URL}
                  size={300}
                  level="M"
                  includeMargin={true}
                  className="qr-print"
                />
              </div>
              <p className="text-gray-600 mt-4 mb-6">
                {QR_URL}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={imprimirQR}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido solo para impresión */}
      <div className="print-only">
        <div className="grid grid-cols-2 gap-8 p-4">
          <div className="text-center">
            <QRCodeSVG 
              value={QR_URL}
              size={200}
              level="M"
              includeMargin={true}
              className="qr-print"
            />
          </div>
          <div className="text-center">
            <QRCodeSVG 
              value={QR_URL}
              size={200}
              level="M"
              includeMargin={true}
              className="qr-print"
            />
          </div>
          <div className="text-center">
            <QRCodeSVG 
              value={QR_URL}
              size={200}
              level="M"
              includeMargin={true}
              className="qr-print"
            />
          </div>
          <div className="text-center">
            <QRCodeSVG 
              value={QR_URL}
              size={200}
              level="M"
              includeMargin={true}
              className="qr-print"
            />
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-white/60">
            <p>Desarrollado por <a href="https://jpbytes.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-white transition-colors duration-200">jpbytes</a></p>
            <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  )
}

Admin.propTypes = {
  onLogout: PropTypes.func.isRequired
}

export default Admin