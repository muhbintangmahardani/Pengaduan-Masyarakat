import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Lindungi rute Dashboard dengan otentikasi & RBAC
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete("jalanbaik-role");
      return res;
    }

    // Optimasi: Gunakan cookie cache jalanbaik-role / metadata untuk menghindari query DB lambat di middleware
    let userRole = request.cookies.get("jalanbaik-role")?.value as UserRole | undefined;

    if (!userRole && user.user_metadata?.role) {
      userRole = user.user_metadata.role as UserRole;
    }

    if (!userRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = (profile?.role as UserRole) || "citizen";
    }

    if (userRole && request.cookies.get("jalanbaik-role")?.value !== userRole) {
      response.cookies.set("jalanbaik-role", userRole, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // RBAC: Rute Admin (/dashboard/admin)
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        userRole === "officer" ? "/dashboard/petugas" : "/dashboard/warga";
      return NextResponse.redirect(redirectUrl);
    }

    // RBAC: Rute Petugas (/dashboard/petugas)
    if (
      pathname.startsWith("/dashboard/petugas") &&
      userRole !== "officer" &&
      userRole !== "admin"
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard/warga";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Redirect jika pengguna yang sudah login mencoba mengakses /login atau /register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole: UserRole = profile?.role || "citizen";
    const redirectUrl = request.nextUrl.clone();

    if (userRole === "admin") {
      redirectUrl.pathname = "/dashboard/admin";
    } else if (userRole === "officer") {
      redirectUrl.pathname = "/dashboard/petugas";
    } else {
      redirectUrl.pathname = "/dashboard/warga";
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
