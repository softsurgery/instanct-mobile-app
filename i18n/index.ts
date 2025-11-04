import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arCommon from "./locales/ar/common.json";
import enCommon from "./locales/en/common.json";
import frCommon from "./locales/fr/common.json";

const resources = {
  en: {
    common: enCommon,
  },
  fr: {
    common: frCommon,
  },
  ar: {
    common: arCommon,
  },
};

const locales = Localization.getLocales();
const languageCode = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: languageCode,
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
