const fs = require("fs");
const path = require("path");
const os = require("os");

// Extensiones que queremos buscar
const extensions = [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];

const findFiles = (dir, fileList = []) => {
    try {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                findFiles(filePath, fileList); // Recursión para subdirectorios
            } else if (extensions.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        });
    } catch (err) {
        console.error(`Error leyendo el directorio ${dir}:`, err.message);
    }
    return fileList;
};

// Función principal para buscar en todos los discos
const searchFilesInDrives = () => {
    const drives = os.platform() === "win32"
        ? ["C:\\", "D:\\", "E:\\", "F:\\"] // Ajusta según tus necesidades
        : ["/"]; // En sistemas UNIX se buscaría desde el raíz "/"

    let foundFiles = [];
    drives.forEach((drive) => {
        console.log(`Buscando en: ${drive}`);
        foundFiles = foundFiles.concat(findFiles(drive));
    });

    return foundFiles;
};

// Exportar función
module.exports = { searchFilesInDrives };
