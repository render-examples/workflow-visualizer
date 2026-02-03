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
	{ bg: string; accent: string; selectedBg: string; selectedText: string }
> = {
	trigger: {
		bg: "#1C0037",
		accent: "#9B52FB",
		selectedBg: "#9B52FB",
		selectedText: "#1C0037",
	},
	orchestrator: {
		bg: "#00102A",
		accent: "#33ACFF",
		selectedBg: "#33ACFF",
		selectedText: "#00102A",
	},
	batch: {
		bg: "#2C001D",
		accent: "#F347FF",
		selectedBg: "#F347FF",
		selectedText: "#2C001D",
	},
	task: {
		bg: "#141414",
		accent: "#555",
		selectedBg: "#888",
		selectedText: "#141414",
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
						className="absolute border-2"
						style={{
							top: 8,
							left: 8,
							right: -8,
							bottom: -8,
							backgroundColor: styles.bg,
							borderColor: styles.accent,
						}}
					/>
					<div
						className="absolute border-2"
						style={{
							top: 4,
							left: 4,
							right: -4,
							bottom: -4,
							backgroundColor: styles.bg,
							borderColor: styles.accent,
						}}
					/>
				</>
			)}

		{/* Main node */}
		<button
			type="button"
			className={`
          relative cursor-pointer select-none text-left
          border-2 p-4 min-w-[140px]
          transition-all duration-200
          ${isTrigger && !isSelectedTrigger ? "hover:opacity-70" : ""}
        `}
			style={{
				backgroundColor: isSelected ? styles.selectedBg : styles.bg,
				borderColor: styles.accent,
			}}
			onClick={onClick}
		>
				{/* Animated stroke border when active */}
				{isActive && !isGrayedOut && <AnimatedBorder nodeType={node.type} />}

				{/* Type badge */}
				<div
					className="text-[10px] uppercase tracking-wider mb-1"
					style={{ color: isSelected ? styles.selectedText : styles.accent }}
				>
					{nodeTypeLabels[node.type]}
				</div>

				{/* Node label */}
				<div 
					className="font-mono text-sm font-medium"
					style={{ color: isSelected ? styles.selectedText : '#fff' }}
				>
					{node.label}
				</div>
			</button>
		</div>
	);
}

// Brighter colors for animated active state (more visible than base accent)
const activeStrokeColors: Record<NodeType, string> = {
	trigger: "#C490FF", // lighter purple
	orchestrator: "#7DD3FF", // lighter blue
	batch: "#FF8FFF", // lighter magenta
	task: "#999", // lighter gray
};

// Animated border stroke that circles around the node
function AnimatedBorder({ nodeType }: { nodeType: NodeType }) {
	const strokeColor = activeStrokeColors[nodeType];

	return (
		<svg
			className="absolute inset-0 w-full h-full pointer-events-none"
			style={{
				left: -2,
				top: -2,
				width: "calc(100% + 4px)",
				height: "calc(100% + 4px)",
			}}
		>
			<motion.rect
				x="1"
				y="1"
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				fill="none"
				stroke={strokeColor}
				strokeWidth="3"
				strokeDasharray="10 5"
				initial={{ strokeDashoffset: 0 }}
				animate={{ strokeDashoffset: -30 }}
				transition={{
					duration: 0.8,
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
			className="border-2 p-6 w-72 shrink-0"
			style={{ backgroundColor: styles.bg, borderColor: styles.accent }}
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
