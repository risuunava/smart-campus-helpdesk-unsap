"use client";

import { useAuth } from "@/hooks/useAuth";
import { User, Mail, BookOpen, GraduationCap, Shield, Fingerprint } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profil Saya</h1>
          <p className="text-sm text-gray-400 mt-1">Informasi detail akun Anda</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" className="border-[#333] text-white hover:bg-[#1f1f1f] hover:text-white bg-[#1a1a1a]">
            Edit Profil
          </Button>
        </Link>
      </div>

      <div className="bg-[#1a1a1a] border border-[#282828] rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-[#1ed760]/20 to-[#121212] relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-[#121212] border-4 border-[#1a1a1a] flex items-center justify-center overflow-hidden">
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
                <User className="h-12 w-12 text-[#1ed760]" />
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-[#1ed760] font-medium text-sm flex items-center gap-2 mb-8">
            {user.role === 'master_admin' ? (
              <><Shield className="h-4 w-4" /> Master Admin</>
            ) : user.role === 'admin' ? (
              <><Shield className="h-4 w-4" /> Admin</>
            ) : (
              <><GraduationCap className="h-4 w-4" /> Mahasiswa</>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Fingerprint className="h-4 w-4" /> ID Akun
                </p>
                <p className="text-white font-medium bg-[#121212] py-2 px-3 rounded-lg border border-[#333] inline-block">
                  #{user.id}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4" /> Email
                </p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>

            {user.role === 'mahasiswa' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" /> NIM
                  </p>
                  <p className="text-white">{user.nim || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4" /> Fakultas
                    </p>
                    <p className="text-white">{user.faculty || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <GraduationCap className="h-4 w-4" /> Program Studi
                    </p>
                    <p className="text-white">{user.study_program || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
