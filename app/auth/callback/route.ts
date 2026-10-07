import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/customer/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
              // Ignore in Server Component
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Sync user profile in customer_profiles
      try {
        await supabase.from("customer_profiles").upsert(
          {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "Customer",
            mobile: data.user.user_metadata?.mobile || null,
            village_city: data.user.user_metadata?.village_city || null,
            district: data.user.user_metadata?.district || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            state: "Bihar",
            property_type: "Residential Plot",
            preferred_language: "Hindi",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profErr) {
        console.warn("OAuth profile sync error:", profErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/customer/dashboard`);
}
