"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FAQ } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ThumbsUp,
  BookOpen,
  Loader2 
} from "lucide-react";

export default function KelolaFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "akademik",
    keywords: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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
            } catch (e) {
              faq.keywords = [];
            }
          }
          if (!Array.isArray(faq.keywords)) {
            faq.keywords = [];
          }
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

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        keywords: formData.keywords.split(",").map((k) => k.trim()),
      };

      const url = editingFAQ
        ? `${process.env.NEXT_PUBLIC_API_URL}/faqs/${editingFAQ.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/faqs`;

      const method = editingFAQ ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api.getToken()}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingFAQ ? "FAQ Diperbarui" : "FAQ Ditambahkan",
          description: editingFAQ
            ? "FAQ berhasil diperbarui"
            : "FAQ baru berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchFAQs();
      }
    } catch (error) {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus FAQ ini?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "FAQ Dihapus",
          description: "FAQ berhasil dihapus",
        });
        fetchFAQs();
      }
    } catch (error) {
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(faq: FAQ) {
    setEditingFAQ(faq);
    setFormData({
      title: faq.title,
      content: faq.content,
      category: faq.category,
      keywords: faq.keywords?.join(", ") || "",
    });
    setIsDialogOpen(true);
  }

  function openCreateDialog() {
    setEditingFAQ(null);
    setFormData({
      title: "",
      content: "",
      category: "akademik",
      keywords: "",
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setEditingFAQ(null);
    setFormData({
      title: "",
      content: "",
      category: "akademik",
      keywords: "",
    });
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.title.toLowerCase().includes(search.toLowerCase()) ||
      faq.content.toLowerCase().includes(search.toLowerCase()) ||
      faq.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold th-text flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#1ed760]" />
            Kelola FAQ
          </h1>
          <p className="th-text-2 mt-1">
            {faqs.length} FAQ tersedia untuk mahasiswa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-gradient px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 uppercase tracking-wider font-bold" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Tambah FAQ
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-th-base border th-border th-text rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingFAQ ? "Edit FAQ" : "Tambah FAQ Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-bold th-text-m mb-1 block uppercase tracking-wider">Judul FAQ</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Cara mengisi KRS online"
                  className="w-full bg-th-sunken border th-border th-text placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-bold th-text-m mb-1 block uppercase tracking-wider">Konten / Jawaban</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis jawaban lengkap untuk FAQ ini..."
                  className="w-full bg-th-sunken border th-border th-text placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all min-h-[150px] resize-y"
                />
              </div>
              <div>
                <label className="text-sm font-bold th-text-m mb-1 block uppercase tracking-wider">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-th-sunken border th-border th-text rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all cursor-pointer"
                >
                  <option value="akademik">Akademik</option>
                  <option value="keuangan">Keuangan</option>
                  <option value="fasilitas">Fasilitas</option>
                  <option value="teknologi">Teknologi</option>
                  <option value="administrasi">Administrasi</option>
                  <option value="kesejahteraan">Kesejahteraan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold th-text-m mb-1 block uppercase tracking-wider">
                  Kata Kunci (pisahkan dengan koma)
                </label>
                <input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Contoh: KRS, kartu rencana studi, akademik"
                  className="w-full bg-th-sunken border th-border th-text placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t th-border-s mt-2">
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-bold th-text-2 hover:th-text hover:bg-th-hover transition-colors"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="btn-gradient px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center"
                  onClick={handleSave}
                  disabled={isSaving || !formData.title || !formData.content}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan FAQ"
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 th-text-m" />
        <input
          placeholder="Cari FAQ berdasarkan judul atau kata kunci..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-th-base border th-border-s th-text placeholder:text-[#666666] rounded-full pl-12 pr-4 py-3 text-[13px] md:text-sm focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all shadow-sm"
        />
      </div>

      {/* FAQ List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-clean rounded-xl p-5 skeleton-pulse">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredFAQs.length === 0 ? (
          <div className="card-clean rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 th-text-f mx-auto mb-4 opacity-50" />
            <p className="th-text-2 font-medium">Tidak ada FAQ yang ditemukan.</p>
            <button className="btn-gradient mt-6 px-6 py-2.5 rounded-lg text-sm font-bold mx-auto flex items-center shadow-md hover:shadow-lg transition-shadow" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah FAQ Pertama
            </button>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div key={faq.id} className="card-clean rounded-xl p-5 transition-all duration-200 hover:th-border-s group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold th-text group-hover:text-[#1ed760] transition-colors line-clamp-1">{faq.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-th-raised th-text-2 border th-border-s shrink-0">
                      {faq.category}
                    </span>
                    {faq.keywords && faq.keywords.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {faq.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium border th-border th-text-m bg-th-sunken">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm th-text-2 line-clamp-2 mt-2 leading-relaxed">{faq.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-[11px] font-mono th-text-m font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 bg-th-raised px-2 py-1 rounded-md border th-border">
                      <Eye className="h-3.5 w-3.5" />
                      {faq.view_count} dilihat
                    </span>
                    <span className="flex items-center gap-1.5 bg-th-raised px-2 py-1 rounded-md border th-border text-[#1ed760]">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {faq.helpful_count} membantu
                    </span>
                  </div>
                </div>
                
                <div className="flex sm:flex-col gap-2 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2.5 sm:p-2 rounded-lg bg-th-raised border th-border th-text-2 hover:text-[#1ed760] hover:border-[#1ed760]/30 transition-colors flex-1 sm:flex-none flex justify-center"
                    onClick={() => openEditDialog(faq)}
                    title="Edit FAQ"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2.5 sm:p-2 rounded-lg bg-th-raised border th-border th-text-2 hover:text-[#f3727f] hover:border-[#f3727f]/30 hover:bg-[#f3727f]/10 transition-colors flex-1 sm:flex-none flex justify-center"
                    onClick={() => handleDelete(faq.id)}
                    title="Hapus FAQ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}