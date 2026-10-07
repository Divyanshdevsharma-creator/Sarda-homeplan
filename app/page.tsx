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
  CheckCircle2,
  ArrowRight,
  Mic,
  Star,
  Search,
  FileText,
  Sparkles,
  Clock,
  ShieldCheck,
  Maximize2,
  User,
  LogIn,
  Bell,
  Play,
  Menu,
  X,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { createClient } from "../lib/supabase-client";

// ============================================================================
// LANGUAGES SUPPORT: Hindi, English, Hinglish
// ============================================================================
type Language = "hi" | "en" | "hinglish";

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
    description: "Send us a photo of your hand-drawn sketch or diary note. We translate it into clean 2D plans with clear measurements.",
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
    description: "Ensure peace, health, and prosperity by aligning entrance doors, kitchen stove, master bed, water tank, and septic tank per Vastu Shastra.",
    badge: "Vastu Verified",
  },
  {
    id: "site-visit",
    title: "Site Visit Consultation",
    tagline: "On-site discussion (Pratapgarh & nearby) • Better planning & accuracy",
    highlights: ["On-site physical inspection", "Pratapgarh & neighbouring districts", "Road level & soil orientation review"],
    description: "Our team visits your plot in Pratapgarh and nearby areas to check front road width, boundaries, and drainage slopes.",
    badge: "On-Site Visit",
  },
];

// ============================================================================
// DATA: 5-PHASE SIMPLE, HONEST & CUSTOMER-FIRST PROCESS
// ============================================================================
interface ProcessPhase {
  step: string;
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  summaryHi: string;
  summaryEn: string;
  summaryHinglish: string;
  timeline: string;
  detailsHi: string[];
  detailsEn: string[];
  deliverableHi: string;
  deliverableEn: string;
}

