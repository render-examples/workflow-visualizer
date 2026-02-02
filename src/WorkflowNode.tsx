"use client";

import { motion } from "framer-motion";
import type { NodeType, WorkflowNodeConfig } from "./types";

interface WorkflowNodeProps {
	node: WorkflowNodeConfig;
	isActive: boolean;
	isSelected: boolean;
	isInFlow: boolean;
	isSelectedTrigger?: boolean;
	onClick: () => void;
}

// Colors: Purple (#9B52FB), Blue (#33ACFF), Magenta (#F347FF)
const nodeTypeStyles: Record<
	NodeType,
	{ bg: string; border: string; accent: string }
> = {
	trigger: {
		bg: "bg-[#1C0037]",
		border: "border-[#9B52FB]",
		accent: "#9B52FB",
	},
	orchestrator: {
		bg: "bg-[#00102A]",
		border: "border-[#33ACFF]",
		accent: "#33ACFF",
	},
	batch: {
		bg: "bg-[#2C001D]",
		border: "border-[#F347FF]",
		accent: "#F347FF",
	},
	task: {
		bg: "bg-[#141414]",
		border: "border-[#333]",
		accent: "#666",
	},
};

const nodeTypeLabels: Record<NodeType, string> = {
	trigger: "TRIGGER",
	orchestrator: "ORCHESTRATOR",
	batch: "PARALLEL TASKS",
	task: "TASK",
};

export function WorkflowNode({
	node,
	isActive,
	isSelected,
	isInFlow,
	isSelectedTrigger,
	onClick,
}: WorkflowNodeProps) {
	const styles = nodeTypeStyles[node.type];
	const isBatch = node.type === "batch";
	const isTrigger = node.type === "trigger";

	// Triggers that aren't selected are grayed out
	// Non-trigger nodes not in the flow are grayed out
	const isGrayedOut = isTrigger ? !isSelectedTrigger : !isInFlow;

	return (
		<div
			className={`absolute transition-opacity duration-300 ${isGrayedOut ? "opacity-30" : "opacity-100"}`}
			style={{
				left: node.position.x,
				top: node.position.y,
			}}
		>
			{/* Stacked effect for batch nodes - behind main node */}
			{isBatch && !isGrayedOut && (
				<>
					<div
						className={`absolute ${styles.bg} ${styles.border} border`}
						style={{
							top: 8,
							left: 8,
							right: -8,
							bottom: -8,
						}}
					/>
					<div
						className={`absolute ${styles.bg} ${styles.border} border`}
						style={{
							top: 4,
							left: 4,
							right: -4,
							bottom: -4,
						}}
					/>
				</>
			)}

			{/* Main node */}
			<button
				type="button"
				className={`
          relative cursor-pointer select-none text-left
          ${styles.bg} ${styles.border}
          border p-4 min-w-[140px]
          transition-colors
          ${isSelected ? "ring-2 ring-white" : ""}
          ${isTrigger && !isSelectedTrigger ? "hover:opacity-70" : ""}
        `}
				onClick={onClick}
			>
				{/* Animated stroke border when active */}
				{isActive && !isGrayedOut && <AnimatedBorder nodeType={node.type} />}

				{/* Type badge */}
				<div
					className="text-[10px] uppercase tracking-wider mb-1"
					style={{ color: styles.accent }}
				>
					{nodeTypeLabels[node.type]}
				</div>

				{/* Node label */}
				<div className="text-white font-mono text-sm font-medium">
					{node.label}
				</div>
			</button>
		</div>
	);
}

// Animated border stroke that circles around the node
function AnimatedBorder({ nodeType }: { nodeType: NodeType }) {
	// Use white for visibility against colored borders
	const strokeColor = nodeType === "task" ? "#888" : "#fff";

	return (
		<svg
			className="absolute inset-0 w-full h-full pointer-events-none"
			style={{
				left: -1,
				top: -1,
				width: "calc(100% + 2px)",
				height: "calc(100% + 2px)",
			}}
		>
			<motion.rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="none"
				stroke={strokeColor}
				strokeWidth="2"
				strokeDasharray="8 4"
				initial={{ strokeDashoffset: 0 }}
				animate={{ strokeDashoffset: -24 }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
		</svg>
	);
}

// Detail panel shown when a node is selected
export function WorkflowNodeDetail({
	node,
	onClose,
}: {
	node: WorkflowNodeConfig;
	onClose: () => void;
}) {
	const styles = nodeTypeStyles[node.type];

	return (
		<motion.div
			className={`${styles.bg} ${styles.border} border p-6 w-72 shrink-0`}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
		>
			<div className="flex justify-between items-start mb-4">
				<div>
					<div
						className="text-[10px] uppercase tracking-wider mb-1"
						style={{ color: styles.accent }}
					>
						{nodeTypeLabels[node.type]}
					</div>
					<h3 className="text-white font-mono text-lg font-medium">
						{node.label}
					</h3>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="text-[#666] hover:text-white transition-colors text-xl leading-none"
				>
					×
				</button>
			</div>

			<p className="text-[#888] text-sm mb-4">{node.description}</p>

		{node.details && node.details.length > 0 && (
			<div className="space-y-3">
				{node.details.map((detail, i) => (
					<div key={i} className="text-sm">
						<div className="text-[#666] mb-1">{detail.label}</div>
						<div className="text-white font-mono">{detail.value}</div>
					</div>
				))}
			</div>
		)}
		</motion.div>
	);
}
