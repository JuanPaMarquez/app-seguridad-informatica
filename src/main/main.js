const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require("path");
const fs = require('fs');
const { searchFilesInPath } = require("./searchFiles");

let mainWindow
let secondWindow
let findData
let firmadigital
let cleanDisk

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: true
    }
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
      height: 700,
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
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: false,
        contextIsolation: true
      }
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
  firmadigital = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

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
  cleanDisk = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  cleanDisk.loadFile("src/layouts/cleanDisk/cleanDisk.html");
  
  cleanDisk.on('closed', () => {
    cleanDisk = null
  })
});

