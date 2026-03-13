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
import { Button } from "@/components/ui/button";
import { Users, User, Building2, Shield } from "lucide-react";
import { toggleUserRole } from "./actions";

const roleColors: Record<string, string> = {
  HOMEOWNER: "bg-blue-100 text-blue-800",
  PROVIDER: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800",
};

const roleIcons: Record<string, typeof User> = {
  HOMEOWNER: User,
  PROVIDER: Building2,
  ADMIN: Shield,
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { businessName: true, isVerified: true } },
      _count: { select: { bookings: true, reviews: true, properties: true } },
    },
  });

  const totalHomeowners = users.filter((u) => u.role === "HOMEOWNER").length;
  const totalProviders = users.filter((u) => u.role === "PROVIDER").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <User className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalHomeowners}</p>
              <p className="text-xs text-muted-foreground">Homeowners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalProviders}</p>
              <p className="text-xs text-muted-foreground">Providers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Shield className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{totalAdmins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => {
          const RoleIcon = roleIcons[user.role] || User;
          return (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <RoleIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {user.name || "Unnamed User"}
                        </p>
                        <Badge
                          variant="secondary"
                          className={roleColors[user.role]}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {user.role === "HOMEOWNER" && (
                          <>
                            <span>{user._count.properties} properties</span>
                            <span>{user._count.bookings} bookings</span>
                          </>
                        )}
                        {user.role === "PROVIDER" && user.provider && (
                          <>
                            <span>{user.provider.businessName}</span>
                            {user.provider.isVerified && (
                              <span className="text-green-600">Verified</span>
                            )}
                          </>
                        )}
                        <span>
                          Joined{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {user.role === "HOMEOWNER" && (
                      <form action={toggleUserRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="newRole" value="ADMIN" />
                        <Button variant="outline" size="sm" type="submit">
                          Make Admin
                        </Button>
                      </form>
                    )}
                    {user.role === "ADMIN" &&
                      user.id !== session.user.id && (
                        <form action={toggleUserRole}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input
                            type="hidden"
                            name="newRole"
                            value="HOMEOWNER"
                          />
                          <Button variant="outline" size="sm" type="submit">
                            Remove Admin
                          </Button>
                        </form>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {users.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
