
## Project Name: **SyncFlow – Collaborative Task Manager**

---

## Smart Assign – How It Works

The **Smart Assign** feature is designed to balance the task load across all users. When the "Smart Assign" button is clicked on a task card, the backend automatically finds the user who has the **least number of active tasks** (tasks not marked as "Done") and assigns that task to them.

### Step-by-step:
1. The backend retrieves a list of all users.
2. For each user, it counts how many tasks are currently assigned to them that are not yet completed.
3. It then compares those counts and picks the user with the lowest number.
4. That user is automatically assigned to the task.
5. The assignment is logged in the activity panel, and other users are updated in real-time.

**Why this is useful:**  
It ensures that work is distributed fairly and prevents overloading one user while others are idle.

---

## Conflict Handling – Explained with Example

**Purpose:**  
Conflict handling prevents data loss when **two users try to update the same task at the same time**.

### How It Works:
1. When a user updates a task (like dragging it to another column), they send the task data **along with a timestamp** (`updatedAt`) to the server.
2. The server checks whether the version of the task in the database has been modified **since the user last fetched it**.
3. If the timestamps match, the update is allowed.
4. If they don’t match, it means **someone else already edited the task** — so a `409 Conflict` response is sent.
5. On the frontend, the user is shown a popup/modal saying:
   > "This task was updated by someone else. Do you want to overwrite or keep the server version?"
6. The user can:
   - **Overwrite**: Force their changes.
   - **Cancel**: Revert to the server version.

### Example:
- User A opens Task #1 and sees its title as "Write report".
- Meanwhile, User B changes the title to "Finish report" and saves it.
- User A then changes the status to "In Progress" and tries to save.
- Since the task was already changed by User B, the server rejects the update.
- User A is notified and can choose to merge or overwrite.

---

## Summary
- **Smart Assign** ensures fairness by assigning tasks to the least busy user automatically.
- **Conflict Handling** avoids accidental data loss by detecting concurrent edits and prompting the user to resolve them safely.