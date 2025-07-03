# Configuración de Despliegue Automático

## Pasos para configurar el despliegue automático en Netlify

### 1. Crear cuenta en Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en "New site from Git"

### 2. Conectar con GitHub
1. Selecciona GitHub como proveedor
2. Busca y selecciona tu repositorio `solicitarCancion`
3. Configura las opciones de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (dejar vacío)

### 3. Configurar variables de entorno (opcional)
Si necesitas variables de entorno para Spotify API:
1. Ve a Site settings > Environment variables
2. Agrega las variables necesarias

### 4. Obtener tokens para GitHub Actions
1. Ve a tu perfil de Netlify > User settings > Applications
2. Crea un nuevo access token
3. Copia el token

### 5. Configurar secrets en GitHub
1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Agrega los siguientes secrets:
   - `NETLIFY_AUTH_TOKEN`: El token que copiaste en el paso 4
   - `NETLIFY_SITE_ID`: El ID de tu sitio en Netlify (lo encuentras en Site settings > General)

### 6. Configurar el dominio personalizado (opcional)
1. En Netlify, ve a Site settings > Domain management
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## Cómo funciona

Una vez configurado:
- Cada vez que hagas `git push` a la rama `main` o `master`
- GitHub Actions automáticamente:
  1. Construye la aplicación
  2. La despliega en Netlify
  3. Actualiza el sitio en vivo

## Verificación

Para verificar que todo funciona:
1. Haz un cambio en tu código
2. Haz commit y push: `git add . && git commit -m "test" && git push`
3. Ve a la pestaña "Actions" en GitHub para ver el progreso
4. Una vez completado, tu sitio estará actualizado en Netlify

## Troubleshooting

### Error de build
- Verifica que `npm run build` funcione localmente
- Revisa los logs en GitHub Actions

### Error de despliegue
- Verifica que los secrets estén configurados correctamente
- Asegúrate de que el `NETLIFY_SITE_ID` sea correcto

### Problemas de routing
- El archivo `public/_redirects` ya está configurado para SPA
- Si tienes problemas, verifica que el archivo esté en la carpeta `public` 