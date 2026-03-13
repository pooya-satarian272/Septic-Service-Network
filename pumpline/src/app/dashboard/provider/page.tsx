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
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle2,
  Star,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { BookingStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export default async function ProviderDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const provider = await db.provider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Provider Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">
          You need to set up your provider profile to access the dashboard.
        </p>
        <Button asChild>
          <Link href="/dashboard/provider/profile">Set Up Profile</Link>
        </Button>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    pendingCount,
    completedThisMonth,
    reviewStats,
    pendingBookings,
    recentReviews,
  ] = await Promise.all([
    db.booking.count({
      where: { providerId: provider.id, status: BookingStatus.PENDING },
    }),
    db.booking.count({
      where: {
        providerId: provider.id,
        status: BookingStatus.COMPLETED,
        completedDate: { gte: startOfMonth },
      },
    }),
    db.review.aggregate({
      where: { providerId: provider.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    db.booking.findMany({
      where: { providerId: provider.id, status: BookingStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
        property: { select: { address: true, city: true } },
      },
    }),
    db.review.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
  ]);

  async function handleBookingAction(formData: FormData) {
    "use server";
    const bookingId = formData.get("bookingId") as string;
    const action = formData.get("action") as string;

    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const provider = await db.provider.findUnique({
      where: { userId: session.user.id },
    });
    if (!provider) return;

    const booking = await db.booking.findFirst({
      where: { id: bookingId, providerId: provider.id },
    });
    if (!booking) return;

    if (action === "accept") {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED, confirmedDate: new Date() },
      });
    } else if (action === "decline") {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
    }

    revalidatePath("/dashboard/provider");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s how your business is doing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewStats._avg.rating
                ? reviewStats._avg.rating.toFixed(1)
                : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewStats._count.rating}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              New booking requests awaiting your response
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No pending requests. You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium">
                          {booking.serviceType.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.user.name || "Customer"} &middot;{" "}
                          {booking.property.address}, {booking.property.city}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested:{" "}
                          {new Date(
                            booking.requestedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={handleBookingAction}>
                        <input
                          type="hidden"
                          name="bookingId"
                          value={booking.id}
                        />
                        <input type="hidden" name="action" value="accept" />
                        <Button type="submit" size="sm">
                          Accept
                        </Button>
                      </form>
                      <form action={handleBookingAction}>
                        <input
                          type="hidden"
                          name="bookingId"
                          value={booking.id}
                        />
                        <input type="hidden" name="action" value="decline" />
                        <Button type="submit" size="sm" variant="outline">
                          Decline
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
                <Separator />
                <Link
                  href="/dashboard/provider/bookings"
                  className="text-sm text-primary hover:underline"
                >
                  View all bookings
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>What your customers are saying</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Complete services to start receiving feedback.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {review.user.name || "Customer"}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <Separator />
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
