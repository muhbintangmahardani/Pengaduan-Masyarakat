import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, email")
    .eq("id", user.id)
    .single();

  const role: UserRole = profile?.role || "citizen";
  const userName = profile?.full_name || user.email?.split("@")[0] || "Pengguna";

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
