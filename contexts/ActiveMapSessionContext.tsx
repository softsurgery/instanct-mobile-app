import { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import React from "react";

interface ActiveMapSessionContextProps {
  activeSession?: ResponseSessionDto<MapSessionPayload>;
  initialized?: boolean;
}

export const ActiveMapSessionContext =
  React.createContext<ActiveMapSessionContextProps>({
    activeSession: undefined,
    initialized: false,
  });

export const useActiveMapSessionContext = () =>
  React.useContext(ActiveMapSessionContext);
