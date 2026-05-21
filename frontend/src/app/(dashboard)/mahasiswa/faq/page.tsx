"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api";
import { FAQ } from "@/types";
import { Search, BookOpen, ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

function FAQContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  async function fetchFAQs() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs`, {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        let rawFaqs = data.data.data ? data.data.data : data.data;
        rawFaqs = rawFaqs.map((faq: any) => {
          if (typeof faq.keywords === 'string') {
            try { 
              faq.keywords = JSON.parse(faq.keywords);
              if (typeof faq.keywords === 'string') {
                faq.keywords = JSON.parse(faq.keywords);
              }
            } catch(e) {}
          }
          if (!Array.isArray(faq.keywords)) faq.keywords = [];
          return faq;
        });
        setFaqs(rawFaqs);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const categories = ["Semua", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.title.toLowerCase().includes(search.toLowerCase()) || 
                          faq.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-mobile py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Search */}
      <div className="bg-th-sunken border th-border rounded-[32px] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1ed760]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1ed760]/60 to-transparent" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(30,215,96,0.15)]">
            <BookOpen className="h-6 w-6 text-[#1ed760]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold th-text mb-3 tracking-tight">Pusat Bantuan</h1>
          <p className="th-text-2 text-xs md:text-sm max-w-lg mx-auto">Temukan jawaban cepat untuk pertanyaan umum seputar layanan, akademik, dan fasilitas kampus.</p>
        </div>

        <div className="relative max-w-3xl mx-auto z-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 th-text-m" />
          <input
            type="text"
            placeholder="Cari solusi (mis. KRS, Password, Fasilitas)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-th-base border th-border-s rounded-full py-3.5 pl-14 pr-6 th-text outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] transition-all shadow-xl text-[13px] md:text-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      {!isLoading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                activeCategory === cat 
                  ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/50 shadow-[0_0_10px_rgba(30,215,96,0.2)]" 
                  : "bg-th-raised th-text-2 border-th-border hover:bg-th-hover hover:th-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="card-clean rounded-2xl p-6 skeleton-pulse">
               <div className="h-6 bg-th-raised rounded w-3/4 mb-4"></div>
               <div className="h-4 bg-th-raised rounded w-1/4"></div>
             </div>
          ))
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-16 card-clean rounded-2xl">
            <BookOpen className="h-12 w-12 th-text-f mx-auto mb-4" />
            <h3 className="th-text font-bold text-lg mb-2">Tidak menemukan jawaban</h3>
            <p className="th-text-m text-sm">Coba gunakan kata kunci lain atau buat laporan tiket baru.</p>
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`bg-th-sunken border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#1ed760]/40 shadow-[0_4px_20px_rgba(30,215,96,0.08)]' : 'border-th-border-s hover:border-th-border'}`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-semibold text-[13px] md:text-sm transition-colors pr-4 ${isExpanded ? 'text-[#1ed760]' : 'th-text'}`}>
                    {faq.title}
                  </span>
                  <div className={`p-1.5 rounded-full bg-th-base border transition-colors shrink-0 ${isExpanded ? 'border-[#1ed760]/30 text-[#1ed760]' : 'border-th-border-s th-text-m'}`}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                
                <div 
                  className={`px-5 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] pb-5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <div className="pt-3 border-t th-border-s">
                    <p className="th-text-2 text-[12px] md:text-[13px] leading-relaxed whitespace-pre-wrap mt-2">
                      {faq.content}
                    </p>
                    
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex gap-2">
                        {faq.keywords && faq.keywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-th-base th-text-m border th-border-s">
                            #{kw}
                          </span>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           // Mockup action, real endpoint logic can go here
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold th-text-2 hover:text-[#1ed760] hover:bg-[#1ed760]/10 border border-transparent hover:border-[#1ed760]/20 transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Membantu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function MahasiswaFAQPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center th-text">Memuat Pusat Bantuan...</div>}>
      <FAQContent />
    </Suspense>
  );
}
