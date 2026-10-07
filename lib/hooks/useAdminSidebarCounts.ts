"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AdminSidebarCounts {
  customerRequests: number; // Actionable / pending requests
  customers: number;        // Total registered customer profiles
  projects: number;         // Active projects requiring attention
  siteVisits: number;       // Pending visits & reschedule requests
  plans: number;            // Deliverable plans requiring action
  payments: number;         // Pending / unverified payments
  notifications: number;    // Unread admin notifications
  loading: boolean;
  refreshCounts: () => Promise<void>;
}

export function useAdminSidebarCounts(readNotificationIds: string[] = []): AdminSidebarCounts {
  const [counts, setCounts] = useState<{
    customerRequests: number;
    customers: number;
    projects: number;
    siteVisits: number;
    plans: number;
    payments: number;
    notifications: number;
    loading: boolean;
  }>({
    customerRequests: 0,
    customers: 0,
    projects: 0,
    siteVisits: 0,
    plans: 0,
    payments: 0,
    notifications: 0,
    loading: true,
  });

  const supabase = createClient();

  const fetchLiveCounts = useCallback(async () => {
    try {
      // 1. Customers Directory: Total registered customers from public.customer_profiles
      const { data: profiles } = await supabase
        .from("customer_profiles")
        .select("id, full_name, mobile, created_at");

      const totalCustomers = profiles?.length || 0;

      // 2. Customer Requests: Actionable / pending customer requests
      // Actionable = not yet "Delivered" and not "Approved" (e.g. New Request, Contacted, Rough Plan, Revision)
      const { data: requests } = await supabase
        .from("customer_requests")
        .select("id, status, requirements, created_at");

      const reqList = requests || [];
      const actionableRequests = reqList.filter((r) => {
        const s = (r.status || "New Request").toLowerCase();
        return s !== "delivered" && s !== "approved" && s !== "completed";
      }).length;

      // 3. Projects Tracking: Active projects requiring admin attention
      const { data: projects } = await supabase
        .from("projects")
        .select("id, project_status");

      const projList = projects || [];
      const actionableProjects = projList.filter((p) => {
        const s = (p.project_status || "Planning").toLowerCase();
        return s !== "delivered" && s !== "completed" && s !== "closed";
      }).length;

      // 4. Site Visits & Reschedules: Pending visits or reschedule requests
      const { data: visits } = await supabase
        .from("site_visits")
        .select("id, status, customer_response, customer_preferred_date");

      const visitList = visits || [];
      const actionableVisits = visitList.filter((v) => {
        const isResched =
          v.customer_response === "Reschedule Requested" ||
          v.status === "Reschedule Requested" ||
          (v.customer_preferred_date && v.status !== "Confirmed" && v.status !== "Completed" && v.status !== "Cancelled");
        const isProposed = v.status === "Proposed";
        return isResched || isProposed;
      }).length;

      // 5. Plans & Deliverables: Requests requiring rough concept or revision upload
      const actionablePlans = reqList.filter((r) => {
        const reqText = r.requirements || "";
        const hasRevision = reqText.includes("[Revision Request");
        const s = (r.status || "").toLowerCase();
        return hasRevision || s === "revision" || s === "planning";
      }).length;

      // 6. Payments: Payments requiring admin attention/verification
      const { data: payments } = await supabase
        .from("payments")
        .select("id, payment_status");

      const payList = payments || [];
      const pendingPayments = payList.filter((p) => {
        const s = (p.payment_status || "").toLowerCase();
        return s.includes("pending") || s.includes("review");
      }).length;

      // 7. Notifications: Unread actionable admin events
      // Read IDs from localStorage if available
      let storedReadIds: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("sarda_admin_read_notifs");
          if (stored) storedReadIds = JSON.parse(stored);
        } catch (_) {}
      }
      const combinedReadSet = new Set([...readNotificationIds, ...storedReadIds]);

      // Count actionable alerts that are unread
      let unreadNotifCount = 0;

      // Customer reschedule events
      visitList.forEach((v) => {
        if (
          v.customer_response === "Reschedule Requested" ||
          v.status === "Reschedule Requested" ||
          (v.customer_preferred_date && v.status !== "Confirmed" && v.status !== "Completed")
        ) {
          const eventId = `resched-${v.id}-${v.customer_preferred_date || ""}`;
          if (!combinedReadSet.has(eventId)) unreadNotifCount += 1;
        }
      });

      // New requests submitted in last 7 days that are pending
      reqList.forEach((r) => {
        const eventId = `req-${r.id}`;
        if (!combinedReadSet.has(eventId) && (r.status === "New Request" || r.status === "Contacted")) {
          unreadNotifCount += 1;
        }
        if (r.requirements && r.requirements.includes("[Revision Request") && !combinedReadSet.has(`rev-${r.id}`)) {
          unreadNotifCount += 1;
        }
      });

      // New customer registrations that are unread
      (profiles || []).forEach((p) => {
        const eventId = `reg-${p.id}`;
        if (!combinedReadSet.has(eventId)) {
          // If registered recently and not read
          unreadNotifCount += 1;
        }
      });

      // Payments received that are unread
      payList.forEach((p) => {
        const eventId = `pay-${p.id}`;
        if (!combinedReadSet.has(eventId)) {
          unreadNotifCount += 1;
        }
      });

      setCounts({
        customerRequests: actionableRequests,
        customers: totalCustomers,
        projects: actionableProjects,
        siteVisits: actionableVisits,
        plans: actionablePlans,
        payments: pendingPayments,
        notifications: unreadNotifCount,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching admin sidebar counts:", err);
      setCounts((prev) => ({ ...prev, loading: false }));
    }
  }, [supabase, readNotificationIds]);

  useEffect(() => {
    fetchLiveCounts();

    // Setup Supabase Realtime channel for live auto-updating across tabs
    const channel = supabase
      .channel("admin-sidebar-counts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_requests" },
        () => fetchLiveCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_profiles" },
        () => fetchLiveCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchLiveCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_visits" },
        () => fetchLiveCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => fetchLiveCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLiveCounts, supabase]);

  return {
    ...counts,
    refreshCounts: fetchLiveCounts,
  };
}
