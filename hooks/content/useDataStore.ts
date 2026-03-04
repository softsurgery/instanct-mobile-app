import { useQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "@/api";

interface useDataStoreProps {
  id: string;
  enabled?: boolean;
}

export function useDataStore<T>({ id, enabled }: useDataStoreProps) {
  const {
    data: dataStoreResp,
    isPending: isDataStorePending,
    refetch: refetchDataStore,
  } = useQuery({
    queryKey: ["data-store", id],
    queryFn: () => api.store.findById(id),
    enabled: !!id && enabled,
  });

  const dataStore = React.useMemo(
    () => dataStoreResp?.value as T,
    [dataStoreResp],
  );

  return { dataStore, isDataStorePending, refetchDataStore };
}
