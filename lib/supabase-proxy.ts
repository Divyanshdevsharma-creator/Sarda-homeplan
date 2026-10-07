import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              request.cookies.set(name, value);
            }
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * IMPORTANT:
   * getClaims() verifies the authenticated user's
   * JWT and is the method recommended by Supabase
   * for protecting routes.
   */
  const { data: claims, error: claimsError } =
  await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;

  /*
   * Protect everything under /admin
   * except /admin/login
   */
  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isLoginPage =
    pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !claims) {
    const url = request.nextUrl.clone();

    url.pathname = "/admin/login";

    return NextResponse.redirect(url);
  }

  /*
   * If already logged in and user opens login page,
   * send them back to dashboard.
   */
  if (isLoginPage && claims) {
    const url = request.nextUrl.clone();

    url.pathname = "/admin";

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}