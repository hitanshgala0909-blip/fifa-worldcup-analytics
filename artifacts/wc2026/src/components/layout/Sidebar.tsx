import { Link, useLocation } from "wouter";
import { useState } from "react";
import { LayoutDashboard, Swords, Trophy, Users, User, Star, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/predictor", label: "Predictor", icon: Swords },
  { path: "/simulator", label: "Simulator", icon: Trophy },
  { path: "/teams", label: "Teams", icon: Users },
  { path: "/players", label: "Players", icon: User },
  { path: "/fantasy", label: "Fantasy", icon: Star },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-[hsl(var(--card))] border-r border-border transition-all duration-300 z-50 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center px-0")}>
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary shrink-0">
          <Globe className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display text-sm font-bold text-primary leading-none tracking-widest">WC 2026</div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase leading-none mt-0.5">Intelligence</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location === path || (path !== "/" && location.startsWith(path));
            return (
              <li key={path}>
                <Link
                  href={path}
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
                  {!collapsed && (
                    <span className="font-sans text-sm font-medium tracking-wide">{label}</span>
                  )}
                  {active && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          data-testid="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
