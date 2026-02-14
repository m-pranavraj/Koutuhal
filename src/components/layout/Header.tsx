import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  Home,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

/* ── Nav Links Config ───────────────── */
const navLinks = [
  { to: "/", label: "HOME" },
  { to: "/#mentors", label: "MENTORS" },
  { to: "/#reviews", label: "SUCCESS STORIES" },
  { to: "/career-check", label: "CAREER CHECK" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT US" },
];

/* ── Desktop Nav Item ───────────────── */
const NavItem = ({
  to,
  label,
  isActive,
}: {
  to: string;
  label: string;
  isActive?: boolean;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <Link to={to} onClick={handleClick} className="relative group cursor-pointer outline-none">
      <div
        className={cn(
          "px-5 py-2 text-xs font-bold tracking-wider rounded-full transition-all duration-300",
          isActive
            ? "bg-[#ADFF44] text-black shadow-[0_0_20px_rgba(173,255,68,0.3)]"
            : "text-neutral-400 hover:text-white"
        )}
      >
        {label}
      </div>
    </Link>
  );
};

/* ── Mobile Nav Item ────────────────── */
const MobileNavItem = ({
  to,
  label,
  isActive,
  onClick,
  index,
}: {
  to: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick(); // Close menu
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        // Give menu time to close before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={to} onClick={handleClick} className="block w-full">
        <div
          className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-xl transition-all",
            isActive
              ? "bg-[#ADFF44] text-black"
              : "hover:bg-neutral-900 text-neutral-400 hover:text-white"
          )}
        >
          <span className="text-sm font-bold tracking-wider">{label}</span>
        </div>
      </Link>
    </motion.div>
  );
};

/* ═════════════════════════════════════ */
/*               HEADER                 */
/* ═════════════════════════════════════ */
export const Header = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Hide header on auth and onboarding pages
  const hideHeaderPaths = ['/login', '/register', '/onboarding'];
  if (hideHeaderPaths.includes(location.pathname)) return null;

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-black/50 backdrop-blur-md border-b border-white/5 py-3" : "py-5"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#ADFF44] flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(173,255,68,0.2)]">
              K
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Koutuhal<span className="text-[#ADFF44]">.</span>ai
            </span>
          </Link>

          {/* ── Desktop Nav (Pill) ── */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 px-2">
            {navLinks.map((link) => (
              <NavItem
                key={link.to}
                to={link.to}
                label={link.label}
                isActive={isActive(link.to)}
              />
            ))}

            {/* Admin Link if authorized */}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <NavItem to="/admin" label="ADMIN" isActive={isActive("/admin")} />
            )}
            {/* Dashboard Link if authorized */}
            {isAuthenticated && (
              <NavItem to="/dashboard" label="DASHBOARD" isActive={isActive("/dashboard")} />
            )}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-neutral-400 font-medium">Hello, {user?.name?.split(' ')[0]}</span>
                <Button variant="ghost" size="icon" onClick={logout} className="text-neutral-400 hover:text-red-400 hover:bg-red-950/30">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button className="rounded-full bg-[#ADFF44] text-black hover:bg-[#baff66] font-bold text-xs px-6 py-5 tracking-wider shadow-[0_0_20px_rgba(173,255,68,0.2)] hover:shadow-[0_0_30px_rgba(173,255,68,0.4)] transition-all">
                  EXPLORE FREE
                </Button>
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-neutral-950 border-l border-neutral-800 z-50 lg:hidden p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400 hover:text-white">
                  <X />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <MobileNavItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    isActive={isActive(link.to)}
                    onClick={() => setMobileMenuOpen(false)}
                    index={i}
                  />
                ))}

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-neutral-800 my-2" />
                    <MobileNavItem to="/dashboard" label="DASHBOARD" isActive={isActive("/dashboard")} onClick={() => setMobileMenuOpen(false)} index={3} />
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <MobileNavItem to="/admin" label="ADMIN" isActive={isActive("/admin")} onClick={() => setMobileMenuOpen(false)} index={4} />
                    )}
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-red-400 hover:bg-neutral-900 w-full text-left mt-4"
                    >
                      <span className="text-sm font-bold tracking-wider">LOG OUT</span>
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-6">
                    <Button className="w-full rounded-xl bg-[#ADFF44] text-black font-bold h-12">
                      EXPLORE FREE
                    </Button>
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
