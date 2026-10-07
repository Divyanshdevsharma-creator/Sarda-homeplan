export interface AdminNotificationItem {
  id: string;
  type:
    | "registration"
    | "request"
    | "project"
    | "visit_requested"
    | "reschedule_requested"
    | "visit_availability"
    | "feedback"
    | "revision_requested"
    | "plan_approved"
    | "payment_received"
    | "payment_pending";
  title: string;
  message: string;
  customerName: string;
  customerMobile?: string;
  actionTab: string;
  actionUrl?: string;
  actionLabel: string;
  badge: string;
  badgeColor: string;
  createdAt: string;
  isRead: boolean;
}

export function generateAdminNotifications({
  customerProfiles = [],
  requests = [],
  siteVisits = [],
  projects = [],
  payments = [],
  readIds = [],
}: {
  customerProfiles?: any[];
  requests?: any[];
  siteVisits?: any[];
  projects?: any[];
  payments?: any[];
  readIds?: string[];
}): AdminNotificationItem[] {
  const readSet = new Set(readIds);
  const notifs: AdminNotificationItem[] = [];

  const reqMap = new Map((requests || []).map((r) => [r.id, r]));

  // 1. Site Visit Reschedule Requests (High Priority)
  (siteVisits || []).forEach((v) => {
    const isReschedule =
      v.customer_response === "Reschedule Requested" ||
      v.status === "Reschedule Requested" ||
      (v.customer_preferred_date && v.status !== "Confirmed" && v.status !== "Completed" && v.status !== "Cancelled");

    if (isReschedule) {
      const targetReq = reqMap.get(v.request_id);
      const custName = targetReq?.full_name || "Customer";
      const id = `resched-${v.id}-${v.customer_preferred_date || ""}`;

      notifs.push({
        id,
        type: "reschedule_requested",
        title: `Site Visit Reschedule Requested by ${custName}`,
        message: `${custName} (${targetReq?.village_city || "Location"}) has requested to change the site visit slot to ${v.customer_preferred_date || "Date"} at ${v.customer_preferred_time || "Time"}.${v.customer_response_notes ? ` Note: "${v.customer_response_notes}"` : ""}`,
        customerName: custName,
        customerMobile: targetReq?.mobile,
        actionTab: "visits",
        actionUrl: `/admin`,
        actionLabel: "Review Reschedule",
        badge: "Reschedule Request",
        badgeColor: "bg-[#fae8b2] text-[#8c6710]",
        createdAt: v.customer_responded_at || v.created_at || new Date().toISOString(),
        isRead: readSet.has(id),
      });
    }

    // 1b. Customer Updates Availability (Accepted Visit)
    if (v.customer_response === "Accepted" && v.customer_responded_at) {
      const targetReq = reqMap.get(v.request_id);
      const custName = targetReq?.full_name || "Customer";
      const id = `visit-accepted-${v.id}`;

      notifs.push({
        id,
        type: "visit_availability",
        title: `Site Visit Confirmed by ${custName}`,
        message: `${custName} has accepted and confirmed the on-site visit on ${v.visit_date} at ${v.visit_time}. Plot coordinates ready.`,
        customerName: custName,
        customerMobile: targetReq?.mobile,
        actionTab: "visits",
        actionUrl: `/admin`,
        actionLabel: "View Visit Slot",
        badge: "Visit Confirmed",
        badgeColor: "bg-[#eaf4eb] text-[#24632c]",
        createdAt: v.customer_responded_at,
        isRead: readSet.has(id),
      });
    }
  });

  // 2. Customer Requests (New submissions & Revisions)
  (requests || []).forEach((r) => {
    const id = `req-${r.id}`;

    // New Request Submission
    notifs.push({
      id,
      type: "request",
      title: `New House-Planning Request #${r.id} Received`,
      message: `${r.full_name} (${r.village_city || "-"}, ${r.district || "-"}) submitted a house plan request: ${r.plot_length} × ${r.plot_width} ${r.measurement_unit || "feet"}, ${r.floors || "G+1"}.`,
      customerName: r.full_name,
      customerMobile: r.mobile,
      actionTab: "requests",
      actionUrl: r.customer_user_id ? `/admin/customers/${r.customer_user_id}` : `/admin`,
      actionLabel: "View Request",
      badge: r.status || "New Request",
      badgeColor: "bg-[#eef3f5] text-[#3d515a]",
      createdAt: r.created_at || new Date().toISOString(),
      isRead: readSet.has(id),
    });

    // Revision Request embedded in requirements
    if (r.requirements && r.requirements.includes("[Revision Request")) {
      const match = r.requirements.match(/\[Revision Request \([^)]+\)\]:\s*([^\n]+)/);
      const revNote = match ? match[1] : "Customer submitted plan revision instructions.";
      const revId = `rev-${r.id}`;

      notifs.push({
        id: revId,
        type: "revision_requested",
        title: `Customer Requested Plan Revision: ${r.full_name}`,
        message: `${r.full_name} requested modifications to the draft layout: "${revNote}"`,
        customerName: r.full_name,
        customerMobile: r.mobile,
        actionTab: "plans",
        actionUrl: r.customer_user_id ? `/admin/customers/${r.customer_user_id}` : `/admin`,
        actionLabel: "Review Revision",
        badge: "Revision Required",
        badgeColor: "bg-[#f4ead0] text-[#8c6710]",
        createdAt: r.created_at || new Date().toISOString(),
        isRead: readSet.has(revId),
      });
    }
  });

  // 3. New Customer Registration
  (customerProfiles || []).forEach((p) => {
    const id = `reg-${p.id}`;
    notifs.push({
      id,
      type: "registration",
      title: `New Customer Registered: ${p.full_name || "New Client"}`,
      message: `${p.full_name || "Client"} (${p.mobile || "Phone"}) registered from ${p.village_city || "-"}, ${p.district || "-"}. Profile created in directory.`,
      customerName: p.full_name || "Registered Client",
      customerMobile: p.mobile,
      actionTab: "customers",
      actionUrl: `/admin/customers/${p.id}`,
      actionLabel: "View Customer Profile",
      badge: "New Client",
      badgeColor: "bg-[#eaf5ed] text-[#0c7a62]",
      createdAt: p.created_at || new Date().toISOString(),
      isRead: readSet.has(id),
    });
  });

  // 4. Payments
  (payments || []).forEach((pay) => {
    const id = `pay-${pay.id}`;
    const custName = pay.customer_name || "Customer";

    notifs.push({
      id,
      type: "payment_received",
      title: `Payment Received: ₹${pay.amount} from ${custName}`,
      message: `${custName} made a payment of ₹${pay.amount} for ${pay.payment_type || "Site Visit Advance"} via ${pay.payment_mode || "UPI"}.${pay.reference_number ? ` Ref: ${pay.reference_number}` : ""}`,
      customerName: custName,
      customerMobile: pay.mobile,
      actionTab: "payments",
      actionUrl: `/admin`,
      actionLabel: "Verify Payment",
      badge: pay.payment_status || "Received",
      badgeColor: "bg-[#eaf5ed] text-[#0c7a62]",
      createdAt: pay.created_at || new Date().toISOString(),
      isRead: readSet.has(id),
    });
  });

  // 5. Projects Created
  (projects || []).forEach((proj) => {
    const id = `proj-${proj.id}`;
    notifs.push({
      id,
      type: "project",
      title: `Project Active: ${proj.project_name}`,
      message: `Project ${proj.project_name} is active in planning stage. Plot: ${proj.plot_length} × ${proj.plot_width} ${proj.measurement_unit || "ft"}.`,
      customerName: proj.project_name?.split("-")[0]?.trim() || "Customer",
      actionTab: "projects",
      actionUrl: `/admin`,
      actionLabel: "View Project",
      badge: proj.project_status || "Planning",
      badgeColor: "bg-[#e8f1f5] text-[#235872]",
      createdAt: proj.created_at || new Date().toISOString(),
      isRead: readSet.has(id),
    });
  });

  // Sort by created_at descending (newest first)
  return notifs.sort((a, b) => {
    const tA = new Date(a.createdAt).getTime() || 0;
    const tB = new Date(b.createdAt).getTime() || 0;
    return tB - tA;
  });
}
