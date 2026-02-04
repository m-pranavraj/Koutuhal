import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search, Home, BookOpen, Users, Briefcase, FileText, LayoutDashboard, Menu, Sparkles, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

const NavItem = ({ to, icon: Icon, label, isActive, mobile }: { to: string, icon: any, label: string, isActive: boolean, mobile?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (mobile) {
    return (
      <Link to={to} className="w-full">
        <motion.div
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full",
            isActive
              ? "bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          )}
          whileTap={{ scale: 0.98 }}
        >
          <div className={cn("p-2 rounded-lg", isActive ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-100 dark:bg-slate-900")}>
            <Icon className={cn("w-5 h-5", isActive ? "fill-purple-700 text-purple-700 dark:text-purple-300 dark:fill-purple-300" : "text-slate-500")} />
          </div>
          <span className="font-semibold text-lg">{label}</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={to} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full transition-colors relative",
          isActive
            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
            : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
        )}
        layout
      >
        <Icon className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
        <AnimatePresence>
          {(isHovered || isActive) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

export const Header = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-4 left-0 w-full z-50 py-0 transition-all duration-300 pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-lg rounded-full px-6 transition-all duration-300 flex items-center justify-between h-16 max-w-5xl relative z-50">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                K
              </div>
              <motion.span
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Koutuhal
              </motion.span>
            </Link>

            {/* Floating Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavItem to="/" icon={Home} label="Home" isActive={isActive("/")} />
              <NavItem to="/courses" icon={BookOpen} label="Courses" isActive={isActive("/courses")} />
              <NavItem to="/ai-tutor" icon={Sparkles} label="AI Tutor" isActive={isActive("/ai-tutor")} />
              <NavItem to="/search-experts" icon={Users} label="Mentors" isActive={isActive("/search-experts")} />
              <NavItem to="/jobs" icon={Briefcase} label="Jobs" isActive={isActive("/jobs")} />
              <NavItem to="/resume-active" icon={FileText} label="Resume" isActive={isActive("/resume-active")} />
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={isActive("/dashboard")} />
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              <motion.div
                className="hidden md:flex items-center bg-gray-100/50 dark:bg-slate-800/50 rounded-full px-4 py-2 border border-transparent focus-within:border-purple-300 dark:focus-within:border-purple-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-purple-100 dark:focus-within:ring-purple-900/20 transition-all w-32 focus-within:w-48"
                layout
              >
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-slate-300 placeholder:text-gray-400 focus:ring-0"
                />
              </motion.div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button className="hidden sm:flex rounded-full px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                Sign In
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed top-24 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl p-4 z-50 lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-2">
                <NavItem to="/" icon={Home} label="Home" isActive={isActive("/")} mobile />
                <NavItem to="/courses" icon={BookOpen} label="Courses" isActive={isActive("/courses")} mobile />
                <NavItem to="/ai-tutor" icon={Sparkles} label="AI Tutor" isActive={isActive("/ai-tutor")} mobile />
                <NavItem to="/search-experts" icon={Users} label="Mentors" isActive={isActive("/search-experts")} mobile />
                <NavItem to="/jobs" icon={Briefcase} label="Jobs" isActive={isActive("/jobs")} mobile />
                <NavItem to="/resume-active" icon={FileText} label="Resume" isActive={isActive("/resume-active")} mobile />
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={isActive("/dashboard")} mobile />

                <div className="h-px bg-slate-200 my-2" />

                <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg h-12 text-lg font-medium">
                  Sign In to Koutuhal
                </Button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
