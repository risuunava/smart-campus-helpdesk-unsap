'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-emerald-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Zap className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Connection Checker</CardTitle>
          <CardDescription>
            Memeriksa koneksi antara Frontend (Next.js) dan Backend (Laravel)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Menghubungi backend...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-3 w-full animate-in">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
                  TERKONEKSI
                </Badge>
                <div className="bg-slate-100 p-4 rounded-lg w-full text-xs font-mono text-slate-700 overflow-auto max-h-40">
                  <pre>{JSON.stringify(backendData, null, 2)}</pre>
                </div>
                <p className="text-xs text-slate-500">API URL: {apiUrl}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-3 w-full animate-in">
                <XCircle className="h-12 w-12 text-red-500" />
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 py-1 px-3">
                  TERPUTUS
                </Badge>
                <div className="bg-red-50 p-4 rounded-lg w-full border border-red-100">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                  <p className="text-[10px] text-red-500 mt-2">
                    Pastikan backend berjalan di <code className="bg-red-100 px-1 rounded">{apiUrl.replace('/api', '')}</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={checkConnection} 
            disabled={status === 'loading'}
            className="w-full btn-gradient"
          >
            {status === 'loading' ? 'Memeriksa...' : 'Cek Ulang Koneksi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
