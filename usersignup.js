document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");

    if (!signupForm) {
        console.error("❌ Signup form not found! Check your HTML.");
        return;
    }

    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        try {
            const response = await fetch("http://localhost:5001/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Signup Successful! Redirecting to login...");
                window.location.href = "userlogin.html"; // ✅ Redirect to login page
            } else {
                alert(data.message || "Signup failed!");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
