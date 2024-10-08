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

  // Créer un objet Blob pour représenter les données du PDF
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  window.open(url);

  // Utiliser chrome.downloads pour lancer le téléchargement
  //   chrome.downloads.download({
  //     url: URL.createObjectURL(blob),
  //     filename: "fusion.pdf",
  //     saveAs: true, // Permet à l'utilisateur de choisir le nom du fichier et le répertoire de destination
  //   });
}
