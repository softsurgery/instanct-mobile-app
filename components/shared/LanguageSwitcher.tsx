import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { useTranslation } from "react-i18next";
import Select from "./form-builder/components/Select";
import * as Localization from "expo-localization";

interface LanguageSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
    input?: string;
  };
  customTrigger?: React.ReactNode;
  showSystemOption?: boolean;
}

export const LanguageSwitcher = ({ classNames, customTrigger, showSystemOption = true }: LanguageSwitcherProps) => {
  const preferencePersistStore = usePreferencePersistStore();
  const { t, i18n } = useTranslation("common");

  const options = [
    { label: t("language.options.en"), value: "en" },
    { label: t("language.options.fr"), value: "fr" },
    // { label: t("language.options.ar"), value: "ar" },
  ];

  if (showSystemOption) {
    options.push({ label: t("language.options.system"), value: "system" });
  }

  return (
    <Select
      classNames={classNames}
      customTrigger={customTrigger}
      title={t("language.select.title")}
      description={t("language.select.description").toString()}
      placeholder={t("language.select.placeholder").toString()}
      value={preferencePersistStore.language}
      onSelect={(value) => {
        let lang = value;
        if (lang === "system") {
           lang = (Localization.getLocales()[0]?.languageCode as "en" | "fr" | "ar") || "en";
        }
        i18n.changeLanguage(lang);
        preferencePersistStore.setLanguage(value as "en" | "fr" | "ar" | "system");
      }}
      options={options}
    />
  );
};
