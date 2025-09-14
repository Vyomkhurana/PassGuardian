const express = require("express");
const axios = require("axios");  
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Route: frontend calls this
app.post("/analyze", async (req, res) => {
    try {
        const { password } = req.body;

        // Call FastAPI service
        const response = await axios.post(
            "http://127.0.0.1:8000/analyze-password",
            { password: password }, 
            { headers: { "Content-Type": "application/json" } }
        );

        // Send FastAPI response back to frontend
        res.json(response.data);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Error analyzing password" });
    }
});

app.listen(5000, () => {
    console.log("Node.js backend running on http://localhost:5000");
});
