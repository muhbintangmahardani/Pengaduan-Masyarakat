import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export default async function HomePage() {
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

  // Pengguna yang belum login langsung diarahkan ke halaman login
  redirect("/login");
}
