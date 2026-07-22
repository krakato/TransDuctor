// Variables globales
let hoverTimeout = null;
let currentElement = null;
let isTranslating = false;
let translatorTooltip = null;
let lastTranslatedElement = null;
let ctrlPressed = false;
let lastWord = null; // Rastrear la palabra anterior bajo el cursor
let wordChangeTimeout = null; // Timeout para detectar cambios de palabra

// Obtener configuración
let settings = {
  enabled: true,
  targetLanguage: "inglés",
  sourceLanguage: "auto",
  translationMode: "word",
  requireCtrl: false,
  skipSameLanguage: true,
  hoverDelay: 2000,
  autoDetectLanguage: false,
  fontSize: 12,
  theme: "dark"
};

// Cargar configuración al iniciar
chrome.storage.sync.get(settings, (stored) => {
  settings = stored;
});

// Escuchar cambios en almacenamiento
chrome.storage.onChanged.addListener((changes) => {
  for (let key in changes) {
    if (key in settings) {
      settings[key] = changes[key].newValue;
    }
  }
});

// Rastrear tecla Ctrl
document.addEventListener("keydown", (e) => {
  if (e.key === "Control" || e.ctrlKey) {
    ctrlPressed = true;
  }
}, true);

document.addEventListener("keyup", (e) => {
  if (e.key === "Control" || !e.ctrlKey) {
    ctrlPressed = false;
  }
}, true);

/**
 * Obtener la palabra exacta bajo el cursor del ratón
 * Soporta acentos y caracteres especiales en español
 */
function obtenerPalabraBajoPuntero(element, event) {
  try {
    let textNode = null;
    let offset = 0;

    // Intentar con caretPositionFromPoint (recomendado, estándar moderno)
    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(event.clientX, event.clientY);
      if (position && position.offsetNode) {
        textNode = position.offsetNode;
        offset = position.offset;
      }
    }
    // Fallback a caretRangeFromPoint (deprecado pero más compatible)
    else if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range) {
        textNode = range.startContainer;
        offset = range.startOffset;
      }
    }

    // Validar que obtuvimos un text node
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    const text = textNode.textContent;
    if (!text || text.length === 0) return null;

    // Expresión regular mejorada: incluye letras, números y acentos españoles
    // Esto detecta mejor las palabras en comparación con /\w/ que puede variar según el locale
    const wordRegex = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/;

    // Buscar inicio de palabra retrocediendo desde el cursor
    let inicio = offset;
    while (inicio > 0 && wordRegex.test(text[inicio - 1])) {
      inicio--;
    }

    // Buscar fin de palabra avanzando desde el cursor
    let fin = offset;
    while (fin < text.length && wordRegex.test(text[fin])) {
      fin++;
    }

    const palabra = text.substring(inicio, fin).trim();
    return palabra.length > 0 ? palabra : null;
  } catch (e) {
    console.log("Error en obtenerPalabraBajoPuntero:", e);
    return null;
  }
}

/**
 * Obtener texto seleccionado
 */
function obtenerTextoSeleccionado() {
  return window.getSelection().toString().trim();
}

/**
 * Obtener párrafo completo del elemento
 */
function obtenerTextoDelElemento(element) {
  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent.trim();
  }
  
  let texto = "";
  for (let child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const trimmed = child.textContent.trim();
      if (trimmed) texto += trimmed + " ";
    }
  }
  return texto.trim() || element.textContent.trim();
}

/**
 * Crear tooltip flotante para la traducción
 */
