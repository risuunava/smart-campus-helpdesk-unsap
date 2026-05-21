"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail, BookOpen, GraduationCap, Shield, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
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

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // Step 1: User picks a file → open crop modal
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setCropImageSrc(reader.result);
        setCropModalOpen(true);
      }
    });
    reader.readAsDataURL(file);
  };

  // Step 2: Cropped blob → upload
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingAvatar(true);
    try {
      const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      await api.updateAvatar(croppedFile);
      toast.success("Foto profil berhasil diperbarui!");
      setCropModalOpen(false);
      setTimeout(() => router.refresh(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui foto profil");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await api.updateProfile(profileForm);
      toast.success("Profil berhasil diperbarui");
      setTimeout(() => router.refresh(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      return toast.error("Konfirmasi password tidak sesuai");
    }
    setIsUpdatingPassword(true);
    try {
      await api.updatePassword(passwordForm);
      toast.success("Password berhasil diperbarui");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Akun</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-[#121212] border border-[#282828] rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#282828] bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1ed760]/10 rounded-lg text-[#1ed760]">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Informasi Profil</h2>
            </div>
          </div>
          
          <div className="p-6 border-b border-[#282828]">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] border-2 border-[#333] flex items-center justify-center">
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt={user.name} 
                      width={96} 
                      height={96} 
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${isUploadingAvatar ? 'opacity-100' : ''}`}
                >
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs text-white font-medium">
                    {isUploadingAvatar ? 'Uploading...' : 'Ubah Foto'}
                  </span>
                </label>
                <input 
                  ref={fileInputRef}
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </div>
              <div>
                <h3 className="text-white font-medium">Foto Profil</h3>
                <p className="text-sm text-gray-400 mt-1">Disarankan format JPG, PNG atau WebP. Maks 2MB.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Nama Lengkap</label>
              <Input 
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="bg-[#1a1a1a] border-[#333] text-white focus:border-[#1ed760] transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="bg-[#1a1a1a] border-[#333] text-white focus:border-[#1ed760] pl-10 transition-colors"
                  required
                />
              </div>
            </div>

            {user.role === 'mahasiswa' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">NIM</label>
                  <Input 
                    value={profileForm.nim}
                    onChange={(e) => setProfileForm({ ...profileForm, nim: e.target.value })}
                    className="bg-[#1a1a1a] border-[#333] text-white focus:border-[#1ed760] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Fakultas</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        value={profileForm.faculty}
                        onChange={(e) => setProfileForm({ ...profileForm, faculty: e.target.value })}
                        className="bg-[#1a1a1a] border-[#333] text-white focus:border-[#1ed760] pl-10 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Program Studi</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        value={profileForm.study_program}
                        onChange={(e) => setProfileForm({ ...profileForm, study_program: e.target.value })}
                        className="bg-[#1a1a1a] border-[#333] text-white focus:border-[#1ed760] pl-10 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              disabled={isUpdatingProfile}
              className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-semibold rounded-lg mt-4"
            >
              {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </Button>
          </form>
        </div>

        {/* Security Card */}
        <div className="bg-[#121212] border border-[#282828] rounded-xl overflow-hidden shadow-lg h-fit">
          <div className="p-6 border-b border-[#282828] bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Keamanan</h2>
            </div>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password Saat Ini</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="bg-[#1a1a1a] border-[#333] text-white focus:border-blue-500 pl-10 transition-colors"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="bg-[#1a1a1a] border-[#333] text-white focus:border-blue-500 pl-10 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  className="bg-[#1a1a1a] border-[#333] text-white focus:border-blue-500 pl-10 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdatingPassword}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg mt-4"
            >
              {isUpdatingPassword ? "Memperbarui..." : "Perbarui Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        isLoading={isUploadingAvatar}
      />
    </div>
  );
}
