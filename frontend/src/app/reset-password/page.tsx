
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineLock,
  AiOutlineCheckCircle,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafetyCertificate,
  AiOutlineCalendar,
} from "react-icons/ai";
import { resetPassword } from "../services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    const resetToken = sessionStorage.getItem("passwordResetToken");

    if (!resetToken) {
      setError("Your reset session has expired. Please request a new code.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, password);

      sessionStorage.removeItem("passwordResetToken");
      sessionStorage.removeItem("passwordResetEmail");

      setSuccess("Password reset successfully! Redirecting to login...");

      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:min-h-[calc(100vh-3rem)] lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-[#101f46] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-8 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative z-10">
            <Link href="/login" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl text-[#101f46]">
                <AiOutlineCalendar />
              </span>
              <span className="text-2xl font-bold tracking-tight">
                Slotify
              </span>
            </Link>

            <div className="mt-24 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <AiOutlineSafetyCertificate className="text-base" />
                Account security
              </span>

              <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                A fresh start for your account.
              </h2>

              <p className="mt-6 text-base leading-7 text-blue-100/80">
                Create a new password to keep your bookings, business
                information, and personal details protected.
              </p>
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-blue-100">
                <AiOutlineLock />
              </span>
              <div>
                <p className="font-semibold">Your security matters</p>
                <p className="mt-1 text-sm leading-6 text-blue-100/70">
                  Choose a password you have not used for another account.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 mt-8 text-xs text-blue-100/50">
            © {new Date().getFullYear()} Slotify. All rights reserved.
          </p>
        </section>

        {/* Right form panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#101f46]"
            >
              <AiOutlineArrowLeft />
              Back to login
            </Link>

            <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#101f46] ring-1 ring-blue-100">
              <AiOutlineLock />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-800">
              Account recovery
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create a new password
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Almost there! Choose a strong new password for your Slotify
              account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>

                <div className="relative">
                  <AiOutlineLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your new password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#203b76] focus:bg-white focus:ring-4 focus:ring-blue-900/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-[#101f46]"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="text-lg" />
                    ) : (
                      <AiOutlineEye className="text-lg" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <AiOutlineLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#203b76] focus:bg-white focus:ring-4 focus:ring-blue-900/5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-[#101f46]"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible className="text-lg" />
                    ) : (
                      <AiOutlineEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700"
                >
                  <AiOutlineCheckCircle className="mt-0.5 shrink-0 text-lg" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#101f46] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-950/10 transition hover:bg-[#1b3265] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-900/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting password..." : "Reset password"}
                {!loading && <AiOutlineArrowRight className="transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
              <span>Remembered your password?</span>
              <Link
                href="/login"
                className="font-semibold text-[#172b57] transition hover:text-blue-700"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
              <AiOutlineSafetyCertificate className="text-base" />
              Your account security is important to us.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}