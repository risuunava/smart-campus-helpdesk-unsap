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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#1ed760]" />
            Kelola FAQ
          </h1>
          <p className="text-[#b3b3b3]">
            {faqs.length} FAQ tersedia untuk mahasiswa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-gradient px-4 py-2 text-sm flex items-center gap-2 uppercase tracking-wider" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Tambah FAQ
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#181818] border border-[#282828] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingFAQ ? "Edit FAQ" : "Tambah FAQ Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-bold text-[#b3b3b3] mb-1 block uppercase tracking-wider">Judul FAQ</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Cara mengisi KRS online"
                  className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#b3b3b3] mb-1 block uppercase tracking-wider">Konten / Jawaban</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis jawaban lengkap untuk FAQ ini..."
                  className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all min-h-[150px] resize-y"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#b3b3b3] mb-1 block uppercase tracking-wider">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
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
                <label className="text-sm font-bold text-[#b3b3b3] mb-1 block uppercase tracking-wider">
                  Kata Kunci (pisahkan dengan koma)
                </label>
                <input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Contoh: KRS, kartu rencana studi, akademik"
                  className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="btn-gradient px-6 py-2 text-sm disabled:opacity-50 flex items-center"
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
        <input
          placeholder="Cari FAQ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
        />
      </div>

      {/* FAQ List */}
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#282828] rounded-xl p-5">
              <Skeleton className="h-5 w-3/4 mb-2 bg-[#282828]" />
              <Skeleton className="h-4 w-full mb-2 bg-[#282828]" />
              <Skeleton className="h-4 w-1/2 bg-[#282828]" />
            </div>
          ))
        ) : filteredFAQs.length === 0 ? (
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 text-[#4d4d4d] mx-auto mb-4" />
            <p className="text-[#666666]">Belum ada FAQ</p>
            <button className="btn-gradient mt-6 px-6 py-2.5 text-sm mx-auto flex items-center" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah FAQ Pertama
            </button>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all duration-200 hover:bg-[#1f1f1f] hover:border-[#3a3a3a] group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-white group-hover:text-[#1ed760] transition-colors">{faq.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#252525] text-[#b3b3b3] border border-[#282828]">
                      {faq.category}
                    </span>
                    {faq.keywords && faq.keywords.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {faq.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#4d4d4d] text-[#666666]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[#b3b3b3] line-clamp-2 mt-2">{faq.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs font-mono text-[#666666]">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {faq.view_count} dilihat
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {faq.helpful_count} membantu
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 rounded-full hover:bg-[#1f1f1f] text-[#b3b3b3] hover:text-[#1ed760] transition-colors"
                    onClick={() => openEditDialog(faq)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-[#1f1f1f] text-[#b3b3b3] hover:text-[#f3727f] transition-colors"
                    onClick={() => handleDelete(faq.id)}
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