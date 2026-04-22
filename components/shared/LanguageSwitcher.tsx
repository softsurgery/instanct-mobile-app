import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { useTranslation } from "react-i18next";
import Select from "./form-builder/Select";

interface LanguageSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
}

export const LanguageSwitcher = ({ classNames }: LanguageSwitcherProps) => {
  const preferencePersistStore = usePreferencePersistStore();
  const { t, i18n } = useTranslation("common");
  return (
    <Select
      classNames={classNames}
      title={t("language.select.title")}
      description={t("language.select.description").toString()}
      placeholder={t("language.select.placeholder").toString()}
      value={preferencePersistStore.language}
      onSelect={(value) => {
        i18n.changeLanguage(value);
        preferencePersistStore.setLanguage(value as "en" | "fr" | "ar");
      }}
      options={[
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "Arabic", value: "ar" },
      ]}
    />
  );
};
