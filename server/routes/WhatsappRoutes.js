const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const Doctor = require("../models/Doctorschema");
const Message = require("../models/MsgSchema"); // Create this model

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


router.post("/send", async (req, res) => {
  const { doctorId, message } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${doctor.phone}`,
      body: message
    });

    const savedMessage = await Message.create({
      doctorId,
      message,
      sender: "patient"
    });

    res.json({
      success: true,
      message: savedMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



router.post("/save", async (req, res) => {
  try {
    const { doctorId, message, sender } = req.body;

    if (!doctorId || !message || !sender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const newMessage = new Message({
      doctorId,
      message,
      sender,
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      message: savedMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error saving message', 
      error: error.message 
    });
  }
});

router.get("/:doctorId", async (req, res) => {
  try {
    const messages = await Message.find({
      doctorId: req.params.doctorId
    }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});




router.post("/inbound", async (req, res) => {
  const from = req.body.From; 
  const messageBody = req.body.Body;

  console.log("📩 WhatsApp Reply");
  console.log("From:", from);
  console.log("Message:", messageBody);

  try {
    const phone = from.replace('whatsapp:', '');
    
    const doctor = await Doctor.findOne({ phone });

    if (doctor) {
      const newMessage = new Message({
        doctorId: doctor._id,
        message: messageBody,
        sender: 'doctor',
        timestamp: new Date()
      });

      await newMessage.save();
      console.log(" Doctor reply saved to database");
    }

    // Send auto-reply
    let replyText = "";

    if (messageBody.toLowerCase().includes("confirm")) {
      replyText = "Appointment confirmed. Thank you, Doctor.";
    } else if (messageBody.toLowerCase().includes("cancel")) {
      replyText = "Appointment cancelled.";
    } else {
      replyText = "";
    }

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyText);

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Error processing inbound message:", error);
    res.status(500).send("Error processing message");
  }
});

module.exports = router;
