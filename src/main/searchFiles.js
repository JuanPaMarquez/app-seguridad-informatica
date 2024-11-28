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
            let stats;
            try {
                stats = fs.statSync(filePath);
            } catch (err) {
                if (err.code === 'EPERM') {
                    console.error(`Permiso denegado al acceder a ${filePath}`);
                } else {
                    console.error(`Error al obtener estadísticas de ${filePath}:`, err.message);
                }
                return;
            }

            // Excluir directorios protegidos
            if (filePath.includes('$Recycle.Bin') || filePath.includes('Archivos de programa') || filePath.includes('Documents and Settings')) {
                console.log(`Excluyendo directorio protegido: ${filePath}`);
                return; // Salir si es un directorio protegido
            }

            if (stats.isDirectory()) {
                findFiles(filePath, fileList); // Recursión para subdirectorios
            } else if (extensions.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        });
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`El directorio ${dir} no existe:`, err.message);
        } else {
            console.error(`Error leyendo el directorio ${dir}:`, err.message);
        }
    }
    return fileList;
};

// Función principal para buscar en todos los discos
const searchFilesInPath = (searchPath) => {
    console.log(`Buscando en: ${searchPath}`);
    let foundFiles = [];
    try {
        foundFiles = findFiles(searchPath);
    } catch (err) {
        console.error(`Error leyendo el directorio ${searchPath}:`, err.message);
    }
    return foundFiles;
};


// Exportar función
module.exports = { searchFilesInPath };