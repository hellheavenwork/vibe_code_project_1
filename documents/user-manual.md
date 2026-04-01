# TaskFlow — User Manual

> Version 1.0 · Last updated 2026-03-31

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Navigating the App](#2-navigating-the-app)
3. [Dashboard](#3-dashboard)
4. [Projects](#4-projects)
5. [Task Board (Kanban & List View)](#5-task-board-kanban--list-view)
6. [Task Detail Panel](#6-task-detail-panel)
7. [My Tasks](#7-my-tasks)
8. [User Management](#8-user-management)
9. [Settings](#9-settings)
10. [Dark Mode](#10-dark-mode)
11. [Tips & Shortcuts](#11-tips--shortcuts)

---

## 1. Getting Started

### Creating an Account

1. Go to the app home page and click **Create a new account**
2. Fill in your **Full Name**, **Username**, **Email** (optional), and **Password**
3. Password must be at least 6 characters — a strength indicator will guide you
4. Click **Create Account** — you will be logged in automatically

### Logging In

1. Go to `/login`
2. Enter your **Username** and **Password**
3. Click **Sign in**

> **Demo credentials:** Username: `admin` | Password: `admin123`

### Logging Out

Click **Settings** in the sidebar → your session data is cleared and you are redirected to the login page.

---

## 2. Navigating the App

The sidebar on the left is your main navigation. It contains:

| Item | Description |
|---|---|
| **Dashboard** | Overview of all your projects and tasks |
| **My Tasks** | All tasks assigned specifically to you |
| **Users** | Manage team members and their roles |
| **Projects** | Listed below the nav items — click any to open its board |
| **Settings** | Your profile and account settings |
| **Landing Page** | Return to the public home page |
| **Dark Mode toggle** | Switch between light and dark themes |

### Collapsing the Sidebar

Click the **arrow button** (◀ / ▶) on the right edge of the sidebar to collapse it to icon-only mode. Click again to expand.

---

## 3. Dashboard

The dashboard gives you a real-time snapshot of your team's work.

### Stats Cards

Four cards at the top show:
- **Total Tasks** — all tasks across your projects
- **In Progress** — tasks currently in the "In Progress" column
- **Completed** — tasks moved to "Done"
- **High Priority** — tasks marked as High priority

### Upcoming Deadlines

Shows the next 4 tasks (sorted by due date) that are not yet completed.

- Click **View All** to go to the My Tasks page

### Recent Projects

Shows all your projects with member avatars.

- Click any project card to open its board
- Click the **+** button to create a new project directly from the dashboard

---

## 4. Projects

### Creating a Project

**From the Sidebar:**
1. Click the **+** icon next to the "Projects" label in the sidebar
2. Enter a project name
3. Click **Create Project**

**From the Dashboard:**
1. Click the **+** button in the "Recent Projects" section
2. Enter a project name
3. Click **Create Project**

A random color is assigned automatically.

### Renaming a Project

1. Hover over the project name in the sidebar
2. Click the **pencil icon** (✏️) that appears
3. Edit the name and click **Save Changes**

### Deleting a Project

1. Hover over the project name in the sidebar
2. Click the **trash icon** (🗑️) that appears
3. Confirm deletion — **this also deletes all tasks inside the project**

### Managing Project Members

1. Open a project board
2. Click the **+** button next to the member avatars in the top-right area
3. Add users by clicking the **+** next to their name
4. Remove members by clicking the **×** next to their name (you cannot remove yourself)
5. Click **Done** to save

---

## 5. Task Board (Kanban & List View)

### Switching Views

Use the **Kanban / List** toggle buttons at the top-right of the board.

### Kanban View

Tasks are displayed in columns representing workflow stages:

| Column | Meaning |
|---|---|
| **To Do** | Not started yet |
| **In Progress** | Actively being worked on |
| **In Review** | Waiting for review or approval |
| **Done** | Completed |

**Moving tasks:** Drag and drop a task card to any column. The position is saved automatically.

### List View

Tasks are displayed in a sortable table with columns for title, priority, assignee, due date, and column status.

### Adding a Task

1. Click the **+ Add Task** button
2. Enter a **Task Title**
3. Select an **Assignee** from the project members
4. Choose a **Color** for the task label
5. Click **Create Task** — the task detail panel opens immediately so you can add more details

### Searching Tasks

Type in the **Search tasks...** input to filter tasks by title. Results update after a short pause (debounced).

### Filtering Tasks

Click the **Filter** button to filter by:
- **Priority**: All / Low / Medium / High
- **Assignee**: Any specific team member

Click **Reset** to clear all filters, or **Done** to close the panel.

### Deleting a Task

- Hover over a task card and click the **trash icon**
- Or open the task detail panel and click **Delete Task**
- Confirm in the dialog that appears

---

## 6. Task Detail Panel

Click any task card to open the detail panel on the right side of the screen.

### What You Can Edit

| Field | How to Edit |
|---|---|
| **Title** | Click on the title text, edit inline, click **Save** |
| **Description** | Click the description area, type, click **Save** |
| **Priority** | Click **Low / Medium / High** buttons |
| **Assignee** | Select from the dropdown |
| **Due Date** | Click the date field and pick a date |
| **Color Label** | Click any color circle |
| **Column / Status** | Select from the status dropdown |

All changes are saved to the server immediately when you click **Save** for text fields, or instantly for button/dropdown selections.

### Images

1. Click **+ Add Image** (or the image upload area)
2. Select an image file from your computer
3. The image appears in the panel and is stored locally

> Note: Images are stored in your browser's local storage. Clearing browser data will remove them.

### Comments

1. Type your comment in the text box at the bottom of the panel
2. Click **Post** to save it
3. Comments appear in chronological order with author name and timestamp
4. Tasks with comments show a **blue comment badge** (💬) on the card

### Closing the Panel

Click the **✕** button at the top-right of the panel, or click anywhere outside it.

---

## 7. My Tasks

Shows all tasks assigned to **you** across all your projects.

### Tabs

| Tab | Tasks Shown |
|---|---|
| **All** | Every task assigned to you |
| **To Do** | Your tasks not yet started |
| **In Progress** | Your tasks currently in progress |
| **Done** | Your completed tasks |

Each task row shows the project name, priority badge, due date, and current status. Click a task to open its detail panel.

---

## 8. User Management

Access via **Users** in the sidebar. Requires admin role.

### Viewing Users

The table shows all registered users with their name, username, email, role, and join date.

### Adding a User

1. Click **+ Add User**
2. Fill in Full Name, Username, Email (optional), and Password
3. Select a Role: **Admin** or **Member**
4. Click **Create User**

### Editing a User

1. Click the **pencil icon** (✏️) next to any user
2. Update their name, email, or role
3. Click **Save Changes**

### Quick Role Toggle

Click the **Admin** or **Member** badge directly in the table to toggle a user's role instantly.

### Deleting a User

1. Click the **trash icon** (🗑️) next to a user
2. Confirm deletion

> You cannot delete your own account from this page.

---

## 9. Settings

Access via **Settings** in the sidebar.

Here you can update your:
- **Full Name**
- **Email address**
- **Password** (enter current password, then new password twice)

Click **Save Changes** to apply updates.

---

## 10. Dark Mode

Click the **Dark Mode / Light Mode** button at the bottom of the sidebar to toggle the theme.

Your preference is saved automatically and will be remembered the next time you open the app.

---

## 11. Tips & Shortcuts

| Tip | Detail |
|---|---|
| **Instant task creation** | After creating a task, the detail panel opens automatically so you can fill in description and details right away |
| **Comment notifications** | A blue 💬 badge on a card means it has comments — hover to see the count |
| **Drag to reorder** | You can drag tasks between any columns in Kanban view |
| **Color labels** | Use task colors to visually group related work (e.g. red = urgent, green = frontend) |
| **Collapse sidebar** | Use the ◀ arrow to get more board space on smaller screens |
| **Filter + Search together** | Search and filters work together — combine them to narrow results |
| **Project member limit** | You can add any registered user to any project; there is no member limit |

---

## Troubleshooting

**I can't log in.**
- Check your username (not email) and password are correct
- Use the demo credentials: `admin` / `admin123` to verify the app is running

**Tasks I create don't appear.**
- Make sure the backend server is running (`npm run dev:server` or `npm run dev:all`)
- Check the browser console for network errors

**Images I uploaded are gone.**
- Images are stored in browser local storage — they are lost if you clear your browser data or use a different browser/device

**The modal appears in the wrong place.**
- This should not happen in the current version. If it does, try refreshing the page

**Dark mode isn't working.**
- Try toggling it off and on again — the preference is saved to local storage under the key `theme`

---

*TaskFlow — Built with React 19, Express, Prisma, and SQLite*
