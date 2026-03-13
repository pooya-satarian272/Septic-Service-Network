import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { togglePublished } from "./actions";

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const reviews = await db.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      provider: { select: { businessName: true } },
      booking: { select: { serviceType: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Moderation</h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {review.title || "No title"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    By {review.user.name || review.user.email} for{" "}
                    {review.provider.businessName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  {review.isPublished ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Unpublished</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{review.comment}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)} &middot;{" "}
                  {review.booking.serviceType.name}
                </p>
                <form action={togglePublished}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input
                    type="hidden"
                    name="isPublished"
                    value={String(!review.isPublished)}
                  />
                  <Button
                    variant={review.isPublished ? "destructive" : "outline"}
                    size="sm"
                    type="submit"
                  >
                    {review.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No reviews found.
          </p>
        )}
      </div>
    </div>
  );
}
