import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";

/** Full-width pages that use V2 top nav only (no sidebar) */
function isFullWidthDashboardPath(pathname: string) {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last === "user-settings" || last === "portfolio" || last === "add-broker";
}

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const hideSidebar = isFullWidthDashboardPath(pathname);

  if (hideSidebar) {
    return (
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 bg-background">
      <DashboardSidebar className="shrink-0" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
