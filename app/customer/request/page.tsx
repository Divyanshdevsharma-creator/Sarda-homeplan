"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Globe,
  Home,
  ImagePlus,
  Lock,
  MapPin,
  Menu,
  Mic,
  MicOff,
  Phone,
  Ruler,
  Search,
  Upload,
  User,
  Volume2,
  X,
  Eye,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { createClient } from "../../../lib/supabase-client";

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: any) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function CustomerRequestPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [villageCity, setVillageCity] = useState("");
  const [district, setDistrict] = useState("");

  const [plotLength, setPlotLength] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("Feet (ft)");
  const [floors, setFloors] = useState("1 Floor");

  const [requirements, setRequirements] = useState("");
  const [vastuConsultation, setVastuConsultation] = useState("");

  const [voiceLanguage, setVoiceLanguage] = useState("hi-IN");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    { file: File; url: string; isImage: boolean }[]
  >([]);
  const [previewModalUrl, setPreviewModalUrl] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const supabase = createClient();

  const roomList = [
    { name: "Bedroom", hint: "Bedrooms needed" },
    { name: "Washroom", hint: "Bathrooms / Toilets" },
    { name: "Kitchen", hint: "Modular / Traditional" },
    { name: "Living / Lobby", hint: "Hall & Family sitting" },
    { name: "Drawing Room", hint: "Front guest room / Baithak" },
    { name: "Pooja Room", hint: "Mandir / Prayer room" },
    { name: "Guest Room", hint: "Extra guest room" },
    { name: "Balcony / Verandah", hint: "Open air / Porch" },
    { name: "Parking", hint: "Car & bike parking" },
    { name: "Store Room", hint: "Storage & utility" },
  ];

  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({
    Bedroom: 0,
    Washroom: 0,
    Kitchen: 0,
    "Living / Lobby": 0,
    "Drawing Room": 0,
    "Pooja Room": 0,
    "Guest Room": 0,
    "Balcony / Verandah": 0,
    Parking: 0,
    "Store Room": 0,
  });

  const updateRoomQuantity = (room: string, delta: number) => {
    setRoomQuantities((prev) => {
      const current = prev[room] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [room]: next };
    });
  };

  const selectedRooms = Object.keys(roomQuantities).filter(
    (room) => (roomQuantities[room] || 0) > 0
  );

  const roomSummaryList = Object.entries(roomQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(
      ([room, qty]) =>
        `${qty} ${room}${
          qty > 1 && (room === "Washroom" || room === "Bedroom") ? "s" : ""
        }`
    );

  /* =========================================================
     LOAD LOGGED-IN CUSTOMER PROFILE
  ========================================================= */

  useEffect(() => {
    const loadProfile = async () => {
      let currentUserId = "";
      let currentMetadata: any = {};

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        currentUserId = session.user.id;
        currentMetadata = session.user.user_metadata || {};
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          currentMetadata = user.user_metadata || {};
        }
      }

      if (!currentUserId) {
        router.push("/customer/login");
        return;
      }

      setUserId(currentUserId);

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("full_name, mobile, village_city, district")
        .eq("id", currentUserId)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || currentMetadata.full_name || "");
        setMobile(profile.mobile || currentMetadata.mobile || "");
        setVillageCity(profile.village_city || currentMetadata.village_city || "");
        setDistrict(profile.district || currentMetadata.district || "");
      } else {
        setFullName(currentMetadata.full_name || "");
        setMobile(currentMetadata.mobile || "");
        setVillageCity(currentMetadata.village_city || "");
        setDistrict(currentMetadata.district || "");
      }
    };

    loadProfile();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  /* =========================================================
     VOICE INPUT
  ========================================================= */

  const startVoiceInput = () => {
    if (!voiceSupported) {
      setErrorMessage(
        "Voice input is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage("");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setRequirements((current) => {
          const separator = current.trim() ? " " : "";
          return `${current}${separator}${finalTranscript.trim()}`;
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setErrorMessage(
        "Voice input could not start. Please check microphone permission."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Voice start error:", error);
      setIsListening(false);
    }
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    const allowedFiles = selectedFiles.filter((file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];

      return allowedTypes.includes(file.type);
    });

    setFiles((current) => {
      const updated = [...current, ...allowedFiles].slice(0, 5);
      return updated;
    });

    // Reset the input value so user can select the same file again if they removed it
    event.target.value = "";
  };

  useEffect(() => {
    const previews = files.map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      isImage: file.type.startsWith("image/"),
    }));
    setFilePreviews(previews);

    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [files]);

  const removeFile = (index: number) => {
    setFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  /* =========================================================
     SUBMIT REQUEST
  ========================================================= */

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setErrorMessage("Please login again before submitting.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!mobile.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    if (!plotLength.trim() || !plotWidth.trim()) {
      setErrorMessage("Please enter your plot length and width.");
      return;
    }

    if (!requirements.trim() && roomSummaryList.length === 0) {
      setErrorMessage("Please select at least one room quantity (using +) or explain your house requirements.");
      return;
    }

    setIsSubmitting(true);

    const roomText =
      roomSummaryList.length > 0
        ? `Required rooms & quantities: ${roomSummaryList.join(", ")}.`
        : "";

    const attachedFilesNote =
      files.length > 0
        ? `[Attached sketch/file(s): ${files.map((f) => f.name).join(", ")}]`
        : "";

    const finalRequirements = [roomText, requirements.trim(), attachedFilesNote]
      .filter(Boolean)
      .join(" ");

    // Read uploaded sketch/document into Data URL if attached
    let attachedDataUrl: string | null = null;
    if (files.length > 0) {
      const firstImage = files.find((f) => f.type.startsWith("image/") || f.type === "application/pdf") || files[0];
      if (firstImage) {
        try {
          attachedDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || "");
            reader.onerror = reject;
            reader.readAsDataURL(firstImage);
          });
        } catch (storageErr) {
          console.warn("Could not read attached file preview:", storageErr);
        }
      }
    }

    // Ensure customer profile is recorded/upserted in Supabase customer_profiles table
    try {
      await supabase.from("customer_profiles").upsert(
        {
          id: userId,
          full_name: fullName.trim(),
          mobile: mobile.trim(),
          village_city: villageCity.trim(),
          district: district.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (profErr) {
      console.warn("customer_profiles upsert note:", profErr);
    }

    const { data, error } = await supabase
      .from("customer_requests")
      .insert({
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        village_city: villageCity.trim(),
        district: district.trim(),
        plot_length: plotLength.trim(),
        plot_width: plotWidth.trim(),
        measurement_unit: measurementUnit,
        floors,
        requirements: finalRequirements,
        vastu_consultation: vastuConsultation || "Not specified",
        customer_user_id: userId,
        user_id: userId,
        attachment_url: attachedDataUrl || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Request submission error:", error);
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    console.log("Request created in Supabase:", data);

    // Persist real notification for this customer in Supabase notifications table
    if (data?.id) {
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          request_id: data.id,
          type: "general",
          title: "New House Plan Request Submitted",
          message: `Hello ${fullName.trim()}, aapki house plan request (${floors}, ${plotLength}x${plotWidth} ${measurementUnit}) successfully submit ho gayi hai. Humari architectural team jald hi review karegi.`,
          action_tab: "project",
          badge: "New Request",
          badge_color: "bg-[#eaf4eb] text-[#24632c]",
          is_read: false,
        });
      } catch (notifErr) {
        console.warn("Notification insert warning:", notifErr);
      }
    }

    setSuccessMessage(
      "Your request has been submitted successfully."
    );

    setIsSubmitting(false);

    setTimeout(() => {
      router.push("/customer/dashboard");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#17221b]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[253px] flex-col overflow-hidden bg-[#063b2c] text-white lg:flex">

        {/* BRAND */}

        <div className="px-5 pb-5 pt-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4ca64] text-[#063b2c]">
              <Home size={27} />
            </div>

            <div>
              <p className="font-serif text-[25px] font-bold tracking-wide">
                SARADA
              </p>

              <p className="-mt-1 text-[11px] font-semibold tracking-[0.25em] text-[#f4ca64]">
                HOMEPLAN
              </p>
            </div>

          </div>

        </div>

        <p className="px-7 text-[11px] font-medium uppercase tracking-[0.2em] text-white/65">
          Customer Portal
        </p>

        {/* NAVIGATION */}

        <nav className="mt-4 space-y-1 px-3">

          <SidebarItem
            icon={<Home size={21} />}
            label="Dashboard"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={21} />}
            label="Request New Plan"
            active
          />

          <SidebarItem
            icon={<FileText size={21} />}
            label="My Project"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<MapPin size={21} />}
            label="Site Visit"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={21} />}
            label="My Plans"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<CalendarDays size={21} />}
            label="Payments"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={21} />}
            label="Documents"
            onClick={() => router.push("/customer/dashboard")}
          />

          <SidebarItem
            icon={<User size={21} />}
            label="Profile"
            onClick={() => router.push("/customer/dashboard")}
          />

        </nav>

        {/* PROMO */}

        <div className="mx-4 mt-auto mb-4 overflow-hidden rounded-2xl">

          <div
            className="relative h-[190px] bg-cover bg-center"
            style={{
              backgroundImage: "url('/home.png')",
            }}
          >

            <div className="absolute inset-0 bg-[#063b2c]/65" />

            <div className="relative p-4">

              <p className="font-serif text-[21px] font-bold leading-6 text-white">
                Turn Your Ideas
                <br />
                into Real Plans
              </p>

              <div className="mt-4 space-y-2 text-[10px] text-white">

                <p>✓ Custom House Plans</p>
                <p>✓ Vastu Guidance</p>
                <p>✓ Expert Support</p>

              </div>

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="min-h-screen w-full lg:pl-[253px]">

        {/* HEADER */}

        <header className="sticky top-0 z-40 flex h-[82px] items-center justify-between border-b border-[#e6dfd3] bg-[#faf8f2]/95 px-5 backdrop-blur-md sm:px-8">

          <div className="flex w-full max-w-[600px] items-center">

            <button
              type="button"
              onClick={() => router.push("/customer/dashboard")}
              className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#ded7ca] bg-white lg:hidden"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative w-full">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
              />

              <input
                placeholder="Search your projects, plans, documents..."
                className="h-12 w-full rounded-full border border-[#ddd7cc] bg-white pl-11 pr-5 text-sm outline-none"
              />

            </div>

          </div>

          <div className="ml-5 flex items-center gap-4">

            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd7cc] bg-white"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-10 w-px bg-[#ddd7cc] sm:block" />

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2b84e] font-serif text-xl font-bold">
                {fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <div>
                <p className="text-sm font-bold">
                  {fullName || "Customer"}
                </p>
                <p className="text-[11px] text-black/50">
                  Customer
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="px-5 py-7 sm:px-8">

          {/* BREADCRUMB */}

          <div className="mb-5 flex items-center gap-2 text-sm text-black/45">

            <button
              type="button"
              onClick={() => router.push("/customer/dashboard")}
              className="hover:text-[#063b2c]"
            >
              Dashboard
            </button>

            <span>›</span>

            <span className="font-semibold text-[#17221b]">
              Request New Plan
            </span>

          </div>

          {/* TITLE */}

          <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#e5ddd0] bg-[#f8f2e4] px-7 py-6">

            <div className="relative z-10 max-w-[650px]">

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9b7732]">
                Sarada HomePlan
              </p>

              <h1 className="mt-1 font-serif text-4xl font-bold text-[#063b2c]">
                Request a New Plan
              </h1>

              <p className="mt-2 text-sm text-black/60">
                Tell us your requirements and get a customized
                home plan designed around your needs.
              </p>

            </div>

            <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[340px] overflow-hidden lg:block">

              <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{
                  backgroundImage: "url('/home.png')",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#f8f2e4] via-[#f8f2e4]/30 to-transparent" />

            </div>

          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

            {/* =================================================
                FORM CARD
            ================================================= */}

            <div className="rounded-3xl border border-[#e5ddd0] bg-white shadow-[0_10px_35px_rgba(23,34,27,0.04)]">

              {/* STEPS */}

              <div className="border-b border-[#eee7db] px-6 py-6 sm:px-8">

                <div className="flex items-start justify-between">

                  <StepItem
                    number="1"
                    label="Basic Details"
                    active
                  />

                  <StepLine />

                  <StepItem
                    number="2"
                    label="Plot Details"
                  />

                  <StepLine />

                  <StepItem
                    number="3"
                    label="Requirements"
                  />

                  <StepLine />

                  <StepItem
                    number="4"
                    label="Documents"
                  />

                  <StepLine />

                  <StepItem
                    number="5"
                    label="Review & Submit"
                  />

                </div>

              </div>

              <div className="space-y-8 p-6 sm:p-8">

                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <FormSection
                  icon={<User size={22} />}
                  title="Basic Information"
                  description="Your profile details are auto-filled. You can update them if needed."
                >

                  <div className="grid gap-4 md:grid-cols-2">

                    <InputField
                      label="Full Name"
                      value={fullName}
                      onChange={setFullName}
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Mobile Number"
                      value={mobile}
                      onChange={setMobile}
                      icon={<Phone size={17} />}
                    />

                    <InputField
                      label="Village / City"
                      value={villageCity}
                      onChange={setVillageCity}
                      icon={<MapPin size={17} />}
                    />

                    <InputField
                      label="District"
                      value={district}
                      onChange={setDistrict}
                      icon={<CalendarDays size={17} />}
                    />

                  </div>

                </FormSection>

                {/* =================================================
                    PLOT DETAILS
                ================================================= */}

                <FormSection
                  icon={<Ruler size={22} />}
                  title="Plot Details"
                  description="Share your land or plot measurements. Approximate values are okay."
                >

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <InputField
                      label="Plot Length"
                      value={plotLength}
                      onChange={setPlotLength}
                      placeholder="e.g. 30"
                      icon={<Ruler size={16} />}
                    />

                    <InputField
                      label="Plot Width"
                      value={plotWidth}
                      onChange={setPlotWidth}
                      placeholder="e.g. 40"
                      icon={<Ruler size={16} />}
                    />

                    <SelectField
                      label="Unit"
                      value={measurementUnit}
                      onChange={setMeasurementUnit}
                      options={[
                        "Feet (ft)",
                        "Meter (m)",
                        "Yard (yd)",
                      ]}
                    />

                    <SelectField
                      label="Total Floors"
                      value={floors}
                      onChange={setFloors}
                      options={[
                        "1 Floor",
                        "G+1",
                        "G+2",
                        "G+3",
                        "Other",
                      ]}
                    />

                  </div>

                </FormSection>

                {/* =================================================
                    HOUSE REQUIREMENTS
                ================================================= */}

                <FormSection
                  icon={<FileText size={22} />}
                  title="House Requirements"
                  description="Set the count of each room with + and - buttons (e.g. 3 Bedrooms, 2 Washrooms)."
                >

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                    {roomList.map((room) => {
                      const qty = roomQuantities[room.name] || 0;
                      const isSelected = qty > 0;

                      return (
                        <div
                          key={room.name}
                          className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
                            isSelected
                              ? "border-[#063b2c] bg-[#eef6f1] shadow-xs"
                              : "border-[#ddd7cc] bg-white hover:border-[#b8ad9c]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <p
                                className={`text-sm font-bold ${
                                  isSelected
                                    ? "text-[#063b2c]"
                                    : "text-[#17221b]"
                                }`}
                              >
                                {room.name}
                              </p>
                              <p className="text-[11px] text-black/45 leading-tight">
                                {room.hint}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#063b2c] px-1.5 text-[10px] font-bold text-white shadow-xs">
                                {qty}
                              </span>
                            )}
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-black/5 pt-2.5">
                            <span className="text-[11px] font-semibold text-black/55">
                              Qty:
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomQuantity(room.name, -1)
                                }
                                disabled={qty === 0}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#cfc8bc] bg-white text-[#17221b] transition hover:bg-black/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                                title="Kam karein (-)"
                              >
                                <Minus size={13} strokeWidth={2.5} />
                              </button>

                              <span
                                className={`min-w-6 text-center text-xs font-bold ${
                                  isSelected
                                    ? "text-[#063b2c]"
                                    : "text-black/40"
                                }`}
                              >
                                {qty}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomQuantity(room.name, 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#063b2c] text-white transition hover:bg-[#0a4d3a] active:scale-95 shadow-xs"
                                title="Badhayein (+)"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  {/* SUMMARY CHIPS OF SELECTED ROOMS */}
                  {roomSummaryList.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-[#e6f1ec] p-3.5 border border-[#d2e5d9]">
                      <span className="text-xs font-bold text-[#063b2c]">
                        Selected Configuration:
                      </span>
                      {roomSummaryList.map((item, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#063b2c] shadow-xs border border-[#bdd5c7]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* TEXT REQUIREMENTS */}

                  <div className="mt-5">

                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <FileText size={16} />
                      Additional Requirements
                    </label>

                    <textarea
                      value={requirements}
                      onChange={(event) =>
                        setRequirements(event.target.value.slice(0, 1000))
                      }
                      placeholder="e.g. open kitchen, balcony, garden, store room, staircase, etc."
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-[#ddd7cc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                    />

                    <div className="mt-1 text-right text-[11px] text-black/40">
                      {requirements.length}/1000
                    </div>

                  </div>

                  {/* =================================================
                      VOICE INPUT
                  ================================================= */}

                  <div className="mt-5 rounded-2xl border border-[#e4d9c4] bg-[#fff9ed] p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-start gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            isListening
                              ? "bg-red-100 text-red-600"
                              : "bg-[#f5d78a] text-[#063b2c]"
                          }`}
                        >
                          {isListening ? (
                            <Volume2 size={22} />
                          ) : (
                            <Mic size={22} />
                          )}
                        </div>

                        <div>

                          <h3 className="font-serif text-lg font-bold text-[#063b2c]">
                            Explain Your Requirements
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-black/55">
                            Simply speak about your needs and we will
                            convert your voice into text automatically.
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <Globe
                          size={15}
                          className="text-black/45"
                        />

                        <select
                          value={voiceLanguage}
                          onChange={(event) =>
                            setVoiceLanguage(event.target.value)
                          }
                          className="rounded-lg border border-[#ddd0b8] bg-white px-2.5 py-2 text-xs font-medium outline-none"
                        >
                          <option value="hi-IN">Hindi</option>
                          <option value="en-IN">English</option>
                          <option value="ur-PK">Urdu</option>
                          <option value="bn-IN">Bengali</option>
                          <option value="pa-IN">Punjabi</option>
                          <option value="mr-IN">Marathi</option>
                        </select>

                      </div>

                    </div>

                    {/* VOICE BUTTON */}

                    <button
                      type="button"
                      onClick={startVoiceInput}
                      disabled={!voiceSupported}
                      className={`mx-auto mt-5 flex items-center justify-center gap-3 rounded-full px-7 py-3 text-sm font-semibold shadow-sm transition ${
                        isListening
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-[#063b2c] text-white hover:bg-[#0a4d3a]"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >

                      {isListening ? (
                        <>
                          <MicOff size={18} />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic size={18} />
                          Start Speaking
                        </>
                      )}

                    </button>

                    <p className="mt-3 text-center text-[11px] text-black/45">
                      {isListening
                        ? "Listening... Speak naturally about your house requirements."
                        : "Your voice will be converted into editable text above."}
                    </p>

                  </div>

                </FormSection>

                {/* =================================================
                    VASTU
                ================================================= */}

                <FormSection
                  icon={<Home size={22} />}
                  title="Vastu Consultation"
                  description="Tell us whether you would like Vastu-based planning consultation."
                >

                  <div className="grid gap-3 sm:grid-cols-3">

                    {[
                      "Yes, I want Vastu consultation",
                      "No",
                      "I am not sure",
                    ].map((option) => (

                      <label
                        key={option}
                        className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                          vastuConsultation === option
                            ? "border-[#063b2c] bg-[#eef6f1] text-[#063b2c]"
                            : "border-[#ddd7cc] bg-white hover:border-[#b8ad9c]"
                        }`}
                      >

                        <input
                          type="radio"
                          name="vastu"
                          value={option}
                          checked={vastuConsultation === option}
                          onChange={(event) =>
                            setVastuConsultation(event.target.value)
                          }
                          className="mr-3 accent-[#063b2c]"
                        />

                        {option}

                      </label>

                    ))}

                  </div>

                </FormSection>

                {/* =================================================
                    DOCUMENTS
                ================================================= */}

                <FormSection
                  icon={<Upload size={22} />}
                  title="Share Your Ideas"
                  description="Upload a rough sketch, site photo, old map or reference image if available."
                >
                  {files.length === 0 ? (
                    <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8cdbb] bg-[#faf8f2] px-5 py-6 text-center transition hover:border-[#063b2c] hover:bg-[#f5f7f1]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b2c]/10 text-[#063b2c]">
                        <ImagePlus size={28} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#17221b]">
                        Click or tap to upload rough sketch / photo
                      </p>

                      <p className="mt-1 text-xs text-black/50">
                        Paper sketch, diary drawing, photo ya PDF • Max 10MB each
                      </p>

                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#063b2c] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                        <Upload size={13} /> Choose from device
                      </span>

                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFiles}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="rounded-2xl border-2 border-[#063b2c]/20 bg-[#faf8f2] p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#ebd7b0]/50 pb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063b2c]">
                          <Check size={14} className="text-[#0c7a62]" />
                          {files.length} file{files.length > 1 ? "s" : ""} uploaded
                        </span>

                        {files.length < 5 && (
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#063b2c] bg-white px-3 py-1 text-xs font-bold text-[#063b2c] hover:bg-[#063b2c] hover:text-white transition">
                            <Plus size={13} />
                            <span>Add more files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleFiles}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Visual In-Box Thumbnail Grid */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {filePreviews.map((item, index) => {
                          const sizeKb = Math.round(item.file.size / 1024);
                          const sizeDisplay =
                            sizeKb > 1024
                              ? `${(sizeKb / 1024).toFixed(1)} MB`
                              : `${sizeKb} KB`;

                          return (
                            <div
                              key={`${item.file.name}-${index}`}
                              className="group relative overflow-hidden rounded-xl border border-[#ded8cb] bg-white shadow-sm transition hover:shadow-md"
                            >
                              {item.isImage ? (
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eee9df]">
                                  <img
                                    src={item.url}
                                    alt={item.file.name}
                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewModalUrl({
                                          url: item.url,
                                          name: item.file.name,
                                        })
                                      }
                                      className="rounded-full bg-white p-2 text-black shadow hover:bg-neutral-100"
                                      title="Inspect Sketch"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-700"
                                      title="Remove"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-[#fdf5f2] p-4 text-center">
                                  <FileText size={38} className="text-red-500" />
                                  <span className="mt-2 text-[11px] font-bold uppercase text-red-600">
                                    PDF Document
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-200"
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              )}

                              <div className="p-2.5">
                                <p className="truncate text-xs font-semibold text-[#17221b]">
                                  {item.file.name}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-black/50">
                                  <span>{sizeDisplay}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="font-bold text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {files.length < 5 && (
                          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8cdbb] bg-white/70 p-4 text-center transition hover:border-[#063b2c] hover:bg-white">
                            <Plus size={24} className="text-[#063b2c]" />
                            <span className="mt-1 text-xs font-bold text-[#17221b]">
                              + Add Another
                            </span>
                            <span className="text-[10px] text-black/40">
                              Sketch or photo
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleFiles}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </FormSection>

                {/* =================================================
                    ERROR / SUCCESS
                ================================================= */}

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    <Check size={18} />
                    {successMessage}
                  </div>
                )}

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-col-reverse gap-3 border-t border-[#eee7db] pt-6 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/customer/dashboard")
                    }
                    className="flex items-center justify-center gap-2 rounded-full border border-[#d7d0c4] bg-white px-6 py-3 text-sm font-semibold text-[#17221b] transition hover:bg-[#f6f3ec]"
                  >
                    <ArrowLeft size={17} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-3 rounded-full bg-[#063b2c] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#063b2c]/10 transition hover:bg-[#0a4d3a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Request"}

                    {!isSubmitting && (
                      <ArrowRight size={18} />
                    )}
                  </button>

                </div>

              </div>
            </div>

            {/* =================================================
                RIGHT INFORMATION PANEL
            ================================================= */}

            <aside className="space-y-5">

              <div className="rounded-3xl border border-[#e5ddd0] bg-white p-6">

                <h2 className="font-serif text-xl font-bold text-[#17221b]">
                  Why Choose Sarada HomePlan?
                </h2>

                <div className="mt-5 space-y-5">

                  <InfoItem
                    icon={<Home size={19} />}
                    title="Customized House Plans"
                    text="Designed around your space and requirements."
                  />

                  <InfoItem
                    icon={<Home size={19} />}
                    title="Vastu Guidance"
                    text="Optional consultation based on your preference."
                  />

                  <InfoItem
                    icon={<Lock size={18} />}
                    title="Clear Communication"
                    text="Stay informed throughout your planning journey."
                  />

                  <InfoItem
                    icon={<MessageIcon />}
                    title="Easy Communication"
                    text="Share your ideas through text, voice or images."
                  />

                </div>

              </div>

              <div className="overflow-hidden rounded-3xl border border-[#e5ddd0] bg-white">

                <div
                  className="h-[180px] bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/home.png')",
                  }}
                />

                <div className="p-5">

                  <h3 className="font-serif text-xl font-bold text-[#063b2c]">
                    From Your Vision to a Plan
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/55">
                    Share your requirements with us and we will
                    guide you through the planning process.
                  </p>

                </div>

              </div>

            </aside>

          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* UPLOADED IMAGE INSPECT MODAL */}
      {/* ========================================================= */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewModalUrl(null)}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-neutral-200"
            aria-label="Close Preview"
          >
            <X size={20} />
          </button>

          <div
            className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewModalUrl.url}
              alt={previewModalUrl.name}
              className="max-h-[82vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 rounded-full bg-black/75 px-4 py-1.5 text-xs font-semibold text-white">
              {previewModalUrl.name}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#f4ca64] font-bold text-[#063b2c]"
          : "text-white/90 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>

      <div className="mb-5 flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0c9] text-[#b07e17]">
          {icon}
        </div>

        <div>

          <h2 className="font-serif text-[21px] font-bold text-[#17221b]">
            {title}
          </h2>

          <p className="mt-1 text-xs text-black/50">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-[#17221b]">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
            {icon}
          </span>
        )}

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-[48px] w-full rounded-xl border border-[#ddd7cc] bg-white text-sm outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10 ${
            icon ? "pl-11" : "px-4"
          } pr-4`}
        />

      </div>

    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-[#17221b]">
        {label}
      </label>

      <div className="relative">

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[48px] w-full appearance-none rounded-xl border border-[#ddd7cc] bg-white px-4 pr-10 text-sm outline-none focus:border-[#063b2c]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
        />

      </div>

    </div>
  );
}

/* =========================================================
   STEP ITEM
========================================================= */

function StepItem({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
          active
            ? "border-[#063b2c] bg-[#063b2c] text-white"
            : "border-[#d5d0c7] bg-white text-black/45"
        }`}
      >
        {number}
      </div>

      <span
        className={`mt-2 hidden text-center text-[10px] font-semibold sm:block ${
          active ? "text-[#063b2c]" : "text-black/45"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

function StepLine() {
  return (
    <div className="mt-4 h-px flex-1 bg-[#ddd8cf]" />
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0ca] text-[#a87918]">
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold text-[#17221b]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-black/50">
          {text}
        </p>

      </div>

    </div>
  );
}

function MessageIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.6 8.6 0 0 1-4-.9L3 21l1.9-4.5A8.38 8.38 0 0 1 3 11.5a8.38 8.38 0 0 1 9-8.5 8.38 8.38 0 0 1 9 8.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}