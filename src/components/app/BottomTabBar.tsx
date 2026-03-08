import { NavLink } from "react-router-dom";
import { Home, MessageCircle, BookOpen, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const BottomTabBar = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: "/app", icon: Home, label: t("nav.home"), end: true },
    { to: "/app/cocoon", icon: MessageCircle, label: t("nav.cocoon") },
    { to: "/app/journal", icon: BookOpen, label: t("nav.journal") },
    { to: "/app/community", icon: Users, label: t("nav.community") },
    { to: "/app/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-forest" : "text-driftwood hover:text-fern"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;
