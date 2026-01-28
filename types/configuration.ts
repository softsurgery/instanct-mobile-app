export interface ResponseConfigurationParamDto {
  id: string;
  name?: string;
  description?: string;
  namespace: ResponseConfigurationNamespaceDto;
  namespaceId: string;
  variant: ParamVariant;
  value?: string;
  options?: { label: string; value: string }[];
}

export interface ResponseConfigurationNamespaceDto {
  id: string;
  description?: string;
  params?: ResponseConfigurationParamDto[];
}

export enum ParamVariant {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
}

export enum MapConfigurationParam {
  REFRESH_UNIT = "refresh.unit",
  REFRESH_VALUE = "refresh.value",
  RECONNECTION_DELAY_UNIT = "reconnection.delay.unit",
  RECONNECTION_DELAY_VALUE = "reconnection.delay.value",
  RECONNECTION_MAX_ATTEMPTS = "reconnection.maxAttempts",
  LAST_UPDATE_UNIT = "lastUpdate.unit",
  LAST_UPDATE_VALUE = "lastUpdate.value",
  RANGE_UNIT = "range.unit",
  RANGE_MAX = "range.max",
  RANGE_MIN = "range.min",
}
