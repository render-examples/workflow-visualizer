# Workflow Visualizer

A reusable React component for visualizing workflow pipelines. Built for Render demo projects with a dark brutalist design.

## Installation

Install directly from GitHub:

```bash
pnpm add github:render-examples/workflow-visualizer
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "workflow-visualizer": "github:render-examples/workflow-visualizer"
  }
}
```

## Requirements

- React 18+
- Framer Motion 11+
- Tailwind CSS (configured with dark theme colors)

## Quick Start

```tsx
"use client";

import { WorkflowVisualizer, WorkflowConfig } from "workflow-visualizer";

const myWorkflow: WorkflowConfig = {
  title: "My Workflow",
  subtitle: "How it works",
  nodes: [
    {
      id: "trigger",
      label: "Cron Job",
      type: "trigger",
      description: "Runs daily at midnight",
      position: { x: 100, y: 50 },
    },
    {
      id: "task1",
      label: "processData",
      type: "task",
      description: "Processes incoming data",
      position: { x: 100, y: 180 },
    },
  ],
  edges: [
    { id: "trigger-task1", from: "trigger", to: "task1", style: "solid" },
  ],
  defaultTrigger: "trigger",
  triggerFlows: [
    {
      triggerId: "trigger",
      nodes: ["trigger", "task1"],
      edges: ["trigger-task1"],
      animationSequence: [
        {
          id: "step1",
          activeNodes: ["trigger"],
          activeEdges: [],
          duration: 1500,
          title: "Cron Fires",
          description: "The scheduled job triggers at midnight.",
        },
        {
          id: "step2",
          activeNodes: ["trigger", "task1"],
          activeEdges: ["trigger-task1"],
          duration: 2000,
          title: "Processing",
          description: "Data is processed by the task.",
        },
      ],
    },
  ],
};

export default function WorkflowPage() {
  return <WorkflowVisualizer config={myWorkflow} />;
}
```

## Configuration Reference

### WorkflowConfig

The top-level configuration object:

```typescript
interface WorkflowConfig {
  title: string;           // Page/section title
  subtitle: string;        // Subtitle or description
  nodes: WorkflowNodeConfig[];
  edges: WorkflowEdgeConfig[];
  triggerFlows: TriggerFlow[];
  defaultTrigger: string;  // ID of trigger to show by default
}
```

### Node Configuration

Nodes represent tasks, triggers, and orchestrators in your workflow:

```typescript
type NodeType = "trigger" | "task" | "batch" | "orchestrator";

interface WorkflowNodeConfig {
  id: string;              // Unique identifier (referenced by edges)
  label: string;           // Display name shown on the node
  type: NodeType;          // Determines visual styling
  description: string;     // Shown in detail panel when clicked
  position: { x: number; y: number };  // Absolute canvas position
  details?: { label: string; value: string }[];  // Optional key-value pairs
}
```

#### Node Types

| Type | Purpose | Visual Style |
|------|---------|--------------|
| `trigger` | Entry points (cron, API, UI) | Purple theme, clickable to switch flows |
| `orchestrator` | Coordinates other tasks | Green theme |
| `batch` | Runs multiple parallel instances | Red theme, stacked card effect |
| `task` | Single unit of work | Gray theme |

### Edge Configuration

Edges connect nodes and show the flow direction:

```typescript
interface WorkflowEdgeConfig {
  id: string;              // Unique identifier
  from: string;            // Source node ID
  to: string;              // Target node ID
  label?: string;          // Optional label (e.g., "step 1", "spawns")
  style?: "solid" | "dashed";  // Line style (default: solid)
}
```

### Trigger Flows

Each trigger can display a different subset of nodes and edges with its own animation sequence:

```typescript
interface TriggerFlow {
  triggerId: string;       // Must match a trigger node's ID
  nodes: string[];         // Node IDs visible when this trigger is selected
  edges: string[];         // Edge IDs visible when this trigger is selected
  animationSequence: AnimationStep[];
}

interface AnimationStep {
  id: string;              // Unique step identifier
  activeNodes: string[];   // Nodes to highlight in this step
  activeEdges: string[];   // Edges to animate in this step
  duration: number;        // Milliseconds before auto-advancing
  title: string;           // Step title shown above visualization
  description: string;     // Step description
}
```

## Positioning Guide

Nodes use absolute pixel positioning on the canvas:

- **Triggers**: Top row, typically `y: 50`
- **Orchestrators**: Second row, typically `y: 180`
- **Tasks**: Third row, typically `y: 320`
- **Batch tasks**: Fourth row, typically `y: 460`

Horizontal spacing: ~200px between nodes for readability.

The canvas auto-sizes based on node positions (minimum 700x550).

### Example Layout

```
y: 50    [Cron Job]    [API Call]    [Manual UI]     <- triggers
              |
y: 180   [dailyJob]                                   <- orchestrator
          /   |   \
y: 320  [pingAll] [analyzeAll] [generateDigest]      <- tasks
           |          |
y: 460  [pingLLM]  [analyzeResponse]                 <- batch tasks
```

## Tailwind Configuration

The component uses these Tailwind colors. Ensure your Tailwind config includes them:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // These are the default dark theme colors used
        // No configuration needed if using standard Tailwind
      },
    },
  },
};
```

Key color values used:
- Background: `#0a0a0a`, `#111`, `#222`
- Borders: `#333`, `#444`
- Text: `#666`, `#888`, `#fff`
- Trigger: `#1a1a2e` / `#4a4a6a`
- Orchestrator: `#1a2e1a` / `#4a6a4a`
- Batch: `#2e1a1a` / `#6a4a4a`

## Features

- **Animated flow**: Watch data flow through your pipeline with animated edges
- **Interactive**: Click triggers to switch between different flows
- **Step-by-step**: Play/pause, step forward/backward through the animation
- **Detail panels**: Click any node to see its details
- **Auto-sizing canvas**: Adapts to your node layout
- **Dark brutalist design**: Sharp corners, monospace fonts, minimal color

## License

MIT
