const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Root route serves the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    message: "PassGuardian backend running",
    timestamp: new Date().toISOString()
  });
});

// Password analysis route
app.post("/check-password", async (req, res) => {
  try {
    const { password } = req.body;

    // Forward request to Python FastAPI service
    const response = await axios.post("http://127.0.0.1:8001/analyze-password/", null, {
      params: { password }
    });

    // Send Python response back to frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error communicating with Python service:", error.message);
    res.status(500).json({ error: "Failed to analyze password" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});
