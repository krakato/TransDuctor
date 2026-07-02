# 📝 Guía de Desarrollo - TransDuctor

## 📂 Estructura del Proyecto

```
TransDuctor/
│
├── 📄 manifest.json              # Configuración de Chrome (versión 3)
├── 🚀 background.js              # Service Worker (API Groq, traducción)
├── 📄 content-script.js          # Inyectado en páginas (detección hover)
│
├── 🎨 popup.html                 # Interfaz popup (clic en icono)
├── 📜 popup.js                   # Lógica del popup
├── 🎨 popup.css                  # Estilos popup
│
├── ⚙️ options.html               # Página de opciones
├── 📜 options.js                 # Lógica de opciones
├── 🎨 options.css                # Estilos de opciones
│
├── 📁 icons/                     # Iconos de la extensión
│   ├── icon-16.png              # Pequeño (16x16)
│   ├── icon-48.png              # Mediano (48x48)
│   └── icon-128.png             # Grande (128x128)
│
├── 📖 README.md                  # Documentación completa
├── ⚡ QUICK_START.md             # Guía rápida
├── 🧪 test-page.html            # Página de prueba
├── 📋 CHANGELOG.md               # Este archivo
└── 📦 package.json               # Metadatos del proyecto
```

---

## 🏗️ Arquitectura

### 1. **Manifest (manifest.json)**
- Versión 3 de Chrome (más segura y moderna)
- Permisos mínimos necesarios
- Host permissions para todas las URLs
- Configuración de service worker y content script

### 2. **Background Service Worker (background.js)**
**Responsabilidades:**
- Manejar mensajes del content script
- Llamar a API de Groq para traducción
- Gestionar caché de traducciones (24h)
- Verificación de errores de API

**Flujo:**
```
Content Script → Message → Background → Groq API → Response → Content Script
```

### 3. **Content Script (content-script.js)**
**Responsabilidades:**
- Detectar movimiento del cursor (hover)
- Esperar tiempo configurado (por defecto 2s)
- Extraer texto del elemento
- Enviar texto a traducir al background
- Mostrar tooltip flotante
- Remover tooltip al salir

**Eventos:**
- `mouseenter` - Iniciar timer
- `mouseleave` - Cancelar timer
- Timeout activado - Solicitar traducción

### 4. **Popup (popup.html/js/css)**
**Responsabilidades:**
- Interfaz principal (clic en icono)
- Toggle activar/desactivar extensión
- Selector de idioma destino
- Slider para tiempo de espera
- Slider para tamaño de fuente
- Selector de tema
- Botón de prueba de traducción

### 5. **Opciones (options.html/js/css)**
**Responsabilidades:**
- Panel completo de configuración
- Exportar/importar configuración
- Limpiar caché
- Información de la extensión
- Documentación de uso

---

## 🔄 Flujo de Datos

```
1. Usuario pasa cursor sobre texto
   ↓
2. Content Script detecta mouseenter
   ↓
3. Espera configurada (2000ms por defecto)
   ↓
4. Extrae texto del elemento
   ↓
5. Envía mensaje al Background Script
   ↓
6. Background Script llama a Groq API
   ↓
7. Groq API devuelve traducción
   ↓
8. Background Script envía respuesta
   ↓
9. Content Script muestra tooltip
   ↓
10. Usuario puede copiar o ignorar
```

---

## 🔌 API de Groq

### Endpoint
```
POST https://api.groq.com/openai/v1/chat/completions
```

