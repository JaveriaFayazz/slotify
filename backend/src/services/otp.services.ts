import pool from "../database/connection";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp(): string {
    return randomInt(100000, 1000000).toString();
}

/* =========================================================
   EMAIL VERIFICATION OTP
========================================================= */

export async function createVerificationOtp(userId: string) {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await pool.query(
        `UPDATE email_verification_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
    );

    await pool.query(
        `INSERT INTO email_verification_otps
            (user_id, otp_hash, expires_at)
         VALUES (
            $1, $2,
            CURRENT_TIMESTAMP + INTERVAL '${OTP_EXPIRY_MINUTES} minutes'
         )`,
        [userId, otpHash]
    );

    return otp;
}

export async function verifyEmailOtp(
    userId: string,
    otp: string
) {
    const result = await pool.query(
        `SELECT id, otp_hash, expires_at, attempts
         FROM email_verification_otps
         WHERE user_id = $1 AND used_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("No active verification code found");
    }

    const verification = result.rows[0];

    if (new Date(verification.expires_at) <= new Date()) {
        await pool.query(
            `UPDATE email_verification_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [verification.id]
        );

        throw new Error(
            "Verification code has expired. Please request a new one."
        );
    }

    if (verification.attempts >= MAX_OTP_ATTEMPTS) {
        await pool.query(
            `UPDATE email_verification_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [verification.id]
        );

        throw new Error(
            "Too many incorrect attempts. Please request a new code."
        );
    }

    const matches = await bcrypt.compare(
        otp,
        verification.otp_hash
    );

    if (!matches) {
        await pool.query(
            `UPDATE email_verification_otps
             SET attempts = attempts + 1
             WHERE id = $1 AND used_at IS NULL`,
            [verification.id]
        );

        throw new Error("Invalid verification code");
    }

    const consumed = await pool.query(
        `UPDATE email_verification_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND user_id = $2
           AND used_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP
           AND attempts < $3
         RETURNING id`,
        [verification.id, userId, MAX_OTP_ATTEMPTS]
    );

    if (consumed.rows.length === 0) {
        throw new Error(
            "Verification code is invalid, expired, or already used"
        );
    }

    await pool.query(
        `UPDATE users
         SET email_verified = TRUE
         WHERE id = $1`,
        [userId]
    );

    return { verified: true };
}

/* =========================================================
   PASSWORD RESET OTP
========================================================= */

export async function createPasswordResetOtp(
    userId: string
) {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await pool.query(
        `UPDATE password_reset_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
    );

    await pool.query(
        `INSERT INTO password_reset_otps
            (user_id, otp_hash, expires_at)
         VALUES (
            $1, $2,
            CURRENT_TIMESTAMP + INTERVAL '${OTP_EXPIRY_MINUTES} minutes'
         )`,
        [userId, otpHash]
    );

    return otp;
}

export async function verifyPasswordResetOtp(
    userId: string,
    otp: string
) {
    const result = await pool.query(
        `SELECT id, otp_hash, expires_at, attempts
         FROM password_reset_otps
         WHERE user_id = $1 AND used_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("No active password reset code found");
    }

    const resetOtp = result.rows[0];

    if (new Date(resetOtp.expires_at) <= new Date()) {
        await pool.query(
            `UPDATE password_reset_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [resetOtp.id]
        );

        throw new Error(
            "Reset code has expired. Please request a new code."
        );
    }

    if (resetOtp.attempts >= MAX_OTP_ATTEMPTS) {
        await pool.query(
            `UPDATE password_reset_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [resetOtp.id]
        );

        throw new Error(
            "Too many incorrect attempts. Please request a new code."
        );
    }

    const matches = await bcrypt.compare(
        otp,
        resetOtp.otp_hash
    );

    if (!matches) {
        await pool.query(
            `UPDATE password_reset_otps
             SET attempts = attempts + 1
             WHERE id = $1 AND used_at IS NULL`,
            [resetOtp.id]
        );

        throw new Error("Invalid reset code");
    }

    // The password reset flow consumes this code when
    // the password is successfully changed.
    return {
        verified: true,
        userId,
        otpId: resetOtp.id as string
    };
}

export async function consumePasswordResetOtp(
    userId: string
) {
    await pool.query(
        `UPDATE password_reset_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
    );
}

/* =========================================================
   TWO-FACTOR LOGIN OTP
========================================================= */

export async function createLogin2FAOtp(userId: string) {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Invalidate previous unused login codes.
    await pool.query(
        `UPDATE login_2fa_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
    );

    const result = await pool.query(
        `INSERT INTO login_2fa_otps
            (user_id, otp_hash, expires_at)
         VALUES (
            $1, $2,
            CURRENT_TIMESTAMP + INTERVAL '${OTP_EXPIRY_MINUTES} minutes'
         )
         RETURNING id`,
        [userId, otpHash]
    );

    return {
        otp,
        otpId: result.rows[0].id as string
    };
}

export async function verifyLogin2FAOtp(
    userId: string,
    otpId: string,
    otp: string
) {
    const result = await pool.query(
        `SELECT id, otp_hash, expires_at, attempts
         FROM login_2fa_otps
         WHERE id = $1
           AND user_id = $2
           AND used_at IS NULL
         LIMIT 1`,
        [otpId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid or expired login code");
    }

    const challenge = result.rows[0];

    if (new Date(challenge.expires_at) <= new Date()) {
        await pool.query(
            `UPDATE login_2fa_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [otpId]
        );

        throw new Error("Invalid or expired login code");
    }

    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
        await pool.query(
            `UPDATE login_2fa_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [otpId]
        );

        throw new Error(
            "Too many incorrect attempts. Please sign in again."
        );
    }

    const matches = await bcrypt.compare(
        otp,
        challenge.otp_hash
    );

    if (!matches) {
        await pool.query(
            `UPDATE login_2fa_otps
             SET attempts = attempts + 1
             WHERE id = $1
               AND used_at IS NULL
               AND attempts < $2`,
            [otpId, MAX_OTP_ATTEMPTS]
        );

        throw new Error("Invalid or expired login code");
    }

    // Consume the code atomically so it cannot be reused.
    const consumed = await pool.query(
        `UPDATE login_2fa_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND user_id = $2
           AND used_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP
           AND attempts < $3
         RETURNING id`,
        [otpId, userId, MAX_OTP_ATTEMPTS]
    );

    if (consumed.rows.length === 0) {
        throw new Error("Invalid or expired login code");
    }

    return { verified: true };
}