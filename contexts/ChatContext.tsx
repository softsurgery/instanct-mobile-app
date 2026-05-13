import React from "react";

interface ChatContextProps {
  count: number;
  resetCount: () => void;
}

export const ChatContext = React.createContext<ChatContextProps>({
  count: 0,
  resetCount: () => {},
});

export const useChatContext = () => React.useContext(ChatContext);
