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
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default async function ProviderProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const provider = await db.provider.findUnique({
    where: { userId: session.user.id },
  });

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const data = {
      businessName: formData.get("businessName") as string,
      bio: (formData.get("bio") as string) || null,
      phone: formData.get("phone") as string,
      website: (formData.get("website") as string) || null,
      licenseNumber: (formData.get("licenseNumber") as string) || null,
      yearsInBusiness: formData.get("yearsInBusiness")
        ? parseInt(formData.get("yearsInBusiness") as string, 10)
        : null,
      responseTime: (formData.get("responseTime") as string) || null,
    };

    if (!data.businessName || !data.phone) return;

    const existing = await db.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      await db.provider.update({
        where: { userId: session.user.id },
        data,
      });
    } else {
      const slug = data.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await db.provider.create({
        data: {
          ...data,
          userId: session.user.id,
          slug: `${slug}-${Date.now().toString(36)}`,
          businessName: data.businessName,
          phone: data.phone,
        },
      });
    }

    revalidatePath("/dashboard/provider/profile");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Provider Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          {provider
            ? "Update your business information."
            : "Set up your provider profile to start receiving bookings."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will be displayed on your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={provider?.businessName || ""}
                required
                placeholder="Your Business Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={provider?.bio || ""}
                placeholder="Tell customers about your business, experience, and services..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={provider?.phone || ""}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={provider?.website || ""}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  defaultValue={provider?.licenseNumber || ""}
                  placeholder="License #"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  type="number"
                  min="0"
                  defaultValue={provider?.yearsInBusiness ?? ""}
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseTime">Typical Response Time</Label>
              <Input
                id="responseTime"
                name="responseTime"
                defaultValue={provider?.responseTime || ""}
                placeholder="e.g. Within 24 hours"
              />
            </div>

            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {provider ? "Save Changes" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
