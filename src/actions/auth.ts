"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    return { success: false, message: error?.message || "Login gagal." };
  }

  const user = authData.user;
  const cookieStore = await cookies();

  // Optimasi: Cek role dari metadata terlebih dahulu (instan 0ms) atau fallback ke query profiles
  let role: UserRole = (user.user_metadata?.role as UserRole) || "citizen";

  if (!user.user_metadata?.role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) {
      role = profile.role as UserRole;
    }
  }

  // Cache role aman terikat ID pengguna
  cookieStore.set(`jb_role_${user.id}`, role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Catat waktu aktivitas awal login
  cookieStore.set("jb_last_activity", Date.now().toString(), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  // Hapus cookie usang
  cookieStore.delete("jalanbaik-role");

  // Pengalihan instan ke dashboard yang sesuai tanpa blocking revalidatePath
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "officer") redirect("/dashboard/petugas/ringkasan");
  redirect("/dashboard/warga");
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!email || !password || !fullName) {
    return {
      success: false,
      message: "Nama lengkap, email, dan kata sandi wajib diisi.",
    };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber || null,
        role: "citizen",
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (authData.user) {
    const cookieStore = await cookies();
    cookieStore.set(`jb_role_${authData.user.id}`, "citizen", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("jb_last_activity", Date.now().toString(), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    cookieStore.delete("jalanbaik-role");
  }

  redirect("/dashboard/warga");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  // Hapus semua cookies sesi & role seketika di level server
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (
      c.name.startsWith("jb_role_") ||
      c.name === "jalanbaik-role" ||
      c.name === "jb_last_activity"
    ) {
      cookieStore.delete(c.name);
    }
  }

  const supabase = await createClient();
  // Sign out dari Supabase tanpa blocking
  try {
    await supabase.auth.signOut();
  } catch {}

  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Sesi tidak sah." };
  }

  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!fullName) {
    return { success: false, message: "Nama lengkap tidak boleh kosong." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone_number: phoneNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, message: "Gagal memperbarui profil: " + error.message };
  }

  return { success: true, message: "Profil berhasil diperbarui!" };
}
