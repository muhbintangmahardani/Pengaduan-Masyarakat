import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect("/login");
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role: UserRole = profile?.role || "citizen";
      if (role === "admin") redirect("/dashboard/admin");
      if (role === "officer") redirect("/dashboard/petugas/ringkasan");
      redirect("/dashboard/warga");
    }
  } catch (err) {
    console.error("Home page auth check error:", err);
  }

  // Pengguna yang belum login langsung diarahkan ke halaman login
  redirect("/login");
}
