import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useI18n, LOCALE_OPTIONS } from "@/lib/i18n";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();

  const links = [
    { to: "/", label: t('nav.scanner') },
    { to: "/features", label: t('nav.features') },
    { to: "/blacklist", label: t('nav.blacklist') },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-foreground" />
          <span className="text-base font-semibold tracking-tight">299</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location.pathname === link.to
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Language switcher */}
          <div className="relative ml-2">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {LOCALE_OPTIONS.find(o => o.value === locale)?.flag}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 glass-panel-strong rounded-lg border border-border py-1 min-w-[140px] z-50">
                {LOCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setLocale(opt.value); setLangOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                      locale === opt.value ? 'text-foreground bg-foreground/5' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <span>{opt.flag}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 glass-panel-strong rounded-lg border border-border py-1 min-w-[130px] z-50">
                {LOCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setLocale(opt.value); setLangOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                      locale === opt.value ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <span>{opt.flag}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border"
        >
          <div className="container mx-auto px-4 py-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === link.to
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
