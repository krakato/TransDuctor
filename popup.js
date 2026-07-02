// Elementos del DOM con validación
const enableToggle = document.getElementById("enableToggle");
const targetLanguageSelect = document.getElementById("targetLanguage");
const sourceLanguageSelect = document.getElementById("sourceLanguage");
const translationModeSelect = document.getElementById("translationMode");
const requireCtrlCheckbox = document.getElementById("requireCtrl");
const skipSameLanguageCheckbox = document.getElementById("skipSameLanguage");
const hoverDelaySlider = document.getElementById("hoverDelay");
const hoverDelayValue = document.getElementById("hoverDelayValue");
const fontSizeSlider = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const themeSelect = document.getElementById("theme");
const testTranslateBtn = document.getElementById("testTranslate");
const resetSettingsBtn = document.getElementById("resetSettings");
const statusMessage = document.getElementById("statusMessage");
const groqApiKeyInput = document.getElementById("groqApiKey");
const toggleApiKeyVisibilityBtn = document.getElementById("toggleApiKeyVisibility");

// Validar que todos los elementos existan
if (!enableToggle || !targetLanguageSelect || !groqApiKeyInput) {
  console.error("Error: No se pudieron encontrar los elementos del DOM del popup");
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
  theme: "dark"
};

// Cargar configuración al abrir el popup
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    enableToggle.checked = settings.enabled;
    targetLanguageSelect.value = settings.targetLanguage;
    sourceLanguageSelect.value = settings.sourceLanguage || "auto";
    translationModeSelect.value = settings.translationMode || "word";
    requireCtrlCheckbox.checked = settings.requireCtrl || false;
    skipSameLanguageCheckbox.checked = settings.skipSameLanguage !== false;
    hoverDelaySlider.value = settings.hoverDelay;
    hoverDelayValue.textContent = settings.hoverDelay + "ms";
    fontSizeSlider.value = settings.fontSize;
    fontSizeValue.textContent = settings.fontSize + "px";
    themeSelect.value = settings.theme;
    
    // Cargar la clave API
    if (settings.groqApiKey) {
      groqApiKeyInput.value = settings.groqApiKey;
    }
  });
}

// Guardar configuración
function saveSettings() {
  const settings = {
    enabled: enableToggle.checked,
    targetLanguage: targetLanguageSelect.value,
    sourceLanguage: sourceLanguageSelect.value,
    translationMode: translationModeSelect.value,
    requireCtrl: requireCtrlCheckbox.checked,
    skipSameLanguage: skipSameLanguageCheckbox.checked,
    hoverDelay: parseInt(hoverDelaySlider.value),
    fontSize: parseInt(fontSizeSlider.value),
    theme: themeSelect.value,
    groqApiKey: groqApiKeyInput.value.trim() // Guardar la clave API
  };

  chrome.storage.sync.set(settings, () => {
    showMessage("✓ Configuración guardada", "success");
  });
}

// Mostrar mensaje de estado
function showMessage(message, type = "info") {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;

  setTimeout(() => {
    if (statusMessage) {
      statusMessage.textContent = "";
      statusMessage.className = "status-message";
    }
  }, 3000);
}

// Helper para agregar event listeners de forma segura
function safeAddListener(element, event, callback) {
  if (element) {
    element.addEventListener(event, callback);
  }
}

// Event Listeners (con validación)
safeAddListener(enableToggle, "change", saveSettings);
safeAddListener(targetLanguageSelect, "change", saveSettings);
safeAddListener(sourceLanguageSelect, "change", saveSettings);
safeAddListener(translationModeSelect, "change", saveSettings);
safeAddListener(requireCtrlCheckbox, "change", saveSettings);
safeAddListener(skipSameLanguageCheckbox, "change", saveSettings);
safeAddListener(themeSelect, "change", saveSettings);
safeAddListener(groqApiKeyInput, "change", saveSettings);

if (hoverDelaySlider) {
  hoverDelaySlider.addEventListener("input", (e) => {
    if (hoverDelayValue) {
      hoverDelayValue.textContent = e.target.value + "ms";
    }
    saveSettings();
  });
}

if (fontSizeSlider) {
  fontSizeSlider.addEventListener("input", (e) => {
    if (fontSizeValue) {
      fontSizeValue.textContent = e.target.value + "px";
    }
    saveSettings();
  });
}

// Guardar cambios en la clave API
safeAddListener(groqApiKeyInput, "change", saveSettings);

// Toglear visibilidad de la clave API
if (toggleApiKeyVisibilityBtn && groqApiKeyInput) {
  toggleApiKeyVisibilityBtn.addEventListener("click", () => {
    const isPassword = groqApiKeyInput.type === "password";
    groqApiKeyInput.type = isPassword ? "text" : "password";
    toggleApiKeyVisibilityBtn.textContent = isPassword ? "🙈" : "👁️";
  });
}

// Probar traducción
if (testTranslateBtn) {
  testTranslateBtn.addEventListener("click", async () => {
    testTranslateBtn.disabled = true;
    testTranslateBtn.textContent = "⌛ Traduciendo...";

    try {
      if (!targetLanguageSelect) return;
      const response = await chrome.runtime.sendMessage({
        action: "translate",
        text: "Hello world! This is a translation test.",
        targetLanguage: targetLanguageSelect.value
      });

      if (response && response.success) {
        showMessage(`✓ Traducción: "${response.translation}"`, "success");
      } else {
        showMessage(`❌ Error: ${response?.error || "Sin respuesta"}`, "error");
      }
    } catch (error) {
      showMessage(`❌ Error: ${error.message}`, "error");
    } finally {
      testTranslateBtn.disabled = false;
      testTranslateBtn.textContent = "🧪 Probar traducción";
    }
  });
}

// Restaurar valores por defecto
if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener("click", () => {
    if (confirm("¿Restaurar todos los valores por defecto?")) {
      chrome.storage.sync.set(defaultSettings, () => {
        loadSettings();
        showMessage("✓ Valores restaurados", "success");
      });
    }
  });
}

// Cargar configuración al abrir
loadSettings();
