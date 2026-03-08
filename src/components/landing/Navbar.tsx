import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import echoLogo from "@/assets/echo-logo.png";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-parchment/80 backdrop-blur-md border-b border-stone">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={echoLogo} alt="Echo" className="h-8 w-8" />
          <span className="font-heading text-xl font-bold text-bark">Echo</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">How It Works</a>
          <a href="#principles" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">Principles</a>
          <a href="#for-volunteers" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">For Volunteers</a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/auth">Get Support</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-bark"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-parchment dark:bg-background border-t border-stone overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 space-y-3">
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-driftwood hover:text-forest text-sm font-medium">How It Works</a>
          <a href="#principles" onClick={() => setOpen(false)} className="block text-driftwood hover:text-forest text-sm font-medium">Principles</a>
          <a href="#for-volunteers" onClick={() => setOpen(false)} className="block text-driftwood hover:text-forest text-sm font-medium">For Volunteers</a>
          <div className="pt-3 border-t border-stone flex flex-col gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>Sign In</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>Get Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
