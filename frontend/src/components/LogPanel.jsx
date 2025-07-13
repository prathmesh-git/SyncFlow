import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LogPanel() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, [token]);

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>📜 Recent Activity Logs</h3>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <strong>{log.userId?.username || "System"}</strong> {log.action}{" "}
            task <strong>{log.taskId?.title || "[Deleted Task]"}</strong>{" "}
            at {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
