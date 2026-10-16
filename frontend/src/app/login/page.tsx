
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineMail,
  AiOutlineLock,
} from "react-icons/ai";

import {
  login,
  verifyLoginOtp,
  type User,
} from "../services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const [twoFactorRequired, setTwoFactorRequired] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function redirectUser(user: User) {
    if (user.role === "OWNER") {
      router.push("/owner/businesses");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // STEP 1: Verify email and password.
      if (!twoFactorRequired) {
        const result = await login(email, password);

        // The backend requires a second verification step.
        if (result.twoFactorRequired === true) {
          setChallengeToken(result.challengeToken);
          setMaskedEmail(result.maskedEmail);
          setTwoFactorRequired(true);
          setOtp("");
          setPassword("");

          return;
        }

        // Normal login when 2FA is disabled.
        redirectUser(result.user);
        return;
      }

      // STEP 2: Verify the six-digit email code.
      if (!challengeToken) {
        throw new Error(
          "Your verification session is missing. Please sign in again."
        );
      }

      if (!/^\d{6}$/.test(otp)) {
        throw new Error(
          "Please enter the complete six-digit verification code."
        );
      }

      const result = await verifyLoginOtp(
        challengeToken,
        otp
      );

      redirectUser(result.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function returnToLogin() {
    setTwoFactorRequired(false);
    setChallengeToken("");
    setMaskedEmail("");
    setOtp("");
    setPassword("");
    setError("");
  }

  return (
    <main className="auth-page">
      <nav className="auth-navbar">
        <Link href="/" className="auth-logo">
          Slotify
        </Link>

        <div className="auth-nav-right">
          <span>New to Slotify?</span>

          <Link
            href="/register"
            className="auth-nav-link"
          >
            Create account
          </Link>
        </div>
      </nav>

      <section className="auth-layout">
        {/* LEFT BRANDING PANEL */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">
              <AiOutlineCalendar />
            </div>

            <p className="auth-brand-eyebrow">
              SMART SCHEDULING
            </p>

            <h1>
              Your time.
              <br />
              Simply scheduled.
            </h1>

            <p className="auth-brand-description">
              Manage appointments, discover services,
              and keep your schedule organized with
              Slotify.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span>
                  <AiOutlineCheckCircle />
                </span>

                <div>
                  <strong>Easy booking</strong>
                  <p>
                    Book appointments in just a few
                    clicks.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span>
                  <AiOutlineClockCircle />
                </span>

                <div>
                  <strong>Stay organized</strong>
                  <p>
                    Keep your appointments and
                    availability in one place.
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

        {/* RIGHT FORM PANEL */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-heading">
              <div className="auth-mobile-icon">
                {twoFactorRequired ? (
                  <AiOutlineLock />
                ) : (
                  <AiOutlineCalendar />
                )}
              </div>

              <p className="eyebrow">
                {twoFactorRequired
                  ? "ACCOUNT SECURITY"
                  : "WELCOME BACK"}
              </p>

              <h2>
                {twoFactorRequired
                  ? "Verify it's you"
                  : "Sign in to Slotify"}
              </h2>

              <p>
                {twoFactorRequired
                  ? "Enter the six-digit verification code sent to your email to securely complete your sign-in."
                  : "Enter your details to continue to your account."}
              </p>
            </div>

            {twoFactorRequired && (
              <div
                role="status"
                style={{
                  padding: "14px 16px",
                  marginBottom: "22px",
                  border: "1px solid #cbd9e8",
                  borderRadius: "10px",
                  background: "#f2f6fb",
                  color: "#1e3a5f",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                <strong>Verification code sent</strong>
                <p style={{ margin: "4px 0 0" }}>
                  Check your inbox
                  {maskedEmail
                    ? ` (${maskedEmail})`
                    : ""}{" "}
                  for your six-digit code. It expires
                  after 10 minutes.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >
              {!twoFactorRequired ? (
                <>
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
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <label htmlFor="password">
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e3a5f",
                          textDecoration: "none",
                        }}
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="auth-input-wrapper">
                      <AiOutlineLock />

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="auth-field">
                  <label htmlFor="otp">
                    Six-digit verification code
                  </label>

                  <div className="auth-input-wrapper">
                    <AiOutlineLock />

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(event) => {
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        );
                        setError("");
                      }}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      aria-describedby="otp-help"
                      autoFocus
                      required
                    />
                  </div>

                  <p
                    id="otp-help"
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "8px",
                      lineHeight: 1.5,
                    }}
                  >
                    Enter the code from your email.
                    Do not share it with anyone.
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="auth-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  (twoFactorRequired && otp.length !== 6)
                }
                className="auth-submit"
              >
                <span>
                  {loading
                    ? twoFactorRequired
                      ? "Verifying code..."
                      : "Signing in..."
                    : twoFactorRequired
                      ? "Verify and sign in"
                      : "Sign in"}
                </span>

                {!loading && <AiOutlineArrowRight />}
              </button>

              {twoFactorRequired && (
                <button
                  type="button"
                  onClick={returnToLogin}
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "11px",
                    border: "1px solid #dbe3ed",
                    borderRadius: "9px",
                    background: "#ffffff",
                    color: "#1e3a5f",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back to sign in
                </button>
              )}
            </form>

            {!twoFactorRequired && (
              <p className="auth-switch">
                Don't have an account?{" "}
                <Link href="/register">
                  Create one
                </Link>
              </p>
            )}

            {twoFactorRequired && (
              <p
                className="auth-switch"
                style={{ lineHeight: 1.6 }}
              >
                Having trouble? Check your spam folder
                or return to sign in and try again.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}