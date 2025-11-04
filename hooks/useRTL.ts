import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { useEffect, useState } from "react";
import { I18nManager } from "react-native";

export const useRTL = () => {
  const language = usePreferencePersistStore((state) => state.language);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const shouldBeRTL = language === "ar";

    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(shouldBeRTL);
    }

    setIsRTL(shouldBeRTL);
  }, [language]);

  return isRTL;
};
