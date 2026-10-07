import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") || "/customer/dashboard";
  // Ensure safe local redirect
  const next = rawNext.startsWith("/") ? rawNext : "/customer/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component / route handler
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;
      // Check if user already has a customer_profiles entry
      try {
        const { data: existingProfile } = await supabase
          .from("customer_profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingProfile) {
          const userName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Customer";

          await supabase.from("customer_profiles").insert({
            id: user.id,
            full_name: userName,
            mobile: user.user_metadata?.mobile || user.phone || null,
            village_city: user.user_metadata?.village_city || null,
            district: user.user_metadata?.district || null,
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null,
            state: "Bihar",
            property_type: "Residential (1-3 Floor)",
            preferred_language: "Hindi",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (profErr) {
        console.warn("OAuth customer profile sync notice:", profErr);
      }

      const redirectUrl = new URL(next, origin);
      const response = NextResponse.redirect(redirectUrl);
      // Set backup session cookie for robust cross-navigation SSR recognition
      response.cookies.set("sarda_customer_logged_in", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      response.cookies.set("sarada_customer_logged_in", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      return response;
    } else {
      console.error("exchangeCodeForSession error:", error);
    }
  }

  // Fallback redirect if no code or error
  return NextResponse.redirect(new URL("/customer/dashboard", origin));
}
