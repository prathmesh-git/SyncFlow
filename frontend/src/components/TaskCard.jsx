import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    border: "1px solid gray",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#fff",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <strong>{task.title}</strong>
      <p>{task.description}</p>
      <small>Priority: {task.priority}</small><br />
      <small>Assigned: {task.assignedTo?.username || "Unassigned"}</small>
    </div>
  );
}
