import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function Column({ title, tasks }) {
  const { setNodeRef } = useDroppable({ id: title });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: "10px",
        minHeight: "300px",
        backgroundColor: "#f2f2f2",
        border: "1px solid #ccc",
      }}
    >
      <h3>{title}</h3>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
}
