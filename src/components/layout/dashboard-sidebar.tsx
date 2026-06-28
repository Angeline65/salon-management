"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  title: string;
  links: { href: string; label: string; icon: React.ReactNode }[];
  user?: { name: string; role: string; avatar?: string };
  variant?: "light" | "dark";
  onLogout?: () => void;
}

export function DashboardSidebar({ title, links, user, variant = "light", onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 w-64 z-40 transform -translate-x-full lg:translate-x-0 transition-transform duration-300",
        isDark ? "bg-charcoal" : "bg-white border-r border-cream-dark"
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn("p-6 border-b", isDark ? "border-white/10" : "border-cream-dark")}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">L</span>
            </div>
            <span className={cn("font-display text-xl font-semibold", isDark ? "text-white" : "text-charcoal")}>
              {title}
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition",
                  isDark
                    ? isActive
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                    : isActive
                    ? "text-gold bg-gold/10 border-r-2 border-gold"
                    : "text-charcoal-lighter hover:bg-cream"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className={cn("p-4 border-t", isDark ? "border-white/10" : "border-cream-dark")}>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold", isDark ? "bg-charcoal-light text-cream" : "bg-gold-muted text-gold")}>
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-charcoal")}>{user.name}</p>
                <p className={cn("text-xs", isDark ? "text-white/50" : "text-charcoal-lighter")}>{user.role}</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn("p-4 border-t", isDark ? "border-white/10" : "border-cream-dark")}>
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition w-full",
              isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-charcoal-lighter hover:bg-cream"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
