import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { PhotoPreview } from "@/components/shared/PhotoPreview";
import { Image, ImageSource } from "expo-image";
import { Play } from "lucide-react-native";
import React from "react";
import { View, ViewStyle } from "react-native";
import { MediaUploadProgress } from "../staging/MediaUploadProgress";

interface MediaImageGridProps {
  uris?: string[];
  sources?: (ImageSource | undefined)[];
  totalCount: number;
  isVideo?: boolean;
  isUploading?: boolean;
  uploadFailed?: boolean;
  progress?: number;
  frameSize: number;
}

export const MediaImageGrid = ({
  uris,
  sources,
  totalCount,
  isVideo,
  isUploading,
  uploadFailed,
  progress,
  frameSize,
}: MediaImageGridProps) => {
  const cells = buildGridCells(totalCount, frameSize);

  const allSources = React.useMemo(() => {
    if (sources) {
      return sources.filter((source): source is ImageSource => !!source);
    }

    if (uris) {
      return uris.map((uri) => ({ uri }));
    }

    return [];
  }, [sources, uris]);

  const renderCellContent = (cellIndex: number) => {
    const uri = uris?.[cellIndex];
    const source = sources?.[cellIndex];

    if (source) {
      return (
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      );
    }

    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      );
    }

    return <View className="w-full h-full bg-muted" />;
  };

  return (
    <View
      className="relative overflow-hidden rounded-xl bg-muted"
      style={{ width: frameSize, height: frameSize }}
    >
      {cells.map(({ index, style, overflowCount }) => (
        <View key={index} className="absolute overflow-hidden" style={style}>
          <PhotoPreview
            sources={allSources}
            index={index}
            className="w-full h-full"
          >
            {renderCellContent(index)}
            {isVideo && index === 0 && !overflowCount && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50">
                  <Icon as={Play} size={14} color="white" fill="white" />
                </View>
              </View>
            )}
            {overflowCount !== undefined && (
              <View className="absolute inset-0 items-center justify-center bg-black/55">
                <Text className="text-2xl font-semibold text-white">
                  +{overflowCount}
                </Text>
              </View>
            )}
          </PhotoPreview>
        </View>
      ))}

      {(isUploading || uploadFailed) && (
        <MediaUploadProgress progress={progress ?? 0} failed={uploadFailed} />
      )}
    </View>
  );
};

const GRID_GAP = 2;

type GridCell = {
  index: number;
  style: ViewStyle;
  overflowCount?: number;
};

const buildGridCells = (count: number, size: number): GridCell[] => {
  const half = (size - GRID_GAP) / 2;

  if (count === 1) {
    return [{ index: 0, style: { width: size, height: size } }];
  }

  if (count === 2) {
    return [
      { index: 0, style: { width: half, height: size, left: 0, top: 0 } },
      {
        index: 1,
        style: { width: half, height: size, left: half + GRID_GAP, top: 0 },
      },
    ];
  }

  if (count === 3) {
    return [
      { index: 0, style: { width: half, height: half, left: 0, top: 0 } },
      {
        index: 1,
        style: { width: half, height: half, left: half + GRID_GAP, top: 0 },
      },
      {
        index: 2,
        style: { width: size, height: size, left: 0, top: half + GRID_GAP },
      },
    ];
  }

  const positions: ViewStyle[] = [
    { width: half, height: half, left: 0, top: 0 },
    { width: half, height: half, left: half + GRID_GAP, top: 0 },
    { width: half, height: half, left: 0, top: half + GRID_GAP },
    {
      width: half,
      height: half,
      left: half + GRID_GAP,
      top: half + GRID_GAP,
    },
  ];

  if (count > 4) {
    return positions.map((style, index) => ({
      index,
      style,
      overflowCount: index === 3 ? count - 3 : undefined,
    }));
  }

  return positions.slice(0, count).map((style, index) => ({
    index,
    style,
  }));
};
