// script.js

async function fetchWalletBalance() {
    try {
        const response = await fetch('/wallet-balance', {
            method: 'GET',
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('balance').innerText = `Balance: ${data.balance} XRP`;
        } else {
            console.error('Failed to fetch wallet balance:', data.error);
            document.getElementById('balance').innerText = 'Failed to fetch wallet balance';
        }
    } catch (error) {
        console.error('Failed to fetch wallet balance:', error.message);
        document.getElementById('balance').innerText = 'Failed to fetch wallet balance';
    }
}

// Fetch wallet balance when the page loads
fetchWalletBalance();
