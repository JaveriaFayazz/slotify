
import { Router } from "express";

import {
  register,
  login,
  verifyLoginOtp,
  getMe,
  verifyEmail,
  forgotPassword,
  verifyPasswordResetCode,
  changePassword,
} from "../controllers/auth.controller";

import {
  getTwoFactorSettings,
  requestTwoFactorSettingsChange,
  verifyTwoFactorSettingsChange,
} from "../controllers/two-factor-settings.controller";

import {
    getProfile,
    updateProfile,
    updatePassword,
    requestEmailChange,
    verifyEmailChange
} from "../controllers/account-settings.controller";

import {
  loginLimiter,
  otpLimiter,
  passwordResetRequestLimiter,
  registrationLimiter,
} from "../middleware/auth-rate-limit.middleware";

import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

/* =========================================================
   REGISTRATION
========================================================= */

router.post(
  "/register",
  registrationLimiter,
  register
);

/* =========================================================
   LOGIN
========================================================= */

router.post(
  "/login",
  loginLimiter,
  login
);

router.post(
  "/verify-login-otp",
  otpLimiter,
  verifyLoginOtp
);

/* =========================================================
   EMAIL VERIFICATION
========================================================= */

router.post(
  "/verify-email",
  otpLimiter,
  verifyEmail
);

/* =========================================================
   PASSWORD RESET
========================================================= */

router.post(
  "/forgot-password",
  passwordResetRequestLimiter,
  forgotPassword
);

router.post(
  "/verify-reset-code",
  otpLimiter,
  verifyPasswordResetCode
);

router.post(
  "/reset-password",
  changePassword
);

/* =========================================================
   TWO-FACTOR SECURITY SETTINGS
   All settings endpoints require a valid access token.
========================================================= */

// Read the currently authenticated user's 2FA status.
router.get(
  "/2fa/status",
  authenticate,
  getTwoFactorSettings
);

// Request an email code to enable or disable 2FA.
router.post(
  "/2fa/request-change",
  authenticate,
  otpLimiter,
  requestTwoFactorSettingsChange
);

// Verify the email code and apply the requested change.
router.post(
  "/2fa/verify-change",
  authenticate,
  otpLimiter,
  verifyTwoFactorSettingsChange
);

/* =========================================================
   AUTHENTICATED USER
========================================================= */

router.get(
  "/me",
  authenticate,
  getMe
);

/* =========================================================
   OWNER TEST
========================================================= */

router.get(
  "/owner-test",
  authenticate,
  requireRole("OWNER"),
  (req, res) => {
    res.json({
      message: "You have OWNER access",
    });
  }
);

/* =========================================================
   ACCOUNT SETTINGS — AUTHENTICATED USERS
========================================================= */

router.get(
    "/account/profile",
    authenticate,
    getProfile
);

router.patch(
    "/account/profile",
    authenticate,
    updateProfile
);

router.post(
    "/account/change-password",
    authenticate,
    loginLimiter,
    updatePassword
);

router.post(
    "/account/email/request",
    authenticate,
    otpLimiter,
    requestEmailChange
);

router.post(
    "/account/email/verify",
    authenticate,
    otpLimiter,
    verifyEmailChange
);
export default router;