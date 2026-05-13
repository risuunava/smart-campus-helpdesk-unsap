"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail, BookOpen, GraduationCap, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  
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

  if (!user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Profil berhasil diperbarui");
        // Update user state if possible, or reload
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Password berhasil diperbarui");
        setPasswordForm({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        toast.error(data.message || "Gagal memperbarui password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
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
    </div>
  );
}
