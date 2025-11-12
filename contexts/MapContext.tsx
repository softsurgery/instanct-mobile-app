import React from "react";

interface MapContextProps {
  restartSocket: () => void;
}

export const MapContext = React.createContext<MapContextProps>({
  restartSocket: () => {},
});

export const useMapContext = () => React.useContext(MapContext);
