const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require("path");
const fs = require('fs');
const { searchFilesInPath } = require("./searchFiles");
const createPdfinfo = require("./createPdfinfo");
const { FieldAlreadyExistsError } = require('pdf-lib');

let mainWindow
let secondWindow
let findData
let firmadigital
let cleanDisk
let generateInforme;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 410,
    icon: path.join(__dirname, 'assets', 'logo.ico'),
    autoHideMenuBar: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: true
    },
    maximizable: false,
    resizable: false
  })

  mainWindow.loadFile('src/main/index.html')

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-second-window', () => {
  if (!secondWindow) {
    secondWindow = new BrowserWindow({
      width: 800,
      height: 750,
      maximizable: false,
      resizable: false,
      autoHideMenuBar: true, 
      icon: path.join(__dirname, 'assets', 'logo.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: false,
        contextIsolation: true
      },
    })

    secondWindow.loadFile('src/layouts/veryfypassword/windowverifypassword.html')

    secondWindow.on('closed', () => {
      secondWindow = null
    })
  }
})


ipcMain.on('open-find-Data', () => {
  if (!findData) {
    findData = new BrowserWindow({
      width: 800,
      height: 700,
      icon: path.join(__dirname, 'assets', 'logo.ico'),
      autoHideMenuBar: true, 
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: false,
        contextIsolation: true
      },
      maximizable: false,
      resizable: false
    })

    findData.loadFile('src/layouts/findData/findarchivos.html')

    findData.on('closed', () => {
      findData = null
    })
  }
})
ipcMain.handle("search-files", async (event, searchPath) => {
  try {
    const results = searchFilesInPath(searchPath);
    return results;
  } catch (error) {
    console.error('Error al buscar archivos:', error.message);
    return [];
  }
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});

ipcMain.handle('save-file', async (event, filePath, data) => {
  try {
      fs.writeFileSync(filePath, data);
      return true;
  } catch (error) {
      console.error('Error al guardar el archivo:', error.message);
      return false;
  }
});

ipcMain.on("open-firmadigital", () => {
  if (!firmadigital){
    firmadigital = new BrowserWindow({
      width: 600,
      height: 500,
      icon: path.join(__dirname, 'assets', 'logo.ico'),
      autoHideMenuBar: true, 
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: true,
      },
      maximizable: false,
      resizable: false
    });
  }

  firmadigital.loadFile("src/layouts/firmadigital/firmadigital.html");

  firmadigital.on('closed', () => {
    firmadigital = null
  })
});
// Manejar la selección de archivos
ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    properties: ["openFile"],
  });

  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.on("open-cleanDisk", () => {
  if (!cleanDisk) {
    cleanDisk = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, 'assets', 'logo.ico'),
      autoHideMenuBar: true, 
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
      maximizable: false,
      resizable: false
    });
  }

  cleanDisk.loadFile("src/layouts/cleanDisk/cleanDisk.html");
  
  cleanDisk.on('closed', () => {
    cleanDisk = null
  })
});

ipcMain.on("open-generateinforme", () => {
  if (!generateInforme) {
    generateInforme = new BrowserWindow({
      width: 800,
      height: 700,
      icon: path.join(__dirname, 'assets', 'logo.ico'),
      autoHideMenuBar: true, 
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }

  generateInforme.loadFile("src/layouts/generateInforme/generateInforme.html");

  generateInforme.on('closed', () => {
    generateInforme = null
  })
});

ipcMain.handle("generate-pdf", async (event, data) => {

  // Mostrar el cuadro de diálogo para seleccionar ubicación
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Guardar PDF",
    defaultPath: "InformeForense.pdf",
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
  });

  // Si el usuario cancela el cuadro de diálogo
  if (canceled || !filePath) {
    return null;
  }

  // Crear el PDF en la ubicación seleccionada
  await createPdfinfo(data, filePath);
  return filePath;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


