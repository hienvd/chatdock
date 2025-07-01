// preload.js

// This script creates a secure bridge between the renderer process and the main process.
// It exposes a single function, `showView`, which allows the renderer to safely send tab-switching requests to the main process without having direct access to Node.js APIs.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showView: (viewName) => ipcRenderer.send('show-view', viewName)
});
