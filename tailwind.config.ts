import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  // Classes vindas de strings dinâmicas em src/lib/concursoTheme.ts —
  // safelistadas pra o JIT não purgar.
  safelist: [
    'bg-blue-700', 'hover:bg-blue-800', 'text-blue-700', 'hover:text-blue-700', 'hover:border-blue-500/40',
    'hover:shadow-[0_12px_32px_-12px_rgba(37,99,235,0.20)]',
    'bg-emerald-700', 'hover:bg-emerald-800', 'text-emerald-700', 'hover:text-emerald-700', 'hover:border-emerald-500/40',
    'hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.20)]',
    'bg-cyan-700', 'hover:bg-cyan-800', 'text-cyan-700', 'hover:text-cyan-700', 'hover:border-cyan-500/40',
    'hover:shadow-[0_12px_32px_-12px_rgba(8,145,178,0.20)]',
    'from-[#0F172A]', 'via-[#1E3A8A]', 'to-[#2563EB]',
    'from-[#052e2b]', 'via-[#065f46]', 'to-[#10b981]',
    'from-[#083344]', 'via-[#0e7490]', 'to-[#06b6d4]',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-display)', 'system-ui', 'sans-serif'],
        label: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
        tight: '-0.015em',
      },
      colors: {
        'brand-primary': 'rgb(var(--brand-primary) / <alpha-value>)',
        'brand-primary-dark': 'rgb(var(--brand-primary-dark) / <alpha-value>)',
        'brand-primary-darker': 'rgb(var(--brand-primary-darker) / <alpha-value>)',
        'brand-ink': 'rgb(var(--brand-ink) / <alpha-value>)',
        'brand-ink-2': 'rgb(var(--brand-ink-2) / <alpha-value>)',
        'brand-gold': 'rgb(var(--brand-gold) / <alpha-value>)',
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
        "concursos-blue": "#1D4ED8",
        "concursos-amber": "#F59E0B",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 3px)",
      },
      boxShadow: {
        // Apple-style ambient light shadows — barely there
        'subtle':    '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'elevated':  '0 4px 12px -2px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'modal':     '0 12px 24px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        'focus':     '0 0 0 3px hsl(var(--ring) / 0.15)',
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
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px hsl(var(--primary) / 0.18)" },
          "50%": { boxShadow: "0 0 24px hsl(var(--primary) / 0.30)" },
        },
        "wave": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "50%": { transform: "translateY(-5px)", opacity: "1" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-up-delay-1": "fade-up 0.45s 0.05s ease-out both",
        "fade-up-delay-2": "fade-up 0.45s 0.10s ease-out both",
        "fade-up-delay-3": "fade-up 0.45s 0.15s ease-out both",
        "fade-up-delay-4": "fade-up 0.45s 0.20s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-in-left": "slide-in-left 0.35s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
