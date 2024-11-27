const { ipcRenderer } = require("electron");

document.getElementById("searchButton").addEventListener("click", async () => {
    const filesDiv = document.getElementById("files");
    filesDiv.innerHTML = "Buscando archivos...";

    try {
        const files = await ipcRenderer.invoke("search-files");
        filesDiv.innerHTML = files.length
            ? files.map(file => `<div class="file">${file}</div>`).join("")
            : "No se encontraron archivos.";
    } catch (error) {
        filesDiv.innerHTML = "Error al buscar archivos.";
        console.error(error);
    }
});
