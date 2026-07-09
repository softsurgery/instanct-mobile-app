import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import { CreateConversationReportDto } from "~/types";

interface ConversationReportData {
  createDto: CreateConversationReportDto;
  errors: Record<string, string[]>;
}

export interface ConversationReportStore extends ConversationReportData {
  set: <K extends keyof ConversationReportData>(
    name: K,
    value: ConversationReportData[K],
  ) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: ConversationReportData = {
  createDto: {
    reason: undefined,
    description: "",
  },
  errors: {},
};

export const useConversationReportStore = create<ConversationReportStore>(
  (set) => ({
    ...initialState,
    set: (name, value) => {
      set((state) => ({
        ...state,
        [name]: value,
      }));
    },
    setNested: (path, value) => {
      const [rootKey, ...restPath] = path.split(".");
      const nestedPath = restPath.join(".");
      set((state) => {
        const updatedRoot = setDeepValue(
          { ...state[rootKey as keyof ConversationReportData] },
          nestedPath,
          value,
        );
        return {
          ...state,
          [rootKey]: updatedRoot,
        };
      });
    },
    reset: () => {
      set({ ...initialState });
    },
  }),
);
