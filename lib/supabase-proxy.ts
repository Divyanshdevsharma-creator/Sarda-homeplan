import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Server-side user verification using getUser() as recommended by Supabase
  let authUser = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authUser = user;
  } catch (_) {
    authUser = null;
  }

  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Check customer session cookies
  const hasCustomerCookie =
    request.cookies.get("sarda_customer_logged_in")?.value === "true" ||
    request.cookies.get("sarada_customer_logged_in")?.value === "true";

  const isCustomerLoggedIn = Boolean(authUser || hasCustomerCookie);

  // 1. Protected Customer Routes
  const isProtectedCustomerRoute =
    pathname === "/customer/dashboard" ||
    pathname.startsWith("/customer/dashboard/") ||
    pathname === "/customer/feedback" ||
    pathname.startsWith("/customer/feedback/");

  if (isProtectedCustomerRoute && !isCustomerLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/customer/login";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // 2. Customer Auth pages (/customer/login, /customer/signup)
  const isCustomerAuthPage =
    pathname === "/customer/login" || pathname === "/customer/signup";

  if (isCustomerAuthPage) {
    const isSwitching = request.nextUrl.searchParams.has("switch");
    if (isCustomerLoggedIn && !isSwitching) {
      const nextParam = request.nextUrl.searchParams.get("next");
      if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/customer/login")) {
        const url = new URL(nextParam, request.url);
        return NextResponse.redirect(url);
      }
      const url = new URL("/customer/dashboard", request.url);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. Admin Routes Protection
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage =
    pathname === "/admin/login" || pathname === "/admin/forgot-password";

  const hasAdminCookie =
    request.cookies.get("sarada_admin_logged_in")?.value === "true" ||
    request.cookies.get("sarda_admin_logged_in")?.value === "true";

  // Check known admin identifiers or auth metadata
  const isAdminAuthUser = Boolean(
    authUser && (
      authUser.email === "admin@saradahomeplan.com" ||
      authUser.email === "admin@sardahomeplan.com" ||
      authUser.email === "divyanshdevsharma0264@gmail.com" ||
      authUser.email === "dkvaid1978@gmail.com" ||
      authUser.user_metadata?.role === "Super Admin" ||
      authUser.user_metadata?.role === "Admin" ||
      authUser.user_metadata?.is_admin === true
    )
  );

  const isAdminLoggedIn = Boolean(hasAdminCookie || isAdminAuthUser);

  // If on admin login / forgot-password page:
  // NEVER redirect to /customer/dashboard!
  // If already logged in as admin AND not explicitly switching, redirect to /admin.
  if (isAdminLoginPage) {
    const isForceSwitch =
      request.nextUrl.searchParams.has("switch") ||
      request.nextUrl.searchParams.has("logout");
    if (isAdminLoggedIn && !isForceSwitch) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If accessing a protected admin route and not authenticated as admin,
  // redirect to /admin/login so they can enter admin credentials (NEVER to customer dashboard!)
  if (isAdminRoute && !isAdminLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}