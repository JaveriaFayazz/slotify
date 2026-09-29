"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  login,
  getStoredUser,
} from "../services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      const user = getStoredUser();

      if (!user) {
        throw new Error("Unable to load user information.");
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
          : "Login failed"
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
          href="/register"
          className="auth-nav-link"
        >
          Create account
        </Link>
      </nav>

      <section className="auth-container">
        <div className="auth-card">
          <div className="auth-heading">
            <div className="auth-icon">✦</div>

            <p className="eyebrow">WELCOME BACK</p>

            <h1>Sign in to Slotify</h1>

            <p>
              Manage your appointments and keep your
              schedule organized.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
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
              <div className="field-label-row">
                <label htmlFor="password">
                  Password
                </label>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />
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
                ? "Signing in..."
                : "Sign in"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link href="/register">
              Create one
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