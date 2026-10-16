import { Request, Response } from "express";

import {
    registerUser,
    loginUser,
    completeTwoFactorLogin,
    requestPasswordReset,
    verifyPasswordReset,
    resetPassword
} from "../services/auth.services";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { verifyEmailOtp } from "../services/otp.services";

/* =========================================================
   AUTHENTICATED USER
========================================================= */

export function getMe(
    req: AuthenticatedRequest,
    res: Response
) {
    return res.status(200).json({
        message: "Authenticated user",
        user: req.user
    });
}

/* =========================================================
   REGISTER
========================================================= */

export async function register(
    req: Request,
    res: Response
) {
    try {
        const { name, email, password, role, phone } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            typeof role !== "string" ||
            typeof phone !== "string" ||
            !phone.trim()
        ) {
            return res.status(400).json({
                message: "Name, email, password, role, and phone are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                message: "Password must not exceed 72 bytes"
            });
        }

        if (role !== "CUSTOMER" && role !== "OWNER") {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const result = await registerUser({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            phone: phone.trim()
        });

        return res.status(201).json({
            message: "User registered successfully",
            ...result
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
    req: Request,
    res: Response
) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await loginUser(email, password);

        if (result.twoFactorRequired) {
            return res.status(200).json({
                message: "Verification code sent to your email",
                ...result
            });
        }

        return res.status(200).json({
            message: "Login successful",
            ...result
        });
    } catch (error) {
        console.error("Login error:", error);

        if (error instanceof Error) {
            return res.status(401).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

/* =========================================================
   VERIFY TWO-FACTOR LOGIN CODE
========================================================= */

export async function verifyLoginOtp(
    req: Request,
    res: Response
) {
    try {
        const { challengeToken, otp } = req.body;

        if (
            typeof challengeToken !== "string" ||
            !challengeToken.trim() ||
            typeof otp !== "string"
        ) {
            return res.status(400).json({
                message: "Login session and verification code are required"
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Verification code must be 6 digits"
            });
        }

        const result = await completeTwoFactorLogin(
            challengeToken,
            otp
        );

        return res.status(200).json({
            message: "Login successful",
            ...result
        });
    } catch (error) {
        console.error("Two-factor login verification error:", error);

        return res.status(400).json({
            message: error instanceof Error
                ? error.message
                : "Unable to verify login code"
        });
    }
}

/* =========================================================
   EMAIL VERIFICATION
========================================================= */

export async function verifyEmail(
    req: Request,
    res: Response
) {
    try {
        const { userId, otp } = req.body;

        if (
            typeof userId !== "string" ||
            !userId.trim() ||
            typeof otp !== "string"
        ) {
            return res.status(400).json({
                message: "User ID and verification code are required"
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Verification code must be 6 digits"
            });
        }

        await verifyEmailOtp(userId, otp);

        return res.status(200).json({
            message: "Email verified successfully",
            verified: true
        });
    } catch (error) {
        console.error("Email verification error:", error);

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

/* =========================================================
   REQUEST PASSWORD RESET
========================================================= */

export async function forgotPassword(
    req: Request,
    res: Response
) {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const result = await requestPasswordReset(email);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to process the password reset request"
        });
    }
}

/* =========================================================
   VERIFY PASSWORD RESET CODE
========================================================= */

export async function verifyPasswordResetCode(
    req: Request,
    res: Response
) {
    try {
        const { email, otp } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof otp !== "string"
        ) {
            return res.status(400).json({
                message: "Email and reset code are required"
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Reset code must be 6 digits"
            });
        }

        const result = await verifyPasswordReset(email, otp);

        return res.status(200).json({
            message: "Reset code verified successfully",
            ...result
        });
    } catch (error) {
        console.error("Password reset verification error:", error);

        return res.status(400).json({
            message: error instanceof Error
                ? error.message
                : "Unable to verify reset code"
        });
    }
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export async function changePassword(
    req: Request,
    res: Response
) {
    try {
        const { resetToken, newPassword } = req.body;

        if (
            typeof resetToken !== "string" ||
            !resetToken.trim() ||
            typeof newPassword !== "string" ||
            !newPassword
        ) {
            return res.status(400).json({
                message: "Reset token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        if (Buffer.byteLength(newPassword, "utf8") > 72) {
            return res.status(400).json({
                message: "Password must not exceed 72 bytes"
            });
        }

        await resetPassword(resetToken, newPassword);

        return res.status(200).json({
            message: "Password reset successfully",
            success: true
        });
    } catch (error) {
        console.error("Password reset error:", error);

        return res.status(400).json({
            message: error instanceof Error
                ? error.message
                : "Unable to reset password"
        });
    }
}