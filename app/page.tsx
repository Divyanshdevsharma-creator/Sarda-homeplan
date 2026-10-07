"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home as HomeIcon,
  Building2,
  Ruler,
  Compass,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Play,
  Search,
  Sun,
  Moon,
  FileText,
  Sparkles,
  Clock,
  ShieldCheck,
  Layers,
  Send,
  X,
  Maximize2,
  User,
  LogIn,
  Calendar,
  CreditCard,
  Bell,
  Eye,
  HelpCircle,
  Menu,
} from "lucide-react";
import { createClient } from "../lib/supabase-client";

// ============================================================================
// DATA: FEATURED PLANS (Matches Design Mockup)
// ============================================================================
interface FeaturedPlan {
  id: string;
  badge: string;
  title: string;
  specs: string;
  category: "2bhk" | "3bhk" | "duplex" | "compact" | "vastu";
  dimensions: string;
  facing: string;
  image: string;
  blueprint: string;
  description: string;
}

const FEATURED_PLANS: FeaturedPlan[] = [
  {
    id: "plan-1",
    badge: "2 BHK",
    title: "Modern Home Plan",
    specs: "Bedroom • Kitchen • Hall • Parking",
    category: "2bhk",
    dimensions: "30 x 40 Ft (1200 Sq.Ft)",
    facing: "East Facing (Purab)",
    image: "/portfolio/house-plan-01-hd.jpg",
    blueprint: "/portfolio/house-plan-01-hd.jpg",
    description: "Spacious 2 BHK layout designed with cross-ventilation, separate puja space, wide modular kitchen, and dedicated car porch.",
  },
  {
    id: "plan-2",
    badge: "3 BHK",
    title: "Family House Plan",
    specs: "3 Bedroom • Drawing • Dining",
    category: "3bhk",
    dimensions: "35 x 50 Ft (1750 Sq.Ft)",
    facing: "North Facing (Uttar)",
    image: "/portfolio/house-plan-02-hd.jpg",
    blueprint: "/portfolio/house-plan-02-hd.jpg",
    description: "Premium joint family house plan with master bedroom, attached toilets, spacious living hall, and independent guest room.",
  },
  {
    id: "plan-3",
    badge: "Duplex",
    title: "Duplex House Plan",
    specs: "2 Floors • Modern Design",
    category: "duplex",
    dimensions: "25 x 45 Ft (2250 Sq.Ft Total)",
    facing: "East Facing (Purab)",
    image: "/portfolio/house-plan-03-hd.jpg",
    blueprint: "/portfolio/house-plan-03-hd.jpg",
    description: "Contemporary two-story duplex with open-to-sky terrace, internal curved staircase, double-height living room, and balcony.",
  },
  {
    id: "plan-4",
    badge: "Compact",
    title: "Compact Home Plan",
    specs: "Smart Space • 2 BHK",
    category: "compact",
    dimensions: "20 x 40 Ft (800 Sq.Ft)",
    facing: "West Facing (Pashchim)",
    image: "/portfolio/house-plan-04-hd.jpg",
    blueprint: "/portfolio/house-plan-04-hd.jpg",
    description: "Zero wastage compact residential plan optimized for narrow village and town plots with maximum light and ventilation.",
  },
  {
    id: "plan-5",
    badge: "Vastu",
    title: "Vastu Based Plan",
    specs: "Spiritual • Practical • Modern",
    category: "vastu",
    dimensions: "30 x 45 Ft (1350 Sq.Ft)",
    facing: "North-East (Ishan Kon Entrance)",
    image: "/portfolio/house-plan-05-hd.jpg",
    blueprint: "/portfolio/house-plan-05-hd.jpg",
    description: "100% Vastu-compliant layout: kitchen in Agni Kon (SE), master bedroom in Nairutya (SW), temple in Ishan (NE).",
  },
];

// ============================================================================
// DATA: OUR SERVICES (5 Core Services in Mockup)
// ============================================================================
interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  highlights: string[];
  description: string;
  badge: string;
}

const SERVICES_LIST: ServiceItem[] = [
  {
    id: "floor-plans",
    title: "House Floor Plans",
    tagline: "2 BHK, 3 BHK, Duplex and more • Modern & practical designs",
    highlights: ["2 BHK, 3 BHK, Duplex and more", "Modern & practical designs", "Space optimization guaranteed"],
    description: "Architectural 2D layout planning customized to your family structure, lifestyle needs, and future expansion possibilities.",
    badge: "Most Popular",
  },
  {
    id: "map-redrawing",
    title: "Map Redrawing",
    tagline: "Convert your rough sketch to professional plan • Accurate measurements",
    highlights: ["Convert rough paper sketch to CAD", "Accurate millimeter measurements", "Wall thickness & column alignment"],
    description: "Send us a photo of your hand-drawn sketch or diary note. Our architects translate it into professional CAD blueprints with standard dimensions.",
    badge: "Fast 24h",
  },
  {
    id: "custom-planning",
    title: "Custom Planning",
    tagline: "As per your plot, budget and requirements • Modern & unique designs",
    highlights: ["As per your plot shape & budget", "Irregular plot solutions (Tircha Plot)", "Multi-generation planning"],
    description: "Specialized custom house planning tailored for difficult plot shapes (L-shape, triangular, narrow frontage) with maximum utility.",
    badge: "Personalized",
  },
  {
    id: "vastu-consultation",
    title: "Vastu Consultation",
    tagline: "Vastu based house planning • Guidance from experts",
    highlights: ["Vastu based room positioning", "Ishan, Agni, Vayu, Nairutya balance", "Remedy-free initial planning"],
    description: "Ensure peace, health, and prosperity by aligning entrance doors, kitchen stove, master bed, water tank, and septic tank strictly per Vastu Shastra.",
    badge: "Vastu Verified",
  },
  {
    id: "site-visit",
    title: "Site Visit Consultation",
    tagline: "On-site discussion (Pratapgarh & nearby) • Better planning & accuracy",
    highlights: ["On-site physical inspection", "Pratapgarh & neighbouring districts", "Road level & soil orientation review"],
    description: "Our field team physically visits your plot to check front road width, boundary dispute clearances, surrounding buildings, and drainage slopes.",
    badge: "On-Site Visit",
  },
];

