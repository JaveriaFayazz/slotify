
import pool from "../database/connection";
import jwt from "jsonwebtoken";

import {
  createLogin2FAOtp,
  verifyLogin2FAOtp,
} from "./otp.services";

import { sendLoginOtp } from "./email.services";

type TwoFactorAction = "ENABLE" | "DISABLE";

interface SettingsChallengePayload extends jwt.JwtPayload {
  userId: string;
  otpId: string;
  purpose: "TWO_FACTOR_SETTINGS";
  action: TwoFactorAction;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

/* =========================================================
   GET CURRENT 2FA STATUS
========================================================= */

export async function getTwoFactorStatus(userId: string) {
  const result = await pool.query(
    `SELECT two_factor_enabled
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User account was not found");
  }

  return {
    twoFactorEnabled:
      result.rows[0].two_factor_enabled === true,
  };
}

/* =========================================================
   REQUEST A 2FA SETTINGS CHANGE
========================================================= */

export async function requestTwoFactorChange(
  userId: string,
  enabled: boolean
) {
  const userResult = await pool.query(
    `SELECT id, name, email, two_factor_enabled
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error("User account was not found");
  }

  const user = userResult.rows[0];
  const currentlyEnabled =
    user.two_factor_enabled === true;

  if (currentlyEnabled === enabled) {
    throw new Error(
      enabled
        ? "Two-factor authentication is already enabled"
        : "Two-factor authentication is already disabled"
    );
  }

  const action: TwoFactorAction = enabled
    ? "ENABLE"
    : "DISABLE";

  const { otp, otpId } = await createLogin2FAOtp(userId);

  try {
    await sendLoginOtp(user.email, user.name, otp);
  } catch (error) {
    // Invalidate the code if email delivery fails.
    await pool.query(
      `UPDATE login_2fa_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND used_at IS NULL`,
      [otpId]
    );

    throw error;
  }

  const challengeToken = jwt.sign(
    {
      userId,
      otpId,
      purpose: "TWO_FACTOR_SETTINGS",
      action,
    },
    getJwtSecret(),
    { expiresIn: "10m" }
  );

  const [localPart, domain] = user.email.split("@");

  const maskedEmail =
    localPart.length <= 2
      ? `${localPart[0] ?? "*"}***@${domain}`
      : `${localPart.slice(0, 2)}***@${domain}`;

  return {
    message: "A verification code has been sent to your email",
    challengeToken,
    maskedEmail,
    action,
  };
}

/* =========================================================
   VERIFY CODE AND APPLY SETTINGS CHANGE
========================================================= */

export async function completeTwoFactorChange(
  userId: string,
  challengeToken: string,
  otp: string
) {
  let decoded: SettingsChallengePayload;

  try {
    const payload = jwt.verify(
      challengeToken,
      getJwtSecret()
    );

    if (
      typeof payload !== "object" ||
      payload === null
    ) {
      throw new Error("Invalid challenge");
    }

    decoded = payload as SettingsChallengePayload;
  } catch {
    throw new Error(
      "Your verification session has expired. Please request a new code."
    );
  }

  if (
    decoded.purpose !== "TWO_FACTOR_SETTINGS" ||
    decoded.userId !== userId ||
    typeof decoded.otpId !== "string" ||
    (decoded.action !== "ENABLE" &&
      decoded.action !== "DISABLE")
  ) {
    throw new Error("Invalid security settings verification session");
  }

  // Verify and consume the OTP before changing the setting.
  await verifyLogin2FAOtp(
    userId,
    decoded.otpId,
    otp
  );

  const shouldEnable = decoded.action === "ENABLE";

  // Only apply the requested change if the setting still
  // has its original state. This prevents stale challenges
  // from overwriting a more recent change.
  const result = await pool.query(
    `UPDATE users
     SET two_factor_enabled = $1
     WHERE id = $2
       AND COALESCE(two_factor_enabled, FALSE) = $3
     RETURNING two_factor_enabled`,
    [shouldEnable, userId, !shouldEnable]
  );

  if (result.rows.length === 0) {
    throw new Error(
      "Your security settings have changed. Refresh the page and try again."
    );
  }

  return {
    message: shouldEnable
      ? "Two-factor authentication enabled successfully"
      : "Two-factor authentication disabled successfully",
    twoFactorEnabled:
      result.rows[0].two_factor_enabled === true,
  };
}