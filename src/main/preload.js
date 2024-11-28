const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openfindData: () => ipcRenderer.send('open-find-Data'),
  findData: (searchPath) => ipcRenderer.invoke('search-files', searchPath) // Aceptar la ruta de búsqueda como argumento
});
