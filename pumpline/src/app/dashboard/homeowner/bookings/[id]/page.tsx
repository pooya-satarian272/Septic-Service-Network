import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/reviews/review-form";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusTimeline = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const booking = await db.booking.findFirst({
    where: { id, userId: session.user.id },
    include: {
      provider: {
        select: {
          businessName: true,
          phone: true,
          slug: true,
          user: { select: { email: true } },
        },
      },
      property: {
        select: { address: true, city: true, state: true, zipCode: true },
      },
      serviceType: { select: { name: true } },
      review: { select: { id: true } },
      serviceRecord: true,
    },
  });

  if (!booking) notFound();

  const isCancelled = booking.status === "CANCELLED";
  const currentIndex = isCancelled
    ? -1
    : statusTimeline.indexOf(
        booking.status as (typeof statusTimeline)[number]
      );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <Badge className={statusColors[booking.status] || ""}>
          {booking.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusTimeline.map((status, i) => {
                const isActive = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isActive && !isCurrent ? "✓" : i + 1}
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Service Type</p>
              <p className="font-medium">{booking.serviceType.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested Date</p>
              <p className="font-medium">{formatDate(booking.requestedDate)}</p>
            </div>
            {booking.confirmedDate && (
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Date</p>
                <p className="font-medium">
                  {formatDate(booking.confirmedDate)}
                </p>
              </div>
            )}
            {booking.completedDate && (
              <div>
                <p className="text-sm text-muted-foreground">Completed Date</p>
                <p className="font-medium">
                  {formatDate(booking.completedDate)}
                </p>
              </div>
            )}
            {booking.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card>
          <CardHeader>
            <CardTitle>Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{booking.provider.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{booking.provider.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{booking.provider.user.email}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">
                {booking.property.address}, {booking.property.city},{" "}
                {booking.property.state} {booking.property.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Section */}
      {booking.status === "COMPLETED" && !booking.review && (
        <ReviewForm bookingId={booking.id} />
      )}

      {booking.status === "COMPLETED" && booking.review && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You have already reviewed this booking.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
