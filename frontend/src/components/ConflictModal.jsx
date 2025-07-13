import { useState } from "react";

/**
 * ConflictModal
 * Props:
 *  - localTask:   the task object in the client state (user's attempt)
 *  - serverTask:  most‑recent task from the server
 *  - onResolve(finalTask)  => void  (called with whichever task version / merged version user picks)
 *  - onCancel()           => void  (close modal without saving)
 */
export default function ConflictModal({ localTask, serverTask, onResolve, onCancel }) {
  const [merged, setMerged] = useState(() => ({
    title: localTask.title,
    description: localTask.description,
    status: serverTask.status,
    priority: localTask.priority,
    assignedTo: typeof localTask.assignedTo === "object" ? localTask.assignedTo._id : localTask.assignedTo,
    _id: localTask._id,
  }));

  const inputClass = "w-full p-2 border rounded-lg mb-2";
  const labelClass = "text-sm text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold">Conflict Detected</h3>
        <p className="text-sm text-gray-600">
          Another user updated this task meanwhile. Choose how to proceed:
        </p>

        {/* ----- Quick actions ----- */}
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl shadow bg-red-500 text-white hover:bg-red-600 transition"
            onClick={() => onResolve(localTask)}
          >
            Overwrite with <span className="font-bold">My version</span>
          </button>
          <button
            className="px-4 py-2 rounded-xl shadow bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={() => onResolve(serverTask)}
          >
            Keep <span className="font-bold">Server version</span>
          </button>
        </div>

        <hr className="my-4" />

        {/* ----- Merge form ----- */}
        <h4 className="font-medium mt-2">Or merge manually:</h4>
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={merged.title}
              onChange={(e) => setMerged({ ...merged, title: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              className={inputClass}
              value={merged.description}
              onChange={(e) => setMerged({ ...merged, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={merged.status}
                onChange={(e) => setMerged({ ...merged, status: e.target.value })}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Priority</label>
              <select
                className={inputClass}
                value={merged.priority}
                onChange={(e) => setMerged({ ...merged, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
            onClick={() => onResolve(merged)}
          >
            Save Merged
          </button>
        </div>
      </div>
    </div>
  );
}
