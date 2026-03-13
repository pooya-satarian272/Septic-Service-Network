import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";
import { BookingStatus } from "@/generated/prisma";

const updateBookingSchema = z.object({
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// Valid status transitions per role
const providerTransitions: Record<string, BookingStatus[]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};

const homeownerTransitions: Record<string, BookingStatus[]> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: ["CANCELLED"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true, businessName: true } },
        serviceType: { select: { name: true } },
        property: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const currentStatus = booking.status;
    const isProvider = booking.provider.userId === session.user.id;
    const isHomeowner = booking.userId === session.user.id;

    if (!isProvider && !isHomeowner) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Validate transition
    const allowedTransitions = isProvider
      ? providerTransitions[currentStatus] || []
      : homeownerTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus as BookingStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${currentStatus} to ${newStatus} as ${isProvider ? "provider" : "homeowner"}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
    };

    if (newStatus === "CONFIRMED") {
      updateData.confirmedDate = new Date();
    }
    if (newStatus === "COMPLETED") {
      updateData.completedDate = new Date();
    }

    const updated = await db.booking.update({
      where: { id },
      data: updateData,
      include: {
        provider: { select: { businessName: true } },
        property: { select: { address: true, city: true } },
        serviceType: { select: { name: true } },
      },
    });

    // Auto-create ServiceRecord on completion
    if (newStatus === "COMPLETED") {
      await db.serviceRecord.create({
        data: {
          propertyId: booking.propertyId,
          bookingId: booking.id,
          serviceDate: new Date(),
          serviceType: booking.serviceType.name,
          providerName: booking.provider.businessName,
          notes: booking.notes,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
