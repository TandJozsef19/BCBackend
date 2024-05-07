const express = require("express");
const confController = require("../controllers/confController");
const upload = require("../middleware/multerConfig");

const router = express.Router();

router.post(
  "/createConference",
  upload.fields([
    { name: "presentationFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  confController.createConference
);
router.get("/getallconferencefiltered", confController.getallConfFiltered);
router.get("/getallconference", confController.getallConf);
router.delete("/deleteConference/:conferenceId", confController.deleteConf);
router.get("/:conferenceId", confController.getConfDetails);

router.get("/:conferenceId/days", confController.getConferenceDays);

module.exports = router;
