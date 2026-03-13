import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Wrench } from "lucide-react";

export default async function ProviderServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const provider = await db.provider.findUnique({
    where: { userId: session.user.id },
    include: { services: true },
  });

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Set Up Your Profile First</h1>
        <p className="text-muted-foreground mb-4">
          You need to create your provider profile before managing services.
        </p>
        <Button asChild>
          <a href="/dashboard/provider/profile">Create Profile</a>
        </Button>
      </div>
    );
  }

  const serviceTypes = await db.serviceType.findMany({
    orderBy: { name: "asc" },
  });

  const existingServices = new Map(
    provider.services.map((s) => [s.serviceTypeId, s])
  );

  async function saveServices(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const provider = await db.provider.findUnique({
      where: { userId: session.user.id },
    });
    if (!provider) return;

    const serviceTypes = await db.serviceType.findMany();
    const enabledIds = formData.getAll("enabled") as string[];

    // Delete services that are no longer enabled
    await db.providerService.deleteMany({
      where: {
        providerId: provider.id,
        serviceTypeId: { notIn: enabledIds },
      },
    });

    // Upsert enabled services
    for (const serviceTypeId of enabledIds) {
      const priceMin = formData.get(`priceMin-${serviceTypeId}`) as string;
      const priceMax = formData.get(`priceMax-${serviceTypeId}`) as string;
      const description = formData.get(
        `description-${serviceTypeId}`
      ) as string;

      await db.providerService.upsert({
        where: {
          providerId_serviceTypeId: {
            providerId: provider.id,
            serviceTypeId,
          },
        },
        create: {
          providerId: provider.id,
          serviceTypeId,
          priceMin: priceMin ? parseFloat(priceMin) : null,
          priceMax: priceMax ? parseFloat(priceMax) : null,
          description: description || null,
        },
        update: {
          priceMin: priceMin ? parseFloat(priceMin) : null,
          priceMax: priceMax ? parseFloat(priceMax) : null,
          description: description || null,
        },
      });
    }

    revalidatePath("/dashboard/provider/services");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Services &amp; Pricing
        </h1>
        <p className="text-muted-foreground mt-1">
          Select the services you offer and set your pricing.
        </p>
      </div>

      {serviceTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No service types have been configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <form action={saveServices}>
          <div className="space-y-4">
            {serviceTypes.map((st) => {
              const existing = existingServices.get(st.id);
              const isActive = !!existing;

              return (
                <Card key={st.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enabled"
                        value={st.id}
                        defaultChecked={isActive}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <CardTitle className="text-base">{st.name}</CardTitle>
                        {st.description && (
                          <CardDescription className="mt-0.5">
                            {st.description}
                          </CardDescription>
                        )}
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`priceMin-${st.id}`}>
                          Min Price ($)
                        </Label>
                        <Input
                          id={`priceMin-${st.id}`}
                          name={`priceMin-${st.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={existing?.priceMin?.toString() || ""}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`priceMax-${st.id}`}>
                          Max Price ($)
                        </Label>
                        <Input
                          id={`priceMax-${st.id}`}
                          name={`priceMax-${st.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={existing?.priceMax?.toString() || ""}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${st.id}`}>
                          Notes
                        </Label>
                        <Input
                          id={`description-${st.id}`}
                          name={`description-${st.id}`}
                          defaultValue={existing?.description || ""}
                          placeholder="Optional details"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save Services
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
