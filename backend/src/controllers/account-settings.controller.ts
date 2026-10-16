
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    getAccountProfile,
    updateAccountProfile,
    changeAccountPassword,
    requestAccountEmailChange,
    verifyAccountEmailChange
} from "../services/account-settings.services";

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Something went wrong";
}

/* GET /api/auth/account/profile */
export async function getProfile(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await getAccountProfile(req.user.id);
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(400).json({ message: getErrorMessage(error) });
    }
}

/* PATCH /api/auth/account/profile */
export async function updateProfile(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { name, phone } = req.body;

        if (
            typeof name !== "string" ||
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Name and phone number are required"
            });
        }

        const user = await updateAccountProfile(
            req.user.id,
            name,
            phone
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(400).json({ message: getErrorMessage(error) });
    }
}

/* POST /api/auth/account/change-password */
export async function updatePassword(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            !currentPassword ||
            typeof newPassword !== "string" ||
            !newPassword
        ) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        await changeAccountPassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            message: "Password changed successfully",
            success: true
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(400).json({ message: getErrorMessage(error) });
    }
}

/* POST /api/auth/account/email/request */
export async function requestEmailChange(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { newEmail, currentPassword } = req.body;

        if (
            typeof newEmail !== "string" ||
            !newEmail.trim() ||
            typeof currentPassword !== "string" ||
            !currentPassword
        ) {
            return res.status(400).json({
                message: "New email and current password are required"
            });
        }

        const result = await requestAccountEmailChange(
            req.user.id,
            newEmail,
            currentPassword
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error("Request email change error:", error);
        return res.status(400).json({ message: getErrorMessage(error) });
    }
}

/* POST /api/auth/account/email/verify */
export async function verifyEmailChange(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { challengeToken, otp } = req.body;

        if (
            typeof challengeToken !== "string" ||
            !challengeToken.trim() ||
            typeof otp !== "string" ||
            !/^\d{6}$/.test(otp)
        ) {
            return res.status(400).json({
                message: "A verification session and six-digit code are required"
            });
        }

        const result = await verifyAccountEmailChange(
            req.user.id,
            challengeToken,
            otp
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error("Verify email change error:", error);
        return res.status(400).json({ message: getErrorMessage(error) });
    }
}