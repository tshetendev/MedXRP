// document.getElementById("recordLink").addEventListener("click", function(event) {
//     // Prevent the default action of the link
//     event.preventDefault();
    
//     // Display confirmation dialog
//     const confirmed = window.confirm("You need to login. Do you want to proceed to login?");
    
//     // If confirmed, redirect to login page
//     if (confirmed) {
//         window.location.href = "login.html";
//     }
// });

document.getElementById('scrollToTop').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    window.scrollTo({
        top: 0,
        behavior: "smooth"// Smooth scrolling behavior
    });
});