const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path");
const { searchFilesInPath } = require("./searchFiles");

let mainWindow
let secondWindow
let findData

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile('src/main/index.html')
}

app.whenReady().then(createMainWindow);

ipcMain.on('open-second-window', () => {
  if (!secondWindow) {
    secondWindow = new BrowserWindow({
      width: 800,
      height: 600,
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
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
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