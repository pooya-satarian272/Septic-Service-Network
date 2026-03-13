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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Plus,
  Droplets,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default async function HomeownerPropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const properties = await db.property.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { bookings: true, serviceRecords: true },
      },
      serviceRecords: {
        orderBy: { serviceDate: "desc" },
        take: 1,
        select: {
          serviceDate: true,
          serviceType: true,
          nextDueDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your properties and track maintenance history.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/homeowner/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Add your first property to start tracking maintenance history and
              get reminders for upcoming service dates.
            </p>
            <Button asChild>
              <Link href="/dashboard/homeowner/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => {
            const lastService = property.serviceRecords[0];
            const isOverdue =
              lastService?.nextDueDate &&
              new Date(lastService.nextDueDate) < new Date();
            const isDueSoon =
              lastService?.nextDueDate &&
              !isOverdue &&
              new Date(lastService.nextDueDate) <
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            return (
              <Card key={property.id} className="group relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {property.address}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.state} {property.zipCode}
                      </CardDescription>
                    </div>
                    {isOverdue && (
                      <Badge variant="destructive" className="shrink-0">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                    {isDueSoon && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-yellow-100 text-yellow-800"
                      >
                        Due Soon
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    {property.septicType && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        {property.septicType}
                      </span>
                    )}
                    {property.tankSize && (
                      <span>Tank: {property.tankSize}</span>
                    )}
                    {property.installYear && (
                      <span>Installed: {property.installYear}</span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-muted-foreground">
                      <span>{property._count.bookings} bookings</span>
                      <span>{property._count.serviceRecords} service records</span>
                    </div>
                  </div>

                  {lastService && (
                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Last service:{" "}
                          <span className="font-medium text-foreground">
                            {lastService.serviceType}
                          </span>{" "}
                          on{" "}
                          {new Date(
                            lastService.serviceDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {lastService.nextDueDate && (
                        <p className="mt-1 ml-5.5 text-xs text-muted-foreground">
                          Next due:{" "}
                          {new Date(
                            lastService.nextDueDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/dashboard/homeowner/properties/${property.id}`}
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
