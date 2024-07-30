// Modules to control application life and create native browser window
const { app, net, session, ipcMain, BrowserWindow } = require('electron')
const path = require('node:path')
const fs = require('fs')

let config
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

    session.defaultSession.setCertificateVerifyProc((request, callback) => {
        // Bypass certificate errors for this specific domain
        callback(request.hostname === config.address ? 0 : request.errorCode)
    })

    const userDataPath = app.getPath('userData')
    const configFilePath = path.join(userDataPath, 'config.json')
    if (fs.existsSync(configFilePath)) {
        const contents = fs.readFileSync(configFilePath, 'utf8')
        console.debug(configFilePath + ' -> ' + contents)
        config = JSON.parse(contents)
    }

    createWindow()
    if (config?.address) {
        mainWindow.loadFile('src/index.html')
        redirectOnStatus(config.address)
    } else {
        mainWindow.loadFile('src/prompt.html')
    }
})

app.on('activate', () => {
    if (mainWindow === null) createWindow()
})

app.on('window-all-closed', () => app.quit())

ipcMain.on('set-ip', (event, address) => {
    console.log(`Setting address to ${address}...`)
    const userDataPath = app.getPath('userData')
    const configFilePath = path.join(userDataPath, 'config.json')
    fs.writeFileSync(configFilePath, JSON.stringify({ address }), { encoding: 'utf8' })
    redirectOnStatus(address)
})