### Autenticación
```
Headers: {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

### Payload
```json
{
  "model": "llama3-8b-8192",
  "messages": [
    {
      "role": "system",
      "content": "Eres un traductor profesional..."
    },
    {
      "role": "user",
      "content": "Texto a traducir"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 1024
}
```

### Response
```json
{
  "choices": [
    {
      "message": {
        "content": "Texto traducido"
      }
    }
  ]
}
```

---

## 💾 Almacenamiento

### Chrome Storage Sync
```javascript
{
  "enabled": true,              // boolean
  "targetLanguage": "inglés",   // string
  "hoverDelay": 2000,           // number (ms)
  "fontSize": 12,               // number (px)
  "theme": "dark",              // "dark" | "light"
  "autoDetectLanguage": false   // boolean
}
```

### Chrome Storage Local
```javascript
{
  "translationCache": {
    "hello|inglés": {
      "translation": "hola",
      "timestamp": 1234567890
    },
    // ... más entradas
  }
}
```

---

## 📝 Configuración por Defecto

```javascript
const defaultSettings = {
  enabled: true,
  targetLanguage: "inglés",
  hoverDelay: 2000,           // ms
  fontSize: 12,               // px
  theme: "dark",              // "dark" | "light"
  autoDetectLanguage: false
};
```

---

## 🎨 Estilos CSS

### Tooltip
```css
- Position: fixed
- Background: #1e1e1e (dark) / #fff (light)
- Border-radius: 6px
- Font-family: Courier New (monospace)
- Font-size: configurable (10-18px)
- Z-index: 999999999 (encima de todo)
- Animation: slideInDown 0.3s
```

### Popup
```css
- Width: 380px
- Background: linear gradient
- Responsive layout
- Material Design inspired
```

### Opciones
```css
- Responsive (mobile-friendly)
- Max-width: 1000px
- Modern styling
- Smooth animations
```

---

## 🛠️ Modelos de Groq Disponibles

| Modelo | Velocidad | Precisión | Tokens | Costo |
|--------|-----------|-----------|--------|-------|
| llama3-8b-8192 | ⚡⚡⚡ | ⭐⭐⭐⭐ | 8192 | Gratis |
| mixtral-8x7b-32768 | ⚡⚡ | ⭐⭐⭐⭐⭐ | 32768 | Gratis |
| gemma-7b-it | ⚡⚡⚡ | ⭐⭐⭐⭐ | 8192 | Gratis |

---

## 🐛 Debugging

### Consola del Navegador (F12)
```javascript
// Ver logs de TransDuctor
console.log("✓ TransDuctor iniciado correctamente");

// Verificar si mensaje se envía correctamente
chrome.runtime.sendMessage({...})

// Ver storage
chrome.storage.sync.get(null, (data) => console.log(data))
```

### Chrome DevTools
1. `chrome://extensions/` - Ver detalles de la extensión
2. Sección "Service Worker" - Ver logs de background
3. "Inspect views: background page" - Abre consola del SW
4. Network tab - Ver requests a Groq API

---

## 📋 Testing

### Prueba Manual
1. Abre `test-page.html` en el navegador
2. Pasa cursor sobre diferentes textos
3. Verifica que tooltips aparezcan
4. Prueba diferentes configuraciones

### Prueba de API
1. Abre consola de background (Chrome Extensions)
2. Ejecuta manualmente:
```javascript
traducirTexto("Hello", "español")
```

### Prueba de Configuración
1. Abre Options
2. Cambia valores
3. Verifica que se guarden en storage
4. Recarga página para verificar persistencia

---

## 🚀 Optimizaciones Realizadas

1. **Debouncing**: Timer espera configurada antes de traducir
2. **Caché**: Guarda traducciones por 24 horas
3. **Limpieza automática**: Limpia caché viejo cada 24h
4. **Service Worker**: Eficiente, se activa solo cuando es necesario
5. **CSS optimizado**: Animations performantes
6. **Validación**: Detecta elementos para no traducir (scripts, etc)

---

## 🔐 Seguridad

- ✅ Manifest v3 (más seguro)
- ✅ Content Security Policy implícito
- ✅ Validación de texto antes de enviar
- ✅ SSL/TLS con API de Groq
- ✅ Sin almacenamiento de datos sensibles
- ⚠️ API Key en background.js (considera mover a backend)

---

## 🎓 Mejoras Futuras

1. **Soporte para selección de texto**: Traducir solo lo seleccionado
2. **Caché más inteligente**: Usar IndexedDB
3. **Detección automática de idioma**: Con Google Translate API
4. **Atajos de teclado personalizados**: Para traducción rápida
5. **Historial de traducciones**: Guardar últimas traducciones
6. **Soporte offline**: Con modelo local (WASM)
7. **Temas personalizados**: CSS personalizado
8. **Múltiples idiomas destino**: Selector de idioma-destino secundario
9. **Integración con diccionarios**: Mostrar definiciones
10. **Estadísticas de uso**: Analytics básico

---

## 📚 Recursos Útiles

### Documentación Oficial
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Groq API Docs](https://console.groq.com/docs/api-overview)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

### Herramientas
- Chrome DevTools
- `chrome://extensions/`
- Chrome Extension Manifest Validator

---

## 📞 Contacto y Soporte

Para reportar bugs o sugerencias:
1. Abre la consola (F12)
2. Reporta el error con el mensaje
3. Incluye tu configuración de opciones

---

## 📈 Historial de Cambios

### v1.0.0 - Lanzamiento Inicial
- ✅ Detección de hover
- ✅ Traducción con Groq AI
- ✅ Panel de opciones
- ✅ Tema oscuro/claro
- ✅ Exportar/importar configuración
- ✅ Soporte 50+ idiomas
- ✅ Caché de traducciones

---

**Desarrollado con ❤️ usando Groq AI**

TransDuctor v1.0.0 | 2024
