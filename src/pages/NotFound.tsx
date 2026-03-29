import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold gradient-text">404</h1>
          <p className="mb-4 text-sm text-muted-foreground">Página não encontrada</p>
          <a href="/" className="text-xs text-primary underline hover:text-primary/80 font-mono">
            Voltar ao Scanner
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
