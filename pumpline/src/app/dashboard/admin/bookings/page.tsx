import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, CheckCircle2, XCircle, Zap } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      provider: { select: { businessName: true } },
      serviceType: { select: { name: true } },
      property: { select: { address: true, city: true, state: true } },
    },
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const activeCount = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS"
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "CANCELLED"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Bookings</h1>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{cancelledCount}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">
                      Service
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Provider
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Property
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        {booking.serviceType.name}
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="truncate max-w-[150px]">
                            {booking.user.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {booking.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 truncate max-w-[150px]">
                        {booking.provider.businessName}
                      </td>
                      <td className="py-3">
                        <p className="truncate max-w-[150px]">
                          {booking.property.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.property.city}, {booking.property.state}
                        </p>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(booking.requestedDate)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={statusColors[booking.status]}
                        >
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
