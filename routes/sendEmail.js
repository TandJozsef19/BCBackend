const express = require("express");
const emailService = require("../emailService");
const router = express.Router();

router.post("/sendemail", async (req, res) => {
  const { to, subject, content } = req.body;

  try {
    await emailService.sendCustomEmail(to, subject, content);
    res.status(200).json({ message: "E-mail sikeresen elküldve." });
  } catch (error) {
    console.error("Hiba történt az e-mail küldésekor: ", error);
    res.status(500).json({ message: "Hiba az e-mail küldése közben." });
  }
});

router.post("/sendgroupemail", async (req, res) => {
  const { recipients, subject, content } = req.body;

  try {
    await emailService.sendGroupEmail(recipients, subject, content);
    res
      .status(200)
      .json({ message: "E-mailek sikeresen elküldve az összes címzettnek." });
  } catch (error) {
    console.error("Hiba történt a csoportos e-mail küldésekor: ", error);
    res
      .status(500)
      .json({ message: "Hiba a csoportos e-mail küldése közben." });
  }
});

module.exports = router;
