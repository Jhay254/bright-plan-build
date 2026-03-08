import { Outlet } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";

const AppShell = () => (
  <div className="min-h-screen bg-background pb-20">
    <Outlet />
    <BottomTabBar />
  </div>
);

export default AppShell;
