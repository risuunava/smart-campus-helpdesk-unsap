"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Mail, BookOpen, GraduationCap, Camera, Sun, Moon, Monitor, Palette, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";

type Tab = "profile" | "appearance" | "security";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    nim: user?.nim || "",
    faculty: user?.faculty || "",
    study_program: user?.study_program || "",
    semester: user?.semester || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  
  // State untuk show/hide password & error validasi
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // ── handlers ──
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    const r = new FileReader();
    r.onload = () => { if (typeof r.result === "string") { setCropSrc(r.result); setCropOpen(true); } };
    r.readAsDataURL(f);
  };

  const onCrop = async (blob: Blob) => {
    setUploadingAvatar(true);
    try {
      await api.updateAvatar(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      toast.success("Foto profil diperbarui");
      setCropOpen(false);
      setTimeout(() => router.refresh(), 800);
    } catch (err: any) { toast.error(err.message || "Gagal upload"); }
    finally { setUploadingAvatar(false); }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile(profileForm);
      toast.success("Profil disimpan");
      setTimeout(() => router.refresh(), 800);
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan"); }
    finally { setSavingProfile(false); }
  };

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmError("");
    
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setConfirmError("Konfirmasi password tidak cocok");
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    
    setSavingPassword(true);
    try {
      await api.requestPasswordChangeOtp({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });
      toast.success("Kode OTP telah dikirim ke email Anda!");
      setOtpMode(true);
    } catch (err: any) { 
      const errMsg = err.message || "Gagal mengirim OTP";
      if (errMsg.toLowerCase().includes("saat ini") || errMsg.toLowerCase().includes("current password")) {
        setPasswordError("Password saat ini salah");
      }
      toast.error(errMsg); 
    }
    finally { setSavingPassword(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("OTP harus 6 digit");
    setSavingPassword(true);
    try {
      await api.verifyPasswordChangeOtp({
        otp,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });
      toast.success("Password berhasil diperbarui!");
      setOtpMode(false);
      setOtp("");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: any) { toast.error(err.message || "Kode OTP tidak valid"); }
    finally { setSavingPassword(false); }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profil" },
    { id: "appearance", label: "Tampilan" },
    { id: "security", label: "Keamanan" },
  ];

  return (
    <div className="container-mobile py-8 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold th-text">Pengaturan</h1>
      <p className="text-sm th-text-2 mt-1 mb-6">Kelola akun, tampilan, dan keamanan.</p>

      {/* Tab nav — simple underline style */}
      <div className="flex gap-6 border-b mb-8" style={{ borderColor: 'var(--th-border)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              tab === t.id ? "th-text" : "th-text-m hover:th-text"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1ed760] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── PROFIL ── */}
      {tab === "profile" && (
        <div className="space-y-8">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="h-16 w-16 border" style={{ borderColor: 'var(--th-border)' }}>
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                ) : null}
                <AvatarFallback style={{ background: 'var(--th-raised)', color: 'var(--th-text-muted)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} disabled={uploadingAvatar} />
            </div>
            <div>
              <p className="text-sm font-medium th-text">{user.name}</p>
              <p className="text-xs th-text-m">{user.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-[#1ed760] hover:underline mt-1 font-medium"
              >
                Ganti foto
              </button>
            </div>
          </div>

          <Separator style={{ background: 'var(--th-border)' }} />

          {/* Form */}
          <form onSubmit={saveProfile} className="space-y-5">
            <Field label="Nama" required>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-focus h-10"
                required
              />
            </Field>

            <Field label="Email" required>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input-focus h-10"
                required
              />
            </Field>

            {user.role === "mahasiswa" && (
              <>
                <Field label="NIM">
                  <Input
                    value={profileForm.nim}
                    onChange={(e) => setProfileForm({ ...profileForm, nim: e.target.value })}
                    className="input-focus h-10"
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Fakultas">
                    <Input
                      value={profileForm.faculty}
                      onChange={(e) => setProfileForm({ ...profileForm, faculty: e.target.value })}
                      className="input-focus h-10"
                    />
                  </Field>
                  <Field label="Program Studi">
                    <Input
                      value={profileForm.study_program}
                      onChange={(e) => setProfileForm({ ...profileForm, study_program: e.target.value })}
                      className="input-focus h-10"
                    />
                  </Field>
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingProfile} className="btn-gradient h-9 px-6 text-sm">
                {savingProfile ? "Menyimpan…" : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAMPILAN ── */}
      {tab === "appearance" && <AppearanceTab />}

      {/* ── KEAMANAN ── */}
      {tab === "security" && (
        !otpMode ? (
          <form onSubmit={requestOtp} className="space-y-5 max-w-md">
            <p className="text-sm th-text-2 mb-2">Perbarui kata sandi akun Anda. Kode OTP akan dikirim ke email untuk konfirmasi.</p>

            <Field label="Password saat ini" required>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, current_password: e.target.value });
                    if (passwordError) setPasswordError("");
                  }}
                  className={`input-focus h-10 pr-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 font-medium">{passwordError}</p>
              )}
            </Field>

            <Field label="Password baru" required>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, password: e.target.value });
                    if (confirmError) setConfirmError("");
                  }}
                  className="input-focus h-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Konfirmasi password baru" required>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.password_confirmation}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, password_confirmation: e.target.value });
                    if (confirmError) setConfirmError("");
                  }}
                  className={`input-focus h-10 pr-10 ${confirmError ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmError && (
                <p className="text-red-500 text-xs mt-1 font-medium">{confirmError}</p>
              )}
            </Field>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingPassword} className="btn-gradient h-9 px-6 text-sm">
                {savingPassword ? "Memproses…" : "Ganti Password"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-5 max-w-md">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(30,215,96,0.06)', border: '1px solid rgba(30,215,96,0.2)' }}>
              <p className="text-sm font-medium text-[#1ed760] mb-1">Cek email Anda!</p>
              <p className="text-xs th-text-m">Kode OTP 6 digit telah dikirim ke <strong className="th-text">{user.email}</strong>. Berlaku selama 15 menit.</p>
            </div>

            <Field label="Kode Verifikasi (OTP)" required>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input-focus h-12 text-center text-2xl tracking-[0.6em] font-mono"
                required
                placeholder="000000"
                autoFocus
              />
            </Field>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => { setOtpMode(false); setOtp(""); }}
                className="text-xs th-text-m hover:th-text transition-colors"
              >
                ← Kembali
              </button>
              <Button type="submit" disabled={savingPassword || otp.length !== 6} className="btn-gradient h-9 px-6 text-sm">
                {savingPassword ? "Memverifikasi…" : "Verifikasi & Simpan"}
              </Button>
            </div>
          </form>
        )
      )}

      {/* Crop Modal */}
      <AvatarCropModal
        isOpen={cropOpen}
        imageSrc={cropSrc}
        onClose={() => setCropOpen(false)}
        onCropComplete={onCrop}
        isLoading={uploadingAvatar}
      />
    </div>
  );
}

/* ── reusable field wrapper ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm th-text">
        {label}
        {required && <span className="text-[#f3727f] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

/* ── appearance tab (isolated for useTheme mount safety) ── */
function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="py-12 text-center th-text-m text-sm">Memuat…</div>;

  const options: { value: string; label: string; desc: string; icon: any }[] = [
    { value: "light", label: "Terang", desc: "Tampilan cerah", icon: Sun },
    { value: "dark", label: "Gelap", desc: "Lebih nyaman di malam hari", icon: Moon },
    { value: "system", label: "Sistem", desc: "Ikuti pengaturan perangkat", icon: Monitor },
  ];

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-sm th-text-2 mb-2">Pilih tema tampilan aplikasi.</p>

      <div className="space-y-2">
        {options.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setTheme(o.value)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all text-left"
              style={{
                background: active ? 'rgba(30,215,96,0.06)' : 'var(--th-base)',
                borderColor: active ? '#1ed760' : 'var(--th-border)',
              }}
            >
              <o.icon className={`h-5 w-5 shrink-0 ${active ? "text-[#1ed760]" : "th-text-m"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${active ? "text-[#1ed760]" : "th-text"}`}>{o.label}</p>
                <p className="text-xs th-text-m">{o.desc}</p>
              </div>
              {/* radio dot */}
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: active ? '#1ed760' : 'var(--th-text-faint)' }}
              >
                {active && <div className="w-2 h-2 rounded-full bg-[#1ed760]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
