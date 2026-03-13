import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "PROVIDER":
      redirect("/dashboard/provider");
    case "ADMIN":
      redirect("/dashboard/admin");
    default:
      redirect("/dashboard/homeowner");
  }
}
