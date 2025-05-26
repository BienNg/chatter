# Tasks Components

This directory contains all components related to the Tasks Tab functionality, implementing the unified threading system for task management.

## Component Architecture

### Main Components

- **`TaskTab.jsx`** - Main container component with two-panel layout
- **`TaskList.jsx`** - Left panel container for task list
- **`TaskDetails.jsx`** - Right panel container for task details

### Task List Components

- **`TaskCard.jsx`** - Individual task preview card
- **`TaskListEmpty.jsx`** - Empty state when no tasks exist

### Task Details Components

- **`TaskDetailsEmpty.jsx`** - Empty state when no task is selected
- **`TaskSourceMessage.jsx`** - Displays the original message that created the task
- **`TaskThread.jsx`** - Container for task conversation thread
- **`TaskReply.jsx`** - Individual reply in the task thread
- **`TaskComposer.jsx`** - Rich text editor for adding task comments

## Data Flow

```
TaskTab
├── TaskList
│   ├── TaskCard (for each task)
│   └── TaskListEmpty (when no tasks)
└── TaskDetails
    ├── TaskDetailsEmpty (when no task selected)
    ├── TaskSourceMessage
    ├── TaskThread
    │   └── TaskReply (for each reply)
    └── TaskComposer
```

## Key Features

### Unified Threading System
- Tasks use existing message reply threads as conversations
- Bidirectional synchronization between Messages and Tasks tabs
- Single source of truth for thread data

### Two-Panel Interface
- Left panel: List of messages converted to tasks
- Right panel: Selected task details and conversation

### Rich Interaction
- Task selection with visual feedback
- Real-time updates and notifications
- Rich text editing for task comments
- "Jump to message" navigation

## Future Enhancements

- [ ] Real Firestore integration via `useTasks` hook
- [ ] Participant management interface
- [ ] Task status management (active, completed, archived)
- [ ] @mention integration for automatic participant addition
- [ ] Task search and filtering
- [ ] Task assignment and due dates
- [ ] Cross-tab notifications

## Integration Points

### Hooks
- `useTasks(channelId)` - Main data management hook (placeholder)
- Future: `useTaskParticipants`, `useTaskThread`

### Shared Components
- Reuses existing avatar and user display patterns
- Consistent with messaging interface styling
- Integrates with existing rich text editing system

### Navigation
- Integrated with main tab navigation in `MessagingInterface`
- Deep linking support for specific tasks
- Cross-tab state management 