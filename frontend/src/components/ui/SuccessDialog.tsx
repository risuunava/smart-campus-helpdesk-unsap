"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { User, Lock, Camera, Check } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: "profile" | "password" | "avatar";
}

export function SuccessDialog({ isOpen, onClose, title, description, type }: SuccessDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "profile":
        return <User className="h-8 w-8 text-[#1ed760] relative z-10" />;
      case "password":
        return <Lock className="h-8 w-8 text-[#1ed760] relative z-10" />;
      case "avatar":
        return <Camera className="h-8 w-8 text-[#1ed760] relative z-10" />;
      default:
        return <Check className="h-8 w-8 text-[#1ed760] relative z-10" />;
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Full-screen backdrop overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Full-screen Flexbox centering wrapper (immune to transform/translation conflicts) */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <DialogPrimitive.Content className="max-w-md w-full rounded-2xl bg-th-base border th-border p-6 shadow-2xl overflow-hidden focus:outline-none relative data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
            {/* Backdrop Glow Effects */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#1ed760]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#1ed760]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              {/* Stable Glow Circle */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/20 shadow-[0_0_25px_rgba(30,215,96,0.15)]">
                <div className="absolute inset-2 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/30 flex items-center justify-center">
                  {getIcon()}
                </div>
                {/* Animated small check badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#1ed760] text-black border-2 border-th-base flex items-center justify-center shadow-lg">
                  <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <DialogPrimitive.Title className="text-xl font-bold th-text tracking-tight">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm th-text-2 max-w-xs mx-auto leading-relaxed">
                  {description}
                </DialogPrimitive.Description>
              </div>

              <Button
                onClick={onClose}
                className="btn-gradient w-full h-11 text-sm font-semibold tracking-wide shadow-lg hover:shadow-[#1ed760]/20 hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group select-none cursor-pointer"
              >
                {/* Slide-in shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_0.8s_ease-in-out]" />
                Mengerti
              </Button>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
