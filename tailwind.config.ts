import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: "#020708",
          900: "#040D0F",
          800: "#07171A",
          700: "#0B2226",
          600: "#103036",
        },
        teal: {
          950: "#031719",
          900: "#062A2E",
          850: "#09383E",
          800: "#0C474E",
          750: "#0F575F",
          700: "#126871",
          600: "#0D9488",
          500: "#14B8A6",
          400: "#2DD4BF",
          300: "#5EEAD4",
          200: "#99F6E4",
          100: "#CCFBF1",
          50: "#F0FDFA",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "teal-dark-gradient": "linear-gradient(135deg, #09383E 0%, #062A2E 40%, #020708 100%)",
        "teal-card-gradient": "linear-gradient(145deg, rgba(12, 71, 78, 0.45) 0%, rgba(4, 13, 15, 0.85) 100%)",
        "teal-glow-gradient": "linear-gradient(135deg, #2DD4BF 0%, #0D9488 50%, #062A2E 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(45, 212, 191, 0.08) 0%, rgba(9, 56, 62, 0.15) 100%)",
      },
      boxShadow: {
        "teal-glow": "0 0 25px -3px rgba(45, 212, 191, 0.25)",
        "teal-glow-lg": "0 0 40px -5px rgba(45, 212, 191, 0.4)",
        "teal-inner": "inset 0 1px 0 0 rgba(94, 234, 212, 0.2)",
        "card-glass": "0 8px 32px 0 rgba(2, 7, 8, 0.37)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
