import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "echo_cookie_dismissed";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Cookie notice"
      className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border px-4 py-3 shadow-echo-2"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 text-sm">
        <p className="text-muted-foreground">
          Echo uses essential cookies only for authentication. No tracking.
        </p>
        <Button variant="outline" size="sm" onClick={dismiss}>
          OK
        </Button>
      </div>
    </div>
  );
};

export default CookieBanner;
