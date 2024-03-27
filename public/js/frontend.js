document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('healthRecordForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission behavior

        const prescription = document.getElementById('prescription').value;

        alert('Prescription data to be sent: ' + prescription);

        try {
            const response = await fetch('/health-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prescription })
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('Health Record successfully posted:', responseData);
                
                alert('Health Record successfully posted!');

                fetchRecords();

                
            } else {
                console.error('Error posting health record:', responseData.error);
            }
        } catch (error) {
            console.error('Error posting health record:', error);
        }
    });
});


async function fetchRecords() {
    try {
        const response = await fetch('/health-records/cid', {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch records');
        }

        // Update the historyContainer with the retrieved records in separate divs
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.innerHTML = ''; // Clear existing content

        if (data.success && data.data.length > 0) {
            // Reverse the order of records to display the latest prescription first
            const reversedData = data.data.slice().reverse();

            // Create a div for each prescription
            reversedData.forEach(record => {
                const div = document.createElement('div');
                div.classList.add('prescription'); // Add a class for styling if needed
                
                // Display prescription date
                const presdate = document.createElement('p');
                const date = new Date(record.presdate);
                const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
                presdate.textContent = `Prescription Date: ${formattedDate}`;
                div.appendChild(presdate);

                // Display prescription time
                const prestime = document.createElement('p');
                const hours = date.getHours() % 12 || 12; // Convert hours to 12-hour format
                const amOrPm = date.getHours() < 12 ? 'AM' : 'PM'; // Determine AM/PM
                const formattedTime = `${hours}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ${amOrPm}`;
                prestime.textContent = `Prescription Time: ${formattedTime}`;
                div.appendChild(prestime);
                
                // Display prescription data within the div excluding _id and __v fields
                Object.keys(record).forEach(key => {
                    if (key !== '_id' && key !== '__v' && key !== 'presdate') { // Skip adding _id, __v, and presdate fields
                        const p = document.createElement('p');
                        p.textContent = `${key}: ${record[key]}`;
                        div.appendChild(p);
                    }
                });

                // Append the div to historyContainer
                historyContainer.appendChild(div);
            });
        } else {
            // No records found
            historyContainer.textContent = 'No records found';
        }
    } catch (error) {
        console.error('Error fetching records:', error.message);
    }
}




fetchRecords();
