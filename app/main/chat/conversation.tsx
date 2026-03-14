import { Conversation } from "@/components/chat/Conversation";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <Conversation id={Number(id)} />;
}
