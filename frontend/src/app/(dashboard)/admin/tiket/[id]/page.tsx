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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Star
} from "lucide-react";

export default function TicketDetailAdminPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Resolution Dialog states
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
      fetchChats();
    }
  }, [id]);

  useEffect(() => {
    // Auto scroll to bottom when new chats arrive
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
      await api.sendMessage(Number(id), newMessage);
      setNewMessage("");
      // Refresh chats
      const response = await api.getChats(Number(id));
      setChats(response.data);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }

  async function handleUpdateStatus(status: string) {
    if (status === "resolved" || status === "closed") {
      setPendingStatus(status);
      setResolutionNote(ticket?.resolution_note || "");
      setIsResolutionModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      await api.updateTicket(Number(id), { status } as any);
      fetchTicketDetail();
      toast.success("Status tiket berhasil diperbarui");
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error.message || "Gagal memperbarui status");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitResolution() {
    if (!pendingStatus || !id) return;
    if (!resolutionNote.trim()) {
      toast.error("Catatan penyelesaian wajib diisi");
      return;
    }

    setIsSubmittingStatus(true);
    try {
      await api.updateTicket(Number(id), {
        status: pendingStatus,
        resolution_note: resolutionNote,
      } as any);
      fetchTicketDetail();
      setIsResolutionModalOpen(false);
      setPendingStatus(null);
      setResolutionNote("");
      toast.success("Status tiket berhasil diperbarui");
    } catch (error: any) {
      console.error("Failed to update status with resolution:", error);
      toast.error(error.message || "Gagal memperbarui status");
    } finally {
      setIsSubmittingStatus(false);
    }
  }

  async function handleUpdatePriority(priority: string) {
    try {
      await api.updateTicket(Number(id), { priority } as any);
      fetchTicketDetail();
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-th-page">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container-mobile py-8 text-center">
        <AlertCircle className="h-12 w-12 th-text-f mx-auto mb-4" />
        <p className="th-text-m">Tiket tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 bg-th-base text-th-text border-th-border hover:bg-th-hover">
          Kembali
        </Button>
      </div>
    );
  }

  const priorityColor = getPriorityColor(ticket.priority);
  const statusColor = getStatusColor(ticket.status);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="border-b th-border bg-th-base px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="th-text-2 hover:th-text hover:bg-th-hover">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold th-text line-clamp-1">
            {ticket.ticket_code} - {ticket.title}
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
            {ticket.priority}
          </span>
          <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
            {statusColor.label}
          </span>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Ticket Detail */}
        <div className="w-full lg:w-1/3 border-r th-border bg-th-base overflow-y-auto p-6 max-h-[50vh] lg:max-h-full">
          <div className="space-y-6">
            
            {/* Mobile status pills (hidden on desktop) */}
            <div className="flex sm:hidden items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                {ticket.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                {statusColor.label}
              </span>
            </div>

            {/* Pelapor Info */}
            <div>
              <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">PELAPOR</h3>
              <div className="flex items-center gap-3 p-3 bg-th-raised rounded-lg border th-border">
                <div className="h-10 w-10 bg-[#1ed760]/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-[#1ed760]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold th-text truncate">
                    {ticket.is_anonymous ? ticket.anonymous_code : ticket.user?.name}
                  </p>
                  <p className="text-xs th-text-m truncate">
                    {ticket.is_anonymous ? "Anonim" : ticket.user?.nim}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Status & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">STATUS</h3>
                <Select onValueChange={handleUpdateStatus} value={ticket.status}>
                  <SelectTrigger className="bg-th-raised border-th-border th-text focus:ring-1 focus:ring-[#1ed760]/50 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-th-base border-th-border th-text">
                    <SelectItem value="open">Terbuka</SelectItem>
                    <SelectItem value="in_progress">Diproses</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                    <SelectItem value="closed">Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">PRIORITAS</h3>
                <Select onValueChange={handleUpdatePriority} value={ticket.priority}>
                  <SelectTrigger className="bg-th-raised border-th-border th-text focus:ring-1 focus:ring-[#1ed760]/50 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-th-base border-th-border th-text">
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket Info */}
            <div>
              <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">INFORMASI TIKET</h3>
              <div className="space-y-3 text-sm bg-th-raised p-4 rounded-lg border th-border">
                <div className="flex justify-between items-center border-b th-border-s pb-2">
                  <span className="th-text-m">Kategori:</span>
                  <span className="text-xs font-medium th-text bg-th-base px-2.5 py-1 rounded-full border th-border">{ticket.category}</span>
                </div>
                <div className="flex justify-between items-center border-b th-border-s pb-2">
                  <span className="th-text-m">Dibuat:</span>
                  <span className="th-text text-xs">{formatDate(ticket.created_at)}</span>
                </div>
                {ticket.resolved_at && (
                  <div className="flex justify-between items-center border-b th-border-s pb-2">
                    <span className="th-text-m">Selesai:</span>
                    <span className="th-text text-xs">{formatDate(ticket.resolved_at)}</span>
                  </div>
                )}
                {ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="th-text-m">ML Confidence:</span>
                    <span className="text-[#1ed760] font-mono font-bold text-xs">{(ticket.ml_confidence_score * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">DESKRIPSI</h3>
              <p className="text-[13px] th-text-2 whitespace-pre-wrap leading-relaxed bg-th-raised p-4 rounded-lg border th-border">
                {ticket.description}
              </p>
            </div>

            {/* Rating Feedback (if rated) */}
            {ticket.rating && (
              <div>
                <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">RATING & MASUKAN</h3>
                <div className="p-4 bg-th-raised border th-border rounded-lg space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= (ticket.rating ?? 0)
                            ? "fill-[#1ed760] text-[#1ed760]"
                            : "th-text-f"
                        }`}
                      />
                    ))}
                  </div>
                  {ticket.rating_comment && (
                    <p className="text-xs th-text-2 italic bg-th-base p-3 rounded border th-border-s">
                      "{ticket.rating_comment}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Attachment */}
            {ticket.attachment_path && (
              <div>
                <h3 className="text-xs font-semibold th-text-m mb-2 uppercase tracking-wider">LAMPIRAN</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-th-raised border-th-border th-text-2 hover:th-text hover:bg-th-hover w-full flex justify-between group h-11"
                  onClick={() => setIsAttachmentOpen(true)}
                >
                  <div className="flex items-center min-w-0">
                    <Paperclip className="h-4 w-4 mr-2 flex-shrink-0 th-text-m group-hover:th-text" />
                    <span className="truncate max-w-[200px]">{ticket.attachment_path.split('/').pop()}</span>
                  </div>
                  <span className="text-[10px] font-bold th-text-m group-hover:th-text ml-2 flex-shrink-0">{ticket.attachment_type?.toUpperCase()}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Chat */}
        <div className="flex-1 flex flex-col bg-th-page h-[50vh] lg:h-full border-t lg:border-t-0 th-border">
          {/* Chat Header */}
          <div className="bg-th-base border-b th-border px-6 py-3">
            <h3 className="font-semibold th-text flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#1ed760]" />
              Live Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-th-page">
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-th-raised w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 th-text-f" />
                </div>
                <p className="th-text-m font-medium">Belum ada percakapan</p>
              </div>
            ) : (
              chats.map((chat) => {
                const isSelf = chat.sender_id === user?.id;
                const isMahasiswa = chat.sender_type === "mahasiswa";
                const isAdmin = chat.sender_type === "admin";
                const isSystem = chat.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={chat.id} className="flex justify-center my-2">
                      <div className="bg-th-raised border border-[#ffa42b]/30 text-[#ffa42b] px-4 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-2">
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
                    {/* Avatar / Icon Side */}
                    <div className="flex-shrink-0 mt-auto">
                      <div className={`h-9 w-9 overflow-hidden rounded-full flex items-center justify-center border ${
                        isSelf 
                          ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
                          : chat.sender?.role === "master_admin"
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                          : isMahasiswa
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-th-raised border-th-border-s th-text-2"
                      }`}>
                        {chat.sender?.avatar_url && (!isMahasiswa || !ticket.is_anonymous) ? (
                          <img src={chat.sender.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                        ) : isMahasiswa ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                      {/* Header: Name & Time */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-semibold th-text-2">
                          {isSelf 
                            ? (chat.sender?.role === "master_admin" ? "Admin Pengembang (Anda)" : "Admin Yayasan (Anda)") 
                            : (chat.sender?.name || "Mahasiswa")}
                        </span>
                        <span className="text-[9px] th-text-f flex items-center gap-1 uppercase tracking-tight font-medium">
                          • {timeAgo(chat.created_at)}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl shadow-sm transition-all ${
                          isSelf
                            ? "bg-[#1ed760] text-black rounded-br-sm"
                            : "bg-th-base th-text border th-border rounded-bl-sm"
                        }`}
                      >
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="bg-th-base border-t th-border p-4">
            <div className="flex gap-2 relative">
              <input
                placeholder="Ketik balasan untuk pengguna..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-th-sunken border th-border th-text placeholder:text-[#666666] rounded-full pl-5 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all shadow-inner"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="btn-gradient absolute right-1.5 top-1.5 bottom-1.5 rounded-full aspect-square w-9 h-9 p-0 shadow-md"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Modal */}
      <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
        <DialogContent className="bg-th-sunken border-th-border th-text max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b th-border bg-th-base">
            <DialogTitle className="text-xl th-text">Bukti Laporan</DialogTitle>
            <DialogDescription className="th-text-2 mt-1">
              {ticket.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-th-page min-h-[400px]">
            {ticket?.attachment_type?.match(/^(jpg|jpeg|png|gif)$/i) ? (
              <img 
                src={ticket.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket.attachment_path}`} 
                alt="Lampiran Tiket" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-black/10 dark:border-white/10"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 th-text-f">
                <Paperclip className="h-16 w-16" />
                <p>Preview tidak tersedia untuk format file ini ({ticket?.attachment_type?.toUpperCase()})</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t th-border flex justify-end bg-th-base">
            <Button 
              className="btn-gradient"
              onClick={() => {
                const url = ticket?.attachment_url || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${ticket?.attachment_path}`;
                window.open(url, '_blank');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Unduh File Asli
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolution Note Modal */}
      <Dialog open={isResolutionModalOpen} onOpenChange={setIsResolutionModalOpen}>
        <DialogContent className="bg-th-base border-th-border th-text max-w-lg overflow-hidden flex flex-col p-6 rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl th-text">Catatan Penyelesaian Laporan</DialogTitle>
            <DialogDescription className="th-text-2 mt-2">
              Mohon tuliskan solusi atau tindakan yang telah diambil untuk menyelesaikan laporan ini. Informasi ini wajib diisi dan akan dikirimkan kepada pelapor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <Textarea
              placeholder="Tulis solusi penyelesaian laporan di sini..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="bg-th-sunken border-th-border th-text focus:ring-1 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none h-32 resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t th-border-s">
            <Button
              variant="outline"
              onClick={() => {
                setIsResolutionModalOpen(false);
                setPendingStatus(null);
                setResolutionNote("");
              }}
              className="border-th-border th-text-2 hover:bg-th-hover hover:th-text"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitResolution}
              disabled={isSubmittingStatus || !resolutionNote.trim()}
              className="btn-gradient"
            >
              {isSubmittingStatus && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Simpan & Perbarui Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}