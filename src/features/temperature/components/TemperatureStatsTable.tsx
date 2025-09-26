import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Thermometer, Droplets } from "lucide-react";
import type { TemperatureSensorType } from "@/types/sensor-types";

interface TemperatureStats {
	temperature: {
		current: number;
		avg: number;
		min: number;
		max: number;
	};
	humidity: {
		current: number;
		avg: number;
		min: number;
		max: number;
	};
	statusCounts: Record<string, number>;
}

interface TemperatureStatsTableProps {
	messages: TemperatureSensorType[];
}

// Helper function to calculate temperature statistics
export function calculateTemperatureStats(messages: TemperatureSensorType[]): TemperatureStats {
	if (messages.length === 0) {
		return {
			temperature: { current: 0, avg: 0, min: 0, max: 0 },
			humidity: { current: 0, avg: 0, min: 0, max: 0 },
			statusCounts: {}
		};
	}

	const temperatures = messages.map(m => m.temperature);
	const humidities = messages.map(m => m.humidity);

	const statusCounts = messages.reduce(
		(acc, m) => {
			const status = m.enabled ? 'active' : 'inactive';
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	return {
		temperature: {
			current: temperatures[temperatures.length - 1],
			avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
			min: Math.min(...temperatures),
			max: Math.max(...temperatures),
		},
		humidity: {
			current: humidities[humidities.length - 1],
			avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
			min: Math.min(...humidities),
			max: Math.max(...humidities),
		},
		statusCounts,
	};
}

const getStatusIcon = (status: string) => {
	switch (status.toLowerCase()) {
		case "active":
			return <CheckCircle className="h-3 w-3 text-green-500" />;
		case "inactive":
			return <XCircle className="h-3 w-3 text-red-500" />;
		case "warning":
			return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
		default:
			return <Thermometer className="h-3 w-3 text-gray-500" />;
	}
};

const fmt = (value: number, decimals: number = 1): string => {
	return value.toFixed(decimals);
};

export function TemperatureStatsTable({ messages }: TemperatureStatsTableProps) {
	// Early return if no data
	if (!messages || messages.length === 0) {
		return (
			<div className="rounded-md border border-border bg-card text-card-foreground p-4">
				<div className="text-center text-muted-foreground">
					No temperature sensor data available
				</div>
			</div>
		);
	}

	const stats = calculateTemperatureStats(messages);
	const last = messages[messages.length - 1] ?? {};
	const first = messages[0] ?? {};

	const tempDev = (stats.temperature.max - stats.temperature.min) / 2;
	const humidityDev = (stats.humidity.max - stats.humidity.min) / 2;

	// Get the most common status
	const primaryStatus = Object.entries(stats.statusCounts).sort(([, a], [, b]) => b - a)[0];

	return (
		<div className="rounded-md border border-border bg-transparent text-white overflow-hidden">
			<table className="w-full text-xs overflow-hidden">
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
						<td className="px-2 py-1 text-muted-foreground">Current Temperature</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.temperature.current, 1)}°C</td>
						<td className="px-2 py-1 text-muted-foreground">Latest reading</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Current Humidity</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.humidity.current, 1)}%</td>
						<td className="px-2 py-1 text-muted-foreground">Latest reading</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Sensor Status</td>
						<td className="px-2 py-1 font-medium flex items-center gap-1">
							{primaryStatus && getStatusIcon(primaryStatus[0])}
							<span className="capitalize">{primaryStatus?.[0] || 'Unknown'}</span>
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{primaryStatus && `${primaryStatus[1]} readings`}
						</td>
					</tr>

					{/* Temperature Analysis */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground flex items-center gap-1">
							<Thermometer className="h-3 w-3 text-red-500" />
							<span>Temperature Range</span>
						</td>
						<td className="px-2 py-1 font-medium">
							{fmt(stats.temperature.avg, 1)}°C ± {fmt(tempDev, 1)}°C
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(stats.temperature.min, 1)}°C–{fmt(stats.temperature.max, 1)}°C
						</td>
					</tr>

					{/* Humidity Analysis */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground flex items-center gap-1">
							<Droplets className="h-3 w-3 text-blue-500" />
							<span>Humidity Range</span>
						</td>
						<td className="px-2 py-1 font-medium">
							{fmt(stats.humidity.avg, 1)}% ± {fmt(humidityDev, 1)}%
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(stats.humidity.min, 1)}%–{fmt(stats.humidity.max, 1)}%
						</td>
					</tr>

					{/* Status Distribution */}
					{Object.entries(stats.statusCounts).map(([status, count]) => (
						<tr key={status} className="border-t border-border">
							<td className="px-2 py-1 text-muted-foreground flex items-center gap-1">
								{getStatusIcon(status)}
								<span className="capitalize">{status} Sensors</span>
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
						<td className="px-2 py-1 font-medium">{first.sensor || "Temperature"}</td>
						<td className="px-2 py-1 text-muted-foreground">{first.location || "Unknown"}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Monitoring</td>
						<td className="px-2 py-1 font-medium">{last.enabled ? "Active" : "Inactive"}</td>
						<td className="px-2 py-1 text-muted-foreground">
							{/* Alerts: {last.alertsEnabled ? "Enabled" : "Disabled"} */}
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Total Readings</td>
						<td className="px-2 py-1 font-medium">{messages.length}</td>
						<td className="px-2 py-1 text-muted-foreground">—</td>
					</tr>

					{/* Environmental Conditions */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Temperature Stability</td>
						<td className="px-2 py-1 font-medium">
							{tempDev < 2 ? "Stable" : tempDev < 5 ? "Variable" : "Highly Variable"}
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							±{fmt(tempDev, 1)}°C variation
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Humidity Stability</td>
						<td className="px-2 py-1 font-medium">
							{humidityDev < 5 ? "Stable" : humidityDev < 15 ? "Variable" : "Highly Variable"}
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							±{fmt(humidityDev, 1)}% variation
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
