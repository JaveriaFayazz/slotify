"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineMail,
} from "react-icons/ai";

import { requestPasswordReset } from "../services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);

      /*
       * Store the email temporarily so the next
       * page knows which account is being verified.
       */
      sessionStorage.setItem(
        "passwordResetEmail",
        email
      );

      /*
       * Move to OTP verification page.
       */
      router.push("/verify-reset");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send reset code"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {/* NAVBAR */}

      <nav className="auth-navbar">
        <Link
          href="/"
          className="auth-logo"
        >
          Slotify
        </Link>

        <div className="auth-nav-right">
          <span>Remember your password?</span>

          <Link
            href="/login"
            className="auth-nav-link"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* MAIN */}

      <section className="auth-layout">

        {/* LEFT PANEL */}

        <div className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-icon">
              <AiOutlineCalendar />
            </div>

            <p className="auth-brand-eyebrow">
              ACCOUNT RECOVERY
            </p>

            <h1>
              Get back
              <br />
              to your account.
            </h1>

            <p className="auth-brand-description">
              Don't worry. We'll help you securely
              reset your password and get you back
              into Slotify.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span>
                  <AiOutlineCheckCircle />
                </span>

                <div>
                  <strong>
                    Secure verification
                  </strong>

                  <p>
                    We'll send a one-time code
                    to your email.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span>
                  <AiOutlineClockCircle />
                </span>

                <div>
                  <strong>
                    Quick recovery
                  </strong>

                  <p>
                    Reset your password in just
                    a few simple steps.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <div className="auth-brand-footer">
            <span>Slotify</span>

            <span>
              Simple booking. Better scheduling.
            </span>
          </div>
        </div>

        {/* FORM PANEL */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            <div className="auth-heading">

              <div className="auth-mobile-icon">
                <AiOutlineCalendar />
              </div>

              <p className="eyebrow">
                RESET PASSWORD
              </p>

              <h2>
                Forgot your password?
              </h2>

              <p>
                Enter your email address and
                we'll send you a 6-digit reset
                code.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              <div className="auth-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="auth-input-wrapper">

                  <AiOutlineMail />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >

                <span>
                  {loading
                    ? "Sending code..."
                    : "Send reset code"}
                </span>

                {!loading && (
                  <AiOutlineArrowRight />
                )}

              </button>

            </form>

            <Link
              href="/login"
              className="auth-back-link"
            >
              <AiOutlineArrowLeft />

              <span>
                Back to sign in
              </span>
            </Link>

          </div>

        </div>

      </section>
    </main>
  );
}