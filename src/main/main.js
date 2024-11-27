const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow
let secondWindow

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

    secondWindow.loadFile('src/layouts/second.html')

    secondWindow.on('closed', () => {
      secondWindow = null
    })
  }
})