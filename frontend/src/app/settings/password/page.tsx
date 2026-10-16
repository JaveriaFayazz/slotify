
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AiOutlineArrowLeft,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
  AiOutlineSafety,
} from "react-icons/ai";
import { changeAccountPassword } from "../../services/auth.service";

export default function PasswordSettingsPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Your new password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      await changeAccountPassword(currentPassword, newPassword);

      toast.success("Your password has been changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.push("/settings/profile");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to change your password. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-950"
        >
          <AiOutlineArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-950">
                <AiOutlineLock size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Password settings
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update your password to help keep your Slotify account secure.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-8">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex gap-3">
                <AiOutlineSafety
                  size={22}
                  className="mt-0.5 shrink-0 text-blue-950"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Keep your account secure
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Choose a strong password that you do not use for other accounts.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter your new password"
                className={inputClass}
                minLength={8}
                maxLength={72}
                required
                disabled={loading}
              />
              <p className="mt-2 text-xs text-slate-500">
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
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your new password again"
                className={inputClass}
                minLength={8}
                maxLength={72}
                required
                disabled={loading}
              />
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
                className="h-4 w-4 accent-blue-950"
                disabled={loading}
              />
              Show passwords
              {showPasswords ? (
                <AiOutlineEyeInvisible size={17} />
              ) : (
                <AiOutlineEye size={17} />
              )}
            </label>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/settings/profile"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating password..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}