import echoLogo from "@/assets/echo-logo.png";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-parchment/80 backdrop-blur-md border-b border-stone">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2.5">
          <img src={echoLogo} alt="Echo" className="h-8 w-8" />
          <span className="font-heading text-xl font-bold text-bark">Echo</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">
            How It Works
          </a>
          <a href="#principles" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">
            Principles
          </a>
          <a href="#for-volunteers" className="text-driftwood hover:text-forest transition-colors text-sm font-medium">
            For Volunteers
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button variant="default" size="sm">Get Support</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
