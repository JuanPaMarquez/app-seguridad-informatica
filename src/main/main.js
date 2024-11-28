const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require("path");
const fs = require('fs');
const { searchFilesInPath } = require("./searchFiles");

let mainWindow
let secondWindow
let findData

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
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