"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket, Chat } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPriorityColor, getStatusColor, formatDate, timeAgo } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Paperclip,
  Download,
  Trash2,
  Edit2,
  Star,
  FileText
} from "lucide-react";

export default function TicketDetailMahasiswaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isUpdatingAttachment, setIsUpdatingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Rating states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
      fetchChats();
    }
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  async function fetchTicketDetail() {
    try {
      const response = await api.getTicket(Number(id));
      setTicket(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchChats() {
    try {
      const response = await api.getChats(Number(id));
      setChats(response.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !id) return;
    
    setIsSending(true);
    try {
      const response = await api.sendMessage(Number(id), newMessage);
      setNewMessage("");
      setChats([...chats, response.data]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setIsUpdatingAttachment(true);
    try {
      const response = await api.updateAttachment(Number(id), file);
      setTicket(response.data);
      toast.success("Lampiran berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui lampiran");
    } finally {
      setIsUpdatingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDeleteAttachment() {
    if (!id || !confirm("Apakah Anda yakin ingin menghapus lampiran ini?")) return;

    setIsUpdatingAttachment(true);
    try {
      const response = await api.deleteAttachment(Number(id));
      setTicket(response.data);
      setIsAttachmentOpen(false);
      toast.success("Lampiran berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus lampiran");
    } finally {
      setIsUpdatingAttachment(false);
    }
  }

  async function handleSubmitRating() {
    if (rating === 0 || !id) return;
    
    setIsSubmittingRating(true);
    try {
      const response = await api.rateTicket(Number(id), {
        rating,
        rating_comment: comment,
      });
      setTicket(response.data);
      toast.success("Terima kasih atas penilaian Anda!");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim rating");
    } finally {
      setIsSubmittingRating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-th-page">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container-mobile py-8 text-center">
        <AlertCircle className="h-16 w-16 text-th-text-f mx-auto mb-4" />
        <h2 className="text-xl font-semibold th-text mb-2">Tiket Tidak Ditemukan</h2>
        <p className="th-text-m mb-4">Tiket yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button onClick={() => router.push("/mahasiswa/tiket-saya")} className="btn-gradient">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Tiket
        </Button>
      </div>
    );
  }

  const priorityColor = getPriorityColor(ticket.priority);
  const statusColor = getStatusColor(ticket.status);

  return (
    <div className="container-mobile py-4 md:py-8 h-[calc(100vh-70px)] md:h-auto md:min-h-[800px] flex flex-col">
      {/* Header Compact */}
      <div className="flex items-start gap-3 mb-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="th-text-2 hover:th-text hover:bg-th-hover mt-1 shrink-0 px-2 h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold th-text truncate">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="font-mono text-[10px] th-text-m">{ticket.ticket_code}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
              {ticket.priority === "urgent" ? "URGENT" : ticket.priority === "normal" ? "NORMAL" : "LOW"}
            </span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
              {statusColor.label}
            </span>
            {ticket.is_anonymous && (
              <Badge variant="outline" className="text-[9px] border-th-border-s th-text-2 h-5">Anonim</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs View */}
      <Tabs defaultValue="diskusi" className="flex-1 flex flex-col min-h-0">
        <TabsList className="card-clean w-full justify-start rounded-xl p-1 shrink-0">
          <TabsTrigger value="diskusi" className="flex-1 text-xs font-semibold data-[state=active]:bg-th-raised data-[state=active]:text-th-text data-[state=active]:shadow-sm rounded-lg transition-all text-th-text-2">
            <MessageSquare className="w-3.5 h-3.5 mr-2" /> Diskusi
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex-1 text-xs font-semibold data-[state=active]:bg-th-raised data-[state=active]:text-th-text data-[state=active]:shadow-sm rounded-lg transition-all text-th-text-2">
            <FileText className="w-3.5 h-3.5 mr-2" /> Detail & Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diskusi" className="flex-1 flex flex-col min-h-0 mt-4 card-clean rounded-2xl overflow-hidden focus-visible:ring-0">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-th-raised w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 th-text-f" />
                </div>
                <p className="text-sm th-text-2 font-bold tracking-wide">Belum ada percakapan</p>
                <p className="text-xs th-text-m mt-1">Kirim pesan untuk berkomunikasi dengan tim admin.</p>
              </div>
            ) : (
              chats.map((chat) => {
                const isSelf = chat.sender_id === user?.id;
                const isAdmin = chat.sender_type === "admin";
                const isSystem = chat.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={chat.id} className="flex justify-center my-2">
                      <div className="bg-th-raised border border-[#ffa42b]/30 text-[#ffa42b] px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1.5 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{chat.message}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={chat.id} className={`flex gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="flex-shrink-0 mt-auto mb-1">
                      <div className={`h-8 w-8 overflow-hidden rounded-full flex items-center justify-center border ${
                        isSelf 
                          ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
                          : chat.sender?.role === "master_admin"
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                          : isAdmin 
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                          : "bg-th-raised border-th-border-s th-text-2"
                      }`}>
                        {chat.sender?.avatar_url && (!isSelf || !ticket.is_anonymous) ? (
                          <img src={chat.sender.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                        ) : isAdmin ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[85%]`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold th-text-2">
                          {isSelf ? "Anda" : (chat.sender?.role === "master_admin" ? "Admin Pengembang" : "Admin Yayasan")}
                        </span>
                        <span className="text-[9px] th-text-m flex items-center gap-1 uppercase tracking-tight font-medium">
                          {timeAgo(chat.created_at)}
                        </span>
                      </div>

                      <div className={`p-3 rounded-[18px] shadow-sm transition-all ${
                          isSelf
                            ? "bg-[#1ed760] text-black rounded-br-sm shadow-[#1ed760]/10"
                            : "bg-th-raised text-th-text border border-th-border-s rounded-bl-sm"
                        }`}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words overflow-hidden font-medium">{chat.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Area */}
          {ticket.status !== "closed" && (
            <div className="p-3 border-t th-border bg-th-sunken">
              <div className="flex gap-2">
                <input
                  placeholder="Ketik pesan balasan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                  className="flex-1 input-focus rounded-full px-4 py-2 text-xs"
                />
                <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} className="btn-gradient rounded-full h-9 w-9 p-0 shrink-0 shadow-lg">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                </Button>
              </div>
            </div>
          )}
          {ticket.status === "closed" && (
            <div className="p-4 border-t th-border bg-th-sunken">
              <p className="text-center text-[10px] font-bold tracking-widest uppercase th-text-m">Laporan Ditutup. Diskusi Berakhir.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="detail" className="flex-1 overflow-y-auto mt-4 space-y-4 focus-visible:ring-0 custom-scrollbar pb-8">
          {/* Main Description */}
          <div className="card-clean rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase tracking-widest th-text-m mb-3 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#1ed760]"/> Rincian Laporan
            </h3>
            <p className="text-[13px] th-text-2 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            
            {ticket.attachment_path && (
              <div className="mt-5 p-3 th-base border th-border rounded-xl flex items-center justify-between hover:th-border-s transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-lg th-raised flex items-center justify-center shrink-0 border th-border-s">
                    <Paperclip className="h-4 w-4 th-text-f" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-bold th-text truncate mb-0.5">{ticket.attachment_path.split('/').pop()}</p>
                    <p className="text-[9px] font-bold tracking-wider th-text-m uppercase">{ticket.attachment_type} FILE</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#1ed760] hover:text-[#1fdf64] hover:bg-[#1ed760]/10 shrink-0 text-xs font-bold rounded-lg px-4" onClick={() => setIsAttachmentOpen(true)}>
                  Buka
                </Button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Info Metrics */}
            <div className="card-clean rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase tracking-widest th-text-m mb-4">Metadata</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs border-b th-border-s pb-3">
                  <span className="th-text-m font-medium">Kategori</span>
                  <span className="th-text th-raised px-2.5 py-1 rounded-md border th-border-s font-bold">{ticket.category}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b th-border-s pb-3">
                  <span className="th-text-m font-medium">Tanggal Dibuat</span>
                  <span className="th-text font-medium">{formatDate(ticket.created_at)}</span>
                </div>
                {ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="th-text-m font-medium">Akurasi AI (Labeling)</span>
                    <span className="font-mono font-bold text-[#1ed760]">{(ticket.ml_confidence_score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card-clean rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase tracking-widest th-text-m mb-4">Riwayat Waktu</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[#539df5] shadow-[0_0_8px_rgba(83,157,245,0.4)]" />
                    {ticket.assigned_to && <div className="w-px h-full bg-th-border mt-2" />}
                  </div>
                  <div className="-mt-1.5 pb-2">
                    <p className="text-xs font-bold th-text">Laporan Terkirim</p>
                    <p className="text-[10px] th-text-m mt-0.5">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>
                {ticket.assigned_to && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]" />
                      {ticket.resolved_at && <div className="w-px h-full bg-th-border mt-2" />}
                    </div>
                    <div className="-mt-1.5 pb-2">
                      <p className="text-xs font-bold th-text">Diproses Oleh</p>
                      <p className="text-[10px] th-text-2 mt-0.5">{ticket.assigned_admin?.name || "Admin"}</p>
                    </div>
                  </div>
                )}
                {ticket.resolved_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-[#1ed760] shadow-[0_0_8px_rgba(30,215,96,0.4)]" />
                    </div>
                    <div className="-mt-1.5">
                      <p className="text-xs font-bold th-text">Diselesaikan</p>
                      <p className="text-[10px] th-text-m mt-0.5">{formatDate(ticket.resolved_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Result Note */}
          {ticket.resolution_note && (
            <div className="bg-gradient-to-br from-[#1ed760]/10 to-transparent border border-[#1ed760]/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CheckCircle2 className="w-24 h-24 text-[#1ed760]" />
              </div>
              <h3 className="text-sm font-black text-[#1ed760] mb-2 flex items-center gap-2 relative z-10">
                <CheckCircle2 className="h-4 w-4" /> Hasil Penyelesaian
              </h3>
              <p className="text-xs th-text leading-relaxed font-medium relative z-10 opacity-90">{ticket.resolution_note}</p>
            </div>
          )}

          {/* Rating Engine */}
          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <div className="card-clean rounded-2xl p-5">
              {ticket.rating ? (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest th-text-m mb-3 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-[#1ed760] fill-[#1ed760]" /> Feedback Tersimpan
                  </h3>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-5 w-5 ${s <= (ticket.rating??0) ? "fill-[#1ed760] text-[#1ed760]" : "th-text-f"}`} />)}
                  </div>
                  {ticket.rating_comment && (
                    <p className="text-xs th-text-2 font-medium bg-th-sunken p-3 rounded-xl border th-border italic">"{ticket.rating_comment}"</p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-bold th-text mb-1">Berikan Penilaian Anda</h3>
                  <p className="text-[11px] th-text-m mb-4">Bantu kami meningkatkan layanan dengan memberikan ulasan.</p>
                  
                  <div className="flex gap-3 mb-4 justify-center bg-th-sunken p-4 rounded-xl border th-border">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="hover:scale-110 transition-transform">
                        <Star className={`h-7 w-7 transition-colors ${s <= (hoverRating || rating) ? "fill-[#1ed760] text-[#1ed760]" : "text-[#4d4d4d]"}`} />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    placeholder="Tulis ulasan tambahan (opsional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full input-focus rounded-xl p-4 h-24 mb-4 transition-all resize-none"
                  />
                  <Button onClick={handleSubmitRating} disabled={isSubmittingRating || rating === 0} className="w-full btn-gradient h-11 text-xs font-bold tracking-wide rounded-xl">
                    {isSubmittingRating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Kirim Ulasan
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Attachment Modal */}
      <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
        <DialogContent className="bg-th-sunken border-th-border th-text max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl">
          <DialogHeader className="p-5 border-b th-border bg-th-base">
            <DialogTitle className="text-base font-bold th-text">File Lampiran</DialogTitle>
            <DialogDescription className="th-text-m text-xs truncate mt-1">
              {ticket?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center bg-th-page min-h-[300px]">
            {ticket?.attachment_type?.match(/^(jpg|jpeg|png|gif)$/i) ? (
              <img 
                src={ticket.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket.attachment_path}`} 
                alt="Lampiran Tiket" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border border-black/10 dark:border-white/5"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 th-text-f">
                <Paperclip className="h-12 w-12" />
                <p className="text-xs font-medium">Format {ticket?.attachment_type?.toUpperCase()} tidak dapat dipreview</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t th-border bg-th-base flex flex-wrap gap-2 justify-between items-center">
            {ticket?.status !== 'closed' ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-th-border-s th-text-2 hover:bg-th-hover hover:th-text rounded-lg text-xs" onClick={() => fileInputRef.current?.click()} disabled={isUpdatingAttachment}>
                  {isUpdatingAttachment ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Edit2 className="h-3.5 w-3.5 mr-2" />} Ubah
                </Button>
                <Button variant="destructive" size="sm" className="flex-1 sm:flex-none bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs" onClick={handleDeleteAttachment} disabled={isUpdatingAttachment}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus
                </Button>
              </div>
            ) : (
              <div className="text-[10px] th-text-m font-bold uppercase tracking-widest">Tiket ditutup.</div>
            )}
            <Button className="btn-gradient rounded-lg text-xs w-full sm:w-auto h-9 mt-2 sm:mt-0" onClick={() => window.open(ticket?.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket?.attachment_path}`, '_blank')}>
              <Download className="h-3.5 w-3.5 mr-2" /> Unduh Asli
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}