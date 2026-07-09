import { ConversationReportPortal } from "@/components/chat/details/report/ConversationReportPortal";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id, reportedUserName } = useLocalSearchParams();

  return (
    <ConversationReportPortal
      conversationId={Number(id)}
      reportedUserName={reportedUserName as string | undefined}
    />
  );
}
