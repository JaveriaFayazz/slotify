import pool from "../database/connection";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    verifyEmailOtp,
    verifyPasswordResetOtp,
    consumePasswordResetOtp,
    verifyLogin2FAOtp
} from "./otp.services";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: "CUSTOMER" | "OWNER";
    phone: string;
}

/* =========================================================
   PASSWORD VALIDATION
========================================================= */

function validateNewPassword(password: string): void {
    if (typeof password !== "string" || password.length < 8) {
        throw new Error(
            "Password must be at least 8 characters long"
        );
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new Error(
            "Password must not exceed 72 bytes"
        );
    }
}

/* =========================================================
   REGISTER
========================================================= */

export async function registerUser(data: RegisterData) {
    const { name, email, password, role, phone } = data;
    const normalizedEmail = email.trim().toLowerCase();

    validateNewPassword(password);

    if (role !== "CUSTOMER" && role !== "OWNER") {
        throw new Error("Invalid role");
    }

    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users
            (name, email, password, role, phone, email_verified)
         VALUES ($1, $2, $3, $4, $5, FALSE)
         RETURNING
            id, name, email, role, phone, created_at,
            email_verified, two_factor_enabled`,
        [name, normalizedEmail, hashedPassword, role, phone]
    );

    const user = result.rows[0];


    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            created_at: user.created_at,
            email_verified: user.email_verified,
            two_factor_enabled: user.two_factor_enabled
        },
        verificationRequired: false
    };
}

/* =========================================================
   LOGIN
========================================================= */

export async function loginUser(
    email: string,
    password: string
) {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT
            id, name, email, password, role, phone,
            created_at, email_verified, two_factor_enabled
         FROM users
         WHERE email = $1`,
        [normalizedEmail]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    // Email-based login 2FA is temporarily bypassed because this
    // project is not currently configured to send OTP emails.
    // The user's two_factor_enabled database value is not changed.
    // Existing login behavior for accounts without 2FA.
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        secret,
        { expiresIn: "7d" }
    );

    delete user.password;

    return {
        twoFactorRequired: false as const,
        user,
        token
    };
}

/* =========================================================
   COMPLETE TWO-FACTOR LOGIN
========================================================= */

export async function completeTwoFactorLogin(
    challengeToken: string,
    otp: string
) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    let decoded: jwt.JwtPayload;

    try {
        const payload = jwt.verify(challengeToken, secret);

        if (
            typeof payload !== "object" ||
            payload === null
        ) {
            throw new Error("Invalid challenge");
        }

        decoded = payload as jwt.JwtPayload;
    } catch {
        throw new Error(
            "Your login session has expired. Please sign in again."
        );
    }

    if (
        decoded.purpose !== "LOGIN_2FA" ||
        typeof decoded.userId !== "string" ||
        typeof decoded.otpId !== "string"
    ) {
        throw new Error("Invalid login verification session");
    }

    await verifyLogin2FAOtp(
        decoded.userId,
        decoded.otpId,
        otp
    );

    // Fetch fresh user details; never trust client-supplied roles.
    const result = await pool.query(
        `SELECT
            id, name, email, role, phone,
            created_at, email_verified, two_factor_enabled
         FROM users
         WHERE id = $1`,
        [decoded.userId]
    );

    if (result.rows.length === 0) {
        throw new Error("User account was not found");
    }

    const user = result.rows[0];

    if (user.two_factor_enabled !== true) {
        throw new Error(
            "Two-factor authentication settings changed. Please sign in again."
        );
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        secret,
        { expiresIn: "7d" }
    );

    return {
        user,
        token
    };
}

/* =========================================================
   EMAIL VERIFICATION
========================================================= */

export async function verifyUserEmail(
    userId: string,
    otp: string
) {
    return await verifyEmailOtp(userId, otp);
}

/* =========================================================
   REQUEST PASSWORD RESET
========================================================= */

export async function requestPasswordReset(
    _email: string
) {
    // Email OTP delivery has been disabled. Do not create a reset OTP
    // or tell the user that an email was sent when no email is delivered.
    throw new Error(
        "Email-based password reset is temporarily unavailable. Please contact support."
    );
}

/* =========================================================
   VERIFY PASSWORD RESET CODE
========================================================= */

export async function verifyPasswordReset(
    email: string,
    otp: string
) {
    const normalizedEmail = email.trim().toLowerCase();

    const userResult = await pool.query(
        `SELECT id
         FROM users
         WHERE email = $1`,
        [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error("Invalid or expired reset code");
    }

    const userId = userResult.rows[0].id;

    let verification;

    try {
        verification = await verifyPasswordResetOtp(
            userId,
            otp
        );
    } catch {
        throw new Error("Invalid or expired reset code");
    }

    if (
        !verification.verified ||
        !verification.userId ||
        !verification.otpId
    ) {
        throw new Error("Invalid or expired reset code");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const resetToken = jwt.sign(
        {
            userId: verification.userId,
            otpId: verification.otpId,
            purpose: "PASSWORD_RESET"
        },
        secret,
        { expiresIn: "10m" }
    );

    return { resetToken };
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export async function resetPassword(
    resetToken: string,
    newPassword: string
) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    let decoded: Record<string, unknown>;

    try {
        const payload = jwt.verify(resetToken, secret);

        if (
            typeof payload !== "object" ||
            payload === null
        ) {
            throw new Error("Invalid token payload");
        }

        decoded = payload as Record<string, unknown>;
    } catch {
        throw new Error(
            "Password reset session has expired. Please start again."
        );
    }

    if (
        decoded.purpose !== "PASSWORD_RESET" ||
        typeof decoded.userId !== "string" ||
        !decoded.userId ||
        typeof decoded.otpId !== "string" ||
        !decoded.otpId
    ) {
        throw new Error("Invalid password reset token");
    }

    validateNewPassword(newPassword);

    // Consume the reset code once, only if still valid.
    const consumeResult = await pool.query(
        `UPDATE password_reset_otps
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND user_id = $2
           AND used_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP
         RETURNING id`,
        [decoded.otpId, decoded.userId]
    );

    if (consumeResult.rows.length === 0) {
        throw new Error(
            "Password reset code is expired or has already been used. Please start again."
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    const updateResult = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2
         RETURNING id`,
        [hashedPassword, decoded.userId]
    );

    if (updateResult.rows.length === 0) {
        throw new Error("User account was not found");
    }

    await consumePasswordResetOtp(decoded.userId);

    return { success: true };
}