import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function LogPanel() {
  const [logs, setLogs] = useState([]);
  const { token } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    axios.get("http://localhost:5000/api/logs", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setLogs(res.data));
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on("log-created", (newLog) => {
      setLogs((prev) => [newLog, ...prev]);
    });

    return () => socket.off("log-created");
  }, [socket]);

  return (
    <div>
      <h3>Activity Log</h3>
     <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <strong>{log.action}</strong> — Task: {log.taskId?.title || log.taskId?._id} — 
            User: {log.userId?.username || log.userId?._id}
          </li>
        ))}
      </ul>
    </div>
  );
}
