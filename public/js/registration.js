// Function to validate if the provided wallet secret corresponds to the given wallet address
async function validateWalletSecret(walletAddress, walletSecret) {
    try {
        // Create a new wallet object from the provided secret
        const wallet = new Wallet(walletSecret);

        // Get the address corresponding to the provided secret
        const secretAddress = wallet.getAddress();

        // Compare the provided address and the address derived from the secret
        return secretAddress === walletAddress;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Function to display error messages
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    // Hide error message after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Function to display success messages
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');

    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Function to validate XRP wallet address
function isValidRippleAddress(address) {
    // Regular expression for a Ripple address
    const rippleAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
    // Check if the address matches the regular expression
    return rippleAddressRegex.test(address);
}

// Event listener for form submission
document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const name = formData.get('name');
    const username = formData.get('username');
    const email = formData.get('email');
    const phoneNo = formData.get('phoneNo');
    const cid = formData.get('cid');
    const walletAddress = formData.get('walletAddress');
    const walletSecret = formData.get('walletSecret');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validate all fields
    if (!name || !username || !email || !phoneNo || !cid || !walletAddress || !walletSecret || !password || !confirmPassword) {
        showError('Please fill in all fields!');
        return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        showError('Passwords do not match. Please try again.');
        return;
    }

    // Validate wallet address
    if (!isValidRippleAddress(walletAddress)) {
        showError('Invalid wallet address. Please enter a valid Ripple address.');
        return;
    }

    // Validate wallet secret
    if (!validateWalletSecret(walletAddress, walletSecret)) {
        showError('Invalid wallet secret for the provided wallet address.');
        return;
    }

    const data = {
        name,
        username,
        email,
        phoneNo,
        cid,
        walletAddress,
        walletSecret,
        password,
        confirmPassword
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();

        if (response.ok) {
            showSuccess("User Registration Successful!"); // Display success message
            setTimeout(() => {
                window.location.href = '/login'; // Redirect to login page after registration
            }, 2000); // Redirect after 1 second
        } else {
            showError(result); // Display error message
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Registration failed. Please try again.'); // Generic error message
    }
});
