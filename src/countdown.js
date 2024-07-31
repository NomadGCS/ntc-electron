function countdownTimer(endTime) {
    const countdownElement = document.getElementById("countdown")

    function updateCountdown() {
        const now = new Date().getTime()
        const distance = endTime - now

        if (distance < 0) {
            clearInterval(timerInterval)
            countdownElement.innerHTML = "Time's up!"
        } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)
            countdownElement.innerHTML = `Estimated time remaining: ${minutes}m ${seconds}s`
        }
    }

    const timerInterval = setInterval(updateCountdown, 1000)
    updateCountdown() // initial call to display the countdown immediately
}

// Set the target time for the countdown (in milliseconds since Jan 1, 1970)
const targetTime = new Date().getTime() + (10 * 60 * 1000) // 10 minutes from now
countdownTimer(targetTime)
