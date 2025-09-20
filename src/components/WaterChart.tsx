import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Gauge, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { WaterSensorType } from '@/types/sensor-types';


interface Props {
	messages: WaterSensorType[];
}

export default function WaterChart({ messages }: Props) {
	const chartData = messages
		.map(item => ({
			time: new Date(item.timestamp).toLocaleTimeString('en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			level: item.level,
			capacity: item.capacity,
			percentage: ((item.level / item.capacity) * 100).toFixed(1),
			location: item.location,
			sensor: item.sensor,
			status: item.status,
			enabled: item.enabled,
			alertsEnabled: item.alertsEnabled,
			fullTimestamp: item.timestamp
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime());

	// Calculate stats
	const levels = messages.map(m => m.level);
	const percentages = messages.map(m => (m.level / m.capacity) * 100);

	const levelStats = {
		current: levels[levels.length - 1],
		avg: levels.reduce((a, b) => a + b, 0) / levels.length,
		min: Math.min(...levels),
		max: Math.max(...levels),
		avgPercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length
	};

	const capacity = messages[0]?.capacity || 1000;
	const statusCounts = messages.reduce((acc, m) => {
		acc[m.status] = (acc[m.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'normal': return '#22c55e';
			case 'warning': return '#f59e0b';
			case 'critical': return '#ef4444';
			case 'low': return '#f97316';
			case 'high': return '#8b5cf6';
			default: return '#6b7280';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'normal': return <CheckCircle className="h-4 w-4" />;
			case 'warning': case 'low': case 'high': return <AlertTriangle className="h-4 w-4" />;
			case 'critical': return <XCircle className="h-4 w-4" />;
			default: return <Gauge className="h-4 w-4" />;
		}
	};

	const CustomTooltip = ({ active, payload, label }: {
		active?: boolean;
		payload?: any[];
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-lg min-w-[220px]">
					<p className="font-medium mb-2">{`${data.sensor} - ${data.location}`}</p>
					<div className="space-y-1">
						<p className="flex items-center gap-2">
							<Gauge className="h-4 w-4 text-blue-600" />
							<span className="font-semibold">{data.level} / {data.capacity} units</span>
						</p>
						<p className="text-lg font-bold text-blue-600 ml-6">
							{data.percentage}% filled
						</p>
						<div className="flex items-center gap-2 mt-2">
							{getStatusIcon(data.status)}
							<span className={`font-semibold capitalize`} style={{ color: getStatusColor(data.status) }}>
								{data.status}
							</span>
						</div>
					</div>
					<p className="text-sm text-muted-foreground mt-2">{`Time: ${label}`}</p>
					{!data.enabled && (
						<p className="text-xs text-orange-600 mt-1">⚠️ Sensor Disabled</p>
					)}
					{!data.alertsEnabled && (
						<p className="text-xs text-yellow-600 mt-1">🔕 Alerts Disabled</p>
					)}
				</div>
			);
		}
		return null;
	};

	return (
		<Dialog>
			<DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
				<Gauge className="h-4 w-4 mr-2" />
				View Tank Levels
			</DialogTrigger>
			<DialogContent className="max-w-5xl">
				<DialogTitle className='flex gap-3 items-center'>
					<Gauge className="h-5 w-5 text-blue-500" />
					Tank Level Monitoring - {messages[0]?.location}
				</DialogTitle>

				<div className="h-[400px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis
								dataKey="time"
								className="text-xs fill-muted-foreground"
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis
								className="text-xs fill-muted-foreground"
								label={{ value: 'Level (units)', angle: -90, position: 'insideLeft' }}
								domain={[0, capacity]}
							/>
							<Tooltip content={<CustomTooltip />} />

							{/* Capacity reference line */}
							<ReferenceLine
								y={capacity}
								stroke="#ef4444"
								strokeDasharray="5 5"
								label={{ value: "Max Capacity", position: "insideTopRight" }}
							/>

							{/* Warning levels */}
							<ReferenceLine
								y={capacity * 0.9}
								stroke="#f59e0b"
								strokeDasharray="3 3"
								label={{ value: "90%", position: "insideTopRight" }}
							/>
							<ReferenceLine
								y={capacity * 0.1}
								stroke="#f97316"
								strokeDasharray="3 3"
								label={{ value: "10%", position: "insideTopRight" }}
							/>

							<Area
								type="monotone"
								dataKey="level"
								stroke="#3b82f6"
								strokeWidth={2}
								fill="url(#levelGradient)"
								fillOpacity={0.6}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Stats Summary */}
				<div className="mt-6 space-y-4">
					{/* Current Status */}
					<div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
						<div className="text-center">
							<div className="text-sm text-muted-foreground">Current Level</div>
							<div className="text-xl font-bold text-blue-600">
								{levelStats.current} / {capacity}
							</div>
							<div className="text-sm text-muted-foreground">
								{((levelStats.current / capacity) * 100).toFixed(1)}% filled
							</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-muted-foreground">Current Status</div>
							<div className="flex items-center justify-center gap-2 mt-1">
								{/* {getStatusIcon(messages[messages.length - 1]?.status)} */}
								{/* <span className="font-bold capitalize" style={{ color: getStatusColor(messages[messages.length - 1]?.status) }}> */}
								{/* 	{messages[messages.length - 1]?.status} */}
								{/* </span> */}
							</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-muted-foreground">Sensor Type</div>
							<div className="font-bold">{messages[0]?.sensor}</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-muted-foreground">Monitoring</div>
							<div className="space-y-1">
								<div className="text-xs">
									{messages[messages.length - 1]?.enabled ?
										<span className="text-green-600">✓ Sensor Active</span> :
										<span className="text-red-600">✗ Sensor Inactive</span>
									}
								</div>
								<div className="text-xs">
									{messages[messages.length - 1]?.alertsEnabled ?
										<span className="text-green-600">🔔 Alerts On</span> :
										<span className="text-yellow-600">🔕 Alerts Off</span>
									}
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Level Statistics */}
						<div className="space-y-3">
							<h3 className="flex items-center gap-2 font-semibold text-blue-600">
								<Gauge className="h-4 w-4" />
								Level Statistics
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Average</div>
									<div className="text-lg font-bold text-blue-600">
										{levelStats.avg.toFixed(0)}
									</div>
									<div className="text-xs text-muted-foreground">
										{levelStats.avgPercentage.toFixed(1)}%
									</div>
								</div>
								<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Minimum</div>
									<div className="text-lg font-bold text-green-600">
										{levelStats.min}
									</div>
									<div className="text-xs text-muted-foreground">
										{((levelStats.min / capacity) * 100).toFixed(1)}%
									</div>
								</div>
								<div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Maximum</div>
									<div className="text-lg font-bold text-purple-600">
										{levelStats.max}
									</div>
									<div className="text-xs text-muted-foreground">
										{((levelStats.max / capacity) * 100).toFixed(1)}%
									</div>
								</div>
							</div>
						</div>

						{/* Status Distribution */}
						<div className="space-y-3">
							<h3 className="flex items-center gap-2 font-semibold">
								<AlertTriangle className="h-4 w-4" />
								Status Distribution
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{Object.entries(statusCounts).map(([status, count]) => (
									<div key={status} className="p-3 rounded-lg text-center" style={{ backgroundColor: `${getStatusColor(status)}20` }}>
										<div className="flex items-center justify-center gap-2 mb-1">
											{getStatusIcon(status)}
											<div className="text-sm font-medium capitalize">{status}</div>
										</div>
										<div className="text-lg font-bold" style={{ color: getStatusColor(status) }}>
											{count}
										</div>
										<div className="text-xs text-muted-foreground">
											{((count / messages.length) * 100).toFixed(1)}%
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Overall Stats */}
					<div className="grid grid-cols-4 gap-4 pt-4 border-t">
						<div className="p-3 bg-muted/50 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Total Readings</div>
							<div className="text-lg font-bold">{messages.length}</div>
						</div>
						<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Tank Capacity</div>
							<div className="text-lg font-bold text-blue-600">{capacity}</div>
						</div>
						<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Level Change</div>
							<div className="text-lg font-bold text-green-600">
								{levelStats.current - levels[0] > 0 ? '+' : ''}{levelStats.current - levels[0]}
							</div>
						</div>
						<div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Utilization</div>
							<div className="text-lg font-bold text-purple-600">
								{((levelStats.current / capacity) * 100).toFixed(0)}%
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
