import { useState } from "react";

export default function TaskForm({ onSubmit, onClose }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", padding: "20px", borderRadius: "8px", width: "300px"
      }}>
        <h3>Add New Task</h3>
        <input name="title" placeholder="Title" required value={task.title} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={task.description} onChange={handleChange}></textarea>
        <select name="status" value={task.status} onChange={handleChange}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <select name="priority" value={task.priority} onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br /><br />
        <button type="submit">Add Task</button>
        <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>Cancel</button>
      </form>
    </div>
  );
}
