const motsCles = [
  "USER",
  "UPS",
  "Chronopost",
  "Colissimo",
  "Vinted Go",
  "l'ensemble de vos articles dans un seul et unique carton.",
];

document.getElementById("process-pdf").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const pdfUrl = tab.url;
    if (pdfUrl && pdfUrl.endsWith(".pdf")) {
      pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
        pdf.getPage(1).then(function (page) {
          page.getTextContent().then(function (textContent) {
            // Le texte du PDF est dans textContent.items
            const motTrouve = trouverMotCle(textContent.items, motsCles);
            if (motTrouve) {
              const configId = detectTransporter(motTrouve);
              resize(configId);
            } else {
              alert("Error: Aucun mot-clé n'a été trouvé.");
            }
          });
        });
      });
    } else {
      alert(`Veuillez ouvrir un fichier PDF.`);
    }
  });
});

function trouverMotCle(tableau, motsCles) {
  const regex = new RegExp(motsCles.join("|"), "gi");
  for (const ligne of tableau) {
    const match = ligne.str.match(regex);
    if (match) {
      return match[0]; // Retourne le premier mot-clé trouvé
    }
  }
  return null; // Aucun mot-clé trouvé
}
