import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mama Path",
    short_name: "Mama Path",
    description: "Курсы, роддома и помощь для будущих родителей в Казахстане",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#d65d8d",
    lang: "ru",
  };
}
