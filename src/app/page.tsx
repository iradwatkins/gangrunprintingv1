'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Upload, Package, Clock, Shield, Star, CheckCircle, Zap, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Header from '@/components/customer/header'
import Footer from '@/components/customer/footer'

const productCategories = [
  {
    title: 'Business Cards',
    description: 'Premium quality cards that make lasting impressions',
    image: '/images/products/business-cards.jpg',
    href: '/products?category=business-cards',
    popular: true
  },
  {
    title: 'Flyers & Brochures',
    description: 'Eye-catching marketing materials for your campaigns',
    image: '/images/products/flyers.jpg',
    href: '/products?category=flyers',
    popular: false
  },
  {
    title: 'Banners & Signs',
    description: 'Large format printing for maximum visibility',
    image: '/images/products/banners.jpg',
    href: '/products?category=banners',
    popular: false
  },
  {
    title: 'Stickers & Labels',
    description: 'Custom die-cut stickers for any purpose',
    image: '/images/products/stickers.jpg',
    href: '/products?category=stickers',
    popular: true
  },
  {
    title: 'Apparel',
    description: 'Custom printed t-shirts and merchandise',
    image: '/images/products/apparel.jpg',
    href: '/products?category=apparel',
    popular: false
  },
  {
    title: 'Postcards',
    description: 'Direct mail and promotional postcards',
    image: '/images/products/postcards.jpg',
    href: '/products?category=postcards',
    popular: false
  }
]

const featuredProducts = [
  {
    name: 'Premium Business Cards',
    price: 'Starting at $29.99',
    image: '/images/business-cards.jpg',
    badge: 'Most Popular'
  },
  {
    name: 'Custom Flyers',
    price: 'Starting at $49.99',
    image: '/images/flyers.jpg',
    badge: 'Fast Turnaround'
  },
  {
    name: 'Vinyl Banners',
    price: 'Starting at $89.99',
    image: '/images/banners.jpg',
    badge: 'Durable'
  },
  {
    name: 'Die-Cut Stickers',
    price: 'Starting at $24.99',
    image: '/images/stickers.jpg',
    badge: 'Waterproof'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'Tech Solutions Inc.',
    content: 'GangRun Printing exceeded our expectations! The quality is outstanding and delivery was faster than promised.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Small Business Owner',
    company: 'Chen\'s Restaurant',
    content: 'Best printing service I\'ve used. The colors are vibrant and the customer service is exceptional.',
    rating: 5,
    avatar: 'MC'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Event Coordinator',
    company: 'Elite Events',
    content: 'Our event materials looked absolutely professional. Will definitely order again!',
    rating: 5,
    avatar: 'ER'
  }
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <Badge className="inline-flex items-center gap-1 px-3 py-1">
                <Zap className="w-3 h-3" />
                Same Day Printing Available
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                Professional Printing
                <span className="text-primary"> Made Simple</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                High-quality printing services with fast turnaround times. 
                From business cards to banners, we bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link href="/products">
                    <Package className="mr-2 h-5 w-5" />
                    Start Your Order
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/track">Track Order</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-xs sm:text-sm">Free Design Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-xs sm:text-sm">100% Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8">
                  {['Business Cards', 'Flyers', 'Banners', 'Stickers'].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 transform hover:scale-105 transition-transform">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded mb-1 sm:mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-center">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24hr</div>
              <div className="text-sm text-muted-foreground">Fast Turnaround</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Quality Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Product Types</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Product</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select from our wide range of printing products. Each category offers multiple customization options.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {productCategories.map((category) => (
              <Link key={category.title} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer overflow-hidden">
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    {category.popular && (
                      <Badge variant="secondary" className="absolute top-3 right-3 z-10 bg-primary/10 text-primary border-primary/20">
                        Popular
                      </Badge>
                    )}
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <div className="w-full h-full bg-white/50 rounded-lg shadow-sm flex items-center justify-center">
                        <div className="text-center">
                          <Package className="h-16 w-16 text-primary/40 mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground">Sample Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium">Get Started</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular products with competitive pricing and fast delivery
            </p>
          </div>
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent className="-ml-4">
              {featuredProducts.map((product, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 relative">
                      <Badge className="absolute top-4 right-4 z-10">
                        {product.badge}
                      </Badge>
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-20 w-20 text-primary/30" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-primary font-bold">{product.price}</p>
                      <Button className="w-full mt-4" variant="outline" asChild>
                        <Link href="/products">View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose GangRun Printing?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine quality, speed, and service to deliver exceptional printing solutions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-sm text-muted-foreground">
                Same-day and next-day printing options available
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                100% satisfaction or we'll reprint for free
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Free design consultation and file review
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Bulk Discounts</h3>
              <p className="text-sm text-muted-foreground">
                Save more when you order in larger quantities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose from our wide selection of products and upload your design. Our team is ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group" asChild>
              <Link href="/products">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/track">Track Your Order</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  )
}