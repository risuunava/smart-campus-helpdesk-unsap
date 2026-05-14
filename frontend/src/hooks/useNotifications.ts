"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { Notification } from "@/types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchNotifications = useCallback(async () => {
    // Don't fetch if no token (not logged in)
    if (!api.getToken()) return;

    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err: any) {
      // Only log real errors, not auth redirects
      if (err?.message !== "Unauthorized") {
        console.error("[useNotifications] fetchNotifications error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollUnreadCount = useCallback(async () => {
    if (!api.getToken()) return;
    try {
      const res = await api.getUnreadCount();
      if (res?.data) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch {
      // silently fail on poll
    }
  }, []);

  // Initial fetch — only once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!api.getToken()) return;
    const id = setInterval(pollUnreadCount, 30000);
    return () => clearInterval(id);
  }, [pollUnreadCount]);

  const markRead = useCallback(async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("[useNotifications] markRead error:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[useNotifications] markAllRead error:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !notif.read_at) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("[useNotifications] deleteNotification error:", err);
    }
  }, [notifications]);

  const clearRead = useCallback(async () => {
    try {
      await api.clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read_at));
    } catch (err) {
      console.error("[useNotifications] clearRead error:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    clearRead,
  };
}
