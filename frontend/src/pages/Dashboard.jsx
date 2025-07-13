import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Column from "../components/Column";
import TaskForm from "../components/TaskForm";
import LogPanel from "../components/LogPanel";
import ConflictModal from "../components/ConflictModal"; // ⬅️ NEW
import { useSocket } from "../context/SocketContext";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const socket = useSocket();

  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, [token, logout]);

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

  useEffect(() => {
    if (!socket) return;

    const handleNewLog = (log) => {
      setLogs((prev) => {
        const updated = [log, ...prev];
        return updated.slice(0, 20);
      });
    };

    const handleUpdate = (updatedTask) => {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t._id === updatedTask._id);
        if (index !== -1) {
          const clone = [...prev];
          clone[index] = updatedTask;
          return clone;
        } else {
          return [...prev, updatedTask];
        }
      });
    };

    const handleDelete = (deletedId) => {
      setTasks((prev) => prev.filter((t) => t._id !== deletedId));
    };

    socket.on("log-created", handleNewLog);
    socket.on("task-updated", handleUpdate);
    socket.on("task-deleted", handleDelete);

    return () => {
      socket.off("log-created", handleNewLog);
      socket.off("task-updated", handleUpdate);
      socket.off("task-deleted", handleDelete);
    };
  }, [socket]);

  const grouped = {
    Todo: [],
    "In Progress": [],
    Done: [],
  };
  tasks.forEach((task) => grouped[task.status].push(task));

  const handleDragStart = (event) => {
    const task = JSON.parse(
      JSON.stringify(tasks.find((t) => t._id === event.active.id))
    );
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t._id === active.id);
    const newStatus = over.id;

const payload = {
  title: task.title ?? "",
  description: task.description ?? "",
  assignedTo: task.assignedTo && typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo,
  status: newStatus ?? "Todo",
  priority: task.priority ?? "Low",
  updatedAt: new Date(task.updatedAt), // ensure it's a Date object
};

if (!payload.title || !payload.status || !payload.updatedAt) {
  console.warn("⛔ Missing required fields", payload);
  return;
}

try {
  console.log("🧪 Drag update payload:", {
  title: task.title,
  description: task.description,
  assignedTo: typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo,
  status: newStatus,
  priority: task.priority,
  updatedAt: task.updatedAt,
});
  const res = await axios.put(
    `http://localhost:5000/api/tasks/${task._id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
} catch (err) {
  console.error("❌ Error updating task:", err);
}

    setActiveTask(null);
  };

  const handleAddTask = async (newTask) => {
    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
        { ...newTask, assignedTo: user.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setShowForm(false);
    } catch (err) {
      alert("Error creating task: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tasks/smart-assign/${taskId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert("Smart Assign failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome, {user?.username}</h2>
        <div>
          <button onClick={() => setShowForm(true)} style={{ marginRight: "10px" }}>
            + Add Task
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {Object.keys(grouped).map((status) => (
            <Column
              key={status}
              title={status}
              tasks={grouped[status]}
              onSmartAssign={handleSmartAssign}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div
              style={{
                padding: "10px",
                background: "#fff",
                border: "1px solid #999",
              }}
            >
              {activeTask.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showForm && (
        <TaskForm onSubmit={handleAddTask} onClose={() => setShowForm(false)} />
      )}

      <LogPanel logs={logs} />

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onCancel={() => setConflict(null)}
          onResolved={(mergedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === mergedTask._id ? mergedTask : t))
            );
            setConflict(null);
          }}
        />
      )}
    </div>
  );
}
