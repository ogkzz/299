import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Menu, X, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useI18n, LOCALE_OPTIONS } from "@/lib/i18n";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">MAGISK</span>
          <span className="text-[10px] text-primary/60 font-mono hidden sm:inline px-1.5 py-0.5 rounded bg-primary/5">v2.0</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative ml-2" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {LOCALE_OPTIONS.find(o => o.value === locale)?.flag}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 glass-panel-strong rounded-xl border border-border py-1.5 min-w-[130px] z-50 shadow-xl">
                {LOCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setLocale(opt.value); setLangOpen(false); }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 transition-colors ${
                      locale === opt.value ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{opt.flag}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-1">
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary">
              <Globe className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 glass-panel-strong rounded-xl border border-border py-1.5 min-w-[120px] z-50 shadow-xl">
                {LOCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setLocale(opt.value); setLangOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                      locale === opt.value ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <span>{opt.flag}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  location.pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
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
