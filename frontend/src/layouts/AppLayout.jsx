import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import CustomCursor from "../components/CustomCursor";
import FloatingChat from "../components/global/FloatingChat";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-ipl-dark via-[#071825] to-[#081c38] text-gray-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,184,217,0.16),transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(232,93,38,0.18),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_45%,rgba(255,255,255,0.01))]" />
      <CustomCursor />

      <div className="relative md:flex md:items-start">
        <div className="md:sticky md:top-0 md:h-screen md:pt-6 md:pr-5">
          <Sidebar
            isOpen={sidebarOpen}
            collapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          />
        </div>

        <div className="flex-1">
          <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="pt-6 pb-10"
            >
              <div className="mx-auto max-w-7xl px-4">
                <div className="page-shell p-6 md:p-8">
                  <Outlet />
                </div>
              </div>
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <FloatingChat />
    </div>
  );
}
