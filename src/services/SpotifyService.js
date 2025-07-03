class SpotifyService {
  constructor() {
    this.clientId = '830ba4e7f9064907b0eda146947e12f8' // ID público de demostración
    this.clientSecret = '862f6151b2b546418b5b0ff9621a1783' // Secret de demostración
    this.accessToken = null
    this.tokenExpiry = null
    this.baseURL = 'https://api.spotify.com/v1'
  }

  // Obtener token de acceso usando client credentials flow
  async getAccessToken() {
    // Verificar si el token actual es válido
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error('Error al obtener token de Spotify')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minuto antes de expirar

      return this.accessToken
    } catch (error) {
      console.error('Error obteniendo token de Spotify:', error)
      
      // Fallback: devolver sugerencias simuladas si falla Spotify
      return null
    }
  }

  // Buscar canciones
  async buscarCanciones(query) {
    try {
      const token = await this.getAccessToken()
      
      if (!token) {
        // Fallback: sugerencias simuladas
        return this.getSugerenciasFallback(query)
      }

      const response = await fetch(
        `${this.baseURL}/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error en la búsqueda')
      }

      const data = await response.json()
      return data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album.name,
        preview_url: track.preview_url,
        external_urls: track.external_urls
      }))
    } catch (error) {
      console.error('Error buscando canciones:', error)
      return this.getSugerenciasFallback(query)
    }
  }

  // Sugerencias de fallback cuando Spotify no está disponible
  getSugerenciasFallback(query) {
    const sugerenciasFallback = [
      { name: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }], album: 'A Night at the Opera' },
      { name: 'Imagine', artists: [{ name: 'John Lennon' }], album: 'Imagine' },
      { name: 'Hotel California', artists: [{ name: 'Eagles' }], album: 'Hotel California' },
      { name: 'Sweet Child O Mine', artists: [{ name: 'Guns N Roses' }], album: 'Appetite for Destruction' },
      { name: 'Billie Jean', artists: [{ name: 'Michael Jackson' }], album: 'Thriller' },
      { name: 'Smells Like Teen Spirit', artists: [{ name: 'Nirvana' }], album: 'Nevermind' },
      { name: 'Stairway to Heaven', artists: [{ name: 'Led Zeppelin' }], album: 'Led Zeppelin IV' },
      { name: 'Like a Rolling Stone', artists: [{ name: 'Bob Dylan' }], album: 'Highway 61 Revisited' },
      { name: 'Purple Haze', artists: [{ name: 'Jimi Hendrix' }], album: 'Are You Experienced' },
      { name: 'Yesterday', artists: [{ name: 'The Beatles' }], album: 'Help!' },
      { name: 'My Way', artists: [{ name: 'Frank Sinatra' }], album: 'My Way' },
      { name: 'What a Wonderful World', artists: [{ name: 'Louis Armstrong' }], album: 'What a Wonderful World' },
      { name: 'Thriller', artists: [{ name: 'Michael Jackson' }], album: 'Thriller' },
      { name: 'Beat It', artists: [{ name: 'Michael Jackson' }], album: 'Thriller' },
      { name: 'Don\'t Stop Believin\'', artists: [{ name: 'Journey' }], album: 'Escape' },
      { name: 'Born to Run', artists: [{ name: 'Bruce Springsteen' }], album: 'Born to Run' },
      { name: 'Dancing Queen', artists: [{ name: 'ABBA' }], album: 'Arrival' },
      { name: 'Mamma Mia', artists: [{ name: 'ABBA' }], album: 'ABBA' },
      { name: 'Fernando', artists: [{ name: 'ABBA' }], album: 'Arrival' },
      { name: 'Waterloo', artists: [{ name: 'ABBA' }], album: 'Waterloo' }
    ]

    const queryLower = query.toLowerCase()
    return sugerenciasFallback
      .filter(song => 
        song.name.toLowerCase().includes(queryLower) || 
        song.artists[0].name.toLowerCase().includes(queryLower)
      )
      .slice(0, 5)
  }
}

// Exportar una instancia singleton
export default new SpotifyService()