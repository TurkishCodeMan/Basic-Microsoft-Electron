// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const remote = require('@electron/remote');
const {ipcRenderer,ipcMain}=require('electron')
window.electron = {
  remote: remote,
  ipcRenderer:ipcRenderer,
  ipcMain:ipcMain
};