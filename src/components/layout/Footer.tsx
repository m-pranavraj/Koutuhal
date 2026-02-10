import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickLinks = [
  { name: 'About Us', href: '/#about' },
  { name: 'Courses', href: '/courses' },
  { name: 'Instructors', href: '/#instructors' },
  { name: 'Success Stories', href: '/#testimonials' },
  { name: 'Career Support', href: '/jobs' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms and Conditions', href: '/terms' },
  { name: 'Cancellation & Refunds', href: '/refunds' },
  { name: 'Shipping', href: '/shipping' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-800 bg-black text-neutral-400">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ADFF44]">
                <span className="text-lg font-bold text-black">K</span>
              </div>
              <span className="text-xl font-display font-bold text-white">Koutuhal</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Empowering the next generation of AI professionals with world-class education and practical skills for the future of technology.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:info@koutuhal.in" className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" />
                info@koutuhal.in
              </a>
              <a href="tel:+919730797309" className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4" />
                97307 97309
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Bangalore, Karnataka, India
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 transition-colors hover:bg-[#ADFF44] hover:text-black">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 transition-colors hover:bg-[#ADFF44] hover:text-black">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-slate-700">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Stay Updated</h4>
            <p className="mb-4 text-sm text-slate-400">
              Get the latest AI news, course updates, and career tips delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
              <Button className="bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold">
                Subscribe
              </Button>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-[#ADFF44]">
                Book a Call
              </Button>
              <Button variant="outline" size="sm" className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-[#ADFF44]">
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            © 2025 Koutuhal. All rights reserved. Made with ❤️ for Indian students.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 rounded bg-[#ADFF44]/10 px-2 py-1 text-xs text-[#ADFF44]">
              🇮🇳 Made in India
            </span>
            <span className="flex items-center gap-1 rounded bg-neutral-900 px-2 py-1 text-xs text-neutral-500">
              ISO 27001 Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
