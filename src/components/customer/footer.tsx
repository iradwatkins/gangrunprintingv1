import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  products: [
    { name: 'Business Cards', href: '/products?category=business-cards' },
    { name: 'Flyers & Brochures', href: '/products?category=flyers' },
    { name: 'Banners & Signs', href: '/products?category=banners' },
    { name: 'Stickers & Labels', href: '/products?category=stickers' },
    { name: 'Apparel', href: '/products?category=apparel' },
    { name: 'View All Products', href: '/products' },
  ],
  services: [
    { name: 'Design Services', href: '#' },
    { name: 'Bulk Orders', href: '#' },
    { name: 'Rush Printing', href: '#' },
    { name: 'Free Samples', href: '#' },
    { name: 'Custom Quotes', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Press', href: '#' },
  ],
  support: [
    { name: 'Track Order', href: '/track' },
    { name: 'Help Center', href: '#' },
    { name: 'Shipping Info', href: '#' },
    { name: 'Return Policy', href: '#' },
    { name: 'FAQs', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      {/* Newsletter Section */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Subscribe to Our Newsletter</h3>
              <p className="text-sm text-muted-foreground">Get exclusive deals and printing tips delivered to your inbox</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                className="max-w-sm" 
                placeholder="Enter your email" 
                type="email"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link className="flex items-center space-x-2 mb-4" href="/">
              <img 
                src="/gangrunprinting_logo_new_1448921366__42384-268x50.png" 
                alt="GangRun Printing" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted partner for professional printing services. Quality prints, fast turnaround, and exceptional service.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>1-800-PRINTING</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@gangrunprinting.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Print Street, Houston, TX 77001</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-xs">✓</span>
              </div>
              <span>100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-xs">🚚</span>
              </div>
              <span>Free Shipping on Orders $99+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-xs">🔒</span>
              </div>
              <span>Secure Payment Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-xs">♻️</span>
              </div>
              <span>Eco-Friendly Printing</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 GangRun Printing. All rights reserved.</p>
            <div className="flex gap-4">
              <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
              <Link className="hover:text-primary transition-colors" href="#">Cookie Policy</Link>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-2">
            <Button className="hover:text-primary" size="icon" variant="ghost">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button className="hover:text-primary" size="icon" variant="ghost">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button className="hover:text-primary" size="icon" variant="ghost">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button className="hover:text-primary" size="icon" variant="ghost">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">We accept:</span>
          <div className="flex gap-2">
            {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay'].map((method) => (
              <div key={method} className="px-3 py-1 border rounded text-xs text-muted-foreground">
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}