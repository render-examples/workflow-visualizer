// Workflow visualization configuration types
// Use these types to configure the WorkflowVisualizer for any project

export type NodeType = "trigger" | "task" | "batch" | "orchestrator";

export interface WorkflowNodeConfig {
  id: string;
  label: string;
  type: NodeType;
  description: string;
  position: { x: number; y: number };
  details?: { label: string; value: string }[];
}

export interface WorkflowEdgeConfig {
  id: string;
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed";
}

export interface AnimationStep {
  id: string;
  activeNodes: string[];
  activeEdges: string[];
  duration: number; // milliseconds
  title: string;
  description: string;
}

export interface TriggerFlow {
  triggerId: string;
  nodes: string[]; // Node IDs involved in this trigger's flow
  edges: string[]; // Edge IDs involved in this trigger's flow
  animationSequence: AnimationStep[];
}

export interface WorkflowConfig {
  title: string;
  subtitle: string;
  nodes: WorkflowNodeConfig[];
  edges: WorkflowEdgeConfig[];
  triggerFlows: TriggerFlow[];
  defaultTrigger: string;
}
