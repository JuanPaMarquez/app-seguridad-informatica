const { contextBridge, ipcRenderer } = require('electron');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

contextBridge.exposeInMainWorld('electronAPI', {
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openfindData: () => ipcRenderer.send('open-find-Data'),
  findData: (searchPath) => ipcRenderer.invoke('search-files', searchPath), // Aceptar la ruta de búsqueda como argumento
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  createPdf: async (files) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(); // Cambiar const a let
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const maxLineWidth = width - margin * 2;
    const lineHeight = fontSize * 1.5;
    let yPosition = height - margin;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const splitTextIntoLines = (text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testLineWidth < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    files.forEach((file, index) => {
      const lines = splitTextIntoLines(`${index + 1}. ${file}`, maxLineWidth);
      lines.forEach(line => {
        if (yPosition < margin + lineHeight) {
          page = pdfDoc.addPage(); // Reasignar la variable page
          yPosition = height - margin;
        }
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      });
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
});