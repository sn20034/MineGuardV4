import { useEffect, useState } from "react";
import { Bell, Radio } from "lucide-react";
import type { ConnectionState } from "../lib/useMineGuard";

interface HeaderProps {
  connection: ConnectionState;
  alertCount: number;
}

export function Header({ connection, alertCount }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isLive = connection === "live";
  const isMock = connection === "mock";

  return (
    <header className="h-16 shrink-0 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none">
            MineGuard Control Center
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">AI-Powered Mine Subsidence Monitoring</p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-[10px] font-semibold text-slate-400 tracking-wider">
          <Radio className="w-3 h-3" />
          LOCAL MODE
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${
            isLive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : isMock
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-slate-800/60 border-slate-700/50 text-slate-400"
          }`}
        >
          <span className="relative flex w-2 h-2">
            {(isLive || isMock) && (
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  isLive ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLive ? "bg-emerald-400" : isMock ? "bg-amber-400" : "bg-slate-500"
              }`}
            />
          </span>
          {isLive ? "LIVE" : isMock ? "DEMO" : "CONNECTING"}
        </div>

        <div className="hidden md:block text-right leading-none">
          <div className="text-xs text-slate-300 font-mono tabular-nums">
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
