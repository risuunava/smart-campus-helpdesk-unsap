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
  Download
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
    try {
      await api.updateTicket(Number(id), { status } as any);
      fetchTicketDetail();
    } catch (error) {
      console.error("Failed to update status:", error);
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container-mobile py-8 text-center">
        <AlertCircle className="h-12 w-12 text-[#4d4d4d] mx-auto mb-4" />
        <p className="text-[#666666]">Tiket tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
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
      <div className="border-b border-[#282828] bg-[#181818] px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">
            {ticket.ticket_code} - {ticket.title}
          </h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
          {priorityColor.icon} {ticket.priority}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
          {statusColor.label}
        </span>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Ticket Detail */}
        <div className="w-1/3 border-r border-[#282828] bg-[#181818] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Pelapor Info */}
            <div>
              <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">PELAPOR</h3>
              <div className="flex items-center gap-3 p-3 bg-[#1f1f1f] rounded-lg border border-[#282828]">
                <div className="h-10 w-10 bg-[#1ed760]/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-[#1ed760]" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {ticket.is_anonymous ? ticket.anonymous_code : ticket.user?.name}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {ticket.is_anonymous ? "Anonim" : ticket.user?.nim}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div>
              <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">UPDATE STATUS</h3>
              <Select onValueChange={handleUpdateStatus} value={ticket.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Terbuka</SelectItem>
                  <SelectItem value="in_progress">Diproses</SelectItem>
                  <SelectItem value="resolved">Selesai</SelectItem>
                  <SelectItem value="closed">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Update Priority */}
            <div>
              <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">UPDATE PRIORITAS</h3>
              <Select onValueChange={handleUpdatePriority} value={ticket.priority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ticket Info */}
            <div>
              <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">INFORMASI TIKET</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Kategori:</span>
                  <span className="text-xs text-[#b3b3b3] bg-[#252525] px-2.5 py-1 rounded-full border border-[#282828]">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Dibuat:</span>
                  <span className="text-[#b3b3b3]">{formatDate(ticket.created_at)}</span>
                </div>
                {ticket.resolved_at && (
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Selesai:</span>
                    <span className="text-[#b3b3b3]">{formatDate(ticket.resolved_at)}</span>
                  </div>
                )}
                {ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null && (
                  <div className="flex justify-between">
                    <span className="text-[#666666]">ML Confidence:</span>
                    <span className="text-[#1ed760]">{(ticket.ml_confidence_score * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">DESKRIPSI</h3>
              <p className="text-sm text-[#b3b3b3] whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Attachment */}
            {ticket.attachment_path && (
              <div>
                <h3 className="text-xs font-semibold text-[#b3b3b3] mb-2 uppercase tracking-wider">LAMPIRAN</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#4d4d4d] text-[#b3b3b3] hover:text-white hover:border-white w-full flex justify-between group"
                  onClick={() => setIsAttachmentOpen(true)}
                >
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-[#666666] group-hover:text-white" />
                    <span className="truncate max-w-[150px]">{ticket.attachment_path.split('/').pop()}</span>
                  </div>
                  <span className="text-xs text-[#666666] group-hover:text-white">{ticket.attachment_type?.toUpperCase()}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Chat */}
        <div className="flex-1 flex flex-col bg-[#121212]">
          {/* Chat Header */}
          <div className="bg-[#181818] border-b border-[#282828] px-6 py-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#1ed760]" />
              Live Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pr-4 custom-scrollbar">
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-[#1f1f1f] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-[#4d4d4d]" />
                </div>
                <p className="text-[#666666]">Belum ada percakapan</p>
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
                    {/* Avatar / Icon Side */}
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 overflow-hidden rounded-full flex items-center justify-center border ${
                        isSelf 
                          ? "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]" 
                          : chat.sender?.role === "master_admin"
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                          : isMahasiswa
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-[#282828] border-[#333333] text-[#b3b3b3]"
                      }`}>
                        {chat.sender?.avatar_url && (!isMahasiswa || !ticket.is_anonymous) ? (
                          <img src={chat.sender.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                        ) : isMahasiswa ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Shield className="h-5 w-5" />
                        )}
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[80%]`}>
                      {/* Header: Name & Time */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-white/90">
                          {isSelf 
                            ? (chat.sender?.role === "master_admin" ? "Admin Pengembang (Anda)" : "Admin Yayasan (Anda)") 
                            : (chat.sender?.name || "Mahasiswa")}
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
          <div className="bg-[#181818] border-t border-[#282828] p-4">
            <div className="flex gap-2">
              <input
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="btn-gradient"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
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
          <div className="p-4 border-t border-[#282828] flex justify-end bg-[#181818]">
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