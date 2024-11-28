document.getElementById("searchButton").addEventListener("click", async () => {
    console.log("entro");
    const filesDiv = document.getElementById("files");
    const searchPath = document.getElementById("searchPath").value; // Asumiendo que tienes un input para la ruta
    filesDiv.innerHTML = "Buscando archivos...";

    try {
        const files = await window.electronAPI.findData(searchPath);
        if (!files) {
            throw new Error("No se recibieron datos de archivos.");
        }
        filesDiv.innerHTML = files.length
            ? files.map(file => `<div class="file">${file}</div>`).join("")
            : "No se encontraron archivos.";
    } catch (error) {
        filesDiv.innerHTML = "Error al buscar archivos.";
        console.error(error);
    }
});