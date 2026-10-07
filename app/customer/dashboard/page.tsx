"use client";

import { useEffect, useState, useMemo, type ComponentType } from "react";
import Link from "next/link";
import {
  Home,
  FileText,
  MapPin,
  FolderOpen,
  CreditCard,
  ClipboardList,
  User,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Leaf,
  Headphones,
  MessageCircle,
  Phone,
  Folder,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  Pencil,
  AlertCircle,
  Eye,
  Maximize2,
  Camera,
  Trash2,
  Upload,
  Compass,
  Sparkles,
  Send,
  RefreshCw,
  ChevronUp,
  Layers,
} from "lucide-react";

import { createClient } from "@/lib/supabase-client";

type IconType = ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

type TabType =
  | "dashboard"
  | "project"
  | "visit"
  | "plans"
  | "payments"
  | "documents"
  | "notifications"
  | "profile";

const INDIAN_STATES = [
  "Bihar",
  "Uttar Pradesh",
  "Jharkhand",
  "West Bengal",
  "Delhi (NCR)",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Puducherry",
  "Other State / Region",
];

/* =====================================================
   NAV ITEM COMPONENT
===================================================== */
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: IconType;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[48px] w-full items-center justify-between rounded-[16px] px-4 text-left transition ${
        active
          ? "bg-[#f4cf72] font-bold text-[#063b2c] shadow-sm"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon size={21} strokeWidth={active ? 2.3 : 1.9} />
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            active
              ? "bg-[#063b2c] text-[#f4cf72]"
              : "bg-[#f4cf72] text-[#063b2c]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* =====================================================
   STATUS CARD COMPONENT
===================================================== */
function StatusCard({
  icon: Icon,
  title,
  value,
  description,
  iconBg,
  iconColor,
  onClick,
}: {
  icon: IconType;
  title: string;
  value: string;
  description: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group min-w-0 cursor-pointer rounded-[20px] border border-[#e4dfd5] bg-white p-5 shadow-[0_2px_12px_rgba(30,35,30,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#bda76d] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon size={26} className={iconColor} strokeWidth={1.9} />
        </div>

        <ChevronRight
          size={18}
          className="mt-2 shrink-0 text-black/35 transition group-hover:translate-x-0.5 group-hover:text-[#063b2c]"
          strokeWidth={2}
        />
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-black/50">
          {title}
        </p>

        <h3 className="mt-1 truncate font-serif text-[19px] font-bold text-[#17221b]">
          {value}
        </h3>

        <p className="mt-1 truncate text-[12px] text-black/55">{description}</p>
      </div>
    </div>
  );
}

/* =====================================================
   JOURNEY STEP COMPONENT
===================================================== */
function JourneyStep({
  icon: Icon,
  title,
  status,
  isCurrent,
  isCompleted,
}: {
  icon: IconType;
  title: string;
  status: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <div className="relative min-w-0 flex-1 text-center">
      <div
        className={`mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 transition ${
          isCompleted
            ? "border-[#0c7a62] bg-[#0c7a62] text-white shadow-sm"
            : isCurrent
            ? "border-[#d5a842] bg-[#fbf5e5] text-[#8a6312] shadow-[0_0_0_4px_rgba(213,168,66,0.15)]"
            : "border-[#d9d5cb] bg-[#faf9f6] text-black/40"
        }`}
      >
        <Icon size={22} strokeWidth={isCompleted || isCurrent ? 2.2 : 1.7} />
      </div>

      <p
        className={`mt-3 min-h-[36px] text-[13px] font-bold leading-[1.2] ${
          isCurrent
            ? "text-[#8a6312]"
            : isCompleted
            ? "text-[#0c7a62]"
            : "text-[#17221b]"
        }`}
      >
        {title}
      </p>

      <div
        className={`mt-2 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold ${
          isCompleted
            ? "bg-[#eaf5ed] text-[#0c7a62]"
            : isCurrent
            ? "bg-[#fdf4dc] text-[#8a6312]"
            : "bg-[#f5f2eb] text-black/50"
        }`}
      >
        {status}
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customer Data & Extra Profile Fields
  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("");
  const [customerAvatar, setCustomerAvatar] = useState("");
  const [customerLandmark, setCustomerLandmark] = useState("");
  const [customerPinCode, setCustomerPinCode] = useState("");
  const [customerState, setCustomerState] = useState("Bihar");
  const [customerPropertyType, setCustomerPropertyType] = useState("Residential (1-3 Floor)");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerLanguage, setCustomerLanguage] = useState("Hindi");
  const [userId, setUserId] = useState<string | null>(null);

  // Request & Project Data
  const [customerRequest, setCustomerRequest] = useState<any | null>(null);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestStatus, setRequestStatus] = useState("Not submitted yet");

  const [hasProject, setHasProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectData, setProjectData] = useState<any | null>(null);

  // Customer Uploaded Rough Sketch & Deliverables
  const [uploadedSketch, setUploadedSketch] = useState<string | null>(null);
  const [uploadedSketchName, setUploadedSketchName] = useState<string | null>(null);
  const [showInspirations, setShowInspirations] = useState(false);

  // Admin-Uploaded Deliverable Plans
  const [adminRoughDraft, setAdminRoughDraft] = useState<{
    title: string;
    image: string;
    note: string;
    date: string;
  } | null>(null);
  const [adminFinalBlueprint, setAdminFinalBlueprint] = useState<{
    title: string;
    image: string;
    note: string;
    date: string;
  } | null>(null);
  const [adminMistriSheet, setAdminMistriSheet] = useState<{
    title: string;
    image: string;
    note: string;
    date: string;
  } | null>(null);
  const [showMistriSheetModal, setShowMistriSheetModal] = useState(false);

  // Plan Revision Request
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSuccessBanner, setRevisionSuccessBanner] = useState(false);

  // Site Visit Data
  const [siteVisit, setSiteVisit] = useState<any | null>(null);
  const [siteVisitLoading, setSiteVisitLoading] = useState(true);
  const [isRespondingToVisit, setIsRespondingToVisit] = useState(false);

  // Reschedule Modal
  const [showReschedule, setShowReschedule] = useState(false);
  const [preferredVisitDate, setPreferredVisitDate] = useState("");
  const [preferredVisitTime, setPreferredVisitTime] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");

  // HD Plan Preview Modal
  const [activePlanPreview, setActivePlanPreview] = useState<any | null>(null);

  // Profile Edit Modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [editPinCode, setEditPinCode] = useState("");
  const [editState, setEditState] = useState("Bihar");
  const [editPropertyType, setEditPropertyType] = useState("Residential (1-3 Floor)");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editLanguage, setEditLanguage] = useState("Hindi");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Customer Notifications & Alert Center
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [customerPaymentsList, setCustomerPaymentsList] = useState<any[]>([]);
  const [serverNotifications, setServerNotifications] = useState<any[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Rough Plan Finalization & In-line Revision
  const [showInlineRevisionBox, setShowInlineRevisionBox] = useState(false);
  const [isFinalizingPlan, setIsFinalizingPlan] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined" && userId) {
      const stored = localStorage.getItem(`sarada_read_notifs_${userId}`);
      if (stored) {
        try {
          setReadNotifIds(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, [userId]);

  const markAllNotificationsAsRead = async () => {
    const allIds = customerNotifications.map((n) => n.id);
    setReadNotifIds((prev) => Array.from(new Set([...prev, ...allIds])));
    setServerNotifications((prev) => prev.map((sn) => ({ ...sn, is_read: true })));
    if (userId) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`sarada_read_notifs_${userId}`, JSON.stringify(allIds));
      }
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId);
      } catch (_) {}
    }
  };

  const markSingleNotificationAsRead = async (notifId: string) => {
    setReadNotifIds((prev) => Array.from(new Set([...prev, notifId])));
    setServerNotifications((prev) =>
      prev.map((sn) => (String(sn.id) === String(notifId) ? { ...sn, is_read: true } : sn))
    );
    if (typeof window !== "undefined" && userId) {
      const updated = Array.from(new Set([...readNotifIds, notifId]));
      localStorage.setItem(`sarada_read_notifs_${userId}`, JSON.stringify(updated));
    }
    if (userId && !isNaN(Number(notifId))) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", Number(notifId));
      } catch (_) {}
    }
  };

  // Automatically mark notifications as seen when customer views the notifications tab or opens modal
  useEffect(() => {
    if ((activeTab === "notifications" || showNotificationsModal) && userId) {
      markAllNotificationsAsRead();
    }
  }, [activeTab, showNotificationsModal, userId]);

  const customerNotifications = useMemo(() => {
    const list: any[] = [];
    const isReschedulePending =
      siteVisit?.status === "Reschedule Requested" ||
      siteVisit?.customer_response === "Reschedule Requested";

    // 1. Site Visit Alert
    if (isReschedulePending) {
      list.push({
        id: `notif-visit-reschedule-${siteVisit.id || "reschedule"}`,
        type: "visit",
        title: "⏳ Site Visit Reschedule Request Sent",
        message: `Aapne naya visit time (${siteVisit.customer_preferred_date || "Date"} at ${siteVisit.customer_preferred_time || "Time"}) propose kiya hai. Architect team jald hi confirm karegi.`,
        date: siteVisit.customer_preferred_date || "Pending",
        actionTab: "visit",
        actionLabel: "View Rescheduled Request Time",
        badge: "Reschedule Pending",
        badgeColor: "bg-[#fff0cf] text-[#8c6710]",
      });
    } else if (siteVisit?.status === "Confirmed") {
      list.push({
        id: `notif-visit-confirmed-${siteVisit.id || siteVisit.visit_date}`,
        type: "visit",
        title: "✅ Site Visit Confirm Ho Gaya!",
        message: `Aapka site visit ${siteVisit.visit_date} at ${siteVisit.visit_time} ke liye confirm ho chuka hai. Hum diye gaye samay par plot par milenge.`,
        date: siteVisit.visit_date || "Recent",
        actionTab: "visit",
        actionLabel: "View Visit Details",
        badge: "Confirmed",
        badgeColor: "bg-[#eaf4eb] text-[#24632c]",
      });
    } else if (siteVisit?.status === "Proposed") {
      list.push({
        id: `notif-visit-proposed-${siteVisit.id || siteVisit.visit_date}`,
        type: "visit",
        title: "📅 Architect Ne Site Visit Schedule Propose Kiya",
        message: `Architect ne aapke plot par aane ke liye ${siteVisit.visit_date} at ${siteVisit.visit_time} propose kiya hai. Kripya check karke confirm karein ya naya samay batayein.`,
        date: siteVisit.visit_date || "Recent",
        actionTab: "visit",
        actionLabel: "Review Visit Time",
        badge: "Action Required",
        badgeColor: "bg-[#fff0cf] text-[#8c6710]",
      });
    }

    // 2. Rough Draft Plan Alert
    if (adminRoughDraft) {
      list.push({
        id: `notif-rough-${adminRoughDraft.title || "plan"}`,
        type: "plan",
        title: "📐 2D Floor Plan (Rough Draft) Uploaded",
        message: `${adminRoughDraft.title} architect dwara upload kar diya gaya hai. Kripya room sizes aur Vastu layout check karein.`,
        date: adminRoughDraft.date || "Recent",
        actionTab: "plans",
        actionLabel: "View 2D Layout",
        badge: "Phase 1 Ready",
        badgeColor: "bg-[#eef5ee] text-[#0c7a62]",
      });
    }

    // 3. Final HD Blueprint Alert
    if (adminFinalBlueprint) {
      list.push({
        id: `notif-final-${adminFinalBlueprint.title || "blueprint"}`,
        type: "plan",
        title: "🏛️ Final HD Architectural Blueprint Ready",
        message: `${adminFinalBlueprint.title} upload ho gaya hai. Aap ise high-definition me download aur print kar sakte hain.`,
        date: adminFinalBlueprint.date || "Recent",
        actionTab: "plans",
        actionLabel: "View Blueprint",
        badge: "Final Deliverable",
        badgeColor: "bg-[#e8f1f5] text-[#235872]",
      });
    }

    // 4. Mistri Sheet Alert
    if (adminMistriSheet) {
      list.push({
        id: `notif-mistri-${adminMistriSheet.title || "mistri"}`,
        type: "plan",
        title: "🔨 Thekedar & Mistri Execution Handout Ready",
        message: `On-site nirman ke liye technical execution sheet (deewar, column, saria aur curing) ready hai.`,
        date: adminMistriSheet.date || "Recent",
        actionTab: "plans",
        actionLabel: "Open Mistri Sheet",
        badge: "On-Site Guide",
        badgeColor: "bg-[#faf4e6] text-[#8f6d23]",
      });
    }

    // 5. Custom notification markers sent by Admin
    if (customerRequest?.requirements) {
      const matches = customerRequest.requirements.matchAll(/\[ADMIN_NOTIFICATION_ENTRY:([\s\S]*?)\]/g);
      for (const m of matches) {
        try {
          const parsed = JSON.parse(m[1]);
          const isStaleConfirm =
            isReschedulePending &&
            (parsed.actionTab === "visit" ||
              String(parsed.title || "").toLowerCase().includes("confirm") ||
              String(parsed.message || "").toLowerCase().includes("confirm"));
          if (isStaleConfirm) continue;

          list.push({
            id: `notif-custom-${parsed.id || parsed.title}`,
            type: parsed.type || "general",
            title: parsed.title,
            message: parsed.message,
            date: parsed.date || "Recent",
            actionTab: parsed.actionTab || "project",
            actionLabel: "View Update",
            badge: "Architect Update",
            badgeColor: "bg-[#f4ead0] text-[#8c6710]",
          });
        } catch (_) {}
      }
    }

    // 6. Supabase Database Notifications (Pure DB Source of Truth)
    serverNotifications.forEach((n) => {
      if (!list.some((existing) => existing.id === String(n.id) || existing.title === n.title)) {
        list.push({
          id: String(n.id),
          type: n.type || "general",
          title: n.title,
          message: n.message,
          isRead: Boolean(n.is_read),
          date: n.created_at
            ? new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "Recent",
          actionTab: n.action_tab || "project",
          actionLabel:
            n.action_tab === "visit"
              ? "Check Site Visit"
              : n.action_tab === "plans"
              ? "View Plans"
              : n.action_tab === "payments"
              ? "View Payments"
              : "View Details",
          badge: n.badge || "Architect Update",
          badgeColor: n.badge_color || "bg-[#eef5ee] text-[#0c7a62]",
        });
      }
    });

    return list;
  }, [siteVisit, adminRoughDraft, adminFinalBlueprint, adminMistriSheet, customerRequest, userId, serverNotifications]);

  const unreadCount = useMemo(() => {
    return customerNotifications.filter((n) => !n.isRead && !readNotifIds.includes(n.id)).length;
  }, [customerNotifications, readNotifIds]);

  const getCleanRequirements = (rawReq?: string) => {
    if (!rawReq) return "No custom instructions recorded yet.";
    const cleaned = rawReq
      .replace(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:[\s\S]*?\]/g, "")
      .replace(/\[ADMIN_PLAN_DELIVERABLE_FINAL:[\s\S]*?\]/g, "")
      .replace(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:[\s\S]*?\]/g, "")
      .trim();
    return cleaned || "No custom instructions recorded yet.";
  };

  // Reference plans portfolio
  const samplePlans = [
    {
      id: 1,
      title: "Ground Floor Plan (2D)",
      type: "Architectural Layout",
      status: projectStatus || "Rough Plan",
      image: "/portfolio/house-plan-01-hd.jpg",
      note: "Dimensioned room layout, kitchen & bathroom placement",
    },
    {
      id: 2,
      title: "First Floor & Terrace Layout",
      type: "Floor Plan",
      status: "Approved",
      image: "/portfolio/house-plan-02-hd.jpg",
      note: "Upper floor rooms, balcony orientation, stairwell",
    },
    {
      id: 3,
      title: "Vastu Shastra Zoning Map",
      type: "Vastu Consultation",
      status: "Vastu Verified",
      image: "/portfolio/house-plan-03-hd.jpg",
      note: "Directional alignment of entrance, kitchen, and pooja space",
    },
    {
      id: 4,
      title: "Front Elevation Concept",
      type: "Elevation Map",
      status: "Final Plan",
      image: "/portfolio/house-plan-04-hd.jpg",
      note: "Exterior architectural treatment and height markings",
    },
  ];

  /* =========================================================
     LOAD CUSTOMER DATA & PROJECT
  ========================================================= */
  const loadCustomer = async (authUser?: any) => {
    let localSession: any = null;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sarada_customer_session");
      if (stored) {
        try {
          localSession = JSON.parse(stored);
        } catch (_) {}
      }
    }

    // 1. Get authenticated session and user from Supabase
    let user = authUser;
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user;
    }
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    }

    let currentUserId = "";
    let currentEmail = "";
    let metadata: any = {};

    if (user) {
      currentUserId = user.id;
      currentEmail = user.email || "";
      metadata = {
        ...(user.user_metadata || {}),
        ...(localSession || {}),
      };
    } else if (localSession && (localSession.id || localSession.mobile)) {
      currentUserId = localSession.id || `mobile_${localSession.mobile}`;
      currentEmail = localSession.email || "";
      metadata = localSession;
    } else {
      // Auth still initializing; don't prematurely redirect
      return;
    }

    setUserId(currentUserId);
    setCustomerEmail(currentEmail);
    setIsAuthChecking(false);

    const fallbackName =
      metadata.full_name ||
      metadata.name ||
      metadata.fullName ||
      "Customer";

    // 2. Fetch Complete Profile from customer_profiles table in Supabase
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select(
        "id, full_name, mobile, village_city, district, avatar_url, landmark, pin_code, state, property_type, whatsapp_number, preferred_language"
      )
      .eq("id", currentUserId)
      .maybeSingle();

    const nameVal = profile?.full_name || fallbackName;
    const mobileVal = profile?.mobile || metadata.mobile || "";
    const villageVal = profile?.village_city || metadata.village_city || "";
    const districtVal = profile?.district || metadata.district || "";
    const avatarVal = profile?.avatar_url || metadata.avatar_url || "";
    const landmarkVal = profile?.landmark || metadata.landmark || "";
    const pincodeVal = profile?.pin_code || metadata.pincode || "";
    const stateVal = profile?.state || metadata.state || "Bihar";
    const propertyTypeVal = profile?.property_type || metadata.property_type || "Residential (1-3 Floor)";
    const whatsappVal = profile?.whatsapp_number || metadata.whatsapp_number || "";
    const languageVal = profile?.preferred_language || metadata.preferred_language || "Hindi";

    // Auto-create/sync profile in Supabase if not present
    if (!profile && currentUserId) {
      try {
        await supabase.from("customer_profiles").upsert(
          {
            id: currentUserId,
            full_name: nameVal,
            mobile: mobileVal,
            village_city: villageVal,
            district: districtVal,
            avatar_url: avatarVal || null,
            landmark: landmarkVal || null,
            pin_code: pincodeVal || null,
            state: stateVal,
            property_type: propertyTypeVal,
            whatsapp_number: whatsappVal || null,
            preferred_language: languageVal,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profErr) {
        console.warn("customer_profiles auto-sync notice:", profErr);
      }
    }

    setCustomerName(nameVal);
    setCustomerMobile(mobileVal);
    setCustomerVillage(villageVal);
    setCustomerDistrict(districtVal);
    setCustomerAvatar(avatarVal);
    setCustomerLandmark(landmarkVal);
    setCustomerPinCode(pincodeVal);
    setCustomerState(stateVal);
    setCustomerPropertyType(propertyTypeVal);
    setCustomerWhatsapp(whatsappVal);
    setCustomerLanguage(languageVal);

    setEditName(nameVal);
    setEditMobile(mobileVal);
    setEditVillage(villageVal);
    setEditDistrict(districtVal);
    setEditAvatar(avatarVal);
    setEditLandmark(landmarkVal);
    setEditPinCode(pincodeVal);
    setEditState(stateVal);
    setEditPropertyType(propertyTypeVal);
    setEditWhatsapp(whatsappVal);
    setEditLanguage(languageVal);

    // 3. Fetch Customer Requests for this Authenticated User
    let reqQuery = supabase
      .from("customer_requests")
      .select(
        "id, customer_user_id, full_name, mobile, village_city, district, plot_length, plot_width, measurement_unit, floors, requirements, vastu_consultation, status, attachment_url, created_at"
      );

    if (currentUserId && mobileVal) {
      reqQuery = reqQuery.or(`customer_user_id.eq.${currentUserId},mobile.eq.${mobileVal}`);
    } else if (currentUserId) {
      reqQuery = reqQuery.eq("customer_user_id", currentUserId);
    } else if (mobileVal) {
      reqQuery = reqQuery.eq("mobile", mobileVal);
    }

    const { data: requests, error: reqError } = await reqQuery.order("created_at", { ascending: false });

    if (reqError) {
      console.error("Customer requests fetch error:", reqError);
    } else if (requests && requests.length > 0) {
      const topReq = requests[0];
      setAllRequests(requests);
      setCustomerRequest(topReq);
      setRequestSubmitted(true);
      setRequestStatus(topReq.status || "New Request");

      if (topReq.attachment_url) {
        setUploadedSketch(topReq.attachment_url);
        setUploadedSketchName("Customer Uploaded Rough Map");
      }

      // 4. Fetch Deliverables strictly from public.deliverables table in Supabase
      let loadedRough: any = null;
      let loadedFinal: any = null;
      let loadedMistri: any = null;

      const { data: dbDeliverables } = await supabase
        .from("deliverables")
        .select("id, request_id, customer_id, type, title, file_url, notes, created_at")
        .or(`customer_id.eq.${currentUserId},request_id.eq.${topReq.id}`)
        .order("created_at", { ascending: false });

      if (dbDeliverables && dbDeliverables.length > 0) {
        dbDeliverables.forEach((d) => {
          const item = {
            id: d.id,
            title: d.title,
            image: d.file_url,
            note: d.notes,
            date: d.created_at
              ? new Date(d.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
          };
          if (d.type === "rough_draft" && !loadedRough) loadedRough = item;
          if (d.type === "final_blueprint" && !loadedFinal) loadedFinal = item;
          if (d.type === "mistri_sheet" && !loadedMistri) loadedMistri = item;
        });
      }

      // Secondary fallback to embedded requirements markers if any exist from earlier versions
      if (!loadedRough && topReq.requirements) {
        const roughMatch = topReq.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:([\s\S]*?)\]/);
        if (roughMatch) {
          try { loadedRough = JSON.parse(roughMatch[1]); } catch (_) {}
        }
      }
      if (!loadedFinal && topReq.requirements) {
        const finalMatch = topReq.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_FINAL:([\s\S]*?)\]/);
        if (finalMatch) {
          try { loadedFinal = JSON.parse(finalMatch[1]); } catch (_) {}
        }
      }
      if (!loadedMistri && topReq.requirements) {
        const mistriMatch = topReq.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:([\s\S]*?)\]/);
        if (mistriMatch) {
          try { loadedMistri = JSON.parse(mistriMatch[1]); } catch (_) {}
        }
      }

      setAdminRoughDraft(loadedRough || null);
      setAdminFinalBlueprint(loadedFinal || null);
      setAdminMistriSheet(loadedMistri || null);

      // Fetch site visit for this top request
      await fetchSiteVisit(topReq.id);
    } else {
      // Fresh customer with no submitted requests yet
      setAllRequests([]);
      setCustomerRequest(null);
      setRequestSubmitted(false);
      setRequestStatus("New Request");
      setAdminRoughDraft(null);
      setAdminFinalBlueprint(null);
      setAdminMistriSheet(null);
      setUploadedSketch(null);
      setUploadedSketchName("");
      setSiteVisit(null);
      setHasProject(false);
      setProjectData(null);
    }

    // 5. Fetch Customer Project from Supabase
    const { data: project } = await supabase
      .from("projects")
      .select(
        "id, project_name, project_status, plot_length, plot_width, measurement_unit, floors, created_at"
      )
      .eq("customer_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (project) {
      setHasProject(true);
      setProjectName(project.project_name || "House Planning");
      setProjectStatus(project.project_status || "Planning");
      setProjectData(project);
    }

    // 6. Fetch Customer Payments from Supabase
    const { data: custPayments } = await supabase
      .from("payments")
      .select("id, request_id, amount, payment_type, payment_status, payment_mode, reference_number, created_at")
      .or(`customer_user_id.eq.${currentUserId},mobile.eq.${mobileVal}`)
      .order("created_at", { ascending: false });

    if (custPayments) {
      setCustomerPaymentsList(custPayments);
    }

    // 7. Fetch Real Notifications from Supabase
    let notifQuery = supabase
      .from("notifications")
      .select("id, user_id, request_id, type, title, message, action_tab, badge, badge_color, is_read, created_at");

    if (currentUserId) {
      notifQuery = notifQuery.eq("user_id", currentUserId);
    }
    const { data: dbNotifs } = await notifQuery.order("created_at", { ascending: false });

    if (dbNotifs) {
      setServerNotifications(dbNotifs);
      const dbReadIds = dbNotifs.filter((n) => n.is_read).map((n) => String(n.id));
      if (dbReadIds.length > 0) {
        setReadNotifIds((prev) => Array.from(new Set([...prev, ...dbReadIds])));
      }
    }
  };

  /* =========================================================
     LOAD SITE VISIT
  ========================================================= */
  const fetchSiteVisit = async (overrideRequestId?: any) => {
    setSiteVisitLoading(true);

    let targetRequestId = overrideRequestId || customerRequest?.id;

    if (!targetRequestId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let checkUserId = user?.id || userId;
      let checkMobile = customerMobile;

      if (!checkUserId && typeof window !== "undefined") {
        const stored = localStorage.getItem("sarada_customer_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            checkUserId = parsed.id || "";
            checkMobile = parsed.mobile || checkMobile;
          } catch (_) {}
        }
      }

      let q = supabase.from("customer_requests").select("id");
      if (checkMobile && checkUserId) {
        q = q.or(`customer_user_id.eq.${checkUserId},mobile.eq.${checkMobile}`);
      } else if (checkUserId) {
        q = q.eq("customer_user_id", checkUserId);
      } else if (checkMobile) {
        q = q.eq("mobile", checkMobile);
      }

      const { data: request } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (request) {
        targetRequestId = request.id;
      }
    }

    if (!targetRequestId) {
      setSiteVisit(null);
      setSiteVisitLoading(false);
      return;
    }

    const { data: visit, error: visitError } = await supabase
      .from("site_visits")
      .select(
        "id, request_id, visit_date, visit_time, status, notes, customer_response, customer_response_notes, customer_preferred_date, customer_preferred_time, customer_responded_at"
      )
      .eq("request_id", targetRequestId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (visitError) {
      console.error("Site visit fetch error:", visitError);
      setSiteVisit(null);
    } else {
      setSiteVisit(visit || null);
    }

    setSiteVisitLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        await loadCustomer(session.user);
        await fetchSiteVisit();
        setIsAuthChecking(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        await loadCustomer(user);
        await fetchSiteVisit();
        setIsAuthChecking(false);
        return;
      }

      // Check localStorage mobile session fallback if exists
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sarada_customer_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.id || parsed.mobile) {
              await loadCustomer();
              await fetchSiteVisit();
              setIsAuthChecking(false);
              return;
            }
          } catch (_) {}
        }
      }

      // Grace period before redirecting to login to avoid false logouts on page refresh
      const graceTimer = setTimeout(() => {
        if (isMounted) {
          setIsAuthChecking(false);
          if (typeof window !== "undefined") {
            window.location.href = "/customer/login";
          }
        }
      }, 1200);

      return () => clearTimeout(graceTimer);
    };

    initAuth();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        setIsAuthChecking(false);
        await loadCustomer(session.user);
        await fetchSiteVisit();
      } else if (event === "SIGNED_OUT" && isMounted) {
        setIsAuthChecking(false);
        if (typeof window !== "undefined") {
          window.location.href = "/customer/login";
        }
      }
    });

    return () => {
      isMounted = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Supabase Realtime Listener for Live Customer Sync
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`customer-live-feed-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_requests" },
        () => loadCustomer()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_visits" },
        () => {
          loadCustomer();
          fetchSiteVisit();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliverables" },
        () => loadCustomer()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => loadCustomer()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => loadCustomer()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* =========================================================
     SITE VISIT ACTIONS (ACCEPT & RESCHEDULE)
  ========================================================= */
  const acceptSiteVisit = async () => {
    if (!siteVisit) return;

    setIsRespondingToVisit(true);

    const { error } = await supabase
      .from("site_visits")
      .update({
        customer_response: "Accepted",
        customer_response_notes: null,
        customer_responded_at: new Date().toISOString(),
        status: "Confirmed",
      })
      .eq("id", siteVisit.id);

    if (error) {
      console.error("Accept site visit error:", error);
      alert(`Failed to confirm the site visit: ${error.message}`);
      setIsRespondingToVisit(false);
      return;
    }

    setSiteVisit({
      ...siteVisit,
      customer_response: "Accepted",
      customer_response_notes: null,
      customer_responded_at: new Date().toISOString(),
      status: "Confirmed",
    });

    setIsRespondingToVisit(false);
    alert("Site visit confirmed successfully! Our team will see you on the scheduled date.");
  };

  const submitRescheduleRequest = async () => {
    if (!siteVisit) return;

    if (!preferredVisitDate || !preferredVisitTime) {
      alert("Please select your preferred date and time.");
      return;
    }

    setIsRespondingToVisit(true);

    const { data, error } = await supabase
      .from("site_visits")
      .update({
        customer_response: "Reschedule Requested",
        customer_preferred_date: preferredVisitDate,
        customer_preferred_time: preferredVisitTime,
        customer_response_notes: rescheduleNote.trim() || null,
        customer_responded_at: new Date().toISOString(),
        status: "Reschedule Requested",
      })
      .eq("id", siteVisit.id)
      .select()
      .single();

    if (error) {
      console.error("Reschedule request error:", error);
      alert(`Failed to submit reschedule request: ${error.message}`);
      setIsRespondingToVisit(false);
      return;
    }

    // Persist to reschedule_requests table in Supabase
    try {
      await supabase.from("reschedule_requests").insert({
        visit_id: siteVisit.id,
        request_id: siteVisit.request_id || customerRequest?.id,
        customer_id: userId,
        requested_date: preferredVisitDate,
        requested_time: preferredVisitTime,
        reason: rescheduleNote.trim() || null,
        status: "Pending",
      });
    } catch (reschedErr) {
      console.warn("reschedule_requests insert warning:", reschedErr);
    }

    setSiteVisit(data);

    // Clean old confirmation entry in customer_requests.requirements in DB if any
    if (customerRequest?.id && customerRequest.requirements) {
      try {
        const cleaned = customerRequest.requirements
          .replace(/\[ADMIN_NOTIFICATION_ENTRY:\{[\s\S]*?Site Visit Confirmed[\s\S]*?\}\]/g, "")
          .trim();
        await supabase
          .from("customer_requests")
          .update({ requirements: cleaned })
          .eq("id", customerRequest.id);
        setCustomerRequest((prev: any) => (prev ? { ...prev, requirements: cleaned } : prev));
      } catch (_) {}
    }

    setShowReschedule(false);
    setPreferredVisitDate("");
    setPreferredVisitTime("");
    setRescheduleNote("");
    setIsRespondingToVisit(false);

    alert("Your preferred site visit time has been sent to the admin. Status is now Reschedule Pending.");
  };

  /* =========================================================
     AVATAR & PHOTO UPLOAD
  ========================================================= */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose a photo under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      setEditAvatar(dataUrl);
      setCustomerAvatar(dataUrl);

      if (userId) {
        await supabase
          .from("customer_profiles")
          .update({ avatar_url: dataUrl, updated_at: new Date().toISOString() })
          .eq("id", userId);
        await supabase.auth.updateUser({
          data: { avatar_url: dataUrl },
        });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const removeAvatar = async () => {
    setEditAvatar("");
    setCustomerAvatar("");
    if (userId) {
      await supabase
        .from("customer_profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", userId);
      await supabase.auth.updateUser({
        data: { avatar_url: "" },
      });
    }
  };

  const handleDashboardSketchUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUploadedSketch(dataUrl);
        setUploadedSketchName(file.name);
        if (customerRequest?.id) {
          await supabase
            .from("customer_requests")
            .update({
              attachment_url: dataUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", customerRequest.id);
        }
        alert(
          "Rough sketch attached successfully! Our planning team will review it."
        );
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleFinalizeRoughPlan = async () => {
    if (!customerRequest?.id) return;
    const confirmChoice = window.confirm(
      "Kya aap is 2D rough plan ko Finalize karna chahte hain? Iske baad architect Final HD Blueprint banana shuru karenge."
    );
    if (!confirmChoice) return;

    setIsFinalizingPlan(true);

    try {
      // 1. Update customer_requests status in Supabase
      await supabase
        .from("customer_requests")
        .update({
          status: "Approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerRequest.id);

      // 2. Update projects table in Supabase
      if (userId) {
        await supabase
          .from("projects")
          .update({
            project_status: "Approved",
            plan_status: "Approved",
            updated_at: new Date().toISOString(),
          })
          .eq("customer_id", userId);

        await supabase.from("notifications").insert({
          user_id: userId,
          request_id: customerRequest.id,
          type: "plan",
          title: "✅ 2D Floor Plan Finalized!",
          message: `Aapne 2D rough layout finalize kar diya hai. Architect team ab aapke liye HD Working Blueprint aur Thekedar Execution Sheet prepare kar rahi hai.`,
          action_tab: "plans",
          badge: "Plan Finalized",
          badge_color: "bg-[#eaf4eb] text-[#24632c]",
          is_read: false,
        });
      }

      setCustomerRequest((prev: any) => ({ ...prev, status: "Approved" }));
      setRequestStatus("Approved");
      setProjectStatus("Approved");
      alert("Badhai ho! Aapka rough naksha Finalize ho chuka hai. Architect ab Final HD Blueprint aur Mistri Sheet prepare karenge.");
    } catch (err: any) {
      console.error("Finalize error:", err);
      alert("Error finalizing plan: " + (err.message || "Please try again"));
    } finally {
      setIsFinalizingPlan(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisionNotes.trim()) {
      alert(
        "Please describe the modifications you would like in your floor plan."
      );
      return;
    }

    setIsSubmittingRevision(true);

    if (customerRequest?.id) {
      const updatedReqs = `${customerRequest.requirements || ""}\n\n[Revision Request (${new Date().toLocaleDateString(
        "en-IN"
      )})]: ${revisionNotes.trim()}`;
      await supabase
        .from("customer_requests")
        .update({
          requirements: updatedReqs,
          status: "Revision",
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerRequest.id);

      if (userId) {
        await supabase
          .from("projects")
          .update({
            project_status: "Revision",
            plan_status: "Revision Requested",
            updated_at: new Date().toISOString(),
          })
          .eq("customer_id", userId);

        await supabase.from("notifications").insert({
          user_id: userId,
          request_id: customerRequest.id,
          type: "plan",
          title: "⏳ Revision Request Submitted",
          message: `Aapne floor plan me badlav ki maang ki hai: "${revisionNotes.trim()}". Architect team jald hi modified layout update karegi.`,
          action_tab: "plans",
          badge: "Revision Pending",
          badge_color: "bg-[#fdf0d5] text-[#8f6412]",
          is_read: false,
        });
      }

      setCustomerRequest({
        ...customerRequest,
        requirements: updatedReqs,
        status: "Revision",
      });
      setRequestStatus("Revision");
      setProjectStatus("Revision");
    }

    setIsSubmittingRevision(false);
    setShowInlineRevisionBox(false);
    setRevisionSuccessBanner(true);
    setRevisionNotes("");
    setTimeout(() => setRevisionSuccessBanner(false), 7000);
    alert("Revision request submitted successfully! Our architectural team will update the floor plan.");
  };

  /* =========================================================
     SAVE PROFILE ACTION
  ========================================================= */
  const saveProfile = async () => {
    if (!userId) return;
    if (!editName.trim() || !editMobile.trim()) {
      alert("Please enter both your name and mobile number.");
      return;
    }

    setIsSavingProfile(true);

    // 1. Update Supabase Auth user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          mobile: editMobile.trim(),
          village_city: editVillage.trim(),
          district: editDistrict.trim(),
          avatar_url: editAvatar,
          landmark: editLandmark.trim(),
          pincode: editPinCode.trim(),
          state: editState.trim(),
          property_type: editPropertyType,
          whatsapp_number: editWhatsapp.trim(),
          preferred_language: editLanguage,
        },
      });
    } catch (_) {}

    // 2. Upsert complete profile columns in customer_profiles table in Supabase
    const profileData = {
      id: userId,
      full_name: editName.trim(),
      mobile: editMobile.trim(),
      village_city: editVillage.trim(),
      district: editDistrict.trim(),
      avatar_url: editAvatar || null,
      landmark: editLandmark.trim() || null,
      pin_code: editPinCode.trim() || null,
      state: editState.trim() || "Bihar",
      property_type: editPropertyType || "Residential Plot",
      whatsapp_number: editWhatsapp.trim() || null,
      preferred_language: editLanguage || "Hindi",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("customer_profiles")
      .upsert(profileData);

    if (error) {
      alert(`Failed to save profile: ${error.message}`);
      setIsSavingProfile(false);
      return;
    }

    setCustomerName(editName.trim());
    setCustomerMobile(editMobile.trim());
    setCustomerVillage(editVillage.trim());
    setCustomerDistrict(editDistrict.trim());
    setCustomerAvatar(editAvatar);
    setCustomerLandmark(editLandmark.trim());
    setCustomerPinCode(editPinCode.trim());
    setCustomerState(editState.trim());
    setCustomerPropertyType(editPropertyType);
    setCustomerWhatsapp(editWhatsapp.trim());
    setCustomerLanguage(editLanguage);

    setShowEditProfile(false);
    setIsSavingProfile(false);
    alert("Profile saved successfully to Supabase!");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("sarada_customer_session");
      localStorage.removeItem("sarada_customer_logged_in");
      localStorage.removeItem("sarada_admin_last_uploaded_rough_draft");
      localStorage.removeItem("sarada_admin_last_uploaded_final_blueprint");
      localStorage.removeItem("sarada_admin_last_uploaded_mistri_sheet");
      localStorage.removeItem("sarada_last_uploaded_sketch");
      localStorage.removeItem("sarada_last_uploaded_sketch_name");
    }
    window.location.href = "/customer/login";
  };

  // Determine stage flags
  const activeStatus = projectStatus || requestStatus || "New Request";
  const stageOrder = [
    "New Request",
    "Contacted",
    "Site Visit",
    "Planning",
    "Rough Plan",
    "Customer Review",
    "Revision",
    "Approved",
    "Final Plan",
    "Delivered",
  ];
  const currentStageIndex = Math.max(0, stageOrder.indexOf(activeStatus));

  // Determine real deliverables count dynamically for current customer
  const realDeliverablesCount =
    (adminRoughDraft ? 1 : 0) +
    (adminFinalBlueprint ? 1 : 0) +
    (adminMistriSheet ? 1 : 0) +
    (uploadedSketch ? 1 : 0);

  if (isAuthChecking && !userId) {
    return (
      <main className="min-h-screen bg-[#f8f5ee] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-[#063b2c] flex items-center justify-center text-[#f4cf72] shadow-xl animate-pulse mb-4">
          <Home size={30} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#17221b]">
          Sarada Homeplan
        </h2>
        <p className="mt-1.5 text-xs font-semibold tracking-wide text-black/55">
          Loading your verified client dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f4f0e7] text-[#17221b]">
      {/* ========================================================= */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col overflow-hidden bg-[#063b2c] text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="shrink-0 px-6 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-[#f4cf72] text-[#063b2c]">
                <Home size={28} strokeWidth={2.2} />
              </div>

              <div>
                <div className="font-serif text-[25px] font-bold leading-none tracking-wide">
                  SARADA
                </div>
                <div className="mt-1 text-[9px] font-bold tracking-[0.28em] text-[#f4cf72]">
                  HOMEPLAN
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-7 shrink-0 px-4">
          <div className="mb-2 px-3 text-[11px] font-bold tracking-[0.18em] text-white/50">
            CUSTOMER PORTAL
          </div>

          <div className="space-y-1">
            <NavItem
              icon={Home}
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={Bell}
              label="Notifications"
              active={activeTab === "notifications"}
              badge={unreadCount > 0 ? String(unreadCount) : undefined}
              onClick={() => {
                setActiveTab("notifications");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={FileText}
              label="My Project"
              active={activeTab === "project"}
              badge={hasProject ? "Active" : undefined}
              onClick={() => {
                setActiveTab("project");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={MapPin}
              label="Site Visit"
              active={activeTab === "visit"}
              badge={
                siteVisit?.status === "Proposed"
                  ? "Action"
                  : siteVisit?.status === "Reschedule Requested" ||
                    siteVisit?.customer_response === "Reschedule Requested"
                  ? "Pending"
                  : siteVisit?.status === "Confirmed"
                  ? "Confirmed"
                  : undefined
              }
              onClick={() => {
                setActiveTab("visit");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={FolderOpen}
              label="My Plans"
              active={activeTab === "plans"}
              badge={realDeliverablesCount > 0 ? String(realDeliverablesCount) : undefined}
              onClick={() => {
                setActiveTab("plans");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={CreditCard}
              label="Payments"
              active={activeTab === "payments"}
              onClick={() => {
                setActiveTab("payments");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={ClipboardList}
              label="Documents"
              active={activeTab === "documents"}
              onClick={() => {
                setActiveTab("documents");
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={User}
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => {
                setActiveTab("profile");
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>

        {/* FLEXIBLE SPACE */}
        <div className="min-h-0 flex-1" />

        {/* BOTTOM PROMO CARD & LOGOUT */}
        <div className="shrink-0 px-4 pb-4">
          <div className="relative h-[155px] overflow-hidden rounded-[18px] border border-white/20">
            <img
              src="/home.png"
              alt="Modern house"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#063b2c] via-[#063b2c]/65 to-transparent" />
            <div className="absolute inset-x-4 bottom-3">
              <p className="font-serif text-[18px] font-bold leading-[1.05] text-white">
                Turn Ideas into
                <br />
                Real Plans
              </p>
              <div className="mt-1.5 h-[2.5px] w-8 rounded-full bg-[#f4cf72]" />
              <p className="mt-1.5 text-[10px] text-white/80">
                Honest Vastu & House Maps
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex h-[42px] w-full items-center gap-3 rounded-xl px-4 text-[13px] font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#f4cf72]"
          >
            <LogOut size={19} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="min-h-screen w-full lg:pl-[260px]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#e7e1d6] bg-[#f8f5ee]/90 px-5 backdrop-blur-md">
          {/* Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#ded8cd] bg-white p-2 text-[#063b2c] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9b7732]">
                Customer Dashboard
              </p>
              <h2 className="font-serif text-lg font-bold capitalize text-[#17221b]">
                {activeTab === "dashboard"
                  ? "Overview"
                  : activeTab === "project"
                  ? "My Project & Requirements"
                  : activeTab === "visit"
                  ? "Site Visit Scheduling"
                  : activeTab === "plans"
                  ? "Architectural Plans & Maps"
                  : activeTab === "payments"
                  ? "Payment & Advance Status"
                  : activeTab === "documents"
                  ? "Submitted Documents"
                  : activeTab === "notifications"
                  ? "Notifications & Alerts"
                  : "Profile & Settings"}
              </h2>
            </div>
          </div>

          {/* RIGHT PROFILE & ACTIONS */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`relative flex items-center justify-center rounded-xl border p-2 transition ${
                activeTab === "notifications"
                  ? "border-[#063b2c] bg-[#eef6f1] text-[#063b2c]"
                  : "border-[#ded8cd] bg-white text-[#063b2c] hover:bg-[#f6f2ea]"
              }`}
              title="Notifications & Alerts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2413a] text-[10px] font-bold text-white px-1 shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <Link
              href="/customer/request"
              className="hidden items-center gap-2 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#09503c] sm:flex"
            >
              <FileText size={15} />
              <span>New Request</span>
            </Link>

            <div className="h-[28px] w-px bg-[#ddd7cc]" />

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2.5 rounded-xl border border-[#ded8cd] bg-white px-3 py-1.5 transition hover:bg-[#f6f2ea]"
            >
              {customerAvatar ? (
                <img
                  src={customerAvatar}
                  alt={customerName}
                  className="h-8 w-8 rounded-full object-cover border border-[#bda76d]"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcb65a] font-serif text-[15px] font-bold text-[#17221b]">
                  {customerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="max-w-[120px] truncate text-xs font-bold text-[#17221b]">
                  {customerName}
                </p>
                <p className="text-[10px] text-black/45">Client</p>
              </div>
            </button>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-6">
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              {/* HERO BANNER */}
              <section className="relative min-h-[250px] overflow-hidden rounded-[24px] border border-[#e2dcd1] bg-[#f9f5ec] shadow-sm">
                <img
                  src="/home.png"
                  alt="Modern house"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f9f5ec] via-[#f9f5ec]/95 to-[#f9f5ec]/20" />

                <div className="relative z-10 flex h-full flex-col justify-center p-6 sm:p-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b7732]">
                    SARADA HOMEPLAN • CLIENT PORTAL
                  </p>

                  <h1 className="mt-2 font-serif text-3xl font-bold text-[#10261d] sm:text-4xl">
                    Welcome back,{" "}
                    <span className="text-[#c38a22]">{customerName}</span> 👋
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-black/65 sm:text-base">
                    Track your plot measurements, site visit schedules, architectural
                    drawings, and Vastu consultation in one place.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("project")}
                      className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#0a4d38]"
                    >
                      <CalendarDays size={16} />
                      <span>View My Project</span>
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("visit");
                        setTimeout(() => {
                          const el = document.getElementById("reschedule-slot-details");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 150);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-[#9ca59e] bg-white/90 px-5 py-3 text-xs font-bold text-[#173b2e] transition hover:bg-white"
                    >
                      <MapPin size={16} />
                      <span>
                        {siteVisit?.status === "Reschedule Requested" ||
                        siteVisit?.customer_response === "Reschedule Requested"
                          ? "View Rescheduled Request Time"
                          : "Check Site Visit"}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 4 STATUS CARDS */}
              <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatusCard
                  icon={Home}
                  title="My Project"
                  value={hasProject ? projectName : requestSubmitted ? "Request Received" : "No Project"}
                  description={hasProject ? `Status: ${projectStatus}` : "Plan details active"}
                  iconBg="bg-[#e4ede7]"
                  iconColor="text-[#0c7a62]"
                  onClick={() => setActiveTab("project")}
                />

                <StatusCard
                  icon={MapPin}
                  title="Site Visit"
                  value={
                    siteVisit
                      ? siteVisit.status === "Confirmed"
                        ? "Confirmed"
                        : siteVisit.status === "Reschedule Requested" ||
                          siteVisit.customer_response === "Reschedule Requested"
                        ? "Reschedule Pending"
                        : siteVisit.status === "Proposed"
                        ? "Action Required"
                        : siteVisit.status
                      : "Not Scheduled"
                  }
                  description={
                    siteVisit
                      ? siteVisit.status === "Reschedule Requested" ||
                        siteVisit.customer_response === "Reschedule Requested"
                        ? `Requested: ${siteVisit.customer_preferred_date || "New Slot"}${siteVisit.customer_preferred_time ? ` · ${siteVisit.customer_preferred_time}` : ""}`
                        : `${siteVisit.visit_date || "Date TBA"}${siteVisit.visit_time ? ` · ${siteVisit.visit_time}` : ""}`
                      : "Owner-controlled visit"
                  }
                  iconBg={
                    siteVisit?.status === "Confirmed"
                      ? "bg-[#eaf4eb]"
                      : siteVisit?.status === "Reschedule Requested" ||
                        siteVisit?.customer_response === "Reschedule Requested"
                      ? "bg-[#fdf0d5]"
                      : "bg-[#fff0cf]"
                  }
                  iconColor={
                    siteVisit?.status === "Confirmed"
                      ? "text-[#24632c]"
                      : siteVisit?.status === "Reschedule Requested" ||
                        siteVisit?.customer_response === "Reschedule Requested"
                      ? "text-[#8f6412]"
                      : "text-[#d58a00]"
                  }
                  onClick={() => setActiveTab("visit")}
                />

                <StatusCard
                  icon={FileText}
                  title="Plan Status"
                  value={hasProject ? projectStatus || "Planning" : "Under Review"}
                  description="HD drawings available"
                  iconBg="bg-[#e1ebff]"
                  iconColor="text-[#3d74d8]"
                  onClick={() => setActiveTab("plans")}
                />

                <StatusCard
                  icon={CreditCard}
                  title="Payment Status"
                  value="Advance Tracked"
                  description="Offline & online payment"
                  iconBg="bg-[#ffe0da]"
                  iconColor="text-[#e15d4d]"
                  onClick={() => setActiveTab("payments")}
                />
              </section>

              {/* PLANNING JOURNEY + SITE VISIT PREVIEW */}
              <section className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
                {/* JOURNEY STEPPER */}
                <div className="rounded-[22px] border border-[#e3ddd2] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ec] text-[#0c7a62]">
                      <Leaf size={22} />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#17221b]">
                        Your Planning Journey
                      </h3>
                      <p className="text-xs text-black/55">
                        Transparent, step-by-step progress from rough sketch to finalized map
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-start">
                    <JourneyStep
                      icon={FileText}
                      title="Requirement"
                      status={requestSubmitted ? "Submitted" : "Pending"}
                      isCompleted={requestSubmitted}
                      isCurrent={!hasProject && requestSubmitted}
                    />

                    <div className="mt-[24px] h-0.5 flex-1 bg-[#e0ded8]" />

                    <JourneyStep
                      icon={MapPin}
                      title="Site Visit"
                      status={
                        siteVisit?.status === "Confirmed"
                          ? "Confirmed"
                          : siteVisit?.status === "Proposed"
                          ? "Proposed"
                          : siteVisit?.status === "Reschedule Requested"
                          ? "Reschedule"
                          : "Scheduled"
                      }
                      isCompleted={siteVisit?.status === "Confirmed"}
                      isCurrent={siteVisit?.status === "Proposed" || siteVisit?.status === "Reschedule Requested"}
                    />

                    <div className="mt-[24px] h-0.5 flex-1 bg-[#e0ded8]" />

                    <JourneyStep
                      icon={ClipboardList}
                      title="Planning"
                      status={currentStageIndex >= 3 ? "In Progress" : "Upcoming"}
                      isCompleted={currentStageIndex >= 4}
                      isCurrent={currentStageIndex === 3}
                    />

                    <div className="mt-[24px] h-0.5 flex-1 bg-[#e0ded8]" />

                    <JourneyStep
                      icon={FileText}
                      title="Rough Plan"
                      status={currentStageIndex >= 4 ? "Review" : "Upcoming"}
                      isCompleted={currentStageIndex >= 7}
                      isCurrent={currentStageIndex === 4 || currentStageIndex === 5}
                    />

                    <div className="mt-[24px] h-0.5 flex-1 bg-[#e0ded8]" />

                    <JourneyStep
                      icon={Home}
                      title="Final Plan"
                      status={currentStageIndex >= 8 ? "Delivered" : "Upcoming"}
                      isCompleted={currentStageIndex >= 9}
                      isCurrent={currentStageIndex === 8}
                    />
                  </div>
                </div>

                {/* UPCOMING SITE VISIT CARD */}
                <div className="flex flex-col justify-between rounded-[22px] border border-[#e3ddd2] bg-white p-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-3">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays size={20} className="text-[#0c7a62]" />
                        <h3 className="font-serif text-lg font-bold">Upcoming Site Visit</h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          siteVisit?.status === "Confirmed"
                            ? "bg-[#eaf4eb] text-[#24632c]"
                            : siteVisit?.status === "Reschedule Requested" ||
                              siteVisit?.customer_response === "Reschedule Requested"
                            ? "bg-[#fdf0d5] text-[#8f6412]"
                            : siteVisit
                            ? "bg-[#fff3d6] text-[#8a641d]"
                            : "bg-black/5 text-black/50"
                        }`}
                      >
                        {siteVisit
                          ? siteVisit.status === "Confirmed"
                            ? "Confirmed"
                            : siteVisit.status === "Reschedule Requested" ||
                              siteVisit.customer_response === "Reschedule Requested"
                            ? "Reschedule Pending"
                            : "Proposed"
                          : "None"}
                      </span>
                    </div>

                    <div className="mt-4">
                      {siteVisitLoading ? (
                        <p className="text-xs text-black/50">Loading visit details...</p>
                      ) : siteVisit ? (
                        <div>
                          {siteVisit.status === "Reschedule Requested" ||
                          siteVisit.customer_response === "Reschedule Requested" ? (
                            <div className="rounded-xl border border-[#f0e2ba] bg-[#fffcf3] p-3.5 text-xs">
                              <p className="font-bold text-[#8a641d]">Reschedule Pending Admin Approval</p>
                              <p className="mt-1 text-black/70">
                                You requested:{" "}
                                <span className="font-semibold text-[#17221b]">
                                  {siteVisit.customer_preferred_date || "—"} at{" "}
                                  {siteVisit.customer_preferred_time || "—"}
                                </span>
                              </p>
                              {siteVisit.customer_response_notes && (
                                <p className="mt-1.5 italic text-black/60">
                                  &ldquo;{siteVisit.customer_response_notes}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-xl bg-[#f8f6f0] p-3.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="block text-[10px] uppercase font-bold text-black/40">
                                    Date
                                  </span>
                                  <span className="font-bold text-[#17221b]">
                                    {siteVisit.visit_date}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-bold text-black/40">
                                    Time
                                  </span>
                                  <span className="font-bold text-[#17221b]">
                                    {siteVisit.visit_time}
                                  </span>
                                </div>
                              </div>
                              {siteVisit.notes && (
                                <p className="mt-2 text-xs text-black/60">
                                  Note: {siteVisit.notes}
                                </p>
                              )}
                            </div>
                          )}

                          {siteVisit.status === "Proposed" &&
                            siteVisit.customer_response !== "Reschedule Requested" && (
                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={acceptSiteVisit}
                                  disabled={isRespondingToVisit}
                                  className="flex-1 rounded-xl bg-[#0c7a62] py-2 text-xs font-bold text-white transition hover:bg-[#096650]"
                                >
                                  {isRespondingToVisit ? "Saving..." : "Accept Visit"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowReschedule(true)}
                                  disabled={isRespondingToVisit}
                                  className="flex-1 rounded-xl border border-[#c3b69a] bg-white py-2 text-xs font-bold text-[#173b2e] transition hover:bg-[#f5f0e4]"
                                >
                                  Suggest New Time
                                </button>
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-[#faf8f4] p-4 text-center">
                          <p className="text-xs font-semibold text-black/70">
                            No site visit scheduled yet
                          </p>
                          <p className="mt-1 text-[11px] text-black/45">
                            Our consultant will contact you and propose a suitable time slot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("visit")}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-[#ded8cd] bg-white py-2 text-xs font-bold text-[#17221b] transition hover:bg-[#f6f2ea]"
                  >
                    <span>Manage Visit Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </section>

              {/* BOTTOM 3 CARDS: LATEST PLAN, PAYMENT SUMMARY, NEED HELP */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {/* LATEST PLAN CARD */}
                <div className="flex flex-col justify-between rounded-[22px] border border-[#e3ddd2] bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 border-b border-[#f0ebdf] pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1ebff] text-[#3d74d8]">
                        <FolderOpen size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold">Latest House Map</h4>
                        <p className="text-[11px] text-black/50">2D Layouts & Elevations</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      {uploadedSketch ? (
                        <div>
                          <div
                            onClick={() =>
                              setActivePlanPreview({
                                title: uploadedSketchName || "Aapka Hand-drawn Rough Sketch",
                                type: "Customer Idea Reference",
                                status: "Under Review by Architect",
                                image: uploadedSketch,
                              })
                            }
                            className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl border border-[#eee8dd] bg-[#fbf9f4]"
                          >
                            <img
                              src={uploadedSketch}
                              alt="Customer Rough Sketch"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute right-2 top-2">
                              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#063b2c] shadow">
                                Your Sketch
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17221b] shadow-lg flex items-center gap-1.5">
                                <Maximize2 size={13} /> Inspect Sketch
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-xs font-bold text-[#17221b]">
                            {uploadedSketchName || "Hand-drawn Rough Paper Sketch"}
                          </p>
                          <p className="text-[11px] text-black/50">
                            Under architectural review for 2D drafting & Vastu alignment
                          </p>
                        </div>
                      ) : (
                        <div
                          onClick={() => setActiveTab("plans")}
                          className="cursor-pointer rounded-xl border border-[#eee8dd] bg-[#faf8f3] p-4 transition hover:border-[#bda76d]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-[#fbf5e5] px-2 py-0.5 text-[10px] font-bold text-[#8a6312]">
                              {currentStageIndex >= 4 ? "Draft Ready" : "Draft In Progress"}
                            </span>
                            <span className="text-[11px] text-[#063b2c] font-bold">Phase 1</span>
                          </div>
                          <h5 className="mt-2 text-xs font-bold text-[#17221b]">
                            2D Floor Plan (Concept Layout Draft)
                          </h5>
                          <p className="mt-1 text-[11px] text-black/55 leading-4">
                            Expected delivery within 24-48 working hours from plot verification.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("plans")}
                    className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-[#ded8cd] bg-white py-2 text-xs font-bold text-[#17221b] transition hover:bg-[#f6f2ea]"
                  >
                    <span>Open My Deliverables</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* PAYMENT SUMMARY CARD */}
                <div className="flex flex-col justify-between rounded-[22px] border border-[#e3ddd2] bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 border-b border-[#f0ebdf] pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0cf] text-[#c88912]">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold">Payment Overview</h4>
                        <p className="text-[11px] text-black/50">Advance & milestones</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-[#efe9dd] bg-[#faf8f4] p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-black/60">Advance Payment</span>
                          <span className="rounded-full bg-[#eaf4eb] px-2 py-0.5 text-[10px] font-bold text-[#24632c]">
                            Verified
                          </span>
                        </div>
                        <p className="mt-1 font-serif text-xl font-bold text-[#17221b]">
                          Advance Verified
                        </p>
                        <p className="mt-1 text-[11px] text-black/50">
                          Work proceeds through your assigned milestones.
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8f6f0] p-3 text-xs text-black/65">
                        <span className="font-semibold text-[#17221b]">Payment Modes:</span> UPI, Bank Transfer, or Cash at site visit.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("payments")}
                    className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-[#ded8cd] bg-white py-2 text-xs font-bold text-[#17221b] transition hover:bg-[#f6f2ea]"
                  >
                    <span>Payment Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* HELP & SUPPORT */}
                <div className="flex flex-col justify-between rounded-[22px] border border-[#d9e5d8] bg-[#eef6e9] p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                  <div>
                    <div className="flex items-center gap-3 border-b border-[#d4e4d2] pb-3">
                      <Headphones size={22} className="text-[#063b2c]" />
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#063b2c]">
                          Need Assistance?
                        </h4>
                        <p className="text-[11px] text-black/55">Direct planner support</p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-black/70">
                      Have questions regarding your plot measurements, Vastu alignment, or visit schedule? Connect directly with our consultation team.
                    </p>

                    <div className="mt-4 space-y-2">
                      <a
                        href="https://wa.me/919999999999"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#0c7a62] py-2.5 text-xs font-bold text-white transition hover:bg-[#096650]"
                      >
                        <MessageCircle size={16} />
                        <span>Chat on WhatsApp</span>
                      </a>

                      <a
                        href="tel:+919999999999"
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#9ca59e] bg-white py-2.5 text-xs font-bold text-[#173b2e] transition hover:bg-[#f5f0e4]"
                      >
                        <Phone size={16} />
                        <span>Call Support</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/70 p-2.5 text-center text-[10px] text-black/50">
                    Sarada Homeplan • Local House Planning & Consultation
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MY PROJECT & SPECIFICATIONS */}
          {/* ========================================================= */}
          {activeTab === "project" && (
            <div className="space-y-4">
              {/* PROJECT BANNER */}
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-[#f4cf72]/30 px-3 py-1 text-[11px] font-bold text-[#8a6312]">
                      Active Consultation
                    </span>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#17221b] sm:text-3xl">
                      {hasProject ? projectName : customerRequest ? `${customerRequest.full_name}'s House Plan` : "House Planning Request"}
                    </h2>
                    <p className="mt-1 text-xs text-black/55">
                      Location: {customerVillage ? `${customerVillage}, ` : ""}{customerDistrict || "Local Area"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-[#bda76d] bg-[#fbf8f0] px-3.5 py-1.5 text-xs font-bold text-[#705d35]">
                      Stage: {activeStatus}
                    </span>
                    <Link
                      href="/customer/request"
                      className="rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0a4d38]"
                    >
                      Submit Add-on
                    </Link>
                  </div>
                </div>

                {/* 10-STAGE PROGRESS BAR */}
                <div className="mt-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black/45">
                    Project Stage Progression
                  </p>
                  <div className="mt-3 flex overflow-x-auto pb-2">
                    <div className="flex min-w-[760px] items-center gap-1">
                      {stageOrder.map((stage, idx) => {
                        const isDone = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        return (
                          <div key={stage} className="flex-1 text-center">
                            <div
                              className={`h-2.5 rounded-full ${
                                isDone
                                  ? "bg-[#0c7a62]"
                                  : isCurrent
                                  ? "bg-[#d5a842] shadow-[0_0_0_2px_rgba(213,168,66,0.2)]"
                                  : "bg-[#e5dfd5]"
                              }`}
                            />
                            <p
                              className={`mt-2 text-[10px] font-semibold ${
                                isCurrent
                                  ? "font-bold text-[#8a6312]"
                                  : isDone
                                  ? "text-[#0c7a62]"
                                  : "text-black/40"
                              }`}
                            >
                              {stage}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* PLOT & REQUIREMENTS CARD */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* PLOT MEASUREMENTS */}
                <div className="rounded-[22px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Plot & Building Details
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-[#faf8f4] p-3 border border-[#efe9de]">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Plot Length</span>
                      <span className="text-base font-bold text-[#17221b]">
                        {customerRequest?.plot_length || projectData?.plot_length || "—"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#faf8f4] p-3 border border-[#efe9de]">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Plot Width</span>
                      <span className="text-base font-bold text-[#17221b]">
                        {customerRequest?.plot_width || projectData?.plot_width || "—"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#faf8f4] p-3 border border-[#efe9de]">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Unit of Measurement</span>
                      <span className="text-sm font-semibold text-[#17221b]">
                        {customerRequest?.measurement_unit || projectData?.measurement_unit || "Feet (ft)"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#faf8f4] p-3 border border-[#efe9de]">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Floors</span>
                      <span className="text-sm font-semibold text-[#17221b]">
                        {customerRequest?.floors || projectData?.floors || "1 Floor"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#f4f7f2] p-3.5 border border-[#e1e9dc]">
                    <span className="text-[10px] font-bold uppercase text-[#063b2c]">Vastu Consultation</span>
                    <p className="mt-0.5 text-xs font-semibold text-[#17221b]">
                      {customerRequest?.vastu_consultation || "Requested / Vastu-Based Planning"}
                    </p>
                  </div>
                </div>

                {/* ROOMS & CUSTOM REQUIREMENTS */}
                <div className="rounded-[22px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Submitted Requirements
                  </h3>
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase text-black/40">Customer Notes & Room Needs</p>
                    <div className="mt-2 rounded-xl bg-[#faf8f4] p-4 border border-[#eee8dc] text-xs leading-6 text-black/75 whitespace-pre-wrap">
                      {getCleanRequirements(customerRequest?.requirements)}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#f0ebdf] pt-4">
                    <span className="text-xs text-black/50">Submitted on:</span>
                    <span className="text-xs font-semibold text-[#17221b]">
                      {customerRequest?.created_at
                        ? new Date(customerRequest.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>
                </div>
              </div>

              {/* UPLOADED ROUGH SKETCH & ARCHITECTURAL DELIVERABLES CARD */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#17221b]">
                      Attached Rough Sketch
                    </h3>
                    <span className="text-[10px] font-bold uppercase text-[#063b2c]">
                      {uploadedSketch ? "Attached" : "Optional"}
                    </span>
                  </div>

                  {uploadedSketch ? (
                    <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#ede6d8] bg-[#faf8f4] p-3.5">
                      <div
                        onClick={() =>
                          setActivePlanPreview({
                            title:
                              uploadedSketchName || "Aapka Hand-drawn Rough Sketch",
                            type: "Customer Idea Reference",
                            status: "Under Review by Architect",
                            image: uploadedSketch,
                          })
                        }
                        className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#ddd5c2] bg-white"
                      >
                        <img
                          src={uploadedSketch}
                          alt="Rough Sketch"
                          className="h-full w-full object-cover transition group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-[#17221b]">
                          {uploadedSketchName || "Hand Sketch"}
                        </p>
                        <p className="text-[11px] text-black/55 mt-0.5">
                          Referenced by architect for drawing 2D layout.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePlanPreview({
                              title:
                                uploadedSketchName ||
                                "Aapka Hand-drawn Rough Sketch",
                              type: "Customer Idea Reference",
                              status: "Under Review by Architect",
                              image: uploadedSketch,
                            })
                          }
                          className="mt-1 text-xs font-bold text-[#063b2c] hover:underline"
                        >
                          Inspect Full Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-[#dcd6ca] p-4 text-center">
                      <p className="text-xs text-black/50">
                        No rough sketch uploaded yet.
                      </p>
                      <label className="mt-2 inline-block cursor-pointer rounded-xl bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#09503c] transition">
                        <span>+ Upload Paper Sketch</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDashboardSketchUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between rounded-[22px] border border-[#e4dfd5] bg-gradient-to-br from-[#063b2c] to-[#0a4f3c] p-6 text-white shadow-sm">
                  <div>
                    <span className="rounded-full bg-[#f4cf72] px-3 py-1 text-[10px] font-bold text-[#063b2c]">
                      Architect Deliverables
                    </span>
                    <h3 className="mt-3 font-serif text-xl font-bold">
                      Your Architectural Maps & Vastu Report
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80 leading-5">
                      Inspect your 2D concept drafts, Vastu Shastra scorecard, and mistri-friendly execution sheets.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("plans")}
                      className="rounded-xl bg-[#f4cf72] px-4 py-2 text-xs font-bold text-[#063b2c] transition hover:bg-[#ebd28b]"
                    >
                      Open Architectural Plans & Maps →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SITE VISIT MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === "visit" && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f0ebdf] pb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b7732]">
                      Manual On-Site Inspection
                    </span>
                    <h2 className="mt-1 font-serif text-2xl font-bold text-[#17221b]">
                      Site Visit Coordination
                    </h2>
                    <p className="mt-1 text-xs text-black/55">
                      Our planner will visit your plot to confirm measurements, road alignment, and soil conditions.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3.5 py-1 text-xs font-bold ${
                      siteVisit?.status === "Confirmed"
                        ? "bg-[#eaf4eb] text-[#24632c]"
                        : siteVisit?.status === "Reschedule Requested" ||
                          siteVisit?.customer_response === "Reschedule Requested"
                        ? "bg-[#fdf0d5] text-[#8f6412]"
                        : siteVisit
                        ? "bg-[#fff3d6] text-[#8a641d]"
                        : "bg-black/5 text-black/50"
                    }`}
                  >
                    Status:{" "}
                    {siteVisit?.status === "Reschedule Requested" ||
                    siteVisit?.customer_response === "Reschedule Requested"
                      ? "Reschedule Pending (प्रतीक्षारत)"
                      : siteVisit?.status || "Not Scheduled"}
                  </span>
                </div>

                <div className="mt-6">
                  {siteVisitLoading ? (
                    <p className="text-xs text-black/50">Checking site visit schedule...</p>
                  ) : siteVisit ? (
                    <div className="space-y-4">
                      {/* Active Visit Card */}
                      <div className="rounded-2xl border border-[#ded8cb] bg-[#faf8f4] p-5">
                        {siteVisit.status === "Reschedule Requested" ||
                        siteVisit.customer_response === "Reschedule Requested" ? (
                          <div id="reschedule-slot-details" className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ede1c7] pb-3">
                              <div className="flex items-center gap-2 text-[#8a641d] font-bold text-sm">
                                <Clock size={18} className="text-[#c28e20]" />
                                <span>Requested Alternative Time Slot</span>
                              </div>
                              <span className="rounded-full bg-[#fdf0d5] px-3 py-1 text-[11px] font-bold text-[#8f6412]">
                                Reschedule Pending Review ⏳
                              </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-white p-3.5 border border-[#ede1c7]">
                              <div>
                                <span className="block text-[10px] font-bold uppercase text-black/45">
                                  Earlier Proposed Slot
                                </span>
                                <span className="mt-0.5 block font-semibold text-black/75 text-sm">
                                  {siteVisit.visit_date} · {siteVisit.visit_time}
                                </span>
                              </div>

                              <div className="border-t sm:border-t-0 sm:border-l sm:pl-3 border-[#eee6d8] pt-2 sm:pt-0">
                                <span className="block text-[10px] font-bold uppercase text-[#0c7a62]">
                                  Your Requested New Slot
                                </span>
                                <span className="mt-0.5 block font-bold text-[#0c7a62] text-sm">
                                  {siteVisit.customer_preferred_date || "—"} ·{" "}
                                  {siteVisit.customer_preferred_time || "—"}
                                </span>
                              </div>
                            </div>

                            {siteVisit.customer_response_notes && (
                              <div className="rounded-xl bg-[#fffdf7] p-3 border border-[#ede7dc]">
                                <span className="block text-[10px] font-bold uppercase text-black/40">
                                  Your Note / Reason
                                </span>
                                <p className="mt-0.5 text-xs text-black/80 font-medium">
                                  &ldquo;{siteVisit.customer_response_notes}&rdquo;
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <p className="text-[11px] text-[#8a641d]">
                                Sarada Homeplan architect team has received your requested slot and will confirm shortly.
                              </p>

                              <button
                                type="button"
                                onClick={() => {
                                  setPreferredVisitDate(siteVisit.customer_preferred_date || "");
                                  setPreferredVisitTime(siteVisit.customer_preferred_time || "");
                                  setRescheduleNote(siteVisit.customer_response_notes || "");
                                  setShowReschedule(true);
                                }}
                                className="rounded-xl border border-[#c3b69a] bg-white px-3.5 py-1.5 text-xs font-bold text-[#173b2e] hover:bg-[#f6f2ea] transition"
                              >
                                Change Requested Time ✏️
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <span className="block text-[10px] font-bold uppercase text-black/40">
                                {siteVisit.status === "Confirmed" ? "Confirmed Date" : "Proposed Date"}
                              </span>
                              <span className="mt-1 block font-serif text-lg font-bold text-[#17221b]">
                                {siteVisit.visit_date}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-bold uppercase text-black/40">
                                {siteVisit.status === "Confirmed" ? "Confirmed Time" : "Proposed Time"}
                              </span>
                              <span className="mt-1 block font-serif text-lg font-bold text-[#17221b]">
                                {siteVisit.visit_time}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-bold uppercase text-black/40">
                                Consultant Note
                              </span>
                              <span className="mt-1 block text-xs text-black/70">
                                {siteVisit.notes || "Standard plot verification and vastu check."}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {siteVisit.status === "Proposed" &&
                          siteVisit.customer_response !== "Reschedule Requested" && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={acceptSiteVisit}
                                disabled={isRespondingToVisit}
                                className="rounded-xl bg-[#0c7a62] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#096650]"
                              >
                                {isRespondingToVisit ? "Confirming..." : "✓ Accept Proposed Slot"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowReschedule(true)}
                                disabled={isRespondingToVisit}
                                className="rounded-xl border border-[#c3b69a] bg-white px-6 py-2.5 text-xs font-bold text-[#173b2e] transition hover:bg-[#f6f2ea]"
                              >
                                Suggest Another Time
                              </button>
                            </div>
                          )}

                        {siteVisit.status === "Confirmed" && (
                          <div className="mt-4 flex items-center justify-between border-t border-[#eee7db] pt-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#0c7a62]">
                              <CheckCircle2 size={16} /> Visit Confirmed
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowReschedule(true)}
                              className="text-xs font-semibold text-[#765f31] hover:underline"
                            >
                              Need to change date?
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#dcd6ca] p-8 text-center">
                      <MapPin size={32} className="mx-auto text-black/35" />
                      <h4 className="mt-2 font-serif text-lg font-bold text-[#17221b]">
                        No Visit Scheduled Yet
                      </h4>
                      <p className="mt-1 text-xs text-black/55 max-w-md mx-auto">
                        Site visits are owner-controlled and arranged based on your plot location. Our team will contact you and assign a visit date soon.
                      </p>
                    </div>
                  )}
                </div>

                {/* PREPARATION TIPS */}
                <div className="mt-8 rounded-2xl bg-[#f4f7f2] p-5 border border-[#e1e9dc]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063b2c]">
                    What to Prepare Before the Site Visit
                  </h4>
                  <ul className="mt-3 grid gap-2.5 text-xs text-black/75 sm:grid-cols-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#0c7a62] font-bold">1.</span>
                      <span>Plot boundary corner markers or pegs identified.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0c7a62] font-bold">2.</span>
                      <span>Road width in front of plot and neighboring open spaces noted.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0c7a62] font-bold">3.</span>
                      <span>Family room preferences (number of bedrooms, pooja room, parking).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0c7a62] font-bold">4.</span>
                      <span>Any hand-drawn sketch or reference ideas ready on paper.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MY PLANS & ARCHITECTURAL DRAWINGS */}
          {/* ========================================================= */}
          {activeTab === "plans" && (
            <div className="space-y-5">
              {/* TOP HEADER CARD */}
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdf] pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b7732]">
                      Your Custom Project Deliverables
                    </span>
                    <h2 className="mt-1 font-serif text-2xl font-bold text-[#17221b]">
                      Architectural Plans & House Maps
                    </h2>
                    <p className="mt-1 text-xs text-black/55">
                      Live tracking of your plot&apos;s 2D concept draft, working blueprints, Vastu verification, and execution sheets.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#fbf5e5] px-3.5 py-1 text-xs font-bold text-[#8a6312] border border-[#eedab2]">
                      Order #{customerRequest?.id || "Active"} • {activeStatus}
                    </span>
                  </div>
                </div>

                {/* 1. CUSTOMER'S UPLOADED ROUGH SKETCH / IDEA SECTION */}
                <div className="mt-6 rounded-2xl border border-[#ded8cb] bg-[#faf8f3] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#063b2c]">
                        Input Reference
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#17221b]">
                        Aapka Uploaded Paper Sketch / Reference Idea
                      </h3>
                      <p className="text-xs text-black/60">
                        Aapka share kiya gaya rough drawing jise dekh kar architect ne kaam shuru kiya hai.
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#063b2c] bg-white px-3.5 py-2 text-xs font-bold text-[#063b2c] hover:bg-[#063b2c] hover:text-white transition shadow-sm">
                      <Upload size={14} />
                      <span>{uploadedSketch ? "Change / Re-upload Sketch" : "+ Upload Rough Paper Sketch"}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleDashboardSketchUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadedSketch ? (
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-[#e2d8c3] bg-white p-4">
                      <div
                        onClick={() =>
                          setActivePlanPreview({
                            title: uploadedSketchName || "Aapka Hand-drawn Rough Sketch",
                            type: "Customer Idea Reference",
                            status: "Under Review by Architect",
                            image: uploadedSketch,
                          })
                        }
                        className="group relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#d6cdb8] bg-[#f5f2ea]"
                      >
                        <img
                          src={uploadedSketch}
                          alt="Customer Rough Sketch"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                          <Eye size={18} className="text-white" />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <span className="inline-block rounded-full bg-[#eaf4eb] px-2.5 py-0.5 text-[10px] font-bold text-[#24632c]">
                          ✓ Received by Architect
                        </span>
                        <h4 className="mt-1 font-semibold text-sm text-[#17221b]">
                          {uploadedSketchName || "Hand-drawn Notebook Sketch"}
                        </h4>
                        <p className="text-xs text-black/55 mt-0.5">
                          Architect is reviewing your room placement and plot boundary according to this hand sketch.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePlanPreview({
                              title: uploadedSketchName || "Aapka Hand-drawn Rough Sketch",
                              type: "Customer Idea Reference",
                              status: "Under Review by Architect",
                              image: uploadedSketch,
                            })
                          }
                          className="mt-2 text-xs font-bold text-[#063b2c] hover:underline flex items-center gap-1 justify-center sm:justify-start"
                        >
                          <Maximize2 size={13} /> Inspect Full Sketch
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-[#dcd6ca] bg-white p-5 text-center">
                      <p className="text-xs font-medium text-black/60">
                        Aapne request form me koi sketch attach nahi kiya tha.
                        Agar aapke paas koi diary drawing ya purana naksha hai, toh upar diye button se kabhi bhi add kar sakte hain.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. REAL DELIVERABLES SLOTS */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#17221b]">
                        Project Deliverables & Working Drawings
                      </h3>
                      <p className="text-xs text-black/55">
                        These are your plot-specific architectural deliverables designed for local execution.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Deliverable 1: 2D Concept Draft */}
                    <div className="rounded-2xl border border-[#e4dfd6] bg-[#faf8f3] p-5 shadow-sm transition hover:border-[#bda76d]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f1ec] text-[#063b2c]">
                          <FileText size={22} />
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            adminRoughDraft
                              ? "bg-[#eaf4eb] text-[#24632c]"
                              : "bg-[#fff3d6] text-[#8a641d]"
                          }`}
                        >
                          {adminRoughDraft ? "Draft Uploaded by Architect" : "In Progress (Architect Drafting)"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                          Phase 1: Concept Layout
                        </span>
                        <h4 className="mt-0.5 font-serif text-base font-bold text-[#17221b]">
                          {adminRoughDraft ? adminRoughDraft.title : "2D Floor Plan (Rough Draft)"}
                        </h4>
                        <p className="mt-1 text-xs text-black/60 leading-5">
                          {adminRoughDraft
                            ? (adminRoughDraft.note || "Architect dwara aapke plot aur instructions ke mutabiq banaya gaya rough 2D naksha.")
                            : "Architect is designing your custom 2D concept based on your plot details. Once uploaded by admin, your personal draft will be viewable here."}
                        </p>
                      </div>

                      {/* If admin uploaded a plan, show preview thumbnail right here */}
                      {adminRoughDraft && (
                        <div className="mt-3">
                          <div
                            onClick={() =>
                              setActivePlanPreview({
                                title: adminRoughDraft.title || "2D Floor Plan (Rough Draft)",
                                type: "Concept Floor Plan",
                                status: "Uploaded by Architect",
                                image: adminRoughDraft.image,
                              })
                            }
                            className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl border border-[#ddd5c2] bg-white shadow-sm"
                          >
                            <img
                              src={adminRoughDraft.image}
                              alt={adminRoughDraft.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17221b] shadow flex items-center gap-1.5">
                                <Maximize2 size={13} /> Full Screen View
                              </span>
                            </div>
                            <div className="absolute left-2.5 bottom-2.5">
                              <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                Architect Uploaded Map
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ACTION BUTTONS FOR ROUGH DRAFT: "Need change" OR "Final the map" */}
                      {adminRoughDraft && (
                        <div className="mt-3.5 rounded-xl border border-[#e4d8c0] bg-white p-3.5 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                              Client Action Required
                            </span>
                            <span className="text-[10px] font-semibold text-black/50">
                              {requestStatus === "Approved"
                                ? "Status: Confirmed & Final"
                                : requestStatus === "Revision"
                                ? "Status: Revision Underway"
                                : "Awaiting Your Decision"}
                            </span>
                          </div>

                          {requestStatus === "Approved" ? (
                            <div className="rounded-lg bg-[#eaf4eb] p-3 border border-[#cbe3cf] text-xs text-[#24632c]">
                              <p className="font-bold flex items-center gap-1.5">
                                <Check size={14} strokeWidth={2.5} /> Aapne ye 2D rough naksha Finalize kar diya hai!
                              </p>
                              <p className="mt-1 text-[11px] text-[#24632c]/85">
                                Architect ab is layout ke aadhar par aapka Final HD Blueprint aur Thekedar Execution Sheet prepare kar rahe hain.
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-black/75 leading-relaxed">
                                Kripya naksha check karein. Agar pasand hai toh seedhe <strong>Final</strong> karein, ya kamre/kitchen me <strong>Badlav (Changes)</strong> ki demand karein:
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleFinalizeRoughPlan}
                                  disabled={isFinalizingPlan}
                                  className="flex-1 min-w-[130px] rounded-xl bg-[#0c7a62] py-2 px-3 text-xs font-bold text-white shadow hover:bg-[#096650] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  <Check size={14} strokeWidth={2.5} />
                                  <span>{isFinalizingPlan ? "Confirming..." : "Final the Map (नक्शा फाइनल करें)"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setShowInlineRevisionBox(!showInlineRevisionBox)}
                                  className="flex-1 min-w-[130px] rounded-xl border border-[#c2963d] bg-[#faf6ee] py-2 px-3 text-xs font-bold text-[#8a6312] hover:bg-[#f6eedc] transition flex items-center justify-center gap-1.5"
                                >
                                  <Pencil size={13} />
                                  <span>Need Change (बदलाव चाहिए)</span>
                                </button>
                              </div>

                              {/* INLINE REVISION BOX */}
                              {showInlineRevisionBox && (
                                <div className="mt-2.5 rounded-xl border border-[#e2d8c3] bg-[#faf8f4] p-3 space-y-2">
                                  <label className="block text-[11px] font-bold text-[#17221b]">
                                    Aapko naksha me kya badlav (changes) chahiye?
                                  </label>
                                  <textarea
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Udaharan: Bedroom ka size 12x14 feet karein, kitchen Agni-kon me shift karein, stairs bahar se nikalein..."
                                    className="w-full rounded-lg border border-[#cfc6b4] bg-white p-2.5 text-xs text-[#17221b] outline-none focus:border-[#0c7a62] focus:ring-1 focus:ring-[#0c7a62]"
                                  />
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setShowInlineRevisionBox(false)}
                                      className="rounded-lg px-3 py-1.5 text-xs text-black/60 hover:bg-black/5"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleRevisionSubmit}
                                      disabled={isSubmittingRevision || !revisionNotes.trim()}
                                      className="rounded-lg bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0a4d38] disabled:opacity-50 transition"
                                    >
                                      {isSubmittingRevision ? "Submitting..." : "Submit Revision Demand →"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className="mt-4 border-t border-[#ede7db] pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-black/50">
                          {adminRoughDraft
                            ? `Uploaded: ${adminRoughDraft.date || "Recent"}`
                            : "Architect Drafting (24-48 hrs)"}
                        </span>
                        {adminRoughDraft ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePlanPreview({
                                title: adminRoughDraft.title || "2D Floor Plan (Rough Draft)",
                                type: "Concept Floor Plan",
                                status: "Uploaded by Architect",
                                image: adminRoughDraft.image,
                              });
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-[#063b2c] hover:underline"
                          >
                            <Maximize2 size={13} /> Open Draft Map
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              alert("Aapka 2D Rough Draft architect dwara banaya ja raha hai. Jaise hi Admin team dwara upload hoga, aapka actual naksha yahan dikhai dega.");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#fbf5e6] px-2.5 py-1 text-[11px] font-semibold text-[#8a6312] hover:bg-[#faeed0] transition"
                          >
                            Draft In Preparation
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Deliverable 2: Final 2D Working Blueprint */}
                    <div className="rounded-2xl border border-[#e4dfd6] bg-[#faf8f3] p-5 shadow-sm transition hover:border-[#bda76d]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf0fb] text-[#2a59a0]">
                          <Maximize2 size={22} />
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            adminFinalBlueprint
                              ? "bg-[#eaf4eb] text-[#24632c]"
                              : "bg-black/5 text-black/50"
                          }`}
                        >
                          {adminFinalBlueprint ? "Approved & Final" : "Awaiting Final Blueprint"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                          Phase 2: Working Drawing
                        </span>
                        <h4 className="mt-0.5 font-serif text-base font-bold text-[#17221b]">
                          {adminFinalBlueprint ? adminFinalBlueprint.title : "Final HD Architectural Blueprint"}
                        </h4>
                        <p className="mt-1 text-xs text-black/60 leading-5">
                          {adminFinalBlueprint
                            ? (adminFinalBlueprint.note || "Full millimeter & inch dimensioned map for builder/thekedar with door-window schedules.")
                            : "Full millimeter & inch dimensioned map for your builder/thekedar. Uploaded after rough draft approval."}
                        </p>
                      </div>

                      {adminFinalBlueprint && (
                        <div className="mt-3">
                          <div
                            onClick={() =>
                              setActivePlanPreview({
                                title: adminFinalBlueprint.title || "Final Architectural Blueprint",
                                type: "Approved Working Plan",
                                status: "Print Ready",
                                image: adminFinalBlueprint.image,
                              })
                            }
                            className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl border border-[#ddd5c2] bg-white shadow-sm"
                          >
                            <img
                              src={adminFinalBlueprint.image}
                              alt={adminFinalBlueprint.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17221b] shadow flex items-center gap-1.5">
                                <Maximize2 size={13} /> Full Screen Blueprint
                              </span>
                            </div>
                            <div className="absolute left-2.5 bottom-2.5">
                              <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                Final Blueprint
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 border-t border-[#ede7db] pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-black/50">
                          {adminFinalBlueprint
                            ? `Uploaded: ${adminFinalBlueprint.date || "Recent"}`
                            : "Unlocks after draft approval"}
                        </span>
                        {adminFinalBlueprint ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePlanPreview({
                                title: adminFinalBlueprint.title || "Final HD Architectural Blueprint",
                                type: "Approved Working Plan",
                                status: "Print Ready",
                                image: adminFinalBlueprint.image,
                              });
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-[#063b2c] hover:underline"
                          >
                            <Maximize2 size={13} /> Open HD Blueprint
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-black/40">Locked</span>
                        )}
                      </div>
                    </div>

                    {/* Deliverable 3: Vastu Shastra Compliance Report */}
                    <div className="rounded-2xl border border-[#e4dfd6] bg-[#faf8f3] p-5 shadow-sm transition hover:border-[#bda76d]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fdf5e2] text-[#8f6412]">
                          <Compass size={22} />
                        </div>
                        <span className="rounded-full bg-[#eaf4eb] px-2.5 py-1 text-[10px] font-bold text-[#24632c]">
                          ✓ Vastu Verified
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                          Energy & Alignment
                        </span>
                        <h4 className="mt-0.5 font-serif text-base font-bold text-[#17221b]">
                          Plot Vastu Shastra Scorecard
                        </h4>
                        <p className="mt-1 text-xs text-black/60 leading-5">
                          Verified directional alignment for Kitchen (SE), Master Bedroom (SW), Pooja (NE), and Main Entry.
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                        <span className="rounded bg-white p-1.5 border border-[#eee7db] text-[#063b2c] font-semibold">
                          🟢 Kitchen: Agneya (SE)
                        </span>
                        <span className="rounded bg-white p-1.5 border border-[#eee7db] text-[#063b2c] font-semibold">
                          🟢 Pooja: Ishan (NE)
                        </span>
                        <span className="rounded bg-white p-1.5 border border-[#eee7db] text-[#063b2c] font-semibold">
                          🟢 Master Bed: Nairutya
                        </span>
                        <span className="rounded bg-white p-1.5 border border-[#eee7db] text-[#063b2c] font-semibold">
                          🟢 Entry: Shubh Pada
                        </span>
                      </div>
                    </div>

                    {/* Deliverable 4: Mistri & Thekedar Handout Sheet */}
                    <div className="rounded-2xl border border-[#e4dfd6] bg-[#faf8f3] p-5 shadow-sm transition hover:border-[#bda76d]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eefb] text-[#6b3aa8]">
                          <Layers size={22} />
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            adminMistriSheet
                              ? "bg-[#eaf4eb] text-[#24632c]"
                              : "bg-[#f4cf72]/30 text-[#8a6312]"
                          }`}
                        >
                          {adminMistriSheet ? "✓ Custom Sheet Ready" : "On-Site Guide Ready"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                          Construction Execution
                        </span>
                        <h4 className="mt-0.5 font-serif text-base font-bold text-[#17221b]">
                          {adminMistriSheet ? adminMistriSheet.title : "Thekedar / Mistri Handout Sheet"}
                        </h4>
                        <p className="mt-1 text-xs text-black/60 leading-5">
                          {adminMistriSheet?.note ||
                            "Site par thekedar aur mistri ke liye guide: 9-inch outer vs 4.5-inch inner deewar, column placement aur RCC ratio."}
                        </p>
                      </div>

                      {/* If custom mistri sheet uploaded, show thumbnail preview */}
                      {adminMistriSheet && (
                        <div className="mt-3">
                          <div
                            onClick={() => setShowMistriSheetModal(true)}
                            className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl border border-[#ddd5c2] bg-white shadow-sm"
                          >
                            <img
                              src={adminMistriSheet.image}
                              alt={adminMistriSheet.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17221b] shadow flex items-center gap-1.5">
                                <Maximize2 size={13} /> View Sheet
                              </span>
                            </div>
                            <div className="absolute left-2.5 bottom-2.5">
                              <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                Architect Drawing Attached
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 border-t border-[#ede7db] pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-black/50">
                          {adminMistriSheet
                            ? `Uploaded: ${adminMistriSheet.date || "Recent"}`
                            : "Plot-specific technical specs"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMistriSheetModal(true)}
                          className="flex items-center gap-1 text-xs font-bold text-[#063b2c] hover:underline"
                        >
                          <Maximize2 size={13} /> View Execution Sheet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. REVISION REQUEST / FEEDBACK BOX */}
                <div className="mt-8 rounded-2xl border border-[#bda76d]/50 bg-[#fffdf9] p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6cf] pb-3">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#17221b]">
                        Need Modifications or Room Resizing in Your Map?
                      </h4>
                      <p className="text-xs text-black/60">
                        Aapke paas <strong className="text-[#8a6312]">2 Free Revisions</strong> shamil hain. Agar koi kamra chhota/bada karna ho ya kitchen shift karni ho, yahan likhein:
                      </p>
                    </div>
                    <span className="rounded-full bg-[#063b2c] px-3 py-1 text-[11px] font-bold text-white">
                      2 Free Revisions Included
                    </span>
                  </div>

                  {revisionSuccessBanner && (
                    <div className="mt-3 rounded-xl bg-[#eaf4eb] p-3 text-xs font-bold text-[#24632c] flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Revision request recorded successfully! Our architect will review these adjustments for your next draft.</span>
                    </div>
                  )}

                  <div className="mt-3">
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      rows={3}
                      placeholder="Udaharan: Master bedroom ko thoda bada (14x12) karein, aur staircase ko drawing hall ke bahar se karein..."
                      className="w-full resize-none rounded-xl border border-[#ded8cb] bg-white p-3 text-xs outline-none focus:border-[#063b2c]"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-black/50">
                      Hamari team revision note milne ke 24 ghante ke andar update bhejti hai.
                    </p>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(
                          `Namaste Sarada Homeplan team, I want to discuss a revision for my house plan (Request #${customerRequest?.id || ""}).`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-[#25D366] bg-[#f0faf2] px-3.5 py-2 text-xs font-bold text-[#128C7E] hover:bg-[#25D366] hover:text-white transition"
                      >
                        <MessageCircle size={14} />
                        <span>Bol Kar Samjhayein (WhatsApp Voice Note)</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleRevisionSubmit}
                        disabled={isSubmittingRevision}
                        className="flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#09503c]"
                      >
                        <Send size={13} />
                        <span>{isSubmittingRevision ? "Sending..." : "Submit Revision"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. DESIGN INSPIRATIONS & PORTFOLIO SAMPLES (CLEARLY SEPARATED) */}
                <div className="mt-8 border-t border-[#eee7db] pt-6">
                  <button
                    type="button"
                    onClick={() => setShowInspirations(!showInspirations)}
                    className="flex w-full items-center justify-between rounded-xl bg-[#faf8f4] p-4 text-left transition hover:bg-[#f5f1e8]"
                  >
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#17221b]">
                        Browse Design Inspirations & Sample Reference Layouts
                      </h4>
                      <p className="text-xs text-black/55">
                        Ye Sarada Homeplan ke past completed portfolio projects hain (sirf aapke reference ke liye).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#063b2c]">
                      <span>{showInspirations ? "Hide Samples" : "Show Samples"}</span>
                      {showInspirations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {showInspirations && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {samplePlans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setActivePlanPreview(plan)}
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e4dfd6] bg-[#faf8f3] transition hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#eee9df]">
                            <img
                              src={plan.image}
                              alt={plan.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute right-3 top-3">
                              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#17221b] shadow-sm backdrop-blur-sm">
                                Sample Reference
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-black/25 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#17221b] shadow-md flex items-center gap-1.5">
                                <Maximize2 size={14} /> Open Sample HD
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                              {plan.type} (Portfolio)
                            </span>
                            <h4 className="mt-0.5 font-serif text-base font-bold text-[#17221b]">
                              {plan.title}
                            </h4>
                            <p className="mt-1 text-xs text-black/55">{plan.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PAYMENTS & ADVANCE STATUS */}
          {/* ========================================================= */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="border-b border-[#f0ebdf] pb-4">
                  <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                    Payment & Advance Tracking
                  </h2>
                  <p className="text-xs text-black/55">
                    Clear, transparent pricing with no hidden charges.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e5ddcf] bg-[#faf8f4] p-5">
                    <span className="text-[10px] font-bold uppercase text-black/45">
                      Advance Milestone
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-[#0c7a62]">
                      Advance Verified
                    </h3>
                    <p className="mt-1 text-xs text-black/55">
                      Permits site visit & custom drawing initiation.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e5ddcf] bg-[#faf8f4] p-5">
                    <span className="text-[10px] font-bold uppercase text-black/45">
                      Service Package
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-[#17221b]">
                      House Planning & Vastu
                    </h3>
                    <p className="mt-1 text-xs text-black/55">
                      2D Layout, Vastu alignments, Rough & Final map.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e5ddcf] bg-[#faf8f4] p-5">
                    <span className="text-[10px] font-bold uppercase text-black/45">
                      Final Deliverables
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-[#17221b]">
                      On Approval
                    </h3>
                    <p className="mt-1 text-xs text-black/55">
                      High-res printable sheets upon client sign-off.
                    </p>
                  </div>
                </div>

                {/* VERIFIED RECEIPTS & TRANSACTIONS SECTION */}
                <div className="mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ebdf] pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#17221b]">
                        Verified Receipts & Payment Records
                      </h4>
                      <p className="text-xs text-black/55">
                        Official advance records logged and verified in Supabase
                      </p>
                    </div>
                    {customerPaymentsList.length > 0 && (
                      <span className="rounded-full bg-[#eaf4eb] px-3 py-1 text-xs font-bold text-[#24632c] border border-[#c5e2cb]">
                        {customerPaymentsList.length} Payment{customerPaymentsList.length > 1 ? "s" : ""} Verified
                      </span>
                    )}
                  </div>

                  {customerPaymentsList.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-[#ded8cb] bg-[#faf8f4] p-8 text-center">
                      <CreditCard size={28} className="mx-auto text-black/30" />
                      <h5 className="mt-2 text-sm font-bold text-[#17221b]">
                        No payments recorded yet
                      </h5>
                      <p className="mt-1 text-xs text-black/55 max-w-md mx-auto">
                        Once your site visit advance is received via UPI or Cash, your verified receipt and official transaction details will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {customerPaymentsList.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-2xl border border-[#e5ddcf] bg-[#fbf9f4] p-5 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7732]">
                                  Receipt #{p.id} • {p.payment_type || "Advance Payment"}
                                </span>
                                <h4 className="mt-1 font-serif text-2xl font-bold text-[#0c7a62]">
                                  ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                                </h4>
                              </div>
                              <span className="rounded-full bg-[#eaf4eb] px-2.5 py-0.5 text-[11px] font-bold text-[#24632c] border border-[#cbe3cf]">
                                ✓ {p.payment_status || "Advance Received"}
                              </span>
                            </div>

                            <div className="mt-3.5 space-y-1.5 rounded-xl bg-white p-3 border border-[#eee7dc] text-xs">
                              <div className="flex justify-between">
                                <span className="text-black/50">Payment Mode:</span>
                                <span className="font-semibold text-[#17221b]">{p.payment_mode || "UPI / QR"}</span>
                              </div>
                              {p.reference_number && (
                                <div className="flex justify-between">
                                  <span className="text-black/50">Ref / UTR No:</span>
                                  <span className="font-mono font-semibold text-[#17221b]">{p.reference_number}</span>
                                </div>
                              )}
                              {p.notes && (
                                <div className="flex justify-between">
                                  <span className="text-black/50">Notes:</span>
                                  <span className="text-black/75">{p.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-[#ede7dc] pt-2.5 text-[11px] text-black/45">
                            <span>
                              Recorded: {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                            <span className="font-semibold text-[#0c7a62]">Official Sarada Receipt</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accepted Payment Modes */}
                <div className="mt-8 rounded-2xl bg-[#f8f6f0] p-5 border border-[#eae3d5]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#17221b]">
                    Accepted Payment Methods
                  </h4>
                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                    <div className="rounded-xl bg-white p-3.5 border border-[#eee8dd]">
                      <span className="font-bold text-[#063b2c]">1. UPI Transfer</span>
                      <p className="mt-1 text-black/60">Google Pay, PhonePe, Paytm QR code support.</p>
                    </div>
                    <div className="rounded-xl bg-white p-3.5 border border-[#eee8dd]">
                      <span className="font-bold text-[#063b2c]">2. Cash at Site Visit</span>
                      <p className="mt-1 text-black/60">Pay our consultant directly during physical visit.</p>
                    </div>
                    <div className="rounded-xl bg-white p-3.5 border border-[#eee8dd]">
                      <span className="font-bold text-[#063b2c]">3. Bank IMPS / NEFT</span>
                      <p className="mt-1 text-black/60">Direct account transfer upon request.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: DOCUMENTS & REQUIREMENTS ARCHIVE */}
          {/* ========================================================= */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Submitted Requests & Documents
                    </h2>
                    <p className="text-xs text-black/55">
                      Audit history of all your plot submissions and requirements
                    </p>
                  </div>
                  <Link
                    href="/customer/request"
                    className="rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0a4d38]"
                  >
                    + Submit New
                  </Link>
                </div>

                <div className="mt-6">
                  {allRequests.length > 0 ? (
                    <div className="space-y-3">
                      {allRequests.map((req, index) => (
                        <div
                          key={req.id}
                          className="rounded-2xl border border-[#ded8cb] bg-[#faf8f4] p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#9b7732]">
                                Request #{req.id} • {new Date(req.created_at).toLocaleDateString("en-IN")}
                              </span>
                              <h4 className="font-serif text-lg font-bold text-[#17221b]">
                                {req.plot_length} × {req.plot_width} {req.measurement_unit} ({req.floors})
                              </h4>
                            </div>
                            <span className="rounded-full bg-[#f4cf72]/30 px-3 py-1 text-xs font-bold text-[#8a6312]">
                              {req.status || "New Request"}
                            </span>
                          </div>

                          <div className="mt-3 rounded-xl bg-white p-3.5 border border-[#eee7dc] text-xs leading-5 text-black/75">
                            <span className="font-bold text-black/45 block text-[10px] uppercase">Requirements:</span>
                            {req.requirements}
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-black/50">
                            <span>Vastu Consultation: {req.vastu_consultation || "Included"}</span>
                            <span>Contact: {req.mobile}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#dcd6ca] p-8 text-center">
                      <FileText size={32} className="mx-auto text-black/35" />
                      <h4 className="mt-2 font-serif text-lg font-bold text-[#17221b]">
                        No Submissions Found
                      </h4>
                      <p className="mt-1 text-xs text-black/55 max-w-sm mx-auto">
                        You have not submitted a house-planning request yet.
                      </p>
                      <Link
                        href="/customer/request"
                        className="mt-4 inline-block rounded-xl bg-[#063b2c] px-5 py-2.5 text-xs font-bold text-white"
                      >
                        Start New Request
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: NOTIFICATIONS & ARCHITECT ALERTS */}
          {/* ========================================================= */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdf] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Notifications & Project Alerts
                    </h2>
                    <p className="text-xs text-black/55">
                      Direct alerts and updates from Sarada Homeplan regarding your plot, site visit, and architectural drawings.
                    </p>
                  </div>
                  {customerNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="rounded-xl border border-[#ded8cb] bg-[#faf8f4] px-4 py-2 text-xs font-bold text-[#8c6710] hover:bg-[#f6f2ea] transition"
                    >
                      Mark All as Read ✓
                    </button>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {customerNotifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#ddd5c7] bg-[#faf8f4] p-10 text-center">
                      <Bell size={32} className="mx-auto text-black/30" />
                      <h4 className="mt-3 text-sm font-bold text-[#17221b]">
                        Abhi koi naya alert ya notification nahi hai
                      </h4>
                      <p className="mt-1 text-xs text-black/55 max-w-md mx-auto">
                        Architect jab bhi aapke plot ka 2D layout, HD blueprint upload karenge ya site visit schedule karenge, yahan alert aa jayega.
                      </p>
                    </div>
                  ) : (
                    customerNotifications.map((notif) => {
                      const isRead = readNotifIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                            isRead
                              ? "bg-white border-[#e5ddcf]"
                              : "bg-[#fffdf6] border-[#e8d5a6] shadow-xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-base font-bold text-[#17221b]">
                                {notif.title}
                              </h4>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  notif.badgeColor || "bg-[#f4ead0] text-[#8c6710]"
                                }`}
                              >
                                {notif.badge || "Update"}
                              </span>
                            </div>
                            <p className="text-xs text-black/75 mt-1.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[#f2ede4] pt-3">
                            <span className="text-xs font-semibold text-black/45">
                              {notif.date}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab(notif.actionTab || "project");
                              }}
                              className="rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a4d38] transition flex items-center gap-1.5"
                            >
                              <span>{notif.actionLabel || "View Details"}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: PROFILE & SETTINGS */}
          {/* ========================================================= */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e4dfd5] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0ebdf] pb-6">
                  {/* AVATAR + BASIC INFO */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {customerAvatar ? (
                        <img
                          src={customerAvatar}
                          alt={customerName}
                          className="h-20 w-20 rounded-full object-cover border-2 border-[#bda76d] shadow-sm"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4cf72] font-serif text-3xl font-bold text-[#063b2c] border-2 border-[#bda76d]">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <label
                        className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#063b2c] text-white shadow-md hover:bg-[#09503c] transition"
                        title="Upload Profile Photo"
                      >
                        <Camera size={13} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                          {customerName}
                        </h2>
                        <span className="rounded-full bg-[#eaf4eb] px-2.5 py-0.5 text-[10px] font-bold text-[#24632c]">
                          Verified Client
                        </span>
                      </div>
                      <p className="text-xs text-black/55 mt-0.5">
                        {customerEmail || "Authenticated Member"} • {customerMobile || "No mobile added"}
                      </p>

                      {customerAvatar && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="mt-1 text-[11px] font-semibold text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#bda76d] bg-[#fdfcf8] px-4 py-2 text-xs font-bold text-[#705d35] hover:bg-[#173b2e] hover:text-white transition shadow-sm"
                  >
                    <Pencil size={13} />
                    <span>Edit Profile Details</span>
                  </button>
                </div>

                {/* DETAILS GRID */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/45 mb-3">
                    Contact & Plot Location Profile
                  </h3>

                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Full Name</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerName}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Primary Mobile</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerMobile || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">WhatsApp / Alt Number</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerWhatsapp || "Same as mobile"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Village / Town / City</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerVillage || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Landmark / Near Location</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerLandmark || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">District</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerDistrict || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">State</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerState || "Bihar"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">PIN Code</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerPinCode || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Property Type</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerPropertyType || "Residential (1-3 Floor)"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Preferred Language</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerLanguage || "Hindi"}</p>
                    </div>

                    <div className="rounded-2xl border border-[#eee8dc] bg-[#faf8f4] p-4 sm:col-span-2">
                      <span className="block text-[10px] font-bold uppercase text-black/40">Account Email</span>
                      <p className="mt-1 font-semibold text-sm text-[#17221b]">{customerEmail || "Authenticated User"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUGGEST ANOTHER TIME / RESCHEDULE MODAL */}
      {/* ========================================================= */}
      {showReschedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-3">
              <h2 className="font-serif text-[22px] font-bold text-[#17221b]">
                Suggest Another Time
              </h2>
              <button
                type="button"
                onClick={() => setShowReschedule(false)}
                className="rounded-full p-1 text-black/40 hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-[13px] leading-5 text-black/60">
              Please choose a date and time that suits your availability. Our consultant will review your request.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#173b2e]">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredVisitDate}
                  onChange={(e) => setPreferredVisitDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#173b2e]">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={preferredVisitTime}
                  onChange={(e) => setPreferredVisitTime(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-[#173b2e]">
                Note / Reason (Optional)
              </label>
              <textarea
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
                placeholder="Example: Sunday morning is better as family members will be home."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#cfd8d1] px-3 py-2.5 text-xs outline-none focus:border-[#0c7a62]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowReschedule(false);
                  setPreferredVisitDate("");
                  setPreferredVisitTime("");
                  setRescheduleNote("");
                }}
                className="rounded-xl border border-[#9ca59e] bg-white px-5 py-2.5 text-xs font-bold text-[#173b2e]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRescheduleRequest}
                disabled={isRespondingToVisit}
                className="rounded-xl bg-[#0c7a62] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#096650]"
              >
                {isRespondingToVisit ? "Submitting..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-3">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#17221b]">
                  Edit Profile & Details
                </h2>
                <p className="text-xs text-black/55">
                  Update your contact info, location, and planning preferences
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="rounded-full p-1 text-black/40 hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* AVATAR PHOTO PICKER IN MODAL */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#faf8f4] p-3.5 border border-[#eee8dc]">
              <div className="relative">
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt="Profile Preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#bda76d]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4cf72] font-serif text-2xl font-bold text-[#063b2c] border-2 border-[#bda76d]">
                    {editName.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <span className="block text-xs font-bold text-[#17221b]">Profile Photo</span>
                <p className="text-[11px] text-black/50">PNG, JPG or WebP up to 5MB</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg bg-[#063b2c] px-3 py-1 text-xs font-bold text-white hover:bg-[#09503c] transition inline-flex items-center gap-1">
                    <Camera size={12} />
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAvatar("");
                        removeAvatar();
                      }}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    Primary Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    WhatsApp / Alt Mobile
                  </label>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="Optional (for maps sharing)"
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    Village / Town / City
                  </label>
                  <input
                    type="text"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    Landmark / Nearby Location
                  </label>
                  <input
                    type="text"
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    placeholder="e.g. Near Shiv Mandir / Main Road"
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    District
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    State
                  </label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-2.5 text-xs outline-none focus:border-[#0c7a62] bg-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={editPinCode}
                    onChange={(e) => setEditPinCode(e.target.value)}
                    placeholder="e.g. 841301"
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-3 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    Property / Construction Type
                  </label>
                  <select
                    value={editPropertyType}
                    onChange={(e) => setEditPropertyType(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-2.5 text-xs outline-none focus:border-[#0c7a62] bg-white"
                  >
                    <option value="Residential (1-3 Floor)">Residential (1-3 Floor)</option>
                    <option value="Duplex / Villa">Duplex / Villa</option>
                    <option value="Commercial Shop-cum-Residence">Commercial Shop-cum-Residence</option>
                    <option value="Farmhouse / Plot Boundary">Farmhouse / Plot Boundary</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#173b2e]">
                    Preferred Consultation Language
                  </label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-[#cfd8d1] px-2.5 text-xs outline-none focus:border-[#0c7a62] bg-white"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Bhojpuri">Bhojpuri (भोजपुरी)</option>
                    <option value="Maithili">Maithili (मैथिली)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-[#f0ebdf] pt-4">
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="rounded-xl border border-[#9ca59e] bg-white px-5 py-2.5 text-xs font-bold text-[#173b2e]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={isSavingProfile}
                className="rounded-xl bg-[#0c7a62] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#096650]"
              >
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* THEKEDAR / MISTRI SITE EXECUTION SHEET MODAL */}
      {/* ========================================================= */}
      {showMistriSheetModal && (
        <div
          className="fixed inset-0 z-[145] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowMistriSheetModal(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e5ddcf] bg-[#fbf9f4] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#ebd28b] pb-4">
              <div>
                <span className="rounded-full bg-[#063b2c] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f4cf72]">
                  Sarada Homeplan · On-Site Mason Guide
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-[#17221b]">
                  Thekedar / Mistri Execution Sheet
                </h3>
                <p className="mt-1 text-xs text-black/60">
                  Site par bina kisi galti ke sahi deewar motai, column grid aur concrete ratio ke niyam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMistriSheetModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd5c7] text-lg text-[#17221b] transition hover:bg-[#173b2e] hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* CUSTOMER PLOT CONTEXT STRIP */}
            <div className="mt-4 rounded-2xl border border-[#e1d9c6] bg-[#f4efe3] p-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-black/45">
                    Client Name
                  </span>
                  <span className="font-bold text-[#17221b]">
                    {customerName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-black/45">
                    Plot Dimensions
                  </span>
                  <span className="font-bold text-[#0c7a62]">
                    {customerRequest?.plot_length || projectData?.plot_length || "30"} ×{" "}
                    {customerRequest?.plot_width || projectData?.plot_width || "40"}{" "}
                    {customerRequest?.measurement_unit || "ft"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-black/45">
                    Planned Floors
                  </span>
                  <span className="font-bold text-[#17221b]">
                    {customerRequest?.floors || projectData?.floors || "1 Floor (G)"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-black/45">
                    Site Location
                  </span>
                  <span className="font-bold text-[#17221b] truncate block">
                    {customerDistrict || customerVillage || "Bihar / India"}
                  </span>
                </div>
              </div>
            </div>

            {/* IF ADMIN UPLOADED A CUSTOM MISTRI DRAWING */}
            {adminMistriSheet && (
              <div className="mt-4 rounded-2xl border border-[#d5a842] bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b7732]">
                    Architect Custom Execution Map
                  </span>
                  <span className="text-[10px] font-bold text-[#24632c] bg-[#eaf4eb] px-2 py-0.5 rounded-full">
                    Official Map
                  </span>
                </div>
                <div
                  className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#ded5c4] bg-[#fbf9f4] cursor-pointer group"
                  onClick={() =>
                    setActivePlanPreview({
                      title: adminMistriSheet.title || "Thekedar Execution Map",
                      type: "Mason Site Guide",
                      status: "Official Handout",
                      image: adminMistriSheet.image,
                    })
                  }
                >
                  <img
                    src={adminMistriSheet.image}
                    alt="Custom Mistri Sheet"
                    className="h-full w-full object-contain transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17221b] shadow">
                      Click for Fullscreen View
                    </span>
                  </div>
                </div>
                {adminMistriSheet.note && (
                  <p className="mt-2 text-xs italic text-black/70">
                    &ldquo;{adminMistriSheet.note}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* TECHNICAL GUIDELINES GRID */}
            <div className="mt-4 space-y-3">
              <h4 className="font-serif text-base font-bold text-[#17221b]">
                निर्माण के मुख्य नियम (On-Site Technical Specs for Mason):
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* 1. WALL THICKNESS */}
                <div className="rounded-2xl border border-[#e4dfd6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[#063b2c] font-bold text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6f1ec] text-[11px]">
                      1
                    </span>
                    <span>दीवार मोटाई (Wall Thickness)</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-black/75">
                    <li>
                      • <strong className="text-[#17221b]">बाहरी दीवार (Outer):</strong> 9 इंच (230mm) ईंट चुनाई (1:6 सीमेंट मसाला) सुरक्षा व भार वहन के लिए।
                    </li>
                    <li>
                      • <strong className="text-[#17221b]">अंदरूनी दीवार (Inner):</strong> 4.5 इंच (115mm) पार्टीशन (1:4 तेज मसाला + हर 4 फीट पर कंक्रीट बैंड)।
                    </li>
                  </ul>
                </div>

                {/* 2. COLUMN & BEAM */}
                <div className="rounded-2xl border border-[#e4dfd6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[#063b2c] font-bold text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6f1ec] text-[11px]">
                      2
                    </span>
                    <span>कॉलम और बीम (Columns & Plinth)</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-black/75">
                    <li>
                      • <strong className="text-[#17221b]">कॉलम साइज:</strong> 9" × 12" (6 सरिया 12mm TMT Fe550D + 8mm रिंग @ 6" दूरी c/c)।
                    </li>
                    <li>
                      • <strong className="text-[#17221b]">कुर्सी/प्लिंथ स्तर:</strong> सड़क लेवल से कम से कम 2 से 2.5 फीट ऊंचा + 2" DPC वाटरप्रूफिंग।
                    </li>
                  </ul>
                </div>

                {/* 3. LINTEL & SILL LEVEL */}
                <div className="rounded-2xl border border-[#e4dfd6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[#063b2c] font-bold text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6f1ec] text-[11px]">
                      3
                    </span>
                    <span>दरवाजा-खिड़की लिंटल (Lintel & Sill)</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-black/75">
                    <li>
                      • <strong className="text-[#17221b]">लिंटल ऊंचाई:</strong> फर्श से बिल्कुल 7'-0" (7 फीट) एक समान लेवल पर।
                    </li>
                    <li>
                      • <strong className="text-[#17221b]">खिड़की सिल:</strong> फर्श से 3'-0" (3 फीट) ऊंचाई पर।
                    </li>
                  </ul>
                </div>

                {/* 4. RCC SLAB & MIXING */}
                <div className="rounded-2xl border border-[#e4dfd6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[#063b2c] font-bold text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6f1ec] text-[11px]">
                      4
                    </span>
                    <span>छत ढलाई व मसाला (RCC Slab & Mix)</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-black/75">
                    <li>
                      • <strong className="text-[#17221b]">कंक्रीट ग्रेड:</strong> M20 (1 : 1.5 : 3) — 1 बोरी सीमेंट : 1.5 बोरी बालू : 3 बोरी गिट्टी।
                    </li>
                    <li>
                      • <strong className="text-[#17221b]">छत मोटाई:</strong> कम से कम 5 इंच (125mm) कंपैक्शन वाइब्रेटर के साथ।
                    </li>
                  </ul>
                </div>
              </div>

              {/* 5. TARAI & VASTU NOTE */}
              <div className="rounded-2xl border border-[#ded5c4] bg-[#fbf7ed] p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#8a6312]">
                  <Compass size={16} />
                  <span>पानी तराई (Curing) और वास्तु नियम:</span>
                </div>
                <p className="mt-1 text-black/75 leading-5">
                  • ढलाई और ईंट चुनाई के बाद कम से कम <strong className="text-[#17221b]">7 से 10 दिन</strong> लगातार सुबह-शाम तराई करना अनिवार्य है।
                  <br />
                  • रसोईघर (Kitchen) में गैस चूल्हा पूर्व मुखी (East-facing) और सेप्टिक टैंक को कभी भी उत्तर-पूर्व (ईशान) कोण में न बनाएं।
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebdf] pt-4">
              <span className="text-[11px] text-black/50">
                Sarada Homeplan Standard On-Site Contractor Specification Sheet
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Namaste, yahan Sarada Homeplan ka Thekedar/Mistri execution sheet hai: Plot ${customerRequest?.plot_length || 30}x${customerRequest?.plot_width || 40} ft, Floors: ${customerRequest?.floors || "1 Floor"}. 9 inch outer wall aur 4.5 inch inner wall standard.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[#25D366] bg-[#f0faf2] px-4 py-2 text-xs font-bold text-[#128C7E] hover:bg-[#25D366] hover:text-white transition flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Thekedar</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#09503c] transition"
                >
                  Print Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HD PLAN FULLSCREEN VIEWER WITH WATERMARK */}
      {/* ========================================================= */}
      {activePlanPreview && (
        <div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActivePlanPreview(null)}
        >
          <button
            onClick={() => setActivePlanPreview(null)}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-black shadow-lg hover:bg-neutral-200"
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
                src={activePlanPreview.image}
                alt={activePlanPreview.title}
                className="max-h-[80vh] max-w-[92vw] object-contain pointer-events-none"
              />

              {/* SIDE WATERMARK BADGE (EMPTY SIDE AREA - MAP IS COMPLETELY CLEAR) */}
              <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-xl bg-black/75 px-3.5 py-2 backdrop-blur-md border border-white/20 shadow-xl">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f4cf72] text-[#063b2c] font-serif font-black text-xs shadow-sm">
                  S
                </div>
                <div className="text-left">
                  <p className="font-serif text-[11px] font-bold tracking-wider text-white">
                    SARADA HOMEPLAN
                  </p>
                  <p className="text-[9px] font-medium tracking-wide text-[#f4cf72]">
                    Certified Architectural Drawing
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg bg-black/55 px-2.5 py-1 backdrop-blur-sm border border-white/15 text-[10px] font-bold tracking-widest uppercase text-white/90">
                Official Property Plan • {activePlanPreview.type}
              </div>
            </div>

            {/* INLINE ACTIONS IN FULLSCREEN VIEWER FOR ROUGH DRAFT */}
            {activePlanPreview.type === "Concept Floor Plan" && requestStatus !== "Approved" && (
              <div className="mt-2.5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActivePlanPreview(null);
                    handleFinalizeRoughPlan();
                  }}
                  className="rounded-full bg-[#0c7a62] px-5 py-2 text-xs font-bold text-white shadow-xl hover:bg-[#096650] transition flex items-center gap-1.5"
                >
                  <Check size={14} strokeWidth={2.5} /> Final the Map (नक्शा फाइनल करें)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlanPreview(null);
                    setShowInlineRevisionBox(true);
                  }}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-[#8a6312] shadow-xl hover:bg-neutral-100 transition flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Need Changes (बदलाव चाहिए)
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-full bg-black/75 px-5 py-2 text-xs font-medium text-white backdrop-blur-md">
              <span className="font-bold text-[#f4cf72]">
                {activePlanPreview.title}
              </span>
              <span>•</span>
              <span>{activePlanPreview.type}</span>
              <span>•</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {activePlanPreview.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NOTIFICATIONS & ARCHITECT ALERTS MODAL */}
      {/* ========================================================= */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5ddcf] bg-[#f8f5ed] px-6 py-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fae8b2] text-[#8c6710]">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#17221b]">
                    Notifications & Project Alerts
                  </h2>
                  <p className="text-xs text-black/50">
                    Live updates whenever architect changes site visits or uploads drawings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b] hover:bg-[#173b2e] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* LIST */}
            <div className="p-6 space-y-3">
              {customerNotifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ddd5c7] bg-white p-8 text-center text-xs text-black/50">
                  <p>Abhi koi naya alert ya notification nahi hai.</p>
                  <p className="mt-1">
                    Architect jab bhi aapke plot ka plan upload karenge ya visit schedule karenge, yahan alert aa jayega.
                  </p>
                </div>
              ) : (
                customerNotifications.map((notif) => {
                  const isRead = readNotifIds.includes(notif.id);
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        isRead
                          ? "bg-white border-[#e5ddcf]"
                          : "bg-[#fffdf6] border-[#e8d5a6] shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#17221b]">
                            {notif.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notif.badgeColor}`}>
                            {notif.badge}
                          </span>
                        </div>
                        <p className="text-xs text-black/70 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#f2ede4] pt-2.5">
                        <span className="text-[10px] font-semibold text-black/40">
                          {notif.date}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(notif.actionTab);
                            setShowNotificationsModal(false);
                          }}
                          className="rounded-xl bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0a4d38] transition"
                        >
                          {notif.actionLabel} →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {customerNotifications.length > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-bold text-[#8c6710] hover:underline"
                  >
                    Mark All as Read ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
