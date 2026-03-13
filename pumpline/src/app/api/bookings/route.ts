import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const createBookingSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  propertyId: z.string().min(1, "Property is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json(
        { error: "Only homeowners can create bookings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { providerId, propertyId, serviceTypeId, requestedDate, notes } =
      parsed.data;

    // Verify the property belongs to the user
    const property = await db.property.findFirst({
      where: { id: propertyId, userId: session.user.id },
    });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not owned by you" },
        { status: 404 }
      );
    }

    // Verify provider exists and is active
    const provider = await db.provider.findFirst({
      where: { id: providerId, isActive: true },
    });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found or inactive" },
        { status: 404 }
      );
    }

    // Verify service type exists
    const serviceType = await db.serviceType.findUnique({
      where: { id: serviceTypeId },
    });
    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    const booking = await db.booking.create({
      data: {
        userId: session.user.id,
        providerId,
        propertyId,
        serviceTypeId,
        requestedDate: new Date(requestedDate),
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        provider: { select: { businessName: true } },
        property: { select: { address: true, city: true } },
        serviceType: { select: { name: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where =
      session.user.role === "PROVIDER"
        ? {
            provider: { userId: session.user.id },
          }
        : { userId: session.user.id };

    const bookings = await db.booking.findMany({
      where,
      include: {
        provider: { select: { businessName: true, slug: true } },
        property: { select: { address: true, city: true, state: true } },
        serviceType: { select: { name: true } },
        review: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
