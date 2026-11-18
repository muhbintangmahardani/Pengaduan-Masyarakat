import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();

  // Hapus semua cookies sesi, auth Supabase, dan role di level server
  for (const c of cookieStore.getAll()) {
    if (
      c.name.startsWith("sb-") ||
      c.name.startsWith("jb_") ||
      c.name === "jalanbaik-role"
    ) {
      cookieStore.delete(c.name);
    }
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Server auto-logout signOut:", err);
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Pastikan cookies di response juga di-expire eksplisit
  for (const c of cookieStore.getAll()) {
    if (
      c.name.startsWith("sb-") ||
      c.name.startsWith("jb_") ||
      c.name === "jalanbaik-role"
    ) {
      response.cookies.delete(c.name);
    }
  }

  return response;
}
