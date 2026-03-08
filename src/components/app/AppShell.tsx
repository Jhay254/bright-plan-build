import { Outlet } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import NotificationBell from "./NotificationBell";
import { useSessionStatusToasts } from "@/hooks/use-session-toasts";

const AppShell = () => {
  useSessionStatusToasts();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar with notification bell */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 h-12 flex items-center justify-end">
        <NotificationBell />
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};

export default AppShell;