const PROCESS_PHASES: ProcessPhase[] = [
  {
    step: "01",
    titleHi: "अपनी ज़रूरतें व रफ स्केच शेयर करें",
    titleEn: "Share Requirements & Rough Sketch",
    titleHinglish: "Share Plot Requirements & Rough Sketch",
    summaryHi: "प्लॉट की लंबाई-चौड़ाई, कमरों की संख्या (2/3 BHK), और अपनी पसंद या हाथ से बना रफ स्केच हमें बताएं।",
    summaryEn: "Share your plot measurements, number of bedrooms, and paper sketch or voice note.",
    summaryHinglish: "Plot ka size, kamro ki sankhya, aur apna rough sketch ya voice note share karein.",
    timeline: "Step 1 (शुरुआत)",
    detailsHi: [
      "प्लॉट की लंबाई और चौड़ाई बताएं (जैसे 30 x 40 Ft)",
      "कमरों की ज़रूरत, पार्किंग, और पूजा घर की जानकारी दें",
      "हाथ से बना कोई रफ स्केच या वॉयस नोट अपलोड करें",
    ],
    detailsEn: [
      "Provide plot length and width (e.g. 30 x 40 Ft)",
      "Specify number of rooms, car parking & puja room",
      "Upload paper rough sketch or voice note directly",
    ],
    deliverableHi: "कस्टमर डैशबोर्ड पर आपकी रिक्वायरमेंट दर्ज हो जाती है",
    deliverableEn: "Project Requirement logged in your Customer Dashboard",
  },
  {
    step: "02",
    titleHi: "प्लॉट की ज़मीनी नाप व साइट विज़िट",
    titleEn: "Plot Measurement & Site Visit",
    titleHinglish: "Site Visit & Land Measurement",
    summaryHi: "प्रतापगढ़ व आसपास हम खुद आपके प्लॉट पर आकर ज़मीनी नाप, रोड चौड़ाई और दिशा चेक करते हैं।",
    summaryEn: "In Pratapgarh & nearby areas, we visit your plot to check exact boundaries, road frontage, and orientation.",
    summaryHinglish: "Plot par aakar exact zameeni nap, road chaudai aur disha verify karna.",
    timeline: "Step 2 (1-2 दिन)",
    detailsHi: [
      "प्लॉट की वास्तविक ज़मीनी नाप का सत्यापन",
      "सामने की सड़क की चौड़ाई और बाउंड्री का मिलान",
      "वास्तु के लिए मुख्य दिशा और सूर्य प्रकाश की स्थिति देखना",
    ],
    detailsEn: [
      "Physical measurement verification on your plot",
      "Road frontage width and boundary alignment check",
      "True North direction and sunlight orientation check",
    ],
    deliverableHi: "सत्यापित ज़मीनी नाप व प्लॉट डिटेल्स",
    deliverableEn: "Verified Plot Dimensions & Site Details",
  },
  {
    step: "03",
    titleHi: "2D फ्लोर प्लान व वास्तु ड्राफ्ट",
    titleEn: "2D Floor Plan & Vastu Layout",
    titleHinglish: "2D CAD Floor Plan & Layout",
    summaryHi: "आपकी ज़रूरतों के हिसाब से कमरों का सही साइज, दीवारें, और वास्तु के अनुसार किचन-मंदिर का ड्राफ्ट तैयार होता है।",
    summaryEn: "We prepare the 2D floor layout with room dimensions, wall layout, and Vastu placement.",
    summaryHinglish: "Kamro ka layout, deewar ki nap aur Vastu sthan ke sath 2D naksha banna.",
    timeline: "Step 3 (2-3 दिन)",
    detailsHi: [
      "हर कमरे, किचन और हॉल का स्पष्ट साइज",
      "वास्तु अनुसार आग्नेय कोण में किचन व ईशान में पूजा स्थान",
      "प्राकृतिक हवा और धूप के लिए खिड़कियों की सही प्लानिंग",
    ],
    detailsEn: [
      "Clear room dimensions for bedrooms, kitchen & living hall",
      "Vastu alignment for kitchen, puja space & master bedroom",
      "Cross-ventilation and natural lighting positioning",
    ],
    deliverableHi: "कस्टमर डैशबोर्ड पर पहला 2D कॉन्सेप्ट ड्राफ्ट",
    deliverableEn: "First 2D Floor Plan Draft on your Customer Dashboard",
  },
  {
    step: "04",
    titleHi: "रिव्यू व अपनी पसंद अनुसार बदलाव",
    titleEn: "Review & Adjustments ('Final the Map')",
    titleHinglish: "Review & Revisions ('Final the Map')",
    summaryHi: "डैशबोर्ड पर नक्शा देखें। बदलाव चाहिए तो 'Need Change' बताएं, पसंद आने पर 'Final the Map' दबाएं।",
    summaryEn: "Review the plan on your dashboard. Request adjustments if needed, or approve when you love it.",
    summaryHinglish: "Naksha check karein, zaroorat ho to badlav karwayein, pasand aane par approve karein.",
    timeline: "Step 4 (3-4 दिन)",
    detailsHi: [
      "मोबाइल या कंप्यूटर पर अपना 2D नक्शा कभी भी देखें",
      "कमरे के साइज या दरवाजे की दिशा में आसानी से बदलाव कराएं",
      "संतुष्ट होने पर 'Final the Map' बटन दबाकर अंतिम सहमति दें",
    ],
    detailsEn: [
      "Inspect your 2D plan on phone or computer anytime",
      "Request room size or door position changes easily",
      "Click 'Final the Map' when completely satisfied",
    ],
    deliverableHi: "आपकी पसंद का फाइनल स्वीकृत 2D लेआउट",
    deliverableEn: "Approved Final 2D Floor Layout",
  },
  {
    step: "05",
    titleHi: "3D फ्रंट एलिवेशन व फाइनल डिलीवरी",
    titleEn: "3D Front Elevation & Final Delivery",
    titleHinglish: "3D Elevation & Print-Ready Map Delivery",
    summaryHi: "घर का सुंदर 3D फ्रंट डिजाइन, कॉलम-बीम लेआउट और मिस्त्री के काम आने वाला फाइनल प्रिंटेबल नक्शा प्राप्त करें।",
    summaryEn: "Receive realistic 3D exterior front elevation, column markings, and print-ready final map.",
    summaryHinglish: "3D front look, column marking aur print-ready final map prapt karein.",
    timeline: "Step 5 (4-5 दिन)",
    detailsHi: [
      "सामने से घर कैसा दिखेगा उसका सुंदर 3D कलर डिजाइन",
      "मिस्त्री और ठेकेदार के लिए स्पष्ट कॉलम और बीम मार्किंग",
      "डैशबोर्ड से हाई-क्वालिटी पीडीएफ डाउनलोड व हार्डकॉपी प्रिंट",
    ],
    detailsEn: [
      "Realistic 3D front exterior color look of your home",
      "Clear column and beam markings for masons and builders",
      "High-res PDF download from dashboard & physical print",
    ],
    deliverableHi: "फाइनल ब्लूप्रिंट + 3D एलिवेशन सेट",
    deliverableEn: "Complete House Map + 3D Elevation Package",
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
    qHi: "नक्शा बनाने में कितना समय लगता है?",
    qEn: "How much time does it take to make a house plan?",
    qHinglish: "Map banane me kitna time lagta hai?",
    aHi: "प्रारंभिक 2D कॉन्सेप्ट प्लान हम 24 से 48 घंटे के भीतर आपके कस्टमर डैशबोर्ड पर अपलोड कर देते हैं। आपके सुझावों और बदलावों के बाद फाइनल नक्शा 3 से 4 दिन में डिलीवर हो जाता है।",
    aEn: "The initial 2D concept is uploaded to your customer portal within 24 to 48 hours. After review and revisions, the final drawings are delivered in 3 to 4 days.",
    aHinglish: "Initial rough concept plan hum 24 se 48 ghante me customer dashboard par upload kar dete hain. Review aur revisions ke baad final map 3 se 4 din me deliver hota hai.",
  },
  {
    qHi: "क्या आप वास्तु के अनुसार नक्शा बनाते हैं?",
    qEn: "Do you design plans as per Vastu?",
    qHinglish: "Kya aap Vastu ke anusaar map banate hain?",
    aHi: "हाँ! हमारे हर प्लान में आग्नेय कोण में रसोई, ईशान कोण में पूजा घर, और नैऋत्य कोण में मास्टर बेडरूम का ध्यान रखा जाता है ताकि घर में सुख और शांति बनी रहे।",
    aEn: "Yes! Every layout incorporates practical Vastu guidelines (kitchen in Agni Kon, puja room in Ishan Kon, master bed in Nairutya) with proper ventilation.",
    aHinglish: "Haan! Hamare har plan me Agni Kon me kitchen, Ishan Kon me puja ghar, aur master bedroom ka Vastu dhyan rakha jata hai.",
  },
  {
    qHi: "क्या मैं अपना हाथ से बना रफ स्केच भेज सकता हूँ?",
    qEn: "Can I share my hand-drawn rough paper sketch?",
    qHinglish: "Kya mai apna rough sketch bhej sakta hu?",
    aHi: "हाँ! आप किसी भी कागज या डायरी पर हाथ से बना हुआ रफ स्केच सीधे पोर्टल पर अपलोड कर सकते हैं या व्हाट्सएप (+91 8423406049) पर भेज सकते हैं। हम उसे साफ 2D नक्शे में बदल देंगे।",
    aEn: "Yes! You can take a photo of your paper sketch and upload it on our portal or send it on WhatsApp (+91 8423406049). We redraw it into clean 2D plans.",
    aHinglish: "Haan! Aap kisi bhi kaghaz par bana rough sketch WhatsApp (+91 8423406049) par bhej sakte hain ya hamare portal par direct upload kar sakte hain.",
  },
  {
    qHi: "क्या आप साइट विज़िट करते हैं?",
    qEn: "Do you visit the plot physically?",
    qHinglish: "Kya aap site visit karte hain?",
    aHi: "हाँ! प्रतापगढ़ और आसपास के क्षेत्रों में हमारी टीम खुद आपके प्लॉट पर आकर ज़मीनी नाप और रोड की स्थिति चेक करती है।",
    aEn: "Yes! In Pratapgarh and neighboring areas, our team physically visits your plot to check measurements and road conditions.",
    aHinglish: "Haan! Pratapgarh aur aas-paas ke ilaqon me hamari team physically plot par aakar measurements check karti hai.",
  },
  {
    qHi: "पेमेंट कैसे करना होता है?",
    qEn: "How does the payment work?",
    qHinglish: "Payment kaise karna hota hai?",
    aHi: "पेमेंट बहुत आसान और पारदर्शी है। काम शुरू करने के लिए थोड़ा एडवांस लिया जाता है। आप फोनपे, गूगल पे, यूपीआई से पेमेंट कर सकते हैं और रसीद डैशबोर्ड से डाउनलोड कर सकते हैं।",
    aEn: "Payment is simple and milestone-based. A small advance is taken to start drafting, payable via UPI, PhonePe, or Google Pay with dashboard receipts.",
    aHinglish: "Payment transparent hai. Thoda advance lekar drafting shuru hoti hai. Aap PhonePe, Google Pay, UPI se payment kar sakte hain.",
  },
];

