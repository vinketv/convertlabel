async function resize(configName) {
  chrome.extension
    .isAllowedFileSchemeAccess()
    .then((isAllowed) => {
      if (isAllowed) {
        // Accès autorisé, poursuivre avec le traitement du PDF
        const currentConfig = config[configName];
        if (!currentConfig) {
          console.error("Configuration not found for this ID");
          return;
        }

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const currentTab = tabs[0];
            const pdfUrl = currentTab.url;

            if (pdfUrl.endsWith(".pdf") || pdfUrl.indexOf("pdf") !== -1) {
              fetch(pdfUrl)
                .then((res) => res.arrayBuffer())
                .then(async (pdfBuffer) => {
                  const pdfDoc = await PDFLib.PDFDocument.load(pdfBuffer);
                  const pages = pdfDoc.getPages();
                  const firstPage = pages[0];
                  const pageHeight = firstPage.getHeight();
                  const pageWidth = firstPage.getWidth();

                  // Ajuste la dimension dynamiquement en fonction de la configuration
                  if (currentConfig.width === null) {
                    currentConfig.width = pageWidth;
                  }

                  if (currentConfig.height === null) {
                    currentConfig.y = pageHeight;
                    currentConfig.height = pageHeight;
                  }

                  if (currentConfig.x === null) {
                    currentConfig.x = pageWidth / 2;
                  }

                  const y = pageHeight - currentConfig.y;
                  const x = currentConfig.x;
                  const width = currentConfig.width;
                  const height = currentConfig.height;

                  firstPage.setMediaBox(x, y, width, height);

                  const pdfBytes = await pdfDoc.save();
                  const blob = new Blob([pdfBytes], {
                    type: "application/pdf",
                  });
                  const url = URL.createObjectURL(blob);

                  // Utiliser l'API chrome.downloads.download avec l'option saveAs
                  chrome.downloads.download(
                    {
                      url: url,
                      filename: "bordereau-cropped.pdf",
                      saveAs: true, // Demander à l'utilisateur l'emplacement du fichier
                    },
                    function (downloadId) {
                      if (chrome.runtime.lastError) {
                        console.error(
                          "Error downloading file:",
                          chrome.runtime.lastError.message
                        );
                        alert(
                          "Le téléchargement a échoué : " +
                            chrome.runtime.lastError.message
                        );
                      } else if (!downloadId) {
                        console.error(
                          "Download failed: no downloadId returned."
                        );
                        alert("Le téléchargement a échoué.");
                      } else if (downloadId) {
                        // Ecouter les changements du téléchargement pour savoir quand il est terminé
                        chrome.downloads.onChanged.addListener(function (
                          delta
                        ) {
                          if (
                            delta.id === downloadId &&
                            delta.state &&
                            delta.state.current === "complete"
                          ) {
                            window.open(url); // Ouvre le PDF dans un nouvel onglet

                            // Révoquer l'URL pour libérer la mémoire
                            URL.revokeObjectURL(url);
                          }
                        });
                      } else {
                        alert("Le téléchargement a échoué.");
                      }
                    }
                  );
                })
                .catch((error) => {
                  console.error(
                    "Error occurred while fetching or processing PDF:",
                    error
                  );
                });
            } else {
              alert("This does not seem to be a PDF file.");
            }
          }
        );
      } else {
        // Accès non autorisé, afficher un message à l'utilisateur
        alert(
          "Vous devez autoriser l'accès aux URL de fichier pour utiliser cette fonctionnalité."
        );
      }
    })
    .catch((error) => {
      console.error("Error occurred while checking file scheme access:", error);
    });
}
