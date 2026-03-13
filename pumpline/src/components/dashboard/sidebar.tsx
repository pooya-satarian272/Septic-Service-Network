"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Calendar,
  Star,
  Settings,
  Wrench,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: string;
  userName: string | null;
}

const homeownerLinks = [
  { href: "/dashboard/homeowner", label: "Overview", icon: Home },
  { href: "/dashboard/homeowner/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/homeowner/bookings", label: "Bookings", icon: Calendar },
];

const providerLinks = [
  { href: "/dashboard/provider", label: "Overview", icon: Home },
  { href: "/dashboard/provider/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/provider/services", label: "Services", icon: Wrench },
  { href: "/dashboard/provider/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: Home },
  { href: "/dashboard/admin/users", label: "Users", icon: User },
  { href: "/dashboard/admin/providers", label: "Providers", icon: Building2 },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

function getLinks(role: string) {
  switch (role) {
    case "PROVIDER":
      return providerLinks;
    case "ADMIN":
      return adminLinks;
    default:
      return homeownerLinks;
  }
}

function SidebarContent({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const links = getLinks(role);

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            P
          </div>
          <span className="text-lg font-semibold">Pumpline</span>
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard/homeowner" &&
              link.href !== "/dashboard/provider" &&
              link.href !== "/dashboard/admin" &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium truncate">{userName || "User"}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {role.toLowerCase()}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ role, userName }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent role={role} userName={userName} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card fixed left-0 top-0">
        <SidebarContent role={role} userName={userName} />
      </aside>
    </>
  );
}
