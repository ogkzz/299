import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const links = [
  { to: "/", label: "Scanner" },
  { to: "/features", label: "Funcionalidades" },
  { to: "/terms", label: "Termos" },
  { to: "/privacy", label: "Privacidade" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-foreground" />
          <span className="text-lg font-semibold tracking-tight">299</span>
        </Link>
        <div className="flex items-center gap-1">
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
        </div>
      </div>
    </motion.nav>
  );
}
