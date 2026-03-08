import echoLogo from "@/assets/echo-logo.png";

const Footer = () => {
  return (
    <footer className="bg-bark py-echo-3xl">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-echo-2xl">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={echoLogo} alt="Echo" className="h-8 w-8 brightness-200" />
              <span className="font-heading text-xl font-bold text-sand">Echo</span>
            </div>
            <p className="text-stone text-sm leading-relaxed max-w-sm">
              To heal. To be heard. To help others heal. Echo is where people who have 
              experienced pain find safe, dignified support — and become the voice that 
              shows someone else that healing is possible.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-sand mb-4">For Seekers</h4>
            <ul className="space-y-2.5">
              <li><a href="/auth" className="text-stone text-sm hover:text-mist transition-colors">Get Support</a></li>
              <li><a href="/#how-it-works" className="text-stone text-sm hover:text-mist transition-colors">How It Works</a></li>
              <li><a href="/#principles" className="text-stone text-sm hover:text-mist transition-colors">Our Principles</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-sand mb-4">For Volunteers</h4>
            <ul className="space-y-2.5">
              <li><a href="/volunteer" className="text-stone text-sm hover:text-mist transition-colors">Become a Volunteer</a></li>
              <li><a href="/#for-volunteers" className="text-stone text-sm hover:text-mist transition-colors">Why Volunteer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-driftwood/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone text-xs">
            © {new Date().getFullYear()} Project Echo. Free forever for seekers. · <a href="/privacy" className="hover:text-mist transition-colors underline">Privacy Policy</a>
          </p>
          <p className="text-driftwood text-xs">
            Dignity · Safety · Meaningful Access · Participation · Empowerment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
