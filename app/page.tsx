"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("hi-IN");
  const [requirements, setRequirements] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // STEP 2 — FORM STATES
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [villageCity, setVillageCity] = useState("");
  const [district, setDistrict] = useState("");
  const [plotLength, setPlotLength] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [floors, setFloors] = useState("");
  const [vastuConsultation, setVastuConsultation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startVoiceInput = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Voice input is not supported in this browser. Please use Google Chrome."
    );
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = voiceLanguage;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event: any) => {
    let transcript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      transcript += event.results[i][0].transcript;
    }

    if (transcript.trim()) {
      setRequirements((previous) =>
        previous
          ? `${previous} ${transcript.trim()}`
          : transcript.trim()
      );
    }

    setIsListening(false);
  };

  recognition.onerror = (event: any) => {
    console.log("Voice recognition error:", event.error);

    setIsListening(false);

    if (event.error === "aborted") {
      return;
    }

    if (event.error === "not-allowed") {
      alert(
        "Microphone permission denied. Please allow microphone access."
      );
    } else if (event.error === "no-speech") {
      alert(
        "No speech detected. Please speak clearly and try again."
      );
    } else if (event.error === "audio-capture") {
      alert(
        "Microphone could not be accessed. Please check your microphone."
      );
    } else {
      alert(`Voice input error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  try {
    recognition.start();
  } catch (error) {
    console.log("Voice start error:", error);
    setIsListening(false);
  }
};  
  const submitRequirement = async () => {
  if (!fullName || !mobile) {
    alert("Please enter your name and mobile number.");
    return;
  }

  setIsSubmitting(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("customer_requests")
    .insert({
      full_name: fullName.trim(),
      mobile: mobile.trim(),
      village_city: villageCity.trim(),
      district: district.trim(),
      plot_length: plotLength ? String(plotLength) : null,
      plot_width: plotWidth ? String(plotWidth) : null,
      measurement_unit: measurementUnit,
      floors: floors,
      requirements: requirements,
      vastu_consultation: vastuConsultation,
      customer_user_id: user?.id ?? null,
    });

  setIsSubmitting(false);

  if (error) {
    console.error("Submission error:", error);
    alert(`Database Error: ${error.message}`);
    return;
  }

  setShowConfirmation(false);

  alert("Requirement submitted successfully! ✓");
};
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17221b]">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-[#f7f5ef]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          {/* Logo */}
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Sarada <span className="font-normal">HomePlan</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-black/50">
              House Planning & Vastu Consultation
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Home
            </a>

            <a
              href="#services"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Services
            </a>

            <a
              href="#work"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Our Work
            </a>

            <a
              href="#process"
              className="text-sm text-black/70 transition hover:text-black"
            >
              How It Works
            </a>

            <a
              href="#contact"
              className="rounded-full bg-[#17221b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#26382c]"
            >
              Get Started
            </a>
          </div>

        </div>
      </nav>


      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden pt-36"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 lg:grid-cols-2 lg:px-10">

          {/* Hero Content */}
          <div>

            <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-[#68766c]">
              Personalized House Planning
            </p>

            <h2 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Apne plot ke according
              <span className="block text-[#68766c]">
                apne ghar ka plan banwayein.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60">
              Aapki requirements, actual site measurements aur practical
              planning ko samajhkar personalized house plans tayyar kiye
              jaate hain — Vastu-based consultation ke saath.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href="#contact"
                className="rounded-full bg-[#17221b] px-7 py-3.5 text-center text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#26382c]"
              >
                Apni Requirement Batayein
              </a>

              <a
                href="#work"
                className="rounded-full border border-black/15 bg-white/50 px-7 py-3.5 text-center text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white"
              >
                Our Previous Work
              </a>

            </div>

            {/* Small Trust Points */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-black/50">
              <span>✓ Site Measurement</span>
              <span>✓ Personalized Planning</span>
              <span>✓ Revision Support</span>
            </div>

          </div>


          {/* Hero Visual */}
          <div className="relative">

            {/* Decorative background */}
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#dfe5dc] blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_30px_80px_rgba(23,34,27,0.12)]">

              {/* Fake architectural drawing area */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#f3f1eb]">

                {/* Plot boundary */}
                <div className="absolute inset-[9%] border-2 border-[#17221b]/70">

                  {/* Rooms */}
                  <div className="absolute left-0 top-0 h-1/2 w-1/2 border-b border-r border-[#17221b]/50 p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                      Bedroom
                    </span>
                  </div>

                  <div className="absolute right-0 top-0 h-1/2 w-1/2 border-b border-[#17221b]/50 p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                      Living
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1/2 w-1/2 border-r border-[#17221b]/50 p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                      Kitchen
                    </span>
                  </div>

                  <div className="absolute bottom-0 right-0 h-1/2 w-1/2 p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                      Bedroom
                    </span>
                  </div>

                  {/* Center passage */}
                  <div className="absolute left-1/2 top-1/2 h-12 w-20 -translate-x-1/2 -translate-y-1/2 border border-[#17221b]/40 bg-[#f3f1eb] text-center">
                    <span className="text-[9px] uppercase tracking-wider text-black/40">
                      Passage
                    </span>
                  </div>

                </div>

                {/* Dimension labels */}
                <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] tracking-widest text-black/40">
                  30'-0"
                </span>

                <span className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[10px] tracking-widest text-black/40">
                  40'-0"
                </span>

                {/* North indicator */}
                <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white/70 text-xs font-semibold">
                  N
                </div>

              </div>

              {/* Caption */}
              <div className="flex items-center justify-between px-2 pb-1 pt-5">
                <div>
                  <p className="text-sm font-medium">
                    Personalized House Plan
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    Planned around your plot & requirements
                  </p>
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-wider text-black/50">
                  Sample
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* HOW IT WORKS */}
<section
  id="process"
  className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
>
  {/* Section Heading */}
  <div className="max-w-2xl">
    <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#68766c]">
      Our Process
    </p>

    <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
      From your requirement
      <span className="block text-[#68766c]">
        to your final house plan.
      </span>
    </h2>

    <p className="mt-5 text-base leading-7 text-black/55">
      Har project ko step-by-step samjha jaata hai, taaki final plan
      aapki actual requirements aur site conditions ke according ho.
    </p>
  </div>

  {/* Process Steps */}
  <div className="mt-16 grid gap-6 md:grid-cols-5">

    {/* Step 1 */}
    <div className="group relative rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17221b] text-sm font-medium text-white">
        01
      </div>

      <h3 className="mt-7 text-lg font-semibold">
        Requirement
      </h3>

      <p className="mt-3 text-sm leading-6 text-black/55">
        Aap apne plot, family needs, rooms aur other requirements
        share karte hain.
      </p>

      <div className="mt-6 text-2xl text-black/20">
        →
      </div>
    </div>

    {/* Step 2 */}
    <div className="group relative rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17221b] text-sm font-medium text-white">
        02
      </div>

      <h3 className="mt-7 text-lg font-semibold">
        Site Visit
      </h3>

      <p className="mt-3 text-sm leading-6 text-black/55">
        Actual site dimensions, direction aur ground conditions
        personally verify ki jaati hain.
      </p>

      <div className="mt-6 text-2xl text-black/20">
        →
      </div>
    </div>

    {/* Step 3 */}
    <div className="group relative rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17221b] text-sm font-medium text-white">
        03
      </div>

      <h3 className="mt-7 text-lg font-semibold">
        Rough Plan
      </h3>

      <p className="mt-3 text-sm leading-6 text-black/55">
        Requirements aur site measurements ke basis par initial
        rough plan prepare kiya jaata hai.
      </p>

      <div className="mt-6 text-2xl text-black/20">
        →
      </div>
    </div>

    {/* Step 4 */}
    <div className="group relative rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17221b] text-sm font-medium text-white">
        04
      </div>

      <h3 className="mt-7 text-lg font-semibold">
        Review & Revision
      </h3>

      <p className="mt-3 text-sm leading-6 text-black/55">
        Rough plan customer ke saath review hota hai aur required
        changes ke according revisions ki jaati hain.
      </p>

      <div className="mt-6 text-2xl text-black/20">
        →
      </div>
    </div>

    {/* Step 5 */}
    <div className="group relative rounded-3xl border border-black/10 bg-[#17221b] p-6 text-white transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-medium text-[#17221b]">
        05
      </div>

      <h3 className="mt-7 text-lg font-semibold">
        Final Plan
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/65">
        Approval ke baad clean final house map prepare karke
        customer ko deliver kiya jaata hai.
      </p>

      <div className="mt-6 text-2xl text-white/40">
        ✓
      </div>
    </div>

  </div>
</section>

{/* Section Separator */}
<div className="mx-auto max-w-7xl border-t border-black/10" />
{/* SERVICES */}
<section
  id="services"
  className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
>
  {/* Heading */}
  <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

    <div className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#68766c]">
        What We Do
      </p>

      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Planning that starts
        <span className="block text-[#68766c]">
          with your actual needs.
        </span>
      </h2>
    </div>

    <p className="max-w-md text-base leading-7 text-black/55">
      Har house plan ko plot, requirements, site conditions aur
      practical usage ko dhyan mein rakhkar prepare kiya jaata hai.
    </p>

  </div>


  {/* Service Cards */}
  <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

    {/* Service 1 */}
    <div className="group rounded-[2rem] border border-black/10 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.10)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0eb] text-2xl">
        ⌂
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-black/35">
        01
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Personalized House Planning
      </h3>

      <p className="mt-4 text-sm leading-7 text-black/55">
        Aapki family requirements, plot size aur lifestyle ke
        according customized house layout planning.
      </p>

      <div className="mt-7 text-sm font-medium text-[#68766c] transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>


    {/* Service 2 */}
    <div className="group rounded-[2rem] border border-black/10 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.10)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0eb] text-2xl">
        📐
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-black/35">
        02
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Site Measurement & Planning
      </h3>

      <p className="mt-4 text-sm leading-7 text-black/55">
        Physical site visit ke through dimensions, direction aur
        important ground conditions verify ki jaati hain.
      </p>

      <div className="mt-7 text-sm font-medium text-[#68766c] transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>


    {/* Service 3 */}
    <div className="group rounded-[2rem] border border-black/10 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.10)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0eb] text-2xl">
        🧭
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-black/35">
        03
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Vastu-Based Consultation
      </h3>

      <p className="mt-4 text-sm leading-7 text-black/55">
        Planning ke dauraan Vastu preferences aur requirements ko
        consider karke consultation provide ki jaati hai.
      </p>

      <div className="mt-7 text-sm font-medium text-[#68766c] transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>


    {/* Service 4 */}
    <div className="group rounded-[2rem] border border-black/10 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.10)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0eb] text-2xl">
        ✏️
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-black/35">
        04
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Rough Plan & Revision
      </h3>

      <p className="mt-4 text-sm leading-7 text-black/55">
        Initial rough plan customer ke saath review kiya jaata hai
        aur required changes ke according revisions ki jaati hain.
      </p>

      <div className="mt-7 text-sm font-medium text-[#68766c] transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>


    {/* Service 5 */}
    <div className="group rounded-[2rem] border border-black/10 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.10)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0eb] text-2xl">
        ✓
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-black/35">
        05
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Final Clean House Map
      </h3>

      <p className="mt-4 text-sm leading-7 text-black/55">
        Customer approval ke baad detailed clean final house map
        prepare karke deliver kiya jaata hai.
      </p>

      <div className="mt-7 text-sm font-medium text-[#68766c] transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>


    {/* Service 6 */}
    <div className="group rounded-[2rem] bg-[#17221b] p-8 text-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.20)]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
        ↕
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
        06
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        Multi-Floor Planning
      </h3>

      <p className="mt-4 text-sm leading-7 text-white/60">
        Ground, First, Second ya multiple floors ke plans ko
        project requirements ke according organize kiya ja sakta hai.
      </p>

      <div className="mt-7 text-sm font-medium text-white/70 transition group-hover:translate-x-1">
        Explore service →
      </div>

    </div>

  </div>

</section>

{/* Section Separator */}
<div className="mx-auto max-w-7xl border-t border-black/10" />
{/* OUR WORK */}
<section
  id="work"
  className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
>
  {/* Heading */}
  <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
    <div className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#68766c]">
        Our Work
      </p>

      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Real house plans,
        <span className="block text-[#68766c]">
          prepared with practical planning.
        </span>
      </h2>
    </div>

    <p className="max-w-md text-base leading-7 text-black/55">
      Yeh kuch actual house-plan samples hain. Har project ki
      planning plot dimensions aur customer requirements ke
      according prepare ki gayi hai.
    </p>
  </div>

  {/* Portfolio Grid */}
  <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

    {/* Map 01 */}
    <div 
    onClick={() => setSelectedImage("/portfolio/house-plan-01-hd.jpg")}
    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f2ed]">
        <img
          src="/portfolio/house-plan-01-hd.jpg"
          alt="House Plan 01"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
          Project 01
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          House Plan 01
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/55">
          Hand-drawn house planning sample.
        </p>
      </div>
    </div>

    {/* Map 02 */}
    <div
    onClick={() => setSelectedImage("/portfolio/house-plan-02-hd.jpg")}
    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f2ed]">
        <img
          src="/portfolio/house-plan-02-hd.jpg"
          alt="House Plan 02"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
          Project 02
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          House Plan 02
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/55">
          Hand-drawn house planning sample.
        </p>
      </div>
    </div>

    {/* Map 03 */}
    <div
    onClick={() => setSelectedImage("/portfolio/house-plan-03-hd.jpg")}
    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f2ed]">
        <img
          src="/portfolio/house-plan-03-hd.jpg"
          alt="House Plan 03"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
          Project 03
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          House Plan 03
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/55">
          Hand-drawn house planning sample.
        </p>
      </div>
    </div>

    {/* Map 04 */}
    <div
    onClick={() => setSelectedImage("/portfolio/house-plan-04-hd.jpg")}
    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f2ed]">
        <img
          src="/portfolio/house-plan-04-hd.jpg"
          alt="House Plan 04"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
          Project 04
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          House Plan 04
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/55">
          Hand-drawn house planning sample.
        </p>
      </div>
    </div>

    {/* Map 05 */}
    <div
    onClick={() => setSelectedImage("/portfolio/house-plan-05-hd.jpg")}
    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(23,34,27,0.12)]">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3f2ed]">
        <img
          src="/portfolio/house-plan-05-hd.jpg"
          alt="House Plan 05"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
          Project 05
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          House Plan 05
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/55">
          Hand-drawn house planning sample.
        </p>
      </div>
    </div>

  </div>
</section>

{/* Section Separator */}
<div className="mx-auto max-w-7xl border-t border-black/10" />
{/* FULL SCREEN IMAGE VIEWER */}
{selectedImage && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
    onClick={() => setSelectedImage(null)}
  >
    {/* Close Button */}
    <button
      onClick={() => setSelectedImage(null)}
      className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-black shadow-lg"
      aria-label="Close image"
    >
      ×
    </button>

    {/* Full Image */}
    <img
      src={selectedImage}
      alt="Full house plan"
      className="max-h-[95vh] max-w-[95vw] object-contain"
      onClick={(event) => event.stopPropagation()}
    />
  </div>
)}
{/* REQUIREMENT SECTION */}
<section
  id="contact"
  className="border-t border-black/10 bg-[#f7f5ef] py-24"
>
  <div className="mx-auto max-w-7xl px-6 lg:px-10">

    {/* Heading */}
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#68766c]">
          Start Your Project
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Apni requirement
          <span className="block text-[#68766c]">
            humein batayein.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-base leading-7 text-black/55">
          Apne plot aur ghar ki basic requirements share karein.
          Detailed site measurements hum site visit ke time verify
          karenge.
        </p>

        <div className="mt-8 space-y-4 text-sm text-black/55">
          <p>✓ Personalized house planning</p>
          <p>✓ Site measurement & verification</p>
          <p>✓ Rough plan review & revision</p>
          <p>✓ Final clean house map</p>
        </div>
      </div>


      {/* FORM */}
      <form
        onSubmit={(event) => event.preventDefault()}
        className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8"
      >
  <div className="grid gap-5 sm:grid-cols-2">

  {/* Name */}
  <div>
    <label className="text-sm font-medium">
      Full Name <span className="text-black/50">(पूरा नाम)</span>
    </label>

    <input
      type="text"
      value={fullName}
      onChange={(event) => setFullName(event.target.value)}
      placeholder="Enter your name"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* Mobile */}
  <div>
    <label className="text-sm font-medium">
      Mobile Number <span className="text-black/50">(मोबाइल नंबर)</span>
    </label>

    <input
      type="tel"
      value={mobile}
      onChange={(event) => setMobile(event.target.value)}
      placeholder="Enter mobile number"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* City */}
  <div>
    <label className="text-sm font-medium">
      Village / City <span className="text-black/50">(गाँव / शहर)</span>
    </label>

    <input
      type="text"
      value={villageCity}
      onChange={(event) => setVillageCity(event.target.value)}
      placeholder="Your village or city"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* District */}
  <div>
    <label className="text-sm font-medium">
      District <span className="text-black/50">(जिला)</span>
    </label>

    <input
      type="text"
      value={district}
      onChange={(event) => setDistrict(event.target.value)}
      placeholder="Your district"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* Plot Length */}
  <div>
    <label className="text-sm font-medium">
      Plot Length <span className="text-black/50">(प्लॉट की लंबाई)</span>
    </label>

    <input
      type="number"
      value={plotLength}
      onChange={(event) => setPlotLength(event.target.value)}
      placeholder="e.g. 40"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* Plot Width */}
  <div>
    <label className="text-sm font-medium">
      Plot Width <span className="text-black/50">(प्लॉट की चौड़ाई)</span>
    </label>

    <input
      type="number"
      value={plotWidth}
      onChange={(event) => setPlotWidth(event.target.value)}
      placeholder="e.g. 30"
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    />
  </div>

  {/* Unit */}
  <div>
    <label className="text-sm font-medium">
      Measurement Unit <span className="text-black/50">(माप की इकाई)</span>
    </label>

    <select
      value={measurementUnit}
      onChange={(event) => setMeasurementUnit(event.target.value)}
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    >
      <option value="" disabled>
        Select unit
      </option>
      <option value="feet">Feet</option>
      <option value="meter">Meter</option>
      <option value="yard">Yard</option>
    </select>
  </div>

  {/* Floors */}
  <div>
    <label className="text-sm font-medium">
      Number of Floors <span className="text-black/50">(मंज़िलों की संख्या)</span>
    </label>

    <select
      value={floors}
      onChange={(event) => setFloors(event.target.value)}
      className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
    >
      <option value="" disabled>
        Select floors
      </option>
      <option value="ground">Ground Floor</option>
      <option value="g+1">Ground + 1</option>
      <option value="g+2">Ground + 2</option>
      <option value="other">Other</option>
    </select>
  </div>

</div>


{/* Requirements */}
<div className="mt-5">
  <label className="text-sm font-medium">
    Your Requirements <span className="text-black/50">(आपकी आवश्यकताएँ)</span>
  </label>

  <textarea
    rows={6}
    value={requirements}
    onChange={(event) => setRequirements(event.target.value)}
    placeholder="Example: 3 bedrooms, kitchen, drawing room, parking, staircase..."
    className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none transition focus:border-[#17221b]"
  />
</div>
   {/* VOICE REQUIREMENT */}
<div className="mt-5 rounded-2xl border border-dashed border-black/15 bg-[#f7f5ef] p-5">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

    <div>
      <p className="text-sm font-medium">
        Add Requirement by Voice
      </p>

      <p className="mt-1 text-xs leading-5 text-black/50">
        Type karke ya voice se apni requirement batayein.
        Voice se bola gaya text bhi upar wale requirement box mein add hoga.
      </p>
    </div>

    {/* VOICE LANGUAGE */}
    <div>
      <label className="text-xs font-medium text-black/60">
        Voice Language
      </label>

      <select
        value={voiceLanguage}
        onChange={(event) => setVoiceLanguage(event.target.value)}
        className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none"
      >
        <option value="hi-IN">Hindi (हिंदी)</option>
        <option value="en-IN">English</option>
        <option value="ur-PK">Urdu (اردو)</option>
        <option value="bn-IN">Bengali (বাংলা)</option>
        <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
        <option value="mr-IN">Marathi (मराठी)</option>
      </select>
    </div>

  </div>

  {/* VOICE BUTTON */}
  <button
    type="button"
    onClick={startVoiceInput}
    className="mt-5 rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
  >
    {isListening
      ? "🔴 Listening... Please speak"
      : "🎙️ Add by Voice"}
  </button>

  {isListening && (
    <p className="mt-3 text-xs text-[#68766c]">
      Listening... apni requirement clearly boliye.
    </p>
  )}

  {/* INSTRUCTION */}
  <div className="mt-4 rounded-xl bg-white/70 p-3">
    <p className="text-xs leading-5 text-black/55">
      💡 Voice se jo bhi bolenge, woh upar diye gaye{" "}
      <strong>Your Requirements</strong>{" "}
      box mein add ho jayega. Aap us text ko edit bhi kar sakte hain.
    </p>
  </div>

</div>
    <button
    type="button"
    onClick={() => setShowConfirmation(true)}
    className="mt-6 w-full rounded-full bg-[#17221b] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#26382c]"
   >
    Submit Requirement →
  </button>
  {showConfirmation && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">

      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#68766c]">
        Final Check
      </p>

      <h3 className="mt-2 text-2xl font-semibold text-[#17221b]">
        Is your requirement correct? Please Check.
      </h3>

      <p className="mt-2 text-sm leading-6 text-black/55">
        Submit karne se pehle apni requirement ek baar check kar lein.
        Agar koi mistake hai to Go Back karke badal kar sakte hain.
      </p>

      {/* REQUIREMENT PREVIEW */}
      <div className="mt-5 rounded-2xl bg-[#f7f5ef] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-black/40">
          Your Requirement
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/75">
          {requirements || "No requirement entered yet."}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex gap-3">

        <button
          type="button"
          onClick={() => setShowConfirmation(false)}
          className="flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:bg-[#f7f5ef]"
        >
          ← Go Back & Edit
        </button>

        <button
         type="button"
         onClick={submitRequirement}
         disabled={isSubmitting}
         className="flex-1 rounded-full bg-[#17221b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#26382c] disabled:cursor-not-allowed disabled:opacity-60"
         >
         {isSubmitting ? "Submitting..." : "Confirm & Submit ✓"}
        </button>

      </div>

    </div>
  </div>
)}

        <p className="mt-4 text-center text-xs text-black/40">
          Your information will be used only for discussing your house
          planning requirements.
        </p>

      </form>

    </div>
  </div>
</section>

    </main>
  );
}