function crearTooltip(traduccion, rect) {
  // Remover tooltip anterior
  removerTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = "transductor-tooltip";
  tooltip.textContent = traduccion;
  
  // Estilos del tooltip mejorados
  const isLightMode = settings.theme === "light";
  const estilos = `
    position: fixed;
    background: ${isLightMode ? "#fbf7aa" : "#1e1e1e"};
    color: ${isLightMode ? "#000" : "#fff"};
    padding: 12px 16px;
    border-radius: 14px;
    font-family: Consolas,'Courier New', monospace;
    font-size: ${settings.fontSize}px;
    z-index: 999999999;
    box-shadow: 0 6px 20px rgba(25, 24, 24, 0.8);
    max-width: 600px;
    word-wrap: break-word;
    overflow-x: hidden;
    border: 2px solid ${isLightMode ? "#d4a574" : "#444"};
    animation: slideInDown 0.3s ease-out;
    line-height: 1.4;
  `;
  
  tooltip.setAttribute("style", estilos);
  document.body.appendChild(tooltip);

  // Posicionar el tooltip
  const tooltipRect = tooltip.getBoundingClientRect();
  let top = rect.top - tooltipRect.height - 10;
  let left = rect.left + (rect.width - tooltipRect.width) / 2;

  // Ajustar si sale de pantalla
  if (top < 0) {
    top = rect.bottom + 10;
  }
  if (left < 0) {
    left = 10;
  }
  if (left + tooltipRect.width > window.innerWidth) {
    left = window.innerWidth - tooltipRect.width - 10;
  }

  tooltip.style.top = top + "px";
  tooltip.style.left = left + "px";

  translatorTooltip = tooltip;

  // Auto-remover después de 20 segundos (tiempo suficiente para ver traducciones o errores)
  setTimeout(() => {
    if (translatorTooltip === tooltip) {
      removerTooltip();
    }
  }, 20000);
}

/**
 * Remover tooltip
 */
function removerTooltip() {
  if (translatorTooltip) {
    translatorTooltip.remove();
    translatorTooltip = null;
  }
}

/**
 * Validar si el contexto de la extensión aún es válido
 */
