// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const https = require('node:https')

function redirectOnStatus(mainWindow, url, urlLoaded) {

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    fetch(
        url,
        {
            method: 'GET',
            agent: httpsAgent
        }
    ).then(response => {
        if (response.ok && !urlLoaded) {
            mainWindow.loadURL(url)
            setTimeout(() => {
                redirectOnStatus(mainWindow, url, true)
            }, 30000)
        } else {
            console.log(response)
        }
    }).catch(error => {

        console.error(error)
        console.debug(`${url} is not reachable`)
        if (urlLoaded) {
            mainWindow.loadFile('public/index.html')
        }

        setTimeout(() => redirectOnStatus(mainWindow, url, false), 3000)
    })
}

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        kiosk: true,
        icon: 'public/logo.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('public/index.html')
    redirectOnStatus(mainWindow, 'https://10.100.201.41', false)
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
