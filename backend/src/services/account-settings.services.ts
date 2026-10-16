
import pool from "../database/connection";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import { sendVerificationOtp } from "./email.services";

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return secret;
}

function validatePassword(password: string): void {
    if (typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Password must not exceed 72 bytes");
    }
}

/* =========================================================
   GET PROFILE
========================================================= */

export async function getAccountProfile(userId: string) {
    const result = await pool.query(
        `SELECT id, name, email, role, phone, created_at,
                email_verified, two_factor_enabled
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("User account was not found");
    }

    return result.rows[0];
}

/* =========================================================
   UPDATE PROFILE NAME AND PHONE
========================================================= */

export async function updateAccountProfile(
    userId: string,
    name: string,
    phone: string
) {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length > 100) {
        throw new Error("Name must be between 1 and 100 characters");
    }

    if (!cleanPhone || cleanPhone.length > 30) {
        throw new Error("Phone number must be between 1 and 30 characters");
    }

    const result = await pool.query(
        `UPDATE users
         SET name = $1, phone = $2
         WHERE id = $3
         RETURNING id, name, email, role, phone, created_at,
                   email_verified, two_factor_enabled`,
        [cleanName, cleanPhone, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("User account was not found");
    }

    return result.rows[0];
}

/* =========================================================
   CHANGE PASSWORD WHILE SIGNED IN
========================================================= */

export async function changeAccountPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    if (!currentPassword) {
        throw new Error("Current password is required");
    }

    validatePassword(newPassword);

    if (currentPassword === newPassword) {
        throw new Error("Your new password must be different");
    }

    const result = await pool.query(
        "SELECT password FROM users WHERE id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("User account was not found");
    }

    const matches = await bcrypt.compare(
        currentPassword,
        result.rows[0].password
    );

    if (!matches) {
        throw new Error("Your current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateResult = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2
         RETURNING id`,
        [hashedPassword, userId]
    );

    if (updateResult.rows.length === 0) {
        throw new Error("Unable to update your password");
    }

    return { success: true };
}

/* =========================================================
   REQUEST EMAIL CHANGE
========================================================= */

export async function requestAccountEmailChange(
    userId: string,
    newEmail: string,
    currentPassword: string
) {
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        normalizedEmail.length > 255
    ) {
        throw new Error("Please enter a valid email address");
    }

    if (!currentPassword) {
        throw new Error("Your current password is required");
    }

    const userResult = await pool.query(
        `SELECT id, name, email, password
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new Error("User account was not found");
    }

    const user = userResult.rows[0];

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw new Error("Your current password is incorrect");
    }

    if (normalizedEmail === user.email.toLowerCase()) {
        throw new Error("This is already your current email address");
    }

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
    );

    if (existing.rows.length > 0) {
        throw new Error("That email address is already registered");
    }

    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const otpHash = await bcrypt.hash(otp, 10);

    // Invalidate any previous unused email-change codes for this user.
    await pool.query(
        `UPDATE email_change_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
    );

    const otpResult = await pool.query(
        `INSERT INTO email_change_otps
            (user_id, new_email, otp_hash, expires_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '10 minutes')
         RETURNING id`,
        [userId, normalizedEmail, otpHash]
    );

    const otpId: string = otpResult.rows[0].id;

    try {
        await sendVerificationOtp(normalizedEmail, user.name, otp);
    } catch (error) {
        await pool.query(
            `UPDATE email_change_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND used_at IS NULL`,
            [otpId]
        );

        throw new Error(
            "Unable to send a verification email. Please try again later."
        );
    }

    const challengeToken = jwt.sign(
        {
            userId,
            otpId,
            purpose: "EMAIL_CHANGE"
        },
        getJwtSecret(),
        { expiresIn: "10m" }
    );

    return {
        message: "A verification code was sent to your new email address",
        challengeToken,
        maskedEmail: maskEmail(normalizedEmail)
    };
}

function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");

    if (!domain) return "***";

    const visible = localPart.length > 2
        ? localPart.slice(0, 2)
        : localPart.slice(0, 1);

    return `${visible}***@${domain}`;
}

/* =========================================================
   VERIFY NEW EMAIL AND APPLY CHANGE
========================================================= */

export async function verifyAccountEmailChange(
    userId: string,
    challengeToken: string,
    otp: string
) {
    let decoded: jwt.JwtPayload;

    try {
        const payload = jwt.verify(challengeToken, getJwtSecret());

        if (typeof payload !== "object" || payload === null) {
            throw new Error("Invalid token");
        }

        decoded = payload as jwt.JwtPayload;
    } catch {
        throw new Error(
            "Your email verification session has expired. Please request a new code."
        );
    }

    if (
        decoded.purpose !== "EMAIL_CHANGE" ||
        decoded.userId !== userId ||
        typeof decoded.otpId !== "string"
    ) {
        throw new Error("Invalid email verification session");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const otpResult = await client.query(
            `SELECT id, user_id, new_email, otp_hash, expires_at, attempts
             FROM email_change_otps
             WHERE id = $1 AND user_id = $2 AND used_at IS NULL
             FOR UPDATE`,
            [decoded.otpId, userId]
        );

        if (otpResult.rows.length === 0) {
            throw new Error("Invalid or expired verification code");
        }

        const record = otpResult.rows[0];

        if (new Date(record.expires_at).getTime() <= Date.now()) {
            await client.query(
                `UPDATE email_change_otps
                 SET used_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [record.id]
            );

            await client.query("COMMIT");
            throw new Error("Verification code has expired. Request a new one.");
        }

        if (record.attempts >= 5) {
            await client.query(
                `UPDATE email_change_otps
                 SET used_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [record.id]
            );

            await client.query("COMMIT");
            throw new Error("Too many incorrect codes. Request a new one.");
        }

        const matches = await bcrypt.compare(otp, record.otp_hash);

        if (!matches) {
            await client.query(
                `UPDATE email_change_otps
                 SET attempts = attempts + 1,
                     used_at = CASE
                         WHEN attempts + 1 >= 5 THEN CURRENT_TIMESTAMP
                         ELSE used_at
                     END
                 WHERE id = $1`,
                [record.id]
            );

            await client.query("COMMIT");
            throw new Error("Invalid verification code");
        }

        // Check again to guard against the address being registered meanwhile.
        const duplicate = await client.query(
            `SELECT id FROM users
             WHERE email = $1 AND id <> $2`,
            [record.new_email, userId]
        );

        if (duplicate.rows.length > 0) {
            throw new Error("That email address is already registered");
        }

        const updateResult = await client.query(
            `UPDATE users
             SET email = $1, email_verified = TRUE
             WHERE id = $2
             RETURNING id, name, email, role, phone, created_at,
                       email_verified, two_factor_enabled`,
            [record.new_email, userId]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("User account was not found");
        }

        await client.query(
            `UPDATE email_change_otps
             SET used_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND used_at IS NULL`,
            [userId]
        );

        await client.query("COMMIT");

        return {
            message: "Email address updated successfully",
            user: updateResult.rows[0]
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}