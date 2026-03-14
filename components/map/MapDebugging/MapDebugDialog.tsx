import StableScrollView from "@/components/shared/StableScrollView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useMapStore } from "@/stores/useMapStore";
import { Cog } from "lucide-react-native";

interface MapDebugDialogProps {
  className?: string;
}

export const MapDebugDialog = ({ className }: MapDebugDialogProps) => {
  const mapStore = useMapStore();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon"} className={className}>
          <Icon as={Cog} size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-96 flex flex-col p-0 w-[90vw]">
        <StableScrollView className="flex-1 px-4">
          <Text className="text-xs">{JSON.stringify(mapStore, null, 2)}</Text>
        </StableScrollView>
      </DialogContent>
    </Dialog>
  );
};
