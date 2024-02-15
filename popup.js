const config = {
    mondialRelay: {
        x: 0,
        y: 400,
        width: null,  // La largeur sera définie dynamiquement
        height: 400,
    },
    ups: {
        x: 0,
        y: 450,
        width: 330,
        height: 450,  // La hauteur sera définie dynamiquement
    },
    chronopost: {
        x: null,
        y: null,
        width: 450,
        height: null,  // La hauteur sera définie dynamiquement
    },
    colissimo : {
        x: 0,
        y: null,
        width: 420,
        height: null,  // La hauteur sera définie dynamiquement
    }
};


document.querySelectorAll('.convert').forEach(element => {
    element.addEventListener('click', function () {
        const currentConfig = config[this.id];
        if (!currentConfig) {
            console.error('Configuration not found for this ID');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            const pdfUrl = currentTab.url;

            if (pdfUrl.endsWith('.pdf') || pdfUrl.indexOf('pdf') !== -1) {
                fetch(pdfUrl)
                    .then(res => res.arrayBuffer())
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
                        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        chrome.downloads.download({
                            url: url,
                            filename: 'bordereau-cropped.pdf'
                        });
                    })
                    .catch(error => {
                        console.error('Error occurred while fetching or processing PDF:', error);
                    });
            } else {
                alert('This does not seem to be a PDF file.');
            }
        });
    });
});




