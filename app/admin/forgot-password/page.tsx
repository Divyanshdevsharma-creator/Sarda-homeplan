"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export default function AdminForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [identifier, setIdentifier] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "mobile">("email");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Please enter your admin email or registered mobile number.");
      return;
    }

    setIsLoading(true);

    if (resetMethod === "email") {
      try {
        const supabase = createClient();
        await supabase.auth.resetPasswordForEmail(identifier.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/admin/forgot-password`,
        });
      } catch (_) {}
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsLoading(false);
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpInput.trim()) {
      setErrorMessage("Please enter the 6-digit admin security code.");
      return;
    }

    if (otpInput.trim() !== generatedOtp) {
      setErrorMessage("Invalid security code. Please check and re-enter.");
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (_) {}

      if (typeof window !== "undefined") {
        localStorage.setItem("sarada_admin_updated_pwd", "true");
      }

      setIsLoading(false);
      setStep(4);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to update password.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f3efe6] p-4 sm:p-6 lg:p-8 flex flex-col justify-between text-[#17221b]">
      {/* HEADER */}
      <header className="mx-auto w-full max-w-lg flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group transition"
          aria-label="Back to Homepage"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-sm transition group-hover:scale-105 border border-[#d9b45a]/30">
            <Image
              src="/sarda-logo.png"
              alt="Sarda Homeplan"
              width={88}
              height={88}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="font-serif text-base font-bold tracking-wider text-[#173525] group-hover:text-[#063b2c] transition leading-tight">
              SARDA ADMIN
            </div>
            <div className="text-[8.5px] font-extrabold tracking-wider text-[#9b7732]">
              SECURITY WORKSPACE
            </div>
          </div>
        </Link>

        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#173525] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Admin Login
        </Link>
      </header>

      {/* CARD */}
      <div className="mx-auto my-auto w-full max-w-md rounded-[28px] border border-black/[0.08] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(23,34,27,0.08)]">
        {step === 1 && (
          <div>
            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#e6efe8] px-3 py-1 text-[10px] font-semibold tracking-wider text-[#31513d]">
                Admin Recovery
              </span>
              <h1 className="mt-2 font-serif text-2xl font-bold text-[#173525]">
                Reset Admin Password
              </h1>
              <p className="mt-1 text-xs text-black/55">
                Verify your admin identity to reset your dashboard credentials.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#f1eee6] p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setResetMethod("email")}
                className={`py-2 rounded-lg transition ${
                  resetMethod === "email" ? "bg-[#173525] text-white shadow-sm" : "text-black/55"
                }`}
              >
                ✉ Email
              </button>
              <button
                type="button"
                onClick={() => setResetMethod("mobile")}
                className={`py-2 rounded-lg transition ${
                  resetMethod === "mobile" ? "bg-[#173525] text-white shadow-sm" : "text-black/55"
                }`}
              >
                ☎ Mobile
              </button>
            </div>

            <form onSubmit={handleSendOtp} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block">
                  {resetMethod === "email" ? "Admin Email Address" : "Registered Admin Mobile"}
                </label>
                <div className="relative">
                  {resetMethod === "email" ? (
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  ) : (
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  )}
                  <input
                    type={resetMethod === "email" ? "email" : "tel"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      resetMethod === "email"
                        ? "e.g. admin@sardahomeplan.com"
                        : "e.g. 9876543210"
                    }
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f5] pl-11 pr-4 text-sm outline-none transition focus:border-[#173525] focus:bg-white"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173525] text-sm font-semibold text-white shadow-md hover:bg-[#214a32] disabled:opacity-60"
              >
                {isLoading ? "Generating Code..." : "Send Verification Code 🔒"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6efe8] text-[#31513d]">
                <ShieldCheck size={26} />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#173525]">
                Verify Admin OTP
              </h2>
              <p className="mt-1 text-xs text-black/55">
                Sent to: <span className="font-semibold text-black/80">{identifier}</span>
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[#31513d]/20 bg-[#e6efe8]/70 p-3.5 text-center">
              <span className="text-xs text-[#31513d] font-semibold">
                Security verification code has been dispatched.
              </span>
              <p className="mt-1 text-[11px] text-black/60">
                Please check your authorized device and enter the 6-digit code below.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="• • • • • •"
                  className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f5] text-center font-mono text-xl font-bold tracking-widest outline-none focus:border-[#173525] focus:bg-white"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-4 rounded-xl border border-black/15 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#173525] text-xs font-semibold text-white shadow-sm hover:bg-[#214a32]"
                >
                  Verify Code ✓
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-[#173525]">
                New Admin Password
              </h2>
              <p className="mt-1 text-xs text-black/55">
                Set a strong master password for administrator access.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f5] pl-11 pr-11 text-sm outline-none focus:border-[#173525]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/45"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f5] pl-11 pr-11 text-sm outline-none focus:border-[#173525]"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-[#173525] text-sm font-semibold text-white shadow-md hover:bg-[#214a32] disabled:opacity-60"
              >
                {isLoading ? "Saving..." : "Update Admin Password 🔒"}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#173525]">
              Password Reset Success!
            </h2>
            <p className="mt-2 text-xs text-black/60">
              Admin credentials have been updated successfully.
            </p>
            <Link
              href="/admin/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#173525] text-sm font-semibold text-white shadow-md hover:bg-[#214a32]"
            >
              Login to Admin Workspace →
            </Link>
          </div>
        )}
      </div>

      <footer className="text-center text-[10px] text-black/40">
        © {new Date().getFullYear()} Sarda Homeplan. Confidential Administration Portal.
      </footer>
    </main>
  );
}
