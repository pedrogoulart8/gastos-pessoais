"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, TrendingUp, PlusCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useDemoMode } from "@/src/lib/demoMode";

export function BottomNav() {
  const pathname = usePathname();
  const isDemoMode = useDemoMode();

  const navItems = [
    { href: "/", label: "Resumo", icon: LayoutDashboard },
    { href: "/history", label: "Histórico", icon: History },
    ...(isDemoMode
      ? []
      : [{ href: "/add", label: "Adicionar", icon: PlusCircle, primary: true }]),
    { href: "/insights", label: "Insights", icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                primary
                  ? "text-primary"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  primary && "h-7 w-7",
                  active && !primary && "text-primary"
                )}
                strokeWidth={primary ? 2.5 : active ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