function validarContextoExtension() {
  try {
    // Intentar acceder a chrome.runtime para detectar contexto invalidado
    if (!chrome.runtime) {
      return false;
    }
    // Limpiar lastError previo
    const _ = chrome.runtime.lastError;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Traducir y mostrar tooltip
 */
function traducirYMostrar(element, event) {
  if (isTranslating || !settings.enabled) return;

  // Validar que sea un Element node
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  // Requerir Ctrl si está configurado
  if (settings.requireCtrl && !ctrlPressed) {
    return;
  }

  // Detección automática inteligente de qué traducir
  // Prioridad: Selección > Palabra bajo cursor > Párrafo completo
  let texto = "";
  
  // 1. Primero: ¿Hay texto seleccionado?
  const textoSeleccionado = obtenerTextoSeleccionado();
  if (textoSeleccionado) {
    texto = textoSeleccionado;
  } else {
    // 2. Si no hay selección: intenta obtener palabra bajo cursor
    texto = obtenerPalabraBajoPuntero(element, event);
    
    // 3. Fallback: Si no encontró palabra, usa párrafo completo
    if (!texto || texto.length === 0) {
      texto = obtenerTextoDelElemento(element);
    }
  }

  if (!texto || texto.length === 0 || texto.length > 500) {
    return;
  }

  // No traducir si idioma origen = destino
  if (settings.skipSameLanguage && settings.sourceLanguage !== "auto" && settings.sourceLanguage === settings.targetLanguage) {
    return;
  }

  // Validar contexto de extensión antes de proceder
  if (!validarContextoExtension()) {
    //console.warn("Contexto de extensión invalidado");
    return;
  }

  isTranslating = true;

  // Mostrar "Traduciendo..."
  const rect = element.getBoundingClientRect();
  crearTooltip("⌛ Traduciendo...", rect);

  // Timeout para errores de conexión (10 segundos)
  let tiempoTimeout = setTimeout(() => {
    if (isTranslating) {
      isTranslating = false;
      //console.error("Timeout: No se recibió respuesta del background");
      if (translatorTooltip) {
        crearTooltip("❌ Tiempo de espera agotado", rect);
      }
    }
  }, 10000);

  try {
    // Enviar solicitud de traducción al background
    chrome.runtime.sendMessage(
      {
        action: "translate",
        text: texto,
        targetLanguage: settings.targetLanguage,
        sourceLanguage: settings.sourceLanguage
      },
      (response) => {
        // Limpiar timeout si llegó respuesta
        clearTimeout(tiempoTimeout);
        isTranslating = false;

        // Verificar si hay error en el runtime primero
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          // Ignorar silenciosamente errores de contexto invalidado
          if (errorMsg && errorMsg.includes("Extension context invalidated")) {
            //console.warn("Contexto de extensión invalidado");
            return;
          }
          //console.error("Error en runtime:", chrome.runtime.lastError);
          if (translatorTooltip) {
            crearTooltip("❌ Error: " + errorMsg, rect);
          }
          return;
        }

        // Validar que la respuesta exista
        if (!response) {
          //console.error("No se recibió respuesta del background script");
          if (translatorTooltip) {
            crearTooltip("❌ Sin respuesta", rect);
          }
          return;
        }

        // Manejar respuesta exitosa
        if (response.success && response.translation) {
          if (translatorTooltip) {
            crearTooltip(response.translation, rect);
          }
          lastTranslatedElement = element;
        } else {
          // Manejar error en la respuesta
          const errorMsg = response.error || "Error en traducción";
          if (translatorTooltip) {
            crearTooltip("❌ " + errorMsg, rect);
          }
          //console.error("Error en traducción:", errorMsg);
        }
      }
    );
  } catch (error) {
    clearTimeout(tiempoTimeout);
    isTranslating = false;
    // Manejar específicamente el error de contexto invalidado
    if (error.message && error.message.includes("Extension context invalidated")) {
      //console.warn("Contexto de extensión invalidado durante sendMessage");
      return;
    }
    //console.error("Error al enviar mensaje:", error);
    if (translatorTooltip) {
      crearTooltip("❌ Error: " + error.message, rect);
    }
  }
}



/**
 * Event listeners para elementos con texto
 */

// Detectar entrada al elemento (mantener para limpiar estado)
document.addEventListener(
  "mouseenter",
  (event) => {
    if (!settings.enabled) return;

    const element = event.target;

    // Validar que sea un Element node (no TEXT_NODE)
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    // Filtrar elementos que no queremos traducir
    if (
      element.tagName === "SCRIPT" ||
      element.tagName === "STYLE" ||
      element.tagName === "NOSCRIPT" ||
      element.id === "transductor-tooltip" ||
      element.closest("#transductor-tooltip")
    ) {
      return;
    }

    // Limpiar timeouts anteriores
    clearTimeout(hoverTimeout);
    clearTimeout(wordChangeTimeout);
    currentElement = element;
    lastWord = null; // Resetear palabra anterior al entrar
  },
  true
);

// Detectar salida del elemento
document.addEventListener(
  "mouseleave",
  (event) => {
    clearTimeout(hoverTimeout);
    clearTimeout(wordChangeTimeout);
    hoverTimeout = null;
    wordChangeTimeout = null;
    currentElement = null;
    lastWord = null;
    removerTooltip();
  },
  true
);

// Detectar movimiento del mouse para cambios de palabra en tiempo real
document.addEventListener(
  "mousemove",
  (event) => {
    if (!settings.enabled || !currentElement || isTranslating) {
      return;
    }

    const element = event.target;

    // Validar que sea un Element node
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    
    // Obtener la palabra actual bajo el cursor
    let palabraActual = "";
    if (settings.translationMode === "word") {
      palabraActual = obtenerPalabraBajoPuntero(element, event) || "";
    } else if (settings.translationMode === "selection") {
      palabraActual = obtenerTextoSeleccionado();
    } else if (settings.translationMode === "ctrl") {
      if (!ctrlPressed) return;
      palabraActual = obtenerTextoDelElemento(element);
    } else {
      // paragraph mode
      palabraActual = obtenerTextoDelElemento(element);
    }
    
    // Detectar si cambió la palabra
    if (palabraActual && palabraActual !== lastWord && palabraActual.length > 0 && palabraActual.length <= 500) {
      lastWord = palabraActual;

      // Limpiar timeout anterior si existe
      clearTimeout(wordChangeTimeout);

      // Borrar tooltip actual inmediatamente
      removerTooltip();

      // Esperar 2 segundos antes de traducir la nueva palabra
      wordChangeTimeout = setTimeout(() => {
        if (lastWord === palabraActual && !isTranslating && settings.enabled) {
          traducirYMostrar(element, event);
        }
      }, settings.hoverDelay); // Usar hoverDelay (configurado a 2000ms por defecto)
    }
  },
  true
);

/**
 * Agregar estilos CSS para animaciones
 */
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  #transductor-tooltip {
    font-weight: 500;
    letter-spacing: 0.5px;
    backdrop-filter: blur(5px);
    transition: all 0.2s ease;
  }

  #transductor-tooltip:hover {
    box-shadow: 0 8px 24px rgba(128, 128, 128, 0.5);
    transform: translateY(-2px);
  }
`;
document.documentElement.appendChild(style);

console.log("✓ TransDuctor iniciado correctamente");
