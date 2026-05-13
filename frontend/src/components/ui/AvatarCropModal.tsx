"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  isLoading?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  isLoading = false,
}: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  // Reset state when a new image is opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotate(0);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen, imageSrc]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
  }, []);

  const getCroppedImage = useCallback(async (): Promise<Blob> => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      throw new Error("Crop data tidak tersedia");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context gagal dibuat");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );
    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Gagal mengekspor gambar"));
        },
        "image/jpeg",
        0.92
      );
    });
  }, [completedCrop]);

  const handleConfirm = async () => {
    try {
      const blob = await getCroppedImage();
      onCropComplete(blob);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal card */}
      <div
        className="relative z-10 flex flex-col gap-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          width: "min(520px, 95vw)",
          maxHeight: "95vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #2a2a2a", background: "#111" }}
        >
          <div>
            <h2 className="text-white font-semibold text-base">Atur Foto Profil</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Geser & ubah ukuran area untuk memilih bagian foto
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area */}
        <div
          className="flex items-center justify-center overflow-auto"
          style={{
            background: "#0d0d0d",
            minHeight: "300px",
            maxHeight: "400px",
            padding: "16px",
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            minWidth={60}
            minHeight={60}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                transformOrigin: "center",
                transition: "transform 0.2s ease",
                maxWidth: "100%",
                maxHeight: "360px",
                objectFit: "contain",
              }}
            />
          </ReactCrop>
        </div>

        {/* Controls */}
        <div
          className="px-6 py-4 space-y-4"
          style={{ borderTop: "1px solid #2a2a2a" }}
        >
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full accent-[#1ed760] cursor-pointer"
              style={{ accentColor: "#1ed760" }}
            />
            <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-400 text-xs w-12 text-right">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Rotate control */}
          <div className="flex items-center gap-3">
            <RotateCw className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotate}
              onChange={(e) => setRotate(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full cursor-pointer"
              style={{ accentColor: "#1ed760" }}
            />
            <span className="text-gray-400 text-xs w-12 text-right">
              {rotate}°
            </span>
            <button
              onClick={() => setRotate(0)}
              className="text-gray-500 hover:text-gray-300 text-xs underline ml-1 whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex gap-3 px-6 pb-6"
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-[#333] text-gray-300 hover:bg-[#222] hover:text-white bg-transparent"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !completedCrop}
            className="flex-1 bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 animate-bounce" />
                Mengupload...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Simpan Foto
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
