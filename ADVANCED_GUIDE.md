# 🎯 Guía Avanzada y Casos de Uso - TransDuctor

## 🚀 Casos de Uso

### 1. **Estudiante de Idiomas**
- **Objetivo**: Aprender vocabulario nuevo
- **Configuración**:
  - Idioma destino: El que quieres aprender
  - Tiempo de espera: 1500ms (rápido, para mantener concentración)
  - Tamaño de fuente: 14px (visible pero no intrusivo)
  - Tema: Claro (para fondos blancos de documentos)

**Workflow:**
1. Abre un artículo en el idioma que quieres aprender
2. Pasa el cursor sobre palabras desconocidas
3. La traducción aparecerá automáticamente
4. Intenta adivinar primero, luego verifica

---

### 2. **Profesional de Traducción**
- **Objetivo**: Verificar traducciones y contexto
- **Configuración**:
  - Idioma destino: Variable (cambia según proyecto)
  - Tiempo de espera: 3000ms (tiempo para pensar)
  - Tamaño de fuente: 12px (profesional)
  - Tema: Oscuro (menos fatiga visual)

**Workflow:**
1. Abre documento en el idioma original
2. Compara tu traducción con la de TransDuctor
3. Exporta configuración entre proyectos
4. Usa como referencia de estilo

---

### 3. **Desarrollador Buscando Código**
- **Objetivo**: Entender comentarios y documentación en otros idiomas
- **Configuración**:
  - Idioma destino: Tu idioma nativo
  - Tiempo de espera: 2000ms (equilibrado)
  - Tema: Oscuro (estándar en editores)

**Workflow:**
1. Lee código en repositorios internacionales
2. Traduce comentarios y documentación
3. Mantén el flujo de lectura
4. Aprende nuevo vocabulario técnico

---

### 4. **Viajero/Turista**
- **Objetivo**: Comprender rápidamente en el destino
- **Configuración**:
  - Tiempo de espera: 1000ms (muy rápido para urgencia)
  - Tamaño de fuente: 14px (fácil de leer)
  - Tema: Claro (exterior, más luz)

**Workflow:**
1. Abre menús, señales, publicaciones
2. Traduce rápidamente
3. Guarda configuración para viajes futuros
4. Aprende frases locales

---

### 5. **Investigador Académico**
- **Objetivo**: Leer papers en múltiples idiomas
- **Configuración**:
  - Idioma destino: Tu idioma de investigación
  - Tiempo de espera: 2500ms (reflexivo)
  - Tamaño de fuente: 12px (estándar académico)
  - Auto-detect: Activado (si está disponible)

**Workflow:**
1. Abre PDF de research
2. Traduce términos clave y resúmenes
3. Exporta configuración entre investigaciones
4. Mantén consistencia de traducción

---

## 🔧 Configuraciones Recomendadas por Caso

### Traducción Rápida (Velocidad)
```json
{
  "hoverDelay": 1000,
  "fontSize": 14,
  "theme": "light"
}
```

### Traducción Precisa (Calidad)
```json
{
  "hoverDelay": 3000,
  "fontSize": 12,
  "theme": "dark"
}
```

### Balance (Equilibrio)
```json
{
  "hoverDelay": 2000,
  "fontSize": 12,
  "theme": "dark"
}
```

### Legibilidad Máxima
```json
{
  "hoverDelay": 2000,
  "fontSize": 16,
  "theme": "light"
}
```

---

## 🌐 Estrategias por Idioma

### Idiomas Asiáticos (Japonés, Chino, Coreano)
- ❌ El hover podría no funcionar bien con caracteres complejos
- ✅ Solución: Selecciona frases completas
- 💡 Tip: Aumenta tamaño de fuente a 14px+

### Idiomas de Derecha a Izquierda (Árabe, Hebreo)
- ⚠️ Layout puede variar
- ✅ Prueba y ajusta según el sitio web
- 💡 Tip: Usa tema oscuro para mejor contraste

### Idiomas Latinos (Español, Francés, Italiano)
- ✅ Funcionan perfectamente
- 💡 Tip: Tamaño 12px es ideal
- 🎯 Caso ideal para la extensión

---

## 💡 Tips y Trucos

### 1. **Traducción Rápida de Párrafos**
```
1. Selecciona el párrafo completo
2. Cópialo (Ctrl+C)
3. Abre el popup de TransDuctor
4. Haz clic en "Probar traducción"
5. Obtén la traducción completa
```

### 2. **Multi-idioma Simultáneo**
```
1. Abre dos ventanas de Chrome
2. Configura idioma destino diferente en cada una
3. Compara traducciones
4. Analiza diferencias de interpretación
```

### 3. **Aprendizaje Progresivo**
```
Semana 1: Aumenta hover delay a 3000ms
Semana 2: Intenta adivinar antes de ver traducción
Semana 3: Reduce delay a 2000ms
Semana 4: Solo úsalo para palabras difíciles
```

