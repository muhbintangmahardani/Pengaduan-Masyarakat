import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import type { Profile } from "@/types";

export const metadata: Metadata = {
  title: "Profil Pengguna",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileData) {
    redirect("/login");
  }

  const profile = profileData as Profile;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Profil Saya
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kelola informasi identitas akun, nomor kontak aktif, dan keamanan kredensial Anda.
        </p>
      </div>

      {/* Main Profile Edit Component */}
      <ProfileEditForm profile={profile} />
    </div>
  );
}
