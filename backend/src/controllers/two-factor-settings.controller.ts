
import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  getTwoFactorStatus,
  requestTwoFactorChange,
  completeTwoFactorChange,
} from "../services/two-factor-settings.services";

/* =========================================================
   GET CURRENT SETTINGS
========================================================= */

export async function getTwoFactorSettings(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await getTwoFactorStatus(req.user.id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get 2FA settings error:", error);

    return res.status(500).json({
      message: "Unable to load security settings",
    });
  }
}

/* =========================================================
   REQUEST ENABLE / DISABLE VERIFICATION
========================================================= */

export async function requestTwoFactorSettingsChange(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "The enabled field must be true or false",
      });
    }

    const result = await requestTwoFactorChange(
      req.user.id,
      enabled
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Request 2FA settings change error:", error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to request a security settings change",
    });
  }
}

/* =========================================================
   VERIFY CODE AND COMPLETE CHANGE
========================================================= */

export async function verifyTwoFactorSettingsChange(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { challengeToken, otp } = req.body;

    if (
      typeof challengeToken !== "string" ||
      !challengeToken.trim() ||
      typeof otp !== "string"
    ) {
      return res.status(400).json({
        message: "Verification session and code are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Verification code must contain six digits",
      });
    }

    const result = await completeTwoFactorChange(
      req.user.id,
      challengeToken,
      otp
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Verify 2FA settings change error:", error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify security settings change",
    });
  }
}