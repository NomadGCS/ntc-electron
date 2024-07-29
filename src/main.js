// Modules to control application life and create native browser window
const { app, net, session, BrowserWindow } = require('electron')
const path = require('node:path')
// const https = require('node:https')
const fs = require('fs')
// const axios = require('axios')

function redirectOnStatus(mainWindow, url, urlLoaded) {

    const request = net.request({
        method: 'GET', url: url
    })

    request.on('response', response => {

        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });

        response.on('end', () => {
            console.log('No more data in response.');
        });

        if (response.statusCode === 200 && !urlLoaded) {
            mainWindow.loadURL(url)
            setTimeout(() => {
                redirectOnStatus(mainWindow, url, true)
            }, 30000)
        } else {
            console.log(response)
        }
    })

    request.on('error', error => {

        console.error(error)
        console.debug(`${url} is not reachable`)
        if (urlLoaded) {
            mainWindow.loadFile('public/index.html')
        }

        setTimeout(() => redirectOnStatus(mainWindow, url, false), 3000)
    })

    request.end();
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

// SSL/TSL: this is the self signed certificate support
// app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
//     // On certificate error we disable default behaviour (stop loading the page)
//     // and we then say "it is all fine - true" to the callback
//     event.preventDefault();
//     callback(true);
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
        // On certificate error we disable default behaviour (stop loading the page)
        // and we then say "it is all fine - true" to the callback

        event.preventDefault();
        callback(true);
    });

    // const caPath = path.join(__dirname, 'ca.pem');
    // const ca = fs.readFileSync(caPath);
    //
    // net.addAuthority(ca.toString(), {
    //     // This is optional, depending on your need to enforce the CA as a root authority.
    //     type: 'root'
    // });
    //
    // session.defaultSession.setCertificateVerifyProc((request, callback) => callback(0))
    session.defaultSession.setCertificateVerifyProc((request, callback) => {
        // Bypass certificate errors for this specific domain
        callback(0);
    });

    createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
