function analyzeSymptoms() {
    const symptomInput = document.getElementById("symptomInput").value.trim();

    if (!symptomInput) {
        alert("Please enter symptoms!");
        return;
    
    }

    analysisResult.innerText = "🔍 Analyzing symptoms... Please wait.";


    fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom: symptomInput })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("analysisResult").innerText = data.response;
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong. Try again later.");
    });
}
