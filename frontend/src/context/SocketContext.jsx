import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      // If user logs out, disconnect socket
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const sock = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"], // ensure it's not using polling
      autoConnect: false,
    });

    console.log("🔐 Connecting socket with token:", token);

    sock.connect();

    sock.on("connect", () => {
      console.log("🟢 Socket connected:", sock.id);
    });

    sock.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    setSocket(sock);

    return () => {
      sock.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
