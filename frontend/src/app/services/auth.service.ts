
import { apiRequest } from "./api";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "OWNER";
    phone?: string;
    email_verified?: boolean;
    two_factor_enabled?: boolean;
    created_at?: string;
}

interface RegisterResponse {
    message: string;
    user: User;
    verificationRequired: boolean;
}

interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

interface LoginChallengeResponse {
    message: string;
    twoFactorRequired: true;
    challengeToken: string;
    maskedEmail: string;
}

interface NormalLoginResponse extends AuthResponse {
    twoFactorRequired?: false;
}

export type LoginResponse =
    | NormalLoginResponse
    | LoginChallengeResponse;

interface PasswordResetResponse {
    message?: string;
    success?: boolean;
    verified?: boolean;
    resetToken?: string;
}

export interface TwoFactorStatusResponse {
    twoFactorEnabled: boolean;
}

export interface TwoFactorChangeRequestResponse {
    message: string;
    challengeToken: string;
    maskedEmail: string;
    action: "ENABLE" | "DISABLE";
}

export interface TwoFactorChangeVerifyResponse {
    message: string;
    twoFactorEnabled: boolean;
}

export interface ProfileResponse {
    message?: string;
    user: User;
}

export interface EmailChangeRequestResponse {
    message: string;
    challengeToken: string;
    maskedEmail: string;
}

export interface EmailChangeVerifyResponse {
    message: string;
    user: User;
}

/* =========================================================
   REGISTER
========================================================= */

export async function register(
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "OWNER",
    phone: string
): Promise<RegisterResponse> {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role, phone })
    });
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const result: LoginResponse = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    // A 2FA challenge is not an authenticated session.
    if (result.twoFactorRequired) {
        return result;
    }

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    return result;
}

/* =========================================================
   VERIFY LOGIN 2FA
========================================================= */

export async function verifyLoginOtp(
    challengeToken: string,
    otp: string
): Promise<AuthResponse> {
    const result: AuthResponse = await apiRequest(
        "/auth/verify-login-otp",
        {
            method: "POST",
            body: JSON.stringify({ challengeToken, otp })
        }
    );

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    return result;
}

/* =========================================================
   EMAIL VERIFICATION AFTER REGISTRATION
========================================================= */

export async function verifyEmail(
    userId: string,
    otp: string
) {
    return apiRequest("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ userId, otp })
    });
}

/* =========================================================
   FORGOT PASSWORD / RESET PASSWORD
========================================================= */

export async function requestPasswordReset(email: string) {
    return apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
    });
}

export async function verifyPasswordReset(
    email: string,
    otp: string
): Promise<PasswordResetResponse> {
    return apiRequest("/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({ email, otp })
    });
}

export async function resetPassword(
    resetToken: string,
    newPassword: string
) {
    return apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ resetToken, newPassword })
    });
}

/* =========================================================
   PROFILE SETTINGS
========================================================= */

export async function getAccountProfile(): Promise<ProfileResponse> {
    return apiRequest("/auth/account/profile", {
        method: "GET"
    });
}

export async function updateAccountProfile(
    name: string,
    phone: string
): Promise<ProfileResponse> {
    const result: ProfileResponse = await apiRequest(
        "/auth/account/profile",
        {
            method: "PATCH",
            body: JSON.stringify({ name, phone })
        }
    );

    // Keep the dashboard's cached user information up to date.
    localStorage.setItem("user", JSON.stringify(result.user));

    return result;
}

/* =========================================================
   CHANGE PASSWORD WHILE SIGNED IN
========================================================= */

export async function changeAccountPassword(
    currentPassword: string,
    newPassword: string
) {
    return apiRequest("/auth/account/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

/* =========================================================
   CHANGE EMAIL
========================================================= */

export async function requestEmailChange(
    newEmail: string,
    currentPassword: string
): Promise<EmailChangeRequestResponse> {
    return apiRequest("/auth/account/email/request", {
        method: "POST",
        body: JSON.stringify({ newEmail, currentPassword })
    });
}

export async function verifyEmailChange(
    challengeToken: string,
    otp: string
): Promise<EmailChangeVerifyResponse> {
    const result: EmailChangeVerifyResponse = await apiRequest(
        "/auth/account/email/verify",
        {
            method: "POST",
            body: JSON.stringify({ challengeToken, otp })
        }
    );

    localStorage.setItem("user", JSON.stringify(result.user));

    return result;
}

/* =========================================================
   TWO-FACTOR SECURITY SETTINGS
========================================================= */

export async function getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
    return apiRequest("/auth/2fa/status", {
        method: "GET"
    });
}

export async function requestTwoFactorChange(
    enabled: boolean
): Promise<TwoFactorChangeRequestResponse> {
    return apiRequest("/auth/2fa/request-change", {
        method: "POST",
        body: JSON.stringify({ enabled })
    });
}

export async function verifyTwoFactorChange(
    challengeToken: string,
    otp: string
): Promise<TwoFactorChangeVerifyResponse> {
    const result: TwoFactorChangeVerifyResponse = await apiRequest(
        "/auth/2fa/verify-change",
        {
            method: "POST",
            body: JSON.stringify({ challengeToken, otp })
        }
    );

    const storedUser = getStoredUser();

    if (storedUser) {
        localStorage.setItem(
            "user",
            JSON.stringify({
                ...storedUser,
                two_factor_enabled: result.twoFactorEnabled
            })
        );
    }

    return result;
}

/* =========================================================
   LOGOUT AND STORED USER
========================================================= */

export function logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as User;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}