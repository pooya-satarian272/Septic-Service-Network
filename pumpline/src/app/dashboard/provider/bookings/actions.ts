"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

async function getProvider() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return db.provider.findUnique({
    where: { userId: session.user.id },
  });
}

async function verifyBookingOwnership(bookingId: string, providerId: string) {
  return db.booking.findFirst({
    where: { id: bookingId, providerId },
  });
}

export async function confirmBooking(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const provider = await getProvider();
  if (!provider) return;

  const booking = await verifyBookingOwnership(bookingId, provider.id);
  if (!booking || booking.status !== BookingStatus.PENDING) return;

  await db.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRMED, confirmedDate: new Date() },
  });

  revalidatePath("/dashboard/provider/bookings");
}

export async function markComplete(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const provider = await getProvider();
  if (!provider) return;

  const booking = await verifyBookingOwnership(bookingId, provider.id);
  if (
    !booking ||
    (booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.IN_PROGRESS)
  )
    return;

  await db.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED, completedDate: new Date() },
  });

  // Auto-create service record
  const bookingWithDetails = await db.booking.findUnique({
    where: { id: bookingId },
    include: { serviceType: true },
  });

  if (bookingWithDetails) {
    await db.serviceRecord.create({
      data: {
        propertyId: bookingWithDetails.propertyId,
        bookingId: bookingWithDetails.id,
        serviceDate: new Date(),
        serviceType: bookingWithDetails.serviceType.name,
        providerName: provider.businessName,
        cost: bookingWithDetails.finalCost || bookingWithDetails.estimatedCost,
      },
    });
  }

  revalidatePath("/dashboard/provider/bookings");
}

export async function cancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const provider = await getProvider();
  if (!provider) return;

  const booking = await verifyBookingOwnership(bookingId, provider.id);
  if (!booking || booking.status === BookingStatus.COMPLETED) return;

  await db.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  revalidatePath("/dashboard/provider/bookings");
}
