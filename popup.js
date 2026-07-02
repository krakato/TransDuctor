// Elementos del DOM
const enableToggle = document.getElementById("enableToggle");
const targetLanguageSelect = document.getElementById("targetLanguage");
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

// Valores por defecto
const defaultSettings = {
  enabled: true,
  targetLanguage: "inglés",
  hoverDelay: 2000,
  fontSize: 12,
  theme: "dark"
};

// Cargar configuración al abrir el popup
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    enableToggle.checked = settings.enabled;
    targetLanguageSelect.value = settings.targetLanguage;
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
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;

  setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
  }, 3000);
}

// Event Listeners
enableToggle.addEventListener("change", saveSettings);
targetLanguageSelect.addEventListener("change", saveSettings);
themeSelect.addEventListener("change", saveSettings);

hoverDelaySlider.addEventListener("input", (e) => {
  hoverDelayValue.textContent = e.target.value + "ms";
  saveSettings();
});

fontSizeSlider.addEventListener("input", (e) => {
  fontSizeValue.textContent = e.target.value + "px";
  saveSettings();
});

// Guardar cambios en la clave API
groqApiKeyInput.addEventListener("change", saveSettings);

// Toglear visibilidad de la clave API
toggleApiKeyVisibilityBtn.addEventListener("click", () => {
  const isPassword = groqApiKeyInput.type === "password";
  groqApiKeyInput.type = isPassword ? "text" : "password";
  toggleApiKeyVisibilityBtn.textContent = isPassword ? "🙈" : "👁️";
});

// Probar traducción
testTranslateBtn.addEventListener("click", async () => {
  testTranslateBtn.disabled = true;
  testTranslateBtn.textContent = "⌛ Traduciendo...";

  try {
    const response = await chrome.runtime.sendMessage({
      action: "translate",
      text: "Hello world! This is a translation test.",
      targetLanguage: targetLanguageSelect.value
    });

    if (response.success) {
      showMessage(`✓ Traducción: "${response.translation}"`, "success");
    } else {
      showMessage(`❌ Error: ${response.error}`, "error");
    }
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, "error");
  } finally {
    testTranslateBtn.disabled = false;
    testTranslateBtn.textContent = "🧪 Probar traducción";
  }
});

// Restaurar valores por defecto
resetSettingsBtn.addEventListener("click", () => {
  if (confirm("¿Restaurar todos los valores por defecto?")) {
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings();
      showMessage("✓ Valores restaurados", "success");
    });
  }
});

// Cargar configuración al abrir
loadSettings();
