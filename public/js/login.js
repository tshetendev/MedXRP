document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        const data = {
            identifier: formData.get('identifier'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.text();

            if (response.ok) {
                showSuccess(result); // Display success message
            } else {
                showError(result); // Display error message
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Login failed. Please try again.'); // Generic error message
        }
    });

    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');

        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    function showSuccess(message) {
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        successMessage.classList.add('show');

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
            // Redirect to another page
            window.location.href = '/index1.html';
        }, 1000);
    }
});
