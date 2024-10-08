// Injecter pdf-lib.min.js dans la page
(function () {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("utils/pdf-lib.min.js");
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Injecter pdf.js dans la page
(function () {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("utils/pdf.min.js");
  script.onload = function () {
    // Injecter pdf.worker.js après avoir injecté pdf.js
    const workerScript = document.createElement("script");
    workerScript.src = chrome.runtime.getURL("utils/pdf.worker.js");
    workerScript.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(workerScript);
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processPDF") {
    processPDF();
  }
});

function processPDF() {
  if (typeof window.pdfjsLib === "undefined") {
    console.error("pdfjsLib is not loaded");
    return;
  }

  // Configurer PDF.js pour utiliser un fake worker
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
    "utils/pdf.worker.js"
  );

  async function handleDownloadAndProcess() {
    // Trouver le lien de prévisualisation du PDF dans les éléments de la page
    const previewLink = document.querySelector(
      'a[href*="view=att"][href*="disp=inline"]'
    );
    if (previewLink) {
      const pdfUrl = previewLink.href;

      // Téléchargez et traitez le PDF
      const response = await fetch(pdfUrl);
      const pdfBuffer = await response.arrayBuffer();

      // Convertir le PDF en image et traiter le bordereau
      const imageUrl = await convertPdfToImage(pdfBuffer);
      console.log("Image URL:", imageUrl);

      // Traiter le bordereau avec l'URL de l'image
      // Ajoutez votre logique ici

      // Révoquer l'URL pour libérer la mémoire
      URL.revokeObjectURL(imageUrl);
    } else {
      console.error("Aucun lien de prévisualisation de PDF trouvé.");
    }
  }

  async function convertPdfToImage(pdfBuffer) {
    // Charger le document PDF en utilisant pdfjs-dist
    const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    // Récupérer la première page
    const page = await pdf.getPage(1);

    // Définir les dimensions du canevas
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Rendre la page dans le canevas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Convertir le canevas en URL d'image
    const imageUrl = canvas.toDataURL("image/png");
    return imageUrl;
  }

  handleDownloadAndProcess();
}
