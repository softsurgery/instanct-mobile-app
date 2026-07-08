import React from "react";
import { Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ResponseMessageLinkDto } from "@/types";
import {
  normalizeMessageLinkUrl,
  resolveMessageLinks,
} from "@/lib/messageLinks";

type TextSegment =
  | { type: "text"; value: string; key: string }
  | { type: "link"; value: string; url: string; key: string };

type HighlightSegment = {
  value: string;
  highlighted: boolean;
  key: string;
};

interface MessageTextContentProps {
  content?: string | null;
  links?: ResponseMessageLinkDto[];
  highlightQuery?: string;
  className?: string;
  linkClassName?: string;
  highlightClassName?: string;
}

const splitByHighlight = (
  value: string,
  query: string,
  keyPrefix: string,
): HighlightSegment[] => {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = value.split(new RegExp(`(${escapedQuery})`, "gi"));

  return parts.map((part, index) => ({
    value: part,
    highlighted: part.toLowerCase() === query.toLowerCase(),
    key: `${keyPrefix}-${index}`,
  }));
};

const buildTextSegments = (
  content: string,
  links: ResponseMessageLinkDto[],
): TextSegment[] => {
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const link of links) {
    if (link.startOffset > cursor) {
      segments.push({
        type: "text",
        value: content.slice(cursor, link.startOffset),
        key: `text-${cursor}`,
      });
    }

    segments.push({
      type: "link",
      value: content.slice(link.startOffset, link.endOffset),
      url: link.url,
      key: `link-${link.startOffset}`,
    });

    cursor = link.endOffset;
  }

  if (cursor < content.length) {
    segments.push({
      type: "text",
      value: content.slice(cursor),
      key: `text-${cursor}`,
    });
  }

  return segments;
};

export const MessageTextContent = ({
  content,
  links,
  highlightQuery,
  className,
  linkClassName,
  highlightClassName,
}: MessageTextContentProps) => {
  const trimmedQuery = highlightQuery?.trim() ?? "";

  if (!content) {
    return null;
  }

  const resolvedLinks = resolveMessageLinks(content, links);
  const segments =
    resolvedLinks.length > 0
      ? buildTextSegments(content, resolvedLinks)
      : [{ type: "text" as const, value: content, key: "text-all" }];

  const handleOpenLink = async (url: string) => {
    const normalizedUrl = normalizeMessageLinkUrl(url);

    try {
      const canOpen = await Linking.canOpenURL(normalizedUrl);
      if (canOpen) {
        await Linking.openURL(normalizedUrl);
      }
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  return (
    <Text className={className}>
      {segments.flatMap((segment) => {
        if (segment.type === "link") {
          return (
            <Text
              key={segment.key}
              className={cn("underline", linkClassName)}
              onPress={() => handleOpenLink(segment.url)}
            >
              {segment.value}
            </Text>
          );
        }

        if (!trimmedQuery) {
          return (
            <Text key={segment.key} className={className}>
              {segment.value}
            </Text>
          );
        }

        return splitByHighlight(segment.value, trimmedQuery, segment.key).map(
          (part) => (
            <Text
              key={part.key}
              className={cn(
                className,
                part.highlighted && (highlightClassName ?? "bg-accent font-semibold"),
              )}
            >
              {part.value}
            </Text>
          ),
        );
      })}
    </Text>
  );
};
