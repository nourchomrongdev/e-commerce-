const express = require("express");
const { login } = require("../controllers/loginController");
const { register } = require("../controllers/registerController");
const { googleStart, googleCallback, paypalStart, paypalCallback } = require("../controllers/oauthController");
const { me, forgotPassword, resetPassword } = require("../controllers/userController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", me);
router.get("/google", googleStart);
router.get("/google/callback", googleCallback);
router.get("/paypal", paypalStart);
router.get("/paypal/callback", paypalCallback);

module.exports = router;
