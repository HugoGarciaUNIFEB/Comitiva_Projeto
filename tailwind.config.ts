import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base do projeto Comitiva Fogo de Chão
        brand: {
          orange: "#D9531E", // Laranja Terracota
          brown: "#4A2E2B",  // Marrom Rústico
          yellow: "#F2A900", // Amarelo Quente
          cream: "#F9F6F0",  // Creme Claro
        },
        // Tokens exportados do Stitch / Material You
        primary: {
          DEFAULT: "#D9531E",
          container: "#CB4914",
          fixed: "#FFDBCF",
          "fixed-dim": "#FFB59C",
        },
        "on-primary": {
          DEFAULT: "#FFFFFF",
          container: "#FFFBFF",
          fixed: "#390C00",
          "fixed-variant": "#822700",
        },
        secondary: {
          DEFAULT: "#4A2E2B",
          container: "#FFD3CD",
          fixed: "#FFDAD6",
          "fixed-dim": "#E7BDB8",
        },
        "on-secondary": {
          DEFAULT: "#FFFFFF",
          container: "#7A5955",
          fixed: "#2D1513",
          "fixed-variant": "#5D3F3C",
        },
        tertiary: {
          DEFAULT: "#F2A900",
          container: "#9C6B00",
          fixed: "#FFDEAD",
          "fixed-dim": "#FFBA3B",
        },
        "on-tertiary": {
          DEFAULT: "#FFFFFF",
          container: "#FFFBFF",
          fixed: "#281900",
          "fixed-variant": "#604100",
        },
        background: "#F9F6F0",
        surface: {
          DEFAULT: "#FCF9F3",
          dim: "#DCDAD4",
          bright: "#FCF9F3",
          variant: "#E5E2DC",
          "container-lowest": "#FFFFFF",
          "container-low": "#F6F3ED",
          container: "#F0EEE8",
          "container-high": "#EBE8E2",
          "container-highest": "#E5E2DC",
        },
        "on-surface": {
          DEFAULT: "#1C1C18",
          variant: "#594139",
        },
        "on-background": "#1C1C18",
        outline: {
          DEFAULT: "#8D7168",
          variant: "#E1BFB5",
        },
        "surface-tint": "#AB3600",
        "inverse-surface": "#31312D",
        "inverse-on-surface": "#F3F0EA",
        "inverse-primary": "#FFB59C",
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
        },
        "on-error": {
          DEFAULT: "#FFFFFF",
          container: "#93000A",
        },
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        gutter: "1rem",
        "gutter-md": "1.5rem",
        "gutter-lg": "2rem",
        margin: "1rem",
        "margin-md": "1.5rem",
        "margin-lg": "2.5rem",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        serif: ["Vollkorn", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        display: ["Vollkorn", "Georgia", "serif"],
        "display-mobile": ["Vollkorn", "Georgia", "serif"],
        "headline-lg": ["Vollkorn", "Georgia", "serif"],
        "headline-lg-mobile": ["Vollkorn", "Georgia", "serif"],
        "headline-md": ["Vollkorn", "Georgia", "serif"],
        "headline-sm": ["Vollkorn", "Georgia", "serif"],
        "title-md": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "label-lg": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "display-mobile": ["34px", { lineHeight: "42px", fontWeight: "700" }],
        "headline-lg": ["36px", { lineHeight: "44px", fontWeight: "700" }],
        "headline-lg-mobile": ["26px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "title-md": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", fontWeight: "700" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "label-sm": ["10px", { lineHeight: "14px", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;
