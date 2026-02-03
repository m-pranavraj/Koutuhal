import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Search, BarChart3, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Courses', href: '/courses' },
  { name: 'Features', href: '/#features' },
  { name: 'Instructors', href: '/#instructors' },
  { name: 'Mentors', href: '/mentors' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'FAQ', href: '/#faq' },
];

const iconLinks = [
  { icon: FileText, href: '/resume', label: 'Resume', badge: 'NEW' },
  { icon: Search, href: '/mentors', label: 'Search' },
  { icon: BarChart3, href: '/jobs', label: 'Jobs' },
  { icon: Link2, href: '/#mentorship', label: 'Mentorship' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <span className="text-lg font-bold text-white">K</span>
          </div>
          <span className="text-xl font-bold text-foreground">Koutuhal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icon Links & CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {iconLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            >
              <link.icon className="h-4 w-4 text-muted-foreground" />
              {link.badge && (
                <span className="absolute -right-1 -top-1 flex h-4 items-center rounded bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <Link to="/signin">
            <Button variant="ghost" size="sm" className="ml-2">
              Sign In
            </Button>
          </Link>
          <Link to="/courses">
            <Button size="sm" className="gradient-primary text-white hover:opacity-90">
              Enroll Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <Link to="/signin" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/courses" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-primary text-white">
                  Enroll Now
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
