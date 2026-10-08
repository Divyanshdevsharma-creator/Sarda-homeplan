"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/lib/i18n";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [villageCity, setVillageCity] = useState("");
  const [district, setDistrict] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !villageCity.trim() ||
      !district.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(t.fillRequiredFieldsError);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    const cleanMobile = mobile.trim().replace(/\D/g, "").slice(-10);
    if (cleanMobile.length < 10) {
      setError(t.invalidPhoneError);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    // 1. Clear any lingering previous user session
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("sarda_customer_session");
        localStorage.removeItem("sarda_customer_logged_in");
        localStorage.removeItem("sarada_customer_session");
        localStorage.removeItem("sarada_customer_logged_in");
      }
    } catch (_) {}

    const cleanEmail = email.trim() ? email.trim().toLowerCase() : `${cleanMobile}@sardahomeplan.com`;

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            mobile: cleanMobile,
            village_city: villageCity.trim(),
            district: district.trim(),
          },
        },
      });

      if (signupError) {
        if (
          signupError.message.toLowerCase().includes("already registered") ||
          signupError.message.toLowerCase().includes("user already")
        ) {
          setError(
            lang === "hi"
              ? "इस ईमेल/मोबाइल से पहले से खाता मौजूद है। कृपया लॉगिन करें।"
              : "An account with this email/mobile already exists. Please login instead."
          );
        } else if (signupError.message.toLowerCase().includes("rate limit")) {
          setError(t.rateLimitError);
        } else {
          setError(signupError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!signupData.user) {
        setError(t.networkError);
        setIsLoading(false);
        return;
      }

      const realUserId = signupData.user.id;

      // 2. Create customer profile in customer_profiles table in Supabase
      const fullProfilePayload = {
        id: realUserId,
        full_name: fullName.trim(),
        mobile: cleanMobile,
        village_city: villageCity.trim(),
        district: district.trim(),
        state: "Bihar",
        property_type: "Residential Plot",
        preferred_language: lang === "hi" ? "Hindi" : "English",
        updated_at: new Date().toISOString(),
      };

      const { error: profErr } = await supabase
        .from("customer_profiles")
        .upsert(fullProfilePayload);

      if (profErr) {
        // Fallback to base columns that exist on customer_profiles
        try {
          await supabase.from("customer_profiles").upsert({
            id: realUserId,
            full_name: fullName.trim(),
            mobile: cleanMobile,
            village_city: villageCity.trim(),
            district: district.trim(),
            updated_at: new Date().toISOString(),
          });
        } catch (_) {}
      }

      // 3. Sign in to establish active session
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      } catch (loginErr) {
        console.warn("Auto sign-in notice:", loginErr);
      }

      // 4. Persist session for instant seamless dashboard entry
      const sessionPayload = {
        id: realUserId,
        full_name: fullName.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        village_city: villageCity.trim(),
        district: district.trim(),
        logged_in_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("sarda_customer_session", JSON.stringify(sessionPayload));
        localStorage.setItem("sarada_customer_session", JSON.stringify(sessionPayload));
        localStorage.setItem("sarda_customer_logged_in", "true");
        localStorage.setItem("sarada_customer_logged_in", "true");
        document.cookie = "sarda_customer_logged_in=true; path=/; max-age=604800; SameSite=Lax";
        document.cookie = "sarada_customer_logged_in=true; path=/; max-age=604800; SameSite=Lax";
      }

      setMessage(t.accountCreatedSuccess);

      // Immediate redirect to customer dashboard
      setTimeout(() => {
        router.push("/customer/dashboard");
      }, 600);
    } catch (err: any) {
      console.error("Signup exception:", err);
      setError(err?.message || t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f5f1e8] text-[#17221b]">
      {/* ================= HEADER ================= */}
      <header className="flex h-[72px] items-center justify-between px-5 sm:px-7 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
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

          <div className="leading-none">
            <div className="font-serif text-[20px] font-bold tracking-wide text-[#123f31] group-hover:text-[#0b5c46] transition">
              SARDA
            </div>

            <div className="mt-1 text-[8px] font-extrabold tracking-[0.35em] text-[#a97920]">
              HOMEPLAN
            </div>
          </div>
        </Link>

        {/* RIGHT CONTROLS: LANGUAGE SELECTOR + BACK BUTTON */}
        <div className="flex items-center gap-2.5">
          {/* FUNCTIONAL LANGUAGE SELECTOR */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-full border border-[#173f32]/20 bg-white/80 px-3.5 py-2 text-xs font-semibold shadow-xs transition hover:border-[#063b2c]/40 text-[#17221b]"
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

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-full border border-[#173f32]/25 bg-white/70 px-4 py-2 text-xs font-semibold text-[#173f32] transition hover:bg-white"
          >
            <ArrowLeft size={15} />
            <span>{lang === "hi" ? "मुख्य पृष्ठ" : "Back to Home"}</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CARD ================= */}
      <section className="mx-auto min-h-[calc(100vh-82px)] h-auto lg:h-[calc(100vh-82px)] w-[calc(100%-24px)] max-w-[1550px] overflow-y-auto lg:overflow-hidden rounded-[28px] border border-[#dfd5c5] bg-[#f8f4eb] shadow-[0_20px_60px_rgba(48,39,25,0.10)] sm:w-[calc(100%-32px)]">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[0.98fr_1.02fr]">
          {/* ===================================================== */}
          {/* LEFT SIDE — FORM */}
          {/* ===================================================== */}
          <div className="flex min-h-0 flex-col px-4 py-4 sm:px-6 lg:px-7 lg:py-3">
            {/* BADGE */}
            <div className="mb-1.5 shrink-0">
              <span className="inline-flex rounded-full bg-[#f0dfae] px-4 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8b6116]">
                {lang === "hi" ? "ग्राहक पंजीकरण" : "Customer Portal"}
              </span>
            </div>

            {/* TITLE */}
            <div className="mb-2 shrink-0">
              <h1 className="font-serif text-[24px] sm:text-[28px] font-bold leading-[1.05] text-[#123f31] xl:text-[32px]">
                {t.signupTitle}
              </h1>

              <p className="mt-1 text-[11px] text-black/55">
                {t.signupSubtitle}
              </p>
            </div>

            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSignup}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden pb-4 lg:pb-1 space-y-2"
            >
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="shrink-0 rounded-[18px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-xs font-bold text-[#936817]">
                    1
                  </div>
                  <h2 className="text-[13px] font-bold text-[#17221b]">
                    {lang === "hi" ? "व्यक्तिगत जानकारी" : "Personal Information"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {/* FULL NAME */}
                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.fullNameLabel}
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.fullNamePlaceholder}
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-3 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-3 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="col-span-2">
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.mobileLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-[#063b2c]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder={t.mobilePlaceholder}
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-10 pr-3 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <div className="shrink-0 rounded-[18px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-xs font-bold text-[#936817]">
                    2
                  </div>
                  <h2 className="text-[13px] font-bold text-[#17221b]">
                    {lang === "hi" ? "स्थान विवरण" : "Location Details"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.villageCityLabel}
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type="text"
                        value={villageCity}
                        onChange={(e) => setVillageCity(e.target.value)}
                        placeholder={t.villageCityPlaceholder}
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-3 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.districtLabel}
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={t.districtPlaceholder}
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-3 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PASSWORD */}
              <div className="shrink-0 rounded-[18px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-xs font-bold text-[#936817]">
                    3
                  </div>
                  <h2 className="text-[13px] font-bold text-[#17221b]">
                    {lang === "hi" ? "पासवर्ड सुरक्षा" : "Account Security"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.passwordLabel}
                    </label>
                    <div className="relative">
                      <LockKeyhole
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-8 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/35"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-0.5 block text-[10px] font-semibold">
                      {t.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <LockKeyhole
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-8.5 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-8.5 pr-8 text-[11px] outline-none transition focus:border-[#b47b1b]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/35"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-1 text-[8px] text-black/40">
                  {lang === "hi" ? "✓ पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "✓ Password must be at least 6 characters."}
                </p>
              </div>

              {/* ERROR ALERT */}
              {error && (
                <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 p-2 text-[11px] text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS ALERT */}
              {message && (
                <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              {/* CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-9 w-full shrink-0 rounded-full bg-[#123f31] px-5 text-[12px] font-bold text-white shadow-xs transition hover:bg-[#0d3025] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  t.processingBtn
                ) : (
                  <>
                    <span>{t.createAccountBtn}</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {/* LOGIN LINK */}
              <p className="shrink-0 text-center text-[11px] text-black/55">
                {t.alreadyHaveAccount}{" "}
                <button
                  type="button"
                  onClick={() => router.push("/customer/login")}
                  className="font-bold text-[#063b2c] hover:underline"
                >
                  {t.loginLink} →
                </button>
              </p>
            </form>
          </div>

          {/* ===================================================== */}
          {/* RIGHT IMAGE — BRAND SHOWCASE */}
          {/* ===================================================== */}
          <div className="relative hidden min-h-0 overflow-hidden rounded-r-[28px] lg:block">
            <img
              src="/home.png"
              alt="Modern house architecture"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#073b2b]/35 via-transparent to-[#073b2b]/55" />

            <div className="relative z-10 flex h-full flex-col px-9 py-8 text-white xl:px-10">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1c45e]">
                <span className="h-px w-10 bg-[#f1c45e]" />
                {lang === "hi" ? "सपनों के घर की शुरुआत" : "Turn Your Ideas Into Real Plans"}
              </div>

              <h2 className="mt-4 max-w-[520px] font-serif text-[42px] font-bold leading-[0.96] xl:text-[48px]">
                {t.dreamHomeQuote1}{" "}
                <span className="block text-[#f1c45e]">
                  {t.dreamHomeQuoteHighlight}
                </span>
              </h2>

              <p className="mt-4 max-w-[440px] text-xs leading-relaxed text-white/80 xl:text-sm">
                {t.dreamHomeDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}