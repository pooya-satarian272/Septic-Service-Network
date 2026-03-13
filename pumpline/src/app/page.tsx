import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  Shield,
  Star,
  Clock,
  DollarSign,
  Home,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Find Trusted Septic
              <br />
              Service Providers
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Stop relying on word of mouth. Browse verified providers with
              transparent pricing, real reviews from your neighbors, and proven
              work history.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 h-12 text-base font-semibold"
              >
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Provider
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="border border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8 h-12 text-base"
              >
                <Link href="/register/provider">List Your Business</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Shield, label: "Verified Providers", sub: "Background checked" },
              { icon: Star, label: "Real Reviews", sub: "From your neighbors" },
              { icon: DollarSign, label: "Transparent Pricing", sub: "No surprises" },
              { icon: Clock, label: "Fast Response", sub: "Track response times" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              From emergency pumping to routine maintenance, Pumpline connects
              you with the right provider in three simple steps.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                icon: Search,
                title: "Search Your Area",
                description:
                  "Enter your zip code and the service you need. Browse providers rated and reviewed by homeowners in your county.",
              },
              {
                step: "2",
                icon: CheckCircle,
                title: "Compare & Book",
                description:
                  "See pricing, response times, photos of completed work, and reviews. Book directly through the platform.",
              },
              {
                step: "3",
                icon: FileText,
                title: "Build a Record",
                description:
                  "Every service is logged to your property. Maintenance records follow the home through inspections, sales, and ownership changes.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Homeowners */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                For Homeowners
              </span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Stop Guessing. Start Knowing.
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Your septic system is one of the most expensive components of
                your home. Pumpline gives you the information you need to make
                smart decisions about who services it.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Browse providers free — see ratings, pricing, and response times",
                  "Read reviews from homeowners in your neighborhood",
                  "Book service and track your property maintenance history",
                  "Get reminders when your next pumping or inspection is due",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/search">
                    Find a Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 lg:p-12">
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      AC
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Acme Septic Co.</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(47)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>Responds in 2hrs</span>
                    <span>$250 - $450</span>
                    <span>15+ yrs</span>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                      RS
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Rural Septic Solutions</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(31)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>Responds in 4hrs</span>
                    <span>$200 - $375</span>
                    <span>8+ yrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Providers */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 lg:p-12">
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3x</p>
                    <p className="text-xs text-gray-500">More leads per month</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                    <p className="text-xs text-gray-500">Avg provider rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Home className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-500">Repeat customer rate</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                For Providers
              </span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Grow Your Business on Trust
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                One emergency call becomes a maintenance relationship. Build your
                reputation with verified work history and transparent reviews
                that bring customers back year after year.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Premium listings put you at the top of local search results",
                  "Verified badge and work photos build trust before the first call",
                  "Manage bookings, track jobs, and build your review portfolio",
                  "Flexible plans from $50 to $200/month — cancel anytime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href="/register/provider">
                    List Your Business
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Find the Right Provider?
          </h2>
          <p className="mt-3 text-blue-100 max-w-lg mx-auto">
            Join homeowners in your county who are making smarter decisions about
            their septic services.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 h-12"
            >
              <Link href="/search">Search Providers</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="border border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8 h-12"
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
