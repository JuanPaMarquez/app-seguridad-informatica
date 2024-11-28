const signaturePad = document.getElementById("signaturePad");
const loadPdfButton = document.getElementById("loadPdf");
const savePdfButton = document.getElementById("savePdf");
const clearSignature = document.getElementById("clearSignature");
const signatureInput = document.getElementById("signatureInput");
let pdfBytes = null;

// Configurar el lienzo para dibujar la firma
let drawing = false;
let signatureImageBytes = null;

clearSignature.addEventListener("click", () => {
  ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
});

loadPdfButton.addEventListener("click", async () => {
  const filePath = await window.electronAPI.openFile();
  if (!filePath) {
    alert("No se seleccionó ningún archivo.");
    return;
  }
  // Leer el archivo seleccionado
  const response = await fetch(`file://${filePath}`);
  const arrayBuffer = await response.arrayBuffer();
  pdfBytes = new Uint8Array(arrayBuffer);

  alert("PDF cargado correctamente.");
});

signatureInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("No se seleccionó ninguna imagen.");
    return;
  }
  // Leer la imagen como bytes
  const reader = new FileReader();
  reader.onload = () => {
    signatureImageBytes = new Uint8Array(reader.result);
    alert("Imagen de firma cargada correctamente.");
  };
  reader.readAsArrayBuffer(file);
});

savePdfButton.addEventListener("click", async () => {
  if (!pdfBytes) {
    alert("Por favor, carga un PDF primero.");
    return;
  }
  await window.electronAPI.saveFile2(pdfBytes,signatureImageBytes)
});
