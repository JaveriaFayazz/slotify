"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineMail,
  AiOutlineSafetyCertificate,
} from "react-icons/ai";

import { verifyEmail } from "../services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    []
  );

  useEffect(() => {
    const storedUserId =
      sessionStorage.getItem("verificationUserId");

    const storedEmail =
      sessionStorage.getItem("verificationEmail");

    if (!storedUserId || !storedEmail) {
      router.push("/register");
      return;
    }

    setUserId(storedUserId);
    setEmail(storedEmail);
  }, [router]);

  function handleOtpChange(
    index: number,
    value: string
  ) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError("");

    if (
      value &&
      index < otp.length - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(
    event: React.ClipboardEvent<HTMLInputElement>
  ) {
    event.preventDefault();

    const pastedData =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedData
      .split("")
      .forEach((digit, index) => {
        newOtp[index] = digit;
      });

    setOtp(newOtp);
    setError("");

    const nextIndex = Math.min(
      pastedData.length,
      5
    );

    inputRefs.current[nextIndex]?.focus();
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    const verificationCode =
      otp.join("");

    if (verificationCode.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(
        userId,
        verificationCode
      );

      setSuccess(true);

      sessionStorage.removeItem(
        "verificationUserId"
      );

      sessionStorage.removeItem(
        "verificationEmail"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-navbar">
        <Link
          href="/"
          className="auth-logo"
        >
          Slotify
        </Link>

        <div className="auth-nav-right">
          <span>
            Already have an account?
          </span>

          <Link
            href="/login"
            className="auth-nav-link"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="auth-layout">

        {/* LEFT SIDE */}

        <div className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-icon">
              <AiOutlineCalendar />
            </div>

            <p className="auth-brand-eyebrow">
              SECURE YOUR ACCOUNT
            </p>

            <h1>
              One more step
              <br />
              before you begin.
            </h1>

            <p className="auth-brand-description">
              We've sent a verification code
              to your email address. Verify
              your email to complete your
              Slotify account setup.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span>
                  <AiOutlineSafetyCertificate />
                </span>

                <div>
                  <strong>
                    Secure verification
                  </strong>

                  <p>
                    Your verification code helps
                    protect your account.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span>
                  <AiOutlineClockCircle />
                </span>

                <div>
                  <strong>
                    Quick and simple
                  </strong>

                  <p>
                    Enter the 6-digit code from
                    your email and you're done.
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

        {/* RIGHT SIDE */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            {!success ? (
              <>
                <div className="auth-heading">

                  <div className="auth-mobile-icon">
                    <AiOutlineMail />
                  </div>

                  <p className="eyebrow">
                    EMAIL VERIFICATION
                  </p>

                  <h2>
                    Check your email
                  </h2>

                  <p>
                    Enter the verification code
                    we sent to:
                  </p>

                  <strong className="verification-email">
                    {email}
                  </strong>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="auth-form"
                >

                  <div className="otp-container">
                    {otp.map(
                      (digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            inputRefs.current[index] =
                              element;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) =>
                            handleOtpChange(
                              index,
                              event.target.value
                            )
                          }
                          onKeyDown={(event) =>
                            handleKeyDown(
                              index,
                              event
                            )
                          }
                          onPaste={handlePaste}
                          className="otp-input"
                          aria-label={`Verification digit ${
                            index + 1
                          }`}
                        />
                      )
                    )}
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
                        ? "Verifying..."
                        : "Verify email"}
                    </span>

                    {!loading && (
                      <AiOutlineArrowRight />
                    )}
                  </button>

                </form>

                <div className="verification-help">
                  <p>
                    Didn't receive the code?
                  </p>

                  <span>
                    Check your spam folder or
                    request a new code.
                  </span>
                </div>

                <p className="auth-switch">
                  Entered the wrong email?{" "}
                  <Link href="/register">
                    Create a new account
                  </Link>
                </p>
              </>
            ) : (
              <div className="verification-success">

                <div className="verification-success-icon">
                  <AiOutlineCheckCircle />
                </div>

                <p className="eyebrow">
                  VERIFICATION COMPLETE
                </p>

                <h2>
                  Email verified!
                </h2>

                <p>
                  Your Slotify account has been
                  successfully verified.
                </p>

                <span>
                  Redirecting you to login...
                </span>

              </div>
            )}

          </div>
        </div>

      </section>
    </main>
  );
}