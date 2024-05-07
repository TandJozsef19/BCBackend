const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const applyController = require("../controllers/applyController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/apply", applyController.applyForConference);
router.get(
  "/conference/:conferenceId",
  applyController.getApplicationsByConference
);
router.get(
  "/totalApplicationsCount",
  applyController.getTotalApplicationsCount
);
router.get(
  "/applicationsWithEmail",
  applyController.getConferencesWithApplicants
);
router.post("/approve/:applicationId", applyController.approveApplication);
router.get("/speakers", applyController.getSpeakerApplications);
router.get(
  "/speakers/conference/:conferenceId",
  applyController.getSpeakerApplicationsByConference
);

router.get(
  "/myapplications",
  authenticateToken,
  applyController.getUserApplications
);
router.delete(
  "/deleteapplication/:applicationId",
  applyController.deleteApplication
);
router.get(
  "/filteredapplications/:applicationId",
  applyController.getFilteredApplications
);
router.get(
  "/speakersapplication/:applicationId",
  applyController.getFilteredSpeakersApplication
);

module.exports = router;
