const oneMinute = 1000 * 60
const instantLoadDelay = 5000
const driveTruckDelay = 3 * 60 * 1000 // 3 minutes

function countdownTimer(startTime, endTime) {

    const truck = document.getElementById("truck")
    const countdown = document.getElementById("countdown")
    const display = document.getElementById("display")
    const updateCountdown = () => {

        const timeToBoot = endTime - Date.now()
        if (timeToBoot < 1000) {
            setTimeout(() => truck.classList.add("truck-driving"), driveTruckDelay)
            display.innerHTML =
                "<div style='margin-top: 40px'>Unable to reach the NTC server! Please ensure the network switch has power." +
                "<br><br>" +
                "<div id='support'>If this problem persists, contact support at serivcedesk@nomadgcs.com</div>" +
                "</div>"
            return
        }

        setTimeout(updateCountdown, 1000)
        const minutes = Math.floor(timeToBoot / oneMinute)
        const seconds = Math.floor(timeToBoot % oneMinute / 1000).toString().padStart(2, "0")
        countdown.innerHTML = `Estimated time remaining ${minutes}:${seconds}`
    }
    // Delay the start of estimated time in case boot is immediate
    setTimeout(updateCountdown, Math.min(endTime - startTime - instantLoadDelay / 2, instantLoadDelay))
}

console.log("Starting countdown...")
console.debug("Requesting config...")
window.electron.getConfig().then(config => {
    console.debug(`Received config: ${JSON.stringify(config)}`)
    const expectedBootTime = config.expectedBootTime * 1000
    const endTime = config.startupTime + expectedBootTime
    // Countdown is expected boot time plus the load delay plus a 1-second buffer
    // So, 3 minute boot time (i.e. 180 seconds) plus
    //  5-second load delay and buffer would be 186 seconds
    // NOTE: the buffer is so the countdown starts at the time
    //  (e.g. 3:00) instead of one second less (e.g. 2:59)
    countdownTimer(config.startupTime, endTime + instantLoadDelay + 1000)
})
