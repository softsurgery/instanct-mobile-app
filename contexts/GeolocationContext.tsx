import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";

interface GeolocationContextProps {
  location: Location.LocationObject | null;
  nearbyUsers: NearbyUser[];
  loading: boolean;
}

export const GeolocationContext = React.createContext<GeolocationContextProps>({
  location: null,
  nearbyUsers: [],
  loading: true,
});

export const useGeolocationContext = () => React.useContext(GeolocationContext);
