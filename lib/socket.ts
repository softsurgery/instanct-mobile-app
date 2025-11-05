import { io, Socket } from "socket.io-client";

type SocketNamespace = "geolocation" | "chat" | "notifications" | string;

const sockets: Record<SocketNamespace, Socket> = {};

export function getSocket(
  namespace: SocketNamespace,
  apiUrl: string,
  token?: string
): Socket {
  if (sockets[namespace]) return sockets[namespace];

  const socket = io(`${apiUrl}/${namespace}`, {
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    transports: ["websocket"],
    reconnection: false,
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
