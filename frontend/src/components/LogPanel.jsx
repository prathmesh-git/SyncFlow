import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./LogPanel.css";

export default function LogPanel() {
  const [logs, setLogs] = useState([]);
  const { token } = useAuth();
  const socket = useSocket();

useEffect(() => {
  API.get("/api/logs", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => setLogs(res.data))
    .catch((err) =>
      console.error("Failed to fetch logs:", err.response?.data || err.message)
    );
}, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleLog = (newLog) => {
      setLogs((prev) => {
        const updated = [newLog, ...prev];
        return updated.slice(0, 20);
      });
    };

    socket.on("log-created", handleLog);
    return () => socket.off("log-created", handleLog);
  }, [socket]);

  return (
    <div className="log-panel">
      <h3>Activity Log</h3>
      <ul className="log-list">
        {logs.length === 0 ? (
          <li className="log-item empty">No activity yet</li>
        ) : (
          logs.map((log) => (
            <li className="log-item" key={log._id}>
              <strong>{log.userId?.username || "Someone"}</strong> {log.action}{" "}
              <strong>{log.taskId?.title || "a task"}</strong>{" "}
              <span className="log-time">
                ({new Date(log.timestamp).toLocaleTimeString()})
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
