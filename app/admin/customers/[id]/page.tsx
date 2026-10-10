"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  FolderKanban,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Eye,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Star,
  Check,
  X,
  Send,
  FileImage,
  Wallet,
  History,
  Activity,
  ThumbsUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SendEmailModal from "@/components/admin/SendEmailModal";

export default function CustomerProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const hasAdminCookie =
      document.cookie.includes("sarada_admin_logged_in=true") ||
      document.cookie.includes("sarda_admin_logged_in=true");
    const hasAdminStorage =
      typeof window !== "undefined" &&
      (localStorage.getItem("sarada_admin_logged_in") === "true" ||
        localStorage.getItem("sarda_admin_logged_in") === "true");

    if (!hasAdminCookie && !hasAdminStorage) {
      router.push("/admin/login");
    }
  }, [router]);

  // Resolve params safely for Next.js 16
  const unwrappedParams =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const customerId = unwrappedParams?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer Data
  const [profile, setProfile] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [reschedules, setReschedules] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // Active Profile Section Tab
  const [activeSection, setActiveSection] = useState<
    "overview" | "requests" | "projects" | "visits" | "deliverables" | "payments" | "feedback" | "activity"
  >("overview");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  // Interactive Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    visit: any | null;
    action: "accept" | "propose" | "reject";
    proposedDate: string;
    proposedTime: string;
    reason: string;
  }>({
    isOpen: false,
    visit: null,
    action: "accept",
    proposedDate: "",
    proposedTime: "",
    reason: "",
  });

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const supabase = createClient();

  const fetchCustomerData = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Complete Profile from customer_profiles
      const { data: prof, error: profErr } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();

      let currentProfile = prof;
      const cleanMobile = prof?.mobile ? prof.mobile.replace(/\D/g, "").slice(-10) : "";

      // 2. Fetch Customer Requests for this customer
      let reqQuery = supabase.from("customer_requests").select("*");
      if (cleanMobile) {
        reqQuery = reqQuery.or(`customer_user_id.eq.${customerId},mobile.ilike.%${cleanMobile}%`);
      } else {
        reqQuery = reqQuery.eq("customer_user_id", customerId);
      }
      const { data: reqList } = await reqQuery.order("created_at", { ascending: false });
      const customerRequests = reqList || [];
      setRequests(customerRequests);

      // If profile wasn't in customer_profiles but in requests (e.g. guest request), construct profile
      if (!currentProfile && customerRequests.length > 0) {
        const topReq = customerRequests[0];
        currentProfile = {
          id: customerId,
          full_name: topReq.full_name,
          mobile: topReq.mobile,
          village_city: topReq.village_city,
          district: topReq.district,
          state: "Bihar",
          created_at: topReq.created_at,
        };
      }

      // Resolve persistent email from localStorage if not stored in DB
      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem(`sarda_cust_email_${customerId}`) ||
            (currentProfile?.mobile
              ? localStorage.getItem(`sarda_cust_email_${currentProfile.mobile.replace(/\D/g, "").slice(-10)}`)
              : null)
          : null;

      if (currentProfile) {
        if (!currentProfile.email && storedEmail) {
          currentProfile.email = storedEmail;
        }
        setCustomerEmail(currentProfile.email || storedEmail || null);
      }
      setProfile(currentProfile);

      const requestIds = customerRequests.map((r) => r.id).filter(Boolean);

      // 3. Fetch Projects
      const { data: projList } = await supabase
        .from("projects")
        .select("*")
        .or(`customer_id.eq.${customerId},${requestIds.length > 0 ? `customer_request_id.in.(${requestIds.join(",")})` : "id.is.null"}`)
        .order("created_at", { ascending: false });
      setProjects(projList || []);

      // 4. Fetch Site Visits
      if (requestIds.length > 0) {
        const { data: visits } = await supabase
          .from("site_visits")
          .select("*")
          .in("request_id", requestIds)
          .order("id", { ascending: false });
        setSiteVisits(visits || []);

        // 5. Fetch Reschedules
        const { data: rescheds } = await supabase
          .from("reschedule_requests")
          .select("*")
          .in("request_id", requestIds)
          .order("id", { ascending: false });
        setReschedules(rescheds || []);
      } else {
        setSiteVisits([]);
        setReschedules([]);
      }

      // 6. Fetch Payments
      let payQuery = supabase.from("payments").select("*");
      if (cleanMobile && requestIds.length > 0) {
        payQuery = payQuery.or(`customer_user_id.eq.${customerId},request_id.in.(${requestIds.join(",")}),mobile.ilike.%${cleanMobile}%`);
      } else if (cleanMobile) {
        payQuery = payQuery.or(`customer_user_id.eq.${customerId},mobile.ilike.%${cleanMobile}%`);
      } else {
        payQuery = payQuery.eq("customer_user_id", customerId);
      }
      const { data: payList } = await payQuery.order("created_at", { ascending: false });
      setPayments(payList || []);

      // 7. Fetch Deliverables
      const { data: delivList } = await supabase
        .from("deliverables")
        .select("*")
        .or(`customer_id.eq.${customerId},${requestIds.length > 0 ? `request_id.in.(${requestIds.join(",")})` : "id.is.null"}`)
        .order("created_at", { ascending: false });

      // Also parse deliverables embedded in requirements
      const parsedDeliverables: any[] = [...(delivList || [])];
      customerRequests.forEach((req) => {
        if (req.requirements) {
          const rough = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:([\s\S]*?)\]/);
          if (rough) {
            try {
              const item = JSON.parse(rough[1]);
              parsedDeliverables.push({
                id: `req-${req.id}-rough`,
                deliverable_type: "2D Floor Plan (Rough Draft)",
                title: item.title || "2D Floor Plan Draft",
                image_url: item.image,
                note: item.note,
                created_at: item.date || req.created_at,
              });
            } catch (_) {}
          }
          const final = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_FINAL:([\s\S]*?)\]/);
          if (final) {
            try {
              const item = JSON.parse(final[1]);
              parsedDeliverables.push({
                id: `req-${req.id}-final`,
                deliverable_type: "HD Final Blueprint",
                title: item.title || "Final Architectural Blueprint",
                image_url: item.image,
                note: item.note,
                created_at: item.date || req.created_at,
              });
            } catch (_) {}
          }
          const mistri = req.requirements.match(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:([\s\S]*?)\]/);
          if (mistri) {
            try {
              const item = JSON.parse(mistri[1]);
              parsedDeliverables.push({
                id: `req-${req.id}-mistri`,
                deliverable_type: "Mistri Site Sheet",
                title: item.title || "Mistri Construction Sheet",
                image_url: item.image,
                note: item.note,
                created_at: item.date || req.created_at,
              });
            } catch (_) {}
          }
        }
      });
      setDeliverables(parsedDeliverables);

      // 8. Fetch Notifications
      const { data: notifList } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${customerId},${requestIds.length > 0 ? `request_id.in.(${requestIds.join(",")})` : "id.is.null"}`)
        .order("created_at", { ascending: false });
      setNotifications(notifList || []);

      // 9. Fetch Feedback (from customer_feedback or notifications)
      const collectedFeedback: any[] = [];
      try {
        const { data: directFeedback } = await supabase
          .from("customer_feedback")
          .select("*")
          .or(`user_id.eq.${customerId},mobile.ilike.%${cleanMobile}%`)
          .order("created_at", { ascending: false });
        if (directFeedback && directFeedback.length > 0) {
          collectedFeedback.push(...directFeedback);
        }
      } catch (_) {}

      // Extract feedback from notifications if present
      (notifList || []).forEach((n) => {
        if (n.type === "feedback" || n.title?.includes("Feedback")) {
          const matchRating = n.title?.match(/(\d+)\/5/);
          collectedFeedback.push({
            id: `notif-${n.id}`,
            rating: matchRating ? parseInt(matchRating[1], 10) : 5,
            feedback_text: n.message,
            created_at: n.created_at,
            category: "Customer Experience",
            would_recommend: true,
          });
        }
      });

      setFeedbackList(collectedFeedback);
    } catch (err: any) {
      console.error("Error loading customer profile:", err);
      setError(err?.message || "Customer record could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return isoString;
    }
  };

  const cleanReqText = (rawReq?: string) => {
    if (!rawReq) return "No custom instructions recorded.";
    return (
      rawReq
        .replace(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:[\s\S]*?\]/g, "")
        .replace(/\[ADMIN_PLAN_DELIVERABLE_FINAL:[\s\S]*?\]/g, "")
        .replace(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:[\s\S]*?\]/g, "")
        .replace(/\[ADMIN_NOTIFICATION_ENTRY:[\s\S]*?\]/g, "")
        .trim() || "No custom instructions recorded."
    );
  };

  // Payment Financial Summaries (Section 12)
  const financialSummary = useMemo(() => {
    let totalPaid = 0;
    let advancePaid = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.payment_status === "Advance Received" || p.payment_status === "Paid") {
        totalPaid += amt;
      }
      if (p.payment_type === "Site Visit Advance" || p.payment_status === "Advance Received") {
        advancePaid += amt;
      }
    });

    const estimatedTotal = requests.length > 0 ? requests.length * 5000 : 5000;
    const totalPending = Math.max(0, estimatedTotal - totalPaid);

    return {
      totalPaid,
      advancePaid,
      totalPending,
    };
  }, [payments, requests]);

  // Unified Chronological Activity Log (Section 14)
  const unifiedActivity = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      type: "reg" | "req" | "visit" | "resched" | "plan" | "pay" | "feedback";
      icon: any;
      color: string;
    }> = [];

    // 1. Registration
    if (profile?.created_at) {
      list.push({
        id: `act-reg-${profile.id}`,
        title: "Account Registered",
        description: `Customer account created with mobile ${profile.mobile || "N/A"}.`,
        date: profile.created_at,
        type: "reg",
        icon: Users,
        color: "bg-[#063b2c] text-[#f4cf72]",
      });
    }

    // 2. Requests
    requests.forEach((r) => {
      list.push({
        id: `act-req-${r.id}`,
        title: `House Planning Request #${r.id} Submitted`,
        description: `Plot ${r.plot_length || "-"} × ${r.plot_width || "-"} ${r.measurement_unit || "feet"}, ${r.floors || "G+1"}. Status: ${r.status || "New Request"}`,
        date: r.created_at,
        type: "req",
        icon: ClipboardList,
        color: "bg-[#0c7a62] text-white",
      });
    });

    // 3. Site Visits
    siteVisits.forEach((v) => {
      list.push({
        id: `act-visit-${v.id}`,
        title: `Site Visit #${v.id} (${v.status || "Proposed"})`,
        description: `Scheduled slot: ${v.visit_date} at ${v.visit_time}. Notes: ${v.notes || "None"}`,
        date: v.created_at || profile?.created_at,
        type: "visit",
        icon: MapPin,
        color: "bg-[#d7b56d] text-[#17382c]",
      });
    });

    // 4. Reschedules
    reschedules.forEach((r) => {
      list.push({
        id: `act-resched-${r.id}`,
        title: `Reschedule Requested (${r.status || "Requested"})`,
        description: `Requested new slot: ${r.requested_date} at ${r.requested_time}. Reason: "${r.reason || "Client request"}"`,
        date: r.created_at,
        type: "resched",
        icon: Clock,
        color: "bg-[#8c6710] text-white",
      });
    });

    // 5. Deliverables
    deliverables.forEach((d) => {
      list.push({
        id: `act-deliv-${d.id}`,
        title: `Deliverable: ${d.title || d.deliverable_type}`,
        description: `${d.deliverable_type} uploaded to private repository.`,
        date: d.created_at,
        type: "plan",
        icon: FileImage,
        color: "bg-[#17382c] text-white",
      });
    });

    // 6. Payments
    payments.forEach((p) => {
      list.push({
        id: `act-pay-${p.id}`,
        title: `Payment: ₹${p.amount} (${p.payment_status || "Received"})`,
        description: `${p.payment_type || "Advance"} via ${p.payment_mode || "UPI"}. Ref: ${p.reference_number || "None"}`,
        date: p.created_at,
        type: "pay",
        icon: Wallet,
        color: "bg-[#063b2c] text-white",
      });
    });

    // 7. Feedback
    feedbackList.forEach((f) => {
      list.push({
        id: `act-feed-${f.id}`,
        title: `Customer Feedback: ${f.rating} ★`,
        description: `"${f.feedback_text || "Positive experience"}"`,
        date: f.created_at,
        type: "feedback",
        icon: Star,
        color: "bg-[#d7b56d] text-white",
      });
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [profile, requests, siteVisits, reschedules, deliverables, payments, feedbackList]);

  // Handle Reschedule Action (Accept, Propose, Reject) (Section 10)
  const handleExecuteReschedule = async () => {
    const { visit, action, proposedDate, proposedTime, reason } = rescheduleModal;
    if (!visit) return;

    setIsSubmittingAction(true);
    setActionSuccessMessage("");

    try {
      let updateVisitData: any = {};
      let rescheduleStatus = "Processed";

      if (action === "accept") {
        updateVisitData = {
          visit_date: visit.customer_preferred_date || visit.visit_date,
          visit_time: visit.customer_preferred_time || visit.visit_time,
          status: "Scheduled",
          customer_response: "Accepted",
        };
        rescheduleStatus = "Accepted";
      } else if (action === "propose") {
        if (!proposedDate || !proposedTime) {
          alert("Please select both a proposed date and time.");
          setIsSubmittingAction(false);
          return;
        }
        updateVisitData = {
          visit_date: proposedDate,
          visit_time: proposedTime,
          status: "Proposed",
          customer_response: "Pending",
          notes: reason ? `Admin proposed slot: ${reason}` : visit.notes,
        };
        rescheduleStatus = "Rescheduled";
      } else if (action === "reject") {
        updateVisitData = {
          status: "Cancelled",
          notes: reason ? `Reschedule rejected: ${reason}` : "Reschedule rejected by admin.",
        };
        rescheduleStatus = "Rejected";
      }

      // 1. Update site_visits in Supabase
      const { error: visitErr } = await supabase
        .from("site_visits")
        .update(updateVisitData)
        .eq("id", visit.id);
      if (visitErr) throw visitErr;

      // 2. Update reschedule_requests in Supabase
      await supabase
        .from("reschedule_requests")
        .update({ status: rescheduleStatus, admin_notes: reason || null })
        .eq("visit_id", visit.id);

      // 3. Log notification for customer
      await supabase.from("notifications").insert({
        user_id: customerId,
        request_id: visit.request_id,
        type: "visit",
        title: action === "accept" ? "✅ Site Visit Slot Confirmed" : action === "propose" ? "📅 New Site Visit Slot Proposed" : "❌ Visit Slot Cancelled",
        message: action === "accept"
          ? `Sarda Homeplan admin accepted your requested visit on ${updateVisitData.visit_date} at ${updateVisitData.visit_time}.`
          : action === "propose"
          ? `Admin proposed a new visit slot on ${proposedDate} at ${proposedTime}.`
          : `Requested visit slot could not be accommodated. Note: ${reason || "Please contact admin."}`,
        action_tab: "visits",
        badge: "Visit Update",
        is_read: false,
      });

      setActionSuccessMessage(
        action === "accept"
          ? "Slot accepted and scheduled successfully!"
          : action === "propose"
          ? "New slot proposed and sent to customer!"
          : "Reschedule request rejected."
      );

      setRescheduleModal({ isOpen: false, visit: null, action: "accept", proposedDate: "", proposedTime: "", reason: "" });
      await fetchCustomerData();
    } catch (err: any) {
      console.error("Reschedule update error:", err);
      alert(`Error updating reschedule: ${err.message || "Failed to save."}`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#17221b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#ded8cd] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 group mr-1"
              aria-label="Back to Admin Dashboard"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm transition group-hover:scale-105 border border-[#d9b45a]/30">
                <Image
                  src="/sarda-logo.png"
                  alt="Sarda Homeplan"
                  width={72}
                  height={72}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-3 py-1.5 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
            >
              <ArrowLeft size={15} />
              <span>Customers Directory</span>
            </Link>

            <span className="text-black/30">/</span>

            <span className="font-serif text-sm font-bold text-[#063b2c] sm:text-base">
              {profile?.full_name || "Customer Profile"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCustomerData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-white px-3 py-1.5 text-xs font-semibold text-black/75 shadow-sm transition hover:bg-[#f8f5ee]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#063b2c]" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Detail View */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-[#ded9cf] bg-white p-16 text-center shadow-sm">
            <RefreshCw size={32} className="mx-auto animate-spin text-[#063b2c]" />
            <p className="mt-3 text-sm font-bold text-black/70">
              Loading customer record from Supabase...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <AlertTriangle size={36} className="mx-auto text-red-600" />
            <h3 className="mt-3 text-base font-bold text-red-800">
              Customer Not Found or Error
            </h3>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/admin/customers"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-[#f4cf72]"
              >
                Return to Directory
              </Link>
            </div>
          </div>
        )}

        {actionSuccessMessage && (
          <div className="mb-4 rounded-xl border border-[#cce5d4] bg-[#eaf5ed] p-3 text-xs font-bold text-[#0c7a62] flex items-center justify-between">
            <span>✓ {actionSuccessMessage}</span>
            <button type="button" onClick={() => setActionSuccessMessage("")} className="text-black/40 hover:text-black">
              <X size={14} />
            </button>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6">
            {/* Top Customer Summary Card (Section 6) */}
            <div className="rounded-3xl border border-[#ded9cf] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#063b2c] text-xl font-bold font-serif text-[#f4cf72] shadow-sm">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "C"}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-serif text-2xl font-bold text-[#17221b] sm:text-3xl">
                        {profile.full_name || "Registered Customer"}
                      </h1>
                      <span className="rounded-full bg-[#e8f5ec] px-3 py-0.5 text-xs font-bold text-[#0c7a62]">
                        {requests.length > 0 ? requests[0].status || "Active Customer" : "Registered Profile"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-black/65">
                      <div className="flex items-center gap-1 font-semibold text-[#17221b]">
                        <Phone size={13} className="text-[#063b2c]" />
                        <span>{profile.mobile || "No mobile"}</span>
                      </div>
                      {profile.email ? (
                        <button
                          type="button"
                          onClick={() => setEmailModalOpen(true)}
                          className="flex items-center gap-1 font-medium text-[#063b2c] hover:underline"
                          title="Click to send email to customer"
                        >
                          <Mail size={13} className="text-[#063b2c]" />
                          <span>{profile.email}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEmailModalOpen(true)}
                          className="flex items-center gap-1 text-black/50 hover:text-[#063b2c] transition"
                          title="Click to add email and message customer"
                        >
                          <Mail size={13} />
                          <span className="italic underline underline-offset-2">Add email</span>
                        </button>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#063b2c]" />
                        <span>
                          {profile.village_city || "-"}, {profile.district || "-"}, {profile.state || "Bihar/UP"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>Joined: {formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4 py-2.5 text-xs font-bold text-[#f4cf72] shadow-sm transition hover:bg-[#0a4d38]"
                    title="Send direct email to customer"
                  >
                    <Mail size={15} />
                    <span>Send Email</span>
                  </button>

                  {profile.mobile && (
                    <a
                      href={`https://wa.me/91${profile.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Namaste ${profile.full_name || "Ji"}, Sarda Homeplan se sampark kar rahe hain.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1fb355]"
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp Chat</span>
                    </a>
                  )}

                  {profile.mobile && (
                    <a
                      href={`tel:${profile.mobile}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-4 py-2.5 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
                    >
                      <Phone size={14} />
                      <span>Call Customer</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#ede8de] pt-6 sm:grid-cols-4">
                <div className="rounded-2xl bg-[#faf8f3] p-3 text-center sm:p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                    House Planning Requests
                  </span>
                  <p className="mt-1 font-serif text-2xl font-bold text-[#063b2c]">
                    {requests.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#faf8f3] p-3 text-center sm:p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                    Active Projects
                  </span>
                  <p className="mt-1 font-serif text-2xl font-bold text-[#063b2c]">
                    {projects.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#faf8f3] p-3 text-center sm:p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                    Site Visits
                  </span>
                  <p className="mt-1 font-serif text-2xl font-bold text-[#063b2c]">
                    {siteVisits.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#faf8f3] p-3 text-center sm:p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                    Deliverable Plans
                  </span>
                  <p className="mt-1 font-serif text-2xl font-bold text-[#063b2c]">
                    {deliverables.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: "overview", label: "Profile & Requirements", count: undefined },
                { id: "requests", label: "Customer Requests", count: requests.length },
                { id: "projects", label: "Projects Tracking", count: projects.length },
                { id: "visits", label: "Site Visits & Reschedules", count: siteVisits.length },
                { id: "deliverables", label: "Plans & Deliverables", count: deliverables.length },
                { id: "payments", label: "Payments", count: payments.length },
                { id: "feedback", label: "Customer Feedback", count: feedbackList.length },
                { id: "activity", label: "Activity Timeline", count: unifiedActivity.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeSection === tab.id
                      ? "bg-[#063b2c] text-[#f4cf72] shadow-sm"
                      : "border border-[#ded9cf] bg-white text-black/70 hover:bg-[#faf8f3]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        activeSection === tab.id
                          ? "bg-[#f4cf72] text-[#063b2c]"
                          : "bg-black/10 text-black/70"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Overview & Requirements (Section 7) */}
            {activeSection === "overview" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Account Details & Registration */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                    <h3 className="font-serif text-base font-bold text-[#17221b] flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#0c7a62]" />
                      <span>Account Information</span>
                    </h3>

                    <div className="divide-y divide-[#eee9df] text-xs">
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">Customer ID</span>
                        <span className="font-mono text-[11px] font-semibold text-black/70 truncate max-w-[170px]" title={profile.id}>
                          {profile.id}
                        </span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">Primary Mobile</span>
                        <span className="font-bold text-[#17221b]">{profile.mobile || "—"}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">Village / City</span>
                        <span className="font-medium text-[#17221b]">{profile.village_city || "—"}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">District</span>
                        <span className="font-medium text-[#17221b]">{profile.district || "—"}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">Account Status</span>
                        <span className="font-bold text-[#0c7a62]">Active</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-black/50">Registration Date</span>
                        <span className="font-medium text-[#17221b]">{formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer Requirements (Section 7) */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-[#17221b] flex items-center gap-2">
                        <FileText size={18} className="text-[#063b2c]" />
                        <span>Submitted House Planning Requirements</span>
                      </h3>
                      <span className="rounded-full bg-[#f4ead0] px-2.5 py-0.5 text-xs font-bold text-[#8c6710]">
                        {requests.length} Record{requests.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {requests.length === 0 ? (
                      <div className="py-8 text-center text-xs text-black/50 bg-[#faf8f3] rounded-xl border border-dashed border-[#ded9cf]">
                        Customer has registered their profile, but has not yet submitted house-planning requirements.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {requests.map((req) => (
                          <div
                            key={req.id}
                            className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-[#ede8de] pb-2">
                              <div>
                                <span className="font-bold text-sm text-[#063b2c]">
                                  Request #{req.id} · {req.full_name}
                                </span>
                                <p className="text-[11px] text-black/50">
                                  Submitted on: {formatDate(req.created_at)}
                                </p>
                              </div>
                              <span className="rounded-full bg-[#063b2c] px-2.5 py-0.5 text-xs font-bold text-[#f4cf72]">
                                {req.status || "New Request"}
                              </span>
                            </div>

                            {/* Dimensions & Specifications */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="bg-white p-2.5 rounded-xl border border-[#ede8de]">
                                <span className="text-black/45 text-[10px] font-semibold uppercase">Plot Size</span>
                                <p className="font-bold text-sm text-[#17221b]">
                                  {req.plot_length && req.plot_width
                                    ? `${req.plot_length} × ${req.plot_width} ${req.measurement_unit || "feet"}`
                                    : "Not provided"}
                                </p>
                              </div>

                              <div className="bg-white p-2.5 rounded-xl border border-[#ede8de]">
                                <span className="text-black/45 text-[10px] font-semibold uppercase">Floors / Level</span>
                                <p className="font-bold text-sm text-[#17221b]">
                                  {req.floors || "G+1"}
                                </p>
                              </div>

                              <div className="bg-white p-2.5 rounded-xl border border-[#ede8de]">
                                <span className="text-black/45 text-[10px] font-semibold uppercase">Vastu Shastra</span>
                                <p className="font-bold text-sm text-[#17221b]">
                                  {req.vastu_consultation || "Standard Vastu"}
                                </p>
                              </div>

                              <div className="bg-white p-2.5 rounded-xl border border-[#ede8de]">
                                <span className="text-black/45 text-[10px] font-semibold uppercase">Measurement Unit</span>
                                <p className="font-bold text-sm text-[#17221b]">
                                  {req.measurement_unit || "feet"}
                                </p>
                              </div>
                            </div>

                            {/* Detailed Custom Instructions */}
                            <div>
                              <span className="text-black/50 text-[11px] font-semibold">
                                Rooms &amp; Custom Instructions:
                              </span>
                              <div className="mt-1 rounded-xl bg-white p-3 text-xs leading-relaxed text-black/80 border border-[#e4dfd5]">
                                {cleanReqText(req.requirements)}
                              </div>
                            </div>

                            {/* Uploaded Rough Sketch / Attachment (Section 7) */}
                            {req.attachment_url && (
                              <div className="pt-1">
                                <span className="text-black/50 text-[11px] font-semibold block mb-1">
                                  Uploaded Rough Sketch / Site Document:
                                </span>
                                <div
                                  onClick={() => setPreviewImage(req.attachment_url)}
                                  className="relative inline-block cursor-pointer overflow-hidden rounded-xl border border-[#ded9cf] group"
                                >
                                  <img
                                    src={req.attachment_url}
                                    alt="Uploaded Sketch"
                                    className="h-28 w-44 object-cover transition group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1">
                                    <Eye size={14} />
                                    <span>View Sketch</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Customer Requests (Section 7) */}
            {activeSection === "requests" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Submitted House Planning Requests ({requests.length})
                </h3>

                {requests.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No requests submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => (
                      <div key={r.id} className="rounded-2xl border border-[#ded9cf] p-4 bg-[#faf8f3] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ede8de] pb-2">
                          <span className="font-bold text-sm text-[#063b2c]">
                            Request #{r.id} · {r.full_name}
                          </span>
                          <span className="rounded-full bg-[#063b2c] px-2.5 py-0.5 text-xs font-bold text-[#f4cf72]">
                            {r.status || "New Request"}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-black/45 text-[11px]">Plot Dimensions:</span>
                            <p className="font-bold text-[#17221b]">{r.plot_length} × {r.plot_width} {r.measurement_unit || "feet"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[11px]">Floors:</span>
                            <p className="font-bold text-[#17221b]">{r.floors || "G+1"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[11px]">Vastu Requirement:</span>
                            <p className="font-bold text-[#17221b]">{r.vastu_consultation || "Standard Vastu"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[11px]">Submitted Date:</span>
                            <p className="font-semibold text-[#17221b]">{formatDate(r.created_at)}</p>
                          </div>
                        </div>

                        <div>
                          <span className="text-black/45 text-[11px]">Requirements / Notes:</span>
                          <p className="mt-1 rounded-xl bg-white p-3 text-xs leading-relaxed text-black/80 border border-[#ded9cf]">
                            {cleanReqText(r.requirements)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Projects Tracking (Section 8) */}
            {activeSection === "projects" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#17221b]">
                    Linked Projects ({projects.length})
                  </h3>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#063b2c] hover:underline"
                  >
                    <span>Manage all projects in Operations</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No dedicated project record created in projects table yet.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] p-5 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-base text-[#063b2c]">{p.project_name}</h4>
                          <span className="rounded-full bg-[#0c7a62] px-2.5 py-0.5 text-xs font-bold text-white">
                            {p.project_status || "Planning"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#ede8de]">
                          <div>
                            <span className="text-black/45 text-[10px] uppercase font-semibold">Dimensions</span>
                            <p className="font-bold text-[#17221b]">{p.plot_length} × {p.plot_width} {p.measurement_unit || "feet"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[10px] uppercase font-semibold">Floors</span>
                            <p className="font-bold text-[#17221b]">{p.floors || "G+1"}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-black/45">Created: {formatDate(p.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Site Visits & Reschedules (Section 9 & 10) */}
            {activeSection === "visits" && (
              <div className="space-y-6">
                {/* Prominent Current / Upcoming Visit Card (Section 9) */}
                {siteVisits.length > 0 && (
                  <div className="rounded-2xl border-2 border-[#063b2c] bg-[#eef5ee] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-[#063b2c] px-3 py-1 text-xs font-bold text-[#f4cf72] flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>Active / Upcoming Site Visit Slot</span>
                      </span>
                      <span className="text-xs font-bold text-[#063b2c]">
                        Status: {siteVisits[0].status || "Proposed"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-[#d2e2d5]">
                      <div>
                        <span className="text-black/50 text-xs">Date:</span>
                        <p className="font-bold text-base text-[#17221b]">📅 {siteVisits[0].visit_date || "Date Pending"}</p>
                      </div>
                      <div>
                        <span className="text-black/50 text-xs">Time:</span>
                        <p className="font-bold text-base text-[#17221b]">⏰ {siteVisits[0].visit_time || "Time Pending"}</p>
                      </div>
                      <div>
                        <span className="text-black/50 text-xs">Client Response:</span>
                        <p className="font-bold text-sm text-[#0c7a62]">
                          {siteVisits[0].customer_response || "Pending Confirmation"}
                        </p>
                      </div>
                    </div>

                    {siteVisits[0].notes && (
                      <p className="mt-3 text-xs text-black/70 italic bg-white/70 p-2.5 rounded-lg border border-[#d2e2d5]">
                        Note: {siteVisits[0].notes}
                      </p>
                    )}

                    {/* Reschedule banner if customer requested change */}
                    {(siteVisits[0].customer_response === "Reschedule Requested" ||
                      siteVisits[0].customer_preferred_date) && (
                      <div className="mt-4 rounded-xl border border-[#f4cf72] bg-[#fffbf0] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#8c6710]">
                          <Clock size={16} />
                          <span>Customer Requested Reschedule Slot:</span>
                        </div>
                        <p className="font-bold text-sm text-[#17221b]">
                          📅 {siteVisits[0].customer_preferred_date} at ⏰ {siteVisits[0].customer_preferred_time || "Anytime"}
                        </p>
                        {siteVisits[0].customer_response_notes && (
                          <p className="text-xs text-black/70 italic">
                            Customer Reason: &ldquo;{siteVisits[0].customer_response_notes}&rdquo;
                          </p>
                        )}

                        {/* Interactive Reschedule Actions (Section 10) */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ede8de]">
                          <button
                            type="button"
                            onClick={() =>
                              setRescheduleModal({
                                isOpen: true,
                                visit: siteVisits[0],
                                action: "accept",
                                proposedDate: siteVisits[0].customer_preferred_date || "",
                                proposedTime: siteVisits[0].customer_preferred_time || "",
                                reason: "",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-4 py-2 text-xs font-bold text-[#f4cf72] hover:bg-[#0a4d38] transition shadow-sm"
                          >
                            <Check size={14} />
                            <span>Accept Customer Slot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRescheduleModal({
                                isOpen: true,
                                visit: siteVisits[0],
                                action: "propose",
                                proposedDate: "",
                                proposedTime: "",
                                reason: "",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-white px-3.5 py-2 text-xs font-bold text-[#17221b] hover:bg-[#faf8f3] transition"
                          >
                            <Clock size={14} />
                            <span>Propose New Slot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRescheduleModal({
                                isOpen: true,
                                visit: siteVisits[0],
                                action: "reject",
                                proposedDate: "",
                                proposedTime: "",
                                reason: "",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Visit History (Section 9) */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#17221b] flex items-center gap-2">
                    <History size={17} className="text-[#063b2c]" />
                    <span>Complete Site Visit History ({siteVisits.length})</span>
                  </h3>

                  {siteVisits.length === 0 ? (
                    <div className="py-8 text-center text-xs text-black/45">
                      No site visits scheduled for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {siteVisits.map((v, idx) => (
                        <div key={v.id || idx} className="rounded-xl border border-[#ded9cf] bg-[#faf8f3] p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#063b2c]">
                              Visit #{v.id} · {v.visit_date} at {v.visit_time}
                            </span>
                            <span className="rounded-full bg-[#f4ead0] px-2.5 py-0.5 text-xs font-bold text-[#8c6710]">
                              {v.status}
                            </span>
                          </div>
                          {v.notes && <p className="text-xs text-black/70">Notes: {v.notes}</p>}
                          {v.customer_response && (
                            <p className="text-xs font-semibold text-[#0c7a62]">
                              Customer Response: {v.customer_response}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Deliverables & Blueprints (Section 11) */}
            {activeSection === "deliverables" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Architectural Blueprints &amp; Deliverables ({deliverables.length})
                </h3>

                {deliverables.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No architectural drawings or blueprints uploaded for this customer yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {deliverables.map((deliv, idx) => (
                      <div key={deliv.id || idx} className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] overflow-hidden shadow-sm flex flex-col justify-between">
                        {deliv.image_url && (
                          <div
                            onClick={() => setPreviewImage(deliv.image_url)}
                            className="relative h-44 cursor-pointer bg-black/5 overflow-hidden group"
                          >
                            <img
                              src={deliv.image_url}
                              alt={deliv.title || "Plan"}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1">
                              <Eye size={16} />
                              <span>View HD Plan</span>
                            </div>
                          </div>
                        )}
                        <div className="p-4 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#063b2c] bg-[#eef5ee] px-2 py-0.5 rounded-full">
                            {deliv.deliverable_type || "Drawing"}
                          </span>
                          <h4 className="font-bold text-sm text-[#17221b] truncate">{deliv.title}</h4>
                          {deliv.note && <p className="text-xs text-black/65 line-clamp-2">{deliv.note}</p>}
                          <p className="text-[11px] text-black/45 pt-1">{formatDate(deliv.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Payments & Advance (Section 12) */}
            {activeSection === "payments" && (
              <div className="space-y-6">
                {/* Financial Summary Cards (Section 12) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 text-center shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                      Total Paid
                    </span>
                    <p className="mt-1 font-serif text-2xl font-bold text-[#0c7a62]">
                      ₹{financialSummary.totalPaid.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 text-center shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                      Advance Paid
                    </span>
                    <p className="mt-1 font-serif text-2xl font-bold text-[#063b2c]">
                      ₹{financialSummary.advancePaid.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 text-center shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
                      Total Pending
                    </span>
                    <p className="mt-1 font-serif text-2xl font-bold text-[#c2413a]">
                      ₹{financialSummary.totalPending.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Itemized Payments List */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#17221b]">
                    Payment Records &amp; Receipts ({payments.length})
                  </h3>

                  {payments.length === 0 ? (
                    <div className="py-12 text-center text-xs text-black/45">
                      No payment records logged for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((pay) => (
                        <div key={pay.id} className="rounded-xl border border-[#ded9cf] bg-[#faf8f3] p-4 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#063b2c]">
                              ₹{pay.amount} · {pay.payment_type || "Site Visit Advance"}
                            </span>
                            <span className="rounded-full bg-[#eaf5ed] text-[#0c7a62] font-bold px-2.5 py-0.5">
                              {pay.payment_status}
                            </span>
                          </div>
                          <p className="text-black/60">
                            Mode: {pay.payment_mode || "UPI / QR"} {pay.reference_number ? `· Ref: ${pay.reference_number}` : ""}
                          </p>
                          <p className="text-[11px] text-black/45">Date: {formatDate(pay.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Customer Feedback (Section 13) */}
            {activeSection === "feedback" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b] flex items-center gap-2">
                  <Star size={18} className="text-[#d7b56d]" />
                  <span>Customer Feedback &amp; Reviews ({feedbackList.length})</span>
                </h3>

                {feedbackList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No feedback reviews submitted by this customer yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((f, idx) => (
                      <div key={f.id || idx} className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] p-5 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[#d7b56d]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < (f.rating || 5) ? "#d7b56d" : "none"}
                                className={i < (f.rating || 5) ? "text-[#d7b56d]" : "text-black/20"}
                              />
                            ))}
                            <span className="ml-1 text-xs font-bold text-[#17221b]">{f.rating || 5}/5 Stars</span>
                          </div>
                          <span className="text-[11px] text-black/45">{formatDate(f.created_at)}</span>
                        </div>

                        {f.category && (
                          <span className="inline-block rounded-full bg-[#063b2c]/10 text-[#063b2c] font-bold text-[10px] px-2.5 py-0.5">
                            Category: {f.category}
                          </span>
                        )}

                        <p className="rounded-xl bg-white p-3.5 text-xs text-black/80 leading-relaxed border border-[#ede8de]">
                          &ldquo;{f.feedback_text}&rdquo;
                        </p>

                        {f.would_recommend !== undefined && (
                          <div className="flex items-center gap-1.5 text-xs text-[#0c7a62] font-semibold">
                            <ThumbsUp size={13} />
                            <span>Customer recommends Sarda Homeplan</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Activity Timeline (Section 14) */}
            {activeSection === "activity" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b] flex items-center gap-2">
                  <Activity size={18} className="text-[#063b2c]" />
                  <span>Chronological Customer Activity Log ({unifiedActivity.length})</span>
                </h3>

                {unifiedActivity.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No activity recorded yet.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ded9cf]">
                    {unifiedActivity.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={item.id} className="relative space-y-1">
                          <div className={`absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] shadow-sm ${item.color}`}>
                            <ItemIcon size={11} />
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-[#17221b]">{item.title}</h4>
                            <span className="text-[11px] text-black/45">{formatDate(item.date)}</span>
                          </div>
                          <p className="text-xs text-black/65">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reschedule Action Modal (Section 10) */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#ded9cf] bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#17221b]">
              {rescheduleModal.action === "accept"
                ? "Accept Customer Reschedule Slot"
                : rescheduleModal.action === "propose"
                ? "Propose New Visit Slot"
                : "Reject Reschedule Request"}
            </h3>

            {rescheduleModal.action === "accept" && (
              <p className="text-xs text-black/70">
                Are you sure you want to confirm this site visit on{" "}
                <strong>{rescheduleModal.proposedDate}</strong> at{" "}
                <strong>{rescheduleModal.proposedTime || "TBD"}</strong>?
              </p>
            )}

            {rescheduleModal.action === "propose" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-black/60 font-semibold mb-1">Proposed Date:</label>
                  <input
                    type="date"
                    value={rescheduleModal.proposedDate}
                    onChange={(e) =>
                      setRescheduleModal((prev) => ({ ...prev, proposedDate: e.target.value }))
                    }
                    className="h-10 w-full rounded-xl border border-[#ded9cf] px-3 outline-none focus:border-[#063b2c]"
                  />
                </div>
                <div>
                  <label className="block text-black/60 font-semibold mb-1">Proposed Time Slot:</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={rescheduleModal.proposedTime}
                    onChange={(e) =>
                      setRescheduleModal((prev) => ({ ...prev, proposedTime: e.target.value }))
                    }
                    className="h-10 w-full rounded-xl border border-[#ded9cf] px-3 outline-none focus:border-[#063b2c]"
                  />
                </div>
                <div>
                  <label className="block text-black/60 font-semibold mb-1">Notes / Reason:</label>
                  <textarea
                    rows={2}
                    placeholder="Optional message to client..."
                    value={rescheduleModal.reason}
                    onChange={(e) =>
                      setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#ded9cf] p-2.5 outline-none focus:border-[#063b2c]"
                  />
                </div>
              </div>
            )}

            {rescheduleModal.action === "reject" && (
              <div className="space-y-3 text-xs">
                <p className="text-black/70">
                  Please provide a reason for rejecting this slot:
                </p>
                <textarea
                  rows={3}
                  placeholder="Reason for rejection..."
                  value={rescheduleModal.reason}
                  onChange={(e) =>
                    setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#ded9cf] p-2.5 outline-none focus:border-[#063b2c]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ede8de]">
              <button
                type="button"
                onClick={() =>
                  setRescheduleModal({ isOpen: false, visit: null, action: "accept", proposedDate: "", proposedTime: "", reason: "" })
                }
                className="rounded-xl border border-[#ded9cf] px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#faf8f3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReschedule}
                disabled={isSubmittingAction}
                className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-[#f4cf72] hover:bg-[#0a4d38] disabled:opacity-50"
              >
                {isSubmittingAction ? "Saving..." : "Confirm & Update Supabase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal (Section 11) */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2">
            <img
              src={previewImage}
              alt="Deliverable HD Preview"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <div className="p-3 text-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-xl bg-[#063b2c] px-4 py-1.5 text-xs font-bold text-[#f4cf72]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT CUSTOMER EMAIL DISPATCH MODAL */}
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        customer={
          profile
            ? {
                id: profile.id || customerId,
                full_name: profile.full_name || "Customer",
                mobile: profile.mobile || "",
                email: profile.email || customerEmail || "",
                village_city: profile.village_city || "",
                district: profile.district || "",
              }
            : null
        }
        onEmailSaved={(savedEmail) => {
          setCustomerEmail(savedEmail);
          setProfile((prev: any) => (prev ? { ...prev, email: savedEmail } : prev));
        }}
      />
    </div>
  );
}
