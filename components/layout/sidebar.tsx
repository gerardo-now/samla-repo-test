"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/copy/uiStrings";
import {
  Home,
  Inbox,
  Users,
  Search,
  Bot,
  BookOpen,
  Calendar,
  Zap,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { LiveModeToggle } from "@/components/layout/live-mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSuperAdmin } from "@/hooks/use-super-admin";

const mainNavItems = [
  { href: "/home", icon: Home, label: UI.nav.home },
  { href: "/inbox", icon: Inbox, label: UI.nav.inbox },
  { href: "/contacts", icon: Users, label: UI.nav.contacts },
  { href: "/leads", icon: Search, label: UI.nav.leads },
  { href: "/agents", icon: Bot, label: UI.nav.agents },
  { href: "/knowledge", icon: BookOpen, label: UI.nav.knowledge },
  { href: "/calendar", icon: Calendar, label: UI.nav.calendar },
  { href: "/triggers", icon: Zap, label: UI.nav.triggers },
];

// Settings is always visible, Admin only for SAMLA team
const settingsItem = { href: "/settings", icon: Settings, label: UI.nav.settings };
const adminItem = { href: "/admin", icon: Shield, label: UI.nav.admin };

// Mobile Sidebar
function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();

  // Close sheet on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-3 left-3 z-50 h-10 w-10 bg-background/80 backdrop-blur-sm border shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        <div className="flex flex-col h-full bg-sidebar">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
            <Link href="/home" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <span className="text-xl font-bold text-primary tracking-tight">SAMLA</span>
            </Link>
          </div>

          {/* Live Mode Toggle */}
          <div className="px-3 py-4">
            <LiveModeToggle collapsed={false} />
          </div>

          <Separator />

          {/* Main Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Bottom Navigation */}
          <nav className="px-2 py-4 space-y-1">
            {/* Settings - always visible */}
            <Link
              href={settingsItem.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(settingsItem.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <settingsItem.icon className="h-5 w-5 shrink-0" />
              <span>{settingsItem.label}</span>
            </Link>

            {/* Admin - ONLY for SAMLA internal team */}
            {isSuperAdmin && (
              <Link
                href={adminItem.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(adminItem.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <adminItem.icon className="h-5 w-5 shrink-0" />
                <span>{adminItem.label}</span>
              </Link>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
function DesktopSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary tracking-tight">SAMLA</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Live Mode Toggle */}
      <div className={cn("px-3 py-4", collapsed && "flex justify-center")}>
        <LiveModeToggle collapsed={collapsed} />
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {mainNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom Navigation */}
      <nav className="px-2 py-4 space-y-1">
        {/* Settings - always visible */}
        <Link
          href={settingsItem.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith(settingsItem.href)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
          title={collapsed ? settingsItem.label : undefined}
        >
          <settingsItem.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{settingsItem.label}</span>}
        </Link>

        {/* Admin - ONLY for SAMLA internal team */}
        {isSuperAdmin && (
          <Link
            href={adminItem.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(adminItem.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            title={collapsed ? adminItem.label : undefined}
          >
            <adminItem.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{adminItem.label}</span>}
          </Link>
        )}
      </nav>
    </aside>
  );
}

export function Sidebar() {
  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}
