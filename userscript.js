document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) {
        console.error("❌ Login form not found! Check your HTML.");
        return;
    }

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault(); // ✅ Prevent page refresh

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login Successful! Redirecting to dashboard...");
                
                // ✅ Store token in localStorage for session management
                localStorage.setItem("token", data.token);

                // ✅ Redirect to the index.html page
                window.location.href = "index.html";
            } else {
                alert(data.message || "Invalid login credentials!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
