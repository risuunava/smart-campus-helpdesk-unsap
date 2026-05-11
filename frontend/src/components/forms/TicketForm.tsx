"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import { ticketFormSchema, TicketFormData, validateFile } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { FAQ } from "@/types";

const CATEGORIES = [
  { value: "akademik", label: "Akademik" },
  { value: "keuangan", label: "Keuangan" },
  { value: "fasilitas", label: "Fasilitas" },
  { value: "teknologi", label: "Teknologi" },
  { value: "administrasi", label: "Administrasi" },
  { value: "kesejahteraan", label: "Kesejahteraan" },
  { value: "lainnya", label: "Lainnya" },
];

export function TicketForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [faqMatches, setFaqMatches] = useState<FAQ[]>([]);
  const [showFAQSuggestion, setShowFAQSuggestion] = useState(false);
  const [isCheckingFAQ, setIsCheckingFAQ] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      is_anonymous: false,
    },
  });

  // Watch title and description for FAQ debounce
  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description");
  const debouncedTitle = useDebounce(watchedTitle, 800);
  const debouncedDescription = useDebounce(watchedDescription, 800);

  // FAQ Suggestion API Call
  useEffect(() => {
    const query = `${debouncedTitle} ${debouncedDescription}`.trim();
    
    if (query.length >= 10) {
      checkFAQSimilarity(query);
    }
  }, [debouncedTitle, debouncedDescription]);

  async function checkFAQSimilarity(query: string) {
    setIsCheckingFAQ(true);
    try {
      const response = await api.getFAQSuggestions(query);
      
      if (response.data && response.data.length > 0) {
        setFaqMatches(response.data as any);
        setShowFAQSuggestion(true);
      }
    } catch (error) {
      // Silent fail - FAQ suggestion is optional
      console.log("FAQ check failed:", error);
    } finally {
      setIsCheckingFAQ(false);
    }
  }

  // Handle file change
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        setAttachmentError(error);
        setAttachment(null);
      } else {
        setAttachmentError(null);
        setAttachment(file);
      }
    }
  }

  // Handle form submit
  async function onSubmit(data: TicketFormData) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("is_anonymous", data.is_anonymous ? "1" : "0");

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await api.createTicket(formData);

      toast({
        title: "Laporan Berhasil Dibuat!",
        description: `Tiket #${response.data.ticket_code} telah dibuat. Sistem akan memproses prioritas secara otomatis.`,
        duration: 5000,
      });

      // Reset form
      form.reset();
      setAttachment(null);
      
      // Redirect ke halaman tiket
      router.push("/mahasiswa/tiket-saya");
    } catch (error: any) {
      console.error("Form submission error:", error);
      
      // Coba ambil detail error jika ada (format Laravel validation)
      let errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi.";
      
      toast({
        title: "Gagal Membuat Laporan",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card className="bg-[#181818] border border-[#282828] rounded-2xl max-w-2xl mx-auto" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Buat Laporan Baru
          </CardTitle>
          <CardDescription className="text-[#b3b3b3]">
            Isi form di bawah untuk melaporkan keluhan atau masalah yang Anda alami.
            {isCheckingFAQ && (
              <span className="flex items-center gap-2 mt-2 text-[#1ed760]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari solusi terkait...
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Laporan *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="Pilih kategori laporan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Laporan *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: AC di Ruang 301 tidak berfungsi"
                        className="input-focus"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimal 10 karakter. Jelaskan secara singkat masalah Anda.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan masalah Anda secara detail. Sertakan informasi seperti lokasi, waktu kejadian, dan dampak yang ditimbulkan."
                        className="input-focus min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimal 20 karakter. Maksimal 5000 karakter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Attachment */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Lampiran (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="input-focus"
                  />
                  {attachment && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachment(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {attachment && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {attachmentError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {attachmentError}
                  </p>
                )}
                <p className="text-sm text-[#666666]">
                  Format: JPG, PNG, atau PDF. Maksimal 2MB.
                </p>
              </div>

              {/* Anonymous Switch */}
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-[#282828] bg-[#1f1f1f] p-4">
                    <div>
                      <FormLabel className="text-base text-white">Lapor sebagai Anonim</FormLabel>
                      <FormDescription className="text-[#666666]">
                        Identitas Anda akan disamarkan dari admin biasa.
                        Hanya Master Admin yang dapat melihat identitas asli.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="btn-gradient flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim Laporan...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Kirim Laporan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
              </div>

              {/* Rate Limit Info */}
              <p className="text-xs text-[#666666] text-center">
                Maksimal 3 laporan per hari per mahasiswa.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* FAQ Suggestion Dialog */}
      <Dialog open={showFAQSuggestion} onOpenChange={setShowFAQSuggestion}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1ed760]">
              <Lightbulb className="h-5 w-5" />
              Solusi Instan Ditemukan!
            </DialogTitle>
            <DialogDescription className="text-[#b3b3b3]">
              Kami menemukan FAQ yang mungkin bisa membantu menyelesaikan masalah Anda tanpa perlu membuat laporan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {faqMatches.map((faq, index) => (
              <Card key={index} className="card-hover cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{faq.title}</CardTitle>
                    <Badge variant="secondary">{faq.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#b3b3b3] line-clamp-3">
                    {faq.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowFAQSuggestion(false)}
            >
              FAQ Tidak Membantu
            </Button>
            <Button
              className="btn-gradient"
              onClick={() => {
                setShowFAQSuggestion(false);
                // Scroll ke atas form
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Tetap Buat Laporan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}