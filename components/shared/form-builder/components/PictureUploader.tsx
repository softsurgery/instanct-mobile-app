import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import { Pressable } from "react-native";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../StableAvatar";

interface PictureUploaderProps {
  wrapperClassName?: string;
  className?: string;
  editable?: boolean;
  image?: string | File;
  fallback?: string;
  onFileChange?: (
    image: File | { uri: string; name: string; type: string },
  ) => void;
  onUpload?: (
    file: File | { uri: string; name: string; type: string },
    onProgress: (percent: number) => void,
  ) => void;
}

export const PictureUploader = ({
  wrapperClassName,
  className,
  editable = true,
  image,
  fallback = "?",
  onFileChange,
  onUpload,
}: PictureUploaderProps) => {
  const onPress = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      const fileLike = {
        uri: asset.uri,
        name: asset.uri.split("/").pop() || "photo.jpg",
        type: asset.type || "image/jpeg",
      };

      onFileChange?.(fileLike);
      if (onUpload) {
        onUpload(fileLike, (percent) => {
          console.log("Upload progress:", percent);
        });
      }
    }
  };

  const imageUri = typeof image === "string" ? image : (image as any)?.uri;

  return (
    <Pressable
      className={cn(wrapperClassName, !editable && "opacity-70")}
      disabled={!editable}
    >
      <Button
        variant="link"
        className={"h-fit w-fit p-0 rounded-full"}
        onPress={onPress}
      >
        <Avatar
          alt={fallback}
          className={cn("h-40 w-40 rounded-full", className)}
        >
          <AvatarImage source={{ uri: imageUri }} />
          <AvatarFallback>
            <Text>{fallback}</Text>
          </AvatarFallback>
        </Avatar>
      </Button>
    </Pressable>
  );
};
