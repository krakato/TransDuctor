# ⚡ Guía Rápida de Instalación - TransDuctor

## 🚀 Instalación en 3 pasos

### Paso 1: Abrir Chrome
```
chrome://extensions/
```

### Paso 2: Activar "Modo de desarrollador"
En la esquina superior derecha, activa el switch de **"Modo de desarrollador"**

### Paso 3: Cargar la extensión
1. Haz clic en **"Cargar extensión sin empaquetar"**
2. Selecciona la carpeta **TransDuctor**
3. ¡Listo!

---

## 🎯 Uso Inmediato

1. Abre cualquier página web
2. **Pasa el cursor** sobre una palabra o texto
3. **Espera 2 segundos** (configurable)
4. Aparecerá la **traducción en un tooltip**

---

## ⚙️ Configuración Rápida

Haz clic en el icono de TransDuctor → **⚙️ Configuración**

### Opciones principales:
- 🌐 **Idioma destino**: Elige entre 50+ idiomas
- ⏱️ **Tiempo de espera**: Ajusta de 500ms a 5000ms
- 🔤 **Tamaño de fuente**: 10px a 18px
- 🌙 **Tema**: Oscuro o claro

---

## 📌 Archivos Importantes

```
TransDuctor/
├── manifest.json           ← Configuración (no tocar)
├── background.js           ← API Groq (incluye API Key)
├── content-script.js       ← Detecta hover
├── popup.html/js/css       ← Interfaz principal
├── options.html/js/css     ← Página de configuración
├── icons/                  ← Iconos de la extensión
└── README.md               ← Documentación completa
```

---

## 🔑 API Key

La extensión ya incluye una **API Key válida** de Groq.
No necesitas hacer nada más.

Si quieres usar tu propia API Key:
1. Ve a https://console.groq.com/keys
2. Copia tu API Key
3. Abre `background.js`
4. Reemplaza la línea:
   ```javascript
   const GROQ_API_KEY = "aqui-tu-api-key";
   ```
5. Recarga la extensión en Chrome

---

## ✅ Verificar que funciona

1. Abre https://example.com
2. Pasa el cursor sobre "Hello"
3. Espera 2 segundos
4. Debe aparecer la traducción

Si no funciona:
- Verifica que la extensión esté activada
- Recarga la página (F5)
- Comprueba tu conexión a Internet

---

## 🎓 Modelo Utilizado

**LLaMA 3 8B** - Modelo rápido y gratuito de Groq
- Velocidad: ⚡ < 1 segundo
- Precisión: 🎯 Muy alta
- Costo: 💰 Gratuito (con API Key de Groq)

---

## 💡 Tips

1. **Múltiples idiomas**: Cambia el idioma en cualquier momento
2. **Copiar traducción**: Haz clic en el tooltip para copiar
3. **Desactivar temporalmente**: Usa el toggle en el popup
4. **Exportar config**: Guarda tu configuración en Opciones → Avanzado

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| No aparece traducción | Aumenta "Tiempo de espera" en opciones |
| Error de API | Recarga la página o reinicia Chrome |
| Extensión no carga | Comprueba que esté en `chrome://extensions/` |
| Traducciones lentas | Verifica conexión a Internet |

---

## 📞 Soporte

Si tienes problemas:
1. Abre la consola (F12)
2. Ve a la pestaña "Consola"
3. Busca mensajes de error
4. Reporta el error

---

**¡Listo para traducir! 🌍**

Disfruta usando **TransDuctor** - Tu traductor de IA instantáneo.

v1.0.0 | Powered by Groq AI ✨
