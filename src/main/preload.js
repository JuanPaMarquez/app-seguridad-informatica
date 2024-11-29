const { contextBridge, ipcRenderer } = require('electron');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { exec } = require('child_process');
const zxcvbn = require('zxcvbn');

contextBridge.exposeInMainWorld('electronAPI', {
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  apicontraseña: (password) =>{
    try {
      const result = zxcvbn(password);
      return result
    } catch (error) {
      console.log(error)
    }
  },
  openfindData: () => ipcRenderer.send('open-find-Data'),
  openfirmadigital: () => ipcRenderer.send('open-firmadigital'),
  opencleanDisk: () => ipcRenderer.send('open-cleanDisk'),
  findData: (searchPath) => ipcRenderer.invoke('search-files', searchPath), // Aceptar la ruta de búsqueda como argumento
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  createPdf: async (files, nameForense) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const maxLineWidth = width - margin * 2;
    const lineHeight = fontSize * 1.5;
    let yPosition = height - margin;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Agregar fecha y hora de generación
    const date = new Date();
    const dateString = date.toLocaleString();
    page.drawText(dateString, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Agregar nombre del forense
    yPosition -= lineHeight;
    page.drawText(`Forense: ${nameForense}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight * 2; // Espacio adicional antes de la lista de archivos

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
          page = pdfDoc.addPage();
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
  },
  openFile: async () => await ipcRenderer.invoke("dialog:openFile"),
  saveFile2: async (pdfBytes, signatureImageBytes) => {
    // Cargar el documento PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
  
    // Embeder la imagen de firma
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes); // Usa embedPng o embedJpg según corresponda
    // const signatureDims = signatureImage.scale(0.2);
  
    // Iterar por todas las páginas
    pages.forEach((page) => {
      // Dibujar la imagen en cada página (ajusta las coordenadas según sea necesario)
      page.drawImage(signatureImage, {
        x: 50, // Coordenada X
        y: 20, // Coordenada Y
        width: 100,
        height: 40,
      });
    });
  
    // Guardar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
  
    // Mostrar el diálogo para guardar el archivo
    alert("PDF guardado con firma.");
    const handle = await window.showSaveFilePicker({
      suggestedName: "documento_firmado.pdf",
      types: [
        {
          description: "PDF Files",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
    });
  
    // Escribir el archivo modificado
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  },
}
);





