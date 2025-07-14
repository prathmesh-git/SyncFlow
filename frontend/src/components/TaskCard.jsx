import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, onSmartAssign, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    border: "1px solid gray",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...listeners} {...attributes} style={{ cursor: "grab", fontWeight: "bold" }}>
        {task.title}
      </div>

      <p>{task.description}</p>
      <small>Priority: {task.priority}</small><br />
      <small>Assigned: {task.assignedTo?.username || "Unassigned"}</small><br />

      <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSmartAssign(task._id);
          }}
          style={{
            backgroundColor: "#d0ebff",
            border: "none",
            padding: "4px 8px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Smart Assign
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(task._id);
          }}
          style={{
            backgroundColor: "#ffe0e0",
            border: "none",
            padding: "4px 8px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
