const { contextBridge, ipcRenderer } = require('electron');
const { PDFDocument, rgb } = require('pdf-lib');

contextBridge.exposeInMainWorld('electronAPI', {
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openfindData: () => ipcRenderer.send('open-find-Data'),
  findData: (searchPath) => ipcRenderer.invoke('search-files', searchPath), // Aceptar la ruta de búsqueda como argumento
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  createPdf: async (files) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    let yPosition = height - fontSize * 2;

    files.forEach((file, index) => {
      if (yPosition < fontSize * 2) {
        page = pdfDoc.addPage();
        yPosition = height - fontSize * 2;
      }
      page.drawText(`${index + 1}. ${file}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= fontSize * 1.5;
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
});