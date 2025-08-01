import { useState, useEffect, useRef } from 'react'
import SpotifyService from '../services/SpotifyService'
import { Music } from 'lucide-react'
import { db, collection, addDoc } from '../services/FirebaseService'

const Usuario = () => {
  const [cancion, setCancion] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const timeoutRef = useRef(null)
  const coleccionSolicitudes = collection(db, "solicitudesCanciones")

  useEffect(() => {
    if (cancion.length >= 3) {
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Crear nuevo timeout para buscar
      timeoutRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const resultados = await SpotifyService.buscarCanciones(cancion)
          setSugerencias(resultados)
        } catch (error) {
          console.error('Error buscando canciones:', error)
          setSugerencias([])
        } finally {
          setLoading(false)
        }
      }, 300) // Debounce de 300ms
    } else {
      setSugerencias([])
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [cancion])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!cancion.trim()) {
      setError('Por favor ingresa el nombre de una canción')
      return
    }

    try {
      // Guardar en Firestore
      await addDoc(coleccionSolicitudes, {
        cancion: cancion.trim(),
        timestamp: new Date().toISOString()
      })

      setEnviado(true)
      setCancion('')
      setSugerencias([])
      setError('')

      // Resetear mensaje después de 3 segundos
      setTimeout(() => {
        setEnviado(false)
      }, 3000)

    } catch (error) {
      setError('Error al enviar la solicitud. Inténtalo de nuevo.')
      console.error('Error:', error)
    }
  }

  const seleccionarSugerencia = (sugerencia) => {
    setCancion(`${sugerencia.name} - ${sugerencia.artists[0].name}`)
    setSugerencias([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative">
      {/* Nota visible para el usuario en modo prueba, flotante en desktop */}
      <div className="hidden md:block fixed top-8 right-8 w-[320px] z-50">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-3 rounded shadow animate-fade-in text-sm">
          <strong className="block mb-1">👋 ¡Bienvenido!</strong>
          <span>
            Aquí puedes enviar tu canción para el servicio. Una vez la envíes, dirígete al otro botón que dice &quot;Admin&quot; (donde encontraste mi proyecto), y desde allí podrás verificar que tu canción fue recibida correctamente.
            <br /><br />
            Recuerda que esta es una versión de prueba, así que si deseas una atención más personalizada, no dudes en contactarme desde el apartado de Contacto en mi página oficial.
          </span>
        </div>
      </div>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Music className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Solicitar Canción
          </h1>
          <p className="text-white/80">
            Escribe el nombre de tu canción favorita
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="cancion" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la canción
              </label>
              <input
                type="text"
                id="cancion"
                value={cancion}
                onChange={(e) => setCancion(e.target.value)}
                placeholder="Ejemplo: Bohemian Rhapsody"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                disabled={enviado}
              />

              {/* Indicador de carga */}
              {loading && (
                <div className="absolute right-3 top-10 animate-spin">
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Sugerencias */}
            {sugerencias.length > 0 && (
              <div className="bg-gray-50 rounded-lg border overflow-hidden">
                <div className="p-2 bg-gray-100 text-sm text-gray-600 font-medium">
                  Sugerencias {SpotifyService.accessToken ? 'de Spotify' : 'populares'}:
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {sugerencias.map((sugerencia, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => seleccionarSugerencia(sugerencia)}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 suggestion-item focus:outline-none focus:bg-purple-50"
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {sugerencia.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {sugerencia.artists[0].name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {enviado && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="font-medium">¡Solicitud enviada!</div>
                <div className="text-sm text-green-600">
                  Tu canción se ha agregado a la lista
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!cancion.trim() || enviado || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? 'Buscando...' : enviado ? 'Enviado ✓' : 'Enviar Solicitud'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🎶 Música para todos 🎶</p>
            <p className="text-xs mt-1">
              {cancion.length >= 3 ? 'Escribe para ver sugerencias' : 'Escribe al menos 3 letras'}
            </p>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-6 text-center text-xs text-white/60">
          <p>Desarrollado por <a href="https://codevjp.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-white transition-colors duration-200">CodevJP</a></p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
        {/* Nota visible para el usuario en móvil */}
        <div className="block md:hidden mt-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-3 rounded shadow animate-fade-in text-sm">
            <strong className="block mb-1">👋 ¡Bienvenido!</strong>
            <span>
              Aquí puedes enviar tu canción para el servicio. Una vez la envíes, dirígete al otro botón que dice &quot;Admin&quot; (donde encontraste mi proyecto), y desde allí podrás verificar que tu canción fue recibida correctamente.
              <br /><br />
              Recuerda que esta es una versión de prueba, así que si deseas una atención más personalizada, no dudes en contactarme desde el apartado de Contacto en mi página oficial.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Usuario