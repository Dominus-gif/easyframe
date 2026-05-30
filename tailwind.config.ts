import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./store/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111312",
        paper: "#f7f5ef",
        mist: "#e9e6dc",
        limewash: "#d9f99d",
        coral: "#ff6b57"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(20, 18, 14, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
