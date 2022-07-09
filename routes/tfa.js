const express = require("express");
const tfaController = require("../controllers/tfa");
const authController = require("../controllers/authController");

const router = express.Router();
router.use(authController.protect); 

router.get("/mfa_qr_code", tfaController.mfaQRCode);
router.post("/verify_otp", tfaController.verifyTOTPP);

module.exports = router;
