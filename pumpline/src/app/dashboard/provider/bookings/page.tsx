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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, User, Clock } from "lucide-react";
import { BookingStatus } from "@/generated/prisma";
import { confirmBooking, markComplete, cancelBooking } from "./actions";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function ProviderBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const provider = await db.provider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) redirect("/dashboard/provider/profile");

  const bookings = await db.booking.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      serviceType: { select: { name: true } },
      property: { select: { address: true, city: true, state: true } },
    },
  });

  const grouped = {
    all: bookings,
    pending: bookings.filter((b) => b.status === BookingStatus.PENDING),
    confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.IN_PROGRESS),
    completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED),
    cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED),
  };

  function BookingCard({ booking }: { booking: (typeof bookings)[0] }) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium">{booking.serviceType.name}</h3>
                <Badge
                  variant="secondary"
                  className={statusColors[booking.status]}
                >
                  {booking.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {booking.user.name || booking.user.email}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.property.address}, {booking.property.city},{" "}
                  {booking.property.state}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Requested:{" "}
                  {new Date(booking.requestedDate).toLocaleDateString()}
                </p>
                {booking.estimatedCost && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Est. ${Number(booking.estimatedCost).toFixed(2)}
                  </p>
                )}
              </div>
              {booking.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {booking.notes}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {booking.status === BookingStatus.PENDING && (
                <>
                  <form action={confirmBooking}>
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <Button type="submit" size="sm">
                      Confirm
                    </Button>
                  </form>
                  <form action={cancelBooking}>
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Decline
                    </Button>
                  </form>
                </>
              )}
              {(booking.status === BookingStatus.CONFIRMED ||
                booking.status === BookingStatus.IN_PROGRESS) && (
                <>
                  <form action={markComplete}>
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <Button type="submit" size="sm">
                      Mark Complete
                    </Button>
                  </form>
                  <form action={cancelBooking}>
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <Button type="submit" size="sm" variant="destructive">
                      Cancel
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your service bookings and requests.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({grouped.all.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({grouped.pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Active ({grouped.confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({grouped.completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({grouped.cancelled.length})
          </TabsTrigger>
        </TabsList>

        {(Object.entries(grouped) as [string, typeof bookings][]).map(
          ([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              {items.length === 0 ? (
                <EmptyState message={`No ${key} bookings.`} />
              ) : (
                items.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
