import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(resendApiKey);
const EMAIL_FROM = "Slotify <onboarding@resend.dev>";

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function createOtpEmailHtml(
    heading: string,
    name: string,
    description: string,
    otp: string,
    footer: string
): string {
    const safeHeading = escapeHtml(heading);
    const safeName = escapeHtml(name);
    const safeDescription = escapeHtml(description);
    const safeOtp = escapeHtml(otp);
    const safeFooter = escapeHtml(footer);

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
            <h2 style="color: #0f172a;">${safeHeading}</h2>

            <p>Hi ${safeName},</p>

            <p>${safeDescription}</p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 24px 0;
                padding: 16px;
                background: #f1f5f9;
                text-align: center;
                border-radius: 8px;
            ">
                ${safeOtp}
            </div>

            <p>This code expires in <strong>10 minutes</strong>.</p>

            <p>${safeFooter}</p>

            <p>— Slotify</p>
        </div>
    `;
}

async function sendOtpEmail(
    email: string,
    subject: string,
    html: string,
    errorPrefix: string
) {
    const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject,
        html
    });

    if (error) {
        console.error(`${errorPrefix}:`, error);

        throw new Error(error.message || "Unable to send email");
    }

    return data;
}

/* =========================================================
   EMAIL VERIFICATION
========================================================= */

export async function sendVerificationOtp(
    email: string,
    name: string,
    otp: string
) {
    const html = createOtpEmailHtml(
        "Verify your Slotify account",
        name,
        "Thanks for creating your Slotify account. Use the verification code below to verify your email address:",
        otp,
        "If you did not create a Slotify account, you can safely ignore this email."
    );

    return sendOtpEmail(
        email,
        "Your Slotify verification code",
        html,
        "RESEND VERIFICATION ERROR"
    );
}

/* =========================================================
   PASSWORD RESET
========================================================= */

export async function sendPasswordResetOtp(
    email: string,
    name: string,
    otp: string
) {
    const html = createOtpEmailHtml(
        "Reset your Slotify password",
        name,
        "We received a request to reset your Slotify password. Use the code below to continue:",
        otp,
        "If you did not request a password reset, you can safely ignore this email."
    );

    return sendOtpEmail(
        email,
        "Your Slotify password reset code",
        html,
        "RESEND PASSWORD RESET ERROR"
    );
}

/* =========================================================
   TWO-FACTOR LOGIN
========================================================= */

export async function sendLoginOtp(
    email: string,
    name: string,
    otp: string
) {
    const html = createOtpEmailHtml(
        "Your Slotify login verification code",
        name,
        "Someone has entered the correct password for your Slotify account. Enter the code below to complete your sign-in:",
        otp,
        "If you did not try to sign in, do not share this code. Consider changing your password if you suspect someone else has access to your account."
    );

    return sendOtpEmail(
        email,
        "Your Slotify login verification code",
        html,
        "RESEND LOGIN OTP ERROR"
    );
}