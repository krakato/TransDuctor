# 🌐 TransDuctor - Traductor Inteligente para Chrome

![TransDuctor Logo](icons/icon-128.png)

Una extensión de Chrome potente y fácil de usar que traduce cualquier texto al instante usando IA. Simplemente pasa el cursor sobre el texto y obtén la traducción en un tooltip flotante elegante.

## ✨ Características

- 🚀 **Traducción instantánea**: Pasa el cursor y espera 2 segundos para obtener la traducción
- 🌍 **Soporte multiidioma**: Traduce a 50+ idiomas
- ⚡ **Basado en Groq AI**: Utiliza LLaMA 3 8B para traducciones precisas y rápidas
- 🎨 **Interfaz inteligente**: Tooltip flotante con tema oscuro/claro personalizable
- ⚙️ **Altamente configurable**: Ajusta tiempo de espera, tamaño de fuente, idioma destino
- 💾 **Exportar/Importar configuración**: Guarda tu configuración y úsala en otros dispositivos
- 🔒 **Privado**: Funciona directamente con la API, sin intermediarios
- 📱 **Responsive**: Funciona en cualquier sitio web

## 📋 Requisitos

- Google Chrome o Chromium (versión 88+)
- Conexión a Internet
- API Key de Groq (incluida)

## 🚀 Instalación

### Método 1: Instalación Manual (Modo Desarrollo)

1. **Descargar los archivos**
   - Clona o descarga esta carpeta

2. **Abrir página de extensiones**
   - Abre Chrome y ve a `chrome://extensions/`
   - Activa el "Modo de desarrollador" (esquina superior derecha)

3. **Cargar extensión sin empaquetar**
   - Haz clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta `TransDuctor`

4. **¡Listo!**
   - La extensión aparecerá en tu barra de herramientas

### Método 2: Usando Archivo .crx

```bash
# Compilar a archivo .crx
# (Requiere herramientas de Chrome)
```

## 🎯 Cómo Usar

### Uso Básico

1. Abre cualquier página web
2. Pasa el cursor sobre una palabra o texto
3. Espera a que aparezca el tooltip con la traducción
4. ¡Hecho! Haz clic en el tooltip para copiarlo (opcional)

### Configuración

1. Haz clic en el icono de TransDuctor en la barra de herramientas
2. Selecciona "⚙️ Configuración" (esquina superior derecha)
3. Personaliza:
   - **Idioma destino**: Elige el idioma a traducir
   - **Tiempo de espera**: Ajusta cuánto esperar antes de mostrar la traducción
   - **Tamaño de fuente**: Personaliza el tamaño del texto del tooltip
   - **Tema**: Oscuro o claro

## ⚙️ Configuración Avanzada

### Opciones Disponibles

```json
{
  "enabled": true,              // Activar/desactivar la extensión
  "targetLanguage": "inglés",   // Idioma destino
  "hoverDelay": 2000,           // Tiempo en milisegundos
  "fontSize": 12,               // Tamaño en píxeles
  "theme": "dark",              // "dark" o "light"
  "autoDetectLanguage": false   // Detectar idioma automáticamente
}
```

### Exportar Configuración

1. Ve a Opciones → Avanzado
2. Haz clic en "📥 Exportar configuración"
3. Se descargará un archivo `transductor-config.json`

### Importar Configuración

1. Ve a Opciones → Avanzado
2. Haz clic en "📤 Importar configuración"
3. Selecciona tu archivo `transductor-config.json`

## 🌐 Idiomas Soportados

**Populares:**
- English (Inglés)
- Spanish (Español)
- French (Francés)
- German (Alemán)
- Portuguese (Portugués)
- Italian (Italiano)
- Japanese (Japonés)
- Chinese Mandarin (Chino)
- Korean (Coreano)
- Thai (Tailandés)

**Y muchos más:** Ruso, Árabe, Turco, Polaco, Holandés, Sueco, Vietnamita, Griego, Hebreo, Hindi, etc.

