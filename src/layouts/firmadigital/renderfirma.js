const signaturePad = document.getElementById("signaturePad");
const loadPdfButton = document.getElementById("loadPdf");
const savePdfButton = document.getElementById("savePdf");
const clearSignature = document.getElementById("clearSignature");
const ctx = signaturePad.getContext("2d");
let pdfBytes = null;

// Configurar el lienzo para dibujar la firma
let drawing = false;

signaturePad.addEventListener("mousedown", () => (drawing = true));
signaturePad.addEventListener("mouseup", () => (drawing = false));
signaturePad.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = signaturePad.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
});

clearSignature.addEventListener("click", () => {
  ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
});

loadPdfButton.addEventListener("click", async () => {
  const file = await window.electronAPI.openFile();
  const arrayBuffer = await file.arrayBuffer();
  pdfBytes = new Uint8Array(arrayBuffer);
  alert("PDF cargado correctamente.");
});

savePdfButton.addEventListener("click", async () => {
  if (!pdfBytes) {
    alert("Por favor, carga un PDF primero.");
    return;
  }

  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Convertir la firma del lienzo a una imagen
  const signatureDataUrl = signaturePad.toDataURL();
  const signatureImage = await pdfDoc.embedPng(signatureDataUrl);

  // Dimensiones de la imagen de firma
  const signatureDims = signatureImage.scale(0.5);

  // Agregar la firma a la primera página
  firstPage.drawImage(signatureImage, {
    x: 50,
    y: 50,
    width: signatureDims.width,
    height: signatureDims.height,
  });

  // Guardar el PDF modificado
  const modifiedPdfBytes = await pdfDoc.save();
  const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
  await window.electronAPI.saveFile(blob);
  alert("PDF guardado con firma.");
});
