// Elementos del DOM
const backBtn = document.getElementById("backBtn");
const enabledCheckbox = document.getElementById("enabled");
const targetLanguageSelect = document.getElementById("targetLanguage");
const sourceLanguageSelect = document.getElementById("sourceLanguage");
const translationModeSelect = document.getElementById("translationMode");
const requireCtrlCheckbox = document.getElementById("requireCtrl");
const skipSameLanguageCheckbox = document.getElementById("skipSameLanguage");
const hoverDelaySlider = document.getElementById("hoverDelay");
const hoverValue = document.getElementById("hoverValue");
const fontSizeSlider = document.getElementById("fontSize");
const fontValue = document.getElementById("fontValue");
const themeSelect = document.getElementById("theme");
const autoDetectCheckbox = document.getElementById("autoDetect");
const clearCacheBtn = document.getElementById("clearCache");
const exportSettingsBtn = document.getElementById("exportSettings");
const importSettingsBtn = document.getElementById("importSettings");
const resetAllBtn = document.getElementById("resetAll");
const statusMessage = document.getElementById("statusMessage");
const fileInput = document.getElementById("fileInput");

// Manejador del botón volver
if (backBtn) {
  backBtn.addEventListener("click", () => {
    history.back();
  });
}

// Valores por defecto
const defaultSettings = {
  enabled: true,
  targetLanguage: "inglés",
  sourceLanguage: "auto",
  translationMode: "word",
  requireCtrl: false,
  skipSameLanguage: true,
  hoverDelay: 2000,
  fontSize: 12,
  theme: "dark",
  autoDetectLanguage: false
};

// Cargar configuración
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    enabledCheckbox.checked = settings.enabled;
    targetLanguageSelect.value = settings.targetLanguage;
    sourceLanguageSelect.value = settings.sourceLanguage || "auto";
    translationModeSelect.value = settings.translationMode || "word";
    requireCtrlCheckbox.checked = settings.requireCtrl || false;
    skipSameLanguageCheckbox.checked = settings.skipSameLanguage !== false;
    hoverDelaySlider.value = settings.hoverDelay;
    hoverValue.textContent = settings.hoverDelay + "ms";
    fontSizeSlider.value = settings.fontSize;
    fontValue.textContent = settings.fontSize + "px";
    themeSelect.value = settings.theme;
    autoDetectCheckbox.checked = settings.autoDetectLanguage || false;
  });
}

// Guardar configuración
function saveSettings() {
  const settings = {
    enabled: enabledCheckbox.checked,
    targetLanguage: targetLanguageSelect.value,
    sourceLanguage: sourceLanguageSelect.value,
    translationMode: translationModeSelect.value,
    requireCtrl: requireCtrlCheckbox.checked,
    skipSameLanguage: skipSameLanguageCheckbox.checked,
    hoverDelay: parseInt(hoverDelaySlider.value),
    fontSize: parseInt(fontSizeSlider.value),
    theme: themeSelect.value,
    autoDetectLanguage: autoDetectCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    showMessage("✓ Configuración guardada", "success");
  });
}

// Mostrar mensaje
function showMessage(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;

  setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
  }, 3000);
}

// Event Listeners para cambios
enabledCheckbox.addEventListener("change", saveSettings);
targetLanguageSelect.addEventListener("change", saveSettings);
sourceLanguageSelect.addEventListener("change", saveSettings);
translationModeSelect.addEventListener("change", saveSettings);
requireCtrlCheckbox.addEventListener("change", saveSettings);
skipSameLanguageCheckbox.addEventListener("change", saveSettings);
themeSelect.addEventListener("change", saveSettings);
autoDetectCheckbox.addEventListener("change", saveSettings);

hoverDelaySlider.addEventListener("input", (e) => {
  hoverValue.textContent = e.target.value + "ms";
  saveSettings();
});

fontSizeSlider.addEventListener("input", (e) => {
  fontValue.textContent = e.target.value + "px";
  saveSettings();
});

// Limpiar caché
clearCacheBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que quieres limpiar el caché de traducciones?")) {
    chrome.storage.local.remove("translationCache", () => {
      showMessage("✓ Caché limpiado correctamente", "success");
    });
  }
});

// Exportar configuración
exportSettingsBtn.addEventListener("click", () => {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transductor-config.json";
    link.click();
    URL.revokeObjectURL(url);
    showMessage("✓ Configuración exportada", "success");
  });
});

// Importar configuración
importSettingsBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const settings = JSON.parse(event.target.result);
      
      // Validar que tenga las propiedades necesarias
      const requiredKeys = Object.keys(defaultSettings);
      const hasAllKeys = requiredKeys.every(key => key in settings);
      
      if (!hasAllKeys) {
        throw new Error("Archivo de configuración inválido");
      }

      chrome.storage.sync.set(settings, () => {
        loadSettings();
        showMessage("✓ Configuración importada correctamente", "success");
      });
    } catch (error) {
      showMessage(`❌ Error al importar: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
  fileInput.value = ""; // Limpiar input
});

// Restaurar valores por defecto
resetAllBtn.addEventListener("click", () => {
  if (confirm("¿Restaurar todos los valores por defecto? Esta acción no se puede deshacer.")) {
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings();
      showMessage("✓ Valores restaurados al defecto", "success");
    });
  }
});

// Cargar configuración al abrir la página
loadSettings();

// Notificaciones si se cambia en otras pestañas
window.addEventListener("storage", () => {
  loadSettings();
});