## 🔧 Estructura de Archivos

```
TransDuctor/
├── manifest.json              # Configuración de la extensión
├── background.js              # Service Worker (API Groq)
├── content-script.js          # Inyectado en páginas web
├── popup.html                 # Interfaz del popup
├── popup.js                   # Lógica del popup
├── popup.css                  # Estilos del popup
├── options.html               # Página de opciones
├── options.js                 # Lógica de opciones
├── options.css                # Estilos de opciones
├── icons/
│   ├── icon-16.png           # Icono pequeño
│   ├── icon-48.png           # Icono mediano
│   └── icon-128.png          # Icono grande
└── README.md                  # Este archivo
```

## 🔐 Privacidad y Seguridad

- Los textos se envían a la API de Groq para traducción
- No almacenamos datos personales
- Puedes usar tu propia API Key de Groq
- Los datos se procesan con SSL/TLS

## 📝 Cambiar API Key

Para usar tu propia API Key de Groq:

1. Obtén una API Key en [Groq Console](https://console.groq.com/keys)
2. Edita el archivo `background.js`
3. Reemplaza la línea:
   ```javascript
   const GROQ_API_KEY = "tu-nueva-api-key-aqui";
   ```
4. Recarga la extensión en `chrome://extensions/`

## 🚀 Modelos Soportados

La extensión usa **LLaMA 3 8B 8192** por defecto, pero puedes cambiar a otros modelos:

- `llama3-8b-8192` (Recomendado - Rápido y gratuito)
- `mixtral-8x7b-32768` (Más potente)
- `gemma-7b-it` (Rápido)

Edita `background.js`:
```javascript
const DEFAULT_MODEL = "llama3-8b-8192";
```

## ⚡ Troubleshooting

### El tooltip no aparece
- Verifica que la extensión esté activada
- Aumenta el "Tiempo de espera" en opciones
- Recarga la página web

### Error de traducción
- Comprueba tu conexión a Internet
- Verifica que la API Key sea válida
- Abre la consola (F12) para ver errores

### La extensión es lenta
- Reduce el tiempo de espera
- Usa un modelo más rápido en `background.js`
- Verifica tu conexión a Internet

## 📱 Compatibilidad

- ✅ Chrome 88+
- ✅ Edge (Chromium)
- ✅ Brave
- ✅ Opera
- ✅ Vivaldi
- ❌ Firefox (requiere versión diferente)
- ❌ Safari (requiere versión diferente)

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir

## 🤝 Contribuciones

¿Encontraste un bug? ¿Tienes una sugerencia?
- Reporta problemas
- Sugiere mejoras
- ¡Comparte tu experiencia!

## 🙏 Créditos

- **Groq API** - Para proporcionar acceso rápido a LLaMA 3
- **Chrome Team** - Por la magnífica plataforma de extensiones
- **Comunidad** - Por el feedback y sugerencias

## 📊 Estadísticas

- ⚡ Latencia promedio: < 1 segundo
- 🌍 Idiomas: 50+
- 🔤 Caracteres soportados: Ilimitados (hasta 1000 por traducción)
- 💾 Tamaño de la extensión: ~50KB

## 🎓 Consejos y Trucos

1. **Traducir párrafos completos**: Selecciona el texto y copia, luego TransDuctor lo traduce
2. **Copiar traducción**: El tooltip es clickeable - haz clic para copiar al portapapeles
3. **Atajo de teclado**: Configura un atajo personalizado en `chrome://extensions/shortcuts`
4. **Múltiples idiomas**: Abre dos instancias de Chrome con idiomas diferentes

## 🔄 Actualizaciones

Comprueba regularmente si hay nuevas versiones:
- Nuevos idiomas
- Mejoras de rendimiento
- Nuevas características

---

**¡Disfruta traduciendo! 🎉**

Para más información, contacta al desarrollador o visita nuestro sitio web.

**TransDuctor v1.0.0** | Powered by Groq AI ✨
