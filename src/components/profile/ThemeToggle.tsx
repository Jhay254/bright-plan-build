import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
      <p className="text-xs text-driftwood uppercase tracking-wide mb-3">{t("profile.theme")}</p>
      <div className="flex gap-2">
        {THEMES.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-echo-pill text-sm font-medium border transition-all ${
              theme === value
                ? "border-forest bg-mist text-forest"
                : "border-stone text-driftwood hover:border-fern"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
