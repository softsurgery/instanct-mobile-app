import { ConversationMediaDetails } from "@/components/chat/details/ConversationMediaDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id } = useLocalSearchParams();

  return <ConversationMediaDetails id={id as string} />;
}
