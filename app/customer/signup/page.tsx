"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
  LockKeyhole,
  Ruler,
  Leaf,
  Headphones,
} from "lucide-react";

import { createClient } from "@/lib/supabase-client";

export default function CustomerSignupPage() {
  const router = useRouter();

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

  const handleSignup = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !fullName ||
      !email ||
      !mobile ||
      !villageCity ||
      !district ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all the required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const cleanMobile = mobile.trim().replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
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
        localStorage.removeItem("sarda_last_uploaded_sketch");
        localStorage.removeItem("sarda_last_uploaded_sketch_name");
        localStorage.removeItem("sarada_customer_session");
        localStorage.removeItem("sarada_customer_logged_in");
        localStorage.removeItem("sarada_last_uploaded_sketch");
        localStorage.removeItem("sarada_last_uploaded_sketch_name");
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
          setError("An account with this email/mobile already exists. Please login instead.");
        } else {
          setError(signupError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!signupData.user) {
        setError("Account creation could not be completed. Please try again.");
        setIsLoading(false);
        return;
      }

      const realUserId = signupData.user.id;

      // 1. Create real customer profile in Supabase database
      const fullProfilePayload = {
        id: realUserId,
        full_name: fullName.trim(),
        mobile: cleanMobile,
        village_city: villageCity.trim(),
        district: district.trim(),
        state: "Bihar",
        property_type: "Residential Plot",
        preferred_language: "Hindi",
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

      // 2. Sign in to establish active session
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      } catch (loginErr) {
        console.warn("Auto sign-in notice:", loginErr);
      }

      setMessage("Account created successfully! Forwarding to your dashboard...");

      // Immediate redirect to customer dashboard
      setTimeout(() => {
        router.push("/customer/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("Signup exception:", err);
      setError(err?.message || "An unexpected error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f5f1e8] text-[#17221b]">
      {/* ================= HEADER ================= */}
      <header className="flex h-[72px] items-center justify-between px-5 sm:px-7 lg:px-8">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#123f31] text-[#d9b45a] shadow-sm">
            <Home size={23} strokeWidth={2.2} />
          </div>

          <div className="leading-none">
            <div className="font-serif text-[24px] font-bold tracking-wide text-[#123f31]">
              SARDA
            </div>

            <div className="mt-1 text-[8px] font-bold tracking-[0.35em] text-[#a97920]">
              HOMEPLAN
            </div>
          </div>
        </div>

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-full border border-[#173f32]/25 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#173f32] transition hover:bg-white"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>
      </header>

      {/* ================= MAIN CARD ================= */}
      <section className="mx-auto min-h-[calc(100vh-82px)] h-auto lg:h-[calc(100vh-82px)] w-[calc(100%-24px)] max-w-[1550px] overflow-y-auto lg:overflow-hidden rounded-[28px] border border-[#dfd5c5] bg-[#f8f4eb] shadow-[0_20px_60px_rgba(48,39,25,0.10)] sm:w-[calc(100%-32px)]">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[0.98fr_1.02fr]">
          {/* ===================================================== */}
          {/* LEFT SIDE */}
          {/* ===================================================== */}

          <div className="flex min-h-0 flex-col px-4 py-4 sm:px-6 lg:px-7 lg:py-3">
            {/* BADGE */}
            <div className="mb-1.5 shrink-0">
              <span className="inline-flex rounded-full bg-[#f0dfae] px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8b6116]">
                Customer Portal
              </span>
            </div>

            {/* TITLE */}
            <div className="mb-2.5 shrink-0">
              <h1 className="font-serif text-[26px] sm:text-[30px] font-bold leading-[1.05] sm:leading-[0.95] text-[#123f31] xl:text-[35px]">
                Create Your{" "}
                <span className="text-[#b47b1b]">Account</span>
              </h1>

              <p className="mt-1.5 text-[12px] text-black/55">
                Start your house planning journey with Sarda HomePlan.
              </p>
            </div>

            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSignup}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden pb-4 lg:pb-1"
            >
              {/* PERSONAL INFORMATION */}
              <div className="shrink-0 rounded-[20px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-sm font-bold text-[#936817]">
                    1
                  </div>

                  <div>
                    <h2 className="text-[14px] font-bold text-[#17221b]">
                      Personal Information
                    </h2>

                    <p className="text-[8px] text-black/40">
                      Tell us a bit about yourself
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {/* FULL NAME */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      Full Name
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
                        placeholder="Enter your full name"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      Email Address
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
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-semibold">
                      Mobile Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION */}
              <div className="mt-2 shrink-0 rounded-[20px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-sm font-bold text-[#936817]">
                    2
                  </div>

                  <div>
                    <h2 className="text-[14px] font-bold text-[#17221b]">
                      Location Details
                    </h2>

                    <p className="text-[8px] text-black/40">
                      Where are you planning to build?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* VILLAGE / CITY */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      Village / City
                    </label>

                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        type="text"
                        value={villageCity}
                        onChange={(e) =>
                          setVillageCity(e.target.value)
                        }
                        placeholder="Enter village or city"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>

                  {/* DISTRICT */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      District
                    </label>

                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        type="text"
                        value={district}
                        onChange={(e) =>
                          setDistrict(e.target.value)
                        }
                        placeholder="Enter district"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mt-2 shrink-0 rounded-[20px] border border-[#dfd5c5] bg-white/80 px-4 py-2.5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0dfae] text-sm font-bold text-[#936817]">
                    3
                  </div>

                  <div>
                    <h2 className="text-[14px] font-bold text-[#17221b]">
                      Secure Your Account
                    </h2>

                    <p className="text-[8px] text-black/40">
                      Create a strong password to keep your account safe
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* PASSWORD */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Create a password"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-9 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35"
                      >
                        {showPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Confirm your password"
                        className="h-9 w-full rounded-xl border border-[#dfd5c5] bg-[#fffdf9] pl-9 pr-9 text-[12px] outline-none transition focus:border-[#b47b1b]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-1 text-[8px] text-black/40">
                  ✓ Password must be at least 6 characters.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-1.5 shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {message && (
                <div className="mt-1.5 shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] text-green-700">
                  {message}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 h-9 w-full shrink-0 rounded-full bg-[#123f31] px-5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(18,63,49,0.15)] transition hover:bg-[#0d3025] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Creating Account..."
                  : "Create Account  →"}
              </button>

              {/* SECURITY */}
              <div className="mt-1 shrink-0 rounded-xl bg-[#eaf2e8] px-3 py-1.5 text-center text-[8px] text-[#315443]">
                🔒 Your information is securely stored and used only
                for service-related communication.
              </div>

              {/* LOGIN */}
              <p className="mt-1.5 shrink-0 text-center text-[10px] text-black/50">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    router.push("/customer/login")
                  }
                  className="font-semibold text-[#a97920] hover:underline"
                >
                  Login →
                </button>
              </p>
            </form>
          </div>

          {/* ===================================================== */}
          {/* RIGHT IMAGE */}
          {/* ===================================================== */}

          <div className="relative hidden min-h-0 overflow-hidden rounded-r-[28px] lg:block">
            {/* HOUSE IMAGE */}
            <img
              src="/home.png"
              alt="Modern house"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* IMAGE OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#073b2b]/25 via-transparent to-[#073b2b]/45" />

            {/* RIGHT CONTENT */}
            <div className="relative z-10 flex h-full flex-col px-9 py-8 text-white xl:px-10">
              {/* SMALL HEADING */}
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1c45e]">
                <span className="h-px w-10 bg-[#f1c45e]" />
                Turn Your Ideas Into Real Plans
              </div>

              {/* TITLE */}
              <h2 className="mt-4 max-w-[520px] font-serif text-[45px] font-bold leading-[0.94] xl:text-[52px]">
                Plan Your
                <br />
                Dream Home
                <br />
                <span className="text-[#e0ad3e]">
                  with Experts
                </span>
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-4 max-w-[540px] text-[13px] leading-5 text-white/90 xl:text-[14px]">
                Get professional house plans, accurate measurements,
                Vastu guidance and personalized support — all in one
                place.
              </p>

              {/* FEATURES */}
              <div className="mt-6 space-y-3.5">
                {/* FEATURE 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#123f31]">
                    <Home size={18} />
                  </div>

                  <div>
                    <p className="text-[14px] font-bold">
                      Custom House Plans
                    </p>

                    <p className="text-[10px] text-white/80">
                      As per your requirements
                    </p>
                  </div>
                </div>

                {/* FEATURE 2 */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#123f31]">
                    <Ruler size={18} />
                  </div>

                  <div>
                    <p className="text-[14px] font-bold">
                      Accurate Measurements
                    </p>

                    <p className="text-[10px] text-white/80">
                      Detailed and precise designs
                    </p>
                  </div>
                </div>

                {/* FEATURE 3 */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#123f31]">
                    <Leaf size={18} />
                  </div>

                  <div>
                    <p className="text-[14px] font-bold">
                      Vastu Consultation
                    </p>

                    <p className="text-[10px] text-white/80">
                      Guidance based on your preferences
                    </p>
                  </div>
                </div>

                {/* FEATURE 4 */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#123f31]">
                    <Headphones size={18} />
                  </div>

                  <div>
                    <p className="text-[14px] font-bold">
                      Personalized Support
                    </p>

                    <p className="text-[10px] text-white/80">
                      We are here to help
                    </p>
                  </div>
                </div>
              </div>

              {/* BRAND CARD */}
              <div className="absolute bottom-5 right-5 w-[235px] rounded-[22px] border border-white/20 bg-[#073b2b]/90 px-5 py-4 shadow-xl backdrop-blur-sm xl:right-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#e1b74f]">
                  Sarda HomePlan
                </p>

                <h3 className="mt-1.5 font-serif text-[23px] font-bold leading-[1.03] text-white">
                  Your Home,
                  <br />
                  Our Planning,
                  <br />
                  Better Living
                </h3>

                <div className="mt-2.5 h-1 w-10 rounded-full bg-[#e1b74f]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}