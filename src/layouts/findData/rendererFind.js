document.getElementById("searchButton").addEventListener("click", async () => {
    console.log("entro");
    const filesDiv = document.getElementById("files");
    const searchPath = document.getElementById("searchPath").value; // Leer la ruta de búsqueda del campo de entrada
    filesDiv.innerHTML = "Buscando archivos...";

    try {
        const files = await window.electronAPI.findData(searchPath);
        if (!files) {
            throw new Error("No se recibieron datos de archivos.");
        }
        filesDiv.innerHTML = files.length
            ? files.map(file => `<div class="file">${file}</div>`).join("")
            : "No se encontraron archivos.";

        // Mostrar el botón de generar PDF si se encontraron archivos
        if (files.length) {
            document.getElementById("generatePdfButton").style.display = "block";
        } else {
            document.getElementById("generatePdfButton").style.display = "none";
        }

        // Guardar la lista de archivos en una variable global
        window.foundFiles = files;
    } catch (error) {
        filesDiv.innerHTML = "Error al buscar archivos.";
        console.error(error);
    }
});

document.getElementById("generatePdfButton").addEventListener("click", async () => {
    const files = window.foundFiles;
    if (!files || !files.length) {
        alert("No hay archivos para generar el PDF.");
        return;
    }

    // Solicitar la ruta de guardado al usuario
    const { filePath } = await window.electronAPI.showSaveDialog({
        title: 'Guardar PDF',
        defaultPath: 'archivos.pdf',
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });

    if (!filePath) {
        return; // El usuario canceló el diálogo de guardado
    }

    // Crear el PDF usando la función expuesta por contextBridge
    const pdfBytes = await window.electronAPI.createPdf(files);

    // Guardar el PDF en la ruta especificada
    await window.electronAPI.saveFile(filePath, pdfBytes);
});