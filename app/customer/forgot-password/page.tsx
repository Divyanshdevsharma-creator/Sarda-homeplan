"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/lib/i18n";

export default function CustomerForgotPasswordPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  // Wizard Steps: 1 = Request, 2 = Verify OTP (for phone) or Check Email (for email), 3 = Reset Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [resetMethod, setResetMethod] = useState<"email" | "mobile">("email");
  const [identifier, setIdentifier] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Clean 10-digit mobile number
  const cleanMobile = identifier.trim().replace(/\D/g, "").slice(-10);

  // Step 1: Send Reset Link or OTP
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage(
        resetMethod === "mobile"
          ? t.invalidPhoneError
          : "Please enter your registered email address."
      );
      return;
    }

    if (resetMethod === "mobile" && cleanMobile.length !== 10) {
      setErrorMessage(t.invalidPhoneError);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    if (resetMethod === "email") {
      try {
        const cleanEmail = identifier.trim().toLowerCase();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${origin}/customer/forgot-password?type=recovery`,
        });

        if (error) {
          if (error.message.toLowerCase().includes("rate limit")) {
            setErrorMessage(t.rateLimitError);
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        setStep(2);
        setSuccessMessage(
          lang === "hi"
            ? "पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है। कृपया अपना इनबॉक्स देखें।"
            : "Password reset link has been sent to your email. Please check your inbox."
        );
      } catch (err: any) {
        setErrorMessage(err?.message || t.networkError);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mobile Reset: Supabase Phone OTP
    if (resetMethod === "mobile") {
      try {
        const formattedPhone = `+91${cleanMobile}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) {
          if (
            error.message?.includes("phone_provider_disabled") ||
            error.message?.includes("Unsupported phone provider")
          ) {
            setErrorMessage(
              lang === "hi"
                ? "एसएमएस गेटवे सेटअप में है। कृपया अपने पंजीकृत ईमेल से रीसेट करें या 9918833851 पर संपर्क करें।"
                : "SMS reset is being configured. Please use your registered Email, or contact support at 9918833851."
            );
          } else if (error.message.toLowerCase().includes("rate limit")) {
            setErrorMessage(t.rateLimitError);
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        setStep(2);
        setResendCountdown(60);
        setSuccessMessage(
          lang === "hi"
            ? `6-अंकों का सत्यापन कोड +91 ******${cleanMobile.slice(-4)} पर भेजा गया है।`
            : `A 6-digit verification code has been sent to +91 ******${cleanMobile.slice(-4)}.`
        );
      } catch (err: any) {
        setErrorMessage(err?.message || t.networkError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Step 2: Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanOtp = otpInput.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setErrorMessage(t.invalidOtpError);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const formattedPhone = `+91${cleanMobile}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: cleanOtp,
        type: "sms",
      });

      if (error) {
        if (error.message.toLowerCase().includes("expired")) {
          setErrorMessage(t.expiredOtpError);
        } else {
          setErrorMessage(t.invalidOtpError);
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        setStep(3);
      } else {
        setErrorMessage(t.networkError);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage(t.passwordMinLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setStep(4);
    } catch (err: any) {
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5ed] text-[#17221b] p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      {/* HEADER */}
      <header className="mx-auto w-full max-w-xl flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition"
          aria-label="Back to Homepage"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs border border-[#d9b45a]/30">
            <Image
              src="/sarda-logo.png"
              alt="Sarda Homeplan"
              width={80}
              height={80}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-base font-bold text-[#063b2c] group-hover:text-[#0b5c46] transition">
              SARDA HOMEPLAN
            </div>
            <p className="text-[9px] font-semibold text-[#9b7732] tracking-wider">
              {t.brandTagline}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => router.push("/customer/login")}
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#17221b] hover:bg-white transition"
        >
          <ArrowLeft size={14} />
          <span>{lang === "hi" ? "लॉगिन पृष्ठ" : "Back to Login"}</span>
        </button>
      </header>

      {/* MAIN CARD */}
      <div className="mx-auto my-auto w-full max-w-md rounded-3xl border border-[#ded9cf] bg-white p-6 sm:p-8 shadow-sm">
        {/* STEP 1: REQUEST */}
        {step === 1 && (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead0] text-[#8c6710]">
                <Lock size={24} />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#063b2c]">
                {lang === "hi" ? "पासवर्ड रीसेट करें" : "Reset Password"}
              </h2>
              <p className="mt-1 text-xs text-black/55">
                {lang === "hi"
                  ? "अपना पंजीकृत ईमेल या मोबाइल नंबर दर्ज करें"
                  : "Enter your registered email or Indian mobile number"}
              </p>
            </div>

            {/* METHOD TOGGLE */}
            <div className="mt-5 flex rounded-xl bg-[#f6f3ec] p-1">
              <button
                type="button"
                onClick={() => {
                  setResetMethod("email");
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  resetMethod === "email"
                    ? "bg-white text-[#063b2c] shadow-xs"
                    : "text-black/45 hover:text-black/70"
                }`}
              >
                {t.emailTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMethod("mobile");
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  resetMethod === "mobile"
                    ? "bg-white text-[#063b2c] shadow-xs"
                    : "text-black/45 hover:text-black/70"
                }`}
              >
                {t.mobileTab}
              </button>
            </div>

            <form onSubmit={handleSendReset} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#17221b]">
                  {resetMethod === "email" ? t.emailLabel : t.mobileLabel}
                </label>
                <div className="relative">
                  {resetMethod === "email" ? (
                    <>
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
                      />
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@example.com"
                        className="h-[46px] w-full rounded-xl border border-[#ded9cf] bg-white pl-10 pr-4 text-xs outline-none focus:border-[#063b2c] focus:ring-1 focus:ring-[#063b2c]"
                      />
                    </>
                  ) : (
                    <>
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#063b2c]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t.mobilePlaceholder}
                        className="h-[46px] w-full rounded-xl border border-[#ded9cf] bg-white pl-12 pr-4 text-xs outline-none focus:border-[#063b2c] focus:ring-1 focus:ring-[#063b2c]"
                      />
                    </>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#063b2c] text-xs font-bold text-white shadow-sm hover:bg-[#0a4d38] transition disabled:opacity-60"
              >
                {isLoading ? (
                  t.processingBtn
                ) : (
                  <>
                    <span>
                      {resetMethod === "email"
                        ? lang === "hi"
                          ? "रीसेट लिंक भेजें"
                          : "Send Reset Link"
                        : t.sendOtpBtn}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFICATION OR EMAIL SENT NOTICE */}
        {step === 2 && (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5ea] text-[#1c7430]">
                {resetMethod === "email" ? <Mail size={24} /> : <ShieldCheck size={24} />}
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#063b2c]">
                {resetMethod === "email"
                  ? lang === "hi"
                    ? "ईमेल देखें"
                    : "Check Your Email"
                  : t.verifyMobileTitle}
              </h2>
              <p className="mt-1 text-xs text-black/55">
                {successMessage}
              </p>
            </div>

            {resetMethod === "mobile" ? (
              <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#17221b]">
                    {t.enterOtpLabel}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder={t.otpPlaceholder}
                    autoFocus
                    className="h-[48px] w-full rounded-xl border border-[#ded9cf] bg-white text-center font-mono text-2xl font-bold tracking-[0.4em] outline-none focus:border-[#063b2c]"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#063b2c] text-xs font-bold text-white shadow-sm hover:bg-[#0a4d38] transition disabled:opacity-60"
                >
                  {isLoading ? t.processingBtn : t.verifyAndContinueBtn}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage("");
                    }}
                    className="text-xs font-semibold text-[#063b2c] hover:underline"
                  >
                    ← {t.changeMobileBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => router.push("/customer/login")}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#063b2c] text-xs font-bold text-white shadow-sm hover:bg-[#0a4d38] transition"
                >
                  {t.loginBtn}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage("");
                    }}
                    className="text-xs text-black/55 hover:underline"
                  >
                    ← {lang === "hi" ? "दूसरा ईमेल प्रयास करें" : "Try another email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: ENTER NEW PASSWORD */}
        {step === 3 && (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5ea] text-[#1c7430]">
                <Lock size={24} />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#063b2c]">
                {lang === "hi" ? "नया पासवर्ड बनाएं" : "Set New Password"}
              </h2>
              <p className="mt-1 text-xs text-black/55">
                {lang === "hi"
                  ? "कम से कम 6 अक्षरों का एक मजबूत पासवर्ड चुनें"
                  : "Choose a secure password of at least 6 characters"}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#17221b]">
                  {lang === "hi" ? "नया पासवर्ड" : "New Password"}
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-[46px] w-full rounded-xl border border-[#ded9cf] bg-white pl-10 pr-10 text-xs outline-none focus:border-[#063b2c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#17221b]">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-[46px] w-full rounded-xl border border-[#ded9cf] bg-white pl-10 pr-10 text-xs outline-none focus:border-[#063b2c]"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#063b2c] text-xs font-bold text-white shadow-sm hover:bg-[#0a4d38] transition disabled:opacity-60"
              >
                {isLoading ? t.processingBtn : t.saveChanges}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="mt-3 font-serif text-2xl font-bold text-[#063b2c]">
              {lang === "hi" ? "पासवर्ड अपडेट हो गया!" : "Password Updated!"}
            </h2>
            <p className="mt-1 text-xs text-black/60 max-w-xs mx-auto">
              {lang === "hi"
                ? "आपका नया पासवर्ड सुरक्षित रूप से सहेज लिया गया है। अब आप लॉगिन कर सकते हैं।"
                : "Your password has been securely updated. You can now login with your new credentials."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/customer/login")}
              className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#063b2c] text-xs font-bold text-[#f4cf72] shadow-sm hover:bg-[#0a4d38] transition"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="text-center text-[11px] text-black/40 py-2">
        © {new Date().getFullYear()} Sarda Homeplan. All rights reserved.
      </footer>
    </main>
  );
}
