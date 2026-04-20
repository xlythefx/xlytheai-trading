import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  AdminSidebar,
  ADMIN_SIDEBAR_WIDTH,
  ADMIN_SIDEBAR_COLLAPSED,
} from "@/components/ui/admin-sidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        style={{ marginLeft: collapsed ? ADMIN_SIDEBAR_COLLAPSED : ADMIN_SIDEBAR_WIDTH }}
        className="min-h-screen transition-[margin] duration-300 ease-in-out"
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
