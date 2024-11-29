const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function createPdfinfo(data, outputPath) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 18;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const title = "Informe Forense";
    const textWidth = font.widthOfTextAtSize(title, fontSize);
    const x = (width - textWidth) / 2;

    page.drawText(title, {
      x: x,
      y: height - 4 * fontSize,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Nombre: ${data.name}`, {
      x: 50,
      y: height - 6 * fontSize,
      size: 14,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Dispositivo: ${data.device}`, {
      x: 50,
      y: height - 8 * fontSize,
      size: 14,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Texto: ${data.text}`, {
      x: 50,
      y: height - 10 * fontSize,
      size: 14,
      color: rgb(0, 0, 0),
    });


    page.drawText(`Fecha: ${data.date}`, {
      x: 50,
      y: height - 12 * fontSize,
      size: 14,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
  } catch (error) {
    throw new Error(`Error creating PDF: ${error.message}`);
  }
}
module.exports = createPdfinfo;