"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function togglePublished(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const reviewId = formData.get("reviewId") as string;
  const isPublished = formData.get("isPublished") === "true";

  await db.review.update({
    where: { id: reviewId },
    data: { isPublished },
  });

  revalidatePath("/dashboard/admin/reviews");
}
