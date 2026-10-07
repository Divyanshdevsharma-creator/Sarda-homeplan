"use client";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileImage,
  FileText,
  FolderKanban,
  FolderPlus,
  House,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Upload,
  Eye,
  Users,
  Wallet,
  AlertTriangle,
  Check,
  ExternalLink,
  MessageCircle,
  Filter,
  ArrowUpRight,
  RefreshCw,
  X,
  CreditCard,
  Printer,
  ShieldCheck,
  Compass,
} from "lucide-react";

import { useEffect, useState, useMemo, type ComponentType } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-client";
import { useAdminSidebarCounts } from "@/lib/hooks/useAdminSidebarCounts";
import CustomerSelector, { CustomerProfileItem } from "@/components/admin/CustomerSelector";
import {
  generateAdminNotifications,
  AdminNotificationItem,
} from "@/lib/notifications/adminNotifications";

type IconType = ComponentType<{
  size?: number;
  className?: string;
}>;

type AdminTab =
  | "overview"
  | "requests"
  | "customers"
  | "projects"
  | "visits"
  | "plans"
  | "payments"
  | "portfolio"
  | "notifications"
  | "settings";

/* =====================================================
   WORKFLOW DEFINITION (10 STAGES)
===================================================== */
const WORKFLOW_STAGES = [
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

/* =====================================================
   PORTFOLIO APPROVED MARKETING ASSETS
===================================================== */
const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Modern 3 BHK Duplex House Plan",
    plot: "30 × 50 ft · East Facing",
    status: "Approved Blueprint",
    image: "/portfolio/house-plan-01-hd.jpg",
    category: "Duplex Villa",
    location: "Pratapgarh, UP",
  },
  {
    id: 2,
    title: "Compact 2 BHK Independent House",
    plot: "25 × 40 ft · North Facing",
    status: "Final Blueprint",
    image: "/portfolio/house-plan-02-hd.jpg",
    category: "Single Floor",
    location: "Prayagraj, UP",
  },
  {
    id: 3,
    title: "Luxury 4 BHK Vastu Residence",
    plot: "40 × 60 ft · Corner Plot",
    status: "Approved Blueprint",
    image: "/portfolio/house-plan-03-hd.jpg",
    category: "G+2 Bungalow",
    location: "Lucknow, UP",
  },
  {
    id: 4,
    title: "Townhouse with Shop & Rental Units",
    plot: "20 × 50 ft · Commercial Mix",
    status: "Approved Blueprint",
    image: "/portfolio/house-plan-04-hd.jpg",
    category: "Commercial + Residence",
    location: "Varanasi, UP",
  },
  {
    id: 5,
    title: "Traditional Courtyard Family Home",
    plot: "35 × 55 ft · North-East Facing",
    status: "Final Blueprint",
    image: "/portfolio/house-plan-05-hd.jpg",
    category: "Courtyard Villa",
    location: "Gorakhpur, UP",
  },
];

/* =====================================================
   STATUS BADGE COMPONENT
===================================================== */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "New Request": "bg-[#eef3f5] text-[#3d515a] border-[#d2dde0]",
    Contacted: "bg-[#eaf3ed] text-[#2c653d] border-[#cfe2d4]",
    "Site Visit": "bg-[#fbf4de] text-[#856b2c] border-[#ebdcb3]",
    Planning: "bg-[#f3f0e9] text-[#635c4e] border-[#dfd8cc]",
    "Rough Plan": "bg-[#f8f0e2] text-[#826938] border-[#ebd9be]",
    "Customer Review": "bg-[#f8eee9] text-[#86594b] border-[#e9d6ce]",
    Revision: "bg-[#f4efe8] text-[#716656] border-[#dfd5c5]",
    Approved: "bg-[#eef5ec] text-[#346a36] border-[#cfe1cb]",
    "Final Plan": "bg-[#e8f3ec] text-[#23683a] border-[#c6decb]",
    Delivered: "bg-[#e8f1f5] text-[#235872] border-[#c6dce8]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
        styles[status] || "border-[#dfd8cc] bg-[#f8f5ee] text-[#555047]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/* =====================================================
   MAIN ADMIN DASHBOARD
