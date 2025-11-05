import React from "react";
import { cn } from "~/lib/utils";
import { Text, TextVariantDefaults } from "../ui/text";

interface HTMLTextProps {
  children: string;
  className?: string;
  variant?: TextVariantDefaults;
}

export const HTMLText = ({ children, className, variant }: HTMLTextProps) => {
  const parts = children.split(/(<strong>.*?<\/strong>)/g);

  return (
    <Text className={cn(className)}>
      {parts.map((part, index) => {
        if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
          const boldText = part.replace(/<\/?strong>/g, "");
          return (
            <Text
              key={index}
              variant={variant}
              className={cn(className, "font-bold")}
            >
              {boldText}
            </Text>
          );
        }
        return (
          <Text variant={variant} key={index}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};
