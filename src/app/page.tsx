import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect("/login");
  }

  let destination = "/login";

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
      if (role === "admin") {
        destination = "/dashboard/admin";
      } else if (role === "officer") {
        destination = "/dashboard/petugas/ringkasan";
      } else {
        destination = "/dashboard/warga";
      }
    }
  } catch (err) {
    console.error("Home page auth check error:", err);
    destination = "/login";
  }

  // Pengalihan bersih di luar blok try-catch agar Next.js runtime tidak menganggap NEXT_REDIRECT sebagai kegagalan render
  redirect(destination);
}
