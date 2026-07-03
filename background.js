// Configuración de la API de Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant"; // Modelo activo (llama3-8b-8192 fue deprecado)
let GROQ_API_KEY = null; // Se carga desde chrome.storage

// Cargar la API key desde chrome.storage al iniciar
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.sync.get(['groqApiKey'], (result) => {
    if (result && result.groqApiKey) {
      GROQ_API_KEY = result.groqApiKey;
    }
  });
}

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    console.log("📨 Mensaje recibido del content script:", request);
    
    // Cargar la clave API cada vez que se recibe un mensaje
    chrome.storage.sync.get(['groqApiKey'], (result) => {
      if (!result || !result.groqApiKey) {
        //console.error("❌ No hay clave API configurada");
        sendResponse({ 
          success: false, 
          error: "⚙️ Configura tu clave de API de Groq en las Opciones de la extensión" 
        });
        return;
      }
      
      GROQ_API_KEY = result.groqApiKey;
      console.log("✓ API key cargada, iniciando traducción...");
      
      traducirTexto(
        request.text, 
        request.targetLanguage,
        request.sourceLanguage
      )
        .then(result => {
          console.log("✓ Traducción completada:", result);
          sendResponse({ success: true, translation: result });
        })
        .catch(error => {
          //console.error("❌ Error en traducción:", error);
          sendResponse({ success: false, error: error.message });
        });
    });
    return true; // Mantener el channel abierto para respuesta asincrónica
  }
});

/**
 * Traduce texto usando la API de Groq
 * @param {string} texto - Texto a traducir
 * @param {string} idiomaDestino - Idioma destino
 * @param {string} idiomaOrigen - Idioma origen (puede ser "auto" para detectar)
 * @returns {Promise<string>} - Texto traducido
 */
async function traducirTexto(texto, idiomaDestino = "inglés", idiomaOrigen = "auto") {
  if (!texto || texto.trim().length === 0) {
    throw new Error("Texto vacío");
  }

  console.log(`🔄 Iniciando traducción: "${texto.substring(0, 50)}..." a ${idiomaDestino}`);

  // Validar que la clave API esté configurada
  if (!GROQ_API_KEY || GROQ_API_KEY.trim().length === 0) {
    throw new Error("⚙️ Configura tu clave de API de Groq en las Opciones de la extensión");
  }

  try {
    // Construir el prompt del sistema basado en si se detecta o no el idioma
    let systemPrompt = `Eres un traductor profesional y experto.`;
    
    if (idiomaOrigen && idiomaOrigen !== "auto") {
      systemPrompt += ` Tu tarea es traducir el texto del ${idiomaOrigen} al ${idiomaDestino}.`;
    } else {
      systemPrompt += ` Tu tarea es detectar el idioma del texto y traducirlo al ${idiomaDestino}.`;
    }
    
    systemPrompt += ` 

Reglas importantes:
- Traduce SOLO el texto, sin añadir explicaciones ni comentarios
- Mantén el tono y contexto del original
- Si el texto contiene acrónimos técnicos, mantenlos en inglés si es necesario
- Sé conciso y natural en la traducción
- Devuelve ÚNICAMENTE el texto traducido, nada más`;

    console.log("📤 Enviando request a Groq API...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: texto
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    console.log("📥 Respuesta recibida. Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      //console.error("❌ API Error:", errorData);
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      //console.error("❌ Estructura de respuesta inesperada:", data);
      throw new Error("Respuesta inesperada de la API");
    }

    const translation = data.choices[0].message.content.trim();
    console.log("✓ Traducción exitosa:", translation);
    
    // Guardar en el historial
    guardarEnHistorial(texto, translation, idiomaOrigen, idiomaDestino);
    
    return translation;
  } catch (error) {
    //console.error("❌ Error al traducir:", error);
    throw error;
  }
}

// Guardar traducción en el historial
function guardarEnHistorial(texto, traduccion, idiomaOrigen, idiomaDestino) {
  try {
    chrome.storage.local.get(["translationHistory"], (result) => {
      let history = result.translationHistory || [];
      
      // Crear entrada del historial
      const entry = {
        id: Date.now(),
        original: texto,
        translation: traduccion,
        sourceLang: idiomaOrigen,
        targetLang: idiomaDestino,
        timestamp: new Date().toISOString()
      };
      
      // Agregar al inicio (más recientes primero)
      history.unshift(entry);
      
      // Mantener máximo 500 entradas
      if (history.length > 500) {
        history = history.slice(0, 500);
      }
      
      // Guardar en storage
      chrome.storage.local.set({ translationHistory: history }, () => {
        console.log("✓ Guardado en historial. Total:", history.length);
      });
    });
  } catch (error) {
    //console.error("❌ Error al guardar en historial:", error);
  }
}

// Limpiar caché antigua (Manifest V3 no soporta alarms, se limpia manualmente)
function limpiarCacheAntiguo() {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      return;
    }
    
    chrome.storage.local.get(["translationCache"], (result) => {
      if (!result.translationCache) return;
      const cache = result.translationCache;
      const now = Date.now();
      let cleaned = false;
      
      for (let key in cache) {
        if (cache[key]?.timestamp && now - cache[key].timestamp > 24 * 60 * 60 * 1000) {
          delete cache[key];
          cleaned = true;
        }
      }
      
      if (cleaned) {
        chrome.storage.local.set({ translationCache: cache });
      }
    });
  } catch (e) {
    //console.warn("Error limpiando caché:", e);
  }
}

// Limpiar caché al cargar el service worker
limpiarCacheAntiguo();
