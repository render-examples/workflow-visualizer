"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkflowConfig } from "./types";
import { StepDescription, WorkflowControls } from "./WorkflowControls";
import { WorkflowEdge } from "./WorkflowEdge";
import { WorkflowNode, WorkflowNodeDetail } from "./WorkflowNode";

interface WorkflowVisualizerProps {
	config: WorkflowConfig;
	/** Node ID to show in the detail panel by default */
	defaultSelectedNode?: string;
}

export function WorkflowVisualizer({
	config,
	defaultSelectedNode,
}: WorkflowVisualizerProps) {
	const [selectedTrigger, setSelectedTrigger] = useState(config.defaultTrigger);
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [selectedNode, setSelectedNode] = useState<string | null>(
		defaultSelectedNode ?? null,
	);

	// Get the current trigger flow
	const currentFlow = useMemo(
		() => config.triggerFlows.find((f) => f.triggerId === selectedTrigger),
		[config.triggerFlows, selectedTrigger],
	);

	const animationSequence = currentFlow?.animationSequence || [];
	const flowNodes = new Set(currentFlow?.nodes || []);
	const flowEdges = new Set(currentFlow?.edges || []);

	// All trigger node IDs
	const triggerNodes = useMemo(
		() =>
			new Set(
				config.nodes.filter((n) => n.type === "trigger").map((n) => n.id),
			),
		[config.nodes],
	);

	const currentAnimation = animationSequence[currentStep];
	const activeNodes = new Set(currentAnimation?.activeNodes || []);
	const activeEdges = new Set(currentAnimation?.activeEdges || []);

	// Calculate canvas size based on node positions
	const canvasWidth = Math.max(
		...config.nodes.map((n) => n.position.x + 200),
		700,
	);
	const canvasHeight = Math.max(
		...config.nodes.map((n) => n.position.y + 100),
		550,
	);

	// Reset animation when trigger changes
	useEffect(() => {
		setCurrentStep(0);
		setIsPlaying(true);
	}, [selectedTrigger]);

	// Auto-advance animation
	useEffect(() => {
		if (!isPlaying || animationSequence.length === 0) return;

		const duration = currentAnimation?.duration || 2000;
		const timer = setTimeout(() => {
			setCurrentStep((prev) => {
				if (prev >= animationSequence.length - 1) {
					return 0; // Loop back to start
				}
				return prev + 1;
			});
		}, duration);

		return () => clearTimeout(timer);
	}, [currentStep, isPlaying, currentAnimation, animationSequence.length]);

	const handlePlayPause = useCallback(() => {
		setIsPlaying((prev) => !prev);
	}, []);

	const handleStepForward = useCallback(() => {
		setIsPlaying(false);
		setCurrentStep((prev) =>
			prev >= animationSequence.length - 1 ? prev : prev + 1,
		);
	}, [animationSequence.length]);

	const handleStepBackward = useCallback(() => {
		setIsPlaying(false);
		setCurrentStep((prev) => (prev <= 0 ? prev : prev - 1));
	}, []);

	const handleReset = useCallback(() => {
		setCurrentStep(0);
		setIsPlaying(true);
	}, []);

	const handleNodeClick = useCallback(
		(nodeId: string) => {
			// If clicking a trigger node, also switch to that trigger's flow
			if (triggerNodes.has(nodeId)) {
				setSelectedTrigger(nodeId);
			}
			// Show details for any node (toggle if already selected)
			setIsPlaying(false);
			setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
		},
		[triggerNodes],
	);

	const selectedNodeConfig = selectedNode
		? config.nodes.find((n) => n.id === selectedNode)
		: null;

	// Determine if a node is in the current flow or grayed out
	const isNodeInFlow = (nodeId: string) => {
		// Triggers are always visible
		if (triggerNodes.has(nodeId)) return true;
		return flowNodes.has(nodeId);
	};

	// Determine if an edge is in the current flow
	const isEdgeInFlow = (edgeId: string) => flowEdges.has(edgeId);

	return (
		<div className="space-y-6">
			{/* Controls */}
			<div className="flex items-center justify-between">
				<WorkflowControls
					isPlaying={isPlaying}
					currentStep={currentStep}
					totalSteps={animationSequence.length}
					onPlayPause={handlePlayPause}
					onStepForward={handleStepForward}
					onStepBackward={handleStepBackward}
					onReset={handleReset}
				/>
			</div>

			{/* Step description */}
			<AnimatePresence mode="wait">
				{currentAnimation && (
					<StepDescription
						key={currentAnimation.id}
						title={currentAnimation.title}
						description={currentAnimation.description}
					/>
				)}
			</AnimatePresence>

			{/* Main visualization area */}
			<div className="flex gap-6">
				{/* Canvas */}
				<div
					className="relative bg-[#0a0a0a] border border-[#222] overflow-auto flex-1"
					style={{ minHeight: canvasHeight + 40 }}
				>
					{/* SVG layer for edges */}
					<svg
						width={canvasWidth}
						height={canvasHeight}
						className="absolute inset-0"
						style={{ pointerEvents: "none" }}
					>
						{config.edges.map((edge) => (
							<WorkflowEdge
								key={edge.id}
								edge={edge}
								nodes={config.nodes}
								isActive={activeEdges.has(edge.id)}
								isInFlow={isEdgeInFlow(edge.id)}
							/>
						))}
					</svg>

					{/* Nodes layer */}
					<div
						className="relative"
						style={{ width: canvasWidth, height: canvasHeight }}
					>
						{config.nodes.map((node) => (
							<WorkflowNode
								key={node.id}
								node={node}
								isActive={activeNodes.has(node.id)}
								isSelected={selectedNode === node.id}
								isInFlow={isNodeInFlow(node.id)}
								isSelectedTrigger={node.id === selectedTrigger}
								onClick={() => handleNodeClick(node.id)}
							/>
						))}
					</div>

					{/* Legend */}
					<div className="absolute bottom-4 left-4 flex gap-6 text-xs uppercase tracking-wider">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-[#1C0037] border border-[#9B52FB]" />
							<span className="text-[#9B52FB]">Trigger</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-[#00102A] border border-[#33ACFF]" />
							<span className="text-[#33ACFF]">Orchestrator</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative w-4 h-4">
								<div
									className="absolute w-3 h-3 bg-[#2C001D] border border-[#F347FF]"
									style={{ top: 2, left: 2 }}
								/>
								<div
									className="absolute w-3 h-3 bg-[#2C001D] border border-[#F347FF]"
									style={{ top: 0, left: 0 }}
								/>
							</div>
							<span className="text-[#F347FF]">Parallel</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-[#141414] border border-[#555]" />
							<span className="text-[#666]">Task</span>
						</div>
					</div>

					{/* Interaction hint */}
					<div className="absolute bottom-4 right-4 text-xs text-[#444]">
						Click a trigger to switch flow
					</div>
				</div>

				{/* Detail panel */}
				<AnimatePresence>
					{selectedNodeConfig && (
						<WorkflowNodeDetail
							node={selectedNodeConfig}
							onClose={() => setSelectedNode(null)}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
