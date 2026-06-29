import { delay } from "@/lib/time";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";

const GLOBAL_DELAY = process.env.EXPO_PUBLIC_GLOBAL_DELAY
  ? parseInt(process.env.EXPO_PUBLIC_GLOBAL_DELAY)
  : 0;

type SocketNamespace = "geolocation" | "chat" | "notifications" | string;

const sockets: Record<SocketNamespace, Socket> = {};
const socketTokens: Record<SocketNamespace, string | undefined> = {};

interface SocketConfig extends Partial<ManagerOptions & SocketOptions> {
  token?: string;
}

function applyGlobalDelay(socket: Socket): void {
  if (GLOBAL_DELAY === 0) return;

  const originalEmit = socket.emit.bind(socket);
  socket.emit = ((...args: Parameters<Socket["emit"]>) => {
    void delay(GLOBAL_DELAY).then(() => {
      originalEmit(...args);
    });
    return socket;
  }) as Socket["emit"];
}

export function getSocket(
  namespace: SocketNamespace,
  config: SocketConfig = {},
  apiUrl: string = process.env.EXPO_PUBLIC_API_SOCKET_URL || "",
): Socket {
  if (sockets[namespace]) {
    if (socketTokens[namespace] !== config.token) {
      sockets[namespace].disconnect();
      delete sockets[namespace];
    } else {
      return sockets[namespace];
    }
  }

  const { token, ...options } = config;

  const socket = io(`${apiUrl}/${namespace}`, {
    transports: ["websocket"],
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    ...options,
    ...(GLOBAL_DELAY > 0 ? { autoConnect: false } : {}),
  });

  applyGlobalDelay(socket);

  if (GLOBAL_DELAY > 0) {
    void delay(GLOBAL_DELAY).then(() => socket.connect());
  }

  socketTokens[namespace] = token;
  sockets[namespace] = socket;
  return socket;
}

export function disconnectSocket(namespace: SocketNamespace) {
  const socket = sockets[namespace];
  if (socket) {
    socket.disconnect();
    delete sockets[namespace];
    delete socketTokens[namespace];
  }
}

export function disconnectAllSockets() {
  Object.keys(sockets).forEach((key) => {
    sockets[key]?.disconnect();
    delete sockets[key];
    delete socketTokens[key];
  });
}
