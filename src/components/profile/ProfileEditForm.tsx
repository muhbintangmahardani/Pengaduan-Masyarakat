"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  Loader2,
  Calendar,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateProfileAction } from "@/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const roleLabelMap: Record<UserRole, string> = {
    admin: "Administrator Dinas",
    officer: "Petugas Lapangan",
    citizen: "Masyarakat / Warga",
  };

  const roleBadgeColor: Record<UserRole, string> = {
    admin: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    officer: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    citizen: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword && newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Menyimpan pembaruan profil...");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phoneNumber", phoneNumber);
      if (newPassword) {
        formData.append("newPassword", newPassword);
      }

      const result = await updateProfileAction(formData);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.dismiss(toastId);
      toast.success(result.message);
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolom Kiri: Ringkasan Kartu Identitas Profil (4 cols) */}
      <Card className="lg:col-span-4 rounded-xl p-6 space-y-6 shadow-xs border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0c3b37] to-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800">
              {fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Akun Aktif">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {fullName || "Nama Pengguna"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.email}
            </p>
          </div>

          <Badge variant="outline" className={`text-xs font-bold px-3 py-1 rounded-full ${roleBadgeColor[profile.role]}`}>
            {roleLabelMap[profile.role]}
          </Badge>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Status Akun
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Terverifikasi
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Bergabung Sejak
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDateTime(profile.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              No. Telepon
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {profile.phone_number || "-"}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Identitas akun Anda digunakan untuk verifikasi aduan, penugasan resmi tim teknis lapangan, dan audit transparansi layanan jalan.
        </div>
      </Card>

      {/* Kolom Kanan: Form Edit Data Diri & Keamanan (8 cols) */}
      <Card className="lg:col-span-8 rounded-xl p-6 sm:p-7 shadow-xs border-slate-200/70 dark:border-slate-800">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Pengaturan Profil & Keamanan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbarui nama lengkap, nomor telepon, dan kata sandi akses akun Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Data Pribadi */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Data Pribadi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nama Lengkap *
                </Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nama Lengkap Anda"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Nomor Telepon / WhatsApp
                </Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Alamat Email (Akun Utama)
              </Label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="rounded-xl h-10 text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400 block">
                Email digunakan sebagai kredensial login utama dan tidak dapat diubah.
              </span>
            </div>
          </div>

          {/* Bagian 2: Ganti Kata Sandi */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Ubah Kata Sandi (Opsional)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kosongkan jika Anda tidak ingin mengubah kata sandi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kata Sandi Baru */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="rounded-xl h-10 text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi Baru
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 rounded-xl bg-[#0c3b37] hover:bg-[#082825] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 duration-150 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Profil
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
