'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, Zap } from "lucide-react";

export default function CheckConnectionPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [backendData, setBackendData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const checkConnection = async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBackendData(data);
      setStatus('success');
    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.message || 'Gagal terhubung ke backend');
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181818] border border-[#282828] border-t-4 border-t-[#1ed760] rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#1ed760]/10 rounded-full">
              <Zap className="h-8 w-8 text-[#1ed760]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Connection Checker</h1>
          <p className="text-[#b3b3b3] mt-2 text-sm">
            Memeriksa koneksi antara Frontend (Next.js) dan Backend (Laravel)
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4 min-h-[160px]">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="h-10 w-10 text-[#1ed760] animate-spin" />
                <p className="text-sm font-medium text-[#b3b3b3]">Menghubungi backend...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-3 w-full animate-in">
                <CheckCircle2 className="h-12 w-12 text-[#1ed760]" />
                <span className="bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20 py-1 px-3 rounded-full text-xs font-semibold tracking-wider">
                  TERKONEKSI
                </span>
                <div className="bg-[#1f1f1f] border border-[#282828] p-4 rounded-lg w-full text-xs font-mono text-[#b3b3b3] overflow-auto max-h-40">
                  <pre>{JSON.stringify(backendData, null, 2)}</pre>
                </div>
                <p className="text-xs text-[#666666]">API URL: {apiUrl}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-3 w-full animate-in">
                <XCircle className="h-12 w-12 text-[#f3727f]" />
                <span className="bg-[#f3727f]/10 text-[#f3727f] border border-[#f3727f]/20 py-1 px-3 rounded-full text-xs font-semibold tracking-wider">
                  TERPUTUS
                </span>
                <div className="bg-[#f3727f]/5 p-4 rounded-lg w-full border border-[#f3727f]/20">
                  <p className="text-xs text-[#f3727f] font-medium">{error}</p>
                  <p className="text-[10px] text-[#f3727f]/70 mt-2">
                    Pastikan backend berjalan di <code className="bg-[#f3727f]/10 px-1 rounded">{apiUrl.replace('/api', '')}</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={checkConnection} 
            disabled={status === 'loading'}
            className="w-full btn-gradient py-3 text-sm flex items-center justify-center disabled:opacity-50"
          >
            {status === 'loading' ? 'Memeriksa...' : 'Cek Ulang Koneksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
