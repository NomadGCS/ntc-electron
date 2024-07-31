# NTC Electron

This is an app that uses [Electron](https://www.electronjs.org/) to make a
splash screen while NTC is loading.

Once the NTC server can be pinged, this app will redirect to the server and
display NTC in its controlled window.

## Configuration

On first installation, the app will need to be configured:

* The server IP address to ping and redirect to
* The amount of time (in minutes) that the boot time is expected to take
