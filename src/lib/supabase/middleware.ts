import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // Pengaman jika Environment Variables belum diinput di Vercel Dashboard
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "CRITICAL: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in Vercel!"
    );
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // 0. Redirect halaman utama ("/") langsung di level middleware (mencegah error render Server Component di root)
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const userRoleCookieKey = `jb_role_${user.id}`;
    let userRole = request.cookies.get(userRoleCookieKey)?.value as UserRole | undefined;

    if (!userRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = (profile?.role as UserRole) || "citizen";
    }

    if (userRole === "admin") {
      url.pathname = "/dashboard/admin";
    } else if (userRole === "officer") {
      url.pathname = "/dashboard/petugas/ringkasan";
    } else {
      url.pathname = "/dashboard/warga";
    }
    return NextResponse.redirect(url);
  }

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

    // Inactivity Session Timeout Server-Side Check (15 menit tanpa aktivitas, sinkron dengan mobile & desktop)
    const lastActivity = request.cookies.get("jb_last_activity")?.value;
    const now = Date.now();
    const MAX_INACTIVITY_MS = 15 * 60 * 1000; // 15 menit total

    if (lastActivity) {
      const lastTime = parseInt(lastActivity, 10);
      if (!isNaN(lastTime) && now - lastTime >= MAX_INACTIVITY_MS) {
        // Sesi telah kedaluwarsa karena tidak ada aktivitas - langsung keluar tanpa modal alert
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        const res = NextResponse.redirect(url);
        res.cookies.delete("jb_last_activity");
        res.cookies.delete(`jb_role_${user.id}`);
        res.cookies.delete("jalanbaik-role");
        return res;
      }
    }

    // Perbarui timestamp aktivitas server pada response cookie (non-httpOnly agar client dapat sinkronisasi)
    response.cookies.set("jb_last_activity", now.toString(), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    // Hapus cookie usang unkeyed jika masih tersimpan di peramban
    if (request.cookies.has("jalanbaik-role")) {
      response.cookies.delete("jalanbaik-role");
    }

    // Role Resolution Aman: Gunakan cookie terikat ID pengguna (jb_role_{user.id})
    // Jika tidak ada di cookie, ambil LANGSUNG dari tabel profiles (database single source of truth)
    const userRoleCookieKey = `jb_role_${user.id}`;
    let userRole = request.cookies.get(userRoleCookieKey)?.value as UserRole | undefined;

    if (!userRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = (profile?.role as UserRole) || "citizen";

      response.cookies.set(userRoleCookieKey, userRole, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // RBAC: Rute Admin (/dashboard/admin)
    if (pathname.startsWith("/dashboard/admin")) {
      if (userRole !== "admin") {
        // Self-Healing: Verifikasi langsung ke tabel profiles database untuk mencegah stale cookie
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        const actualRole = (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || "citizen";

        if (actualRole === "admin") {
          userRole = "admin";
          response.cookies.set(userRoleCookieKey, "admin", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });
        } else {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname =
            actualRole === "officer" ? "/dashboard/petugas/ringkasan" : "/dashboard/warga";
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // RBAC: Rute Petugas (/dashboard/petugas)
    if (pathname.startsWith("/dashboard/petugas")) {
      if (userRole !== "officer" && userRole !== "admin") {
        // Self-Healing: Verifikasi langsung ke tabel profiles database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        const actualRole = (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || "citizen";

        if (actualRole === "officer" || actualRole === "admin") {
          userRole = actualRole;
          response.cookies.set(userRoleCookieKey, actualRole, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });
        } else {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/dashboard/warga";
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  // 2. Redirect jika pengguna yang sudah login mencoba mengakses /login atau /register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const userRoleCookieKey = `jb_role_${user.id}`;
    let userRole = request.cookies.get(userRoleCookieKey)?.value as UserRole | undefined;

    if (!userRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = (profile?.role as UserRole) || "citizen";
    }

    const redirectUrl = request.nextUrl.clone();
    if (userRole === "admin") {
      redirectUrl.pathname = "/dashboard/admin";
    } else if (userRole === "officer") {
      redirectUrl.pathname = "/dashboard/petugas/ringkasan";
    } else {
      redirectUrl.pathname = "/dashboard/warga";
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
