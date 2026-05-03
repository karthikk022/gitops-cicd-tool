import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Bell,
  ChevronDown,
  Hexagon,
  Activity,
  Clock,
  Menu,
  X,
  Server,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/", label: "Applications", icon: LayoutDashboard },
  { path: "/topology", label: "Topology", icon: Activity },
  { path: "/history", label: "History", icon: Clock },
  { path: "/repositories", label: "Repositories", icon: GitBranch },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: unreadCount } = trpc.notification.unreadCount.useQuery();
  const { data: notifications } = trpc.notification.list.useQuery({ unreadOnly: true });
  const utils = trpc.useUtils();

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  return (
    <div className="flex h-screen bg-[#0a0e0a] text-[#b8e6c1] overflow-hidden">
      {/* Main Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } flex-shrink-0 bg-[#111810] border-r border-[rgba(255,255,255,0.05)] flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-[rgba(255,255,255,0.05)]">
          <Hexagon className="w-7 h-7 text-[#00ff41] flex-shrink-0" strokeWidth={1.5} />
          {sidebarOpen && (
            <span className="ml-3 font-mono-terminal text-sm font-bold text-[#00ff41] tracking-wider neon-text-glow">
              KUBEFLUX
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-sm font-mono-terminal transition-all duration-200 group relative ${
                  isActive
                    ? "text-[#00ff41] bg-[rgba(0,255,65,0.05)] border-r-2 border-[#00ff41]"
                    : "text-[#b8e6c1]/70 hover:text-[#00ff41] hover:bg-[rgba(0,255,65,0.03)]"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">{item.label.toUpperCase()}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#111810] border border-[rgba(0,255,65,0.2)] text-[#00ff41] text-xs font-mono-terminal rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label.toUpperCase()}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-10 flex items-center justify-center border-t border-[rgba(255,255,255,0.05)] text-[#b8e6c1]/50 hover:text-[#00ff41] transition-colors"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 bg-[#111810] border-b border-[rgba(255,255,255,0.05)]">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 font-mono-terminal text-xs text-[#b8e6c1]/50">
            <span>default</span>
            <span>/</span>
            <span className="text-[#00ff41]">demo-dev</span>
            <span>/</span>
            <span className="text-[#b8e6c1]/70">applications</span>
            <span>/</span>
            <span className="text-[#00ff41]">kustomize-guestbook</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Environment */}
            <button className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono-terminal border border-[rgba(255,255,255,0.1)] rounded hover:border-[#00ff41]/40 hover:text-[#00ff41] transition-colors">
              <Server className="w-3 h-3" />
              <span>prod-cluster</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#b8e6c1]/70 hover:text-[#00ff41] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount ? (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#00ff41] text-[#0a0e0a] text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#111810] border border-[rgba(0,255,65,0.2)] rounded shadow-lg shadow-[rgba(0,255,65,0.1)] z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-sm font-mono-terminal text-[#00ff41]">Notifications</span>
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-xs text-[#b8e6c1]/50 hover:text-[#00ff41] transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,255,65,0.03)] transition-colors ${
                          n.severity === "error" ? "border-l-2 border-l-red-500" :
                          n.severity === "warning" ? "border-l-2 border-l-amber-500" :
                          n.severity === "success" ? "border-l-2 border-l-emerald-500" :
                          "border-l-2 border-l-sky-500"
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#b8e6c1]">{n.title}</div>
                        <div className="text-[10px] text-[#b8e6c1]/50 mt-0.5">{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
