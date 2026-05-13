"use client";

import { useAuth } from "@/hooks/useAuth";
import { 
  Bell, 
  Settings, 
  User, 
  LogOut
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#121212]/80 backdrop-blur-md border-b border-[#282828] z-40 px-4 md:px-8 flex items-center justify-end">
      <div className="flex items-center gap-4">
        
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#121212]"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none ml-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#1ed760]/20 flex items-center justify-center border border-[#1ed760]/30 hover:border-[#1ed760]/80 transition-colors overflow-hidden">
                {user.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.name} 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <User className="h-5 w-5 text-[#1ed760]" />
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#333] text-white">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-gray-400">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem asChild className="hover:bg-[#282828] cursor-pointer">
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-[#282828] cursor-pointer">
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
