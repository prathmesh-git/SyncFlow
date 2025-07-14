import { useState } from "react";
import { toast } from 'react-toastify';
import "./TaskForm.css";

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

 const handleSubmit = async (e) => {
  e.preventDefault();
  toast.dismiss();

  const invalidTitles = ["todo", "in progress", "done"];
  const trimmedTitle = task.title.trim().toLowerCase();

  if (!trimmedTitle) {
    toast.error("Title is required");
    return;
  }

  if (invalidTitles.includes(trimmedTitle)) {
    toast.error("Task title cannot be 'Todo', 'In Progress' or 'Done'");
    return;
  }

  try {
    await onSubmit(task); // must throw error if task creation fails
    console.log("Task added!");
  } catch (err) {
    console.error("Error creating task: " + (err.response?.data?.error || err.message));
  }
};

  return (
    <div className="taskform-backdrop">
      <form className="taskform-container" onSubmit={handleSubmit}>
        <h3>Add New Task</h3>

        <input
          name="title"
          placeholder="Title"
          required
          value={task.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={task.description}
          onChange={handleChange}
        />

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

        <div className="taskform-buttons">
          <button type="submit" className="submit-btn">Add Task</button>
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
