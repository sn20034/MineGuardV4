import {
  LayoutDashboard,
  Activity,
  Map,
  Radio,
  Brain,
  AlertTriangle,
  TrendingUp,
  Database,
  HeartPulse,
  Settings,
} from "lucide-react";

export type ViewId =
  | "dashboard"
  | "live"
  | "map"
  | "nodes"
  | "ai"
  | "alerts"
  | "trends"
  | "history"
  | "health"
  | "settings";

interface NavItem {
  id: ViewId;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "live", label: "Live", icon: Activity },
  { id: "map", label: "Map", icon: Map },
  { id: "nodes", label: "Nodes", icon: Radio },
  { id: "ai", label: "AI", icon: Brain },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "history", label: "History", icon: Database },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: ViewId;
  onSelect: (id: ViewId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex-col z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white tracking-tight">
                MineGuard
              </span>

              <span className="text-[10px] text-slate-500 tracking-wider uppercase">
                Control Center
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />

                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Version */}
        <div className="p-3 border-t border-slate-800/60">
          <div className="text-[10px] text-slate-600 text-center">
            v1.0.0 · SIH Prototype
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[68px] border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-2">
        <div className="h-full flex items-center justify-around">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-w-[52px] h-full transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-500"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-cyan-400" />
                )}

                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />

                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
