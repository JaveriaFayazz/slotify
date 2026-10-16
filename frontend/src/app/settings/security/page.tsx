
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AiOutlineArrowLeft,
  AiOutlineSafety,
  AiOutlineLock,
  AiOutlineMail,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import {
  getTwoFactorStatus,
  requestTwoFactorChange,
  verifyTwoFactorChange,
} from "../../services/auth.service";

type PendingChallenge = {
  challengeToken: string;
  maskedEmail: string;
  action: "ENABLE" | "DISABLE";
};

export default function SecuritySettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<PendingChallenge | null>(null);

  useEffect(() => {
    let active = true;

    getTwoFactorStatus()
      .then((result) => {
        if (active) setEnabled(result.twoFactorEnabled);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load your security settings."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingStatus(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleRequestChange() {
    setSubmitting(true);

    try {
      const result = await requestTwoFactorChange(!enabled);

      setPending({
        challengeToken: result.challengeToken,
        maskedEmail: result.maskedEmail,
        action: result.action,
      });
      setOtp("");
      toast.success(result.message || "Verification code requested.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to request a verification code."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pending) return;

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the complete six-digit verification code.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await verifyTwoFactorChange(
        pending.challengeToken,
        otp
      );

      setEnabled(result.twoFactorEnabled);
      setPending(null);
      setOtp("");
      toast.success(
        result.message ||
          (result.twoFactorEnabled
            ? "Two-factor authentication enabled."
            : "Two-factor authentication disabled.")
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Verification failed. Please check the code and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function cancelChallenge() {
    setPending(null);
    setOtp("");
  }

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

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-950">
                <AiOutlineSafety size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Security &amp; 2FA
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Manage additional protection for your Slotify account.
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-6 py-7 sm:px-8">
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <AiOutlineLock size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">
                      Two-factor authentication
                    </h2>

                    {!loadingStatus && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          enabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {enabled
                      ? "Your account requires an additional email verification code when you sign in."
                      : "Add another layer of protection by requiring an email verification code when signing in."}
                  </p>

                  {loadingStatus ? (
                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      Loading security status...
                    </p>
                  ) : !pending ? (
                    <button
                      type="button"
                      onClick={handleRequestChange}
                      disabled={submitting}
                      className={`mt-5 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        enabled
                          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "bg-blue-950 text-white hover:bg-blue-900"
                      }`}
                    >
                      {submitting
                        ? "Please wait..."
                        : enabled
                          ? "Disable 2FA"
                          : "Enable 2FA"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {pending && (
              <form
                onSubmit={handleVerify}
                className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/50 p-5"
              >
                <div className="flex items-start gap-3">
                  <AiOutlineMail
                    size={23}
                    className="mt-0.5 shrink-0 text-blue-950"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Verify your request
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Enter the six-digit code sent to{" "}
                      <span className="font-semibold">
                        {pending.maskedEmail}
                      </span>{" "}
                      to{" "}
                      {pending.action === "ENABLE" ? "enable" : "disable"}{" "}
                      two-factor authentication.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="securityOtp"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Verification code
                  </label>
                  <input
                    id="securityOtp"
                    name="securityOtp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xl font-semibold tracking-[0.45em] text-slate-900 outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelChallenge}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || otp.length !== 6}
                    className="rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Verifying..." : "Verify and save"}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                {enabled ? (
                  <AiOutlineCheckCircle
                    size={20}
                    className="text-emerald-600"
                  />
                ) : (
                  <AiOutlineCloseCircle size={20} className="text-slate-400" />
                )}
                Your security status
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {enabled
                  ? "Two-factor authentication is active. Keep access to your registered email to complete future sign-ins."
                  : "Two-factor authentication is currently off. You can enable it above after confirming access to your registered email."}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <Link
                href="/settings/password"
                className="text-sm font-semibold text-blue-950 transition hover:text-blue-700"
              >
                Manage your password →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}