import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const rawNext = searchParams.get("next") || "/customer/dashboard";
  const next = rawNext.startsWith("/") ? rawNext : "/customer/dashboard";

  // Compute accurate production origin respecting proxies/Vercel
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const baseUrl = host ? `${proto}://${host}` : origin;

  // Handle OAuth provider errors
  if (error) {
    const errorMsg = errorDescription || error;
    const loginErrorUrl = new URL(
      `/customer/login?error=${encodeURIComponent(errorMsg)}`,
      baseUrl
    );
    return NextResponse.redirect(loginErrorUrl);
  }

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

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && data?.user) {
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

          const userPhone = user.phone
            ? user.phone.replace(/\D/g, "").slice(-10)
            : (user.user_metadata?.mobile
            ? String(user.user_metadata.mobile).replace(/\D/g, "").slice(-10)
            : null);

          // Check if an existing profile exists with this mobile number to avoid duplicate
          let isDuplicate = false;
          if (userPhone) {
            const { data: profByPhone } = await supabase
              .from("customer_profiles")
              .select("id")
              .eq("mobile", userPhone)
              .maybeSingle();
            if (profByPhone) {
              isDuplicate = true;
            }
          }

          if (!isDuplicate) {
            const fullPayload: any = {
              id: user.id,
              full_name: userName,
              mobile: userPhone,
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
            };

            const { error: insErr } = await supabase
              .from("customer_profiles")
              .insert(fullPayload);

            if (insErr) {
              // Fallback to base columns that exist on customer_profiles
              await supabase.from("customer_profiles").insert({
                id: user.id,
                full_name: userName,
                mobile: userPhone,
                village_city: user.user_metadata?.village_city || null,
                district: user.user_metadata?.district || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (profErr) {
        console.warn("OAuth customer profile sync notice:", profErr);
      }

      const redirectUrl = new URL(next, baseUrl);
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
      console.error("exchangeCodeForSession error:", exchangeError);
      const loginErrorUrl = new URL(
        `/customer/login?error=${encodeURIComponent(
          exchangeError?.message || "Authentication code exchange failed"
        )}`,
        baseUrl
      );
      return NextResponse.redirect(loginErrorUrl);
    }
  }

  // Fallback redirect if no code
  return NextResponse.redirect(new URL("/customer/login", baseUrl));
}
