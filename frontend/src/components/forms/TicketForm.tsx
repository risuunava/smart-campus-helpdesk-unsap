"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import {
  ticketFormSchema,
  TicketFormData,
  validateFile,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  X,
  Lightbulb,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
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
      let errorMessage =
        error.message || "Terjadi kesalahan. Silakan coba lagi.";

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
      <Card className="card-clean rounded-2xl max-w-2xl mx-auto border-none sm:border-solid">
        <CardHeader>
          <CardTitle className="text-xl font-bold th-text">
            Formulir Laporan
          </CardTitle>
          <CardDescription className="th-text-2">
            Silakan lengkapi detail laporan Anda di bawah ini.
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
                    <FormLabel className="th-text">Kategori Laporan *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="input-focus th-text">
                          <SelectValue placeholder="Pilih kategori laporan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="th-base th-border th-text">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="hover:bg-th-hover focus:bg-th-hover focus:text-th-text cursor-pointer">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[#f3727f]" />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="th-text">Judul Laporan *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: AC di Ruang 301 tidak berfungsi"
                        className="input-focus th-text"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="th-text-m">
                      Minimal 10 karakter. Jelaskan secara singkat masalah Anda.
                    </FormDescription>
                    <FormMessage className="text-[#f3727f]" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="th-text">Deskripsi Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan masalah Anda secara detail. Sertakan informasi seperti lokasi, waktu kejadian, dan dampak yang ditimbulkan."
                        className="input-focus min-h-[150px] th-text"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="th-text-m">
                      Minimal 20 karakter. Maksimal 5000 karakter.
                    </FormDescription>
                    <FormMessage className="text-[#f3727f]" />
                  </FormItem>
                )}
              />

              {/* File Attachment */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 th-text">
                  Lampiran (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="input-focus th-text"
                  />
                  {attachment && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachment(null)}
                      className="text-th-text-m hover:text-th-text hover:bg-th-hover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {attachment && (
                  <p className="text-sm text-[#1ed760] flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {attachmentError && (
                  <p className="text-sm text-[#f3727f] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {attachmentError}
                  </p>
                )}
                <p className="text-sm th-text-m">
                  Format: JPG, PNG, atau PDF. Maksimal 2MB.
                </p>
              </div>

              {/* Anonymous Switch */}
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4 th-border th-raised">
                    <div>
                      <FormLabel className="text-base th-text">
                        Lapor sebagai Anonim
                      </FormLabel>
                      <FormDescription className="th-text-m mt-1">
                        Identitas Anda akan disamarkan dari admin biasa. Hanya
                        Master Admin yang dapat melihat identitas asli.
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
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="submit"
                  className="btn-gradient animate-shine flex-1 order-1 sm:order-2 h-12 sm:h-10"
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
                  className="btn-gradient-outline order-2 sm:order-1 h-12 sm:h-10 px-8"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
              </div>

              {/* Rate Limit Info */}
              <p className="text-xs th-text-m text-center">
                Maksimal 3 laporan per hari per mahasiswa.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* FAQ Suggestion Dialog */}
      <Dialog open={showFAQSuggestion} onOpenChange={setShowFAQSuggestion}>
        <DialogContent className="sm:max-w-[500px] th-base th-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1ed760]">
              <Lightbulb className="h-5 w-5" />
              Saran FAQ Terkait
            </DialogTitle>
            <DialogDescription className="th-text-2">
              Berikut adalah beberapa informasi yang mungkin dapat membantu
              menyelesaikan kendala Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {faqMatches.map((faq, index) => (
              <Card key={index} className="card-hover cursor-pointer border-th-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base th-text leading-tight">{faq.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 bg-th-raised text-th-text-2">{faq.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm th-text-2 line-clamp-3">
                    {faq.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t th-border">
            <Button
              className="btn-gradient-outline w-full sm:w-auto"
              onClick={() => setShowFAQSuggestion(false)}
            >
              FAQ Tidak Membantu
            </Button>
            <Button
              className="btn-gradient w-full sm:w-auto"
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
