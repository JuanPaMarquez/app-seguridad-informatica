const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSecondWindow: () => ipcRenderer.send('open-second-window')
});
