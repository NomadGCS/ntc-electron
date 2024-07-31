function countdownTimer(endTime) {

    const oneMinute = 1000 * 60
    const truck = document.getElementById("truck")
    const countdown = document.getElementById("countdown")
    const display = document.getElementById("display")
    const updateCountdown = () => {

        const timeToBoot = endTime - Date.now()
        if (timeToBoot < 1000) {
            setTimeout(() => truck.classList.add("truck-driving"), 3 * 60 * 1000)
            display.innerHTML =
                "<div style='margin-top: 40px'>Unable to reach the NTC server! Please ensure the network switch has power." +
                "<br><br>" +
                "<div id='support'>If this problem persists, please contact support at serivcedesk@nomadgcs.com</div>" +
                "</div>"
            return
        }

        setTimeout(updateCountdown, 1000)
        const minutes = Math.floor(timeToBoot / oneMinute)
        const seconds = Math.floor(timeToBoot % oneMinute / 1000).toString().padStart(2, "0")
        countdown.innerHTML = `Estimated time remaining ${minutes}:${seconds}`
    }
    // Delay the start of estimated time in case boot is immediate
    setTimeout(updateCountdown, Math.min(endTime - Date.now() - 5000, 10000))
}

countdownTimer(Date.now() + 10 * 60 * 1000)
