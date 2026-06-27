import { ConversationResourceDetails } from "@/components/chat/upload-details/ConversationsResourceDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id } = useLocalSearchParams();

  return <ConversationResourceDetails id={id as string} />;
}
