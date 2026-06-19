"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, User, Shield, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

export function CollapsibleSidebar({
  items = [
    { label: "Profile Overview", href: "/profile", icon: User },
    {
      label: "Lounge Settings",
      href: "/settings",
      icon: Settings,
      children: [
        { label: "Account Keybinds", href: "/settings/keybinds" },
        { label: "Audio & Graphics", href: "/settings/graphics" },
      ],
    },
    { label: "Admin Controller", href: "/admin", icon: Shield },
    { label: "Technical Guides", href: "/about", icon: HelpCircle },
  ],
  className,
}: {
  items?: SidebarItem[];
  className?: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (label: string) => {
    if (collapsed) setCollapsed(false);
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "bg-white border border-grey-border rounded-3xl p-4 shadow-sm flex flex-col h-[calc(100vh-160px)] sticky top-28 shrink-0 select-none overflow-hidden",
        className
      )}
    >
      {/* Sidebar Items */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isSubmenuOpen = openSubmenu === item.label;
          const isActive = pathname === item.href || (hasChildren && item.children?.some(c => pathname === c.href));

          return (
            <div key={item.label} className="flex flex-col gap-1">
              {hasChildren ? (
                /* Submenu Parent Action */
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl hover:bg-grey-surface/60 transition-colors font-outfit text-xs font-bold uppercase tracking-wider text-slate-muted hover:text-slate-dark cursor-pointer text-left",
                    isActive && "bg-brand-light/35 text-brand-dark"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform",
                        isSubmenuOpen && "transform rotate-180"
                      )}
                    />
                  )}
                </button>
              ) : (
                /* Standard Navigation Link */
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl hover:bg-grey-surface/60 transition-colors font-outfit text-xs font-bold uppercase tracking-wider text-slate-muted hover:text-slate-dark",
                    isActive && "bg-brand-light/35 text-brand-dark"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}

              {/* Renders Child items if expanded */}
              {hasChildren && isSubmenuOpen && !collapsed && (
                <div className="pl-8 flex flex-col gap-1.5 mt-1">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          "p-2 rounded-xl text-slate-muted hover:text-slate-dark text-[11px] font-bold font-outfit uppercase tracking-widest",
                          isChildActive && "text-brand-dark font-extrabold"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Action Switcher */}
      <button
        onClick={() => {
          setCollapsed(!collapsed);
          setOpenSubmenu(null);
        }}
        className="mt-auto border-t border-grey-border pt-4 w-full flex items-center justify-center p-3 rounded-2xl hover:bg-grey-surface text-slate-muted hover:text-slate-dark transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </motion.div>
  );
}
