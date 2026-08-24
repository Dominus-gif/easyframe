// Curated trending fonts for text layers. Google fonts are loaded on demand in the editor.

export type FontDef = { label: string; family: string; weights: string; single?: boolean };

export const TRENDING_FONTS: FontDef[] = [
  { label: "Inter", family: "Inter", weights: "wght@400;500;600;700;800;900" },
  { label: "Poppins", family: "Poppins", weights: "wght@400;500;600;700;800" },
  { label: "Montserrat", family: "Montserrat", weights: "wght@400;600;700;800" },
  { label: "Roboto", family: "Roboto", weights: "wght@400;500;700;900" },
  { label: "DM Sans", family: "DM Sans", weights: "wght@400;500;700" },
  { label: "Space Grotesk", family: "Space Grotesk", weights: "wght@400;500;600;700" },
  { label: "Playfair Display", family: "Playfair Display", weights: "wght@400;600;700;800;900" },
  { label: "Oswald", family: "Oswald", weights: "wght@400;500;600;700" },
  { label: "Bebas Neue", family: "Bebas Neue", weights: "", single: true },
  { label: "Anton", family: "Anton", weights: "", single: true },
  { label: "Archivo Black", family: "Archivo Black", weights: "", single: true },
  { label: "Lobster", family: "Lobster", weights: "", single: true },
  { label: "Pacifico", family: "Pacifico", weights: "", single: true },
  { label: "Caveat", family: "Caveat", weights: "wght@400;600;700" }
];

/** A single Google Fonts stylesheet URL requesting every trending family + weight. */
export function googleFontsHref(): string {
  const families = TRENDING_FONTS.filter((f) => f.family !== "Inter") // Inter ships locally
    .map((f) => {
      const name = f.family.replace(/ /g, "+");
      return f.weights ? `family=${name}:${f.weights}` : `family=${name}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Weights available for a family (for the weight picker). */
export function weightsFor(family: string): number[] {
  const def = TRENDING_FONTS.find((f) => f.family === family);
  if (!def || def.single) return [400];
  return [400, 500, 600, 700, 800].filter((w) => def.weights.includes(String(w)));
}
