"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CustomerProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Resolve params safely for Next.js 16
  const unwrappedParams = typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
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

  // Active Profile Section Tab
  const [activeSection, setActiveSection] = useState<
    "overview" | "requests" | "projects" | "visits" | "payments" | "deliverables" | "activity"
  >("overview");

  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

      if (profErr) throw profErr;

      let currentProfile = prof;
      const cleanMobile = prof?.mobile ? prof.mobile.replace(/\D/g, "") : "";

      // 2. Fetch Customer Requests for this customer
      let reqQuery = supabase.from("customer_requests").select("*");
      if (cleanMobile) {
        reqQuery = reqQuery.or(`customer_user_id.eq.${customerId},mobile.eq.${cleanMobile}`);
      } else {
        reqQuery = reqQuery.eq("customer_user_id", customerId);
      }
      const { data: reqList } = await reqQuery.order("created_at", { ascending: false });
      const customerRequests = reqList || [];
      setRequests(customerRequests);

      // If profile wasn't in customer_profiles but in requests, construct profile
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
      setProfile(currentProfile);

      const requestIds = customerRequests.map((r) => r.id).filter(Boolean);

      // 3. Fetch Projects
      const { data: projList } = await supabase
        .from("projects")
        .select("*")
        .eq("customer_id", customerId)
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
      if (cleanMobile) {
        payQuery = payQuery.or(`customer_user_id.eq.${customerId},mobile.eq.${cleanMobile}`);
      } else {
        payQuery = payQuery.eq("customer_user_id", customerId);
      }
      const { data: payList } = await payQuery.order("created_at", { ascending: false });
      setPayments(payList || []);

      // 7. Fetch Deliverables
      const { data: delivList } = await supabase
        .from("deliverables")
        .select("*")
        .eq("customer_id", customerId)
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
        .eq("user_id", customerId)
        .order("created_at", { ascending: false });
      setNotifications(notifList || []);
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
    return rawReq
      .replace(/\[ADMIN_PLAN_DELIVERABLE_ROUGH:[\s\S]*?\]/g, "")
      .replace(/\[ADMIN_PLAN_DELIVERABLE_FINAL:[\s\S]*?\]/g, "")
      .replace(/\[ADMIN_PLAN_DELIVERABLE_MISTRI:[\s\S]*?\]/g, "")
      .replace(/\[ADMIN_NOTIFICATION_ENTRY:[\s\S]*?\]/g, "")
      .trim() || "No custom instructions recorded.";
  };

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#17221b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#ded8cd] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
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

        {!loading && !error && profile && (
          <div className="space-y-6">
            {/* Top Customer Summary Card */}
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
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#063b2c]" />
                        <span>
                          {profile.village_city || "-"}, {profile.district || "-"}, {profile.state || "UP/Bihar"}
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
                  {profile.mobile && (
                    <a
                      href={`https://wa.me/91${profile.mobile.replace(/\D/g, "")}?text=Namaste%20${encodeURIComponent(profile.full_name || "Ji")},%20Sarda%20Homeplan%20se%20sampark%20kar%20rahe%20hain.`}
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
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "overview", label: "Profile & Requirements", count: undefined },
                { id: "requests", label: "Customer Requests", count: requests.length },
                { id: "projects", label: "Projects Tracking", count: projects.length },
                { id: "visits", label: "Site Visits & Reschedules", count: siteVisits.length },
                { id: "deliverables", label: "Plans & Deliverables", count: deliverables.length },
                { id: "payments", label: "Payments", count: payments.length },
                { id: "activity", label: "Activity & Notifications", count: notifications.length },
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

            {/* TAB CONTENT: Overview & Profile */}
            {activeSection === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Contact & Location Details */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="flex items-center gap-2 font-serif text-base font-bold text-[#17221b]">
                    <ShieldCheck size={18} className="text-[#0c7a62]" />
                    <span>Complete Profile & Contact Information</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Full Name:</span>
                      <p className="font-bold text-[#17221b] mt-0.5">{profile.full_name || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Mobile Number:</span>
                      <p className="font-bold text-[#17221b] mt-0.5">{profile.mobile || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">WhatsApp Number:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.whatsapp_number || profile.mobile || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Email Address:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5 truncate">{profile.email || "Not specified"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Village / Mohalla:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.village_city || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">District:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.district || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">State:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.state || "Bihar"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">PIN Code / Landmark:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">
                        {profile.pin_code || profile.landmark || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Property Type:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.property_type || "Residential"}</p>
                    </div>

                    <div className="rounded-xl bg-[#faf8f3] p-3">
                      <span className="text-[11px] text-black/45">Preferred Language:</span>
                      <p className="font-semibold text-[#17221b] mt-0.5">{profile.preferred_language || "Hindi"}</p>
                    </div>

                    <div className="col-span-2 rounded-xl bg-[#faf8f3] p-3 text-[11px] text-black/55 space-y-1">
                      <p>System User ID: <code className="font-mono text-black/75">{profile.id}</code></p>
                      <p>Profile Created: {formatDate(profile.created_at)}</p>
                      {profile.updated_at && <p>Last Updated: {formatDate(profile.updated_at)}</p>}
                    </div>
                  </div>
                </div>

                {/* Latest Planning Requirements */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="flex items-center gap-2 font-serif text-base font-bold text-[#17221b]">
                    <FileText size={18} className="text-[#0c7a62]" />
                    <span>Customer Requirements & Plot Details</span>
                  </h3>

                  {requests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-black/45">
                      No house planning request submitted by this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((req, idx) => (
                        <div key={req.id || idx} className="rounded-xl border border-[#e4dfd5] bg-[#faf8f3] p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-[#ede8de] pb-2">
                            <span className="font-bold text-xs text-[#063b2c]">
                              Request #{req.id} · {req.floors || "G+1"} Floor
                            </span>
                            <span className="rounded-full bg-[#063b2c] px-2 py-0.5 text-[10px] font-bold text-[#f4cf72]">
                              {req.status || "New Request"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-black/45 text-[11px]">Plot Size:</span>
                              <p className="font-bold text-[#17221b]">
                                {req.plot_length && req.plot_width
                                  ? `${req.plot_length} × ${req.plot_width} ${req.measurement_unit || "feet"}`
                                  : "Dimensions not provided"}
                              </p>
                            </div>

                            <div>
                              <span className="text-black/45 text-[11px]">Vastu Consultation:</span>
                              <p className="font-semibold text-[#17221b]">
                                {req.vastu_consultation || "Standard Vastu"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className="text-black/45 text-[11px]">Instructions / Custom Requirements:</span>
                            <p className="mt-1 rounded-lg bg-white p-2.5 text-xs leading-relaxed text-black/80 border border-[#e4dfd5]">
                              {cleanReqText(req.requirements)}
                            </p>
                          </div>

                          <div className="text-[11px] text-black/45">
                            Submitted on: {formatDate(req.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Customer Requests */}
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

                        <div className="grid sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-black/45 text-[11px]">Plot Size:</span>
                            <p className="font-semibold text-[#17221b]">{r.plot_length} × {r.plot_width} {r.measurement_unit || "feet"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[11px]">Floors:</span>
                            <p className="font-semibold text-[#17221b]">{r.floors || "G+1"}</p>
                          </div>
                          <div>
                            <span className="text-black/45 text-[11px]">Created At:</span>
                            <p className="font-semibold text-[#17221b]">{formatDate(r.created_at)}</p>
                          </div>
                        </div>

                        <div>
                          <span className="text-black/45 text-[11px]">Requirements:</span>
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

            {/* TAB CONTENT: Projects */}
            {activeSection === "projects" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Linked Projects Tracking ({projects.length})
                </h3>

                {projects.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No dedicated project record created in projects table yet.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#063b2c]">{p.project_name}</h4>
                          <span className="rounded-full bg-[#0c7a62] px-2.5 py-0.5 text-xs font-bold text-white">
                            {p.project_status || "Planning"}
                          </span>
                        </div>
                        <p className="text-xs text-black/60">
                          Plot: {p.plot_length} × {p.plot_width} {p.measurement_unit || "feet"} · {p.floors || "G+1"}
                        </p>
                        <p className="text-[11px] text-black/45">Created: {formatDate(p.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Site Visits & Reschedules */}
            {activeSection === "visits" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#17221b]">
                    Site Visits ({siteVisits.length})
                  </h3>

                  {siteVisits.length === 0 ? (
                    <div className="py-8 text-center text-xs text-black/45">
                      No site visits scheduled for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {siteVisits.map((v) => (
                        <div key={v.id} className="rounded-xl border border-[#ded9cf] bg-[#faf8f3] p-4 space-y-2">
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
                          {v.customer_preferred_date && (
                            <p className="text-xs font-bold text-[#8c6710]">
                              Preferred Reschedule: {v.customer_preferred_date} at {v.customer_preferred_time}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reschedule Requests */}
                <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#17221b]">
                    Reschedule Requests ({reschedules.length})
                  </h3>

                  {reschedules.length === 0 ? (
                    <div className="py-6 text-center text-xs text-black/45">
                      No explicit reschedule requests logged.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reschedules.map((r) => (
                        <div key={r.id} className="rounded-xl border border-[#ded9cf] bg-[#faf8f3] p-3 text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>Requested: {r.requested_date} at {r.requested_time}</span>
                            <span className="text-[#8c6710]">{r.status}</span>
                          </div>
                          {r.reason && <p className="text-black/65">Reason: {r.reason}</p>}
                          <p className="text-black/40 text-[11px]">{formatDate(r.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Deliverables */}
            {activeSection === "deliverables" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Plans & Deliverables ({deliverables.length})
                </h3>

                {deliverables.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No architectural drawings or blueprints uploaded for this customer yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {deliverables.map((deliv, idx) => (
                      <div key={deliv.id || idx} className="rounded-2xl border border-[#ded9cf] bg-[#faf8f3] overflow-hidden shadow-sm">
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

            {/* TAB CONTENT: Payments */}
            {activeSection === "payments" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Payments & Advance Receipts ({payments.length})
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
                        <p className="text-black/60">Mode: {pay.payment_mode || "UPI / QR"} {pay.reference_number ? `· Ref: ${pay.reference_number}` : ""}</p>
                        <p className="text-[11px] text-black/45">Date: {formatDate(pay.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Activity & Notifications */}
            {activeSection === "activity" && (
              <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#17221b]">
                  Customer Activity & Notifications Log ({notifications.length})
                </h3>

                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-black/45">
                    No notifications or activity logs recorded for this user.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="rounded-xl border border-[#ded9cf] bg-[#faf8f3] p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#17221b]">{notif.title}</span>
                          <span className="text-[11px] text-black/45">{formatDate(notif.created_at)}</span>
                        </div>
                        <p className="text-black/70">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
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
    </div>
  );
}
