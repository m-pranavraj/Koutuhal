import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  Briefcase, 
  Calendar, 
  Star, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Real-time subscription
      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on("postgres_changes", { 
          event: "INSERT", 
          schema: "public", 
          table: "notifications", 
          filter: `user_id=eq.${user.id}` 
        }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setNotifications(data);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    try {
      await supabase.from("notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const clearAll = async () => {
    if (!user) return;
    try {
      await supabase.from("notifications").delete().eq("user_id", user.id);
      setNotifications([]);
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application": return { icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" };
      case "session": return { icon: Calendar, color: "text-green-400", bg: "bg-green-500/10" };
      case "review": return { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" };
      case "success": return { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" };
      case "warning": return { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" };
      default: return { icon: Info, color: "text-neutral-400", bg: "bg-white/5" };
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10">
          <Bell className={cn("h-5 w-5 transition-transform group-hover:rotate-12", unreadCount > 0 && "text-primary")} />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-black shadow-lg shadow-primary/20"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 glass-card border-white/5 shadow-2xl overflow-hidden mt-2" align="end">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="space-y-1">
             <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
               Inboxes
               {unreadCount > 0 && <Sparkles className="h-3 w-3 text-primary animate-pulse" />}
             </h3>
             <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Stay updated with your progress</p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2" onClick={markAllRead}>
                Mark Read
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="max-h-[420px]">
          <div className="p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center">
                   <Search className="h-8 w-8 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">All Caught Up!</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-tighter mt-1 font-medium">No new notifications at this time.</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.map((n, i) => {
                  const { icon: Icon, color, bg } = getNotificationIcon(n.type);
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "group relative w-full p-4 rounded-2xl transition-all duration-300 border border-transparent",
                        !n.is_read ? "bg-white/5 border-white/5" : "hover:bg-white/5/30"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner", bg)}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                             <h4 className={cn("text-xs font-black truncate", !n.is_read ? "text-white" : "text-neutral-500")}>
                               {n.title}
                             </h4>
                             {!n.is_read && (
                               <button 
                                 onClick={(e) => markAsRead(n.id, e)}
                                 className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center group/check hover:bg-primary transition-colors"
                               >
                                  <Check className="h-2.5 w-2.5 text-primary group-hover/check:text-black" />
                               </button>
                             )}
                          </div>
                          <p className="text-[11px] text-neutral-500 font-medium leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest pt-1">
                            {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      {!n.is_read && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-10 w-0.5 rounded-full bg-primary shadow-[0_0_10px_rgba(173,255,68,0.5)]" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-white/5 text-center">
             <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white" asChild>
               <a href="#">View All Activity Archive</a>
             </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
