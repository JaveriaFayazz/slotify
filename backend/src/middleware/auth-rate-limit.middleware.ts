
import rateLimit from "express-rate-limit";

const fifteenMinutes = 15 * 60 * 1000;

function rateLimitResponse(message: string) {
    return {
        message
    };
}

/**
 * Count failed login attempts.
 * Successful logins do not count toward the limit.
 */
export const loginLimiter = rateLimit({
    windowMs: fifteenMinutes,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(
        "Too many failed login attempts. Please try again in 15 minutes."
    )
});

/**
 * Protect email verification and password-reset OTP verification.
 * Failed attempts count toward the limit.
 */
export const otpLimiter = rateLimit({
    windowMs: fifteenMinutes,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(
        "Too many verification attempts. Please try again in 15 minutes."
    )
});

/**
 * Prevent repeated password-reset email requests.
 */
export const passwordResetRequestLimiter = rateLimit({
    windowMs: fifteenMinutes,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(
        "Too many password-reset requests. Please try again in 15 minutes."
    )
});

/**
 * Reduce automated registration spam.
 */
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(
        "Too many registration attempts. Please try again in an hour."
    )
});