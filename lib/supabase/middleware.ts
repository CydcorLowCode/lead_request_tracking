import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

type AppRole = Database["public"]["Tables"]["lrt_profiles"]["Row"]["role"];

const LOGIN_PATH = "/login";
const OWNER_HOME = "/my-requests";
const TEAM_HOME = "/dashboard";

function getHomeRoute(role: AppRole) {
  return role === "territory_team" ? TEAM_HOME : OWNER_HOME;
}

function isProtectedOwnerRoute(pathname: string) {
  return (
    pathname.startsWith("/my-requests")
  );
}

function isSharedSubmitRoute(pathname: string) {
  return pathname === "/submit" || pathname.startsWith("/submit/");
}

function isProtectedTeamRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/requests" ||
    pathname.startsWith("/requests/")
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function withSessionCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
  return target;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === LOGIN_PATH;

  const supabase = createServerClient<Database>(
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
          supabaseResponse = NextResponse.next({
            request,
          });
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
  const userRoleResult = user
    ? await supabase
        .from("lrt_profiles")
        .select("role")
        .eq("auth_user_id", user.id)
        .maybeSingle()
    : null;
  const role = userRoleResult?.data?.role ?? null;

  function redirectWithReason(reason: string, targetPath: string) {
    const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
    return withSessionCookies(redirectResponse, supabaseResponse);
  }

  if (!user) {
    if (isLoginRoute) {
      return supabaseResponse;
    }

    return redirectWithReason("no-user", LOGIN_PATH);
  }
  if (!role) {
    if (isLoginRoute) {
      return supabaseResponse;
    }

    return redirectWithReason("missing-role", LOGIN_PATH);
  }

  const homeRoute = getHomeRoute(role);
  if (isLoginRoute) {
    return supabaseResponse;
  }

  if (isAdminRoute(pathname)) {
    return redirectWithReason("admin-route", homeRoute);
  }

  if (isProtectedOwnerRoute(pathname) && role !== "owner") {
    return redirectWithReason("owner-route-role-mismatch", homeRoute);
  }

  if (isSharedSubmitRoute(pathname) && role !== "owner" && role !== "territory_team") {
    return redirectWithReason("submit-route-role-mismatch", homeRoute);
  }

  if (isProtectedTeamRoute(pathname) && role !== "territory_team") {
    return redirectWithReason("team-route-role-mismatch", homeRoute);
  }
  return supabaseResponse;
}
