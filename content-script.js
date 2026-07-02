// Variables globales
let hoverTimeout = null;
let currentElement = null;
let isTranslating = false;
let translatorTooltip = null;
let lastTranslatedElement = null;

// Obtener configuración
let settings = {
  enabled: true,
  targetLanguage: "inglés",
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

  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (translatorTooltip === tooltip) {
      removerTooltip();
    }
  }, 10000);
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
 * Obtener texto seleccionado en el elemento
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
 * Traducir y mostrar tooltip
 */
function traducirYMostrar(element) {
  if (isTranslating || !settings.enabled) return;

  isTranslating = true;
  const texto = obtenerTextoDelElemento(element);

  if (texto.length === 0 || texto.length > 500) {
    isTranslating = false;
    return;
  }

  // Mostrar "Traduciendo..."
  const rect = element.getBoundingClientRect();
  crearTooltip("⌛ Traduciendo...", rect);

  // Enviar solicitud de traducción al background
  chrome.runtime.sendMessage(
    {
      action: "translate",
      text: texto,
      targetLanguage: settings.targetLanguage
    },
    (response) => {
      isTranslating = false;

      if (response && response.success) {
        if (translatorTooltip) {
          crearTooltip(response.translation, rect);
        }
        lastTranslatedElement = element;
      } else {
        if (translatorTooltip) {
          crearTooltip("❌ Error en traducción", rect);
        }
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
        traducirYMostrar(element);
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