export default function Home() {
  // Language State
  const [lang, setLang] = useState<Language>("hi");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals & Popups
  const [loginRoleModalOpen, setLoginRoleModalOpen] = useState(false);
  const [authPromptModalOpen, setAuthPromptModalOpen] = useState(false);
  const [quickInquiryOpen, setQuickInquiryOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlanModal, setActivePlanModal] = useState<FeaturedPlan | null>(null);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");
  const [selectedProcessPhase, setSelectedProcessPhase] = useState<number>(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [beforeAfterSlider, setBeforeAfterSlider] = useState<number>(50);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("hi-IN");

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

  // Check Supabase Auth on Mount & Restore Preferences
  useEffect(() => {
    const savedLang = localStorage.getItem("sarda_user_lang") as Language;
    if (savedLang && (savedLang === "hi" || savedLang === "en" || savedLang === "hinglish")) {
      setLang(savedLang);
    }

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from("customer_profiles")
            .select("full_name, mobile, village_city, district")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.mobile) setMobile(profile.mobile);
            if (profile.village_city) setVillageCity(profile.village_city);
            if (profile.district) setDistrict(profile.district);
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    };

    checkAuth();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("sarda_user_lang", newLang);
  };

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
      if (currentUser) {
        setQuickInquiryOpen(true);
      } else {
        setAuthPromptModalOpen(true);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access in your browser.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        alert(`Voice input notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  // Central Handler for "Get Your House Map"
  const handleGetMapClick = (customNote?: string) => {
    if (customNote) {
      setRequirements(customNote);
    }
    if (!currentUser) {
      setAuthPromptModalOpen(true);
    } else {
      setQuickInquiryOpen(true);
    }
  };

  // Submit Requirement to Supabase customer_requests
  const handleSubmitRequirement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanName = fullName.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, "");

    if (!cleanName) {
      setErrorMessage(
        lang === "hi"
          ? "कृपया अपना पूरा नाम दर्ज करें।"
          : "Please enter your full name."
      );
      return;
    }
    if (cleanMobile.length < 10) {
      setErrorMessage(
        lang === "hi"
          ? "कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit mobile number."
      );
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
    <main className="min-h-screen w-full bg-[#f8f6f0] text-[#17221b]">
      {/* =====================================================================
          1. TOP NAVBAR (Clean Ivory/Cream & Deep Emerald)
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#e8e2d4] bg-[#f8f6f0]/95 backdrop-blur-md">
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
              {lang === "hi" ? "होम" : "Home"}
            </a>
            <a href="#about" className="transition hover:text-[#063b2c]">
              {lang === "hi" ? "हमारे बारे में" : "About"}
            </a>
            <a href="#services" className="transition hover:text-[#063b2c]">
              {lang === "hi" ? "सेवाएं" : "Services"}
            </a>
            <a href="#portfolio" className="transition hover:text-[#063b2c]">
              {lang === "hi" ? "पोर्टफोलियो" : "Portfolio"}
            </a>
            <a href="#process" className="transition hover:text-[#063b2c]">
              {lang === "hi" ? "प्रक्रिया" : "How It Works"}
            </a>
            <a href="#contact" className="transition hover:text-[#063b2c]">
              {lang === "hi" ? "संपर्क" : "Contact"}
            </a>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* LANGUAGE SELECTOR PILL */}
            <div className="flex items-center rounded-full border border-black/10 bg-white/80 p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => handleLanguageChange("hi")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  lang === "hi"
                    ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                    : "text-black/60 hover:text-black"
                }`}
                title="हिन्दी"
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  lang === "en"
                    ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                    : "text-black/60 hover:text-black"
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("hinglish")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  lang === "hinglish"
                    ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                    : "text-black/60 hover:text-black"
                }`}
                title="Hinglish"
              >
                Hinglish
              </button>
            </div>

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

            {/* LOGIN BUTTON: Opens modal to choose Customer Login or Admin Login */}
            <button
              type="button"
              onClick={() => setLoginRoleModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white/80 px-4 py-2 text-xs font-bold text-[#17221b] shadow-sm transition hover:bg-white hover:border-[#063b2c]"
            >
              <LogIn size={13} className="text-[#063b2c]" />
              <span>
                {currentUser
                  ? lang === "hi"
                    ? "खाता / लॉगिन"
                    : "Account / Login"
                  : lang === "hi"
                  ? "लॉगिन"
                  : "Login"}
              </span>
            </button>

            {/* Primary CTA Button: Checks Auth First */}
            <button
              type="button"
              onClick={() => handleGetMapClick()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#063b2c] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#0b4d3a] hover:shadow-lg"
            >
              <span>{lang === "hi" ? "नक्शा बनवाएं" : "Get Your Map"}</span>
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
            <div className="mb-3 flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
              <span className="text-xs font-bold text-black/60">
                {lang === "hi" ? "भाषा चुनें:" : "Language:"}
              </span>
              <div className="flex items-center rounded-full border border-black/10 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("hi")}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    lang === "hi"
                      ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    lang === "en"
                      ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("hinglish")}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    lang === "hinglish"
                      ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  Hinglish
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-3 text-sm font-semibold text-black/80">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "होम" : "Home"}
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "हमारे बारे में" : "About"}
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "सेवाएं" : "Services"}
              </a>
              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "पोर्टफोलियो" : "Portfolio"}
              </a>
              <a
                href="#process"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "प्रक्रिया" : "How It Works"}
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#063b2c]"
              >
                {lang === "hi" ? "संपर्क" : "Contact"}
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginRoleModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-white py-2.5 text-xs font-bold text-black/80 shadow-sm"
                >
                  <LogIn size={14} className="text-[#063b2c]" />
                  <span>
                    {currentUser
                      ? lang === "hi"
                        ? "खाता / लॉगिन"
                        : "Account / Login"
                      : lang === "hi"
                      ? "लॉगिन (Customer / Admin)"
                      : "Login (Customer / Admin)"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleGetMapClick();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-2.5 text-xs font-bold text-white shadow-md"
                >
                  <span>{lang === "hi" ? "नक्शा बनवाएं →" : "Get Your Map →"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          2. HERO SECTION
      ===================================================================== */}
      <section id="home" className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* LEFT: HERO COPY */}
            <div className="lg:col-span-7">
              {/* Category Pills */}
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  {lang === "hi" ? "हाउस प्लान" : "House Plans"}
                </span>
                <span className="text-black/30">•</span>
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  {lang === "hi" ? "कस्टम डिज़ाइन" : "Custom Design"}
                </span>
                <span className="text-black/30">•</span>
                <span className="rounded-full bg-[#faefd4] px-3 py-1 text-[#8c6710]">
                  {lang === "hi" ? "वास्तु परामर्श" : "Vastu Consultation"}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl font-extrabold leading-[1.14] tracking-tight text-[#11241c] sm:text-5xl lg:text-[54px] xl:text-[58px]">
                {lang === "hi" ? (
                  <>
                    अपने घर का सपना,
                    <br />
                    एक <span className="text-[#c18c21] font-serif font-bold">परफेक्ट प्लान</span> के साथ।
                  </>
                ) : lang === "en" ? (
                  <>
                    Your Dream Home,
                    <br />
                    With a <span className="text-[#c18c21] font-serif font-bold">Perfect Plan</span>.
                  </>
                ) : (
                  <>
                    Apne Ghar Ka Sapna,
                    <br />
                    Ek <span className="text-[#c18c21] font-serif font-bold">Perfect Plan</span> Ke Saath.
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
                {lang === "hi"
                  ? "आपके रफ स्केच से लेकर सुंदर हाउस मैप तक — "
                  : lang === "en"
                  ? "From your rough sketch to clear 2D house maps — "
                  : "Aapke rough sketch se lekar clear house map tak — "}
                <strong className="text-[#063b2c]">
                  {lang === "hi" ? "आसान, किफायती" : "simple, affordable"}
                </strong>{" "}
                {lang === "hi"
                  ? "और आपकी ज़रूरत के हिसाब से।"
                  : lang === "en"
                  ? "and tailored to your family's needs."
                  : "aur aapki zarurat ke hisaab se."}
              </p>

              {/* Dual CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleGetMapClick()}
                  className="flex items-center gap-2 rounded-full bg-[#063b2c] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b4d3a] hover:shadow-xl"
                >
                  <span>
                    {lang === "hi"
                      ? "नक्शा बनवाएं"
                      : lang === "en"
                      ? "Get Your House Map"
                      : "Get Your House Map"}
                  </span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#portfolio"
                  className="flex items-center gap-2 rounded-full border border-black/15 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#17221b] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:border-[#063b2c]"
                >
                  <span>
                    {lang === "hi"
                      ? "हमारा काम देखें"
                      : lang === "en"
                      ? "View Our Work"
                      : "View Our Work"}
                  </span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#063b2c] text-white">
                    <Play size={9} className="ml-0.5 fill-white" />
                  </div>
                </a>
              </div>

              {/* 4 Bottom Trust Pillars */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-[#e8e2d4]">
                <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-[#ede5d5] shadow-sm">
                  <Ruler size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">
                      {lang === "hi" ? "कस्टम प्लानिंग" : "Custom Planning"}
                    </strong>
                    <span className="text-black/50 text-[10px]">
                      {lang === "hi" ? "आपकी ज़रूरत अनुसार" : "as per your needs"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-[#ede5d5] shadow-sm">
                  <Building2 size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">
                      {lang === "hi" ? "व्यक्तिगत सलाह" : "Personal Consult"}
                    </strong>
                    <span className="text-black/50 text-[10px]">
                      {lang === "hi" ? "ऑनलाइन व ऑन-साइट" : "Online & On-site"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-[#ede5d5] shadow-sm">
                  <Sparkles size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">
                      Hindi • Urdu • Eng
                    </strong>
                    <span className="text-black/50 text-[10px]">
                      {lang === "hi" ? "सीधा सहयोग" : "Direct Support"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 border border-[#ede5d5] shadow-sm">
                  <MapPin size={16} className="text-[#c18c21] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-[#17221b]">
                      {lang === "hi" ? "विश्वसनीय टीम" : "Trusted Local"}
                    </strong>
                    <span className="text-black/50 text-[10px]">
                      Pratapgarh & Nearby
                    </span>
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Honest Badge */}
                    <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 backdrop-blur-md border border-white/20 text-white shadow-lg">
                      <ShieldCheck size={16} className="text-[#f4cf72]" />
                      <span className="text-[11px] font-bold">100% Vastu Friendly & Custom Designs</span>
                    </div>
                  </div>
                </div>

                {/* 4 Floating Badges */}
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
          3. STATS COUNTER RIBBON
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
                  {lang === "hi" ? "पूर्ण नक्शे" : "Completed Maps"}
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
                  {lang === "hi" ? "संतुष्ट परिवार" : "Happy Families"}
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
                  {lang === "hi" ? "वर्षों का अनुभव" : "Years Experience"}
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
                  {lang === "hi" ? "कार्य क्षेत्र" : "Service Area"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. ABOUT US SECTION (Honest, Real & Customer Focused)
      ===================================================================== */}
      <section id="about" className="py-20 sm:py-24 border-b border-[#e8e2d4]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left 6 Cols */}
            <div className="lg:col-span-6">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                {lang === "hi" ? "हमारे बारे में" : "About Sarda Homeplan"}
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c] leading-tight">
                {lang === "hi" ? (
                  <>
                    प्रतापगढ़ का विश्वसनीय{" "}
                    <span className="text-[#c18c21]">हाउस प्लानिंग व 2D/3D मैप</span> स्टूडियो।
                  </>
                ) : (
                  <>
                    Pratapgarh&apos;s Trusted{" "}
                    <span className="text-[#c18c21]">House Planning & Map Design</span> Studio.
                  </>
                )}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-black/70">
                {lang === "hi"
                  ? "सरदा होमप्लान प्रतापगढ़ और आसपास के क्षेत्रों में परिवारों के लिए व्यावहारिक, आधुनिक और 100% वास्तु-अनुकूल घर का नक्शा तैयार करता है। हम आपके प्लॉट के साइज और बजट के अनुसार 2D फ्लोर प्लान लेआउट, 3D एलिवेशन और ज़मीनी नाप की सुविधा प्रदान करते हैं।"
                  : "Sarda Homeplan provides practical, customized, and Vastu-friendly house map planning in Pratapgarh and nearby areas. We deliver clean 2D floor plans, 3D exterior looks, and on-site plot measurements tailored to your plot and budget."}
              </p>

              {/* 4 Realistic Pillars */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e4ddcc] bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72] mb-2.5">
                    <Ruler size={16} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    {lang === "hi" ? "स्मार्ट स्पेस प्लानिंग" : "Smart Space Planning"}
                  </h4>
                  <p className="text-xs text-black/60 mt-1">
                    {lang === "hi"
                      ? "कम जगह में भी खुला और हवादार घर बनाने के लिए हर कोने का सही उपयोग।"
                      : "Smart space utilization to create spacious, well-lit, and ventilated rooms."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e4ddcc] bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72] mb-2.5">
                    <Compass size={16} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    {lang === "hi" ? "वास्तु अनुकूल लेआउट" : "Vastu Friendly Layout"}
                  </h4>
                  <p className="text-xs text-black/60 mt-1">
                    {lang === "hi"
                      ? "रसोई, पूजा घर और कमरों का वास्तु अनुसार सही स्थान।"
                      : "Proper room positioning as per practical Vastu principles for peace and harmony."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e4ddcc] bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72] mb-2.5">
                    <MapPin size={16} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    {lang === "hi" ? "ऑन-साइट ज़मीनी नाप" : "On-Site Plot Measurement"}
                  </h4>
                  <p className="text-xs text-black/60 mt-1">
                    {lang === "hi"
                      ? "प्रतापगढ़ और आसपास प्लॉट पर आकर ज़मीनी नाप व दिशा देखने की सुविधा।"
                      : "Physical on-site visit to inspect plot measurements, boundary marks and road front."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e4ddcc] bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72] mb-2.5">
                    <FileText size={16} />
                  </div>
                  <h4 className="font-bold text-sm text-[#11241c]">
                    {lang === "hi" ? "सरल निर्माण ड्राइंग" : "Clear Construction Drawings"}
                  </h4>
                  <p className="text-xs text-black/60 mt-1">
                    {lang === "hi"
                      ? "मिस्त्री और ठेकेदार के आसानी से समझने योग्य स्पष्ट 2D ब्लूप्रिंट।"
                      : "Clear, easy-to-follow layout drawings for masons and local contractors."}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleGetMapClick()}
                  className="flex items-center gap-2 rounded-full bg-[#063b2c] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#0b4d3a]"
                >
                  <span>{lang === "hi" ? "हमारे साथ घर प्लान करें" : "Plan Your Home With Us"}</span>
                  <ArrowRight size={14} />
                </button>

                <a
                  href="tel:+918423406049"
                  className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-xs font-bold text-[#17221b] shadow-sm hover:border-[#063b2c]"
                >
                  <Phone size={13} className="text-[#0c7a62]" />
                  <span>+91 8423406049</span>
                </a>
              </div>
            </div>

            {/* Right 6 Cols: Visual Card with Honest Badge */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl border-2 border-white bg-gradient-to-br from-[#f2ece1] to-[#e4dac6] p-4 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900">
                  <img
                    src="/portfolio/house-plan-02-hd.jpg"
                    alt="Sarda Homeplan House Design"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#f4cf72] mb-1">
                      <CheckCircle2 size={16} />
                      <span>Custom House Map Planning</span>
                    </div>
                    <p className="font-serif text-lg font-bold">
                      &ldquo;Har Ghar Ka Naksha, Jaise Hamara Apna Ghar Ho.&rdquo;
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      Pratapgarh, Prayagraj, Sultanpur & surrounding areas.
                    </p>
                  </div>
                </div>

                {/* 3 Quick Facts */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/80 p-2.5 border border-black/5 shadow-sm">
                    <span className="font-serif text-base font-black text-[#063b2c]">100%</span>
                    <p className="text-[10px] text-black/60 font-semibold">Vastu Friendly</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-black/5 shadow-sm">
                    <span className="font-serif text-base font-black text-[#063b2c]">48 Hrs</span>
                    <p className="text-[10px] text-black/60 font-semibold">First 2D Draft</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-black/5 shadow-sm">
                    <span className="font-serif text-base font-black text-[#063b2c]">Easy</span>
                    <p className="text-[10px] text-black/60 font-semibold">Revisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FEATURED HOUSE PLANS (Portfolio Gallery)
      ===================================================================== */}
      <section id="portfolio" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                {lang === "hi" ? "हमारा काम" : "Our Work Portfolio"}
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
                {lang === "hi" ? (
                  <>
                    लोकप्रिय <span className="text-[#c18c21]">हाउस प्लान्स</span>
                  </>
                ) : (
                  <>
                    Featured <span className="text-[#c18c21]">House Plans</span>
                  </>
                )}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                {lang === "hi"
                  ? "हमारे हाल ही में तैयार किए गए नक्शे। बड़ा नक्शा देखने के लिए किसी भी कार्ड पर क्लिक करें।"
                  : "Some of our recent work. Click any card to view full architectural blueprint."}
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

          {/* 5 Plans Grid */}
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
                    <span className="text-[#063b2c] font-bold">
                      {lang === "hi" ? "नक्शा देखें →" : "View Plan →"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. HOW IT WORKS & VOICE ASSISTANT (Simple, Client-Focused)
      ===================================================================== */}
      <section id="process" className="border-t border-[#e8e2d4] bg-[#fbf9f4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              {lang === "hi" ? "आसान प्रक्रिया" : "Simple 5-Step Process"}
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              {lang === "hi" ? (
                <>
                  घर का नक्शा <span className="text-[#c18c21]">कैसे बनता है?</span>
                </>
              ) : (
                <>
                  How It <span className="text-[#c18c21]">Works</span>
                </>
              )}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60 max-w-xl mx-auto">
              {lang === "hi"
                ? "रिक्वायरमेंट शेयर करने से लेकर साइट नाप, 2D ड्राफ्ट और 3D फाइनल नक्शे तक की सरल प्रक्रिया।"
                : "From requirement submission to plot measurement, 2D draft review and final 3D handover."}
            </p>
          </div>

          {/* 5-Phase Interactive Step Stepper Ribbon */}
          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PROCESS_PHASES.map((phase, idx) => (
              <button
                key={phase.step}
                type="button"
                onClick={() => setSelectedProcessPhase(idx)}
                className={`flex flex-col items-center rounded-2xl border p-3 text-center transition ${
                  selectedProcessPhase === idx
                    ? "border-[#063b2c] bg-[#063b2c] text-white shadow-lg"
                    : "border-[#e4ddcc] bg-white text-black/80 hover:bg-[#faf7f0]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                    selectedProcessPhase === idx
                      ? "bg-[#f4cf72] text-[#063b2c]"
                      : "bg-neutral-100 text-[#063b2c]"
                  }`}
                >
                  {phase.step}
                </span>
                <span className="mt-2 text-xs font-bold line-clamp-1">
                  {lang === "hi"
                    ? phase.titleHi
                    : lang === "en"
                    ? phase.titleEn
                    : phase.titleHinglish}
                </span>
                <span
                  className={`mt-1 text-[10px] font-semibold ${
                    selectedProcessPhase === idx ? "text-[#f4cf72]" : "text-black/40"
                  }`}
                >
                  {phase.timeline}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Phase Detail Card & Voice Assistant Card */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* Left 8 Cols: Customer-Centric Clean Workflow */}
            <div className="rounded-3xl border border-[#e4ddcc] bg-white p-7 shadow-lg lg:col-span-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdf] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#063b2c] text-sm font-black text-[#f4cf72]">
                      {PROCESS_PHASES[selectedProcessPhase].step}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#11241c]">
                        {lang === "hi"
                          ? PROCESS_PHASES[selectedProcessPhase].titleHi
                          : PROCESS_PHASES[selectedProcessPhase].titleEn}
                      </h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        {lang === "hi"
                          ? PROCESS_PHASES[selectedProcessPhase].summaryHi
                          : PROCESS_PHASES[selectedProcessPhase].summaryEn}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f4cf72]/20 border border-[#c18c21]/30 px-3 py-1 text-xs font-bold text-[#8a6316]">
                    ⏱️ {PROCESS_PHASES[selectedProcessPhase].timeline}
                  </span>
                </div>

                {/* Key Checklist for this Phase */}
                <div className="mt-5 rounded-2xl bg-[#faf8f4] p-4 border border-[#eee7db]">
                  <h4 className="text-xs font-bold text-[#063b2c] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>{lang === "hi" ? "इस चरण में क्या होता है:" : "What happens in this step:"}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-black/75">
                    {(lang === "hi"
                      ? PROCESS_PHASES[selectedProcessPhase].detailsHi
                      : PROCESS_PHASES[selectedProcessPhase].detailsEn
                    ).map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#0c7a62] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Output / Deliverable Ribbon */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#eef8f4] p-3.5 border border-[#cceade]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#0c7a62] shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c7a62]">
                        {lang === "hi" ? "आपको क्या मिलता है:" : "What You Receive:"}
                      </span>
                      <p className="text-xs font-bold text-[#063b2c]">
                        {lang === "hi"
                          ? PROCESS_PHASES[selectedProcessPhase].deliverableHi
                          : PROCESS_PHASES[selectedProcessPhase].deliverableEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f0ebdf]">
                <div className="flex items-center gap-2 text-xs text-black/50">
                  <span>Step {selectedProcessPhase + 1} of 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedProcessPhase === 0}
                    onClick={() => setSelectedProcessPhase((p) => Math.max(0, p - 1))}
                    className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold text-black/70 disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={selectedProcessPhase === PROCESS_PHASES.length - 1}
                    onClick={() =>
                      setSelectedProcessPhase((p) => Math.min(PROCESS_PHASES.length - 1, p + 1))
                    }
                    className="rounded-full bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-30"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: INTERACTIVE VOICE ASSISTANT CARD */}
            <div className="rounded-3xl border-2 border-[#12543f] bg-[#07382a] p-6 text-white shadow-xl lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f4cf72] mb-4">
                  <Mic size={24} className={isListening ? "animate-pulse text-red-400" : ""} />
                </div>

                <h3 className="font-serif text-xl font-bold leading-snug">
                  {lang === "hi" ? (
                    <>
                      टाइप नहीं करना चाहते?
                      <br />
                      बोलकर बताएं।
                    </>
                  ) : (
                    <>
                      Don&apos;t want to type?
                      <br />
                      Just tell us.
                    </>
                  )}
                </h3>
                <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                  {lang === "hi"
                    ? "अपनी भाषा (हिन्दी, उर्दू या इंग्लिश) में अपनी आवश्यकताएं आसानी से बोलकर रिकॉर्ड करें।"
                    : "Use voice input to share your requirements easily in your native dialect."}
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
                  <div className="mt-3 rounded-xl bg-white/10 p-2.5 text-center text-xs text-[#f4cf72] font-semibold animate-pulse border border-[#f4cf72]/30">
                    🎙️ {lang === "hi" ? "सुन रहे हैं... कृपया बोलिए" : "Listening... Please speak now"}
                  </div>
                )}
              </div>

              {/* Start Voice Action Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4cf72] py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-[1.02]"
              >
                <span>
                  {isListening
                    ? lang === "hi"
                      ? "सुन रहे हैं..."
                      : "Listening..."
                    : lang === "hi"
                    ? "बोलना शुरू करें 🎙️"
                    : "Start Voice Requirement 🎙️"}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. OUR SERVICES (5 Core Services Cards from Mockup)
      ===================================================================== */}
      <section id="services" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              {lang === "hi" ? "हमारी सेवाएं" : "What We Offer"}
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              {lang === "hi" ? (
                <>
                  हमारी <span className="text-[#c18c21]">सेवाएं</span>
                </>
              ) : (
                <>
                  Our <span className="text-[#c18c21]">Services</span>
                </>
              )}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              {lang === "hi"
                ? "घर की संपूर्ण प्लानिंग और ब्लूप्रिंट समाधान"
                : "Complete Home Planning Solutions for Every Plot"}
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
                    <span>{lang === "hi" ? "विस्तार से जानें" : "Know More"}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. BEFORE → AFTER COMPARISON
      ===================================================================== */}
      <section className="border-t border-[#e8e2d4] bg-[#fbf9f4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
              {lang === "hi" ? "वास्तविक रूपांतरण" : "Real Transformation"}
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold text-[#11241c]">
              Before <span className="text-[#c18c21]">→ After</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              {lang === "hi"
                ? "आपके हाथ के रफ स्केच से लेकर पेशेवर 2D ब्लूप्रिंट तक"
                : "Your Rough Sketch to Professional Architectural Plan"}
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
                    alt="After - Sarda Homeplan CAD Map"
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
                ↔ {lang === "hi"
                  ? "हैंडल को ड्रैग करके रफ स्केच (Before) और फाइनल कैड (After) का अंतर देखें।"
                  : "Drag handle to compare Client Rough Sketch (Before) vs Final Plan (After)."}
              </p>
            </div>

            {/* RIGHT 5 COLS: WHY CHOOSE SARDA HOMEPLAN */}
            <div className="rounded-3xl border border-[#e4ddcc] bg-white p-7 shadow-lg lg:col-span-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                {lang === "hi" ? "हमारा भरोसा" : "Our Assurance"}
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
                    <h4 className="font-bold text-sm text-[#11241c]">
                      {lang === "hi" ? "कस्टमाइज़्ड व सटीक प्लानिंग" : "Personalized Plans"}
                    </h4>
                    <p className="text-xs text-black/55 mt-0.5">
                      {lang === "hi"
                        ? "हर परिवार, बजट और प्लॉट के आकार के हिसाब से विशेष नक्शा।"
                        : "Customized for every plot size, frontage, and family structure."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">
                      {lang === "hi" ? "वास्तु अनुकूल डिज़ाइन" : "Vastu Friendly Designs"}
                    </h4>
                    <p className="text-xs text-black/55 mt-0.5">
                      {lang === "hi"
                        ? "सुख, शांति और समृद्धि के लिए व्यावहारिक वास्तु नियमों का पालन।"
                        : "Practical Vastu alignment for peace, sunlight, and positive energy."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">
                      {lang === "hi" ? "पारदर्शी व किफायती मूल्य" : "Affordable & Transparent Pricing"}
                    </h4>
                    <p className="text-xs text-black/55 mt-0.5">
                      {lang === "hi"
                        ? "कोई छुपा हुआ चार्ज नहीं, सीधा और स्पष्ट मूल्य।"
                        : "No hidden charges, clear and honest pricing."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">
                      {lang === "hi" ? "सीधी बातचीत व सहायता" : "Direct Friendly Consultation"}
                    </h4>
                    <p className="text-xs text-black/55 mt-0.5">
                      {lang === "hi"
                        ? "सीधा संपर्क और आपके हर सवाल का स्पष्ट जवाब।"
                        : "Direct communication and prompt answers to all your planning questions."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8f4] text-[#0c7a62] shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#11241c]">
                      {lang === "hi" ? "हिन्दी, इंग्लिश व उर्दू में संवाद" : "Multilingual Support"}
                    </h4>
                    <p className="text-xs text-black/55 mt-0.5">
                      {lang === "hi"
                        ? "आपकी सुविधाजनक भाषा में सहज सहायता व मार्गदर्शन।"
                        : "Support available in Hindi, English, and Urdu."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-[#f0ebdf]">
                <button
                  type="button"
                  onClick={() => handleGetMapClick()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-3 text-xs font-bold text-white shadow-md hover:bg-[#09503c] transition"
                >
                  <span>{lang === "hi" ? "आज ही प्लानिंग शुरू करें →" : "Start Your Planning Today →"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. CLIENT PORTAL TEASER (Your Project, Always in Your Hands)
      ===================================================================== */}
      <section className="bg-[#07382a] py-16 sm:py-20 text-white overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* LEFT 6 COLS: COPY & FEATURES */}
            <div className="lg:col-span-6">
              <span className="rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#f4cf72]">
                {lang === "hi" ? "कस्टमर पोर्टल" : "Client Dashboard"}
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight">
                {lang === "hi" ? (
                  <>
                    आपका प्रोजेक्ट,
                    <br />
                    हमेशा आपकी मुट्ठी में।
                  </>
                ) : (
                  <>
                    Your Project,
                    <br />
                    Always in Your Hands.
                  </>
                )}
              </h2>
              <p className="mt-3 text-sm text-white/70 max-w-md leading-relaxed">
                {lang === "hi"
                  ? "अपने कस्टमर डैशबोर्ड में लॉगिन करके लाइव प्रोजेक्ट स्टेटस देखें, साइट विज़िट बुक करें, 2D ड्राफ्ट को रिव्यू करें, और फाइनल ब्लूप्रिंट डाउनलोड करें।"
                  : "Login to your customer dashboard to track requirements, book site visits, check payment receipts, review 2D maps, and download final plans."}
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/customer/login"
                  className="flex items-center gap-2 rounded-full bg-[#f4cf72] px-6 py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-105"
                >
                  <span>{lang === "hi" ? "कस्टमर लॉगिन करें" : "Login to Dashboard"}</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/customer/signup"
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <span>{lang === "hi" ? "नया खाता बनाएं" : "Create Account"}</span>
                </Link>
              </div>

              {/* 5 Portal Feature Points */}
              <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-white/80 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Live Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Site Visit Schedule</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>2D Draft Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Final Map Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#f4cf72]" />
                  <span>Official Receipts</span>
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
                  <span className="text-[10px] font-mono text-black/40">
                    sardahomeplan.com/customer/dashboard
                  </span>
                  <div className="w-8" />
                </div>

                {/* Dashboard Snapshot Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-[#f4f0e6] p-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#8a6316]">
                        Active Project
                      </p>
                      <h4 className="font-serif text-sm font-bold text-[#063b2c]">
                        Plot 30x40 Ft • 2 BHK House
                      </h4>
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
                      <span className="text-[11px] font-medium text-black/70">
                        Revised 2D concept plan uploaded
                      </span>
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
          10. CUSTOMER REVIEWS & FAQ SECTION
      ===================================================================== */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* LEFT 6 COLS: WHAT OUR CUSTOMERS SAY */}
            <div className="lg:col-span-6">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                {lang === "hi" ? "ग्राहकों के विचार" : "Real Experiences"}
              </span>
              <h2 className="mt-1 font-serif text-3xl font-extrabold text-[#11241c]">
                {lang === "hi" ? "हमारे ग्राहकों का अनुभव" : "What Our Customers Say"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                {lang === "hi"
                  ? "उन परिवारों का फीडबैक जिन्होंने हम पर भरोसा किया।"
                  : "Verified feedback from clients who trusted us with their house planning."}
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
                        <span className="text-[10px] text-black/50">
                          {t.location} • {t.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 6 COLS: FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
            <div className="lg:col-span-6" id="faq">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#9b7732]">
                {lang === "hi" ? "स्पष्ट उत्तर" : "Clear Answers"}
              </span>
              <h2 className="mt-1 font-serif text-3xl font-extrabold text-[#11241c]">
                {lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/60">
                {lang === "hi"
                  ? "नक्शा बनवाने की प्रक्रिया व फीस से जुड़े सामान्य सवाल।"
                  : "Find quick answers to common questions about house maps and process."}
              </p>

              <div className="mt-8 space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = activeFaqIndex === index;
                  const question =
                    lang === "hi" ? faq.qHi : lang === "en" ? faq.qEn : faq.qHinglish;
                  const answer =
                    lang === "hi" ? faq.aHi : lang === "en" ? faq.aEn : faq.aHinglish;

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
                        <span className="pr-4">{question}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f0e6] text-[#063b2c] shrink-0 text-sm font-bold">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#f0ebdf] px-4.5 py-3.5 bg-[#fbf9f4] text-xs text-black/65 leading-relaxed">
                          {answer}
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
          11. PRE-FOOTER CTA BANNER (Real WhatsApp & Phone)
      ===================================================================== */}
      <section className="bg-[#07382a] py-14 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-r from-[#063b2c] to-[#0d4f3b] p-8 sm:p-12 shadow-2xl">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f4cf72]">
                  {lang === "hi" ? "आज ही शुरुआत करें" : "Get Started Today"}
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold leading-tight">
                  {lang === "hi" ? "अपने सपनों का घर प्लान करने के लिए तैयार हैं?" : "Ready to Plan Your Dream Home?"}
                </h2>
                <p className="mt-2 text-sm text-white/75 max-w-xl">
                  {lang === "hi"
                    ? "आज ही अपनी आवश्यकताएं साझा करें और अपने प्लॉट के लिए व्यावहारिक, 100% वास्तु-सम्मत नक्शा बनवाएं।"
                    : "Share your plot requirements today and get a clean, Vastu-compliant house map tailored to your budget."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleGetMapClick()}
                    className="flex items-center gap-2 rounded-full bg-[#f4cf72] px-6 py-3 text-xs font-extrabold text-[#063b2c] shadow-lg transition hover:bg-[#ffe39c] hover:scale-105"
                  >
                    <span>{lang === "hi" ? "नक्शा बनवाएं" : "Get Your House Map"}</span>
                    <ArrowRight size={14} />
                  </button>

                  <a
                    href="https://wa.me/918423406049?text=Namaste%20Sarda%20Homeplan%20team%2C%20mujhe%20apne%20plot%20ka%20naksha%20banwana%20hai."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white transition hover:bg-[#25D366] hover:border-[#25D366]"
                  >
                    <MessageCircle size={15} />
                    <span>{lang === "hi" ? "व्हाट्सएप पर बात करें" : "Talk on WhatsApp"}</span>
                  </a>
                </div>
              </div>

              {/* Graphic on Right */}
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
          12. FOOTER (With Real Phone: 8423406049)
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
                {lang === "hi"
                  ? "प्रतापगढ़ व आसपास के क्षेत्रों में हाउस प्लानिंग, 2D कैड नक्शा और वास्तु परामर्श का आपका सबसे भरोसेमंद साथी।"
                  : "Your Trusted Partner for House Planning & Vastu Consultation in Pratapgarh and Eastern Uttar Pradesh."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://wa.me/918423406049"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-black/10 text-black/70 hover:bg-[#25D366] hover:text-white transition"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={15} />
                </a>
                <a
                  href="tel:+918423406049"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-black/10 text-black/70 hover:bg-[#063b2c] hover:text-white transition"
                  aria-label="Phone"
                >
                  <Phone size={15} />
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
                <li><a href="#about" className="hover:text-[#063b2c]">About Us</a></li>
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

            {/* Col 4: Contact Us (REAL NUMBER) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#063b2c]">
                Contact Us
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-black/65">
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-[#0c7a62]" />
                  <a href="tel:+918423406049" className="hover:text-[#063b2c] font-bold">+91 8423406049</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle size={13} className="text-[#0c7a62]" />
                  <a href="https://wa.me/918423406049" target="_blank" rel="noreferrer" className="hover:text-[#063b2c]">+91 8423406049 (WhatsApp)</a>
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
          12.5. LOGIN ROLE SELECTION MODAL ("Login as Customer or Admin")
      ===================================================================== */}
      {loginRoleModalOpen && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setLoginRoleModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[#e8dfcf] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#f0ebdf] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                  SARDA HOMEPLAN PORTAL
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#11241c] mt-0.5">
                  {lang === "hi"
                    ? "लॉगिन पोर्टल चुनें"
                    : lang === "hinglish"
                    ? "Login Portal Select Karein"
                    : "Choose Login Portal"}
                </h3>
                <p className="text-xs text-black/60 mt-1">
                  {lang === "hi"
                    ? "कृपया चुनें कि आप किस रूप में लॉगिन करना चाहते हैं:"
                    : lang === "hinglish"
                    ? "Chunein ki aap Customer ke roop me login karna chahte hain ya Admin ke roop me:"
                    : "Select whether you want to access Customer Portal or Studio Admin:"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoginRoleModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/60 hover:bg-black/10 hover:text-black transition text-lg font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Role Options */}
            <div className="mt-5 space-y-3.5">
              {/* Option 1: Customer Login */}
              <Link
                href={currentUser ? "/customer/dashboard" : "/customer/login"}
                onClick={() => setLoginRoleModalOpen(false)}
                className="group relative flex items-start gap-4 rounded-2xl border-2 border-[#eee7db] bg-[#faf8f4] p-4 transition hover:border-[#0c7a62] hover:bg-white hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c7a62] to-[#063b2c] text-white shadow-md group-hover:scale-105 transition-transform">
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-base font-bold text-[#11241c] group-hover:text-[#0c7a62] transition-colors">
                      {lang === "hi"
                        ? "कस्टमर लॉगिन (Customer Login)"
                        : "Customer Login"}
                    </h4>
                    <span className="rounded-full bg-[#0c7a62]/10 px-2 py-0.5 text-[10px] font-bold text-[#0c7a62]">
                      {lang === "hi" ? "मकान मालिक / क्लाइंट" : "Homeowner & Client"}
                    </span>
                  </div>
                  <p className="text-xs text-black/70 mt-1 leading-relaxed">
                    {lang === "hi"
                      ? "नक्शा प्रगति ट्रैक करें, साइट विज़िट बुक करें, 2D/3D ड्राफ्ट अप्रूव करें और फाइनल फाइल्स डाउनलोड करें।"
                      : lang === "hinglish"
                      ? "House map drafting progress dekhein, site visit schedule karein, revisions mangein aur blueprint download karein."
                      : "Track plan progress, schedule plot visits, review draft house maps, and download blueprints."}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#0c7a62]">
                    <span>
                      {currentUser
                        ? (lang === "hi" ? "कस्टमर डैशबोर्ड खोलें" : "Open Customer Dashboard")
                        : (lang === "hi" ? "कस्टमर के रूप में लॉगिन करें" : "Login as Customer")}
                    </span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Option 2: Admin Login */}
              <Link
                href="/admin/login"
                onClick={() => setLoginRoleModalOpen(false)}
                className="group relative flex items-start gap-4 rounded-2xl border-2 border-[#eee7db] bg-[#faf8f4] p-4 transition hover:border-[#9b7732] hover:bg-white hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9b7732] to-[#6d511e] text-white shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-base font-bold text-[#11241c] group-hover:text-[#9b7732] transition-colors">
                      {lang === "hi"
                        ? "एडमिन लॉगिन (Admin Login)"
                        : "Admin Login"}
                    </h4>
                    <span className="rounded-full bg-[#9b7732]/10 px-2 py-0.5 text-[10px] font-bold text-[#9b7732]">
                      {lang === "hi" ? "स्टूडियो ऑपरेशन्स" : "Studio Management"}
                    </span>
                  </div>
                  <p className="text-xs text-black/70 mt-1 leading-relaxed">
                    {lang === "hi"
                      ? "स्टूडियो प्रबंधन, सभी कस्टमर इन्क्वायरीज़, साइट विज़िट, और ब्लूप्रिंट ड्राफ्ट अपलोड हैंडल करें।"
                      : lang === "hinglish"
                      ? "Studio operations, client intake requests, site visit schedule aur blueprint files manage karein."
                      : "Studio operations, client intake requests, site visits, and blueprint uploads."}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#9b7732]">
                    <span>
                      {lang === "hi" ? "एडमिन के रूप में लॉगिन करें" : "Login as Admin"}
                    </span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Footer with Signup Link */}
            <div className="mt-5 border-t border-[#f0ebdf] pt-4 text-center">
              <p className="text-xs text-black/70">
                {lang === "hi"
                  ? "नया ग्राहक खाता बनाना चाहते हैं? "
                  : lang === "hinglish"
                  ? "Naya customer account banana chahte hain? "
                  : "Need a new homeowner account? "}
                <Link
                  href="/customer/signup"
                  onClick={() => setLoginRoleModalOpen(false)}
                  className="font-bold text-[#0c7a62] hover:underline"
                >
                  {lang === "hi" ? "यहाँ रजिस्टर करें" : "Register here"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          13. AUTH PROMPT GATEWAY MODAL ("Account Required to Submit")
      ===================================================================== */}
      {authPromptModalOpen && (
        <div
          className="fixed inset-0 z-[165] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setAuthPromptModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#f0ebdf] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b7732]">
                  PROJECT TRACKING NOTICE
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#11241c]">
                  {lang === "hi"
                    ? "नक्शा बनवाने के लिए पहले लॉगिन या रजिस्टर करें"
                    : "Login or Register to Submit Your House Map"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthPromptModalOpen(false)}
                className="text-black/50 hover:text-black font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-black/70 leading-relaxed">
                {lang === "hi"
                  ? "सरदा होमप्लान हर प्रोजेक्ट को आपके व्यक्तिगत कस्टमर डैशबोर्ड से जोड़ता है। खाता होने से आप:"
                  : "Sarda Homeplan connects every project to your private Customer Dashboard so that you can:"}
              </p>

              <div className="mt-3 space-y-2 rounded-2xl bg-[#faf8f4] p-4 border border-[#eee7db] text-xs text-black/75">
                <div className="flex items-center gap-2">
                  <span className="text-[#0c7a62] font-bold">✓</span>
                  <span>
                    {lang === "hi"
                      ? "अपने नक्शे की लाइव ड्राफ्टिंग प्रगति देख सकेंगे।"
                      : "Track your house plan drafting progress live in real-time."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0c7a62] font-bold">✓</span>
                  <span>
                    {lang === "hi"
                      ? "प्लॉट साइट विज़िट तिथि बुक व रीशेड्यूल कर सकेंगे।"
                      : "Book, confirm, and reschedule plot site visits."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0c7a62] font-bold">✓</span>
                  <span>
                    {lang === "hi"
                      ? "2D ड्राफ्ट देखकर 'Need Change' या 'Final the Map' कर सकेंगे।"
                      : "Review 2D drafts with 'Need Change' and 'Final the Map' approval buttons."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0c7a62] font-bold">✓</span>
                  <span>
                    {lang === "hi"
                      ? "फाइनल ब्लूप्रिंट व पेमेंट रसीदें डाउनलोड कर सकेंगे।"
                      : "Download final house maps and verified payment receipts."}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/customer/login"
                  onClick={() => setAuthPromptModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#063b2c] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0b4d3a]"
                >
                  <LogIn size={14} />
                  <span>{lang === "hi" ? "कस्टमर लॉगिन करें" : "Customer Login"}</span>
                </Link>

                <Link
                  href="/customer/signup"
                  onClick={() => setAuthPromptModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-3 text-xs font-bold text-[#17221b] shadow-sm hover:border-[#063b2c]"
                >
                  <User size={14} />
                  <span>{lang === "hi" ? "नया खाता बनाएं (Register)" : "Create New Account"}</span>
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0ebdf] text-center">
                <a
                  href="https://wa.me/918423406049?text=Namaste%20Sarda%20Homeplan%2C%20mujhe%20apne%20plot%20ke%20naksha%20ke%20baare%20me%20jaankari%20chahiye."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c7a62] hover:underline"
                >
                  <MessageCircle size={14} />
                  <span>
                    {lang === "hi"
                      ? "या सीधे व्हाट्सएप (+91 8423406049) पर बात करें"
                      : "Or chat directly on WhatsApp (+91 8423406049)"}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          14. QUICK INQUIRY / REQUIREMENT MODAL (For Authenticated Users)
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
                  SARDA HOMEPLAN INTAKE
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#11241c]">
                  {lang === "hi" ? "अपने घर का नक्शा बनवाएं" : "Get Your House Map"}
                </h3>
                <p className="mt-1 text-xs text-black/55">
                  {lang === "hi"
                    ? "अपनी आवश्यकताएं भरें और हम आपका कस्टमाइज़्ड प्लान तैयार करेंगे।"
                    : "Share your requirements and we will prepare your customized plan."}
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
                  Namaste {fullName}! Aapki requirement record ho chuki hai. Hamari team aapse jald hi call ya WhatsApp par contact karegi.
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
                      placeholder="e.g. 8423406049"
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
          15. FULLSCREEN BLUEPRINT PREVIEW MODAL
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
                    Custom Design
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
                  const note = `Interested in similar plan: ${activePlanModal.title} (${activePlanModal.badge}, ${activePlanModal.dimensions})`;
                  setActivePlanModal(null);
                  handleGetMapClick(note);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#f4cf72] px-5 py-2 text-xs font-extrabold text-[#063b2c] shadow-lg hover:bg-[#ffe39c] transition"
              >
                <span>I Want a Similar Plan</span>
                <ArrowRight size={13} />
              </button>

              <a
                href={`https://wa.me/918423406049?text=${encodeURIComponent(
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
          16. SERVICE DETAIL MODAL ("Know More →")
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
                  const note = `Inquiry for service: ${activeServiceModal.title}`;
                  setActiveServiceModal(null);
                  handleGetMapClick(note);
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
          17. QUICK SEARCH MODAL
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
          18. FLOATING WHATSAPP CHAT BUTTON (REAL NUMBER: 8423406049)
      ===================================================================== */}
      <a
        href="https://wa.me/918423406049?text=Namaste%20Sarda%20Homeplan%2C%20mujhe%20ghar%20ka%20naksha%20banwana%20hai."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110 hover:shadow-[0_10px_25px_rgba(37,211,102,0.4)]"
        aria-label="Direct WhatsApp Chat"
        title="Chat on WhatsApp (+91 8423406049)"
      >
        <MessageCircle size={28} />
      </a>
    </main>
  );
}