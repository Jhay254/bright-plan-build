import { Shield, X } from "lucide-react";
import { EMERGENCY_RESOURCES } from "@/lib/safety";
import { useState } from "react";

const CrisisBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-dawn border-2 border-ember rounded-echo-md p-4 mx-4 mt-2 animate-fade-in-up relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-driftwood hover:text-bark"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-ember" />
        <p className="font-heading font-semibold text-bark text-sm">
          It sounds like you may be going through something serious
        </p>
      </div>
      <p className="text-xs text-driftwood mb-3">
        Your safety matters most. If you're in immediate danger, please reach out to a crisis service:
      </p>
      <div className="space-y-1.5">
        {EMERGENCY_RESOURCES.map((r) => (
          <div key={r.contact} className="text-xs">
            <span className="text-driftwood">{r.region}</span>{" "}
            <span className="font-medium text-bark">{r.name}:</span>{" "}
            <span className="text-forest font-semibold">{r.contact}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrisisBanner;
