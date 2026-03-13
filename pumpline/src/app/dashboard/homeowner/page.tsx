import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { BookingStatus } from "@/generated/prisma";

export default async function HomeownerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [propertyCount, pendingBookings, completedServices, recentBookings, maintenanceAlerts] =
    await Promise.all([
      db.property.count({ where: { userId } }),
      db.booking.count({ where: { userId, status: BookingStatus.PENDING } }),
      db.booking.count({ where: { userId, status: BookingStatus.COMPLETED } }),
      db.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          provider: { select: { businessName: true } },
          serviceType: { select: { name: true } },
          property: { select: { address: true, city: true } },
        },
      }),
      db.serviceRecord.findMany({
        where: {
          property: { userId },
          nextDueDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
        include: {
          property: { select: { address: true, city: true } },
        },
        orderBy: { nextDueDate: "asc" },
        take: 5,
      }),
    ]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your properties and services.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Bookings
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Services
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedServices}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No bookings yet.{" "}
                  <Link href="/providers" className="text-primary underline">
                    Find a provider
                  </Link>{" "}
                  to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {booking.serviceType.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.provider.businessName} &middot;{" "}
                        {booking.property.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.requestedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[booking.status]}
                    >
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                <Separator />
                <Link
                  href="/dashboard/homeowner/bookings"
                  className="text-sm text-primary hover:underline"
                >
                  View all bookings
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Alerts</CardTitle>
            <CardDescription>
              Properties with upcoming service due dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {maintenanceAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                <p className="text-sm text-muted-foreground">
                  All properties are up to date. No upcoming maintenance needed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceAlerts.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {record.serviceType} due
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.property.address}, {record.property.city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due:{" "}
                        {record.nextDueDate
                          ? new Date(record.nextDueDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
