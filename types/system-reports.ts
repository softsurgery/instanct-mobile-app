export interface CreateDeviceDto {
  model: string;
  platform: string;
  version: string;
  manufacturer: string;
}

export enum BugVariant {
  CRASH = "Crash",
  UI_ISSUE = "UI Issue",
  PERFORMANCE_ISSUE = "Performance Issue",
  FEATURE_NOT_WORKING = "Feature Not Working",
  OTHER = "Other",
}

export interface CreateBugDto {
  variant?: BugVariant;
  title: string;
  description: string;
  device: CreateDeviceDto;
}

export enum FeedbackCategory {
  GENERAL_FEEDBACK = "General Feedback",
  FEATURE_REQUEST = "Feature Request",
  OTHER = "Other",
}

export interface CreateFeedbackDto {
  category?: FeedbackCategory;
  message: string;
  rating: number;
  device: CreateDeviceDto;
}