// ============================================================================
// DATA: TESTIMONIALS (From Design Mockup)
// ============================================================================
const TESTIMONIALS = [
  {
    id: 1,
    name: "Amit Kumar",
    location: "Pratapgarh",
    rating: 5,
    quote: "Bahut hi accha plan banaya. Hamari saari requirements ka dhyan me rakha gaya. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    role: "Homeowner, 3 BHK Duplex",
  },
  {
    id: 2,
    name: "Neha Singh",
    location: "Pratapgarh",
    rating: 5,
    quote: "Rough sketch se itna professional map ban jayega, socha nahi tha. Communication bhi bahut smooth tha.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    role: "Plot Owner, 2 BHK Modern",
  },
  {
    id: 3,
    name: "Rajesh Verma",
    location: "Nearby Area",
    rating: 5,
    quote: "Vastu ke saath modern design diya. Ghar banana ab kaafi easy lag raha hai. Great service!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    role: "Homeowner, Compact 2 BHK",
  },
];

// ============================================================================
// DATA: FAQS (From Design Mockup)
// ============================================================================
const FAQS = [
  {
    question: "Map banane me kitna time lagta hai?",
    answer: "Initial rough concept plan hum 24 se 48 ghante ke andar customer dashboard par upload kar dete hain. Customer review aur revisions ke baad final CAD blueprint 2 se 3 din me deliver hota hai.",
  },
  {
    question: "Kya aap Vastu consultation bhi dete hain?",
    answer: "Haan, bilkul! Hamare har plan me basic Vastu principles (jaise Agni Kon me kitchen, Ishan Kon me puja ghar, aur Nairutya me master bedroom) ko default me follow kiya jata hai. Deep Vastu compliance bhi available hai.",
  },
  {
    question: "Kya mai apna rough sketch bhej sakte ho?",
    answer: "Haan! Aap kisi bhi kaghaz ya diary par hath se bana hua rough sketch WhatsApp par bhej sakte hain ya hamare portal par direct upload kar sakte hain. Hum use exact millimeter measurements ke saath CAD me redraw karte hain.",
  },
  {
    question: "Payment kaise karna hota hai?",
    answer: "Payment bahut transparent aur safe hai. Site visit ya drafting shuru karne ke liye chhota advance amount lia jata hai. Aap UPI, PhonePe, Google Pay, ya Bank Transfer ke through payment kar sakte hain aur verified receipt dashboard se download kar sakte hain.",
  },
  {
    question: "Kya aap site visit karte hain?",
    answer: "Haan! Pratapgarh, Prayagraj, Sultanpur, Jaunpur, Varanasi, aur aas-paas ke sabhi kshetro me hamari team physically plot par aakar measurements verify karti hai aur road level check karti hai.",
  },
];

