import axios from "./axios";
import { UserDevice } from "@/types";

const getDevices = async (): Promise<UserDevice[]> => {
  const response = await axios.get<UserDevice[]>("/auth/devices");
  return response.data;
};

const trustDevice = async (id: string): Promise<UserDevice> => {
  const response = await axios.post<UserDevice>(`/auth/devices/${id}/trust`);
  return response.data;
};

const untrustDevice = async (id: string): Promise<UserDevice> => {
  const response = await axios.post<UserDevice>(`/auth/devices/${id}/untrust`);
  return response.data;
};

const revokeDevice = async (id: string): Promise<{ success: boolean }> => {
  const response = await axios.delete<{ success: boolean }>(`/auth/devices/${id}`);
  return response.data;
};

export const devices = {
  getDevices,
  trustDevice,
  untrustDevice,
  revokeDevice,
};
