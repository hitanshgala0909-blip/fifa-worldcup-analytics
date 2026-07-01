import { Link, useLocation } from "wouter";
import { useState } from "react";
import { LayoutDashboard, Trophy, Users, User, Star, Brain, Grid3X3, Globe, ChevronLeft, ChevronRight, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/",            label: "Home",         icon: LayoutDashboard },
  { path: "/bracket",    label: "Bracket",      icon: Trophy },
  { path: "/groups",     label: "Groups",       icon: Grid3X3 },
  { path: "/teams",      label: "Teams",        icon: Users },
  { path: "/players",    label: "Players",      icon: User },
  { path: "/fantasy",    label: "Fantasy",      icon: Star },
  { path: "/intelligence", label: "Intelligence", icon: Brain },
  { path: "/predictor",  label: "Predictor",    icon: Swords },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-[#161b22] border-r border-[#30363d] transition-all duration-300 z-50 shrink-0",
        collapsed ? "w-16" : "w-52"
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-[#30363d]", collapsed && "justify-center px-0")}>
        <div className="flex items-center justify-center w-8 h-8 rounded bg-[#F4C430] shrink-0">
          <Globe className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-[#F4C430] leading-none tracking-widest">WC 2026</div>
            <div className="text-[10px] text-[#8b949e] tracking-wider uppercase leading-none mt-0.5">Intelligence</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location === path || (path !== "/" && location.startsWith(path));
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-[#F4C430]/15 text-[#F4C430]"
                      : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active && "text-[#F4C430]")} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                  {active && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F4C430]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-[#30363d]">
          <div className="text-[10px] text-[#8b949e] text-center">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse inline-block" />
              GROUP STAGE LIVE
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-[#30363d] p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
