const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/confirmRegistration", userController.confirmRegistration);
router.post("/requestNewPin", userController.requestNewPin);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/forgotpassword", userController.forgotPassword);
router.post("/resetpassword", userController.resetPassword);
router.patch("/updatePassword", userController.updatePassword);
router.patch("/updatePhoneNumber", userController.updatePhoneNumber);
router.get("/fetchUser", authenticateToken, userController.fetchUser);

// Admin menuhoz
router.get("/getallusers", userController.getAllUsers);
router.delete("/deleteUser/:userId", userController.deleteUser);

module.exports = router;
