import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Database,
  Shield,
  Bell,
  Palette,
  Globe,
} from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settingsSections = [
    {
      icon: Globe,
      title: "General",
      description: "Platform name, tagline, contact email, and public-facing settings.",
      status: "Coming Soon",
    },
    {
      icon: Shield,
      title: "Authentication",
      description: "Configure login providers, password policies, and session settings.",
      status: "Coming Soon",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email templates, notification triggers, and alert preferences.",
      status: "Coming Soon",
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Database backups, data export, and cleanup utilities.",
      status: "Coming Soon",
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme settings, brand colors, logo, and custom CSS.",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your Pumpline platform settings.
        </p>
      </div>

      {/* Current Config Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>
            Active platform configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Environment
              </p>
              <p className="mt-1 font-medium">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Database
              </p>
              <p className="mt-1 font-medium">PostgreSQL</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Auth Provider
              </p>
              <p className="mt-1 font-medium">NextAuth (Credentials)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                File Storage
              </p>
              <p className="mt-1 font-medium">UploadThing</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Framework
              </p>
              <p className="mt-1 font-medium">Next.js 16</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Admin User
              </p>
              <p className="mt-1 font-medium truncate">{session.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Settings Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{section.title}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {section.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
