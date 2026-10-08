"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  Globe,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/lib/i18n";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [mobileAuthType, setMobileAuthType] = useState<"otp" | "password">("otp");

  // Phone OTP State
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Email confirmation state
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResendingConfirmEmail, setIsResendingConfirmEmail] = useState(false);
  const [resendEmailSuccess, setResendEmailSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Check URL params for error messages from OAuth callback or redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        if (urlError.includes("provider is not enabled")) {
          setErrorMessage(t.googleOauthDisabledMsg);
        } else {
          setErrorMessage(decodeURIComponent(urlError));
        }
      }

      // Check if user is already authenticated
      const checkExistingSession = async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            router.replace("/customer/dashboard");
          }
        } catch (_) {}
      };
      checkExistingSession();
    }
  }, [router, t.googleOauthDisabledMsg]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  const getTargetUrl = () => {
    if (typeof window !== "undefined") {
      const nextParam = new URLSearchParams(window.location.search).get("next");
      if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/customer/login")) {
        return nextParam;
      }
    }
    return "/customer/dashboard";
  };

  const persistCustomerSession = (payload: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sarda_customer_session", JSON.stringify(payload));
      localStorage.setItem("sarada_customer_session", JSON.stringify(payload));
      localStorage.setItem("sarda_customer_logged_in", "true");
      localStorage.setItem("sarada_customer_logged_in", "true");

      document.cookie = "sarda_customer_logged_in=true; path=/; max-age=604800; SameSite=Lax";
      document.cookie = "sarada_customer_logged_in=true; path=/; max-age=604800; SameSite=Lax";
    }
  };

  // Helper to extract clean 10-digit Indian phone
  const cleanPhoneDigits = (raw: string): string => {
    const digits = raw.trim().replace(/\D/g, "");
    return digits.slice(-10);
  };

  // Send OTP via Supabase Phone Auth
  const handleSendOtp = async () => {
    setErrorMessage("");
    const cleanMobile = cleanPhoneDigits(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage(t.invalidPhoneError);
      return;
    }

    const formattedPhone = `+91${cleanMobile}`;
    setIsSendingOtp(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        if (
          error.message?.includes("phone_provider_disabled") ||
          error.message?.includes("Unsupported phone provider")
        ) {
          setErrorMessage(t.phoneProviderDisabledMsg);
        } else if (
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many")
        ) {
          setErrorMessage(t.rateLimitError);
        } else {
          setErrorMessage(error.message || t.networkError);
        }
        setIsSendingOtp(false);
        return;
      }

      setOtpSent(true);
      setResendCountdown(60);
      setOtpInput("");
      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP via Supabase Phone Auth
  const handleVerifyOtp = async () => {
    setErrorMessage("");
    const cleanMobile = cleanPhoneDigits(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage(t.invalidPhoneError);
      return;
    }

    const cleanOtp = otpInput.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setErrorMessage(t.invalidOtpError);
      return;
    }

    const formattedPhone = `+91${cleanMobile}`;
    setIsVerifyingOtp(true);
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: cleanOtp,
        type: "sms",
      });

      if (error) {
        if (error.message?.toLowerCase().includes("expired")) {
          setErrorMessage(t.expiredOtpError);
        } else if (error.message?.toLowerCase().includes("invalid")) {
          setErrorMessage(t.invalidOtpError);
        } else {
          setErrorMessage(error.message || t.invalidOtpError);
        }
        setIsVerifyingOtp(false);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const authUser = data.user;
        let customerName = authUser.user_metadata?.full_name || "Customer";
        let userCity = "";
        let userDistrict = "";

        // Query customer_profiles table in Supabase
        try {
          const { data: prof } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

          if (prof) {
            customerName = prof.full_name || customerName;
            userCity = prof.village_city || "";
            userDistrict = prof.district || "";
          } else {
            const { data: profByMobile } = await supabase
              .from("customer_profiles")
              .select("*")
              .eq("mobile", cleanMobile)
              .maybeSingle();

            if (profByMobile) {
              customerName = profByMobile.full_name || customerName;
              userCity = profByMobile.village_city || "";
              userDistrict = profByMobile.district || "";
            } else {
              // Create initial profile in customer_profiles
              await supabase.from("customer_profiles").insert({
                id: authUser.id,
                full_name: customerName,
                mobile: cleanMobile,
                village_city: "",
                district: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        } catch (_) {}

        const sessionPayload = {
          id: authUser.id,
          full_name: customerName,
          mobile: cleanMobile,
          email: authUser.email || `${cleanMobile}@sardahomeplan.com`,
          village_city: userCity,
          district: userDistrict,
          logged_in_at: new Date().toISOString(),
        };

        persistCustomerSession(sessionPayload);
        setIsVerifyingOtp(false);
        setIsLoading(false);
        router.push(getTargetUrl());
        return;
      }

      setErrorMessage(t.invalidOtpError);
    } catch (err: any) {
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setIsVerifyingOtp(false);
      setIsLoading(false);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const supabase = createClient();

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const targetNext = getTargetUrl();
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(targetNext)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        if (
          error.message?.includes("provider is not enabled") ||
          error.message?.includes("validation_failed")
        ) {
          setErrorMessage(t.googleOauthDisabledMsg);
        } else {
          setErrorMessage(`Google OAuth: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMessage(t.googleOauthDisabledMsg);
      setIsLoading(false);
    }
  };

  // Resend confirmation email handler
  const handleResendConfirmationEmail = async () => {
    if (!unconfirmedEmail) return;
    setIsResendingConfirmEmail(true);
    setResendEmailSuccess("");
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
      });
      if (error) {
        if (error.message?.toLowerCase().includes("rate limit")) {
          setErrorMessage(t.rateLimitError);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setResendEmailSuccess(t.confirmationEmailSentMsg);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setIsResendingConfirmEmail(false);
    }
  };

  // Main Form Submit Handler
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setUnconfirmedEmail(null);
    setResendEmailSuccess("");

    // 1. Mobile OTP Login
    if (loginMethod === "mobile" && mobileAuthType === "otp") {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      await handleVerifyOtp();
      return;
    }

    // 2. Mobile Password Login
    if (loginMethod === "mobile" && mobileAuthType === "password") {
      const cleanMobile = cleanPhoneDigits(mobile);
      if (cleanMobile.length !== 10) {
        setErrorMessage(t.invalidPhoneError);
        return;
      }
      if (!password) {
        setErrorMessage(t.passwordLabel + " is required.");
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      // Try with mobile alias
      const phoneEmail = `${cleanMobile}@sardahomeplan.com`;
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password,
      });

      // Fallback for previous domain accounts
      if (authError) {
        const fallbackRes = await supabase.auth.signInWithPassword({
          email: `${cleanMobile}@saradahomeplan.com`,
          password,
        });
        if (!fallbackRes.error && fallbackRes.data?.user) {
          authData = fallbackRes.data;
          authError = null;
        }
      }

      if (!authError && authData?.user) {
        const user = authData.user;
        const sessionPayload = {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Customer",
          mobile: cleanMobile,
          email: phoneEmail,
          logged_in_at: new Date().toISOString(),
        };
        persistCustomerSession(sessionPayload);
        setIsLoading(false);
        router.push(getTargetUrl());
        return;
      }

      setErrorMessage(t.invalidCredentialsError);
      setIsLoading(false);
      return;
    }

    // 3. Email / Mobile Number with Password Login
    if (loginMethod === "email") {
      const rawInput = emailOrPhone.trim();
      if (!rawInput) {
        setErrorMessage(t.emailLabel + " is required.");
        return;
      }
      if (!password) {
        setErrorMessage(t.passwordLabel + " is required.");
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      // Check if user input is an Indian mobile number
      const isMobileNumber =
        /^(?:\+?91)?[6-9]\d{9}$/.test(rawInput.replace(/[\s-]/g, "")) ||
        (/^\d{10}$/.test(rawInput.replace(/\D/g, "")));

      let primaryEmail = rawInput.toLowerCase();
      let fallbackEmail: string | null = null;

      if (isMobileNumber) {
        const cleanMobile = cleanPhoneDigits(rawInput);
        primaryEmail = `${cleanMobile}@sardahomeplan.com`;
        fallbackEmail = `${cleanMobile}@saradahomeplan.com`;
      }

      // First attempt
      let { data: authData, error } = await supabase.auth.signInWithPassword({
        email: primaryEmail,
        password,
      });

      // If mobile alias had fallback domain
      if (error && fallbackEmail) {
        const fallbackRes = await supabase.auth.signInWithPassword({
          email: fallbackEmail,
          password,
        });
        if (!fallbackRes.error && fallbackRes.data?.user) {
          authData = fallbackRes.data;
          error = null;
        }
      }

      if (error) {
        const errorLower = error.message.toLowerCase();
        if (errorLower.includes("email not confirmed")) {
          setUnconfirmedEmail(primaryEmail);
          setErrorMessage(t.emailNotConfirmedError);
        } else if (
          errorLower.includes("invalid login credentials") ||
          errorLower.includes("invalid_grant")
        ) {
          setErrorMessage(t.invalidCredentialsError);
        } else if (errorLower.includes("rate limit") || errorLower.includes("too many")) {
          setErrorMessage(t.rateLimitError);
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData?.user) {
        const user = authData.user;
        const metadata = user.user_metadata || {};

        // Query customer_profiles for full name & data
        let profileName = metadata.full_name || "Customer";
        let userMobile = metadata.mobile || "";
        let userCity = metadata.village_city || "";
        let userDistrict = metadata.district || "";

        try {
          const { data: prof } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (prof) {
            profileName = prof.full_name || profileName;
            userMobile = prof.mobile || userMobile;
            userCity = prof.village_city || userCity;
            userDistrict = prof.district || userDistrict;
          }
        } catch (_) {}

        const sessionPayload = {
          id: user.id,
          full_name: profileName,
          email: user.email || primaryEmail,
          mobile: userMobile,
          village_city: userCity,
          district: userDistrict,
          logged_in_at: new Date().toISOString(),
        };

        persistCustomerSession(sessionPayload);
        setIsLoading(false);
        router.push(getTargetUrl());
        return;
      }

      setIsLoading(false);
      setErrorMessage(t.invalidCredentialsError);
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto lg:h-[100dvh] lg:overflow-hidden bg-[#f8f5ed] text-[#17221b]">
      <div className="grid min-h-screen lg:h-full min-h-0 lg:grid-cols-2">

        {/* =====================================================
            LEFT — LOGIN FORM
        ===================================================== */}
        <section className="relative flex min-h-screen lg:min-h-0 lg:h-full items-center justify-center overflow-y-auto lg:overflow-hidden bg-[#fbfaf6] px-4 py-8 sm:px-8 lg:px-10">

          <div className="relative z-10 w-full max-w-[480px]">

            {/* TOP BAR: BRAND LOGO + LANGUAGE SELECTOR */}
            <div className="mb-5 flex items-center justify-between">

              {/* LOGO */}
              <Link
                href="/"
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="flex items-center gap-2.5 group transition"
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

                <div className="leading-tight">
                  <div className="font-serif text-[17px] font-bold tracking-wide text-[#063b2c] group-hover:text-[#0b5c46] transition">
                    SARDA HOMEPLAN
                  </div>
                  <p className="text-[9px] font-semibold tracking-wider text-[#9b7732]">
                    {t.brandTagline}
                  </p>
                </div>
              </Link>

              {/* FUNCTIONAL LANGUAGE SELECTOR */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition hover:border-[#063b2c]/40 text-[#17221b]"
                  aria-expanded={langMenuOpen}
                >
                  <Globe size={14} className="text-[#063b2c]" />
                  <span>{lang === "hi" ? "हिन्दी" : "English"}</span>
                  <span className="text-[10px] text-black/50">⌄</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 w-32 rounded-xl border border-[#ded9cf] bg-white p-1 shadow-lg z-30 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setLang("en");
                        setLangMenuOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
                        lang === "en"
                          ? "bg-[#063b2c] text-[#f4cf72] font-bold"
                          : "text-black/75 hover:bg-[#faf8f4]"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLang("hi");
                        setLangMenuOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
                        lang === "hi"
                          ? "bg-[#063b2c] text-[#f4cf72] font-bold"
                          : "text-black/75 hover:bg-[#faf8f4]"
                      }`}
                    >
                      हिन्दी (Hindi)
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* =================================================
                LOGIN CARD
            ================================================= */}
            <div className="rounded-[27px] border border-[#e5ded2] bg-white/95 px-6 py-5 shadow-[0_15px_45px_rgba(23,34,27,0.07)] backdrop-blur-sm sm:px-9 sm:py-6">

              {/* Heading */}
              <div className="text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-[#9b7732]">
                  {t.welcomeBack}
                </p>

                <h2 className="mt-1 font-serif text-[28px] font-semibold leading-tight text-[#063b2c] sm:text-[32px]">
                  {t.customerLogin}
                </h2>

                <div className="mx-auto mt-2 flex items-center justify-center gap-2">
                  <span className="h-px w-12 bg-[#d9c49a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b08a3e]" />
                  <span className="h-px w-12 bg-[#d9c49a]" />
                </div>

                <p className="mt-2.5 text-xs text-black/55 sm:text-sm">
                  {t.loginSubtitle}
                </p>
              </div>

              {/* LOGIN METHOD TABS: EMAIL VS MOBILE */}
              <div className="mt-4 flex rounded-xl bg-[#f6f3ec] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setErrorMessage("");
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    loginMethod === "email"
                      ? "bg-white text-[#063b2c] shadow-xs"
                      : "text-black/45 hover:text-black/70"
                  }`}
                >
                  {t.emailTab}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("mobile");
                    setErrorMessage("");
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    loginMethod === "mobile"
                      ? "bg-white text-[#063b2c] shadow-xs"
                      : "text-black/45 hover:text-black/70"
                  }`}
                >
                  {t.mobileTab}
                </button>
              </div>

              <form onSubmit={handleLogin} className="mt-4">

                {/* MOBILE SUB-TOGGLE: OTP VS PASSWORD */}
                {loginMethod === "mobile" && (
                  <div className="mb-3.5 flex rounded-lg bg-[#efece4] p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileAuthType("otp");
                        setErrorMessage("");
                      }}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                        mobileAuthType === "otp"
                          ? "bg-white text-[#063b2c] shadow-xs"
                          : "text-black/50"
                      }`}
                    >
                      {t.loginViaOtp}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileAuthType("password");
                        setErrorMessage("");
                      }}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                        mobileAuthType === "password"
                          ? "bg-white text-[#063b2c] shadow-xs"
                          : "text-black/50"
                      }`}
                    >
                      {t.loginViaPassword}
                    </button>
                  </div>
                )}

                {/* EMAIL / PHONE INPUT */}
                {loginMethod === "email" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#17221b]">
                      {t.emailLabel}
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
                      />

                      <input
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        autoComplete="username"
                        className="h-[48px] w-full rounded-xl border border-[#dcd7cf] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                      />
                    </div>
                  </div>
                )}

                {/* MOBILE NUMBER INPUT */}
                {loginMethod === "mobile" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#17221b]">
                      {t.mobileLabel}
                    </label>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#063b2c]">
                        +91
                      </span>

                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder={t.mobilePlaceholder}
                        autoComplete="tel"
                        disabled={otpSent}
                        className="h-[48px] w-full rounded-xl border border-[#dcd7cf] bg-white pl-12 pr-28 text-sm outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10 disabled:bg-[#f3f0e8] disabled:text-black/60"
                      />

                      {mobileAuthType === "otp" && !otpSent && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#063b2c] px-3 py-1.5 text-xs font-semibold text-[#f4cf72] shadow-xs hover:bg-[#0a4b39] disabled:opacity-60 transition"
                        >
                          {isSendingOtp ? t.processingBtn : t.sendOtpBtn}
                        </button>
                      )}

                      {mobileAuthType === "otp" && otpSent && (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpInput("");
                            setErrorMessage("");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#eee8dc] px-2.5 py-1 text-xs font-semibold text-[#063b2c] hover:bg-[#e2d9c8] transition"
                        >
                          {t.changeMobileBtn}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 6-DIGIT OTP VERIFICATION CARD */}
                {loginMethod === "mobile" && mobileAuthType === "otp" && otpSent && (
                  <div className="mt-4 space-y-3.5 rounded-2xl border border-[#063b2c]/20 bg-gradient-to-b from-[#f5f8f5] to-[#fbfaf6] p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#063b2c]">
                        <ShieldCheck size={16} />
                        <span>{t.verifyMobileTitle}</span>
                      </div>
                      <span className="rounded-full bg-[#063b2c]/10 px-2 py-0.5 text-[11px] font-semibold text-[#063b2c]">
                        {t.smsSentBadge}
                      </span>
                    </div>

                    <p className="text-xs text-black/65 leading-relaxed">
                      {t.enterOtpPrompt}{" "}
                      <span className="font-semibold text-[#17221b]">
                        +91 ******{cleanPhoneDigits(mobile).slice(-4)}
                      </span>
                    </p>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#17221b]">
                        {t.enterOtpLabel}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) =>
                          setOtpInput(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder={t.otpPlaceholder}
                        autoFocus
                        className="h-[50px] w-full rounded-xl border border-[#dcd7cf] bg-white text-center font-mono text-2xl font-bold tracking-[0.4em] text-[#17221b] outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5">
                      <span className="text-black/50">{t.didNotReceiveSms}</span>
                      {resendCountdown > 0 ? (
                        <span className="font-medium text-black/45">
                          {t.resendOtpIn} {resendCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="font-semibold text-[#063b2c] hover:underline"
                        >
                          {isSendingOtp ? t.processingBtn : t.resendOtpBtn}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PASSWORD (For Email OR Mobile with Password) */}
                {(loginMethod === "email" || (loginMethod === "mobile" && mobileAuthType === "password")) && (
                  <div className="mt-3.5">
                    <label className="mb-1.5 block text-xs font-semibold text-[#17221b]">
                      {t.passwordLabel}
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        autoComplete="current-password"
                        className="h-[48px] w-full rounded-xl border border-[#dcd7cf] bg-white pl-11 pr-11 text-sm outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/45 transition hover:text-[#063b2c]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* OPTIONS: REMEMBER ME & FORGOT PASSWORD */}
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#17221b]/80">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 accent-[#063b2c]"
                    />
                    {t.rememberMe}
                  </label>

                  <Link
                    href="/customer/forgot-password"
                    className="text-xs font-medium text-[#063b2c] hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>

                {/* ERROR MESSAGE DISPLAY */}
                {errorMessage && (
                  <div className="mt-3.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <div>{errorMessage}</div>
                    </div>
                    {unconfirmedEmail && (
                      <div className="pt-2 border-t border-red-200/60 mt-1 flex items-center justify-between">
                        <span className="text-[11px] text-red-850">
                          {unconfirmedEmail}
                        </span>
                        <button
                          type="button"
                          onClick={handleResendConfirmationEmail}
                          disabled={isResendingConfirmEmail}
                          className="font-bold underline text-red-800 hover:text-red-900 disabled:opacity-50"
                        >
                          {isResendingConfirmEmail ? t.processingBtn : t.resendConfirmationEmailBtn}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* RESEND EMAIL SUCCESS */}
                {resendEmailSuccess && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>{resendEmailSuccess}</span>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full bg-[#063b2c] text-sm font-semibold text-white shadow-lg shadow-[#063b2c]/10 transition hover:bg-[#0a4b39] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    t.processingBtn
                  ) : loginMethod === "mobile" && mobileAuthType === "otp" ? (
                    otpSent ? (
                      <>
                        {t.verifyAndContinueBtn}
                        <ArrowRight size={17} />
                      </>
                    ) : (
                      <>
                        {t.sendOtpBtn} 📲
                        <ArrowRight size={17} />
                      </>
                    )
                  ) : (
                    <>
                      {t.loginBtn}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* DIVIDER */}
                <div className="my-4 flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/10" />
                  <span className="text-[10px] font-medium text-black/40">
                    {t.orDivider}
                  </span>
                  <div className="h-px flex-1 bg-black/10" />
                </div>

                {/* GOOGLE OAUTH */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex h-[46px] w-full items-center justify-center gap-3 rounded-full border border-[#dcd7cf] bg-white text-sm font-semibold text-[#17221b] transition hover:bg-[#f8f6f0] disabled:opacity-60"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {t.continueWithGoogle}
                </button>

                {/* SIGN UP LINK */}
                <p className="mt-4 text-center text-xs text-black/55">
                  {t.noAccountPrompt}{" "}
                  <Link
                    href="/customer/signup"
                    className="font-semibold text-[#063b2c] hover:underline"
                  >
                    {t.createAccountLink}
                  </Link>
                  <ArrowRight size={13} className="ml-1 inline text-[#063b2c]" />
                </p>

              </form>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — BRAND SHOWCASE
        ===================================================== */}
        <section className="relative hidden h-full min-h-0 overflow-hidden bg-[#063b2c] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/customer-login-bg.png')",
            }}
          />
          <div className="absolute inset-0 bg-[#063b2c]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#063b2c]/85 via-[#063b2c]/35 to-transparent" />

          <div className="relative z-10 flex h-full items-center px-10 xl:px-14">
            <div className="max-w-[470px]">
              <p className="font-serif text-[32px] italic leading-tight text-white xl:text-[38px]">
                {t.dreamHomeQuote1}
              </p>

              <h3 className="mt-1 font-serif text-[46px] font-semibold leading-[0.98] text-white xl:text-[54px]">
                {t.dreamHomeQuote2}
                <span className="block text-[#e1c681]">
                  {t.dreamHomeQuoteHighlight}
                </span>
              </h3>

              <div className="mt-5 h-1 w-20 rounded-full bg-[#d9b45a]" />

              <p className="mt-4 text-sm leading-relaxed text-white/80 xl:text-base">
                {t.dreamHomeDesc}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}