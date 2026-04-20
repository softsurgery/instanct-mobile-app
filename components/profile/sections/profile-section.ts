export interface ProfileSection<T = unknown> {
  key: string;
  title: string;
  data: T[];
  editable: boolean;
  userId?: string;
  renderItem: (item: any) => React.ReactNode;
}
