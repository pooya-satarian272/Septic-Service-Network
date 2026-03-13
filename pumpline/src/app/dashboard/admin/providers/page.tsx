import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toggleVerified, toggleActive } from "./actions";

export default async function AdminProvidersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const providers = await db.provider.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { reviews: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Providers</h1>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/dashboard/admin/providers/${provider.id}`}
                      className="hover:underline"
                    >
                      {provider.businessName}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {provider.user.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  {provider.isVerified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                  {provider.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>{provider._count.reviews} reviews</span>
                  <span>{provider._count.bookings} bookings</span>
                </div>
                <div className="flex gap-2">
                  <form action={toggleVerified}>
                    <input
                      type="hidden"
                      name="providerId"
                      value={provider.id}
                    />
                    <input
                      type="hidden"
                      name="isVerified"
                      value={String(!provider.isVerified)}
                    />
                    <Button variant="outline" size="sm" type="submit">
                      {provider.isVerified ? "Unverify" : "Verify"}
                    </Button>
                  </form>
                  <form action={toggleActive}>
                    <input
                      type="hidden"
                      name="providerId"
                      value={provider.id}
                    />
                    <input
                      type="hidden"
                      name="isActive"
                      value={String(!provider.isActive)}
                    />
                    <Button
                      variant={provider.isActive ? "destructive" : "outline"}
                      size="sm"
                      type="submit"
                    >
                      {provider.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {providers.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No providers found.
          </p>
        )}
      </div>
    </div>
  );
}
