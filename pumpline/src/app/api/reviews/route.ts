import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required").max(200),
  comment: z.string().min(1, "Comment is required").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json(
        { error: "Only homeowners can leave reviews" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { bookingId, rating, title, comment } = parsed.data;

    // Verify booking exists, belongs to user, and is completed
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "This booking does not belong to you" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { error: "A review already exists for this booking" },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        providerId: booking.providerId,
        bookingId,
        rating,
        title,
        comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
