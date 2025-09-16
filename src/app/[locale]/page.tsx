// Temporarily simplified - i18n disabled
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Printing Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            High-quality printing solutions for all your business needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700" size="lg">
              <Link href="/products">
                View Products
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">
                Get Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Business Printing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Professional materials for your business
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Business Cards</li>
                  <li>• Flyers</li>
                  <li>• Brochures</li>
                  <li>• Letterhead</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Eye-catching promotional materials
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Banners</li>
                  <li>• Posters</li>
                  <li>• Signs</li>
                  <li>• Decals</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Printing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Custom prints for personal use
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Invitations</li>
                  <li>• Announcements</li>
                  <li>• Photos</li>
                  <li>• Calendars</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold">Fast Turnaround</h3>
              <p className="text-gray-600 text-sm">Quick delivery on all orders</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Professional grade materials</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold">Affordable Pricing</h3>
              <p className="text-gray-600 text-sm">Competitive rates for all services</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold">Expert Support</h3>
              <p className="text-gray-600 text-sm">Professional guidance every step</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today for a free quote on your printing needs
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contact">
              Get Your Quote
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}