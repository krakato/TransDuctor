// Variables globales
let hoverTimeout = null;
let currentElement = null;
let isTranslating = false;
let translatorTooltip = null;
let lastTranslatedElement = null;
let ctrlPressed = false;

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
 */
function obtenerPalabraBajoPuntero(element, event) {
  try {
    let textNode = null;
    let offset = 0;

    // Intentar con caretPositionFromPoint (recomendado, pero no en todos los navegadores)
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

    // Buscar inicio de palabra
    let inicio = offset;
    while (inicio > 0 && /\w/.test(text[inicio - 1])) {
      inicio--;
    }

    // Buscar fin de palabra
    let fin = offset;
    while (fin < text.length && /\w/.test(text[fin])) {
      fin++;
    }

    const palabra = text.substring(inicio, fin).trim();
    return palabra.length > 0 ? palabra : null;
  } catch (e) {
    console.error("Error en obtenerPalabraBajoPuntero:", e);
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
  
  // Estilos del tooltip
  const estilos = `
    position: fixed;
    background: ${settings.theme === "dark" ? "#1e1e1e" : "#fff"};
    color: ${settings.theme === "dark" ? "#fff" : "#000"};
    padding: 8px 12px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: ${settings.fontSize}px;
    z-index: 999999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    word-wrap: break-word;
    border: 1px solid ${settings.theme === "dark" ? "#444" : "#ddd"};
    animation: slideInDown 0.3s ease-out;
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

  // Seleccionar texto basado en modo
  let texto = "";
  if (settings.translationMode === "word") {
    texto = obtenerPalabraBajoPuntero(element, event);
  } else if (settings.translationMode === "selection") {
    texto = obtenerTextoSeleccionado();
  } else if (settings.translationMode === "ctrl") {
    if (!ctrlPressed) return;
    texto = obtenerTextoDelElemento(element);
  } else {
    // paragraph mode (default)
    texto = obtenerTextoDelElemento(element);
  }

  if (!texto || texto.length === 0 || texto.length > 500) {
    return;
  }

  // No traducir si idioma origen = destino
  if (settings.skipSameLanguage && settings.sourceLanguage !== "auto" && settings.sourceLanguage === settings.targetLanguage) {
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
      console.error("Timeout: No se recibió respuesta del background");
      if (translatorTooltip) {
        crearTooltip("❌ Tiempo de espera agotado", rect);
      }
    }
  }, 10000);

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
        console.error("Error en runtime:", chrome.runtime.lastError);
        if (translatorTooltip) {
          crearTooltip("❌ Error: " + chrome.runtime.lastError.message, rect);
        }
        return;
      }

      // Validar que la respuesta exista
      if (!response) {
        console.error("No se recibió respuesta del background script");
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
        console.error("Error en traducción:", errorMsg);
      }
    }
  );
}

/**
 * Event listeners para elementos con texto
 */
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

    // Limpiar timeout anterior
    clearTimeout(hoverTimeout);
    removerTooltip();
    currentElement = element;

    // Configurar nuevo timeout
    hoverTimeout = setTimeout(() => {
      if (currentElement === element && !isTranslating) {
        traducirYMostrar(element, event);
      }
    }, settings.hoverDelay);
  },
  true
);

document.addEventListener(
  "mouseleave",
  (event) => {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
    currentElement = null;
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
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
`;
document.documentElement.appendChild(style);

console.log("✓ TransDuctor iniciado correctamente");
