// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/hospitals", require("./routes/HospitalRoutes")) // Add this line

app.get("/", (req, res) => {
  res.send("Backend Running ✔")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))