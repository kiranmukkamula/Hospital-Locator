const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Message = require('./models/MsgSchema');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/AuthRoutes"));   
app.use("/api/whatsapp", require("./routes/WhatsappRoutes")); 
app.use("/api/doctors", require("./routes/Doctors"));



app.get("/", (req, res) => {
  res.send("Backend Running ✔")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
console.log(`Server running on the port ${PORT}`))
