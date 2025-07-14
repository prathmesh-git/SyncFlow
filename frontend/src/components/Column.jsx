import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import "./Column.css";

export default function Column({ title, tasks, onSmartAssign, onDelete }) {
  const { setNodeRef } = useDroppable({ id: title });

  return (
    <div ref={setNodeRef} className="column">
      <h3 className="column-title">{title}</h3>
      <div className="column-tasks">
        {tasks.length === 0 ? (
          <div className="no-tasks">No tasks</div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onSmartAssign={onSmartAssign} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
