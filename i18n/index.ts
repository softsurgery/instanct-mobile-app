import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import arCommon from "./locales/ar/common.json";
import enCommon from "./locales/en/common.json";
import frCommon from "./locales/fr/common.json";

// import arNotifications from "./locales/ar/notifications.json";
import enNotifications from "./locales/en/notifications.json";
import frNotifications from "./locales/fr/notifications.json";

import enSettions from "./locales/en/settings.json";
import frSettions from "./locales/fr/settings.json";

import enExplore from "./locales/en/explore.json";
import frExplore from "./locales/fr/explore.json";

const resources = {
  en: {
    common: enCommon,
    notifications: enNotifications,
    settings: enSettions,
    explore: enExplore,
  },
  fr: {
    common: frCommon,
    notifications: frNotifications,
    settings: frSettions,
    explore: frExplore,
  },
  // ar: {
  //   common: arCommon,
  //   notifications: arNotifications,
  // },
};

const locales = Localization.getLocales();
const languageCode = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: languageCode,
  fallbackLng: "en",
  ns: ["common", "notifications", "settings", "explore"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
