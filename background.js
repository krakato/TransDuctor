// Configuración de la API de Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile"; // Modelo activo (llama3-8b-8192 fue deprecado)
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
    // System prompt optimizado y conciso
    const systemPrompt = `Eres un traductor y analista de datos de alta precisión. Tu objetivo es traducir el texto proveído y generar una descripción técnica basada ÚNICAMENTE en la información suministrada.
    1. TRADUCCIÓN LITERAL Y CONTEXTUAL: Traduce respetando el contexto técnico. No uses sinónimos ambiguos ni adaptaciones libres que cambien el significado original.
    2. PROHIBIDO ALUCINAR: No agregues, asumas, ni deduzcas información que no esté explícitamente escrita en el texto de origen. Si el texto no menciona un detalle, tu descripción no debe inventarlo.
    3. CONTROL DE ERRORES: Si una palabra es un nombre propio o una marca sin traducción directa, déjala en su idioma original.
    4. HONESTIDAD: Si el texto de entrada es insuficiente para generar una descripción lógica, responde exactamente: "Información insuficiente para generar descripción".
    5. TRADUCCIÓN DIRECTA: Traduce el texto directamente al idioma solicitado manteniendo el tono, el contexto y los modismos locales.
    6. Si en el texto hay términos técnicos puedes ofrecer una descripción, anteponiendo antes "Nota: y luego la descripción.
    7. Si no hay nada que traducir porque no se detecta texto traducible, devolver solo la palabra "FALSE"`;

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
            content: `Traduce el siguiente texto al idioma ${idiomaDestino}: "${texto}"`
          }
        ],
        temperature: 0.1,
        max_completion_tokens: 1024
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
    
    // Si no hay texto traducible, retornar null sin hacer nada
    if (translation === "FALSE") {
      console.log("⚠️ Sin contenido traducible detectado");
      return null;
    }
    
    console.log("✓ Traducción exitosa:", translation);
    
    // Guardar en el historial (solo si hay traducción válida)
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
