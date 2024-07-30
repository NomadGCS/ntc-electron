// Modules to control application life and create native browser window
const { app, net, session, ipcMain, BrowserWindow } = require('electron')
const path = require('node:path')
const fs = require('fs')

let mainWindow
let addressLoaded = false

function redirectOnStatus (address) {

    const handleUnreachable = () => {

        console.debug(`${address} is not reachable`)
        if (addressLoaded) {
            mainWindow.loadFile('src/index.html')
            addressLoaded = false
        }

        setTimeout(() => redirectOnStatus(address), 3000)
    }

    const url = `https://${address}/`
    console.log(`Pinging ${url}...`)
    const request = net.request({ method: 'GET', url: url })
    request.on('response', response => {

        console.log(`Received status: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`)
        })

        response.on('end', () => {
            console.log('No more data in response.')
        })

        switch (response.statusCode) {
            case 200:

                setTimeout(() => redirectOnStatus(address), 10000)
                if (!addressLoaded) {
                    console.log(`Redirecting to ${url}`)
                    mainWindow.loadURL(url)
                    addressLoaded = true
                }

                break
            case 404:
            case 408:
            case 410:
            case 502:
            case 503:
            case 504:
                console.log(response)
                handleUnreachable()
                break
            default:
                console.log(response)
                break
        }
    })

    request.on('error', error => {
        console.error(error)
        handleUnreachable()
    })

    request.end()
}

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        kiosk: true,
        icon: 'images/icon.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    })

    const userDataPath = app.getPath('userData')
    const ipFilePath = path.join(userDataPath, 'config.json')

    if (fs.existsSync(ipFilePath)) {
        const contents = fs.readFileSync(ipFilePath, 'utf8')
        console.log(ipFilePath + ' -> ' + contents)
        const obj = JSON.parse(contents)
        mainWindow.loadFile('src/index.html')
        redirectOnStatus(obj.address)
    } else {
        mainWindow.loadFile('src/prompt.html')
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

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

        event.preventDefault()
        callback(true)
    })

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
        callback(0)
    })

    createWindow()
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('set-ip', (event, address) => {
    console.log(`Setting address to ${address}...`)
    const userDataPath = app.getPath('userData')
    const configFilePath = path.join(userDataPath, 'config.json')
    fs.writeFileSync(configFilePath, JSON.stringify({ address }), { encoding: 'utf8' })
    redirectOnStatus(address)
})