### 4. **Guardar Vocabulario**
```
1. Extiende exportar configuración + texto traducido
2. Crea una hoja de cálculo con pares de palabras
3. Repasa regularmente
4. ¡Aprende más rápido!
```

### 5. **Backup de Configuración**
```
1. Ve a Opciones → Exportar
2. Guarda archivo en Google Drive/Dropbox
3. Si pierdes la extensión, importa fácilmente
4. Sincroniza entre dispositivos manualmente
```

---

## 🎨 Personalizaciones CSS

Para usuarios avanzados, puedes modificar `content-script.js`:

### Cambiar Color del Tooltip
```css
#transductor-tooltip {
  background: #ff6b6b !important;  /* Rojo custom */
  color: #fff !important;
}
```

### Cambiar Animación
```css
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Tooltip Más Grande
```javascript
// En content-script.js, modifica:
const estilos = `
  ...
  font-size: 16px;           // Cambiar de 12px
  padding: 12px 16px;        // Cambiar padding
  max-width: 400px;          // Más ancho
  ...
`;
```

---

## 🔄 Flujos de Trabajo Automáticos

### Traducción Batch
```javascript
// Guardar como bookmarklet en Chrome
javascript:(function(){
  const texts = Array.from(document.body.innerText.match(/[^\.!\?]+[\.!\?]+/g));
  texts.forEach(t => {
    chrome.runtime.sendMessage({
      action: 'translate',
      text: t.trim(),
      targetLanguage: 'inglés'
    });
  });
})()
```

### Estadísticas de Uso
```javascript
// En console
chrome.storage.local.get('translationCache', (data) => {
  const cache = data.translationCache || {};
  console.log(`Total traducciones: ${Object.keys(cache).length}`);
});
```

---

## 🚨 Solución de Problemas Avanzados

### Problema: Tooltip aparece pero traducción es lenta
**Solución:**
```
1. Aumenta timeout en background.js: 
   const TIMEOUT = 10000; // ms
2. Verifica conexión a Internet
3. Intenta con texto más corto (< 100 caracteres)
```

### Problema: Ciertos sitios web no funcionan
**Solución:**
```
1. Verifica Content Security Policy en DevTools
2. Algunos sitios bloquean scripts
3. Solución: Abre developer mode y reporta sitio
```

### Problema: Traducción incorrecta
**Solución:**
```
1. Cambia el modelo en background.js
2. Prueba con: mixtral-8x7b-32768 (más preciso)
3. Ajusta temperature: 0.1-0.5 (0.1 = más literal)
```

### Problema: Memoria agotada
**Solución:**
```
1. Limpia caché regularmente
2. Reduce tiempo en opciones: Avanzado → Limpiar caché
3. Desactiva auto-detect si está habilitado
```

---

## 📊 Monitoreo y Analytics

### Ver Cache de Traducciones
```javascript
// Console (F12)
chrome.storage.local.get('translationCache', (data) => {
  console.table(data.translationCache);
});
```

### Ver Configuración Guardada
```javascript
chrome.storage.sync.get(null, (data) => {
  console.table(data);
});
```

### Medir Velocidad de Traducción
```javascript
const start = Date.now();
chrome.runtime.sendMessage({
  action: 'translate',
  text: 'Hello world',
  targetLanguage: 'español'
}, () => {
  console.log(`Tiempo: ${Date.now() - start}ms`);
});
```

---

## 🔐 Consideraciones de Privacidad

### Datos Enviados a Groq
- ✅ Solo el texto a traducir
- ✅ Idioma destino
- ❌ NO se envía: historial, cookies, datos personales

### Datos Almacenados Localmente
- ✅ Configuración del usuario
- ✅ Caché de traducciones (24h)
- ✅ Tema y preferencias

### Cómo Maximizar Privacidad
1. Desactiva caché en opciones (borrar regularmente)
2. Usa red privada/VPN
3. Revisa el código (es open source)
4. No traducir información sensible

---

## 🚀 Optimizaciones de Rendimiento

### Para Máquinas Lentes
```json
{
  "hoverDelay": 3000,        // Espera más
  "fontSize": 12,            // Pequeño, menos render
  "theme": "dark"            // Menos CSS calculations
}
```

### Para Máquinas Rápidas
```json
{
  "hoverDelay": 1000,        // Rápido
  "fontSize": 14,            // Más grande
  "autoDetectLanguage": true // Features adicionales
}
```

---

## 📚 Recursos Adicionales

### Tutoriales Video
- Cómo instalar extensiones Chrome
- Traducción en tiempo real
- Configuración avanzada

### Comunidad
- Issues en GitHub
- Discussions en foros de Chrome
- Reddit r/ChromeExtensions

### Documentación Relacionada
- [Chrome Extensions Guide](https://developer.chrome.com/docs/extensions/get-started/)
- [Groq API Reference](https://console.groq.com/docs/api-reference)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

**TransDuctor v1.0.0**
Diseñado para productividad multilingüe ✨
