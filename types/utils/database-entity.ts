export interface DatabaseEntity {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeletionRestricted: boolean;
}

export interface Store extends DatabaseEntity {
  id: string;
  description: string;
  value: any;
}

export enum StoreIDs {
  CORE = "core",
  FAQS = "faqs",
}
