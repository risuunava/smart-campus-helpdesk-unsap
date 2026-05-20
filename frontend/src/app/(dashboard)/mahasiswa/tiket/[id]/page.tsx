"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket, Chat } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPriorityColor, getStatusColor, formatDate, timeAgo } from "@/lib/utils";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Shield, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Paperclip,
  Download,
  Trash2,
  Upload,
  Edit2,
  Star
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container-mobile py-8 text-center">
        <AlertCircle className="h-16 w-16 text-[#4d4d4d] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Tiket Tidak Ditemukan</h2>
        <p className="text-[#666666] mb-4">Tiket yang Anda cari tidak tersedia atau telah dihapus.</p>
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
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-sm text-[#666666]">{ticket.ticket_code}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}>
              {ticket.priority === "urgent" ? "URGENT" : ticket.priority === "normal" ? "NORMAL" : "LOW"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {statusColor.label}
            </span>
            {ticket.is_anonymous && (
              <Badge variant="outline" className="text-xs">
                Anonim
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-bold text-white">Deskripsi Laporan</h3>
            </div>
            <div className="px-6 pb-6">
              <p className="text-[#b3b3b3] whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
              
              {ticket.attachment_path && (
                <div className="mt-4 p-4 bg-[#1f1f1f] border border-[#282828] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-5 w-5 text-[#666666]" />
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{ticket.attachment_path.split('/').pop()}</p>
                      <p className="text-xs text-[#666666]">
                        {ticket.attachment_type?.toUpperCase()} File
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#4d4d4d] text-[#b3b3b3] hover:text-white hover:border-white"
                    onClick={() => setIsAttachmentOpen(true)}
                  >
                    Lihat Lampiran
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Note (if resolved) */}
          {ticket.resolution_note && (
            <div className="bg-[#1ed760]/10 border border-[#1ed760]/20 rounded-xl">
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-lg font-bold text-[#1ed760] flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Catatan Penyelesaian
                </h3>
              </div>
              <div className="px-6 pb-6">
                <p className="text-[#1ed760]/80">{ticket.resolution_note}</p>
                {ticket.resolved_at && (
                  <p className="text-xs text-[#1ed760]/60 mt-2">
                    Diselesaikan pada {formatDate(ticket.resolved_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rating Section (resolved/closed) */}
          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
              {ticket.rating ? (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#1ed760] fill-[#1ed760]" />
                    Feedback Anda
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (ticket.rating ?? 0)
                            ? "fill-[#1ed760] text-[#1ed760]"
                            : "text-[#4d4d4d]"
                        }`}
                      />
                    ))}
                  </div>
                  {ticket.rating_comment && (
                    <p className="text-[#b3b3b3] text-sm italic mt-2 bg-[#1f1f1f] p-3 rounded-lg border border-[#282828]">
                      "{ticket.rating_comment}"
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Berikan Rating Layanan</h3>
                  <p className="text-sm text-[#b3b3b3] mb-4">Bagaimana penilaian Anda terhadap penanganan tiket ini?</p>
                  
                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform active:scale-95"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-[#1ed760] text-[#1ed760]"
                              : "text-[#4d4d4d]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Comment */}
                  <textarea
                    placeholder="Tulis masukan Anda di sini (opsional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all resize-none h-24 mb-4"
                  />
                  
                  <Button
                    onClick={handleSubmitRating}
                    disabled={isSubmittingRating || rating === 0}
                    className="btn-gradient w-full"
                  >
                    {isSubmittingRating && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Kirim Feedback
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#1ed760]" />
                Diskusi Tiket
              </h3>
            </div>
            <div className="px-6 pb-6">
              {/* Chat Messages */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto mb-4 pr-4 custom-scrollbar">
                {chats.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-[#1f1f1f] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-[#4d4d4d]" />
                    </div>
                    <p className="text-[#b3b3b3] font-medium">Belum ada percakapan</p>
                    <p className="text-sm text-[#666666] mt-1">
                      Kirim pesan untuk berkomunikasi dengan admin
                    </p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isSelf = chat.sender_id === user?.id;
                    const isAdmin = chat.sender_type === "admin";
                    const isSystem = chat.sender_type === "system";

                    if (isSystem) {
                      return (
                        <div key={chat.id} className="flex justify-center my-2">
                          <div className="bg-[#1f1f1f] border border-[#ffa42b]/30 text-[#ffa42b] px-4 py-1.5 rounded-full text-xs flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{chat.message}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={chat.id}
                        className={`flex gap-3 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 overflow-hidden rounded-full flex items-center justify-center border ${
                            isSelf 
                              ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
                              : chat.sender?.role === "master_admin"
                              ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                              : isAdmin 
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                              : "bg-[#282828] border-[#333333] text-[#b3b3b3]"
                          }`}>
                            {chat.sender?.avatar_url && (!isSelf || !ticket.is_anonymous) ? (
                              <img src={chat.sender.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                            ) : isAdmin ? (
                              <Shield className="h-5 w-5" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                        </div>

                        {/* Content Side */}
                        <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[80%]`}>
                          {/* Header: Name & Time */}
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] font-semibold text-white/90">
                              {isSelf ? "Anda" : (chat.sender?.role === "master_admin" ? "Admin Pengembang" : "Admin Yayasan")}
                            </span>
                            <span className="text-[9px] text-[#666666] flex items-center gap-1 uppercase tracking-tight">
                              • {timeAgo(chat.created_at)}
                            </span>
                          </div>

                          {/* Bubble */}
                          <div
                            className={`p-2.5 sm:p-3 rounded-2xl shadow-md transition-all ${
                              isSelf
                                ? "bg-[#1ed760] text-black rounded-tr-none"
                                : "bg-[#282828] text-white/90 border border-[#333333] rounded-tl-none"
                            }`}
                          >
                            <p className="text-[13px] leading-snug whitespace-pre-wrap">{chat.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {ticket.status !== "closed" && (
                <div className="flex gap-2 pt-4 border-t border-[#282828]">
                  <input
                    placeholder="Ketik pesan Anda..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isSending}
                    className="flex-1 bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="btn-gradient rounded-full"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {ticket.status === "closed" && (
                <div className="pt-4 border-t border-[#282828]">
                  <p className="text-center text-sm text-[#666666]">
                    Tiket sudah ditutup. Chat tidak dapat dilanjutkan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-bold text-white">Informasi Tiket</h3>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">Kategori</span>
                <span className="text-xs text-[#b3b3b3] bg-[#252525] px-2.5 py-1 rounded-full border border-[#282828]">{ticket.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">Prioritas</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                  {statusColor.label}
                </span>
              </div>
              <div className="border-t border-[#282828]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">Dibuat</span>
                <span className="text-sm text-[#b3b3b3]">{formatDate(ticket.created_at)}</span>
              </div>
              {ticket.resolved_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">Diselesaikan</span>
                  <span className="text-sm text-[#b3b3b3]">{formatDate(ticket.resolved_at)}</span>
                </div>
              )}
              {ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">AI Confidence</span>
                  <span className="text-sm font-mono text-[#1ed760]">
                    {(ticket.ml_confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-bold text-white">Timeline</h3>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[#539df5]" />
                    <div className="w-0.5 h-full bg-[#282828]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Tiket Dibuat</p>
                    <p className="text-xs text-[#666666]">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>

                {ticket.assigned_to && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-400" />
                      <div className="w-0.5 h-full bg-[#282828]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Ditugaskan ke Admin</p>
                      <p className="text-xs text-[#666666]">
                        {ticket.assigned_admin?.name || "Admin"}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.resolved_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-[#1ed760]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Tiket Selesai</p>
                      <p className="text-xs text-[#666666]">{formatDate(ticket.resolved_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 space-y-2">
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
              onClick={() => router.push("/mahasiswa/tiket-saya")}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Tiket
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
              onClick={() => router.push("/mahasiswa/buat-laporan")}
            >
              <MessageSquare className="h-4 w-4" />
              Buat Laporan Baru
            </button>
          </div>
        </div>
      </div>

      {/* Attachment Modal */}
      <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
        <DialogContent className="bg-[#181818] border-[#282828] text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-[#282828]">
            <DialogTitle className="text-xl">Bukti Laporan</DialogTitle>
            <DialogDescription className="text-[#b3b3b3]">
              {ticket.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-[#121212] min-h-[400px]">
            {ticket?.attachment_type?.match(/^(jpg|jpeg|png|gif)$/i) ? (
              <img 
                src={ticket.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket.attachment_path}`} 
                alt="Lampiran Tiket" 
                className="max-w-full max-h-[60vh] object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-[#666666]">
                <Paperclip className="h-16 w-16" />
                <p>Preview tidak tersedia untuk format file ini ({ticket?.attachment_type?.toUpperCase()})</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[#282828] flex justify-between bg-[#181818] items-center">
            {ticket.status !== 'closed' ? (
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline"
                  className="border-[#4d4d4d] text-white hover:bg-[#282828]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingAttachment}
                >
                  {isUpdatingAttachment ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Edit2 className="h-4 w-4 mr-2" />
                  )}
                  Ubah Foto
                </Button>
                <Button 
                  variant="destructive"
                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                  onClick={handleDeleteAttachment}
                  disabled={isUpdatingAttachment}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Foto
                </Button>
              </div>
            ) : (
              <div className="text-sm text-[#666666] italic">Tiket telah ditutup, tidak dapat mengubah lampiran.</div>
            )}
            <Button 
              className="btn-gradient"
              onClick={() => {
                const url = ticket?.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket?.attachment_path}`;
                window.open(url, '_blank');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Unduh File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}