===================================================== */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflowFilter, setSelectedWorkflowFilter] = useState<string | null>(null);

  // Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("Planning");

  // Site Visits & Rescheduling State
  const [siteVisitsList, setSiteVisitsList] = useState<any[]>([]);
  const [pendingReschedules, setPendingReschedules] = useState<any[]>([]);
  const [loadingReschedules, setLoadingReschedules] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showVisitResponse, setShowVisitResponse] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [adminVisitDate, setAdminVisitDate] = useState("");
  const [adminVisitTime, setAdminVisitTime] = useState("");
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);

  // Deliverables State
  const [deliverablesList, setDeliverablesList] = useState<any[]>([]);
  const [showUploadPlanModal, setShowUploadPlanModal] = useState(false);
  const [uploadPlanRequestId, setUploadPlanRequestId] = useState<number | string | null>(null);
  const [uploadPlanType, setUploadPlanType] = useState<
    "rough_draft" | "final_blueprint" | "mistri_sheet"
  >("rough_draft");
  const [uploadPlanTitle, setUploadPlanTitle] = useState("");
  const [uploadPlanNote, setUploadPlanNote] = useState("");
  const [uploadPlanImage, setUploadPlanImage] = useState("");
  const [uploadPlanFileName, setUploadPlanFileName] = useState("");
  const [isUploadingPlan, setIsUploadingPlan] = useState(false);

  // HD Plan Preview Modal State
  const [activePlanPreview, setActivePlanPreview] = useState<any | null>(null);

  // Payment State & Recording Modal State
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTargetRequest, setPaymentTargetRequest] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [paymentMode, setPaymentMode] = useState<"UPI / QR" | "Cash at Site Visit" | "Bank Transfer">("UPI / QR");
  const [paymentRefNumber, setPaymentRefNumber] = useState("");
  const [paymentStatusSelect, setPaymentStatusSelect] = useState<"Advance Received" | "Fully Paid" | "Pending">("Advance Received");

  // Registered Customer Profiles
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);

  // Notification Read States & Filtering (FIX #4 & FIX #1)
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sarda_admin_read_notifs");
        return stored ? JSON.parse(stored) : [];
      } catch (_) {}
    }
    return [];
  });
  const [notificationFilter, setNotificationFilter] = useState<
    "all" | "unread" | "visits" | "requests" | "payments"
  >("all");

  // Admin Profile Info (FIX #3 Part B)
  const [adminProfile, setAdminProfile] = useState<{
    full_name?: string;
    role?: string;
    email?: string;
  }>({
    full_name: "Admin Office",
    role: "Super Admin",
  });

  // Customer Selector Modal State (FIX #2)
  const [customerSelectorConfig, setCustomerSelectorConfig] = useState<{
    isOpen: boolean;
    action: "create_project" | "schedule_visit" | "upload_plan" | "record_payment";
    title?: string;
    description?: string;
  } | null>(null);

  // Site Visits History Modal State (FIX #3 Part A)
  const [historyVisitModal, setHistoryVisitModal] = useState<{
    current: any;
    history: any[];
    req: any;
  } | null>(null);

  // Authoritative Dynamic Live Sidebar Counts via Supabase Realtime (FIX #1)
  const sidebarCounts = useAdminSidebarCounts(readNotificationIds);

  // WhatsApp Notification Dispatcher Modal State
  const [whatsappDispatchModal, setWhatsappDispatchModal] = useState<{
    isOpen: boolean;
    customerName: string;
    customerMobile: string;
    actionTitle: string;
    messageText: string;
  } | null>(null);

  // Trigger Customer In-App Notification & WhatsApp Alert Dispatcher
  const triggerCustomerAlert = async ({
    targetRequest,
    title,
    message,
    actionTab,
    whatsappMessage,
  }: {
    targetRequest: any;
    title: string;
    message: string;
    actionTab: string;
    whatsappMessage: string;
  }) => {
    if (!targetRequest) return;
    const supabase = createClient();
    const reqId = targetRequest.id;

    // 1. Persist notification tag in customer_requests.requirements for guaranteed customer dashboard delivery
    try {
      const notifTag = `\n\n[ADMIN_NOTIFICATION_ENTRY:${JSON.stringify({
        id: Date.now(),
        title,
        message,
        actionTab,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })}]`;
      const curReqs = targetRequest.requirements || "";
      await supabase
        .from("customer_requests")
        .update({ requirements: curReqs + notifTag })
        .eq("id", targetRequest.id);
    } catch (_) {}

    // 2. Persist notification to Supabase notifications table if present
    try {
      await supabase.from("notifications").insert({
        user_id: targetRequest.customer_user_id || null,
        request_id: typeof reqId === "number" ? reqId : null,
        title,
        message,
        action_tab: actionTab,
        type: actionTab === "visit" ? "visit" : actionTab === "plans" ? "plan" : "general",
        badge: "Admin Update",
        badge_color: "bg-[#f4ead0] text-[#8c6710]",
      });
    } catch (_) {}

    // 3. Open WhatsApp Dispatch Modal
    setWhatsappDispatchModal({
      isOpen: true,
      customerName: targetRequest.full_name || "Customer",
      customerMobile: targetRequest.mobile || "",
      actionTitle: title,
      messageText: whatsappMessage,
    });
  };

  // Today's Tasks Interactive State
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // 1. Fetch Requests from Supabase (Safe select('*') - never fails on schema mismatch)
  const fetchRequests = async () => {
    setLoadingRequests(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("customer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests from Supabase:", error.message);
      setRequests([]);
    } else {
      setRequests(data || []);
      fetchDeliverables(data || []);
    }
    setLoadingRequests(false);
  };

  // 2. Fetch Projects from Supabase
  const fetchProjects = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    } else {
      setProjects([]);
    }
  };

  // 3. Fetch Site Visits & Reschedules
  const fetchPendingReschedules = async () => {
    setLoadingReschedules(true);
    const supabase = createClient();

    const { data: visits, error } = await supabase
      .from("site_visits")
      .select("*")
      .order("id", { ascending: false });

    if (!error && visits) {
      setSiteVisitsList(visits);

      // Match explicit requests AND customer preferred date submissions
      const reschedules = visits.filter(
        (v) =>
          v.customer_response === "Reschedule Requested" ||
          v.status === "Reschedule Requested" ||
          (v.customer_preferred_date && v.status !== "Confirmed" && v.status !== "Completed" && v.status !== "Cancelled")
      );

      if (reschedules.length > 0) {
        const reqIds = [...new Set(reschedules.map((v) => v.request_id).filter(Boolean))];
        const { data: reqs } = await supabase
          .from("customer_requests")
          .select("*")
          .in("id", reqIds);

        const reqMap = new Map((reqs || []).map((r) => [r.id, r]));
        const combined = reschedules.map((v) => ({
          ...v,
          request: reqMap.get(v.request_id) || requests.find((r) => r.id === v.request_id) || null,
        }));
        setPendingReschedules(combined);
      } else {
        setPendingReschedules([]);
      }
    } else {
      setSiteVisitsList([]);
      setPendingReschedules([]);
    }
    setLoadingReschedules(false);
  };

  // 4. Fetch Payments from Supabase
  const fetchPayments = async () => {
    setLoadingPayments(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPaymentsList(data);
    } else {
      setPaymentsList([]);
    }
    setLoadingPayments(false);
  };

  // 5. Fetch Deliverables from Supabase & requests.requirements
  const fetchDeliverables = async (currentRequests?: any[]) => {
    const supabase = createClient();
    let dbDeliverables: any[] = [];
    try {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbDeliverables = data;
      }
    } catch (_) {}

    // Extract all deliverables stored in customer_requests.requirements
    const reqList = currentRequests || requests;
    const parsedFromReqs: any[] = [];
    reqList.forEach((req) => {
      if (req.requirements) {
        const rough = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:([\s\S]*?)\]/);
        if (rough) {
          try {
            const item = JSON.parse(rough[1]);
            parsedFromReqs.push({
              id: `req-${req.id}-rough`,
              request_id: req.id,
              customer_id: req.customer_user_id,
              type: "rough_draft",
              title: item.title || `2D Rough Draft - ${req.full_name}`,
              file_url: item.image,
              notes: item.note,
              created_at: item.date || req.created_at,
            });
          } catch (_) {}
        }
        const final = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_FINAL:([\s\S]*?)\]/);
        if (final) {
          try {
            const item = JSON.parse(final[1]);
            parsedFromReqs.push({
              id: `req-${req.id}-final`,
              request_id: req.id,
              customer_id: req.customer_user_id,
              type: "final_blueprint",
              title: item.title || `Final Blueprint - ${req.full_name}`,
              file_url: item.image,
              notes: item.note,
              created_at: item.date || req.created_at,
            });
          } catch (_) {}
        }
        const mistri = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:([\s\S]*?)\]/);
        if (mistri) {
          try {
            const item = JSON.parse(mistri[1]);
            parsedFromReqs.push({
              id: `req-${req.id}-mistri`,
              request_id: req.id,
              customer_id: req.customer_user_id,
              type: "mistri_sheet",
              title: item.title || `Mistri Execution Sheet - ${req.full_name}`,
              file_url: item.image,
              notes: item.note,
              created_at: item.date || req.created_at,
            });
          } catch (_) {}
        }
      }
    });

    // Merge without duplicates
    const combined = [...dbDeliverables];
    parsedFromReqs.forEach((p) => {
      if (!combined.some((c) => String(c.id) === String(p.id) || (c.request_id === p.request_id && c.type === p.type))) {
        combined.push(p);
      }
    });

    setDeliverablesList(combined);
  };

  // 6. Fetch Registered Customer Profiles from Supabase
  const fetchCustomerProfiles = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("id, full_name, mobile, village_city, district, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCustomerProfiles(data);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchProjects();
    fetchPendingReschedules();
    fetchPayments();
    fetchDeliverables();
    fetchCustomerProfiles();

    // Setup Supabase Realtime Subscriptions
    const supabase = createClient();
    const channel = supabase
      .channel("admin-realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_requests" },
        () => {
          fetchRequests();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_visits" },
        () => {
          fetchPendingReschedules();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          fetchPayments();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_profiles" },
        () => {
          fetchCustomerProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync Admin Profile from database or localStorage (FIX #3 Part B)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("sarada_admin_name");
      const storedRole = localStorage.getItem("sarada_admin_role");
      const storedEmail =
        localStorage.getItem("sarada_admin_email") ||
        localStorage.getItem("sarda_admin_email");
      if (storedName) {
        setAdminProfile({
          full_name: storedName,
          role: storedRole || "Super Admin",
          email: storedEmail || "admin@saradahomeplan.com",
        });
      }
    }

    const fetchAdminInfo = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("admins")
          .select("full_name, role, email")
          .limit(1)
          .maybeSingle();
        if (data) {
          setAdminProfile(data);
        }
      } catch (_) {}
    };
    fetchAdminInfo();
  }, []);

  // Quick Action Customer Selector Handler (FIX #2: NEVER auto-select requests[0])
  const handleOpenCustomerSelector = (
    action: "create_project" | "schedule_visit" | "upload_plan" | "record_payment",
    title?: string,
    description?: string
  ) => {
    setCustomerSelectorConfig({
      isOpen: true,
      action,
      title:
        title ||
        (action === "create_project"
          ? "Select Customer for New Project"
          : action === "schedule_visit"
          ? "Select Customer for Site Visit"
          : action === "upload_plan"
          ? "Select Customer for Deliverable Upload"
          : "Select Customer to Record Payment"),
      description: description || "Choose a registered customer to continue.",
    });
  };

  const handleCustomerSelected = (customer: CustomerProfileItem) => {
    const action = customerSelectorConfig?.action;
    setCustomerSelectorConfig(null);

    const matchingReq = requests.find(
      (r) =>
        r.customer_user_id === customer.id ||
        (r.mobile &&
          customer.mobile &&
          r.mobile.replace(/\D/g, "") === customer.mobile.replace(/\D/g, ""))
    ) || {
      id: `cust-${customer.id}`,
      customer_user_id: customer.id,
      full_name: customer.full_name || "Registered Customer",
      mobile: customer.mobile || "",
      village_city: customer.village_city || "",
      district: customer.district || "",
      plot_length: "30",
      plot_width: "50",
      measurement_unit: "feet",
      floors: "G+1",
      status: "Planning",
      created_at: customer.created_at || new Date().toISOString(),
    };

    if (action === "create_project") {
      setProjectName(`${customer.full_name || "Customer"} - House Planning`);
      setSelectedRequest(matchingReq);
      setShowCreateProject(true);
    } else if (action === "schedule_visit") {
      setSelectedRequest(matchingReq);
      setVisitDate("");
      setVisitTime("");
      setVisitNotes("");
      setShowScheduleVisit(true);
    } else if (action === "upload_plan") {
      setUploadPlanRequestId(matchingReq.id);
      setUploadPlanType("rough_draft");
      setUploadPlanTitle(
        `2D Floor Plan (Rough Draft) - ${customer.full_name || "Customer"}`
      );
      setUploadPlanNote("");
      setUploadPlanImage("");
      setUploadPlanFileName("");
      setShowUploadPlanModal(true);
    } else if (action === "record_payment") {
      setPaymentTargetRequest(matchingReq);
      setPaymentAmount("1000");
      setPaymentRefNumber("");
      setShowPaymentModal(true);
    }
  };

  // Group Site Visits by request_id (FIX #3 Part A: Deduplication + History)
  const groupedSiteVisits = useMemo(() => {
    const map = new Map<number | string, { current: any; history: any[] }>();
    const sorted = [...siteVisitsList].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : Number(a.id) || 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : Number(b.id) || 0;
      return tB - tA;
    });

    sorted.forEach((visit) => {
      const key = visit.request_id ?? visit.id;
      if (!map.has(key)) {
        map.set(key, { current: visit, history: [] });
      } else {
        map.get(key)!.history.push(visit);
      }
    });

    return Array.from(map.values());
  }, [siteVisitsList]);

  // Event-Driven Admin Notifications (FIX #4)
  const adminNotifications = useMemo(() => {
    return generateAdminNotifications({
      customerProfiles,
      requests,
      siteVisits: siteVisitsList,
      projects,
      payments: paymentsList,
      readIds: readNotificationIds,
    });
  }, [customerProfiles, requests, siteVisitsList, projects, paymentsList, readNotificationIds]);

  const handleMarkAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem("sarda_admin_read_notifs", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = adminNotifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem("sarda_admin_read_notifs", JSON.stringify(allIds));
    } catch (_) {}
  };

  const filteredNotifications = useMemo(() => {
    if (notificationFilter === "unread") {
      return adminNotifications.filter((n) => !n.isRead);
    }
    if (notificationFilter === "visits") {
      return adminNotifications.filter((n) => n.actionTab === "visits");
    }
    if (notificationFilter === "requests") {
      return adminNotifications.filter(
        (n) => n.actionTab === "requests" || n.actionTab === "plans"
      );
    }
    if (notificationFilter === "payments") {
      return adminNotifications.filter((n) => n.actionTab === "payments");
    }
    return adminNotifications;
  }, [adminNotifications, notificationFilter]);

  const unreadNotifsCount = useMemo(() => {
    return adminNotifications.filter((n) => !n.isRead).length;
  }, [adminNotifications]);

  // Open Customer Request Modal
  const openCustomerRequest = async (request: any) => {
    setSelectedRequest(request);
    setSelectedVisit(null);
    setShowVisitResponse(false);

    const supabase = createClient();
    const { data } = await supabase
      .from("site_visits")
      .select(
        "id, request_id, visit_date, visit_time, status, notes, customer_response, customer_response_notes, customer_preferred_date, customer_preferred_time, customer_responded_at"
      )
      .eq("request_id", request.id)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSelectedVisit(data);
      setAdminVisitDate(data.customer_preferred_date || data.visit_date || "");
      setAdminVisitTime(data.customer_preferred_time || data.visit_time || "");
    }
  };

  // Update Request Status in DB and UI
  const updateRequestStatus = async (newStatus: string) => {
    if (!selectedRequest) return;
    setIsUpdatingStatus(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("customer_requests")
      .update({ status: newStatus })
      .eq("id", selectedRequest.id);

    if (error) {
      alert(`Status update failed: ${error.message}`);
      setIsUpdatingStatus(false);
      return;
    }

    setSelectedRequest({
      ...selectedRequest,
      status: newStatus,
    });

    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: newStatus } : r))
    );

    setIsUpdatingStatus(false);

    // Alert Customer on Portal & Open WhatsApp Dispatcher
    await triggerCustomerAlert({
      targetRequest: selectedRequest,
      title: `Project Status: ${newStatus}`,
      message: `Aapke house-planning project ka status update hokar '${newStatus}' ho gaya hai.`,
      actionTab: "project",
      whatsappMessage: `Namaste ${selectedRequest.full_name} ji! Sarda Homeplan me aapke plot project ka status update hokar '${newStatus}' ho gaya hai. Kripya customer dashboard me progress check karein: ${typeof window !== "undefined" ? window.location.origin : ""}/customer/dashboard`,
    });
  };

  // Create Project in DB
  const createProject = async () => {
    if (!selectedRequest) return;
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    setIsCreatingProject(true);
    const supabase = createClient();

    const newProjectData = {
      customer_id: selectedRequest.customer_user_id || "",
      customer_request_id: selectedRequest.id,
      project_name: projectName.trim(),
      project_status: projectStatus,
      plot_length: selectedRequest.plot_length,
      plot_width: selectedRequest.plot_width,
      measurement_unit: selectedRequest.measurement_unit,
      floors: selectedRequest.floors,
    };

    const { data: createdProj, error } = await supabase
      .from("projects")
      .insert(newProjectData)
      .select()
      .maybeSingle();

    if (error) {
      alert(`Project creation failed: ${error.message}`);
      setIsCreatingProject(false);
      return;
    }

    setProjects((prev) => [
      createdProj || {
        ...newProjectData,
        id: Date.now(),
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    alert(`Project "${projectName}" created successfully!`);
    setProjectName("");
    setProjectStatus("Planning");
    setShowCreateProject(false);
    setIsCreatingProject(false);
  };

  // Schedule Site Visit
  const scheduleSiteVisit = async () => {
    if (!selectedRequest) return;
    if (!visitDate || !visitTime) {
      alert("Please select visit date and time.");
      return;
    }

    setIsSchedulingVisit(true);
    const supabase = createClient();

    const newVisitData = {
      request_id: selectedRequest.id,
      visit_date: visitDate,
      visit_time: visitTime,
      status: "Proposed",
      customer_response: "Pending",
      notes: visitNotes.trim() || null,
    };

    const { data, error } = await supabase
      .from("site_visits")
      .insert(newVisitData)
      .select()
      .maybeSingle();

    if (error) {
      alert(`Failed to schedule site visit: ${error.message}`);
      setIsSchedulingVisit(false);
      return;
    }

    // Update request status to Site Visit
    await supabase
      .from("customer_requests")
      .update({ status: "Site Visit" })
      .eq("id", selectedRequest.id);

    const createdVisit = data || newVisitData;

    setSelectedVisit(createdVisit);
    setSelectedRequest({
      ...selectedRequest,
      status: "Site Visit",
    });

    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "Site Visit" } : r))
    );

    setSiteVisitsList((prev) => [createdVisit, ...prev]);

    setVisitDate("");
    setVisitTime("");
    setVisitNotes("");
    setShowScheduleVisit(false);
    setIsSchedulingVisit(false);

    // Alert Customer on Portal & Open WhatsApp Dispatcher
    await triggerCustomerAlert({
      targetRequest: selectedRequest,
      title: `Site Visit Proposed: ${visitDate} at ${visitTime}`,
      message: `Architect ne ${visitDate} ko ${visitTime} baje site visit propose kiya hai.`,
      actionTab: "visit",
      whatsappMessage: `Namaste ${selectedRequest.full_name} ji! Sarda Homeplan se humne aapka Site Visit ${visitDate} ko ${visitTime} baje schedule kiya hai. Kripya apne customer dashboard me review karke confirm karein ya naya samay batayein: ${typeof window !== "undefined" ? window.location.origin : ""}/customer/dashboard`,
    });
  };

  // Handle Reschedule Response (Accept or Propose New Time)
  const handleVisitResponse = async (
    action: "accept" | "propose",
    overrideDate?: string,
    overrideTime?: string,
    targetVisit?: any
  ) => {
    const visitToUpdate = targetVisit || selectedVisit;
    if (!visitToUpdate) return;

    const date = overrideDate || adminVisitDate;
    const time = overrideTime || adminVisitTime;

    if (!date || !time) {
      alert("Please select visit date and time.");
      return;
    }

    const supabase = createClient();

    const updateData =
      action === "accept"
        ? {
            visit_date: date,
            visit_time: time,
            status: "Confirmed",
            customer_response: "Accepted",
          }
        : {
            visit_date: date,
            visit_time: time,
            status: "Proposed",
            customer_response: "Pending",
          };

    const { error } = await supabase
      .from("site_visits")
      .update(updateData)
      .eq("id", visitToUpdate.id);

    if (error) {
      alert(`Visit update failed: ${error.message}`);
      return;
    }

    // Also update any pending reschedule request in reschedule_requests table if exists
    await supabase
      .from("reschedule_requests")
      .update({
        status: action === "accept" ? "Accepted" : "Rescheduled",
      })
      .eq("visit_id", visitToUpdate.id);

    if (selectedVisit && selectedVisit.id === visitToUpdate.id) {
      setSelectedVisit({
        ...selectedVisit,
        visit_date: date,
        visit_time: time,
        status: updateData.status,
        customer_response: updateData.customer_response,
      });
    }

    setShowVisitResponse(false);
    setRescheduleTarget(null);
    setAdminVisitDate("");
    setAdminVisitTime("");

    await fetchPendingReschedules();
    await fetchRequests();

    const targetReqForAlert =
      visitToUpdate.request ||
      requests.find((r) => r.id === visitToUpdate.request_id) ||
      selectedRequest;

    if (action === "accept") {
      await triggerCustomerAlert({
        targetRequest: targetReqForAlert,
        title: `Site Visit Confirmed: ${date} at ${time}`,
        message: `Aapka site visit ${date} ko ${time} baje ke liye CONFIRM kar diya gaya hai.`,
        actionTab: "visit",
        whatsappMessage: `Namaste ${targetReqForAlert?.full_name} ji! Sarda Homeplan se aapka Site Visit ${date} ko ${time} baje CONFIRM kar diya gaya hai. Hamari team diye gaye samay par aapke plot par pahunch jayegi. Kripya zaroori documents taiyar rakhein.`,
      });
    } else {
      await triggerCustomerAlert({
        targetRequest: targetReqForAlert,
        title: `New Site Visit Slot Proposed: ${date} at ${time}`,
        message: `Architect ne aapke reschedule request par naya samay propose kiya: ${date} at ${time}.`,
        actionTab: "visit",
        whatsappMessage: `Namaste ${targetReqForAlert?.full_name} ji! Sarda Homeplan se humne aapke reschedule request par naya slot ${date} ko ${time} baje propose kiya hai. Kripya apne dashboard me review karein: ${typeof window !== "undefined" ? window.location.origin : ""}/customer/dashboard`,
      });
    }
  };

  // Image Compressor for Fast Uploads
  const compressImage = (
    dataUrl: string,
    maxDimension = 1400,
    quality = 0.85
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleAdminPlanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadPlanFileName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const compressed = await compressImage(reader.result);
        setUploadPlanImage(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Plan Deliverable to Customer Dashboard
  const handleAdminUploadPlan = async () => {
    if (!uploadPlanRequestId) {
      alert("Kripya ek customer request select karein.");
      return;
    }
    if (!uploadPlanImage) {
      alert("Kripya plan / naksha ki drawing upload karein.");
      return;
    }

    setIsUploadingPlan(true);
    const supabase = createClient();

    const targetReq =
      requests.find((r) => String(r.id) === String(uploadPlanRequestId)) ||
      selectedRequest;
    const reqId = targetReq?.id || uploadPlanRequestId;
    const customerUserId = targetReq?.customer_user_id || "";

    const defaultTitle =
      uploadPlanType === "rough_draft"
        ? `2D Floor Plan (Rough Draft) - ${targetReq?.full_name || "Customer"}`
        : uploadPlanType === "final_blueprint"
        ? `Final HD Architectural Blueprint - ${targetReq?.full_name || "Customer"}`
        : `Thekedar / Mistri Handout Execution Sheet - ${targetReq?.full_name || "Customer"}`;

    const title = uploadPlanTitle.trim() || defaultTitle;
    const note =
      uploadPlanNote.trim() ||
      (uploadPlanType === "rough_draft"
        ? "Architect dwara ready kiya gaya 2D rough draft layout. Kripya dimensions aur room placement check karein."
        : uploadPlanType === "final_blueprint"
        ? "Approved final working architectural blueprint with execution dimensions."
        : "Thekedar aur mistri ke liye on-site technical execution sheet with wall & column dimensions.");

    const newStatus =
      uploadPlanType === "rough_draft"
        ? "Rough Plan"
        : uploadPlanType === "final_blueprint"
        ? "Final Plan"
        : targetReq?.status || "Planning";

    // 1. Try insert into public.deliverables table in Supabase
    let newDeliverable: any = null;
    try {
      const { data } = await supabase
        .from("deliverables")
        .insert({
          request_id: typeof reqId === "number" ? reqId : null,
          customer_id: customerUserId,
          type: uploadPlanType,
          title: title,
          file_url: uploadPlanImage,
          notes: note,
        })
        .select()
        .maybeSingle();
      newDeliverable = data;
    } catch (_) {}

    // 2. Guaranteed persistence: Save plan tag into customer_requests.requirements
    const tagKey =
      uploadPlanType === "rough_draft"
        ? "ADMIN_PLAN_DELIVERABLE_ROUGH"
        : uploadPlanType === "final_blueprint"
        ? "ADMIN_PLAN_DELIVERABLE_FINAL"
        : "ADMIN_PLAN_DELIVERABLE_MISTRI";

    const deliverablePayload = JSON.stringify({
      id: Date.now(),
      title,
      image: uploadPlanImage,
      note,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });

    let existingReqs = targetReq?.requirements || "";
    const regex = new RegExp(`\\[${tagKey}:[\\s\\S]*?\\]`, "g");
    existingReqs = existingReqs.replace(regex, "").trim();
    const updatedRequirements = `${existingReqs}\n\n[${tagKey}:${deliverablePayload}]`;

    // 3. Update status and requirements in customer_requests table in Supabase
    const { error: reqError } = await supabase
      .from("customer_requests")
      .update({
        status: newStatus,
        requirements: updatedRequirements,
      })
      .eq("id", reqId);

    if (reqError) {
      console.warn("Status update note:", reqError.message);
    }

    const deliverableItem = newDeliverable || {
      id: `deliv-${Date.now()}`,
      request_id: reqId,
      customer_id: customerUserId,
      type: uploadPlanType,
      title,
      file_url: uploadPlanImage,
      notes: note,
      created_at: new Date().toISOString(),
    };

    setDeliverablesList((prev) => [deliverableItem, ...prev]);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, status: newStatus, requirements: updatedRequirements }
          : r
      )
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest({
        ...selectedRequest,
        status: newStatus,
        requirements: updatedRequirements,
      });
    }

    setIsUploadingPlan(false);
    setShowUploadPlanModal(false);
    setUploadPlanImage("");
    setUploadPlanFileName("");
    setUploadPlanNote("");
    setUploadPlanTitle("");

    const deliverableTypeName =
      uploadPlanType === "rough_draft"
        ? "2D Rough Concept Draft"
        : uploadPlanType === "final_blueprint"
        ? "Final HD Architectural Blueprint"
        : "Thekedar / Mistri Handout Sheet";

    await triggerCustomerAlert({
      targetRequest: targetReq,
      title: `${deliverableTypeName} Uploaded`,
      message: `${title} architect dwara upload ho gaya hai. Abhi check karein!`,
      actionTab: "plans",
      whatsappMessage: `Namaste ${targetReq?.full_name} ji! Sarda Homeplan ke architect ne aapke plot ka ${deliverableTypeName} (${title}) upload kar diya hai. Kripya customer dashboard me login karke review karein: ${typeof window !== "undefined" ? window.location.origin : ""}/customer/dashboard`,
    });
  };

  // Record Advance Payment Action
  const handleRecordPayment = async () => {
    if (!paymentTargetRequest) return;

    const refNum = paymentRefNumber.trim() || `TXN-${Date.now().toString().slice(-6)}`;
    const supabase = createClient();

    const { data: newPay, error: payErr } = await supabase
      .from("payments")
      .insert({
        request_id: typeof paymentTargetRequest.id === "number" ? paymentTargetRequest.id : null,
        customer_user_id: paymentTargetRequest.customer_user_id || null,
        customer_name: paymentTargetRequest.full_name || "Customer",
        mobile: paymentTargetRequest.mobile || "",
        amount: Number(paymentAmount) || 1000,
        payment_type: "Site Visit / Drafting Advance",
        payment_status: paymentStatusSelect,
        payment_mode: paymentMode,
        reference_number: refNum,
      })
      .select()
      .maybeSingle();

    if (payErr) {
      alert(`Payment recording failed: ${payErr.message}`);
      return;
    }

    if (newPay) {
      setPaymentsList((prev) => [newPay, ...prev]);
    }

    setShowPaymentModal(false);
    setPaymentRefNumber("");

    await triggerCustomerAlert({
      targetRequest: paymentTargetRequest,
      title: `Advance Payment: ${paymentStatusSelect}`,
      message: `₹${paymentAmount} ka payment (${paymentMode}) record aur verify kar liya gaya hai.`,
      actionTab: "payments",
      whatsappMessage: `Namaste ${paymentTargetRequest.full_name} ji! Sarda Homeplan me aapka advance payment (₹${paymentAmount}) verify aur record ho gaya hai. Aapke plot ka drafting work tezi se prarambh ho chuka hai. Dhanyawad!`,
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("sarada_admin_logged_in");
      localStorage.removeItem("sarda_admin_logged_in");
      localStorage.removeItem("sarada_admin_email");
      localStorage.removeItem("sarada_admin_name");
      localStorage.removeItem("sarada_admin_role");
      document.cookie = "sarada_admin_logged_in=; path=/; max-age=0;";
      document.cookie = "sarda_admin_logged_in=; path=/; max-age=0;";
    }
    window.location.href = "/admin/login";
  };

  // Helper Stats Computed Dynamically from Supabase Data
  const totalAdvanceCollected = useMemo(() => {
    return paymentsList
      .filter((p) => {
        const s = (p.payment_status || "").toLowerCase();
        return s.includes("received") || s.includes("paid") || s.includes("success") || s === "completed";
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsList]);

  const pendingAdvancesCount = useMemo(() => {
    const paidRequestIds = new Set(
      paymentsList
        .filter((p) => {
          const s = (p.payment_status || "").toLowerCase();
          return s.includes("received") || s.includes("paid") || s.includes("success");
        })
        .map((p) => p.request_id)
        .filter(Boolean)
    );
    return requests.filter((r) => !paidRequestIds.has(r.id)).length;
  }, [paymentsList, requests]);

  // Helper Stats
  const getStatusCount = (status: string) => {
    return requests.filter((r) => (r.status || "New Request") === status).length;
  };

  const activeProjectsCount = useMemo(() => {
    const active = [
      "Contacted",
      "Site Visit",
      "Planning",
      "Rough Plan",
      "Customer Review",
      "Revision",
      "Approved",
      "Final Plan",
    ];
    return requests.filter((r) => active.includes(r.status || "New Request")).length;
  }, [requests]);

  // Filtered Requests based on Search and Selected Workflow Status
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mobile?.includes(searchQuery) ||
        r.village_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.id).includes(searchQuery);

      const matchWorkflow =
        !selectedWorkflowFilter ||
        (r.status || "New Request") === selectedWorkflowFilter;

      return matchSearch && matchWorkflow;
    });
  }, [requests, searchQuery, selectedWorkflowFilter]);

  // Unique Customers List (merged from requests and customer_profiles)
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, any>();
    // 1. Add all registered customer profiles from DB
    customerProfiles.forEach((cp) => {
      const key = cp.mobile || cp.id || cp.full_name;
      if (key) {
        map.set(key, {
          id: cp.id,
          name: cp.full_name || "Registered Customer",
          mobile: cp.mobile || "",
          village: cp.village_city || "",
          district: cp.district || "",
          totalRequests: 0,
          latestStatus: "Registered Customer",
          latestRequest: null,
          created_at: cp.created_at,
        });
      }
    });

    // 2. Merge with real requests
    requests.forEach((r) => {
      const cleanMobile = r.mobile ? r.mobile.replace(/\D/g, "") : "";
      let foundKey: string | null = null;
      for (const [k, v] of map.entries()) {
        const vCleanMobile = v.mobile ? v.mobile.replace(/\D/g, "") : "";
        if (
          v.id === r.customer_user_id ||
          (cleanMobile && vCleanMobile && (vCleanMobile.endsWith(cleanMobile) || cleanMobile.endsWith(vCleanMobile)))
        ) {
          foundKey = k;
          break;
        }
      }

      if (foundKey) {
        const item = map.get(foundKey);
        item.totalRequests += 1;
        item.latestStatus = r.status || item.latestStatus;
        if (!item.latestRequest) item.latestRequest = r;
      } else {
        const key = r.mobile || r.customer_user_id || r.full_name;
        map.set(key, {
          id: r.customer_user_id || r.id,
          name: r.full_name,
          mobile: r.mobile,
          village: r.village_city,
          district: r.district,
          totalRequests: 1,
          latestStatus: r.status || "New Request",
          latestRequest: r,
          created_at: r.created_at,
        });
      }
    });
    return Array.from(map.values());
  }, [requests, customerProfiles]);

  // Today's Real Execution Tasks (dynamically derived from real client pending items)
  const dynamicTasks = useMemo(() => {
    const tasks: { id: string; text: string; time: string; linkTab?: AdminTab; req?: any }[] = [];

    // 1. Pending Reschedules
    pendingReschedules.forEach((pr, i) => {
      tasks.push({
        id: `reschedule-${pr.id || i}`,
        text: `Respond to visit reschedule from ${pr.request?.full_name || "Customer"}: "${pr.customer_response_notes || pr.customer_preferred_date || "New time requested"}"`,
        time: pr.customer_preferred_time || "Pending",
        linkTab: "visits",
        req: pr.request,
      });
    });

    // 2. Revisions requested by customer
    requests
      .filter((r) => (r.status || "") === "Revision")
      .forEach((r) => {
        tasks.push({
          id: `rev-${r.id}`,
          text: `Revise 2D floor plan for ${r.full_name} (${r.village_city || ""}) as requested by client`,
          time: "Urgent",
          linkTab: "requests",
          req: r,
        });
      });

    // 3. New Requests awaiting contact
    requests
      .filter((r) => (r.status || "New Request") === "New Request")
      .forEach((r) => {
        tasks.push({
          id: `new-req-${r.id}`,
          text: `Call ${r.full_name} (${r.mobile}) to discuss plot requirements (${r.plot_length}x${r.plot_width} ${r.measurement_unit || "ft"})`,
          time: "New",
          linkTab: "requests",
          req: r,
        });
      });

    // 4. Site Visits scheduled
    siteVisitsList
      .filter((v) => v.status === "Confirmed" || v.status === "Proposed")
      .slice(0, 3)
      .forEach((v) => {
        const matched = requests.find((r) => r.id === v.request_id);
        tasks.push({
          id: `visit-${v.id}`,
          text: `Site visit for ${matched?.full_name || "Client"} at ${matched?.village_city || "site"} (${v.status})`,
          time: `${v.visit_date} ${v.visit_time}`,
          linkTab: "visits",
          req: matched,
        });
      });

    // 5. Work in progress drafts
    requests
      .filter((r) => (r.status || "") === "Planning" || (r.status || "") === "Rough Plan")
      .slice(0, 2)
      .forEach((r) => {
        tasks.push({
          id: `plan-${r.id}`,
          text: `Draft & finalize working plan layout for ${r.full_name}`,
          time: "In Progress",
          linkTab: "plans",
          req: r,
        });
      });

    return tasks.slice(0, 6);
  }, [pendingReschedules, requests, siteVisitsList]);

  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#17221b]">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================
          APP LAYOUT
      ========================================================= */}
      <div className="flex min-h-screen w-full">
        {/* =========================================================
            SIDEBAR (FULL NAVIGATION ACCORDING TO PDF SPECIFICATION)
        ========================================================= */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            flex h-screen w-[290px] shrink-0 flex-col
            overflow-y-auto
            bg-[#073b2b] text-white
            transition-transform duration-300
            lg:sticky lg:top-0 lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* LOGO */}
          <div className="flex h-[82px] shrink-0 items-center px-7 border-b border-white/10">
            <Link
              href="/"
              aria-label="Sarda Homeplan Home"
              className="flex items-center gap-3.5 group transition"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d7b56d] text-[#17382c] shadow-sm group-hover:scale-105 transition">
                <House size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="font-serif text-[22px] font-bold tracking-wide text-white group-hover:text-[#d7b56d] transition">
                  SARDA
                </p>
                <p className="text-[10px] font-semibold tracking-[0.28em] text-[#d7b56d]">
                  HOMEPLAN ADMIN
                </p>
              </div>
            </Link>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard Overview"
              active={activeTab === "overview"}
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={ClipboardList}
              label="Customer Requests"
              badge={sidebarCounts.customerRequests > 0 ? String(sidebarCounts.customerRequests) : undefined}
              active={activeTab === "requests"}
              onClick={() => {
                setActiveTab("requests");
                setSelectedWorkflowFilter(null);
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={Users}
              label="Customers Directory"
              badge={sidebarCounts.customers > 0 ? String(sidebarCounts.customers) : undefined}
              active={activeTab === "customers"}
              onClick={() => {
                window.location.href = "/admin/customers";
              }}
            />

            <NavItem
              icon={FolderKanban}
              label="Projects Tracking"
              badge={sidebarCounts.projects > 0 ? String(sidebarCounts.projects) : undefined}
              active={activeTab === "projects"}
              onClick={() => {
                setActiveTab("projects");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={MapPin}
              label="Site Visits & Reschedules"
              badge={sidebarCounts.siteVisits > 0 ? String(sidebarCounts.siteVisits) : undefined}
              active={activeTab === "visits"}
              onClick={() => {
                setActiveTab("visits");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={FileImage}
              label="Plans & Deliverables"
              badge={sidebarCounts.plans > 0 ? String(sidebarCounts.plans) : undefined}
              active={activeTab === "plans"}
              onClick={() => {
                setActiveTab("plans");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={Wallet}
              label="Payments & Advance"
              badge={sidebarCounts.payments > 0 ? String(sidebarCounts.payments) : undefined}
              active={activeTab === "payments"}
              onClick={() => {
                setActiveTab("payments");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={FileCheck2}
              label="Public Portfolio"
              active={activeTab === "portfolio"}
              onClick={() => {
                setActiveTab("portfolio");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={Bell}
              label="Notifications"
              badge={sidebarCounts.notifications > 0 ? String(sidebarCounts.notifications) : undefined}
              active={activeTab === "notifications"}
              onClick={() => {
                setActiveTab("notifications");
                setSidebarOpen(false);
              }}
            />

            <NavItem
              icon={Settings}
              label="Business Settings"
              active={activeTab === "settings"}
              onClick={() => {
                setActiveTab("settings");
                setSidebarOpen(false);
              }}
            />
          </nav>

          {/* SIDEBAR FOOTER MOTIF */}
          <div className="shrink-0 p-4 border-t border-white/10">
            <div className="rounded-xl bg-[#0e4836] p-3 text-xs border border-white/10">
              <p className="font-semibold text-[#f5d58f] flex items-center gap-1.5">
                <Compass size={14} />
                <span>Sarda Operations</span>
              </p>
              <p className="mt-1 text-[11px] text-white/70 leading-relaxed">
                Owner-controlled site visits & verified blueprint delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* =========================================================
            MAIN DASHBOARD CONTENT AREA
        ========================================================= */}
        <div className="min-w-0 flex-1 flex flex-col">
          {/* HEADER */}
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#ded8cd] bg-[#f8f5ed]/95 px-5 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-[#17221b] hover:bg-black/5 lg:hidden"
            >
              <Menu size={22} />
            </button>

            {/* LIVE SEARCH BAR */}
            <div className="relative max-w-[560px] flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, phones, locations or plot sizes..."
                className="h-[42px] w-full rounded-xl border border-[#ded9cf] bg-white/95 pl-11 pr-10 text-xs outline-none transition placeholder:text-black/40 focus:border-[#0c7a62]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/40 hover:bg-black/5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* HEADER ACTIONS */}
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className="relative rounded-xl p-2.5 hover:bg-black/5 transition"
                title="Notifications"
              >
                <Bell size={20} className="text-[#17221b]" />
                {sidebarCounts.notifications > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2413a] text-[10px] font-bold text-white px-1">
                    {sidebarCounts.notifications}
                  </span>
                )}
              </button>

              <div className="hidden h-7 w-px bg-[#d8d2c8] sm:block" />

              <Link
                href="/admin/profile"
                className="flex items-center gap-2.5 rounded-2xl p-1.5 hover:bg-black/5 transition group"
                title="View Admin Profile & Security Settings"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7b56d] text-sm font-bold text-[#17382c] shadow-sm group-hover:ring-2 group-hover:ring-[#063b2c] transition">
                  {adminProfile?.full_name ? adminProfile.full_name.slice(0, 2).toUpperCase() : "SH"}
                </div>
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-xs font-bold text-[#17221b] group-hover:text-[#063b2c] transition">
                    {adminProfile?.full_name || "Admin Office"}
                  </p>
                  <p className="text-[10px] text-black/50">
                    {adminProfile?.role || "Super Admin"} • Pratapgarh / Prayagraj
                  </p>
                </div>
              </Link>
            </div>
          </header>

          {/* BODY VIEWS ACCORDING TO ACTIVE TAB */}
          <div className="flex-1 p-5 max-w-[1500px] w-full mx-auto space-y-6">
            {/* =========================================================
                TAB 1: OVERVIEW / DASHBOARD HOME
            ========================================================= */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* HERO WELCOME BANNER */}
                <div className="relative overflow-hidden rounded-[26px] border border-[#ded8cc] bg-[#f8f5ed] p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-[#eef5ee] border border-[#d2e2d5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#063b2c]">
                          Live Operations Center
                        </span>
                        <span className="text-[11px] text-black/50">•</span>
                        <span className="text-[11px] font-medium text-black/60">
                          {new Date().toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#10251d]">
                        Welcome back, Sarda Homeplan! 👋
                      </h1>
                      <p className="mt-2 text-sm text-black/65 leading-relaxed">
                        Manage house-planning requests, coordinate on-site visits with clients,
                        upload customized 2D rough drafts, and deliver final blueprints & mistri execution sheets.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <InfoPill icon={CalendarDays} text="Today's Active Schedule" />
                        <InfoPill icon={MapPin} text="Pratapgarh • UP • Bihar" />
                      </div>
                    </div>

                    {/* QUICK ACTION BUTTONS */}
                    <div className="w-full lg:w-auto">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9b7732] mb-3">
                        Quick Launch Actions
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCustomerSelector(
                              "create_project",
                              "Select Customer for New Project",
                              "Choose a registered customer to create an official house planning project."
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0a4d38] shadow-sm"
                        >
                          <Plus size={16} />
                          <span>New Project</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCustomerSelector(
                              "schedule_visit",
                              "Select Customer for Site Visit",
                              "Choose a registered customer to schedule or propose an on-site plot visit."
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1d4ed8] shadow-sm"
                        >
                          <CalendarDays size={16} />
                          <span>Schedule Visit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCustomerSelector(
                              "upload_plan",
                              "Select Customer for Deliverable Upload",
                              "Choose a registered customer to upload 2D layout drafts, blueprints, or thekedar handouts."
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#0c7a62] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#096650] shadow-sm"
                        >
                          <Upload size={16} />
                          <span>Upload Plan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCustomerSelector(
                              "record_payment",
                              "Select Customer to Record Payment",
                              "Choose a registered customer to record token advance or stage payment."
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#b45309] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#92400e] shadow-sm"
                        >
                          <Wallet size={16} />
                          <span>Record Payment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HIGH-PRIORITY ACTION REQUIRED: PENDING RESCHEDULES */}
                {pendingReschedules.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border-2 border-[#d5a842] bg-[#fffdf5] p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e2ba] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fae8b2] text-[#8c6710]">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#17221b]">
                            Pending Reschedule Requests ({pendingReschedules.length})
                          </h3>
                          <p className="text-[11px] text-[#7a6428]">
                            Customer requested a change in site visit schedule. Action required.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("visits")}
                        className="text-xs font-bold text-[#8c6710] hover:underline"
                      >
                        Manage in Visits →
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {pendingReschedules.map((visit) => {
                        const req = visit.request;
                        return (
                          <div
                            key={visit.id}
                            className="flex flex-col justify-between rounded-xl border border-[#ede1c7] bg-white p-4 shadow-sm"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-bold text-[#17221b]">
                                    {req?.full_name || "Customer Request"}
                                  </h4>
                                  <p className="text-xs text-black/55">
                                    {req?.village_city ? `${req.village_city}, ` : ""}
                                    {req?.district || ""} · {req?.mobile || ""}
                                  </p>
                                </div>
                                <span className="rounded-full bg-[#fdf0d5] px-2.5 py-0.5 text-[10px] font-bold text-[#8f6412]">
                                  Reschedule Requested
                                </span>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f9f7f1] p-3 text-xs">
                                <div>
                                  <span className="block text-[10px] font-bold uppercase text-black/40">
                                    Original Proposed
                                  </span>
                                  <span className="mt-0.5 block font-medium text-black/75">
                                    {visit.visit_date} · {visit.visit_time}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-bold uppercase text-[#063b2c]">
                                    Customer Requested
                                  </span>
                                  <span className="mt-0.5 block font-bold text-[#0c7a62]">
                                    {visit.customer_preferred_date || "—"} ·{" "}
                                    {visit.customer_preferred_time || "—"}
                                  </span>
                                </div>
                              </div>

                              {visit.customer_response_notes && (
                                <div className="mt-2.5 rounded-lg bg-[#faf8f4] p-2.5 border border-[#ede7dc]">
                                  <p className="text-[10px] font-bold uppercase text-black/40">
                                    Customer Note
                                  </p>
                                  <p className="mt-0.5 text-xs text-black/70">
                                    &ldquo;{visit.customer_response_notes}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f2ece1] pt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleVisitResponse(
                                    "accept",
                                    visit.customer_preferred_date,
                                    visit.customer_preferred_time,
                                    visit
                                  )
                                }
                                className="rounded-xl bg-[#0c7a62] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#096650]"
                              >
                                Accept Customer Time
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleTarget(visit);
                                  setAdminVisitDate(visit.customer_preferred_date || "");
                                  setAdminVisitTime("");
                                  setShowVisitResponse(true);
                                }}
                                className="rounded-xl border border-[#c3b69a] bg-white px-3.5 py-2 text-xs font-semibold text-[#173b2e] transition hover:bg-[#f6f2ea]"
                              >
                                Propose Different Time
                              </button>
                              {req && (
                                <button
                                  type="button"
                                  onClick={() => openCustomerRequest(req)}
                                  className="rounded-xl border border-[#ddd5c7] bg-[#fbf9f5] px-3 py-2 text-xs font-semibold text-black/70 hover:bg-white"
                                >
                                  View Request
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* KPI METRIC CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    icon={FileText}
                    title="New Requests"
                    value={getStatusCount("New Request").toString()}
                    note="Pending owner review"
                    type="neutral"
                    onClick={() => {
                      setActiveTab("requests");
                      setSelectedWorkflowFilter("New Request");
                    }}
                  />

                  <KpiCard
                    icon={FolderKanban}
                    title="Active Projects"
                    value={activeProjectsCount.toString()}
                    note="In progress workflow"
                    type="gold"
                    onClick={() => setActiveTab("projects")}
                  />

                  <KpiCard
                    icon={CalendarDays}
                    title="Scheduled Visits"
                    value={siteVisitsList.length.toString()}
                    note={`${pendingReschedules.length} reschedules pending`}
                    type="soft"
                    onClick={() => setActiveTab("visits")}
                  />

                  <KpiCard
                    icon={Wallet}
                    title="Advance Tracking"
                    value={`₹${totalAdvanceCollected.toLocaleString("en-IN")}`}
                    note={`${paymentsList.length} recorded payments`}
                    type="attention"
                    onClick={() => setActiveTab("payments")}
                  />
                </div>

                {/* WORKFLOW PIPELINE PROGRESSION */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdf] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#17221b]">
                        Project Lifecycle Workflow
                      </h3>
                      <p className="text-xs text-black/50">
                        Click any status chip to filter customer requests instantly
                      </p>
                    </div>
                    {selectedWorkflowFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkflowFilter(null)}
                        className="rounded-full bg-[#f4ead0] px-3 py-1 text-xs font-bold text-[#8c6710] hover:bg-[#ebd9be]"
                      >
                        Clear Filter: {selectedWorkflowFilter} ✕
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {WORKFLOW_STAGES.map((stage) => {
                      const count = getStatusCount(stage);
                      const isSelected = selectedWorkflowFilter === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setSelectedWorkflowFilter(isSelected ? null : stage);
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            isSelected
                              ? "border-[#063b2c] bg-[#063b2c] text-white shadow-sm"
                              : "border-[#e6e0d4] bg-[#faf8f4] text-[#17221b] hover:border-[#bda76d] hover:bg-white"
                          }`}
                        >
                          <span>{stage}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              isSelected ? "bg-white/20 text-white" : "bg-black/10 text-black/70"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RECENT CUSTOMER REQUESTS TABLE */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#f0ebdf] p-4">
                    <div className="flex items-center gap-2.5">
                      <ClipboardList className="text-[#063b2c]" size={20} />
                      <h3 className="font-serif text-base font-bold text-[#17221b]">
                        Recent Customer House-Planning Requests
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("requests")}
                      className="text-xs font-bold text-[#0c7a62] hover:underline"
                    >
                      View All ({requests.length}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#eeeae3] bg-[#faf8f4] text-black/50 text-[10px] uppercase font-bold tracking-wider">
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Plot Dimensions</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeae3]">
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-black/40">
                              No customer requests yet.
                            </td>
                          </tr>
                        ) : (
                          filteredRequests.slice(0, 6).map((req) => (
                            <tr key={req.id} className="hover:bg-[#fbf9f5] transition">
                              <td className="px-4 py-3 font-mono text-[11px] text-black/40">
                                #{req.id}
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-bold text-[#17221b]">{req.full_name}</p>
                                <p className="text-[11px] text-black/50">{req.floors || "1 Floor"}</p>
                              </td>
                              <td className="px-4 py-3 text-black/70">
                                {req.village_city ? `${req.village_city}, ` : ""}
                                {req.district || "—"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#17221b]">
                                {req.plot_length} × {req.plot_width} {req.measurement_unit || "ft"}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={req.status || "New Request"} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`tel:${req.mobile}`}
                                    className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 hover:text-[#063b2c]"
                                    title="Call Customer"
                                  >
                                    <Phone size={14} />
                                  </a>
                                  <a
                                    href={`https://wa.me/91${(req.mobile || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                                      `Namaste ${req.full_name} ji, Sarda Homeplan se aapka plot naksha request receive hua hai.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-1.5 text-[#0c7a62] hover:bg-[#eef8f4]"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageCircle size={14} />
                                  </a>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => openCustomerRequest(req)}
                                  className="rounded-lg border border-[#bda76d] px-2.5 py-1 text-[11px] font-bold text-[#705d35] hover:bg-[#173b2e] hover:text-white transition"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BOTTOM DUAL COLUMNS: TODAY'S TASKS & APPROVED PORTFOLIO SHOWCASE */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* TODAY'S TASKS */}
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <ListChecks className="text-[#8c6710]" size={18} />
                        <h4 className="font-serif text-base font-bold text-[#17221b]">
                          Today's Execution Checklist
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-black/50">
                        {Object.values(completedTasks).filter(Boolean).length} / {dynamicTasks.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {dynamicTasks.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-[#ded9cf] bg-[#faf8f4] text-center text-xs text-black/50">
                          ✨ All current client requests, visits, and drafting tasks are up to date!
                        </div>
                      ) : (
                        dynamicTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => {
                              setCompletedTasks((prev) => ({ ...prev, [task.id]: !prev[task.id] }));
                              if (task.linkTab) setActiveTab(task.linkTab);
                              if (task.req) openCustomerRequest(task.req);
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                              completedTasks[task.id]
                                ? "bg-[#f5f9f6] border-[#cfe2d4] line-through text-black/40"
                                : "bg-[#faf8f4] border-[#eee7db] text-[#17221b] hover:bg-white hover:border-[#0c7a62]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={!!completedTasks[task.id]}
                                onChange={() => {}}
                                className="h-4 w-4 rounded text-[#063b2c] accent-[#063b2c]"
                              />
                              <span className="text-xs font-medium">{task.text}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-black/50 ml-2 shrink-0">
                              {task.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* RECENT PLANS OVERVIEW */}
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FileImage className="text-[#0c7a62]" size={18} />
                        <h4 className="font-serif text-base font-bold text-[#17221b]">
                          Approved Architectural Plans
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("plans")}
                        className="text-xs font-bold text-[#0c7a62] hover:underline"
                      >
                        All Plans →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {PORTFOLIO_ITEMS.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setActivePlanPreview(item)}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#e4ded4] bg-[#faf8f4] hover:shadow-md transition"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="p-2.5">
                            <p className="truncate text-xs font-bold text-[#17221b]">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-black/55">{item.plot}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 2: CUSTOMER REQUESTS TAB (FULL REVIEWS & FILTERS)
            ========================================================= */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Customer House-Planning Requests
                    </h2>
                    <p className="text-xs text-black/55">
                      Review requirements, plot dimensions, voice transcripts, and schedule site visits.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchRequests()}
                      className="flex items-center gap-1.5 rounded-xl border border-[#ded9cf] px-3 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f4]"
                    >
                      <RefreshCw size={14} />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenCustomerSelector(
                          "upload_plan",
                          "Select Customer for Plan Upload",
                          "Choose a registered customer to upload 2D layout drafts or blueprints."
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-[#0c7a62] px-4 py-2 text-xs font-bold text-white hover:bg-[#096650]"
                    >
                      <Upload size={14} />
                      <span>Upload Plan</span>
                    </button>
                  </div>
                </div>

                {/* STATUS FILTER CHIPS */}
                <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-[#ded9cf]">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkflowFilter(null)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      !selectedWorkflowFilter
                        ? "bg-[#063b2c] text-white"
                        : "bg-[#f5f1e8] text-black/70 hover:bg-[#ece5d8]"
                    }`}
                  >
                    All Requests ({requests.length})
                  </button>
                  {WORKFLOW_STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedWorkflowFilter(selectedWorkflowFilter === s ? null : s)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        selectedWorkflowFilter === s
                          ? "bg-[#063b2c] text-white"
                          : "bg-[#f5f1e8] text-black/70 hover:bg-[#ece5d8]"
                      }`}
                    >
                      {s} ({getStatusCount(s)})
                    </button>
                  ))}
                </div>

                {/* TABLE OF REQUESTS */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#eeeae3] bg-[#faf8f4] text-black/50 text-[10px] uppercase font-bold tracking-wider">
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Plot Size</th>
                          <th className="px-4 py-3">Vastu</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeae3]">
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-sm text-black/40">
                              No customer requests yet.
                            </td>
                          </tr>
                        ) : (
                          filteredRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-[#fbf9f5] transition">
                              <td className="px-4 py-3.5 font-mono text-black/40">#{req.id}</td>
                              <td className="px-4 py-3.5">
                                <p className="font-bold text-[#17221b] text-sm">{req.full_name}</p>
                                <p className="text-[11px] text-black/50">{req.mobile}</p>
                              </td>
                              <td className="px-4 py-3.5 text-black/70">
                                {req.village_city ? `${req.village_city}, ` : ""}
                                {req.district || "—"}
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-[#17221b]">
                                {req.plot_length} × {req.plot_width} {req.measurement_unit || "ft"}
                                <span className="block text-[10px] font-normal text-black/50">
                                  {req.floors || "1 Floor"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="rounded-md bg-[#faf4e6] border border-[#f0dfb8] px-2 py-0.5 text-[10px] font-bold text-[#8f6d23]">
                                  {req.vastu_consultation ? "Vastu Requested" : "Standard"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <StatusBadge status={req.status || "New Request"} />
                              </td>
                              <td className="px-4 py-3.5 text-black/50 text-[11px]">
                                {req.created_at
                                  ? new Date(req.created_at).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })
                                  : "—"}
                              </td>
                              <td className="px-4 py-3.5 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => openCustomerRequest(req)}
                                  className="rounded-lg bg-[#063b2c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a4d38] transition"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 3: CUSTOMERS DIRECTORY TAB
            ========================================================= */}
            {activeTab === "customers" && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Customer Directory ({customerProfiles.length})
                    </h2>
                    <p className="text-xs text-black/55">
                      All {customerProfiles.length} verified customer profiles registered in Supabase.
                    </p>
                  </div>
                  <Link
                    href="/admin/customers"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4 py-2.5 text-xs font-bold text-[#f4cf72] transition hover:bg-[#094d3a] shadow-sm shrink-0"
                  >
                    <Users size={15} />
                    <span>Open /admin/customers Directory</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {uniqueCustomers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-sm text-black/40 bg-white rounded-2xl border border-[#ded9cf]">
                      No customer directory profiles yet.
                    </div>
                  ) : (
                    uniqueCustomers.map((cust, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4ead0] text-[#8c6710] font-bold text-base">
                              {cust.name?.charAt(0) || "C"}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-[#17221b]">{cust.name}</h3>
                              <p className="text-xs text-black/50">{cust.mobile || "No Mobile"}</p>
                            </div>
                          </div>
                          <StatusBadge status={cust.latestStatus || "Planning"} />
                        </div>

                        <div className="rounded-xl bg-[#faf8f4] p-3 text-xs space-y-1 border border-[#eee7db]">
                          <p className="text-black/60">
                            <strong className="text-[#17221b]">Location:</strong> {cust.village || "—"},{" "}
                            {cust.district || "—"}
                          </p>
                          <p className="text-black/60">
                            <strong className="text-[#17221b]">Projects:</strong> {cust.totalRequests} Active Request
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0ebdf]">
                          <a
                            href={`https://wa.me/91${(cust.mobile || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                              `Namaste ${cust.name} ji, Sarda Homeplan se sampark kar rahe hain.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#0c7a62] py-2 text-xs font-bold text-white hover:bg-[#096650] transition"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${cust.mobile}`}
                            className="flex items-center justify-center rounded-xl border border-[#ded9cf] p-2 text-black/70 hover:bg-[#faf8f4] transition"
                            title="Call"
                          >
                            <Phone size={15} />
                          </a>

                          <Link
                            href={`/admin/customers/${cust.id}`}
                            className="flex items-center justify-center rounded-xl bg-[#063b2c] px-3 py-2 text-xs font-bold text-[#f4cf72] hover:bg-[#094d3a] transition"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 4: PROJECTS TRACKING TAB
            ========================================================= */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Project Work Pipeline
                    </h2>
                    <p className="text-xs text-black/55">
                      Track projects from initial plot survey through final deliverable blueprints.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCustomerSelector(
                        "create_project",
                        "Select Customer for New Project",
                        "Choose a registered customer to start an official house planning project."
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                  >
                    <Plus size={16} />
                    <span>Create New Project</span>
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {requests.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-sm text-black/40 bg-white rounded-2xl border border-[#ded9cf]">
                      No active projects yet.
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-black/40">PROJECT #{req.id}</span>
                              <h3 className="font-serif text-base font-bold text-[#17221b] mt-0.5">
                                {req.full_name} Residence
                              </h3>
                              <p className="text-xs text-black/50">
                                {req.village_city}, {req.district}
                              </p>
                            </div>
                            <StatusBadge status={req.status || "Planning"} />
                          </div>

                          <div className="mt-4 rounded-xl bg-[#faf8f4] p-3 text-xs space-y-1.5 border border-[#eee7db]">
                            <div className="flex justify-between">
                              <span className="text-black/50">Plot Size:</span>
                              <span className="font-bold text-[#17221b]">
                                {req.plot_length} × {req.plot_width} {req.measurement_unit || "ft"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-black/50">Floors:</span>
                              <span className="font-bold text-[#17221b]">{req.floors || "G+1"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-black/50">Vastu Preference:</span>
                              <span className="font-bold text-[#0c7a62]">
                                {req.vastu_consultation ? "Mandatory" : "Standard"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#f0ebdf]">
                          <button
                            type="button"
                            onClick={() => openCustomerRequest(req)}
                            className="flex-1 rounded-xl bg-[#063b2c] py-2 text-xs font-bold text-white hover:bg-[#0a4d38] transition text-center"
                          >
                            Manage Project
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadPlanRequestId(req.id);
                              setUploadPlanType("rough_draft");
                              setShowUploadPlanModal(true);
                            }}
                            className="rounded-xl border border-[#0c7a62] bg-[#f0faf5] px-3 py-2 text-xs font-bold text-[#0c7a62] hover:bg-[#e2f5ec] transition"
                          >
                            Upload Plan
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 5: SITE VISITS & RESCHEDULES TAB
            ========================================================= */}
            {activeTab === "visits" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Site Visits & Reschedules
                    </h2>
                    <p className="text-xs text-black/55">
                      Owner-controlled site visits. Review client availability, accept or propose new dates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCustomerSelector(
                        "schedule_visit",
                        "Select Customer for Site Visit",
                        "Choose a registered customer to schedule or propose an on-site plot visit."
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                  >
                    <Plus size={16} />
                    <span>Propose Site Visit</span>
                  </button>
                </div>

                {/* RESCHEDULE QUEUE */}
                {pendingReschedules.length > 0 && (
                  <div className="rounded-2xl border-2 border-[#d5a842] bg-[#fffdf5] p-5 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-[#8c6710] flex items-center gap-2 mb-4">
                      <AlertTriangle size={20} />
                      <span>Action Required: Customer Reschedule Requests ({pendingReschedules.length})</span>
                    </h3>

                    <div className="grid gap-3 lg:grid-cols-2">
                      {pendingReschedules.map((visit) => {
                        const req = visit.request;
                        return (
                          <div key={visit.id} className="p-4 rounded-xl border border-[#eddcb6] bg-white shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-sm text-[#17221b]">
                                  {req?.full_name || "Customer Visit"}
                                </h4>
                                <p className="text-xs text-black/55">
                                  {req?.village_city}, {req?.district} · {req?.mobile}
                                </p>
                              </div>
                              <span className="rounded-full bg-[#fae8b2] text-[#8c6710] px-2.5 py-0.5 text-[10px] font-bold">
                                Reschedule Requested
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#faf8f4] text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-black/40">Previously Set</span>
                                <p className="font-medium text-black/70">{visit.visit_date} · {visit.visit_time}</p>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#0c7a62]">Customer Wants</span>
                                <p className="font-bold text-[#0c7a62]">
                                  {visit.customer_preferred_date || "—"} · {visit.customer_preferred_time || "—"}
                                </p>
                              </div>
                            </div>

                            {visit.customer_response_notes && (
                              <p className="text-xs italic text-black/70 bg-[#fefcf8] p-2 rounded border border-[#f5ebd6]">
                                &ldquo;{visit.customer_response_notes}&rdquo;
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleVisitResponse(
                                    "accept",
                                    visit.customer_preferred_date,
                                    visit.customer_preferred_time,
                                    visit
                                  )
                                }
                                className="flex-1 rounded-xl bg-[#0c7a62] py-2 text-xs font-bold text-white hover:bg-[#096650]"
                              >
                                Accept Customer Time
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleTarget(visit);
                                  setAdminVisitDate(visit.customer_preferred_date || "");
                                  setAdminVisitTime("");
                                  setShowVisitResponse(true);
                                }}
                                className="rounded-xl border border-[#c3b69a] bg-white px-3 py-2 text-xs font-semibold text-[#173b2e] hover:bg-[#f6f2ea]"
                              >
                                Propose Different Time
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ALL SCHEDULED VISITS */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Scheduled & Proposed Visits
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedSiteVisits.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-sm text-black/40 bg-[#faf8f4] rounded-xl border border-[#ded9cf]">
                        No scheduled or proposed visits yet.
                      </div>
                    ) : (
                      groupedSiteVisits.map(({ current: visit, history }) => {
                        const req = requests.find((r) => r.id === visit.request_id);
                        return (
                          <div
                            key={visit.id}
                            className="rounded-xl border border-[#ded9cf] p-4 bg-[#faf8f4] space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-sm text-[#17221b]">
                                  {req?.full_name || `Request #${visit.request_id}`}
                                </p>
                                <p className="text-xs text-black/50">
                                  {req?.village_city || ""}, {req?.district || ""}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    visit.status === "Confirmed"
                                      ? "bg-[#eaf4eb] text-[#24632c]"
                                      : "bg-[#fff3d6] text-[#8a641d]"
                                  }`}
                                >
                                  {visit.status || "Proposed"}
                                </span>
                                {history.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHistoryVisitModal({ current: visit, history, req })
                                    }
                                    className="rounded-full bg-[#f0ebd9] px-2 py-0.5 text-[9px] font-bold text-[#8c6710] hover:bg-[#fae8b2] transition"
                                    title="View previous visit logs for this client"
                                  >
                                    History ({history.length} prior)
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white border border-[#eee7db] text-xs">
                              <span className="text-[10px] uppercase font-bold text-black/40">Visit Slot:</span>
                              <p className="font-bold text-[#063b2c] mt-0.5">
                                📅 {visit.visit_date || "Date Pending"} · ⏰ {visit.visit_time || "Time Pending"}
                              </p>
                            </div>

                            {visit.notes && (
                              <p className="text-xs text-black/60 italic">Note: {visit.notes}</p>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              {req && (
                                <button
                                  type="button"
                                  onClick={() => openCustomerRequest(req)}
                                  className="flex-1 rounded-lg border border-[#bda76d] py-1.5 text-xs font-semibold text-[#705d35] hover:bg-white"
                                >
                                  View Request
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleTarget(visit);
                                  setAdminVisitDate(visit.visit_date || "");
                                  setAdminVisitTime(visit.visit_time || "");
                                  setShowVisitResponse(true);
                                }}
                                className="rounded-lg bg-[#063b2c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a4d38]"
                              >
                                Update Slot
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

            {/* =========================================================
                TAB 6: PLANS & DELIVERABLES MANAGEMENT TAB
            ========================================================= */}
            {activeTab === "plans" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Plans & Client Deliverables Hub
                    </h2>
                    <p className="text-xs text-black/55">
                      Upload and manage 2D rough concepts, approved HD working blueprints, and thekedar execution sheets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCustomerSelector(
                        "upload_plan",
                        "Select Customer for Deliverable Upload",
                        "Choose a registered customer to upload 2D layout drafts, blueprints, or handouts."
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#0c7a62] px-4 py-2 text-xs font-bold text-white hover:bg-[#096650]"
                  >
                    <Upload size={16} />
                    <span>+ Upload New Deliverable</span>
                  </button>
                </div>

                {/* REAL CLIENT DELIVERABLES UPLOADED TO SUPABASE */}
                {deliverablesList.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#17221b]">
                      Uploaded Client Deliverables ({deliverablesList.length})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {deliverablesList.map((deliv) => {
                        const matchedReq = requests.find((r) => r.id === deliv.request_id);
                        return (
                          <div
                            key={deliv.id}
                            className="group rounded-2xl border border-[#ded9cf] bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                              <img
                                src={deliv.file_url}
                                alt={deliv.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                              <span className="absolute right-2 top-2 rounded-full bg-[#063b2c] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                {deliv.type === "rough_draft"
                                  ? "2D Rough Draft"
                                  : deliv.type === "final_blueprint"
                                  ? "HD Blueprint"
                                  : "Mistri Sheet"}
                              </span>
                            </div>
                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-sm text-[#17221b]">{deliv.title}</h4>
                              <p className="text-xs text-black/60">
                                Client: {matchedReq?.full_name || deliv.customer_id || "Customer"}
                              </p>
                              {deliv.notes && (
                                <p className="text-xs text-black/50 italic line-clamp-2">{deliv.notes}</p>
                              )}
                              <div className="flex items-center justify-between pt-2 border-t border-[#f0ebdf]">
                                <span className="text-[10px] text-black/40">
                                  {deliv.created_at ? new Date(deliv.created_at).toLocaleDateString("en-IN") : ""}
                                </span>
                                <a
                                  href={deliv.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#0c7a62] hover:underline"
                                >
                                  View Full Image
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SAMPLE REFERENCE PORTFOLIO */}
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Portfolio Blueprints & Samples
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PORTFOLIO_ITEMS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setActivePlanPreview(plan)}
                        className="group cursor-pointer rounded-2xl border border-[#ded9cf] bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                          <img
                            src={plan.image}
                            alt={plan.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            {plan.status}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-[#17221b] group-hover:text-[#0c7a62]">
                            {plan.title}
                          </h4>
                          <p className="text-xs text-black/60">{plan.plot}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-[#f0ebdf]">
                            <span className="text-[10px] font-semibold text-[#8c6710] bg-[#faf4e6] px-2 py-0.5 rounded">
                              {plan.category}
                            </span>
                            <span className="text-xs font-bold text-[#0c7a62] flex items-center gap-1">
                              <Eye size={13} />
                              <span>Preview Map</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 7: PAYMENTS & ADVANCE TRACKING TAB
            ========================================================= */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Payments & Advance Tracking
                    </h2>
                    <p className="text-xs text-black/55">
                      Verify token advances, log UPI QR / Cash payments, and monitor billing milestones.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCustomerSelector(
                        "record_payment",
                        "Select Customer to Record Payment",
                        "Choose a registered customer to record token advance or stage payment."
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                  >
                    <Wallet size={16} />
                    <span>Record Advance Payment</span>
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5">
                    <span className="text-[10px] uppercase font-bold text-black/40">Total Advance Collected</span>
                    <h3 className="font-serif text-2xl font-bold text-[#063b2c] mt-1">
                      ₹{totalAdvanceCollected.toLocaleString("en-IN")}
                    </h3>
                    <p className="text-xs text-black/50 mt-1">Verified via UPI & On-site Cash</p>
                  </div>
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5">
                    <span className="text-[10px] uppercase font-bold text-black/40">Pending Advances</span>
                    <h3 className="font-serif text-2xl font-bold text-[#8c6710] mt-1">
                      {pendingAdvancesCount} Clients
                    </h3>
                    <p className="text-xs text-black/50 mt-1">Awaiting physical site visit</p>
                  </div>
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5">
                    <span className="text-[10px] uppercase font-bold text-black/40">Token Standard</span>
                    <h3 className="font-serif text-2xl font-bold text-[#17221b] mt-1">₹1,000 - ₹2,000</h3>
                    <p className="text-xs text-black/50 mt-1">Permits 2D concept initiation</p>
                  </div>
                </div>

                {/* PAYMENTS RECORDS TABLE */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#eeeae3] bg-[#faf8f4] text-black/50 text-[10px] uppercase font-bold tracking-wider">
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Project / Plot</th>
                          <th className="px-4 py-3">Advance Status</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Payment Method</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeae3]">
                        {paymentsList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-black/40">
                              No payment records yet. Use &ldquo;Record Advance Payment&rdquo; to log token advances.
                            </td>
                          </tr>
                        ) : (
                          paymentsList.map((p) => {
                            const req = requests.find((r) => r.id === p.request_id || r.customer_user_id === p.customer_user_id);
                            const isPaid =
                              (p.payment_status || "").toLowerCase().includes("received") ||
                              (p.payment_status || "").toLowerCase().includes("paid") ||
                              (p.payment_status || "").toLowerCase().includes("success");
                            return (
                              <tr key={p.id} className="hover:bg-[#fbf9f5]">
                                <td className="px-4 py-3.5">
                                  <p className="font-bold text-[#17221b]">
                                    {p.customer_name || req?.full_name || "Customer"}
                                  </p>
                                  <p className="text-[11px] text-black/50">{p.mobile || req?.mobile || "—"}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <p className="font-medium text-[#17221b]">
                                    {req ? `${req.plot_length} × ${req.plot_width} ${req.measurement_unit || "ft"}` : `Payment #${p.id}`}
                                  </p>
                                  <p className="text-[11px] text-black/50">{req?.village_city || p.payment_type || "Advance"}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      isPaid
                                        ? "bg-[#eaf4eb] text-[#24632c]"
                                        : "bg-[#fff3d6] text-[#8a641d]"
                                    }`}
                                  >
                                    {isPaid ? "✓ Advance Received" : `⏳ ${p.payment_status || "Pending"}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-bold text-[#17221b]">
                                  ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="px-4 py-3.5 text-black/60">
                                  <p className="font-medium">{p.payment_mode || "UPI / Cash"}</p>
                                  {p.reference_number && (
                                    <p className="text-[10px] text-black/40 font-mono">Ref: {p.reference_number}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const matchReq = req || {
                                        id: p.request_id,
                                        full_name: p.customer_name,
                                        mobile: p.mobile,
                                        customer_user_id: p.customer_user_id,
                                      };
                                      setPaymentTargetRequest(matchReq);
                                      setShowPaymentModal(true);
                                    }}
                                    className="rounded-lg border border-[#bda76d] px-3 py-1 text-xs font-semibold text-[#705d35] hover:bg-[#173b2e] hover:text-white transition"
                                  >
                                    Update Status
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 8: PUBLIC PORTFOLIO TAB
            ========================================================= */}
            {activeTab === "portfolio" && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0c7a62] mb-1">
                    <ShieldCheck size={16} />
                    <span>Client Privacy Assured</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                    Public Portfolio Showcase
                  </h2>
                  <p className="text-xs text-black/55 leading-relaxed">
                    Per Sarda Homeplan policy, private client blueprints are protected and never shown publicly without consent.
                    Below are the approved sample floor plans displayed on the website homepage for potential clients.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {PORTFOLIO_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActivePlanPreview(item)}
                      className="group cursor-pointer rounded-2xl border border-[#ded9cf] bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="rounded-full bg-[#f4ead0] text-[#8c6710] px-2.5 py-0.5 text-[10px] font-bold">
                          Live On Website
                        </span>
                        <h4 className="font-bold text-sm text-[#17221b] group-hover:text-[#0c7a62]">
                          {item.title}
                        </h4>
                        <p className="text-xs text-black/60">{item.plot} · {item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 9: NOTIFICATIONS TAB
            ========================================================= */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                      Owner Action Notifications
                    </h2>
                    <p className="text-xs text-black/55 mt-0.5">
                      Live event alerts across customer registrations, planning requests, site visit reschedules, revisions, and payments.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="rounded-xl border border-[#ded9cf] bg-[#faf8f4] px-3.5 py-2 text-xs font-semibold text-black/70 hover:bg-[#ede8dc] transition"
                    >
                      Mark All as Read
                    </button>
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[
                    { id: "all", label: "All Alerts", count: adminNotifications.length },
                    { id: "unread", label: "Unread", count: unreadNotifsCount },
                    {
                      id: "visits",
                      label: "Site Visits",
                      count: adminNotifications.filter((n) => n.actionTab === "visits").length,
                    },
                    {
                      id: "requests",
                      label: "Requests & Plans",
                      count: adminNotifications.filter(
                        (n) => n.actionTab === "requests" || n.actionTab === "plans"
                      ).length,
                    },
                    {
                      id: "payments",
                      label: "Payments",
                      count: adminNotifications.filter((n) => n.actionTab === "payments").length,
                    },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setNotificationFilter(chip.id as any)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                        notificationFilter === chip.id
                          ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                          : "border border-[#ded9cf] bg-white text-black/70 hover:bg-[#faf8f4]"
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                          notificationFilter === chip.id
                            ? "bg-white/20 text-white"
                            : "bg-black/5 text-black/60"
                        }`}
                      >
                        {chip.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div className="space-y-3 pt-2">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center text-sm text-black/40 bg-white rounded-2xl border border-[#ded9cf]">
                      No notifications found in this view.
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition shadow-sm ${
                          !notif.isRead
                            ? "border-[#bda76d] bg-[#fffdf8]"
                            : "border-[#ded9cf] bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                            notif.type === "reschedule_requested"
                              ? "bg-[#fae8b2] text-[#8c6710]"
                              : notif.type === "registration"
                              ? "bg-[#eaf5ed] text-[#0c7a62]"
                              : notif.type === "payment_received"
                              ? "bg-[#eaf5ed] text-[#0c7a62]"
                              : "bg-[#eef3f5] text-[#3d515a]"
                          }`}
                        >
                          {notif.type === "reschedule_requested" ? (
                            <AlertTriangle size={20} />
                          ) : notif.type === "registration" ? (
                            <Users size={20} />
                          ) : notif.type === "payment_received" ? (
                            <Wallet size={20} />
                          ) : (
                            <ClipboardList size={20} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#17221b]">
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="h-2 w-2 rounded-full bg-[#c2413a]" title="Unread" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${notif.badgeColor}`}
                              >
                                {notif.badge}
                              </span>
                              <span className="text-[10px] text-black/40 whitespace-nowrap">
                                {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-black/65 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                if (
                                  notif.actionUrl &&
                                  notif.actionUrl.startsWith("/admin/customers/")
                                ) {
                                  window.location.href = notif.actionUrl;
                                } else if (notif.actionTab) {
                                  setActiveTab(notif.actionTab as AdminTab);
                                }
                              }}
                              className="rounded-xl bg-[#063b2c] px-4 py-1.5 text-xs font-bold text-[#f4cf72] hover:bg-[#0a4d38] transition shadow-sm"
                            >
                              {notif.actionLabel}
                            </button>

                            {!notif.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="rounded-xl border border-[#ded9cf] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-[#faf8f4] transition"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 10: BUSINESS SETTINGS TAB
            ========================================================= */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-[#ded9cf] shadow-sm">
                  <h2 className="font-serif text-2xl font-bold text-[#17221b]">
                    Consultancy & Office Configuration
                  </h2>
                  <p className="text-xs text-black/55">
                    Operational details for Sarda Homeplan house planning consultancy.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 space-y-4">
                    <h3 className="font-bold text-sm text-[#17221b]">Consultancy Profile</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-black/50 uppercase font-bold text-[10px]">Business Name</label>
                        <input
                          value="Sarda Homeplan Consultancy"
                          readOnly
                          className="w-full mt-1 p-2.5 rounded-xl border border-[#ded9cf] bg-[#faf8f4] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-black/50 uppercase font-bold text-[10px]">Primary Region</label>
                        <input
                          value="Pratapgarh, Prayagraj, Varanasi, Gorakhpur, Patna"
                          readOnly
                          className="w-full mt-1 p-2.5 rounded-xl border border-[#ded9cf] bg-[#faf8f4]"
                        />
                      </div>
                      <div>
                        <label className="block text-black/50 uppercase font-bold text-[10px]">Default Advance Token</label>
                        <input
                          value="₹1,000 (Standard) / ₹2,000 (Commercial/G+2)"
                          readOnly
                          className="w-full mt-1 p-2.5 rounded-xl border border-[#ded9cf] bg-[#faf8f4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 space-y-4">
                    <h3 className="font-bold text-sm text-[#17221b]">Owner Policy Notes</h3>
                    <div className="rounded-xl bg-[#faf8f4] p-4 text-xs space-y-2 text-black/70 leading-relaxed border border-[#eee7db]">
                      <p>• <strong>Site Visits:</strong> Never automated; mutually confirmed by architect.</p>
                      <p>• <strong>Mistri Handout:</strong> Printed on-site or shared on WhatsApp in bilingual Hindi-English.</p>
                      <p>• <strong>Vastu Standard:</strong> North-East Ishanya (Puja/Open), South-East Agneya (Kitchen), South-West Nairutya (Master Bedroom).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          CUSTOMER REQUEST VIEW & ACTION MODAL
      ========================================================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e7dfd0] bg-[#f8f5ed] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7dfd0] bg-[#f8f5ed] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  Customer Request Details #{selectedRequest.id}
                </p>
                <h2 className="mt-0.5 font-serif text-2xl font-bold text-[#17221b]">
                  {selectedRequest.full_name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentTargetRequest(selectedRequest);
                    setPaymentAmount("1000");
                    setPaymentStatusSelect("Advance Received");
                    setShowPaymentModal(true);
                  }}
                  className="rounded-xl border border-[#d5a842] bg-[#fffbf2] px-3 py-1.5 text-xs font-semibold text-[#8c6710] hover:bg-[#fae8b2] transition"
                >
                  Record Payment
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVisitDate("");
                    setVisitTime("");
                    setVisitNotes("");
                    setShowScheduleVisit(true);
                  }}
                  className="rounded-xl border border-[#bda76d] bg-white px-3 py-1.5 text-xs font-semibold text-[#173b2e] hover:bg-[#f5f0e4] transition"
                >
                  Schedule Visit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUploadPlanRequestId(selectedRequest.id);
                    setUploadPlanType("rough_draft");
                    setUploadPlanTitle(`2D Floor Plan (Rough Draft) - ${selectedRequest.full_name}`);
                    setShowUploadPlanModal(true);
                  }}
                  className="rounded-xl bg-[#0c7a62] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#096650] transition flex items-center gap-1.5"
                >
                  <Upload size={13} />
                  <span>Upload Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b] hover:bg-[#173b2e] hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-5 p-6">
              {/* CONTACT & LOCATION */}
              <div className="rounded-2xl border border-[#e7dfd0] bg-white p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#f0ebdf] pb-2">
                  <h3 className="font-serif text-base font-bold text-[#17221b]">
                    Contact Information
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedRequest.mobile}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#063b2c] hover:underline"
                    >
                      <Phone size={13} />
                      <span>{selectedRequest.mobile}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${(selectedRequest.mobile || "").replace(/\D/g, "").slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#eaf4eb] p-1.5 text-[#0c7a62]"
                      title="WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black/40">Village / City</span>
                    <p className="font-semibold text-[#17221b] mt-0.5">
                      {selectedRequest.village_city || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black/40">District</span>
                    <p className="font-semibold text-[#17221b] mt-0.5">
                      {selectedRequest.district || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PLOT SPECIFICATIONS */}
              <div className="rounded-2xl border border-[#e7dfd0] bg-white p-5 space-y-3">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Plot & Building Specifications
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black/40">Dimensions</span>
                    <p className="font-bold text-sm text-[#17221b] mt-0.5">
                      {selectedRequest.plot_length} × {selectedRequest.plot_width} {selectedRequest.measurement_unit || "ft"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black/40">Floors</span>
                    <p className="font-bold text-sm text-[#17221b] mt-0.5">
                      {selectedRequest.floors || "1 Floor"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black/40">Vastu Requirement</span>
                    <p className="font-bold text-sm text-[#0c7a62] mt-0.5">
                      {selectedRequest.vastu_consultation ? "Yes" : "Standard"}
                    </p>
                  </div>
                </div>
              </div>

              {/* REQUIREMENTS */}
              <div className="rounded-2xl border border-[#e7dfd0] bg-white p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Requirements & Notes
                </h3>
                {selectedRequest.requirements?.includes("[Revision Request") && (
                  <div className="rounded-xl border border-[#ebd095] bg-[#fffbf2] p-3 text-xs text-[#8c6710]">
                    <span className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={14} /> Customer Revision Note:
                    </span>
                    <p className="font-medium">
                      {selectedRequest.requirements.match(/\[Revision Request[^\]]*\]:\s*([^\n\r]*)/)?.[1] ||
                        "Revision requested by customer"}
                    </p>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-black/75 bg-[#faf8f4] p-3 rounded-xl border border-[#eee7db]">
                  {selectedRequest.requirements
                    ?.replace(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:[\s\S]*?\]/g, "")
                    .replace(/\[ADMIN_PLAN_DELIVERABLE_FINAL:[\s\S]*?\]/g, "")
                    .replace(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:[\s\S]*?\]/g, "")
                    .replace(/\[ADMIN_NOTIFICATION_ENTRY:[\s\S]*?\]/g, "")
                    .replace(/\[ATTACHMENT_URL:[\s\S]*?\]/g, "")
                    .trim() || "No additional text provided."}
                </p>

                {/* Show Attachment if present */}
                {(selectedRequest.attachment_url || selectedRequest.requirements?.includes("[ATTACHMENT_URL:")) && (
                  <div className="pt-2 border-t border-[#f0ebdf]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 block mb-1.5">
                      Client Uploaded Reference / Sketch
                    </span>
                    <div className="flex items-center gap-3 bg-[#faf8f4] p-2.5 rounded-xl border border-[#eee7db]">
                      <img
                        src={
                          selectedRequest.attachment_url ||
                          selectedRequest.requirements?.match(/\[ATTACHMENT_URL:([\s\S]*?)\]/)?.[1]
                        }
                        alt="Customer Reference"
                        className="h-14 w-14 object-cover rounded-lg border border-black/10"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-[#17221b]">Rough Sketch / Photo</p>
                        <a
                          href={
                            selectedRequest.attachment_url ||
                            selectedRequest.requirements?.match(/\[ATTACHMENT_URL:([\s\S]*?)\]/)?.[1]
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0c7a62] font-bold hover:underline text-[11px] mt-0.5 inline-block"
                        >
                          View Full Screen ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STATUS UPDATER */}
              <div className="rounded-2xl border border-[#e7dfd0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-black/40">Project Workflow Status</p>
                    <p className="text-xs text-black/60">Change stage to advance client lifecycle</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRequest.status || "New Request"}
                      onChange={(e) => updateRequestStatus(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl border border-[#ddd5c7] bg-[#f8f5ed] px-3 py-2 text-xs font-bold text-[#17221b] outline-none focus:border-[#0c7a62]"
                    >
                      {WORKFLOW_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {isUpdatingStatus && (
                      <span className="text-[11px] text-black/40">Saving...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CREATE PROJECT MODAL
      ========================================================= */}
      {showCreateProject && selectedRequest && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ddcf] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  New Project Conversion
                </p>
                <h2 className="font-serif text-xl font-bold text-[#17221b]">
                  Create Project for {selectedRequest.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateProject(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Rahul Kumar - 3 BHK Duplex Villa"
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Initial Project Status
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                >
                  {WORKFLOW_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="rounded-xl border border-[#ddd5c7] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createProject}
                  disabled={isCreatingProject}
                  className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                >
                  {isCreatingProject ? "Creating..." : "Save Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SCHEDULE SITE VISIT MODAL
      ========================================================= */}
      {showScheduleVisit && selectedRequest && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ddcf] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  Site Visit Scheduling
                </p>
                <h2 className="font-serif text-xl font-bold text-[#17221b]">
                  Propose Visit for {selectedRequest.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleVisit(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17221b] mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17221b] mb-1">
                    Visit Time
                  </label>
                  <input
                    type="time"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Visit Notes (Optional)
                </label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Plot boundaries check, road width survey, tap water connection check."
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleVisit(false)}
                  className="rounded-xl border border-[#ddd5c7] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={scheduleSiteVisit}
                  disabled={isSchedulingVisit}
                  className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                >
                  {isSchedulingVisit ? "Proposing..." : "Propose Visit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PROPOSE DIFFERENT TIME (RESCHEDULE RESPONSE) MODAL
      ========================================================= */}
      {showVisitResponse && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ddcf] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  Reschedule Counter-Proposal
                </p>
                <h2 className="font-serif text-xl font-bold text-[#17221b]">
                  Propose New Slot
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVisitResponse(false);
                  setRescheduleTarget(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17221b] mb-1">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={adminVisitDate}
                    onChange={(e) => setAdminVisitDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17221b] mb-1">
                    New Time
                  </label>
                  <input
                    type="time"
                    value={adminVisitTime}
                    onChange={(e) => setAdminVisitTime(e.target.value)}
                    className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVisitResponse(false);
                    setRescheduleTarget(null);
                  }}
                  className="rounded-xl border border-[#ddd5c7] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleVisitResponse("propose", adminVisitDate, adminVisitTime, rescheduleTarget)
                  }
                  className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a4d38]"
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          UPLOAD CUSTOMER PLAN DELIVERABLE MODAL
      ========================================================= */}
      {showUploadPlanModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5ddcf] bg-[#f8f5ed] px-6 py-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  Deliverable Delivery Engine
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#17221b] mt-0.5">
                  Upload Plan for Customer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadPlanModal(false);
                  setUploadPlanImage("");
                  setUploadPlanFileName("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* SELECT REQ */}
              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Target Customer Request
                </label>
                <select
                  value={uploadPlanRequestId || ""}
                  onChange={(e) => {
                    const reqId = e.target.value;
                    setUploadPlanRequestId(reqId);
                    const found = requests.find((r) => String(r.id) === String(reqId));
                    if (found) {
                      setUploadPlanTitle(
                        uploadPlanType === "rough_draft"
                          ? `2D Floor Plan (Rough Draft) - ${found.full_name}`
                          : `Final HD Architectural Blueprint - ${found.full_name}`
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                >
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} · {r.full_name} ({r.village_city}) — {r.plot_length}x{r.plot_width} {r.measurement_unit || "ft"}
                    </option>
                  ))}
                </select>
              </div>

              {/* DELIVERABLE TYPE TABS */}
              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1.5">
                  Deliverable Category
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPlanType("rough_draft");
                      const found = requests.find((r) => String(r.id) === String(uploadPlanRequestId));
                      setUploadPlanTitle(
                        found ? `2D Floor Plan (Rough Draft) - ${found.full_name}` : "2D Floor Plan (Rough Draft)"
                      );
                    }}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      uploadPlanType === "rough_draft"
                        ? "border-[#0c7a62] bg-[#f0faf5] text-[#0c7a62] font-bold"
                        : "border-[#e5ddcf] bg-white text-black/60"
                    }`}
                  >
                    Phase 1: 2D Rough Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadPlanType("final_blueprint");
                      const found = requests.find((r) => String(r.id) === String(uploadPlanRequestId));
                      setUploadPlanTitle(
                        found
                          ? `Final HD Architectural Blueprint - ${found.full_name}`
                          : "Final HD Architectural Blueprint"
                      );
                    }}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      uploadPlanType === "final_blueprint"
                        ? "border-[#0c7a62] bg-[#f0faf5] text-[#0c7a62] font-bold"
                        : "border-[#e5ddcf] bg-white text-black/60"
                    }`}
                  >
                    Phase 2: Final Blueprint
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadPlanType("mistri_sheet");
                      const found = requests.find((r) => String(r.id) === String(uploadPlanRequestId));
                      setUploadPlanTitle(
                        found
                          ? `Thekedar / Mistri Execution Sheet - ${found.full_name}`
                          : "Thekedar / Mistri Execution Sheet"
                      );
                    }}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      uploadPlanType === "mistri_sheet"
                        ? "border-[#0c7a62] bg-[#f0faf5] text-[#0c7a62] font-bold"
                        : "border-[#e5ddcf] bg-white text-black/60"
                    }`}
                  >
                    Phase 3: Mistri Handout
                  </button>
                </div>
              </div>

              {/* TITLE & MESSAGE */}
              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Plan Display Title
                </label>
                <input
                  type="text"
                  value={uploadPlanTitle}
                  onChange={(e) => setUploadPlanTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1">
                  Architect Notes for Client
                </label>
                <textarea
                  value={uploadPlanNote}
                  onChange={(e) => setUploadPlanNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Kitchen placed in Agneya (SE) zone. Room dimensions are 14x12 ft."
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 text-xs outline-none focus:border-[#0c7a62]"
                />
              </div>

              {/* FILE PICKER */}
              <div>
                <label className="block text-xs font-bold text-[#17221b] mb-1.5">
                  Plan Blueprint Drawing (Image / Map)
                </label>
                {uploadPlanImage ? (
                  <div className="space-y-2">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#ded5c4] bg-white">
                      <img
                        src={uploadPlanImage}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="truncate font-semibold text-[#17221b]">
                        {uploadPlanFileName || "Image selected"}
                      </span>
                      <label className="cursor-pointer font-bold text-[#0c7a62] hover:underline">
                        Change File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdminPlanFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d5ccbd] bg-white p-6 text-center hover:border-[#0c7a62] transition">
                    <Upload size={24} className="text-[#0c7a62]" />
                    <p className="mt-2 text-xs font-bold text-[#17221b]">
                      Click to Browse CAD Map or Photo
                    </p>
                    <p className="text-[10px] text-black/50">PNG, JPG, WebP</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminPlanFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadPlanModal(false)}
                  className="rounded-xl border border-[#ddd5c7] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminUploadPlan}
                  disabled={isUploadingPlan || !uploadPlanImage}
                  className="rounded-xl bg-[#0c7a62] px-5 py-2 text-xs font-bold text-white hover:bg-[#096650] disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>{isUploadingPlan ? "Delivering..." : "Deliver to Customer"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          RECORD ADVANCE PAYMENT MODAL
      ========================================================= */}
      {showPaymentModal && paymentTargetRequest && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e5ddcf] bg-[#f8f5ed] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ddcf] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7732]">
                  Payment Verification
                </p>
                <h2 className="font-serif text-xl font-bold text-[#17221b]">
                  Record Advance for {paymentTargetRequest.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c7] text-sm text-[#17221b]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs">
              <div>
                <label className="block font-bold text-[#17221b] mb-1">Advance Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 font-bold text-sm outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17221b] mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 outline-none focus:border-[#0c7a62]"
                >
                  <option value="UPI / QR">PhonePe / Google Pay / UPI QR</option>
                  <option value="Cash at Site Visit">Cash Collected at Site Visit</option>
                  <option value="Bank Transfer">Bank IMPS / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17221b] mb-1">Payment Status</label>
                <select
                  value={paymentStatusSelect}
                  onChange={(e) => setPaymentStatusSelect(e.target.value as any)}
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 outline-none focus:border-[#0c7a62]"
                >
                  <option value="Advance Received">Advance Received & Verified</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Pending">Pending Payment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17221b] mb-1">
                  UPI Ref / Receipt Number (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  placeholder="e.g. UPI-928374928 or Cash receipt #12"
                  className="w-full rounded-xl border border-[#ddd5c7] bg-white p-2.5 outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border border-[#ddd5c7] bg-white px-4 py-2 font-semibold text-black/70 hover:bg-[#faf8f4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  className="rounded-xl bg-[#063b2c] px-5 py-2 font-bold text-white hover:bg-[#0a4d38]"
                >
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          HD FULL SCREEN PLAN PREVIEW MODAL
      ========================================================= */}
      {activePlanPreview && (
        <div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setActivePlanPreview(null)}
        >
          <button
            onClick={() => setActivePlanPreview(null)}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-black shadow-lg hover:bg-neutral-200"
            aria-label="Close"
          >
            ✕
          </button>
          <div
            className="relative flex max-h-[92vh] max-w-[94vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePlanPreview.image}
              alt={activePlanPreview.title}
              className="max-h-[82vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-3 rounded-full bg-black/75 px-5 py-2 text-xs font-medium text-white backdrop-blur-sm">
              <span className="font-bold text-[#f4cf72]">{activePlanPreview.title}</span>
              <span>•</span>
              <span>{activePlanPreview.plot}</span>
              <span>•</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {activePlanPreview.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          WHATSAPP DISPATCH & CUSTOMER ALERT MODAL
      ========================================================= */}
      {whatsappDispatchModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#cbe4d3] bg-[#f8fbf9] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#e1f0e6] bg-[#eef7f1] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0c7a62] text-white shadow-sm">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#dcf2e3] px-2 py-0.5 text-[10px] font-bold text-[#0c7a62]">
                      ✓ Saved & Sent to Portal
                    </span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-[#17221b] mt-0.5">
                    Send Instant WhatsApp Alert
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappDispatchModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cbd8ce] text-sm text-[#17221b] hover:bg-[#17221b] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-4 p-6 text-xs">
              <div className="rounded-2xl border border-[#d2e8d9] bg-white p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase text-black/40">Recipient Customer</p>
                <p className="text-sm font-bold text-[#17221b]">{whatsappDispatchModal.customerName}</p>
                <p className="text-xs text-black/60 flex items-center gap-1 font-mono">
                  <Phone size={12} className="text-[#0c7a62]" />
                  <span>{whatsappDispatchModal.customerMobile || "No mobile specified"}</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#17221b]">
                    Pre-filled WhatsApp Message (Editable)
                  </label>
                  <span className="text-[10px] text-black/45">Bilingual Hindi-English</span>
                </div>
                <textarea
                  value={whatsappDispatchModal.messageText}
                  onChange={(e) =>
                    setWhatsappDispatchModal({
                      ...whatsappDispatchModal,
                      messageText: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-[#cde2d4] bg-white p-3.5 text-xs text-[#17221b] leading-relaxed outline-none focus:border-[#0c7a62]"
                />
              </div>

              <div className="rounded-xl bg-[#f0faf3] p-3 text-[11px] text-[#0a523b] border border-[#d7ede0] flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-[#0c7a62]" />
                <span>
                  Alert customer dashboard me sync ho gaya hai. Niche click karke seedhe unke phone par WhatsApp bhej sakte hain.
                </span>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWhatsappDispatchModal(null)}
                  className="rounded-xl border border-[#cfdacd] bg-white px-4 py-2.5 font-semibold text-black/70 hover:bg-[#f3f7f4]"
                >
                  Skip WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = (whatsappDispatchModal.customerMobile || "")
                      .replace(/\D/g, "")
                      .slice(-10);
                    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                      whatsappDispatchModal.messageText
                    )}`;
                    window.open(url, "_blank");
                    setWhatsappDispatchModal(null);
                  }}
                  className="rounded-xl bg-[#25D366] px-5 py-2.5 font-bold text-white hover:bg-[#1faa53] transition flex items-center gap-2 shadow-sm"
                >
                  <MessageCircle size={16} />
                  <span>Send on WhatsApp 📲</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================
          CUSTOMER SELECTOR MODAL (FIX #2: NO BLIND AUTO-SELECT)
      ========================================================= */}
      {customerSelectorConfig?.isOpen && (
        <CustomerSelector
          title={customerSelectorConfig.title}
          description={customerSelectorConfig.description}
          onSelect={handleCustomerSelected}
          onCancel={() => setCustomerSelectorConfig(null)}
        />
      )}

      {/* =========================================================
          SITE VISIT DEDUPLICATION HISTORY MODAL (FIX #3 Part A)
      ========================================================= */}
      {historyVisitModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#ded9cf] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] bg-[#faf8f3] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72]">
                  <Clock3 size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Visit History: {historyVisitModal.req?.full_name || `Request #${historyVisitModal.current.request_id}`}
                  </h3>
                  <p className="text-xs text-black/55">
                    Complete chronological record of all proposed and rescheduled visits for this plot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryVisitModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ded9cf] text-black/60 hover:bg-[#ede8dc] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Current Active Visit */}
              <div className="rounded-2xl border-2 border-[#063b2c] bg-[#eef5ee] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-[#063b2c] px-2.5 py-0.5 text-[10px] font-bold text-[#f4cf72]">
                    Current Active Slot
                  </span>
                  <span className="text-xs font-bold text-[#063b2c]">
                    {historyVisitModal.current.status || "Proposed"}
                  </span>
                </div>
                <p className="font-bold text-sm text-[#17221b]">
                  📅 {historyVisitModal.current.visit_date || "Date Pending"} · ⏰ {historyVisitModal.current.visit_time || "Time Pending"}
                </p>
                {historyVisitModal.current.notes && (
                  <p className="text-xs text-black/65 mt-1 italic">
                    Note: {historyVisitModal.current.notes}
                  </p>
                )}
              </div>

              {/* Older Visits */}
              <div>
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-black/50 mb-2">
                  Previous Visit Iterations ({historyVisitModal.history.length})
                </h4>
                <div className="space-y-2">
                  {historyVisitModal.history.map((oldVisit, idx) => (
                    <div
                      key={oldVisit.id || idx}
                      className="rounded-xl border border-[#ded9cf] bg-[#faf8f4] p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-black/70">
                          Visit #{oldVisit.id} (Prior Slot)
                        </span>
                        <span className="rounded-full bg-[#ede8dc] px-2 py-0.5 text-[10px] font-semibold text-black/60">
                          {oldVisit.status || "Superceded"}
                        </span>
                      </div>
                      <p className="font-semibold text-black/80">
                        📅 {oldVisit.visit_date || "N/A"} · ⏰ {oldVisit.visit_time || "N/A"}
                      </p>
                      {oldVisit.notes && (
                        <p className="text-black/60 italic text-[11px]">Note: {oldVisit.notes}</p>
                      )}
                      {oldVisit.customer_response_notes && (
                        <p className="text-[#8c6710] text-[11px]">
                          Customer Response: &ldquo;{oldVisit.customer_response_notes}&rdquo;
                        </p>
                      )}
                      {oldVisit.created_at && (
                        <p className="text-[10px] text-black/40">
                          Recorded on: {new Date(oldVisit.created_at).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e4dfd5] bg-[#faf8f3] px-6 py-3">
              <button
                type="button"
                onClick={() => setHistoryVisitModal(null)}
                className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-[#f4cf72] hover:bg-[#0a4d38] transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   SIDEBAR NAV ITEM COMPONENT
===================================================== */
function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: IconType;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[42px] w-full items-center gap-3 rounded-xl px-3.5 text-left text-[12px] font-medium transition ${
        active
          ? "bg-[#2c5747] font-bold text-white shadow-sm"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} className={active ? "text-[#d7b56d]" : "text-white/70"} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d84f4b] px-1.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/* =====================================================
   INFO PILL COMPONENT
===================================================== */
function InfoPill({
  icon: Icon,
  text,
}: {
  icon: IconType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#ded9cf] bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-black/60 shadow-2xs">
      <Icon size={13} className="text-[#8c6710]" />
      <span>{text}</span>
    </div>
  );
}

/* =====================================================
   KPI CARD COMPONENT
===================================================== */
function KpiCard({
  icon: Icon,
  title,
  value,
  note,
  type,
  onClick,
}: {
  icon: IconType;
  title: string;
  value: string;
  note: string;
  type: "neutral" | "gold" | "soft" | "attention";
  onClick?: () => void;
}) {
  const styles = {
    neutral: {
      icon: "bg-[#eff1ee] text-[#445149]",
      border: "hover:border-[#445149]",
    },
    gold: {
      icon: "bg-[#f6f0df] text-[#866c37]",
      border: "hover:border-[#d7b56d]",
    },
    soft: {
      icon: "bg-[#eef2ee] text-[#596a5e]",
      border: "hover:border-[#596a5e]",
    },
    attention: {
      icon: "bg-[#f8eeeb] text-[#98574f]",
      border: "hover:border-[#d8aaa4]",
    },
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border border-[#ded9cf] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles[type].border}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[type].icon}`}>
          <Icon size={19} />
        </div>
        <ChevronRight size={16} className="text-black/20" />
      </div>
      <p className="mt-3 text-[11px] font-semibold text-black/50">{title}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#17221b]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-[#8c6710]">{note}</p>
    </div>
  );
}