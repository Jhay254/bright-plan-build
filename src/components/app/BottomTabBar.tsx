import { NavLink } from "react-router-dom";
import { Home, MessageCircle, BookOpen, Users, User, HeartHandshake, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/use-notifications";

const BottomTabBar = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);

  const isVolunteer = role === "volunteer";
  const isAdmin = role === "admin";

  // Show badge on cocoon tab if there are unread session notifications
  const tabs = [
    { to: "/app", icon: Home, label: t("nav.home"), end: true, badge: 0 },
    { to: "/app/cocoon", icon: MessageCircle, label: t("nav.cocoon"), badge: unreadCount },
    ...(isVolunteer
      ? [{ to: "/app/volunteer", icon: HeartHandshake, label: t("nav.hub"), end: false, badge: 0 }]
      : [{ to: "/app/journal", icon: BookOpen, label: t("nav.journal"), end: false, badge: 0 }]),
    { to: "/app/community", icon: Users, label: t("nav.community"), badge: 0 },
    ...(isAdmin
      ? [{ to: "/admin", icon: Shield, label: "Admin", end: false, badge: 0 }]
      : []),
    { to: "/app/profile", icon: User, label: t("nav.profile"), end: false, badge: 0 },
  ];

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-forest" : "text-driftwood hover:text-fern"
              )
            }
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-care-alert text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;
