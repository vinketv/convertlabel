// Vérifie si l'API Chrome est disponible
if (chrome && chrome.runtime && chrome.runtime.getManifest) {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;

  // Insère la version dans l'élément HTML
  document.getElementById("app-version").textContent = version;
} else {
  console.error("L'API Chrome n'est pas disponible.");
}
