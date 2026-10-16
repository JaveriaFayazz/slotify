
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineMail,
} from "react-icons/ai";
import {
  requestPasswordReset,
  verifyPasswordReset,
} from "../services/auth.service";

export default function VerifyResetPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  useState(() => {
    if (typeof window !== "undefined") {
      setEmail(sessionStorage.getItem("passwordResetEmail") || "");
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verifyPasswordReset(email, otp);

      if (!result?.resetToken) {
        throw new Error("The server did not return a password reset token.");
      }

      sessionStorage.setItem("passwordResetToken", result.resetToken);
      router.push("/reset-password");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await requestPasswordReset(email);
      setMessage("If the account exists, a new reset code has been sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend the code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-navbar">
        <Link href="/" className="auth-logo">Slotify</Link>
        <div className="auth-nav-right">
          <span>Remember your password?</span>
          <Link href="/login" className="auth-nav-link">Sign in</Link>
        </div>
      </nav>

      <section className="auth-layout">
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-icon"><AiOutlineCalendar /></div>
            <p className="auth-brand-eyebrow">SECURE ACCOUNT RECOVERY</p>
            <h1>One step closer<br />to getting back in.</h1>
            <p className="auth-brand-description">
              Enter the verification code sent to your email to continue
              resetting your Slotify password.
            </p>
          </div>
          <div className="auth-brand-footer">
            <span>Slotify</span>
            <span>Simple booking. Better scheduling.</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-heading">
              <div className="auth-mobile-icon"><AiOutlineMail /></div>
              <p className="eyebrow">EMAIL VERIFICATION</p>
              <h2>Enter your reset code</h2>
              <p>Enter the 6-digit code sent to your email address.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <div className="auth-input-wrapper">
                  <AiOutlineMail />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="otp">6-digit verification code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  required
                  className="auth-otp-input"
                />
              </div>

              {error && <div className="auth-error">{error}</div>}
              {message && <p role="status">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >
                <span>{loading ? "Verifying..." : "Verify code"}</span>
                {!loading && <AiOutlineArrowRight />}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="auth-back-link"
            >
              {resending ? "Resending code..." : "Resend code"}
            </button>

            <Link href="/forgot-password" className="auth-back-link">
              <AiOutlineArrowLeft />
              <span>Change email address</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}