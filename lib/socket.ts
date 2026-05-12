import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

type SocketNamespace = "geolocation" | "chat" | "notifications" | string;

const sockets: Record<SocketNamespace, Socket> = {};

interface SocketConfig extends Partial<ManagerOptions & SocketOptions> {
  token?: string;
}

export function getSocket(
  namespace: SocketNamespace,
  config: SocketConfig = {},
  apiUrl: string = process.env.EXPO_PUBLIC_API_SOCKET_URL || "",
): Socket {
  if (sockets[namespace]) return sockets[namespace];

  const { token, ...options } = config;

  const socket = io(`${apiUrl}/${namespace}`, {
    transports: ["websocket"],
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    ...options,
  });

  sockets[namespace] = socket;
  return socket;
}

export function disconnectSocket(namespace: SocketNamespace) {
  const socket = sockets[namespace];
  if (socket) {
    socket.disconnect();
    delete sockets[namespace];
  }
}

export function disconnectAllSockets() {
  Object.keys(sockets).forEach((key) => {
    sockets[key]?.disconnect();
    delete sockets[key];
  });
}
