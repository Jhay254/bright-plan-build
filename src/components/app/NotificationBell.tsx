import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications";
import { Bell, Check, CheckCheck, MessageCircle, UserCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, React.ReactNode> = {
  session_matched: <MessageCircle className="h-4 w-4 text-fern" />,
  session_active: <MessageCircle className="h-4 w-4 text-forest" />,
  session_closed: <Check className="h-4 w-4 text-driftwood" />,
  volunteer_approved: <UserCheck className="h-4 w-4 text-forest" />,
  new_message: <MessageCircle className="h-4 w-4 text-shore" />,
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: count = 0 } = useUnreadCount(user?.id);
  const { data: notifications = [] } = useNotifications(user?.id);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const [open, setOpen] = useState(false);

  const handleClick = (notif: { id: string; link: string | null; read: boolean }) => {
    if (!notif.read) markRead.mutate(notif.id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-driftwood hover:text-forest hover:bg-mist/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-care-alert text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-80 max-h-96 bg-card border border-border rounded-echo-lg shadow-echo-3 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-heading text-sm font-semibold text-bark">Notifications</h3>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    onClick={() => user && markAllRead.mutate(user.id)}
                    aria-label="Mark all notifications as read"
                    className="text-xs text-driftwood hover:text-forest flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close notifications" className="text-driftwood hover:text-bark">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-stone mx-auto mb-2" />
                  <p className="text-sm text-driftwood">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-dawn/50 transition-colors flex items-start gap-3 ${
                      !n.read ? "bg-dawn/30" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {ICON_MAP[n.type] ?? <Bell className="h-4 w-4 text-driftwood" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-medium text-bark" : "text-driftwood"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-driftwood mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-driftwood/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-forest shrink-0 mt-1.5" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
