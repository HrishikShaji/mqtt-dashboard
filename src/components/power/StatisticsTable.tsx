import React from 'react';
import { PowerStats, PowerQuality, PowerMonitoringData } from '../../types/power-sensor-types';
import { fmt } from '@/lib/power-utils';

interface StatisticsTableProps {
	stats: PowerStats;
	powerQuality: PowerQuality;
	messages: PowerMonitoringData[];
}

export function StatisticsTable({ stats, powerQuality, messages }: StatisticsTableProps) {
	const last = messages[messages.length - 1] ?? {};
	const first = messages[0] ?? {};

	const voltageDev = (stats.voltage.max - stats.voltage.min) / 2;
	const currentDev = (stats.current.max - stats.current.min) / 2;
	const freqDev = (stats.frequency.max - stats.frequency.min) / 2;
	const apparentPower = stats.voltage.avg * stats.current.avg;

	return (
		<div className="rounded-md border border-border bg-card text-card-foreground">
			<table className="w-full text-xs">
				<thead className="bg-muted/50 text-muted-foreground">
					<tr className="text-left">
						<th className="px-2 py-1 font-medium">Metric</th>
						<th className="px-2 py-1 font-medium">Value</th>
						<th className="px-2 py-1 font-medium">Details</th>
					</tr>
				</thead>
				<tbody>
					{/* Overview */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Current Load</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.power.avg, 0)} W</td>
						<td className="px-2 py-1 text-muted-foreground">Apparent: {fmt(apparentPower, 0)} VA</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Power Quality</td>
						<td className="px-2 py-1 font-medium">{powerQuality.status}</td>
						<td className="px-2 py-1 text-muted-foreground">—</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Avg Power Factor</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.powerFactor.avg, 3)}</td>
						<td className="px-2 py-1 text-muted-foreground">
							Range: {fmt(stats.powerFactor.min, 3)}–{fmt(stats.powerFactor.max, 3)}
						</td>
					</tr>

					{/* Electrical Parameters */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Voltage (V)</td>
						<td className="px-2 py-1 font-medium">
							{fmt(stats.voltage.avg, 1)} ± {fmt(voltageDev, 1)}
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(stats.voltage.min, 1)}–{fmt(stats.voltage.max, 1)}
						</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Current (A)</td>
						<td className="px-2 py-1 font-medium">
							{fmt(stats.current.avg, 2)} ± {fmt(currentDev, 2)}
						</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(stats.current.min, 2)}–{fmt(stats.current.max, 2)}
						</td>
					</tr>

					{/* Power Analysis */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Active Power (W)</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.power.avg, 0)}</td>
						<td className="px-2 py-1 text-muted-foreground">
							{fmt(stats.power.min, 0)}–{fmt(stats.power.max, 0)}
						</td>
					</tr>

					{/* System Health */}
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Frequency (Hz)</td>
						<td className="px-2 py-1 font-medium">{fmt(stats.frequency.avg, 2)}</td>
						<td className="px-2 py-1 text-muted-foreground">±{fmt(freqDev, 2)}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Phase</td>
						<td className="px-2 py-1 font-medium">{first.phase || "Single"}</td>
						<td className="px-2 py-1 text-muted-foreground">{first.sensor || "Power Meter"}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Meter</td>
						<td className="px-2 py-1 font-medium">{last.enabled ? "Active" : "Inactive"}</td>
						<td className="px-2 py-1 text-muted-foreground">Monitoring: {last.monitoring ? "Yes" : "No"}</td>
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
