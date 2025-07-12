import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, onSmartAssign }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    border: "1px solid gray",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#fff",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* 👇 Make only this title area draggable */}
      <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
        <strong>{task.title}</strong>
      </div>

      <p>{task.description}</p>
      <small>Priority: {task.priority}</small>
      <br />
      <small>Assigned: {task.assignedTo?.username || "Unassigned"}</small>
      <br />
      <button
        style={{
          backgroundColor: "lightblue",
          padding: "5px",
          marginTop: "4px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log("🧠 Button clicked!", task._id);
          onSmartAssign(task._id);
        }}
      >
        Smart Assign
      </button>
    </div>
  );
}
