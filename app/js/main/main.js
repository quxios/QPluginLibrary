import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { saveData } from './appData'
import { windows, forEachWindow, createWindow } from './windows'

function start() {
  let mainWin = createWindow('main', 'index.html', {
    resizable: true,
    minWidth: 400,
    minHeight: 400,
    dev: true
  })
  mainWin.on('closed', () => {
    saveData();
    forEachWindow((win) => {
      if (win !== mainWin) {
        win.close();
      }
    })
  })
  setupUpdater();
}

function setupUpdater() {
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available', (info) => {
    console.log('update available');
  })
  autoUpdater.on('download-progress', (progressObj) => {

  })
  autoUpdater.on('update-downloaded', (info) => {
    console.log('update downloaded');
  })
}

app.on('ready', start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (windows.length === 0) {
    start();
  }
})

ipcMain.on('openHelp', (e) => {
  createWindow('help', 'help.html', {
    resizable: true,
    minWidth: 200,
    minHeight: 200,
    dev: true
  })
})