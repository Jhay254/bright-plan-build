import { NavLink } from "react-router-dom";
import { Home, MessageCircle, BookOpen, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app", icon: Home, label: "Home", end: true },
  { to: "/app/cocoon", icon: MessageCircle, label: "Cocoon" },
  { to: "/app/journal", icon: BookOpen, label: "Journal" },
  { to: "/app/community", icon: Users, label: "Community" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

const BottomTabBar = () => (
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

export default BottomTabBar;
