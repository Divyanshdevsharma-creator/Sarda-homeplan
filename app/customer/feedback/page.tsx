import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import FeedbackClient from "./FeedbackClient";

export const metadata = {
  title: "Customer Feedback & Reviews | Sarda Homeplan",
  description: "Share your house planning experience with Sarda Homeplan.",
};

export default async function CustomerFeedbackPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Server-side verify user with getUser()
  let authUser = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authUser = user;
  } catch (_) {
    authUser = null;
  }

  // 2. Check fallback customer session cookies
  const hasCustomerCookie =
    cookieStore.get("sarda_customer_logged_in")?.value === "true" ||
    cookieStore.get("sarada_customer_logged_in")?.value === "true";

  if (!authUser && !hasCustomerCookie) {
    redirect("/customer/login?next=/customer/feedback");
  }

  // Fetch customer profile if available
  let profileName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "Customer";
  let profileMobile = authUser?.user_metadata?.mobile || "";

  if (authUser?.id) {
    try {
      const { data: prof } = await supabase
        .from("customer_profiles")
        .select("full_name, mobile")
        .eq("id", authUser.id)
        .maybeSingle();

      if (prof) {
        profileName = prof.full_name || profileName;
        profileMobile = prof.mobile || profileMobile;
      }
    } catch (_) {}
  }

  const initialUser = {
    id: authUser?.id || "verified-customer",
    email: authUser?.email || undefined,
    name: profileName,
    mobile: profileMobile,
  };

  return <FeedbackClient initialUser={initialUser} />;
}
