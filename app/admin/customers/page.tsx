"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CustomerProfile {
  id: string;
  full_name: string | null;
  mobile: string | null;
  email?: string | null;
  village_city: string | null;
  district: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
  projectCount?: number;
  currentStatus?: string;
}

export default function AdminCustomersDirectoryPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const supabase = createClient();

  const fetchDirectory = async () => {
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
        .select("id, customer_user_id, mobile, status, created_at");

      // 3. Fetch projects to also cross-verify
      const { data: projects } = await supabase
        .from("projects")
        .select("id, customer_id, project_status, created_at");

      const reqList = requests || [];
      const projList = projects || [];

      // Map profiles with request counts and latest status
      const enriched: CustomerProfile[] = (profiles || []).map((prof) => {
        const cleanMobile = prof.mobile ? prof.mobile.replace(/\D/g, "") : "";

        // Find associated requests
        const matchedReqs = reqList.filter((r) => {
          if (r.customer_user_id && r.customer_user_id === prof.id) return true;
          if (cleanMobile && r.mobile && r.mobile.replace(/\D/g, "") === cleanMobile) return true;
          return false;
        });

        // Find associated projects
        const matchedProjs = projList.filter((p) => p.customer_id === prof.id);

        const projectCount = Math.max(matchedReqs.length, matchedProjs.length);

        let currentStatus = "Registered (No Request)";
        if (matchedProjs.length > 0 && matchedProjs[0].project_status) {
          currentStatus = matchedProjs[0].project_status;
        } else if (matchedReqs.length > 0 && matchedReqs[0].status) {
          currentStatus = matchedReqs[0].status;
        }

        return {
          ...prof,
          projectCount,
          currentStatus,
        };
      });

      setCustomers(enriched);
    } catch (err: any) {
      console.error("Error fetching customers directory:", err);
      setError(err?.message || "Failed to load customers directory from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  // Filter list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = c.full_name?.toLowerCase().includes(query);
        const mobileMatch = c.mobile?.includes(query);
        const cityMatch = c.village_city?.toLowerCase().includes(query);
        const distMatch = c.district?.toLowerCase().includes(query);
        if (!nameMatch && !mobileMatch && !cityMatch && !distMatch) {
          return false;
        }
      }

      // District filter
      if (districtFilter !== "ALL") {
        if (!c.district || c.district.toLowerCase() !== districtFilter.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "WITH_PROJECTS" && (c.projectCount || 0) === 0) {
          return false;
        }
        if (statusFilter === "NO_PROJECTS" && (c.projectCount || 0) > 0) {
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
              {customers.length} Registered
            </span>
          </div>

          <div className="flex items-center gap-2">
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
        {/* Intro & Architecture Distinction Card */}
        <div className="mb-6 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-[#063b2c] sm:text-lg">
                All Registered Customers ({customers.length})
              </h2>
              <p className="mt-0.5 text-xs text-black/60 sm:text-sm">
                Shows all customer accounts registered in Sarda Homeplan database (public.customer_profiles).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-3.5 py-2 text-xs font-bold text-[#f4cf72] transition hover:bg-[#094d3a]"
              >
                <FolderKanban size={14} />
                <span>View Customer Requests</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-6 grid gap-3 sm:grid-cols-12">
          {/* Search Input */}
          <div className="relative sm:col-span-6 lg:col-span-6">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, mobile number, village/city, district..."
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

          {/* Status Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#ded9cf] bg-white px-3 text-xs font-medium text-[#17221b] outline-none transition focus:border-[#063b2c]"
            >
              <option value="ALL">All Project Statuses</option>
              <option value="WITH_PROJECTS">Has Submitted Requests / Projects</option>
              <option value="NO_PROJECTS">Registered Only (No Requests)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-[#ded9cf] bg-white p-12 text-center shadow-sm">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#063b2c]" />
            <p className="mt-3 text-sm font-semibold text-black/70">
              Loading customers directory from Supabase...
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

        {/* Results List: Mobile Cards (< 768px) + Desktop Table (>= 768px) */}
        {!loading && !error && filteredCustomers.length > 0 && (
          <>
            {/* 1. Mobile Cards Layout */}
            <div className="grid gap-3.5 md:hidden">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="rounded-2xl border border-[#ded9cf] bg-white p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-[#17221b]">
                          {cust.full_name || "Registered Customer"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-black/60">
                        <MapPin size={13} className="text-[#063b2c] shrink-0" />
                        <span>
                          {cust.village_city || "Village / City"}, {cust.district || "District"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                        (cust.projectCount || 0) > 0
                          ? "border-[#cce5d4] bg-[#eaf5ed] text-[#0c7a62]"
                          : "border-[#e0ded8] bg-[#f6f4ee] text-black/55"
                      }`}
                    >
                      {cust.currentStatus || "Registered"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#faf8f3] p-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-black/45">Mobile:</span>
                      <p className="font-semibold text-[#17221b] truncate">
                        {cust.mobile || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-black/45">Projects Count:</span>
                      <p className="font-bold text-[#063b2c]">
                        {cust.projectCount || 0} Request{cust.projectCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#ede8de] flex items-center justify-between text-[11px] text-black/50">
                      <span>Registered: {formatDate(cust.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/admin/customers/${cust.id}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#063b2c] py-2.5 text-xs font-bold text-[#f4cf72] transition hover:bg-[#094d3a]"
                    >
                      <span>View Profile</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table Layout */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-[#ded9cf] bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ded9cf] bg-[#faf8f3] text-[11px] font-bold uppercase tracking-wider text-black/60">
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Registered Date</th>
                    <th className="px-5 py-3.5 text-center">Projects</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee9df]">
                  {filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="transition hover:bg-[#fbf9f4]"
                    >
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
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-[#17221b]">
                            <Phone size={12} className="text-[#063b2c]" />
                            <span>{cust.mobile || "-"}</span>
                          </div>
                          {cust.email && (
                            <div className="flex items-center gap-1 text-[11px] text-black/55">
                              <Mail size={12} />
                              <span className="truncate max-w-[150px]">{cust.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-black/75">
                          <MapPin size={13} className="text-[#063b2c] shrink-0" />
                          <span>
                            {cust.village_city ? `${cust.village_city}, ` : ""}
                            {cust.district || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-black/60">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>{formatDate(cust.created_at)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-[#f4ead0] px-2.5 py-0.5 font-bold text-[#8c6710]">
                          {cust.projectCount || 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            (cust.projectCount || 0) > 0
                              ? "border-[#cce5d4] bg-[#eaf5ed] text-[#0c7a62]"
                              : "border-[#e0ded8] bg-[#f6f4ee] text-black/55"
                          }`}
                        >
                          {cust.currentStatus || "Registered"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/customers/${cust.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#063b2c] px-3.5 py-1.5 text-xs font-bold text-[#f4cf72] shadow-sm transition hover:bg-[#094d3a]"
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
          </>
        )}
      </main>
    </div>
  );
}
