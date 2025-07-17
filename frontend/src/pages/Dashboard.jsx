import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Column from "../components/Column";
import TaskForm from "../components/TaskForm";
import LogPanel from "../components/LogPanel";
import ConflictModal from "../components/ConflictModal";
import { useSocket } from "../context/SocketContext";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./Dashboard.css";

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
        const res = await API.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
      }
    };
    fetchTasks();
  }, [token, logout]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/api/logs", {
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
      setLogs((prev) => [log, ...prev].slice(0, 20));
    };

    const handleUpdate = (updatedTask) => {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t._id === updatedTask._id);
        if (index !== -1) {
          const clone = [...prev];
          clone[index] = updatedTask;
          return clone;
        }
        return [...prev, updatedTask];
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
      assignedTo:
        task.assignedTo && typeof task.assignedTo === "object"
          ? task.assignedTo._id
          : task.assignedTo,
      status: newStatus ?? "Todo",
      priority: task.priority ?? "Low",
      updatedAt: new Date(task.updatedAt),
    };

    if (!payload.title || !payload.status || !payload.updatedAt) return;
    try {
      const res = await API.put(`/api/tasks/${task._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.warn("⚠️ Conflict detected. Launching conflict modal.");
        setConflict({
          localTask: payload,
          serverTask: err.response.data.serverData,
        });
      } else {
        console.error("Error updating task:", err);
      }
    }

    setActiveTask(null);
  };

  const handleAddTask = async (newTask) => {
    try {
      await API.post(
        "/api/tasks",
        { ...newTask, assignedTo: user.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await API.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setShowForm(false);
      toast.success("Task added!");
    } catch (err) {
      toast.error("Error creating task: " + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const res = await API.post(
        `/api/tasks/smart-assign/${taskId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert("Smart Assign failed: " + (err.response?.data?.error || err.message));
    }
  };

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 250,
          tolerance: 5,
        },
      })
    );
    
  return (
    <>
      <Navbar onLogout={logout} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Welcome, {user?.username}</h2>
          <div>
            <button className="add-btn" onClick={() => setShowForm(true)}>
              + Add Task
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >

          <div className="board">
            {Object.keys(grouped).map((status) => (
              <Column
                key={status}
                title={status}
                tasks={grouped[status]}
                onSmartAssign={handleSmartAssign}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <div className="drag-overlay">{activeTask.title}</div>}
          </DragOverlay>
        </DndContext>

        {showForm && (
          <TaskForm onSubmit={handleAddTask} onClose={() => setShowForm(false)} />
        )}

        <LogPanel logs={logs} />

       {conflict && (
        <ConflictModal
          localTask={conflict.localTask}
          serverTask={conflict.serverTask}
          onCancel={() => setConflict(null)}
          onResolve={(mergedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === mergedTask._id ? mergedTask : t))
            );
            setConflict(null);
          }}
        />
      )}

      </div>
    </>
  );
}
