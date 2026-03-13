import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Droplets,
  Calendar,
  Wrench,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const property = await db.property.findFirst({
    where: { id, userId: session.user.id },
    include: {
      serviceRecords: {
        orderBy: { serviceDate: "desc" },
        include: {
          booking: {
            select: { id: true },
          },
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          provider: { select: { businessName: true } },
          serviceType: { select: { name: true } },
        },
      },
    },
  });

  if (!property) notFound();

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/homeowner/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {property.address}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
      </div>

      {/* Property Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">System Type</p>
                <p className="font-medium text-sm">
                  {property.septicType || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Tank Size</p>
                <p className="font-medium text-sm">
                  {property.tankSize || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Install Year</p>
                <p className="font-medium text-sm">
                  {property.installYear || "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Services</p>
                <p className="font-medium text-sm">
                  {property.serviceRecords.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {property.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{property.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service History Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Service History</CardTitle>
            <CardDescription>
              All maintenance records for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            {property.serviceRecords.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No service records yet. Records are created automatically when
                  bookings are completed.
                </p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {property.serviceRecords.map((record, i) => {
                  const isOverdue =
                    record.nextDueDate &&
                    new Date(record.nextDueDate) < new Date();

                  return (
                    <div key={record.id} className="relative pl-8 pb-6">
                      {/* Timeline line */}
                      {i < property.serviceRecords.length - 1 && (
                        <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {record.serviceType}
                          </p>
                          {isOverdue && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0"
                            >
                              <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.serviceDate)} &middot;{" "}
                          {record.providerName}
                        </p>
                        {record.cost && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />$
                            {Number(record.cost).toFixed(2)}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.notes}
                          </p>
                        )}
                        {record.nextDueDate && (
                          <p className="text-xs text-muted-foreground">
                            Next due: {formatDate(record.nextDueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Bookings associated with this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            {property.bookings.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No bookings for this property yet.{" "}
                  <Link href="/search" className="text-primary underline">
                    Find a provider
                  </Link>{" "}
                  to book a service.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {property.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/homeowner/bookings/${booking.id}`}
                    className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium truncate">
                          {booking.serviceType.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.provider.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(booking.requestedDate)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColors[booking.status]}
                      >
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
