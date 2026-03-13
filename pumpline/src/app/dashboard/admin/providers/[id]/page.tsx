import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toggleVerified, toggleActive } from "../actions";

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const provider = await db.provider.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, phone: true, createdAt: true } },
      services: { include: { serviceType: true } },
      serviceAreas: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      bookings: {
        include: {
          user: { select: { name: true } },
          serviceType: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });

  if (!provider) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{provider.businessName}</h1>
          <p className="text-muted-foreground">{provider.user.email}</p>
        </div>
        <div className="flex gap-2">
          {provider.isVerified ? (
            <Badge variant="default">Verified</Badge>
          ) : (
            <Badge variant="secondary">Unverified</Badge>
          )}
          {provider.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <form action={toggleVerified}>
          <input type="hidden" name="providerId" value={provider.id} />
          <input
            type="hidden"
            name="isVerified"
            value={String(!provider.isVerified)}
          />
          <Button variant="outline" type="submit">
            {provider.isVerified ? "Unverify" : "Verify"}
          </Button>
        </form>
        <form action={toggleActive}>
          <input type="hidden" name="providerId" value={provider.id} />
          <input
            type="hidden"
            name="isActive"
            value={String(!provider.isActive)}
          />
          <Button
            variant={provider.isActive ? "destructive" : "outline"}
            type="submit"
          >
            {provider.isActive ? "Deactivate" : "Activate"}
          </Button>
        </form>
      </div>

      {/* Provider Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{provider.user.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{provider.phone}</p>
            </div>
            {provider.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p className="font-medium">{provider.website}</p>
              </div>
            )}
            {provider.licenseNumber && (
              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-medium">{provider.licenseNumber}</p>
              </div>
            )}
            {provider.yearsInBusiness !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Years in Business</p>
                <p className="font-medium">{provider.yearsInBusiness}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{formatDate(provider.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{provider._count.bookings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{provider._count.reviews}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service Areas</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.serviceAreas.map((area) => (
                  <Badge key={area.id} variant="secondary">
                    {area.zipCode}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.bookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {provider.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">
                      {booking.serviceType.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.user.name} &middot;{" "}
                      {formatDate(booking.requestedDate)}
                    </p>
                  </div>
                  <Badge>{booking.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <div key={review.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.title || "No title"}</p>
                    <span className="text-yellow-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.comment}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {review.user.name} &middot; {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
