"use client";

import { motion } from "framer-motion";
import type { WorkflowEdgeConfig, WorkflowNodeConfig } from "./types";

// Arrow head component with proper rotation based on entry direction
function ArrowHead({
	x,
	y,
	entryDir,
	isActive,
}: {
	x: number;
	y: number;
	entryDir: "up" | "down" | "left" | "right";
	isActive: boolean;
}) {
	const size = 6;

	// Rotation based on entry direction (arrow points in direction of flow)
	const rotations = {
		up: 180, // Arrow pointing down (entering from top)
		down: 0, // Arrow pointing down (entering from top)
		left: 90, // Arrow pointing right
		right: -90, // Arrow pointing left
	};

	return (
		<polygon
			points={`0,${-size} ${-size},${size} ${size},${size}`}
			fill={isActive ? "#fff" : "#444"}
			transform={`translate(${x}, ${y}) rotate(${rotations[entryDir]})`}
			className="transition-colors duration-300"
		/>
	);
}

interface WorkflowEdgeProps {
	edge: WorkflowEdgeConfig;
	nodes: WorkflowNodeConfig[];
	isActive: boolean;
	isInFlow: boolean;
}

// Node dimensions for calculating connection points
const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;

type Direction = "up" | "down" | "left" | "right";

function getConnectionPoints(
	from: WorkflowNodeConfig,
	to: WorkflowNodeConfig,
): {
	fromPoint: { x: number; y: number };
	toPoint: { x: number; y: number };
	exitDir: Direction;
	entryDir: Direction;
} {
	const fromCenterX = from.position.x + NODE_WIDTH / 2;
	const fromCenterY = from.position.y + NODE_HEIGHT / 2;
	const toCenterX = to.position.x + NODE_WIDTH / 2;
	const toCenterY = to.position.y + NODE_HEIGHT / 2;

	const dy = toCenterY - fromCenterY;

	let fromPoint = { x: fromCenterX, y: fromCenterY };
	let toPoint = { x: toCenterX, y: toCenterY };
	let exitDir: Direction = "down";
	let entryDir: Direction = "up";

	// Determine connection based on vertical relationship
	if (dy > 0) {
		// Target is below - exit bottom, enter top
		fromPoint = { x: fromCenterX, y: from.position.y + NODE_HEIGHT };
		toPoint = { x: toCenterX, y: to.position.y };
		exitDir = "down";
		entryDir = "up";
	} else {
		// Target is above - exit top, enter bottom
		fromPoint = { x: fromCenterX, y: from.position.y };
		toPoint = { x: toCenterX, y: to.position.y + NODE_HEIGHT };
		exitDir = "up";
		entryDir = "down";
	}

	return { fromPoint, toPoint, exitDir, entryDir };
}

function createPath(
	from: { x: number; y: number },
	to: { x: number; y: number },
	exitDir: Direction,
	entryDir: Direction,
): string {
	// Create 90-degree angle path
	if (exitDir === "down" && entryDir === "up") {
		// Going down: exit down, turn horizontal, then down to target
		const midY = from.y + (to.y - from.y) / 2;
		return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
	}

	if (exitDir === "up" && entryDir === "down") {
		// Going up: exit up, turn horizontal, then up to target
		const midY = from.y + (to.y - from.y) / 2;
		return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
	}

	// Fallback: direct line
	return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function WorkflowEdge({
	edge,
	nodes,
	isActive,
	isInFlow,
}: WorkflowEdgeProps) {
	const fromNode = nodes.find((n) => n.id === edge.from);
	const toNode = nodes.find((n) => n.id === edge.to);

	if (!fromNode || !toNode) return null;

	// Don't render edges not in the current flow
	if (!isInFlow) return null;

	const { fromPoint, toPoint, exitDir, entryDir } = getConnectionPoints(
		fromNode,
		toNode,
	);
	const pathD = createPath(fromPoint, toPoint, exitDir, entryDir);

	// Calculate label position (middle of the path)
	const labelX = (fromPoint.x + toPoint.x) / 2;
	const labelY = (fromPoint.y + toPoint.y) / 2;

	return (
		<g>
			{/* Background path (always visible) */}
			<path
				d={pathD}
				fill="none"
				stroke={isActive ? "#fff" : "#333"}
				strokeWidth={isActive ? 2 : 1}
				strokeDasharray={edge.style === "dashed" ? "5,5" : undefined}
				className="transition-all duration-300"
			/>

			{/* Animated flow effect when active */}
			{isActive && (
				<>
					{/* Glowing path */}
					<motion.path
						d={pathD}
						fill="none"
						stroke="rgba(255,255,255,0.5)"
						strokeWidth={4}
						strokeLinecap="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					{/* Moving dot */}
					<motion.circle
						r={4}
						fill="#fff"
						initial={{ offsetDistance: "0%" }}
						animate={{ offsetDistance: "100%" }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						style={{
							offsetPath: `path('${pathD}')`,
						}}
					/>
				</>
			)}

			{/* Arrow head */}
			<ArrowHead
				x={toPoint.x}
				y={toPoint.y}
				entryDir={entryDir}
				isActive={isActive}
			/>

			{/* Edge label */}
			{edge.label && (
				<g transform={`translate(${labelX}, ${labelY})`}>
					<rect x={-25} y={-10} width={50} height={20} fill="#000" />
					<text
						textAnchor="middle"
						dominantBaseline="middle"
						fill={isActive ? "#fff" : "#666"}
						fontSize={10}
						fontFamily="monospace"
						className="transition-colors duration-300"
					>
						{edge.label}
					</text>
				</g>
			)}
		</g>
	);
}
