import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-primary/20 mb-2 font-serif">404</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-foreground">
          Oops! Page not found
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>
        <Link to="/">
          <Button className="shadow-glow hover-lift" size="lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
