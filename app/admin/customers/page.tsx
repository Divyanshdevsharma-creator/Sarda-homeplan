"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  FolderKanban,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  MessageCircle,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SendEmailModal from "@/components/admin/SendEmailModal";

export interface CustomerDirectoryItem {
  id: string;
  full_name: string | null;
  mobile: string | null;
  email?: string | null;
  village_city: string | null;
  district: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
  projectsCount: number;
  requestsCount: number;
  visitsCount: number;
  paymentsCount: number;
  currentStatus: string;
  accountStatus: "Active" | "New";
  hasUpcomingVisit: boolean;
  hasPendingRequest: boolean;
  paymentPending: boolean;
  isRegisteredProfile: boolean;
}

export default function AdminCustomersDirectoryPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [emailModalCustomer, setEmailModalCustomer] = useState<CustomerDirectoryItem | null>(null);

  const handleEmailSaved = (customerId: string, email: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, email } : c))
    );
  };

  const supabase = createClient();

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

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch ALL registered customers from public.customer_profiles
      const { data: profiles, error: profErr } = await supabase
        .from("customer_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profErr) throw profErr;

      // 2. Fetch customer_requests to calculate project count and current status
      const { data: requests } = await supabase
        .from("customer_requests")
        .select("id, customer_user_id, full_name, mobile, village_city, district, status, created_at");

      // 3. Fetch projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, customer_id, customer_request_id, project_name, project_status, created_at");

      // 4. Fetch site_visits
      const { data: siteVisits } = await supabase
        .from("site_visits")
        .select("id, request_id, visit_date, visit_time, status, customer_response");

      // 5. Fetch payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, request_id, customer_user_id, mobile, amount, payment_status");

      const profList = profiles || [];
      const reqList = requests || [];
      const projList = projects || [];
      const visitList = siteVisits || [];
      const payList = payments || [];

      // Map profiles with live cross-table associations
      const enrichedProfiles: CustomerDirectoryItem[] = profList.map((prof) => {
        const cleanMobile = prof.mobile ? prof.mobile.replace(/\D/g, "").slice(-10) : "";

        // Associated requests
        const matchedReqs = reqList.filter((r) => {
          if (r.customer_user_id && r.customer_user_id === prof.id) return true;
          const rClean = r.mobile ? r.mobile.replace(/\D/g, "").slice(-10) : "";
          if (cleanMobile && rClean && cleanMobile === rClean) return true;
          return false;
        });
        const reqIds = matchedReqs.map((r) => r.id);

        // Associated projects
        const matchedProjs = projList.filter(
          (p) => p.customer_id === prof.id || (p.customer_request_id && reqIds.includes(p.customer_request_id))
        );

        // Associated site visits
        const matchedVisits = visitList.filter((v) => reqIds.includes(v.request_id));

        // Associated payments
        const matchedPays = payList.filter((py) => {
          if (py.customer_user_id && py.customer_user_id === prof.id) return true;
          if (py.request_id && reqIds.includes(py.request_id)) return true;
          const pyClean = py.mobile ? py.mobile.replace(/\D/g, "").slice(-10) : "";
          if (cleanMobile && pyClean && cleanMobile === pyClean) return true;
          return false;
        });

        // Determine current status
        let currentStatus = "Registered";
        if (matchedProjs.length > 0 && matchedProjs[0].project_status) {
          currentStatus = matchedProjs[0].project_status;
        } else if (matchedReqs.length > 0 && matchedReqs[0].status) {
          currentStatus = matchedReqs[0].status;
        }

        // Flags for filter criteria
        const hasUpcomingVisit = matchedVisits.some(
          (v) => v.status === "Proposed" || v.status === "Confirmed" || v.status === "Scheduled"
        );
        const hasPendingRequest = matchedReqs.some((r) => {
          const s = (r.status || "").toLowerCase();
          return s !== "delivered" && s !== "approved" && s !== "completed";
        });
        const paymentPending =
          matchedReqs.length > 0 &&
          !matchedPays.some((p) => p.payment_status === "Advance Received" || p.payment_status === "Paid");

        // Is account new (registered within 30 days)
        const isNew = prof.created_at
          ? Date.now() - new Date(prof.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
          : false;

        const storedEmail =
          typeof window !== "undefined"
            ? localStorage.getItem(`sarda_cust_email_${prof.id}`) ||
              (cleanMobile ? localStorage.getItem(`sarda_cust_email_${cleanMobile}`) : null)
            : null;
        const resolvedEmail = prof.email || storedEmail || null;

        return {
          id: prof.id,
          full_name: prof.full_name || "Registered Customer",
          mobile: prof.mobile,
          email: resolvedEmail,
          village_city: prof.village_city,
          district: prof.district,
          avatar_url: prof.avatar_url,
          created_at: prof.created_at,
          updated_at: prof.updated_at,
          projectsCount: matchedProjs.length,
          requestsCount: matchedReqs.length,
          visitsCount: matchedVisits.length,
          paymentsCount: matchedPays.length,
          currentStatus,
          accountStatus: isNew ? "New" : "Active",
          hasUpcomingVisit,
          hasPendingRequest,
          paymentPending,
          isRegisteredProfile: true,
        };
      });

      // Also ensure any guest request not yet linked to customer_profiles is included
      const existingMobiles = new Set(
        enrichedProfiles.map((p) => (p.mobile ? p.mobile.replace(/\D/g, "").slice(-10) : "")).filter(Boolean)
      );

      reqList.forEach((r) => {
        const cleanR = r.mobile ? r.mobile.replace(/\D/g, "").slice(-10) : "";
        if (cleanR && !existingMobiles.has(cleanR)) {
          existingMobiles.add(cleanR);
          const matchedProjs = projList.filter((p) => p.customer_request_id === r.id);
          const matchedVisits = visitList.filter((v) => v.request_id === r.id);
          const matchedPays = payList.filter((py) => py.request_id === r.id);

          const storedGuestEmail =
            typeof window !== "undefined"
              ? (cleanR ? localStorage.getItem(`sarda_cust_email_${cleanR}`) : null) ||
                (r.customer_user_id ? localStorage.getItem(`sarda_cust_email_${r.customer_user_id}`) : null)
              : null;
          const resolvedGuestEmail = (r as any).email || storedGuestEmail || null;

          enrichedProfiles.push({
            id: r.customer_user_id || `req-${r.id}`,
            full_name: r.full_name,
            mobile: r.mobile,
            email: resolvedGuestEmail,
            village_city: r.village_city,
            district: r.district,
            created_at: r.created_at,
            projectsCount: Math.max(matchedProjs.length, 1),
            requestsCount: 1,
            visitsCount: matchedVisits.length > 0 ? matchedVisits.length : 1,
            paymentsCount: matchedPays.length,
            currentStatus: r.status || "Rough Plan",
            accountStatus: "Active",
            hasUpcomingVisit: matchedVisits.some((v) => v.status === "Proposed" || v.status === "Confirmed"),
            hasPendingRequest: true,
            paymentPending: matchedPays.length === 0,
            isRegisteredProfile: false,
          });
        }
      });

      setCustomers(enrichedProfiles);
    } catch (err: any) {
      console.error("Error fetching customers directory:", err);
      setError(err?.message || "Failed to load customers directory from Supabase.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDirectory();

    // Supabase Realtime Subscription for live updates
    const channel = supabase
      .channel("admin-customers-directory-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_profiles" }, () => fetchDirectory())
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_requests" }, () => fetchDirectory())
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => fetchDirectory())
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visits" }, () => fetchDirectory())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchDirectory())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDirectory, supabase]);

  // Filter list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Search text (Full Name, Mobile, Email, Village/City, District)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = c.full_name?.toLowerCase().includes(query);
        const mobileMatch = c.mobile?.toLowerCase().includes(query);
        const emailMatch = c.email?.toLowerCase().includes(query);
        const cityMatch = c.village_city?.toLowerCase().includes(query);
        const distMatch = c.district?.toLowerCase().includes(query);
        if (!nameMatch && !mobileMatch && !emailMatch && !cityMatch && !distMatch) {
          return false;
        }
      }

      // 2. District filter
      if (districtFilter !== "ALL") {
        if (!c.district || c.district.toLowerCase() !== districtFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Status filter (Section 5 requirements)
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && c.projectsCount === 0 && c.requestsCount === 0 && c.visitsCount === 0) {
          return false;
        }
        if (statusFilter === "NEW" && c.accountStatus !== "New") {
          return false;
        }
        if (statusFilter === "HAS_PROJECT" && c.projectsCount === 0) {
          return false;
        }
        if (statusFilter === "PENDING_REQUEST" && !c.hasPendingRequest) {
          return false;
        }
        if (statusFilter === "UPCOMING_VISIT" && !c.hasUpcomingVisit) {
          return false;
        }
        if (statusFilter === "PAYMENT_PENDING" && !c.paymentPending) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchQuery, districtFilter, statusFilter]);

  // Unique districts for filter
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.district) set.add(c.district);
    });
    return Array.from(set);
  }, [customers]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#17221b]">
      {/* Top Navigation Bar */}
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
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-3 py-1.5 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
            >
              <ArrowLeft size={15} />
              <span>Admin Dashboard</span>
            </Link>

            <span className="text-black/30">/</span>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#063b2c] text-[#f4cf72]">
                <Users size={16} />
              </div>
              <h1 className="font-serif text-lg font-bold text-[#17221b] sm:text-xl">
                Customers Directory
              </h1>
            </div>

            <span className="rounded-full bg-[#063b2c] px-2.5 py-0.5 text-xs font-bold text-[#f4cf72]">
              {customers.length} Customers
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-[#ded9cf] bg-[#faf8f4] p-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "cards" ? "bg-[#063b2c] text-[#f4cf72] shadow-sm" : "text-black/60 hover:text-black"
                }`}
                title="Card View"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === "table" ? "bg-[#063b2c] text-[#f4cf72] shadow-sm" : "text-black/60 hover:text-black"
                }`}
                title="Table View"
              >
                <TableIcon size={14} />
                <span>Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={fetchDirectory}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-white px-3 py-1.5 text-xs font-semibold text-black/75 shadow-sm transition hover:bg-[#f8f5ee] disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#063b2c]" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Intro & Live Summary Bar */}
        <div className="mb-6 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#eef5ee] border border-[#d2e2d5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#063b2c]">
                  Direct Supabase public.customer_profiles
                </span>
                <span className="text-xs text-black/40">•</span>
                <span className="text-xs font-semibold text-[#0c7a62]">Live Synchronized</span>
              </div>
              <h2 className="mt-1 font-serif text-base font-bold text-[#063b2c] sm:text-lg">
                Complete Customer Directory ({customers.length})
              </h2>
              <p className="mt-0.5 text-xs text-black/60">
                Primary business admin interface for managing all Sarda Homeplan customers, house-planning requests, site visits and payments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-3.5 py-2 text-xs font-bold text-[#f4cf72] transition hover:bg-[#094d3a]"
              >
                <FolderKanban size={14} />
                <span>Go to Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar (Section 4 & 5) */}
        <div className="mb-6 grid gap-3 sm:grid-cols-12">
          {/* Search Input */}
          <div className="relative sm:col-span-5 lg:col-span-5">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, mobile, email, village/city, district..."
              className="h-11 w-full rounded-xl border border-[#ded9cf] bg-white pl-10 pr-4 text-xs text-[#17221b] placeholder-black/40 outline-none transition focus:border-[#063b2c] focus:ring-1 focus:ring-[#063b2c]"
            />
          </div>

          {/* District Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#ded9cf] bg-white px-3 text-xs font-medium text-[#17221b] outline-none transition focus:border-[#063b2c]"
            >
              <option value="ALL">All Districts ({uniqueDistricts.length})</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Useful Filters (Section 5) */}
          <div className="sm:col-span-4 lg:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#ded9cf] bg-white px-3 text-xs font-medium text-[#17221b] outline-none transition focus:border-[#063b2c]"
            >
              <option value="ALL">All Customers</option>
              <option value="ACTIVE">Active (With Projects / Requests)</option>
              <option value="NEW">New (Registered in last 30 days)</option>
              <option value="HAS_PROJECT">Has Project</option>
              <option value="PENDING_REQUEST">Has Pending Request</option>
              <option value="UPCOMING_VISIT">Has Upcoming Visit</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-[#ded9cf] bg-white p-12 text-center shadow-sm">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#063b2c]" />
            <p className="mt-3 text-sm font-semibold text-black/70">
              Loading customers directory from Supabase public.customer_profiles...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <AlertCircle size={32} className="mx-auto text-red-600" />
            <h3 className="mt-2 text-sm font-bold text-red-800">
              Error Loading Customers Directory
            </h3>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchDirectory}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-800 transition"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-[#ded9cf] bg-white p-12 text-center shadow-sm">
            <Users size={36} className="mx-auto text-black/30" />
            <h3 className="mt-3 font-serif text-lg font-bold text-[#17221b]">
              No Customers Found
            </h3>
            <p className="mt-1 text-xs text-black/55">
              {searchQuery || districtFilter !== "ALL" || statusFilter !== "ALL"
                ? "No registered customers matched your search or filters."
                : "No registered customers in customer_profiles table yet."}
            </p>
            {(searchQuery || districtFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDistrictFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-4 py-2 text-xs font-bold text-[#17221b] hover:bg-[#ede8dc] transition"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Results List: Cards Layout (Section 3) OR Table Layout */}
        {!loading && !error && filteredCustomers.length > 0 && (
          <>
            {viewMode === "cards" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#0c7a62]/40 flex flex-col justify-between space-y-4"
                  >
                    {/* Header: Name, Location, Status */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72] font-serif font-bold text-base shadow-sm">
                            {cust.full_name ? cust.full_name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div>
                            <h3 className="font-serif text-base font-bold text-[#17221b]">
                              {cust.full_name || "Registered Customer"}
                            </h3>
                            <p className="text-xs font-semibold text-[#063b2c]">
                              {cust.mobile || "No Mobile"}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full border border-[#cce5d4] bg-[#eaf5ed] px-2.5 py-0.5 text-[10px] font-bold text-[#0c7a62] shrink-0">
                          {cust.currentStatus || "Active"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-black/60 pt-1">
                        <MapPin size={13} className="text-[#063b2c] shrink-0" />
                        <span className="truncate">
                          {cust.village_city || "Village / City"}, {cust.district || "District"}
                        </span>
                      </div>
                    </div>

                    {/* Three Core Metrics (Section 3 Specification) */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#faf8f3] p-3 text-center border border-[#ede8de]">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                          Projects
                        </span>
                        <p className="mt-0.5 font-bold text-sm text-[#063b2c]">
                          {cust.projectsCount}
                        </p>
                      </div>

                      <div className="border-x border-[#ede8de]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                          Requests
                        </span>
                        <p className="mt-0.5 font-bold text-sm text-[#063b2c]">
                          {cust.requestsCount}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                          Visits
                        </span>
                        <p className="mt-0.5 font-bold text-sm text-[#063b2c]">
                          {cust.visitsCount}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions: WhatsApp / Call + [ View Profile ] */}
                    <div className="space-y-2 pt-1 border-t border-[#f0ebdf]">
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* WhatsApp */}
                        {cust.mobile ? (
                          <a
                            href={`https://wa.me/91${cust.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                              `Namaste ${cust.full_name || "Ji"}, Sarda Homeplan se sampark kar rahe hain.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-1.5 text-[11px] font-bold text-white hover:bg-[#1fb355] transition shadow-xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] py-1.5 text-[11px] font-medium text-black/35 cursor-not-allowed"
                            title="No mobile available"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {/* Email — Direct Mail to Customer */}
                        <button
                          type="button"
                          onClick={() => setEmailModalCustomer(cust)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#063b2c]/35 bg-[#f3f8f5] py-1.5 text-[11px] font-bold text-[#063b2c] hover:bg-[#063b2c] hover:text-[#f4cf72] transition shadow-xs cursor-pointer"
                          title={
                            cust.email
                              ? `Direct Email to ${cust.full_name || "Customer"} (${cust.email})`
                              : `Direct Email to ${cust.full_name || "Customer"}`
                          }
                        >
                          <Mail size={13} />
                          <span>Email</span>
                        </button>

                        {/* Call */}
                        {cust.mobile ? (
                          <a
                            href={`tel:${cust.mobile}`}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#ded9cf] bg-white py-1.5 text-[11px] font-bold text-[#17221b] hover:bg-[#faf8f4] hover:border-[#063b2c]/40 transition shadow-xs"
                            title={`Call ${cust.mobile}`}
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] py-1.5 text-[11px] font-medium text-black/35 cursor-not-allowed"
                            title="No mobile available"
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </button>
                        )}
                      </div>

                      <Link
                        href={`/admin/customers/${cust.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#063b2c] py-2.5 text-xs font-bold text-[#f4cf72] transition hover:bg-[#094d3a] shadow-sm"
                      >
                        <span>View Profile</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table Layout */
              <div className="overflow-hidden rounded-2xl border border-[#ded9cf] bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ded9cf] bg-[#faf8f3] text-[11px] font-bold uppercase tracking-wider text-black/60">
                      <th className="px-5 py-3.5">Customer Name</th>
                      <th className="px-5 py-3.5">Contact Details</th>
                      <th className="px-5 py-3.5">Location</th>
                      <th className="px-5 py-3.5 text-center">Projects</th>
                      <th className="px-5 py-3.5 text-center">Requests</th>
                      <th className="px-5 py-3.5 text-center">Visits</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee9df]">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="transition hover:bg-[#fbf9f4]">
                        <td className="px-5 py-4 font-bold text-sm text-[#17221b]">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#063b2c]/10 text-[#063b2c] font-bold text-xs uppercase">
                              {cust.full_name ? cust.full_name.charAt(0) : "C"}
                            </div>
                            <div>
                              <span>{cust.full_name || "Registered Customer"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#17221b]">{cust.mobile || "-"}</p>
                          {cust.email ? (
                            <button
                              type="button"
                              onClick={() => setEmailModalCustomer(cust)}
                              className="mt-0.5 text-[11px] text-[#063b2c] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              title={`Direct Email to ${cust.full_name || "Customer"}`}
                            >
                              <Mail size={11} />
                              <span>{cust.email}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEmailModalCustomer(cust)}
                              className="mt-0.5 text-[10px] text-[#0c7a62] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              title="Send Email to customer"
                            >
                              <Mail size={11} />
                              <span>+ Send Email</span>
                            </button>
                          )}
                        </td>

                        <td className="px-5 py-4 text-black/70">
                          {cust.village_city || "-"}, {cust.district || "-"}
                        </td>

                        <td className="px-5 py-4 text-center font-bold text-[#063b2c]">
                          {cust.projectsCount}
                        </td>

                        <td className="px-5 py-4 text-center font-bold text-[#063b2c]">
                          {cust.requestsCount}
                        </td>

                        <td className="px-5 py-4 text-center font-bold text-[#063b2c]">
                          {cust.visitsCount}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full border border-[#cce5d4] bg-[#eaf5ed] px-2.5 py-0.5 text-[10px] font-bold text-[#0c7a62]">
                            {cust.currentStatus || "Active"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/customers/${cust.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-[#f4cf72] hover:bg-[#094d3a] transition shadow-sm"
                          >
                            <span>View Profile</span>
                            <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* DIRECT EMAIL MODAL */}
      <SendEmailModal
        isOpen={Boolean(emailModalCustomer)}
        onClose={() => setEmailModalCustomer(null)}
        customer={emailModalCustomer}
        onEmailSaved={handleEmailSaved}
      />
    </div>
  );
}
