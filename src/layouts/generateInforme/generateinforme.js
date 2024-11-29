
const { ipcRenderer } = require('electron');

document.getElementById("generate").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const text = document.getElementById("text").value;
  const device = document.getElementById("device").value;
  const date = new Date().toLocaleString();

  if (!name || !text || !device) {
    alert("Por favor, llena todos los campos.");
    return;
  }

  const data = { name, text, device, date };

  const pdfPath = await ipcRenderer.invoke("generate-pdf", data);

  alert(`PDF generado: ${pdfPath}`);
});

