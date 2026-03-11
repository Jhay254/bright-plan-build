import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

// Only English is bundled eagerly; other locales are lazy-loaded on demand
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const localeLoaders: Record<string, () => Promise<{ default: any }>> = {
  fr: () => import("./locales/fr.json"),
  sw: () => import("./locales/sw.json"),
  ar: () => import("./locales/ar.json"),
  pt: () => import("./locales/pt.json"),
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Lazy-load a locale bundle when the language changes
i18n.on("languageChanged", async (lng) => {
  if (lng === "en" || i18n.hasResourceBundle(lng, "translation")) return;
  const loader = localeLoaders[lng];
  if (loader) {
    const mod = await loader();
    i18n.addResourceBundle(lng, "translation", mod.default, true, true);
  }
});

export default i18n;
