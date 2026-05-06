import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtected = pathname.startsWith("/dashboard");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Paywall: enforce active subscription / valid trial for /dashboard
  // Always allow /dashboard/billing so the user can subscribe or update payment.
  if (user && isProtected && !pathname.startsWith("/dashboard/billing")) {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("subscription_status, trial_ends_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const status = settings?.subscription_status ?? "trialing";
    const trialEndsAt = settings?.trial_ends_at;
    const trialActive =
      status === "trialing" && trialEndsAt && new Date(trialEndsAt) > new Date();
    const subscriptionActive = status === "active";

    if (!trialActive && !subscriptionActive) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/billing";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
