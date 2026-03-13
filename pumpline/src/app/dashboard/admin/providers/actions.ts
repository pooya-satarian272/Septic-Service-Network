"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleVerified(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const providerId = formData.get("providerId") as string;
  const isVerified = formData.get("isVerified") === "true";

  await db.provider.update({
    where: { id: providerId },
    data: { isVerified },
  });

  revalidatePath("/dashboard/admin/providers");
}

export async function toggleActive(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const providerId = formData.get("providerId") as string;
  const isActive = formData.get("isActive") === "true";

  await db.provider.update({
    where: { id: providerId },
    data: { isActive },
  });

  revalidatePath("/dashboard/admin/providers");
}
