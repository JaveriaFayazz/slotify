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
  AiOutlineUser,
  AiOutlineShop,
  AiOutlinePhone,
} from "react-icons/ai";

import { register } from "../services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] = useState<
    "CUSTOMER" | "OWNER"
  >("CUSTOMER");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Basic password validation
    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        name,
        email,
        password,
        role,
        phone
      );

      // Email verification is temporarily disabled.
      // Registration succeeds, then the user can sign in.
      router.push("/login?registered=1");
      return;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed"
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

        {/* LEFT BRANDING PANEL */}

        <div className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-icon">
              <AiOutlineCalendar />
            </div>

            <p className="auth-brand-eyebrow">
              WELCOME TO SLOTIFY
            </p>

            <h1>
              Make every
              <br />
              appointment count.
            </h1>

            <p className="auth-brand-description">
              Whether you're booking a service
              or managing a business, Slotify
              keeps everything simple and
              organized.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span>
                  <AiOutlineCheckCircle />
                </span>

                <div>
                  <strong>
                    Simple scheduling
                  </strong>

                  <p>
                    Find available times and book
                    without the back-and-forth.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <span>
                  <AiOutlineClockCircle />
                </span>

                <div>
                  <strong>
                    Built for businesses
                  </strong>

                  <p>
                    Manage services, availability,
                    and customer bookings.
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

        {/* REGISTER FORM */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper register-form-wrapper">

            <div className="auth-heading">

              <div className="auth-mobile-icon">
                <AiOutlineCalendar />
              </div>

              <p className="eyebrow">
                GET STARTED
              </p>

              <h2>
                Create your account
              </h2>

              <p>
                Set up your Slotify account and
                get started in minutes.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {/* NAME */}

              <div className="auth-field">

                <label htmlFor="name">
                  Full name
                </label>

                <div className="auth-input-wrapper">

                  <AiOutlineUser />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your name"
                    required
                  />

                </div>
              </div>

              {/* EMAIL */}

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

              {/* PHONE */}

              <div className="auth-field">

                <label htmlFor="phone">
                  Phone number
                </label>

                <div className="auth-input-wrapper">

                  <AiOutlinePhone />

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="+92 300 1234567"
                    required
                  />

                </div>

                <span className="field-hint">
                  Used for your account profile.
                </span>

              </div>

              {/* PASSWORD */}

              <div className="auth-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <AiOutlineLock />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Create a password"
                    required
                    minLength={8}
                  />

                </div>

                <span className="field-hint">
                  Use at least 8 characters.
                </span>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="auth-field">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="auth-input-wrapper">

                  <AiOutlineLock />

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                  />

                </div>

              </div>

              {/* ROLE */}

              <div className="auth-field">

                <label htmlFor="role">
                  Account type
                </label>

                <div className="auth-select-wrapper">

                  {role === "CUSTOMER" ? (
                    <AiOutlineUser />
                  ) : (
                    <AiOutlineShop />
                  )}

                  <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value as
                          | "CUSTOMER"
                          | "OWNER"
                      )
                    }
                  >

                    <option value="CUSTOMER">
                      Customer
                    </option>

                    <option value="OWNER">
                      Business Owner
                    </option>

                  </select>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >

                <span>
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </span>

                {!loading && (
                  <AiOutlineArrowRight />
                )}

              </button>

            </form>

            <p className="auth-switch">

              Already have an account?{" "}

              <Link href="/login">
                Sign in
              </Link>

            </p>

          </div>
        </div>

      </section>
    </main>
  );
}