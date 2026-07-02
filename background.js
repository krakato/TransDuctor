// Configuración de la API de Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant"; // Modelo activo (llama3-8b-8192 fue deprecado)
let GROQ_API_KEY = null; // Se carga desde chrome.storage

// Cargar la API key desde chrome.storage al iniciar
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.sync.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      GROQ_API_KEY = result.groqApiKey;
    }
  });
}

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    traducirTexto(request.text, request.targetLanguage)
      .then(result => {
        sendResponse({ success: true, translation: result });
      })
      .catch(error => {
        console.error("Error en traducción:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Mantener el channel abierto para respuesta asincrónica
  }
});

/**
 * Traduce texto usando la API de Groq
 * @param {string} texto - Texto a traducir
 * @param {string} idiomaDestino - Idioma destino
 * @returns {Promise<string>} - Texto traducido
 */
async function traducirTexto(texto, idiomaDestino = "inglés") {
  if (!texto || texto.trim().length === 0) {
    throw new Error("Texto vacío");
  }

  // Validar que la clave API esté configurada
  if (!GROQ_API_KEY || GROQ_API_KEY.trim().length === 0) {
    throw new Error("⚙️ Configura tu clave de API de Groq en las Opciones de la extensión");
  }

  try {
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
            content: `Eres un traductor profesional y experto. Tu tarea es traducir el texto exactamente al idioma ${idiomaDestino}. 
            
Reglas importantes:
- Traduce SOLO el texto, sin añadir explicaciones ni comentarios
- Mantén el tono y contexto del original
- Si el texto contiene acrónimos técnicos, mantenlos en inglés si es necesario
- Sé conciso y natural en la traducción
- Devuelve ÚNICAMENTE el texto traducido, nada más`
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Respuesta inesperada de la API");
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error al traducir:", error);
    throw error;
  }
}

// Limpiar caché antigua cada 24 horas
chrome.alarms.create("cleanTranslationCache", { periodInMinutes: 24 * 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanTranslationCache") {
    chrome.storage.local.get(["translationCache"], (result) => {
      const cache = result.translationCache || {};
      const now = Date.now();
      let cleaned = false;
      
      for (let key in cache) {
        if (now - cache[key].timestamp > 24 * 60 * 60 * 1000) {
          delete cache[key];
          cleaned = true;
        }
      }
      
      if (cleaned) {
        chrome.storage.local.set({ translationCache: cache });
      }
    });
  }
});
