import { createRoot } from "react-dom/client";
import type { WorkflowConfig } from "workflow-visualizer";
import { WorkflowVisualizer } from "workflow-visualizer";
import "./index.css";

// Sample workflow configuration demonstrating all node types
const sampleWorkflow: WorkflowConfig = {
  title: "Workflows Behind the Scenes",
  subtitle: "How Render Workflows power this application",

  nodes: [
    // Triggers
    {
      id: "cron",
      label: "Cron Job",
      type: "trigger",
      description: "Scheduled trigger that runs daily at midnight",
      position: { x: 100, y: 50 },
      details: [
        { label: "Schedule", value: "0 0 * * * (midnight)" },
        { label: "How", value: "Render Cron Job service" },
      ],
    },
    {
      id: "api",
      label: "API Call",
      type: "trigger",
      description: "External HTTP request to trigger tasks",
      position: { x: 300, y: 50 },
      details: [
        { label: "Endpoint", value: "POST /v1/task-runs" },
        { label: "Auth", value: "Render API key" },
      ],
    },
    {
      id: "ui",
      label: "Manual UI",
      type: "trigger",
      description: "Button clicks in the web dashboard",
      position: { x: 500, y: 50 },
      details: [
        { label: "Where", value: "Dashboard buttons" },
        { label: "How", value: "Calls API routes" },
      ],
    },

    // Orchestrator
    {
      id: "dailyJob",
      label: "dailyJob",
      type: "orchestrator",
      description: "Orchestrates the entire daily pipeline in sequence",
      position: { x: 100, y: 180 },
      details: [
        { label: "Role", value: "Coordinates tasks" },
        { label: "Execution", value: "Sequential steps" },
        { label: "Steps", value: "1. Ping → 2. Analyze → 3. Digest" },
      ],
    },

    // Coordinator tasks (spawn batches)
    {
      id: "pingAll",
      label: "pingAll",
      type: "task",
      description:
        "Coordinates pinging all active prompt/provider combinations",
      position: { x: 50, y: 320 },
      details: [
        { label: "Concurrency", value: "10 parallel tasks" },
        { label: "Deduplication", value: "Skips already pinged today" },
      ],
    },
    {
      id: "analyzeAll",
      label: "analyzeAll",
      type: "task",
      description: "Coordinates analyzing all unanalyzed responses",
      position: { x: 250, y: 320 },
      details: [
        { label: "Concurrency", value: "10 parallel tasks" },
        { label: "Input", value: "Unanalyzed responses" },
      ],
    },

    // Batched tasks (run as multiple parallel instances)
    {
      id: "pingLLM",
      label: "pingLLM",
      type: "batch",
      description:
        "Sends a prompt to one LLM provider and records the response",
      position: { x: 50, y: 460 },
      details: [
        { label: "Providers", value: "OpenAI, Anthropic, Google" },
        { label: "Timeout", value: "300 seconds" },
        { label: "Retries", value: "1 retry, 2s wait" },
      ],
    },
    {
      id: "analyzeResponse",
      label: "analyzeResponse",
      type: "batch",
      description:
        "Extracts brand mentions, sentiment, and rankings from a response",
      position: { x: 250, y: 460 },
      details: [
        { label: "Analyzer", value: "Claude Opus 4.5" },
        { label: "Output", value: "Mentions, links, sentiment" },
      ],
    },
    {
      id: "generateDigest",
      label: "generateDigest",
      type: "task",
      description: "Creates a summary digest from all brand mention data",
      position: { x: 450, y: 320 },
      details: [
        { label: "Generator", value: "Claude Opus 4.5" },
        { label: "Output", value: "Daily summary report" },
      ],
    },

    // Single-task versions (for direct UI triggering) - same row as batch coordinators
    {
      id: "pingLLM-single",
      label: "pingLLM",
      type: "task",
      description: "Triggers a single pingLLM task directly",
      position: { x: 650, y: 320 },
      details: [
        { label: "Mode", value: "Single task" },
        { label: "Providers", value: "OpenAI, Anthropic, Google" },
      ],
    },
    {
      id: "analyzeResponse-single",
      label: "analyzeResponse",
      type: "task",
      description: "Triggers a single analyzeResponse task directly",
      position: { x: 850, y: 320 },
      details: [
        { label: "Mode", value: "Single task" },
        { label: "Analyzer", value: "Claude Opus 4.5" },
      ],
    },
  ],

  edges: [
    // Trigger to orchestrator
    {
      id: "cron-daily",
      from: "cron",
      to: "dailyJob",
      label: "midnight",
      style: "solid",
    },

    // Trigger to individual tasks (direct)
    { id: "api-ping", from: "api", to: "pingLLM", style: "dashed" },
    { id: "api-analyze", from: "api", to: "analyzeResponse", style: "dashed" },

    // Trigger to batch tasks (UI)
    { id: "ui-pingAll", from: "ui", to: "pingAll", style: "dashed" },
    { id: "ui-analyzeAll", from: "ui", to: "analyzeAll", style: "dashed" },
    {
      id: "ui-generateDigest",
      from: "ui",
      to: "generateDigest",
      style: "dashed",
    },

    // Trigger to single tasks directly (UI)
    {
      id: "ui-pingLLM-single",
      from: "ui",
      to: "pingLLM-single",
      style: "dashed",
    },
    {
      id: "ui-analyzeResponse-single",
      from: "ui",
      to: "analyzeResponse-single",
      style: "dashed",
    },

    // Orchestrator to tasks (sequential)
    {
      id: "daily-pingAll",
      from: "dailyJob",
      to: "pingAll",
      label: "step 1",
      style: "solid",
    },
    {
      id: "daily-analyzeAll",
      from: "dailyJob",
      to: "analyzeAll",
      label: "step 2",
      style: "solid",
    },
    {
      id: "daily-digest",
      from: "dailyJob",
      to: "generateDigest",
      label: "step 3",
      style: "solid",
    },

    // Batch to individual (spawns many)
    {
      id: "pingAll-pingLLM",
      from: "pingAll",
      to: "pingLLM",
      label: "spawns",
      style: "dashed",
    },
    {
      id: "analyzeAll-analyze",
      from: "analyzeAll",
      to: "analyzeResponse",
      label: "spawns",
      style: "dashed",
    },
  ],

  defaultTrigger: "cron",

  triggerFlows: [
    {
      triggerId: "cron",
      nodes: [
        "cron",
        "dailyJob",
        "pingAll",
        "analyzeAll",
        "generateDigest",
        "pingLLM",
        "analyzeResponse",
      ],
      edges: [
        "cron-daily",
        "daily-pingAll",
        "daily-analyzeAll",
        "daily-digest",
        "pingAll-pingLLM",
        "analyzeAll-analyze",
      ],
      animationSequence: [
        {
          id: "cron-fires",
          activeNodes: ["cron"],
          activeEdges: [],
          duration: 1500,
          title: "Cron Job Fires",
          description:
            "Every day at midnight, the Render Cron Job triggers the daily workflow.",
        },
        {
          id: "daily-starts",
          activeNodes: ["cron", "dailyJob"],
          activeEdges: ["cron-daily"],
          duration: 2000,
          title: "Orchestrator Activates",
          description:
            "The dailyJob task coordinates the entire pipeline, running steps in sequence.",
        },
        {
          id: "ping-all",
          activeNodes: ["dailyJob", "pingAll"],
          activeEdges: ["daily-pingAll"],
          duration: 2000,
          title: "Step 1: Ping All LLMs",
          description:
            "pingAll queries all active prompt/provider combinations with concurrency control (10 parallel).",
        },
        {
          id: "ping-spawn",
          activeNodes: ["pingAll", "pingLLM"],
          activeEdges: ["pingAll-pingLLM"],
          duration: 2500,
          title: "Spawning Parallel Tasks",
          description:
            "Each prompt/provider combination spawns a pingLLM task. Tasks run in parallel up to the concurrency limit.",
        },
        {
          id: "analyze-all",
          activeNodes: ["dailyJob", "analyzeAll"],
          activeEdges: ["daily-analyzeAll"],
          duration: 2000,
          title: "Step 2: Analyze Responses",
          description:
            "After all pings complete, analyzeAll processes each response to extract insights.",
        },
        {
          id: "analyze-spawn",
          activeNodes: ["analyzeAll", "analyzeResponse"],
          activeEdges: ["analyzeAll-analyze"],
          duration: 2500,
          title: "Spawning Analysis Tasks",
          description:
            "Each response spawns an analyzeResponse task that extracts brand mentions, sentiment, and rankings.",
        },
        {
          id: "digest",
          activeNodes: ["dailyJob", "generateDigest"],
          activeEdges: ["daily-digest"],
          duration: 2000,
          title: "Step 3: Generate Digest",
          description:
            "Finally, generateDigest creates a summary report from all the analyzed data.",
        },
        {
          id: "complete",
          activeNodes: ["dailyJob", "pingAll", "analyzeAll", "generateDigest"],
          activeEdges: ["daily-pingAll", "daily-analyzeAll", "daily-digest"],
          duration: 2000,
          title: "Pipeline Complete",
          description:
            "The daily workflow completes. Results are stored in the database and visible in the dashboard.",
        },
      ],
    },
    {
      triggerId: "api",
      nodes: ["api", "pingLLM", "analyzeResponse"],
      edges: ["api-ping", "api-analyze"],
      animationSequence: [
        {
          id: "api-call",
          activeNodes: ["api"],
          activeEdges: [],
          duration: 1500,
          title: "API Call Received",
          description:
            "An external HTTP request triggers a specific task directly via POST /v1/task-runs.",
        },
        {
          id: "api-to-task",
          activeNodes: ["api", "pingLLM", "analyzeResponse"],
          activeEdges: ["api-ping", "api-analyze"],
          duration: 2500,
          title: "Direct Task Execution",
          description:
            "API calls can trigger individual tasks like pingLLM or analyzeResponse directly, bypassing the orchestrator.",
        },
      ],
    },
    {
      triggerId: "ui",
      nodes: [
        "ui",
        "pingAll",
        "analyzeAll",
        "generateDigest",
        "pingLLM",
        "analyzeResponse",
        "pingLLM-single",
        "analyzeResponse-single",
      ],
      edges: [
        "ui-pingAll",
        "ui-analyzeAll",
        "ui-generateDigest",
        "pingAll-pingLLM",
        "analyzeAll-analyze",
        "ui-pingLLM-single",
        "ui-analyzeResponse-single",
      ],
      animationSequence: [
        {
          id: "ui-click",
          activeNodes: ["ui"],
          activeEdges: [],
          duration: 1500,
          title: "Manual Button Click",
          description:
            "A user clicks a button in the dashboard to trigger operations manually.",
        },
        {
          id: "ui-to-tasks",
          activeNodes: [
            "ui",
            "pingAll",
            "analyzeAll",
            "generateDigest",
            "pingLLM-single",
            "analyzeResponse-single",
          ],
          activeEdges: [
            "ui-pingAll",
            "ui-analyzeAll",
            "ui-generateDigest",
            "ui-pingLLM-single",
            "ui-analyzeResponse-single",
          ],
          duration: 2500,
          title: "Direct Task Triggering",
          description:
            "The UI can trigger any task directly: batch coordinators, single tasks, or generateDigest.",
        },
        {
          id: "ui-spawn",
          activeNodes: ["pingAll", "analyzeAll", "pingLLM", "analyzeResponse"],
          activeEdges: ["pingAll-pingLLM", "analyzeAll-analyze"],
          duration: 2500,
          title: "Batch Tasks Spawn Parallel Work",
          description:
            "When batch coordinators are triggered, they spawn multiple parallel task instances with concurrency control.",
        },
      ],
    },
  ],
};

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Workflow Visualizer Dev
        </h1>
        <p className="text-zinc-400">Test and develop workflow components</p>
      </header>
      <main>
        <WorkflowVisualizer
          config={sampleWorkflow}
          defaultSelectedNode="cron"
        />
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
