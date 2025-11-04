import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface ChatPortalProps {
  className?: string;
}

export const ChatPortal = ({ className }: ChatPortalProps) => {
  return (
    <StableSafeAreaView className={cn("px-2", className)}>
      <ApplicationHeader title="Chat" />
    </StableSafeAreaView>
  );
};
