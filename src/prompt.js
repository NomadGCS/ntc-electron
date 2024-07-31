const minutesPattern = /^[1-9]\d*$/; // Positive integers only
const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const submitButton = document.getElementById('submitButton')
const addressInput = document.getElementById('addressInput')
const minutesInput = document.getElementById('minutesInput')
const addressError = document.getElementById('addressError')
const minutesError = document.getElementById('minutesError')

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

document.getElementById('submitButton').addEventListener('click', () => {

    const ip = addressInput.value;
    const minutes = minutesInput.value;
    if (ipv4Pattern.test(ip) && minutesPattern.test(minutes)) {
        window.electron.setConfig({
            address: ip,
            expectedBootTime: minutes * 60 // Convert to seconds
        });
    } else {
        console.debug(`Invalid input: ${ip}, ${minutes}`)
    }
});
