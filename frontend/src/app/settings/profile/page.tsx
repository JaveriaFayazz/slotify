
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { AiOutlineArrowLeft, AiOutlineUser, AiOutlineSave } from "react-icons/ai";
import {
    getAccountProfile,
    updateAccountProfile
} from "../../services/auth.service";

export default function ProfileSettingsPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        getAccountProfile()
            .then(({ user }) => {
                if (!active) return;
                setName(user.name ?? "");
                setPhone(user.phone ?? "");
                setEmail(user.email ?? "");
                setRole(user.role ?? "");
            })
            .catch((err: Error) => {
                if (active) setError(err.message || "Unable to load your profile.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const result = await updateAccountProfile(name, phone);
            setName(result.user.name);
            setPhone(result.user.phone ?? "");
            setMessage(result.message || "Profile updated successfully.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/dashboard"
                    className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-900"
                >
                    <AiOutlineArrowLeft /> Back to dashboard
                </Link>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-900">
                            <AiOutlineUser />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Profile settings</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Update your personal information.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="py-8 text-sm text-slate-500">Loading your profile...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    maxLength={100}
                                    autoComplete="name"
                                    className={inputClass}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                                    Phone number
                                </label>
                                <input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    maxLength={30}
                                    autoComplete="tel"
                                    className={inputClass}
                                    placeholder="Your phone number"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    value={email}
                                    readOnly
                                    className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Account type
                                </label>
                                <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    {role === "OWNER" ? "Business Owner" : "Customer"}
                                </p>
                            </div>

                            {error && (
                                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            {message && (
                                <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <AiOutlineSave />
                                {saving ? "Saving changes..." : "Save changes"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}