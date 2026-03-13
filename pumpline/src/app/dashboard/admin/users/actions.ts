"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma";

export async function toggleUserRole(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return;

  const userId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as string;

  // Prevent changing own role
  if (userId === session.user.id) return;

  // Only allow HOMEOWNER and ADMIN role changes
  if (newRole !== "HOMEOWNER" && newRole !== "ADMIN") return;

  await db.user.update({
    where: { id: userId },
    data: { role: newRole as UserRole },
  });

  revalidatePath("/dashboard/admin/users");
}
