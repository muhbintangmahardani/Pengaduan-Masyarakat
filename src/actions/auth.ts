"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Cek peran untuk pengalihan dashboard yang tepat
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    revalidatePath("/", "layout");

    const role = profile?.role || "citizen";
    if (role === "admin") redirect("/dashboard/admin");
    if (role === "officer") redirect("/dashboard/petugas/ringkasan");
    redirect("/dashboard/warga");
  }

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
  const { error } = await supabase.auth.signUp({
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

  revalidatePath("/", "layout");
  redirect("/dashboard/warga");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Sesi tidak sah. Silakan login kembali." };
  }

  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!fullName || fullName.trim().length < 3) {
    return { success: false, message: "Nama lengkap minimal 3 karakter." };
  }

  // 1. Update data di tabel profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      phone_number: phoneNumber ? phoneNumber.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, message: "Gagal memperbarui profil: " + profileError.message };
  }

  // 2. Jika user memasukkan password baru
  if (newPassword && newPassword.trim().length >= 6) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (passwordError) {
      return {
        success: false,
        message: "Profil diperbarui, namun kata sandi gagal diganti: " + passwordError.message,
      };
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/profile");

  return {
    success: true,
    message: "Profil Anda berhasil diperbarui dengan sukses!",
  };
}
