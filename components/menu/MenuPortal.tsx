import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface MenuPortalProps {
  className?: string;
}

export const MenuPortal = ({ className }: MenuPortalProps) => {
  return (
    <StableSafeAreaView className={cn("px-2", className)}>
      <ApplicationHeader title="Menu" />
    </StableSafeAreaView>
  );
};
