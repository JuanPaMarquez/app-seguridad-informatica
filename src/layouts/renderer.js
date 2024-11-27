document.getElementById('open-window-btn').addEventListener('click', () => {
  window.electronAPI.openSecondWindow()
})

document.getElementById('open-find-data-button').addEventListener('click', () => {
  window.electronAPI.openfindData()
})