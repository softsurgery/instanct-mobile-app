import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface LikePortalProps {
  className?: string;
}

export const LikePortal = ({ className }: LikePortalProps) => {
  return (
    <StableSafeAreaView className={cn("px-2", className)}>
      <ApplicationHeader title="Like" />
    </StableSafeAreaView>
  );
};
