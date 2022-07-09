const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const crypto = require( 'crypto');
const util = require( 'util');
const qrcode = require( 'qrcode');
const base32Encode = require( 'base32-encode');
const { verifyTOTP } = require( './otp');


exports.mfaQRCode =  catchAsync(async (req, res) => {

  const user = await User.findOne({ _id: req.user._id });

  
    // For security, we no longer show the QR code after is verified
    if (user.mfaEnabled) return res.status(404).end();
  
    if (!user.mfaSecret) {
      // generate unique secret for user
      // this secret will be used to check the verification code sent by user
      const buffer = await util.promisify(crypto.randomBytes)(14);
      user.mfaSecret = base32Encode(buffer, 'RFC4648', { padding: false });
      await user.updateOne(user);

    }
  
    const issuer = 'Cypher';
    const algorithm = 'SHA1';
    const digits = '6';
    const period = '30';
    const otpType = 'totp';
    const configUri = `otpauth://${otpType}/${issuer}:${user.firstName}?algorithm=${algorithm}&digits=${digits}&period=${period}&issuer=${issuer}&secret=${user.mfaSecret}`;
  
    res.setHeader('Content-Type', 'image/png');
  
    //totp/MfaDemo:alan?algorithm=SHA1&digits=6&issuer=MfaDemo&period=30&secret=5CZ4UNFL54LOGJ24ZIWUHBY
  
    otpauth: qrcode.toFileStream(res, configUri);
  });
  
  exports.verifyTOTPP =  catchAsync(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });

    if (verifyTOTP(req.body.code, user.mfaSecret)) {
      const payload = {
        mfaEnabled: true,
        requireMfa: true

      }
      req.session.mfaVerified = true;
      await user.updateOne(payload);

      res.json(true);
    } else {
      res.json(false);
    }
  });

