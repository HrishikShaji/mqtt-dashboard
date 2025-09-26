import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Gauge } from "lucide-react";
import type { WaterSensorType } from "@/types/sensor-types";

interface WaterStats {
	level: {
		current: number;
		avg: number;
		min: number;
		max: number;
	};
	percentage: {
		current: number;
		avg: number;
		min: number;
		max: number;
	};
	capacity: number;
	statusCounts: Record<string, number>;
}

// Compatible with your existing levelStats structure
interface LevelStats {
	current: number;
	avg: number;
	min: number;
	max: number;
	avgPercentage: number;
}

interface WaterStatsTableProps {
	messages: WaterSensorType[];
}

// Export the LevelStats type so it can be used in other components
export type { LevelStats };

// Helper function to calculate water statistics
export function calculateWaterStats(messages: WaterSensorType[]): WaterStats {
	if (messages.length === 0) {
		return {
			level: { current: 0, avg: 0, min: 0, max: 0 },
			percentage: { current: 0, avg: 0, min: 0, max: 0 },
			capacity: 1000,
			statusCounts: {}
		};
	}

	const levels = messages.map(m => m.level);
	const percentages = messages.map(m => (m.level / m.capacity) * 100);
	const capacity = messages[0]?.capacity || 1000;

	const statusCounts = messages.reduce(
		(acc, m) => {
			acc[m.status] = (acc[m.status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	return {
		level: {
			current: levels[levels.length - 1],
			avg: levels.reduce((a, b) => a + b, 0) / levels.length,
			min: Math.min(...levels),
			max: Math.max(...levels),
		},
		percentage: {
			current: percentages[percentages.length - 1],
			avg: percentages.reduce((a, b) => a + b, 0) / percentages.length,
			min: Math.min(...percentages),
			max: Math.max(...percentages),
		},
		capacity,
		statusCounts,
	};
}

const getStatusIcon = (status: string) => {
	switch (status.toLowerCase()) {
		case "normal":
			return <CheckCircle className="h-3 w-3 text-green-500" />;
		case "warning":
		case "low":
		case "high":
			return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
		case "critical":
			return <XCircle className="h-3 w-3 text-red-500" />;
		default:
			return <Gauge className="h-3 w-3 text-gray-500" />;
	}
};

const fmt = (value: number, decimals: number = 1): string => {
	return value.toFixed(decimals);
};

// Helper function to check if stats is the old levelStats format
function isLevelStats(stats: WaterStats | LevelStats): stats is LevelStats {
	return 'avgPercentage' in stats;
}

export function WaterStatsTable({ messages }: WaterStatsTableProps) {
	// Early return if no data
	if (!messages || messages.length === 0) {
		return (
			<div className="rounded-md border border-border bg-card text-card-foreground p-4">
				<div className="text-center text-muted-foreground">
					No water sensor data available
				</div>
			</div>
		);
	}
	const levels = messages.map((m) => m.level)
	const percentages = messages.map((m) => (m.level / m.capacity) * 100)

	// In your WaterChart.tsx, you can type it like this:
	const stats: {
		current: number;
		avg: number;
		min: number;
		max: number;
		avgPercentage: number;
	} = {
		current: levels[levels.length - 1],
		avg: levels.reduce((a, b) => a + b, 0) / levels.length,
		min: Math.min(...levels),
		max: Math.max(...levels),
		avgPercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
	}

	const last = messages[messages.length - 1] ?? {};
	const first = messages[0] ?? {};

	// Convert old levelStats format to new format if needed
	let normalizedStats: WaterStats;

	if (isLevelStats(stats)) {
		// Convert your existing levelStats structure
		const capacity = messages[0]?.capacity || 1000;
		const statusCounts = messages.reduce(
			(acc, m) => {
				acc[m.status] = (acc[m.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const percentages = messages.map(m => (m.level / m.capacity) * 100);

		normalizedStats = {
			level: {
				current: stats.current || 0,
				avg: stats.avg || 0,
				min: stats.min || 0,
				max: stats.max || 0,
			},
			percentage: {
				current: (stats.current / capacity) * 100 || 0,
				avg: stats.avgPercentage || 0,
				min: percentages.length > 0 ? Math.min(...percentages) : 0,
				max: percentages.length > 0 ? Math.max(...percentages) : 0,
			},
			capacity,
			statusCounts,
		};
	} else {
		normalizedStats = stats;
	}

	const levelDev = (normalizedStats.level.max - normalizedStats.level.min) / 2;
	const percentageDev = (normalizedStats.percentage.max - normalizedStats.percentage.min) / 2;

	// Get the most common status
	const primaryStatus = Object.entries(normalizedStats.statusCounts).sort(([, a], [, b]) => b - a)[0];

	return (
		<div className="rounded-md border border-border bg-transparent text-white overflow-hidden">
			<table className="w-full text-xs">
				<thead className="bg-neutral-900 text-white">
					<tr className="text-left">
						<th className="px-2 py-1 font-medium">Metric</th>
						<th className="px-2 py-1 font-medium">Value</th>
						<th className="px-2 py-1 font-medium">Details</th>
					</tr>
				</thead>
				<tbody>
					{/* Overview */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Current Level</td>
						<td className="px-2 py-1 font-medium">{fmt(normalizedStats.level.current, 0)} / {normalizedStats.capacity}</td>
						<td className="px-2 py-1 text-muted-foreground">{fmt(normalizedStats.percentage.current, 1)}% filled</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Tank Status</td>
						<td className="px-2 py-1 font-medium flex items-center gap-1">
							{primaryStatus && getStatusIcon(primaryStatus[0])}
							<span className="capitalize">{primaryStatus?.[0] || 'Unknown'}</span>
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{primaryStatus && `${primaryStatus[1]} readings`}
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Capacity</td>
						<td className="px-2 py-1 font-medium">{normalizedStats.capacity} units</td>
						<td className="px-2 py-1 text-muted-foreground">—</td>
					</tr>

					{/* Level Analysis */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Level Range</td>
						<td className="px-2 py-1 font-medium">
							{fmt(normalizedStats.level.avg, 0)} ± {fmt(levelDev, 0)}
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(normalizedStats.level.min, 0)}–{fmt(normalizedStats.level.max, 0)}
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Fill Percentage</td>
						<td className="px-2 py-1 font-medium">
							{fmt(normalizedStats.percentage.avg, 1)}% ± {fmt(percentageDev, 1)}%
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(normalizedStats.percentage.min, 1)}%–{fmt(normalizedStats.percentage.max, 1)}%
						</td>
					</tr>

					{/* Status Distribution */}
					{Object.entries(normalizedStats.statusCounts).map(([status, count]) => (
						<tr key={status} className="border-t border-border">
							<td className="px-2 py-1 text-muted-foreground flex items-center gap-1">
								{getStatusIcon(status)}
								<span className="capitalize">{status} Status</span>
							</td>
							<td className="px-2 py-1 font-medium">{count}</td>
							<td className="px-2 py-1 text-muted-foreground">
								{fmt((count / messages.length) * 100, 1)}%
							</td>
						</tr>
					))}

					{/* System Health */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Sensor Type</td>
						<td className="px-2 py-1 font-medium">{first.sensor || "Water Level"}</td>
						<td className="px-2 py-1 text-muted-foreground">{first.location || "Tank"}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Monitoring</td>
						<td className="px-2 py-1 font-medium">{last.enabled ? "Active" : "Inactive"}</td>
						<td className="px-2 py-1 text-muted-foreground">
							Alerts: {last.alertsEnabled ? "Enabled" : "Disabled"}
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Total Readings</td>
						<td className="px-2 py-1 font-medium">{messages.length}</td>
						<td className="px-2 py-1 text-muted-foreground">—</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
