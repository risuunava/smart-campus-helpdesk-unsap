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
    <div className="container-mobile py-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <h1 className="text-2xl font-bold th-text tracking-tight">Profil Saya</h1>
        <p className="text-sm th-text-2 mt-1">Informasi detail akun Anda</p>
      </div>

      <div className="bg-th-base border th-border rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-[#1ed760]/20 to-transparent bg-th-sunken relative group">
          
          <Link href="/settings" className="absolute top-4 right-4 z-10 group" title="Edit Profil">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-th-base/80 backdrop-blur-md border-th-border-s th-text-2 hover:bg-[#1ed760] hover:text-black hover:border-[#1ed760] transition-all shadow-lg relative overflow-hidden">
              {/* Curved top green highlight using inset shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0px_1.5px_2px_0px_rgba(30,215,96,0.6)] opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none" />
              <Pencil className="h-4 w-4 relative z-10" />
            </Button>
          </Link>

          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden" style={{ background: 'var(--th-base)', borderColor: 'var(--th-base)' }}>
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
          <h2 className="text-2xl font-bold th-text mb-1">{user.name}</h2>
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
                <p className="text-sm font-medium th-text-m flex items-center gap-2 mb-1 uppercase tracking-wider">
                  <Fingerprint className="h-4 w-4" /> ID Akun
                </p>
                <p className="th-text font-medium bg-th-sunken py-2 px-3 rounded-lg border th-border inline-block">
                  #{user.id}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium th-text-m flex items-center gap-2 mb-1 uppercase tracking-wider">
                  <Mail className="h-4 w-4" /> Email
                </p>
                <p className="th-text">{user.email}</p>
              </div>
            </div>

            {user.role === 'mahasiswa' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium th-text-m flex items-center gap-2 mb-1 uppercase tracking-wider">
                    <User className="h-4 w-4" /> NIM
                  </p>
                  <p className="th-text">{user.nim || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium th-text-m flex items-center gap-2 mb-1 uppercase tracking-wider">
                      <BookOpen className="h-4 w-4" /> Fakultas
                    </p>
                    <p className="th-text">{user.faculty || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium th-text-m flex items-center gap-2 mb-1 uppercase tracking-wider">
                      <GraduationCap className="h-4 w-4" /> Program Studi
                    </p>
                    <p className="th-text">{user.study_program || '-'}</p>
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
