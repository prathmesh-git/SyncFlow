import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Column from "../components/Column";
import TaskForm from "../components/TaskForm";
import LogPanel from "../components/LogPanel";
import { useSocket } from "../context/SocketContext";


import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const socket = useSocket();
  const [logs, setLogs] = useState([]);

  // Fetch tasks
 useEffect(() => {
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      if (err.response?.status === 401) logout();
    }
  };
  fetchTasks();
}, [token, logout]);

//fetchLogs

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

//socketlisteners

useEffect(() => {
  if (!socket) return;

  const handleNewLog = (log) => {
    console.log("📜 Received real-time log:", log);
    setLogs((prev) => [log, ...prev]);
  };

  const handleUpdate = (updatedTask) => {
    console.log("📥 Got real-time task:", updatedTask);
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
    console.log("🗑️ Got real-time delete:", deletedId);
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


  // Group tasks by status
  const grouped = {
    Todo: [],
    "In Progress": [],
    Done: [],
  };

  tasks.forEach((task) => {
    grouped[task.status].push(task);
  });

  // Drag events
  const handleDragStart = (event) => {
    const task = JSON.parse(JSON.stringify(tasks.find((t) => t._id === event.active.id)));

    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t._id === active.id);
    const newStatus = over.id;

    try {
        const res = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
            ...task,
            assignedTo:
            typeof task.assignedTo === "object"
                ? task.assignedTo._id
                : task.assignedTo,
            status: newStatus,
            updatedAt: task.updatedAt,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }

    setActiveTask(null);
  };

  // Handle new task submit
const handleAddTask = async (newTask) => {
  try {
    await axios.post(
      "http://localhost:5000/api/tasks",
      { ...newTask, assignedTo: user.userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const refreshed = await axios.get("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks(refreshed.data); 
    setShowForm(false);
  } catch (err) {
    alert("Error creating task: " + (err.response?.data?.error || err.message));
  }
};

// Smart Assign
  const handleSmartAssign = async (taskId) => {
    console.log("Calling Smart Assign for task:", taskId);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tasks/smart-assign/${taskId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data : task))
      );
      console.log("Smart assigned to:", res.data.assignedTo?.username || res.data.assignedTo);
    } catch (err) {
      alert("Smart Assign failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h2>Welcome, {user?.username}</h2>
        <div>
          <button onClick={() => setShowForm(true)} style={{ marginRight: "10px" }}>+ Add Task</button>
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
            <Column key={status} title={status} tasks={grouped[status]} onSmartAssign={handleSmartAssign} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div
              style={{
                padding: "10px",
                background: "#fff",
                border: "1px solid #999",
              }}
            >
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showForm && (
        <TaskForm onSubmit={handleAddTask} onClose={() => setShowForm(false)} />
      )}

      <LogPanel logs={logs} />
    </div>
  );
}