export default function Home() {
  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");
  const [activePlanModal, setActivePlanModal] = useState<FeaturedPlan | null>(null);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const [quickInquiryOpen, setQuickInquiryOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [beforeAfterSlider, setBeforeAfterSlider] = useState<number>(50);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("hi-IN");
  const [voiceWave, setVoiceWave] = useState(false);

  // Form States (Intake / Inquiry)
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [villageCity, setVillageCity] = useState("");
  const [district, setDistrict] = useState("Pratapgarh");
  const [plotLength, setPlotLength] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("feet");
  const [floors, setFloors] = useState("Ground Floor (1 Floor)");
  const [vastuConsultation, setVastuConsultation] = useState("Yes");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sliderRef = useRef<HTMLDivElement>(null);

  // Voice Assistant Handler
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceWave(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setRequirements((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
      }
      setIsListening(false);
      setVoiceWave(false);
      // Auto-open inquiry popup if user spoke from the dedicated voice card
      setQuickInquiryOpen(true);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setVoiceWave(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        alert(`Voice input notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceWave(false);
    };

    try {
      recognition.start();
    } catch (_) {
      setIsListening(false);
      setVoiceWave(false);
    }
  };

  // Submit Requirement to Supabase customer_requests
  const handleSubmitRequirement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanName = fullName.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, "");

    if (!cleanName) {
      setErrorMessage("Kripya apna poora naam enter karein.");
      return;
    }
    if (cleanMobile.length < 10) {
      setErrorMessage("Kripya 10-digit mobile number enter karein.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: insertedReq, error } = await supabase
        .from("customer_requests")
        .insert({
          full_name: cleanName,
          mobile: cleanMobile,
          village_city: villageCity.trim() || "Pratapgarh",
          district: district.trim() || "Pratapgarh",
          plot_length: plotLength ? String(plotLength) : "30",
          plot_width: plotWidth ? String(plotWidth) : "40",
          measurement_unit: measurementUnit,
          floors: floors,
          requirements: requirements.trim() || "New House Planning Inquiry from Homepage",
          vastu_consultation: vastuConsultation,
          status: "New Request",
          customer_user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Submission error:", error);
        setErrorMessage(`Submission Error: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Add instant notification for Admin
      try {
        await supabase.from("notifications").insert({
          user_id: user?.id || null,
          title: "New House Plan Request",
          message: `${cleanName} (${cleanMobile}) ne naya house plan request submit kiya hai.`,
          is_read: false,
        });
      } catch (_) {}

      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit request.");
      setIsSubmitting(false);
    }
  };

  // Filtered plans
  const filteredPlans = FEATURED_PLANS.filter((plan) => {
    if (portfolioFilter !== "all" && plan.category !== portfolioFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        plan.title.toLowerCase().includes(q) ||
        plan.badge.toLowerCase().includes(q) ||
        plan.specs.toLowerCase().includes(q) ||
        plan.dimensions.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Before-After drag slider
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setBeforeAfterSlider(Math.max(0, Math.min(100, pos)));
  };

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDarkMode ? "bg-[#101914] text-[#f4f2ea]" : "bg-[#f8f6f0] text-[#17221b]"
      }`}
    >
      {/* =====================================================================
          1. TOP NAVBAR (Matches Design Mockup Exactly)
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#e8e2d4] bg-[#f8f6f0]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b2c] text-[#d9b45a] shadow-sm transition group-hover:scale-105">
              <HomeIcon size={22} strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <span className="font-serif text-[20px] font-bold tracking-tight text-[#063b2c] sm:text-[22px]">
                SARDA
              </span>
              <span className="block text-[8px] font-extrabold tracking-[0.3em] text-[#9b7732]">
                HOMEPLAN
              </span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="hidden items-center gap-7 text-xs font-semibold text-black/75 md:flex">
            <a href="#home" className="transition hover:text-[#063b2c]">
              Home
            </a>
            <a href="#about" className="transition hover:text-[#063b2c]">
              About
            </a>
            <a href="#services" className="transition hover:text-[#063b2c]">
              Services
            </a>
            <a href="#portfolio" className="transition hover:text-[#063b2c]">
              Portfolio
            </a>
            <a href="#process" className="transition hover:text-[#063b2c]">
              How It Works
            </a>
            <a href="#contact" className="transition hover:text-[#063b2c]">
              Contact
            </a>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 shadow-sm transition hover:bg-white hover:text-[#063b2c]"
              aria-label="Search Plans"
              title="Search Floor Plans"
            >
              <Search size={15} />
            </button>

            {/* Dark/Light Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 shadow-sm transition hover:bg-white hover:text-[#063b2c]"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Login Link */}
            <Link
              href="/customer/login"
              className="rounded-full border border-black/15 bg-white/80 px-4 py-2 text-xs font-bold text-[#17221b] shadow-sm transition hover:bg-white hover:border-[#063b2c]"
            >
              Login
            </Link>

            {/* Primary CTA Button */}
            <button
              type="button"
              onClick={() => setQuickInquiryOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#063b2c] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#0b4d3a] hover:shadow-lg"
            >
              <span>Get Your Map</span>
              <ArrowRight size={13} />
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/80 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="border-b border-[#e8e2d4] bg-[#f8f6f0] px-6 py-4 shadow-xl md:hidden">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-black/80">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                About
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                Services
              </a>
              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                Portfolio
              </a>
              <a
                href="#process"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                How It Works
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                Contact
              </a>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setQuickInquiryOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-2.5 text-xs font-bold text-white shadow-md"
                >
                  <span>Get Your Map →</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          2. HERO SECTION (Apne Ghar Ka Sapna, Ek Perfect Plan Ke Saath)
      ===================================================================== */}
      <section id="home" className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* LEFT: HERO COPY */}
            <div className="lg:col-span-7">
              {/* Category Pills */}
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  House Plans
                </span>
                <span className="text-black/30">•</span>
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  Custom Design
                </span>
                <span className="text-black/30">•</span>
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  Vastu Consultation
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl font-extrabold leading-[1.12] tracking-tight text-[#11241c] sm:text-5xl lg:text-[54px] xl:text-[58px]">
                Apne Ghar Ka Sapna,
                <br />
                Ek <span className="text-[#c18c21] font-serif underline decoration-[#e5cf95]/80 decoration-wavy decoration-2">Perfect Plan</span> Ke Saath.
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
                Aapke rough sketch se lekar professional house map tak —
                <strong className="text-[#063b2c]"> simple, affordable</strong> aur aapki zarurat ke hisaab se.
              </p>

              {/* Dual CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setQuickInquiryOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-[#063b2c] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b4d3a] hover:shadow-xl"
                >
                  <span>Get Your House Map</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#portfolio"
                  className="flex items-center gap-2 rounded-full border border-black/15 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#17221b] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:border-[#063b2c]"
                >
                  <span>View Our Work</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#063b2c] text-white">
                    <Play size={9} className="ml-0.5 fill-white" />
                  </div>
                </a>
              </div>

              {/* 4 Bottom Trust Pillars */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-[#e8e2d4]">
                <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2.5 border border-[#ede5d5]">
                  <Ruler size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">Custom Planning</strong>
                    <span className="text-black/50 text-[10px]">as per your needs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2.5 border border-[#ede5d5]">
                  <Building2 size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">Personal Consult</strong>
                    <span className="text-black/50 text-[10px]">Online & On-site</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2.5 border border-[#ede5d5]">
                  <Sparkles size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">Hindi • Urdu • Eng</strong>
                    <span className="text-black/50 text-[10px]">Direct Support</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2.5 border border-[#ede5d5]">
                  <MapPin size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">Trusted Local</strong>
                    <span className="text-black/50 text-[10px]">Pratapgarh & Nearby</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: HERO VISUAL (House 3D Render + Floating Badges) */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-[480px] lg:max-w-none">
                {/* Handwritten Floating Tag */}
                <div className="absolute -top-6 right-2 z-20 hidden rotate-6 rounded-2xl bg-[#fff9ea] px-3.5 py-1.5 border border-[#e4cb8e] text-center shadow-md sm:block">
                  <p className="font-serif text-xs font-bold text-[#8a6316] italic">
                    &ldquo;Your Dream Home, Our Plan&rdquo;
                  </p>
                </div>

                {/* Main Visual Frame */}
                <div className="relative overflow-hidden rounded-[2.2rem] border-2 border-white bg-gradient-to-b from-[#e5dac5] to-[#f4f0e6] p-2.5 shadow-[0_25px_60px_rgba(20,35,27,0.18)]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.8rem] bg-[#0c2a20]">
                    <img
                      src="/home.png"
                      alt="Modern House Elevation by Sarda Homeplan"
                      className="h-full w-full object-cover"
                    />

                    {/* Gradient Overlay for Blueprint effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Verified Blueprint Badge */}
                    <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 backdrop-blur-md border border-white/20 text-white shadow-lg">
                      <ShieldCheck size={16} className="text-[#f4cf72]" />
                      <span className="text-[11px] font-bold">100% Vastu & Municipal Approved</span>
                    </div>
                  </div>
                </div>

                {/* 4 Floating Badges (From Mockup) */}
                <div className="absolute -bottom-6 -right-2 z-20 flex flex-col gap-2 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs sm:-right-4">
                  <div className="flex items-center gap-2 font-bold text-[#17221b]">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#eef8f4] text-[#0c7a62]">
                      ✓
                    </div>
                    <span>Modern Designs</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#17221b]">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#fff8e7] text-[#c18c21]">
                      🧭
                    </div>
                    <span>Vastu Friendly Plans</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#17221b]">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#eef8f4] text-[#0c7a62]">
                      💰
                    </div>
                    <span>Affordable Pricing</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#17221b]">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#fff8e7] text-[#c18c21]">
                      ⏱️
                    </div>
                    <span>Timely Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. STATS COUNTER RIBBON (100+ Completed Maps, 500+ Happy Customers)
      ===================================================================== */}
      <section className="border-y border-[#e8e2d4] bg-[#fbf9f4] py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
            <div className="flex items-center justify-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b2c] text-[#f4cf72] shadow-sm">
                <FileText size={22} />
              </div>
              <div className="text-left">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#11241c]">
                  100+
                </span>
                <p className="text-[11px] font-semibold tracking-wide text-black/55 uppercase">
                  Completed Maps
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b2c] text-[#f4cf72] shadow-sm">
                <User size={22} />
              </div>
              <div className="text-left">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#11241c]">
                  500+
                </span>
                <p className="text-[11px] font-semibold tracking-wide text-black/55 uppercase">
                  Happy Customers
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b2c] text-[#f4cf72] shadow-sm">
                <Clock size={22} />
              </div>
              <div className="text-left">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#11241c]">
                  5+
                </span>
                <p className="text-[11px] font-semibold tracking-wide text-black/55 uppercase">
                  Years of Experience
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b2c] text-[#f4cf72] shadow-sm">
                <MapPin size={22} />
              </div>
              <div className="text-left">
                <span className="font-serif text-lg sm:text-xl font-extrabold text-[#11241c] leading-tight">
                  Pratapgarh & Nearby
                </span>
                <p className="text-[11px] font-semibold tracking-wide text-black/55 uppercase">
                  Service Area
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FEATURED HOUSE PLANS (Portfolio Gallery from Mockup)
      ===================================================================== */}
      <section id="portfolio" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                Our Architectural Portfolio
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
                Featured <span className="text-[#c18c21] font-serif">House Plans</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                Some of our recent work. Click any card to view full architectural map.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPortfolioFilter("all")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  portfolioFilter === "all"
                    ? "bg-[#063b2c] text-white"
                    : "bg-white border border-black/10 text-black/70 hover:bg-[#f0ebe0]"
                }`}
              >
                All Plans
              </button>
              <button
                type="button"
                onClick={() => setPortfolioFilter("2bhk")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  portfolioFilter === "2bhk"
                    ? "bg-[#063b2c] text-white"
                    : "bg-white border border-black/10 text-black/70 hover:bg-[#f0ebe0]"
                }`}
              >
                2 BHK
              </button>
              <button
                type="button"
                onClick={() => setPortfolioFilter("3bhk")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  portfolioFilter === "3bhk"
                    ? "bg-[#063b2c] text-white"
                    : "bg-white border border-black/10 text-black/70 hover:bg-[#f0ebe0]"
                }`}
              >
                3 BHK
              </button>
              <button
                type="button"
                onClick={() => setPortfolioFilter("duplex")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  portfolioFilter === "duplex"
                    ? "bg-[#063b2c] text-white"
                    : "bg-white border border-black/10 text-black/70 hover:bg-[#f0ebe0]"
                }`}
              >
                Duplex
              </button>
            </div>
          </div>

          {/* 5 Plans Grid (Matches Mockup) */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setActivePlanModal(plan)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#e4ddcc] bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Image Frame with Dual Split / Blueprint view */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {/* Category Pill */}
                  <span className="absolute left-3 top-3 rounded-full bg-[#faefd4] px-2.5 py-0.5 text-[10px] font-bold text-[#8c6710] shadow-sm">
                    {plan.badge}
                  </span>

                  {/* Zoom Preview Icon */}
                  <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black/70 opacity-0 shadow-md transition group-hover:opacity-100">
                    <Maximize2 size={13} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-sm text-[#11241c] group-hover:text-[#063b2c] transition">
                    {plan.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-black/60 font-medium line-clamp-1">
                    {plan.specs}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-[#f0ebdf] pt-2 text-[10px] text-black/50">
                    <span>{plan.dimensions}</span>
                    <span className="text-[#063b2c] font-bold">View Plan →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. HOW IT WORKS & VOICE ASSISTANT (From Design Mockup)
      ===================================================================== */}
      <section id="process" className="border-t border-[#e8e2d4] bg-[#fbf9f4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              Simple 4 Steps
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              How It <span className="text-[#c18c21] font-serif">Works</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              Simple Steps to Get Your Professional House Plan
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* 4 Process Steps (Left 8 Cols) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
              {/* Step 01 */}
              <div className="rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#063b2c] text-xs font-bold text-[#f4cf72]">
                    01
                  </div>
                  <div className="my-3 flex justify-center text-[#c18c21]">
                    <FileText size={28} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    Tell Us Requirements
                  </h4>
                  <p className="mt-2 text-xs text-black/60 leading-relaxed">
                    Fill the form or use voice input in Hindi, English, or Urdu.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-[#063b2c]">Step 1 of 4</div>
              </div>

              {/* Step 02 */}
              <div className="rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#063b2c] text-xs font-bold text-[#f4cf72]">
                    02
                  </div>
                  <div className="my-3 flex justify-center text-[#c18c21]">
                    <Ruler size={28} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    Share Your Sketch
                  </h4>
                  <p className="mt-2 text-xs text-black/60 leading-relaxed">
                    Upload your rough sketch or share plot measurements.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-[#063b2c]">Step 2 of 4</div>
              </div>

              {/* Step 03 */}
              <div className="rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#063b2c] text-xs font-bold text-[#f4cf72]">
                    03
                  </div>
                  <div className="my-3 flex justify-center text-[#c18c21]">
                    <Building2 size={28} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    We Design
                  </h4>
                  <p className="mt-2 text-xs text-black/60 leading-relaxed">
                    We create a professional house map as per your needs.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-[#063b2c]">Step 3 of 4</div>
              </div>

              {/* Step 04 */}
              <div className="rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#063b2c] text-xs font-bold text-[#f4cf72]">
                    04
                  </div>
                  <div className="my-3 flex justify-center text-[#c18c21]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    Get Your Final Map
                  </h4>
                  <p className="mt-2 text-xs text-black/60 leading-relaxed">
                    Review, suggest changes and receive your final plan.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-[#063b2c]">Step 4 of 4</div>
              </div>
            </div>

            {/* INTERACTIVE VOICE ASSISTANT CARD (Right 4 Cols - From Mockup) */}
            <div className="rounded-2xl border-2 border-[#12543f] bg-[#07382a] p-6 text-white shadow-xl lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f4cf72] mb-4">
                  <Mic size={24} className={isListening ? "animate-pulse text-red-400" : ""} />
                </div>

                <h3 className="font-serif text-xl font-bold leading-snug">
                  Don&apos;t want to type?
                  <br />
                  Just tell us.
                </h3>
                <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                  Use voice input to share your requirements easily in your native dialect.
                </p>

                {/* Language Pills */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceLanguage("hi-IN")}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      voiceLanguage === "hi-IN"
                        ? "bg-[#f4cf72] text-[#063b2c]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceLanguage("en-IN")}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      voiceLanguage === "en-IN"
                        ? "bg-[#f4cf72] text-[#063b2c]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceLanguage("ur-PK")}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      voiceLanguage === "ur-PK"
                        ? "bg-[#f4cf72] text-[#063b2c]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    اردو
                  </button>
                </div>

                {/* Active Wave / Transcript Indicator */}
                {isListening && (
                  <div className="mt-3 rounded-xl bg-white/10 p-2 text-center text-xs text-[#f4cf72] font-semibold animate-pulse">
                    🎙️ Sun rahe hain... Kripya boliye (Listening...)
                  </div>
                )}
              </div>

              {/* Start Voice Action Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4cf72] py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-[1.02]"
              >
                <span>{isListening ? "Listening... (Speaking)" : "Start Voice Requirement"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. OUR SERVICES (5 Core Services Cards from Mockup)
      ===================================================================== */}
      <section id="services" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              What We Offer
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              Our <span className="text-[#c18c21] font-serif">Services</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              Complete Home Planning Solutions
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {SERVICES_LIST.map((srv) => (
              <div
                key={srv.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div>
                  <span className="rounded-full bg-[#f6edd7] px-2.5 py-0.5 text-[9px] font-bold text-[#8a6316]">
                    {srv.badge}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-[#11241c] group-hover:text-[#063b2c] transition">
                    {srv.title}
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-xs text-black/65">
                    {srv.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#0c7a62] font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f0ebdf]">
                  <button
                    type="button"
                    onClick={() => setActiveServiceModal(srv)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#063b2c] group-hover:text-[#c18c21] transition"
                  >
                    <span>Know More</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. BEFORE → AFTER COMPARISON (Interactive Slider + Value Checklist)
      ===================================================================== */}
      <section className="border-t border-[#e8e2d4] bg-[#fbf9f4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              Real Transformation
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              Before <span className="text-[#c18c21]">→ After</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              Your Rough Sketch to Professional Architectural Plan
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* LEFT 7 COLS: INTERACTIVE BEFORE/AFTER VIEWER */}
            <div className="lg:col-span-7">
              <div
                ref={sliderRef}
                onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e.clientX)}
                onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-3xl border-2 border-white bg-neutral-200 shadow-2xl cursor-ew-resize"
              >
                {/* AFTER IMAGE (Underneath, Full width) */}
                <div className="absolute inset-0">
                  <img
                    src="/portfolio/house-plan-01-hd.jpg"
                    alt="After - Sarda Homeplan Professional CAD Map"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 right-4 z-10 rounded-full bg-[#063b2c]/90 px-3.5 py-1 text-xs font-bold text-[#f4cf72] shadow-md backdrop-blur-sm">
                    Sarda Homeplan Final Plan ✓
                  </div>
                </div>

                {/* BEFORE IMAGE (Clipped on top by percentage) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white bg-[#eae6dc]"
                  style={{ width: `${beforeAfterSlider}%` }}
                >
                  {/* Realistic Sketch Overlay */}
                  <div className="relative h-full w-full bg-[#f2ede4] p-4 flex flex-col justify-between">
                    <div className="absolute inset-4 rounded-xl border border-dashed border-black/30 p-4 font-mono text-xs text-black/70">
                      <div className="flex justify-between border-b border-black/20 pb-2">
                        <span>[Bedroom 12x14]</span>
                        <span>[Kitchen 8x10]</span>
                      </div>
                      <div className="mt-8 text-center text-black/40 italic">
                        &quot;Client Rough Sketch on Paper with Diary Notes&quot;
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span>Plot: 30 x 40 Ft</span>
                      </div>
                    </div>

                    <div className="relative z-10 rounded-full bg-black/75 px-3.5 py-1 text-xs font-bold text-white shadow-md w-fit">
                      Client Rough Sketch
                    </div>
                  </div>
                </div>

                {/* DRAGGABLE DIVIDER HANDLE */}
                <div
                  className="pointer-events-none absolute inset-y-0 flex items-center justify-center"
                  style={{ left: `${beforeAfterSlider}%`, transform: "translateX(-50%)" }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#063b2c] text-white shadow-xl">
                    <span className="text-xs font-bold">⇄</span>
                  </div>
                </div>
              </div>

              {/* Slider instruction */}
              <p className="mt-3 text-center text-[11px] text-black/50">
                ↔ Handle ko drag karke Before (Rough Sketch) aur After (Final Plan) ka farak dekhein.
              </p>
            </div>

            {/* RIGHT 5 COLS: WHY CHOOSE SARDA HOMEPLAN (From Mockup) */}
            <div className="rounded-3xl border border-[#e4ddcc] bg-white p-7 shadow-lg lg:col-span-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                Our Assurance
              </span>
              <h3 className="mt-1 font-serif text-2xl font-bold text-[#11241c]">
                Why Choose Sarda Homeplan?
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">Personalized Plans</h4>
                    <p className="text-xs text-black/55 mt-0.5">Har parivar aur plot ke hisaab se customized planning.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">Vastu Friendly Designs</h4>
                    <p className="text-xs text-black/55 mt-0.5">Sukh-shanti aur samriddhi ke liye shuddh Vastu niyam.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">Affordable & Transparent Pricing</h4>
                    <p className="text-xs text-black/55 mt-0.5">Koi hidden charge nahi, clear advance aur milestone payment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">Direct Consultation</h4>
                    <p className="text-xs text-black/55 mt-0.5">Direct senior architect aur supervisor se baatcheet.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">Support in Hindi, English & Urdu</h4>
                    <p className="text-xs text-black/55 mt-0.5">Aapki suvidhajanak bhasha me guidance aur communication.</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-[#f0ebdf]">
                <button
                  type="button"
                  onClick={() => setQuickInquiryOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-3 text-xs font-bold text-white shadow-md hover:bg-[#09503c] transition"
                >
                  <span>Start Your Planning Today →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CLIENT PORTAL TEASER (Your Project, Always in Your Hands)
      ===================================================================== */}
      <section className="bg-[#07382a] py-16 sm:py-20 text-white overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* LEFT 6 COLS: COPY & FEATURES */}
            <div className="lg:col-span-6">
              <span className="rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#f4cf72]">
                Verified Client Dashboard
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight">
                Your Project,
                <br />
                Always in Your Hands.
              </h2>
              <p className="mt-3 text-sm text-white/70 max-w-md leading-relaxed">
                Login to your customer dashboard to track your requirement, booking & reschedule site visits, check payment receipts, and download final maps.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/customer/login"
                  className="flex items-center gap-2 rounded-full bg-[#f4cf72] px-6 py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-105"
                >
                  <span>Login to Dashboard</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/customer/signup"
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <span>Create Account</span>
                </Link>
              </div>

              {/* 5 Portal Feature Points */}
              <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-white/80 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Requirement Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Booking & Reschedule</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Payment History</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Draft & Final Map</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Direct Notifications</span>
                </div>
              </div>
            </div>

            {/* RIGHT 6 COLS: DEVICE MOCKUP SHOWING ACTUAL DASHBOARD */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-[500px] rounded-2xl border-4 border-black/40 bg-white p-3 shadow-2xl text-[#17221b]">
                {/* Simulated Laptop Top bar */}
                <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-black/40">sardahomeplan.com/customer/dashboard</span>
                  <div className="w-8" />
                </div>

                {/* Dashboard Snapshot Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-[#f4f0e6] p-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#8a6316]">Active Project</p>
                      <h4 className="font-serif text-sm font-bold text-[#063b2c]">Plot 30x40 Ft • 2 BHK House</h4>
                    </div>
                    <span className="rounded-full bg-[#063b2c] text-white px-2.5 py-0.5 text-[10px] font-bold">
                      In Drafting
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg border border-black/10 bg-[#faf8f4] p-2">
                      <span className="text-[10px] text-black/50 block">Site Visit</span>
                      <strong className="text-[#0c7a62]">Confirmed</strong>
                    </div>
                    <div className="rounded-lg border border-black/10 bg-[#faf8f4] p-2">
                      <span className="text-[10px] text-black/50 block">Rough Map</span>
                      <strong className="text-[#8a6316]">Ready</strong>
                    </div>
                    <div className="rounded-lg border border-black/10 bg-[#faf8f4] p-2">
                      <span className="text-[10px] text-black/50 block">Final Blueprint</span>
                      <strong className="text-black/70">In Progress</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-white p-2.5 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-[#c18c21]" />
                      <span className="text-[11px] font-medium text-black/70">Architect uploaded revised concept plan</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#063b2c]">View →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. CUSTOMER REVIEWS & FAQ SECTION (From Design Mockup)
      ===================================================================== */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* LEFT 6 COLS: WHAT OUR CUSTOMERS SAY */}
            <div className="lg:col-span-6">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                Real Experiences
              </span>
              <h2 className="mt-1 font-serif text-3xl font-extrabold text-[#11241c]">
                What Our Customers Say
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                Verified feedback from clients who trusted us with their house planning.
              </p>

              <div className="mt-8 space-y-4">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-[#e4ddcc] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-1 text-[#f59e0b] mb-2.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[#f59e0b]" />
                      ))}
                    </div>
                    <p className="text-xs text-black/75 leading-relaxed font-medium italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3 pt-3 border-t border-[#f0ebdf]">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="h-9 w-9 rounded-full object-cover border border-[#e4ddcc]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#11241c]">{t.name}</h4>
                        <span className="text-[10px] text-black/50">{t.location} • {t.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 6 COLS: FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
            <div className="lg:col-span-6" id="faq">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                Clear Answers
              </span>
              <h2 className="mt-1 font-serif text-3xl font-extrabold text-[#11241c]">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                Find quick answers to common questions about house maps and process.
              </p>

              <div className="mt-8 space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = activeFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#e4ddcc] bg-white overflow-hidden shadow-sm transition"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between p-4.5 text-left text-xs font-bold text-[#11241c] hover:bg-[#faf8f4] transition"
                        aria-expanded={isOpen}
                      >
                        <span className="pr-4">{faq.question}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f0e6] text-[#063b2c] shrink-0 text-sm font-bold">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#f0ebdf] px-4.5 py-3.5 bg-[#fbf9f4] text-xs text-black/65 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. PRE-FOOTER CTA BANNER (Ready to Plan Your Home?)
      ===================================================================== */}
      <section className="bg-[#07382a] py-14 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-r from-[#063b2c] to-[#0d4f3b] p-8 sm:p-12 shadow-2xl">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f4cf72]">
                  Get Started Today
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold leading-tight">
                  Ready to Plan Your Home?
                </h2>
                <p className="mt-2 text-sm text-white/75 max-w-xl">
                  Share your requirements today and get a professional, Vastu-friendly house map designed specifically for your plot.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => setQuickInquiryOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-[#f4cf72] px-6 py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-105"
                  >
                    <span>Get Your House Map</span>
                    <ArrowRight size={14} />
                  </button>

                  <a
                    href="https://wa.me/919576543210?text=Namaste%20Sarda%20Homeplan%20team%2C%20mujhe%20apne%20plot%20ka%20naksha%20banwana%20hai."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white transition hover:bg-[#25D366] hover:border-[#25D366]"
                  >
                    <MessageCircle size={15} />
                    <span>Talk to Us (WhatsApp)</span>
                  </a>
                </div>
              </div>

              {/* Doodle Graphic on Right */}
              <div className="hidden lg:col-span-4 lg:flex flex-col items-center justify-center text-center">
                <p className="font-serif text-lg font-bold text-[#f4cf72] italic">
                  Better Planning,
                  <br />
                  Brighter Future
                </p>
                <span className="text-2xl mt-1">⤷ 🏡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          11. FOOTER (Matches Design Mockup)
      ===================================================================== */}
      <footer id="contact" className="border-t border-[#e8e2d4] bg-[#fbf9f4] pt-16 pb-8 text-[#17221b]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b2c] text-[#d9b45a] shadow-sm">
                  <HomeIcon size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <span className="font-serif text-[20px] font-bold tracking-tight text-[#063b2c]">
                    SARDA
                  </span>
                  <span className="block text-[8px] font-extrabold tracking-[0.3em] text-[#9b7732]">
                    HOMEPLAN
                  </span>
                </div>
              </Link>
              <p className="mt-4 text-xs text-black/60 max-w-sm leading-relaxed">
                Your Trusted Partner for House Planning & Vastu Consultation in Pratapgarh and Nearby Areas.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-black/10 text-black/70 hover:bg-[#063b2c] hover:text-white transition"
                  aria-label="Instagram"
                >
                  📷
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-black/10 text-black/70 hover:bg-[#063b2c] hover:text-white transition"
                  aria-label="Facebook"
                >
                  f
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-black/10 text-black/70 hover:bg-[#063b2c] hover:text-white transition"
                  aria-label="YouTube"
                >
                  ▶
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#063b2c]">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-black/65">
                <li><a href="#home" className="hover:text-[#063b2c]">Home</a></li>
                <li><a href="#about" className="hover:text-[#063b2c]">About</a></li>
                <li><a href="#services" className="hover:text-[#063b2c]">Services</a></li>
                <li><a href="#portfolio" className="hover:text-[#063b2c]">Portfolio</a></li>
                <li><a href="#process" className="hover:text-[#063b2c]">How It Works</a></li>
                <li><a href="#contact" className="hover:text-[#063b2c]">Contact</a></li>
              </ul>
            </div>

            {/* Col 3: Our Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#063b2c]">
                Our Services
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-black/65">
                <li><a href="#services" className="hover:text-[#063b2c]">House Floor Plans</a></li>
                <li><a href="#services" className="hover:text-[#063b2c]">Map Redrawing</a></li>
                <li><a href="#services" className="hover:text-[#063b2c]">Custom Planning</a></li>
                <li><a href="#services" className="hover:text-[#063b2c]">Vastu Consultation</a></li>
                <li><a href="#services" className="hover:text-[#063b2c]">Site Visit Consultation</a></li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#063b2c]">
                Contact Us
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-black/65">
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-[#0c7a62]" />
                  <a href="tel:+919576543210" className="hover:text-[#063b2c]">+91 95765 43210</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-[#0c7a62]" />
                  <a href="mailto:sardahomeplan@gmail.com" className="hover:text-[#063b2c]">sardahomeplan@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#0c7a62]" />
                  <span>Pratapgarh, Uttar Pradesh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e8e2d4] pt-6 text-[11px] text-black/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Sarda Homeplan. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-red-500">❤️</span> for your dream home.
            </p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          12. FULLSCREEN BLUEPRINT PREVIEW MODAL WITH SECURE WATERMARK
      ===================================================================== */}
      {activePlanModal && (
        <div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActivePlanModal(null)}
        >
          <button
            onClick={() => setActivePlanModal(null)}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-black shadow-lg hover:bg-neutral-200"
            aria-label="Close"
          >
            ×
          </button>

          <div
            className="relative flex max-h-[92vh] max-w-[94vw] flex-col items-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={activePlanModal.blueprint}
                alt={activePlanModal.title}
                className="max-h-[78vh] max-w-[92vw] object-contain pointer-events-none"
              />

              {/* Secure Corner Watermark Badge */}
              <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-xl bg-black/80 px-3.5 py-2 backdrop-blur-md border border-white/20 shadow-xl">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f4cf72] text-[#063b2c] font-serif font-black text-xs">
                  S
                </div>
                <div className="text-left">
                  <p className="font-serif text-[11px] font-bold tracking-wider text-white">
                    SARDA HOMEPLAN
                  </p>
                  <p className="text-[9px] font-medium tracking-wide text-[#f4cf72]">
                    Certified Architectural Drawing
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-sm border border-white/15 text-[10px] font-bold tracking-widest uppercase text-white/90">
                {activePlanModal.badge} • {activePlanModal.dimensions}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequirements(`Interested in similar plan: ${activePlanModal.title} (${activePlanModal.badge}, ${activePlanModal.dimensions})`);
                  setActivePlanModal(null);
                  setQuickInquiryOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#f4cf72] px-5 py-2 text-xs font-extrabold text-[#063b2c] shadow-lg hover:bg-[#ffe39c] transition"
              >
                <span>I Want a Similar Plan</span>
                <ArrowRight size={13} />
              </button>

              <a
                href={`https://wa.me/919576543210?text=${encodeURIComponent(
                  `Namaste Sarda Homeplan team! Mujhe aapke featured plan '${activePlanModal.title}' (${activePlanModal.dimensions}) ke baare me baat karni hai.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#1ebc59] transition"
              >
                <MessageCircle size={14} />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          13. SERVICE DETAIL MODAL ("Know More →")
      ===================================================================== */}
      {activeServiceModal && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveServiceModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#f0ebdf] pb-4">
              <div>
                <span className="rounded-full bg-[#f6edd7] px-2.5 py-0.5 text-[9px] font-bold text-[#8a6316]">
                  {activeServiceModal.badge}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-[#11241c]">
                  {activeServiceModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceModal(null)}
                className="text-black/50 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-xs text-black/70 leading-relaxed">
              {activeServiceModal.description}
            </p>

            <div className="mt-4 rounded-2xl bg-[#faf8f4] p-4 border border-[#e4ddcc]">
              <h4 className="text-xs font-bold text-[#063b2c] uppercase tracking-wider mb-2">
                What is included:
              </h4>
              <ul className="space-y-1.5 text-xs text-black/70">
                {activeServiceModal.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#0c7a62] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequirements(`Inquiry for service: ${activeServiceModal.title}`);
                  setActiveServiceModal(null);
                  setQuickInquiryOpen(true);
                }}
                className="flex-1 rounded-xl bg-[#063b2c] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b4d3a]"
              >
                Book This Service →
              </button>
              <button
                type="button"
                onClick={() => setActiveServiceModal(null)}
                className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-bold text-black/60 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          14. QUICK SEARCH MODAL
      ===================================================================== */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebdf]">
              <h3 className="font-serif text-lg font-bold text-[#11241c] flex items-center gap-2">
                <Search size={18} className="text-[#c18c21]" />
                <span>Search Floor Plans</span>
              </h3>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-black/50 hover:text-black font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by 2 BHK, Duplex, Vastu, 30x40, etc..."
                className="w-full rounded-xl border border-black/15 bg-[#faf8f4] px-4 py-3 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                autoFocus
              />
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-black/50 text-[10px] self-center mr-1">Popular:</span>
              <button
                type="button"
                onClick={() => setSearchQuery("2 BHK")}
                className="rounded-full bg-[#f4f0e6] px-2.5 py-0.5 text-[#063b2c] font-bold"
              >
                2 BHK
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery("3 BHK")}
                className="rounded-full bg-[#f4f0e6] px-2.5 py-0.5 text-[#063b2c] font-bold"
              >
                3 BHK
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery("Duplex")}
                className="rounded-full bg-[#f4f0e6] px-2.5 py-0.5 text-[#063b2c] font-bold"
              >
                Duplex
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery("Vastu")}
                className="rounded-full bg-[#f4f0e6] px-2.5 py-0.5 text-[#063b2c] font-bold"
              >
                Vastu
              </button>
            </div>

            {/* Matching Results Preview */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {filteredPlans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSearchModalOpen(false);
                    setActivePlanModal(p);
                  }}
                  className="flex items-center justify-between rounded-xl p-2.5 border border-[#eee7db] hover:bg-[#faf8f4] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-[#11241c]">{p.title}</h4>
                      <p className="text-[10px] text-black/50">{p.dimensions} • {p.badge}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#063b2c]">View Plan →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          15. QUICK INQUIRY MODAL ("Get Your Map")
      ===================================================================== */}
      {quickInquiryOpen && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setQuickInquiryOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#f0ebdf] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                  Sarda Homeplan Intake
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#11241c]">
                  Get Your House Map
                </h3>
                <p className="mt-1 text-xs text-black/55">
                  Share your requirements and our architect will prepare your customized plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickInquiryOpen(false)}
                className="text-black/50 hover:text-black font-bold text-xl"
              >
                ×
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62]">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#063b2c]">
                  Requirement Received!
                </h4>
                <p className="text-xs text-black/65 max-w-sm mx-auto leading-relaxed">
                  Namaste {fullName}! Aapki requirement record ho chuki hai. Hamari architect team aapse jald hi call ya WhatsApp par contact karegi.
                </p>
                <div className="pt-2 flex flex-col gap-2 sm:flex-row justify-center">
                  <Link
                    href="/customer/dashboard"
                    className="rounded-full bg-[#063b2c] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0b4d3a]"
                  >
                    Go to Customer Dashboard →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setQuickInquiryOpen(false);
                    }}
                    className="rounded-full border border-black/15 px-5 py-2.5 text-xs font-bold text-black/60"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequirement} className="mt-4 space-y-3.5">
                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Full Name (पूरा नाम) *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Mobile Number (मोबाइल) *
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Village / City (गाँव / शहर)
                    </label>
                    <input
                      type="text"
                      value={villageCity}
                      onChange={(e) => setVillageCity(e.target.value)}
                      placeholder="e.g. Pratapgarh"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      District (ज़िला)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Pratapgarh"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Length (लंबाई ft)
                    </label>
                    <input
                      type="number"
                      value={plotLength}
                      onChange={(e) => setPlotLength(e.target.value)}
                      placeholder="e.g. 40"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Width (चौड़ाई ft)
                    </label>
                    <input
                      type="number"
                      value={plotWidth}
                      onChange={(e) => setPlotWidth(e.target.value)}
                      placeholder="e.g. 30"
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Floors (मंज़िल)
                    </label>
                    <select
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white"
                    >
                      <option value="Ground Floor (1 Floor)">Ground Floor</option>
                      <option value="G+1 Duplex (2 Floors)">G+1 Duplex</option>
                      <option value="G+2 Multi-Story (3 Floors)">G+2 Multi-Story</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#17221b]">
                      Your Requirements & Notes (आपकी ज़रूरतें)
                    </label>
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#c18c21] hover:text-[#8a6316]"
                    >
                      <Mic size={13} className={isListening ? "animate-pulse text-red-500" : ""} />
                      <span>{isListening ? "Listening..." : "Speak by Voice 🎙️"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. 3 bedrooms, kitchen in Agni Kon, car parking, wide balcony..."
                    className="mt-1 w-full rounded-xl border border-black/15 bg-[#faf8f4] px-3.5 py-2 text-xs outline-none focus:border-[#063b2c] focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#0b4d3a] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting to Sarda Homeplan...</span>
                  ) : (
                    <>
                      <span>Submit Requirement ✓</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          16. FLOATING WHATSAPP CHAT BUTTON (Bottom-Right)
      ===================================================================== */}
      <a
        href="https://wa.me/919576543210?text=Namaste%20Sarda%20Homeplan%2C%20mujhe%20ghar%20ka%20naksha%20banwana%20hai."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110 hover:shadow-[0_10px_25px_rgba(37,211,102,0.4)]"
        aria-label="Direct WhatsApp Chat"
        title="Chat on WhatsApp (+91 95765 43210)"
      >
        <MessageCircle size={28} />
      </a>
    </main>
  );
}