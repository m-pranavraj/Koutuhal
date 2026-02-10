import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

/* ── Nav Links Config ───────────────── */
const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/search-experts", icon: Users, label: "Mentors" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/resume-active", icon: FileText, label: "Resume" },
];

const publicNavLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact Us" },
];

/* ── Desktop Nav Item ───────────────── */
const NavItem = ({
  to,
  label,
  isActive,
  onClick
}: {
  to: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const isAnchor = to.startsWith('#');
  const Component = isAnchor ? 'a' : Link;
  const hrefProps = isAnchor ? { href: to, onClick } : { to, onClick };

  return (
    // @ts-ignore
    <Component {...hrefProps} className="relative group cursor-pointer">
      <span
        className={cn(
          "relative z-10 px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 font-display uppercase",
          isActive
            ? "text-[#ADFF44]"
            : "text-neutral-500 group-hover:text-white"
        )}
      >
        {label}
      </span>

      {/* Active indicator — neon dot */}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ADFF44] shadow-[0_0_8px_rgba(173,255,68,0.8)]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {/* Hover underline slide */}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-neutral-600 group-hover:w-3/4 transition-all duration-300" />
    </Component>
  );
};


/* ── Mobile Nav Item ────────────────── */
const MobileNavItem = ({
  to,
  icon: Icon,
  label,
  isActive,
  onClick,
  index,
}: {
  to: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    <Link to={to} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
          isActive
            ? "bg-[#ADFF44]/10 border border-[#ADFF44]/20"
            : "hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isActive ? "bg-[#ADFF44] shadow-[0_0_12px_rgba(173,255,68,0.3)]" : "bg-neutral-800"
          )}
        >
          <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-neutral-500")} />
        </div>
        <span
          className={cn(
            "text-base font-display font-semibold tracking-wide",
            isActive ? "text-[#ADFF44]" : "text-neutral-400"
          )}
        >
          {label}
        </span>
        {isActive && (
          <div className="ml-auto w-2 h-2 rounded-full bg-[#ADFF44] animate-pulse" />
        )}
      </div>
    </Link>
  </motion.div>
);

/* ═════════════════════════════════════ */
/*               HEADER                 */
/* ═════════════════════════════════════ */
export const Header = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth(); // Auth Hook
  const isActive = (path: string) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Hide header on login page
  if (location.pathname === '/login') return null;

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pointer-events-auto">
          <motion.div
            className={cn(
              "relative mx-auto flex items-center justify-between rounded-2xl px-6 transition-all duration-500",
              scrolled
                ? "h-14 bg-black/90 backdrop-blur-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-4xl"
                : "h-16 bg-transparent border border-transparent max-w-6xl"
            )}
            layout
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                className={cn(
                  "rounded-xl flex items-center justify-center font-display font-bold text-black transition-all",
                  scrolled ? "w-8 h-8 text-sm" : "w-10 h-10 text-lg"
                )}
                style={{
                  background: "#ADFF44",
                  boxShadow: scrolled
                    ? "0 0 12px rgba(173,255,68,0.3)"
                    : "0 0 24px rgba(173,255,68,0.4)",
                }}
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                K
              </motion.div>
              <motion.span
                className={cn(
                  "font-display font-bold tracking-tight hidden sm:block transition-all",
                  scrolled ? "text-base text-white" : "text-xl text-white"
                )}
              >
                Koutuhal
                <span className="text-[#ADFF44]">.</span>
                ai
              </motion.span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {isAuthenticated ? (
                // Show Full Nav if Authenticated
                navLinks.map((link) => (
                  <NavItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    isActive={isActive(link.to)}
                  />
                ))
              ) : (
                // Show Public Nav (Router Links) if Unauthenticated
                publicNavLinks.map((link) => (
                  <NavItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    isActive={isActive(link.to)}
                  />
                ))
              )}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2">


              {isAuthenticated ? (
                // User Profile & Logout
                <div className="flex items-center gap-3 ml-2">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[#ADFF44] font-bold border border-neutral-700">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-neutral-400 hover:text-red-400">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // Public CTA (Explore for Free -> Login)
                <motion.div className="hidden sm:block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/login">
                    <button className="relative group h-10 px-6 rounded-xl bg-[#ADFF44] text-black text-sm font-display font-bold tracking-wide overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(173,255,68,0.4)]">
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center gap-2">
                        Explore for Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </Link>
                </motion.div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >

                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-24 left-3 right-3 bg-neutral-950 border border-neutral-800 shadow-[0_24px_80px_rgba(0,0,0,0.8)] rounded-3xl p-5 z-50 lg:hidden"
            >
              {/* Decorative glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#ADFF44]/10 blur-3xl rounded-full pointer-events-none" />

              <nav className="flex flex-col gap-1 relative">
                {navLinks.map((link, i) => (
                  <MobileNavItem
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    isActive={isActive(link.to)}
                    onClick={() => setMobileMenuOpen(false)}
                    index={i}
                  />
                ))}

                <div className="h-px bg-neutral-800 my-3" />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full h-14 rounded-2xl bg-[#ADFF44] text-black font-display font-bold text-lg tracking-wide shadow-[0_0_30px_rgba(173,255,68,0.2)] hover:shadow-[0_0_40px_rgba(173,255,68,0.3)] transition-all flex items-center justify-center gap-2">
                      Explore for Free
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
