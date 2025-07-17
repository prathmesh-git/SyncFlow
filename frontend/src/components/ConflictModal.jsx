import { useState } from "react";
import "./ConflictModal.css";

export default function ConflictModal({ localTask, serverTask, onResolve, onCancel }) {
  const [merged, setMerged] = useState(() => ({
    title: localTask.title,
    description: localTask.description,
    status: serverTask.status,
    priority: localTask.priority,
    assignedTo: typeof localTask.assignedTo === "object" ? localTask.assignedTo._id : localTask.assignedTo,
    _id: localTask._id,
    updatedAt: localTask.updatedAt,
  }));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚠️ Conflict Detected</h3>
        <p>This task was modified elsewhere. Choose how you'd like to proceed:</p>

        <div className="conflict-buttons">
          <button className="btn-danger" onClick={() => onResolve(localTask)}>
            Overwrite with <strong>My version</strong>
          </button>
          <button className="btn-primary" onClick={() => onResolve(serverTask)}>
            Keep <strong>Server version</strong>
          </button>
        </div>

        <hr />

        <h4>Or merge manually:</h4>
        <div className="form-group">
          <label>Title</label>
          <input
            value={merged.title}
            onChange={(e) => setMerged({ ...merged, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            value={merged.description}
            onChange={(e) => setMerged({ ...merged, description: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={merged.status}
              onChange={(e) => setMerged({ ...merged, status: e.target.value })}
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={merged.priority}
              onChange={(e) => setMerged({ ...merged, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-success" onClick={() => onResolve(merged)}>Save Merged</button>
        </div>
      </div>
    </div>
  );
}
