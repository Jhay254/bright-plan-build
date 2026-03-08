import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1100px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        professional: ['"DM Sans"', 'system-ui', 'sans-serif'],
        journal: ['Lora', 'Georgia', '"Times New Roman"', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Echo palette tokens
        forest: "hsl(var(--forest))",
        fern: "hsl(var(--fern))",
        sage: "hsl(var(--sage))",
        mist: "hsl(var(--mist))",
        dawn: "hsl(var(--dawn))",
        dusk: "hsl(var(--dusk))",
        sunlight: "hsl(var(--sunlight))",
        ember: "hsl(var(--ember))",
        shore: "hsl(var(--shore))",
        tide: "hsl(var(--tide))",
        parchment: "hsl(var(--parchment))",
        sand: "hsl(var(--sand))",
        stone: "hsl(var(--stone))",
        driftwood: "hsl(var(--driftwood))",
        bark: "hsl(var(--bark))",
        affirm: "hsl(var(--affirm))",
        "gentle-alert": "hsl(var(--gentle-alert))",
        "care-alert": "hsl(var(--care-alert))",
        urgent: "hsl(var(--urgent))",
      },
      spacing: {
        'echo-xs': '4px',
        'echo-sm': '8px',
        'echo-md': '16px',
        'echo-lg': '24px',
        'echo-xl': '32px',
        'echo-2xl': '48px',
        'echo-3xl': '64px',
        'echo-4xl': '96px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'echo-sm': '8px',
        'echo-md': '12px',
        'echo-lg': '16px',
        'echo-xl': '24px',
        'echo-pill': '9999px',
      },
      boxShadow: {
        'echo-1': 'var(--shadow-1)',
        'echo-2': 'var(--shadow-2)',
        'echo-3': 'var(--shadow-3)',
        'echo-4': 'var(--shadow-4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-rtl")],
} satisfies Config;
