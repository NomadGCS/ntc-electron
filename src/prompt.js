document.getElementById('submitIp').addEventListener('click', () => {
    const ip = document.getElementById('ipInput').value;
    if (ip) {
        window.electron.setIp(ip);
    }
});
