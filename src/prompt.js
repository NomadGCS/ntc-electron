const minutesPattern = /^[1-9]\d*$/; // Positive integers only
const emailPattern = /^[.a-zA-Z0-9_-]+@nomadgcs\.com$/
const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const submitButton = document.getElementById('submitButton')
const addressInput = document.getElementById('addressInput')
const minutesInput = document.getElementById('minutesInput')
const instructionInput = document.getElementById("instructionInput")
const emailInput = document.getElementById("emailInput")
const addressError = document.getElementById('addressError')
const minutesError = document.getElementById('minutesError')
const emailError = document.getElementById("emailError")

addressInput.addEventListener('input', () => {
    if (addressInput.value === '' || ipv4Pattern.test(addressInput.value)) {
        submitButton.disabled = false
        addressError.textContent = ""
    } else {
        submitButton.disabled = true
        addressError.textContent = "Value must be an IPv4 address"
    }
})

minutesInput.addEventListener('input', () => {
    const value = minutesInput.value
    if (value === "" || minutesPattern.test(value) && 1 <= value && value <= 60) {
        submitButton.disabled = false
        minutesError.textContent = ""
    } else {
        submitButton.disabled = true
        minutesError.textContent = "Value must be a a number between 1 and 60"
    }
})

emailInput.addEventListener("input", () => {
    const value = emailInput.value
    if (value === "" || emailPattern.test(value)) {
        submitButton.disabled = false
        emailError.textContent = ""
    } else {
        submitButton.disabled = true
        emailError.textContent = "Value must be a valid NomadGCS email address"
    }
})

document.getElementById('submitButton').addEventListener('click', () => {

    const ip = addressInput.value;
    const minutes = minutesInput.value;
    const instructions = instructionInput.value
    const email = emailInput.value
    if (ipv4Pattern.test(ip) && minutesPattern.test(minutes) && (email === "" || emailPattern.test(email))) {
        window.electron.setConfig({
            address: ip,
            expectedBootTime: minutes * 60, // Convert to seconds
            resetInstructions: instructions?.length ? instructions : undefined,
            supportEmailAddress: email?.length ? email : undefined
        });
    } else {
        console.debug(`Invalid input: ${ip}, ${minutes}`)
    }
});
