"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  register,
  getStoredUser,
} from "../services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "OWNER">(
    "CUSTOMER"
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(name, email, password, role);

      const user = getStoredUser();

      if (!user) {
        throw new Error(
          "Account created, but user information could not be loaded."
        );
      }

      if (user.role === "OWNER") {
        router.push("/owner/businesses");
      } else {
        router.push("/dashboard");
      }
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
        <Link href="/" className="auth-logo">
          Slotify
        </Link>

        <Link
          href="/login"
          className="auth-nav-link"
        >
          Sign in
        </Link>
      </nav>

      <section className="auth-container register-container">
        <div className="auth-card">
          <div className="auth-heading">
            <div className="auth-icon">✦</div>

            <p className="eyebrow">GET STARTED</p>

            <h1>Create your account</h1>

            <p>
              Join Slotify and make appointment scheduling
              simpler.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="auth-field">
              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                required
                minLength={6}
              />

              <span className="field-hint">
                Use at least 6 characters.
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="role">
                Account type
              </label>

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
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">
              Sign in
            </Link>
          </p>
        </div>

        <p className="auth-footer-text">
          Simple booking. Better scheduling.
        </p>
      </section>
    </main>
  );
}