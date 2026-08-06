import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoaderContextType {
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 9999 },
          ]}
          className="justify-center items-center"
        >
          <ActivityIndicator size="large" />
        </View>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
