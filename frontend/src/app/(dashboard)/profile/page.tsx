"use client";

import { useAuth } from "@/hooks/useAuth";
import { User, Mail, BookOpen, GraduationCap, Shield, Fingerprint, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Profil Saya</h1>
        <p className="text-sm text-gray-400 mt-1">Informasi detail akun Anda</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#282828] rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-[#1ed760]/20 to-[#121212] relative group">
          
          <Link href="/settings" className="absolute top-4 right-4 z-10 group" title="Edit Profil">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-[#121212]/80 backdrop-blur-md border-white/5 text-gray-300 hover:bg-[#1ed760] hover:text-black hover:border-[#1ed760] transition-all shadow-lg relative overflow-hidden">
              {/* Curved top green highlight using inset shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0px_1.5px_2px_0px_rgba(30,215,96,0.6)] opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none" />
              <Pencil className="h-4 w-4 relative z-10" />
            </Button>
          </Link>

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
