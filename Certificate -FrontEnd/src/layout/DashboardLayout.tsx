import { Outlet } from "react-router";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-slate-900">
      <Sidebar
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((current) => !current)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={`min-h-screen transition-[padding] duration-300 md:pl-72 ${
          isCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;