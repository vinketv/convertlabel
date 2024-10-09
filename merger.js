// popup.js
// Cible le li contenant l'input file
document.querySelector(".merge").addEventListener("click", function () {
  // Déclenche l'ouverture de la boîte de dialogue de sélection de fichiers
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", async () => {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;

  // Vérifier si des fichiers ont été sélectionnés
  if (files.length === 0) {
    alert("Veuillez sélectionner au moins un fichier PDF");
    return;
  }

  fusionnerPDFs(files);
});

async function fusionnerPDFs(files) {
  const newPdfDoc = await PDFLib.PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const otherPdfBytes = await files[i].arrayBuffer();
    const otherPdfDoc = await PDFLib.PDFDocument.load(otherPdfBytes);
    const otherPages = await newPdfDoc.copyPages(
      otherPdfDoc,
      otherPdfDoc.getPageIndices()
    );
    otherPages.forEach((page) => newPdfDoc.addPage(page));
  }

  const pdfBytes = await newPdfDoc.save();
  const blob = new Blob([pdfBytes], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);

  // Utiliser l'API chrome.downloads.download avec l'option saveAs
  chrome.downloads.download(
    {
      url: url,
      filename: "bordereau-cropped.pdf",
      saveAs: true, // Demande à l'utilisateur où enregistrer le fichier
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log("Téléchargement lancé avec l'ID : ", downloadId);
      }
    }
  );

  // Ouvrir le fichier PDF dans un nouvel onglet
  window.open(url);

  // Révoquer l'URL pour libérer la mémoire
  URL.revokeObjectURL(url);
}
