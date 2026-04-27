import type { MetadataRoute } from "next";

// PNG icons (192/512/maskable/apple-touch) should be rasterized from
// public/icons/icon.svg before public launch. Until then we ship the SVG only —
// Chrome/Edge/Safari install correctly handle image/svg+xml.
// TODO before launch: rasterize public/icons/icon.svg to:
//   - public/icons/icon-192.png        (192x192, purpose: any)
//   - public/icons/icon-512.png        (512x512, purpose: any)
//   - public/icons/icon-maskable-512.png (512x512, purpose: maskable)
//   - public/icons/apple-touch-icon.png (180x180)
// Once present, add their entries here and to the layout's metadata.icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Onyx Coach",
    short_name: "Onyx",
    description:
      "The console for elite personal trainers — programming, payments, form checks, nutrition, and recovery in one workspace.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e1016",
    theme_color: "#0e1016",
    categories: ["productivity", "health", "fitness"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
