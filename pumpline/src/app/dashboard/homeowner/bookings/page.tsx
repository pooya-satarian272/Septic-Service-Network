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
import { Button } from "@/components/ui/button";
import { Calendar, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HomeownerBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { businessName: true, slug: true } },
      serviceType: { select: { name: true } },
      property: { select: { address: true, city: true } },
      review: { select: { id: true } },
    },
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const activeCount = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS"
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your service bookings.
          </p>
        </div>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Find a Provider
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">
              {completedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Search for a provider and book your first service to get started.
            </p>
            <Button asChild>
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search Providers
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/homeowner/bookings/${booking.id}`}
              className="block"
            >
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium truncate">
                          {booking.serviceType.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={statusColors[booking.status]}
                        >
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{booking.provider.businessName}</span>
                        <span>{booking.property.address}, {booking.property.city}</span>
                        <span>Requested: {formatDate(booking.requestedDate)}</span>
                      </div>
                      {booking.status === "COMPLETED" && !booking.review && (
                        <p className="mt-1 text-xs text-primary font-medium">
                          Leave a review
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
