# 🔐 Configuración de TransDuctor

## Paso 1: Obtener una Clave API de Groq

1. Ve a [console.groq.com](https://console.groq.com/)
2. Crea una cuenta o inicia sesión
3. Genera una nueva API Key en la sección de claves API
4. Copia la clave
5. GROQ_API_KEY_REMOVED

## Paso 2: Configurar la Extensión

1. **Abre el popup de TransDuctor** en cualquier página web
2. **Busca el campo "🔑 Clave API de Groq"**
3. **Pega tu clave API**
4. **Presiona Enter o haz clic fuera** - se guardará automáticamente
5. **Verifica que aparezca "✓ Configuración guardada"**

## Paso 3: Prueba la Extensión

1. Haz clic en **"🧪 Probar traducción"** en el popup
2. Deberías ver una traducción exitosa
3. ¡Ahora pasa el cursor sobre cualquier texto en las páginas web!

## Seguridad

- Tu clave API se guarda **localmente en chrome.storage** (nunca se envía a servidores externos salvo a Groq)
- La clave **NO se guarda en el repositorio de Git**
- Cada usuario debe configurar su propia clave

## Solucionar Problemas

**"Configura tu clave de API en las Opciones de la extensión"**
- Asegúrate de haber pegado la clave correctamente
- Verifica que no tenga espacios al principio o final
- Recarga la extensión en chrome://extensions/

**Las traducciones son lentas**
- El modelo Groq llama-3.1-8b es gratuito pero tiene límites de velocidad
- Espera 1-2 segundos entre traducciones
- Revisa tu plan de uso en console.groq.com

**Error de "API Key no disponible"**
- Recarga la extensión
- Verifica que hayas ingresado la clave en el campo de API Key
