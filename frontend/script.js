async function analyzePassword() {
  const password = document.getElementById("passwordInput").value;

  if (!password) {
    alert("Please enter a password!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password })
    });

    const data = await response.json();

    document.getElementById("result").innerHTML = `
      <strong>Length:</strong> ${data.length}<br>
      <strong>Entropy:</strong> ${data.entropy.toFixed(2)}<br>
      <strong>Strength:</strong> ${data.strength}
    `;
  } catch (error) {
    document.getElementById("result").innerHTML = "⚠️ Error analyzing password.";
    console.error(error);
  }
}
