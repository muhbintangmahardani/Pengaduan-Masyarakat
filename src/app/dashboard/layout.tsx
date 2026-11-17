import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", user.id)
        .single();
      profile = profileData;
    }
  } catch (err) {
    console.error("DashboardLayout auth check failed:", err);
  }

  if (!user) {
    redirect("/login");
  }

  const role: UserRole = profile?.role || "citizen";
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Pengguna";

  const getSubtitle = () => {
    if (role === "admin") return "Panel pengelolaan laporan";
    if (role === "officer") return "Ruang kerja lapangan";
    return "Layanan pengaduan jalan";
  };

  return (
    <DashboardShell
      userId={user.id}
      role={role}
      userName={userName}
      userEmail={user.email}
      subtitle={getSubtitle()}
    >
      {children}
    </DashboardShell>
  );
}
