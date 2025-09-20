import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart, ReferenceLine } from 'recharts';
import { Thermometer, Droplets } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { TemperatureSensorType } from '@/types/sensor-types';


interface Props {
	messages: TemperatureSensorType[];
}

export default function TemperatureChart({ messages }: Props) {
	const chartData = messages
		.map(item => ({
			time: new Date(item.timestamp).toLocaleTimeString('en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			temperature: item.temperature,
			humidity: item.humidity,
			location: item.location,
			sensor: item.sensor,
			enabled: item.enabled,
			fullTimestamp: item.timestamp
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime());

	// Calculate stats
	const temperatures = messages.map(m => m.temperature);
	const humidities = messages.map(m => m.humidity);

	const tempStats = {
		avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
		min: Math.min(...temperatures),
		max: Math.max(...temperatures)
	};

	const humidityStats = {
		avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
		min: Math.min(...humidities),
		max: Math.max(...humidities)
	};

	const CustomTooltip = ({ active, payload, label }: {
		active?: boolean;
		payload?: any[];
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
					<p className="font-medium mb-2">{`${data.sensor} - ${data.location}`}</p>
					<div className="space-y-1">
						<p className="flex items-center gap-2 text-red-600">
							<Thermometer className="h-4 w-4" />
							<span className="font-semibold">{data.temperature.toFixed(1)}°C</span>
						</p>
						<p className="flex items-center gap-2 text-blue-600">
							<Droplets className="h-4 w-4" />
							<span className="font-semibold">{data.humidity}%</span>
						</p>
					</div>
					<p className="text-sm text-muted-foreground mt-2">{`Time: ${label}`}</p>
					{!data.enabled && (
						<p className="text-xs text-orange-600 mt-1">⚠️ Sensor Disabled</p>
					)}
				</div>
			);
		}
		return null;
	};

	return (
		<Dialog>
			<DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
				<Thermometer className="h-4 w-4 mr-2" />
				View Chart
			</DialogTrigger>
			<DialogContent className="max-w-4xl">
				<DialogTitle className='flex gap-3 items-center'>
					<Thermometer className="h-5 w-5 text-red-500" />
					<Droplets className="h-5 w-5 text-blue-500" />
					Temperature & Humidity Over Time
				</DialogTitle>

				<div className="h-[400px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
								yAxisId="temperature"
								orientation="left"
								className="text-xs fill-muted-foreground"
								label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
							/>
							<YAxis
								yAxisId="humidity"
								orientation="right"
								className="text-xs fill-muted-foreground"
								label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Area
								yAxisId="temperature"
								type="monotone"
								dataKey="temperature"
								stroke="#ef4444"
								strokeWidth={2}
								fill="url(#temperatureGradient)"
								fillOpacity={0.3}
							/>
							<Line
								yAxisId="humidity"
								type="monotone"
								dataKey="humidity"
								stroke="#3b82f6"
								strokeWidth={2}
								dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Stats Summary */}
				<div className="mt-6 space-y-4">
					<div className="grid grid-cols-2 gap-6">
						{/* Temperature Stats */}
						<div className="space-y-3">
							<h3 className="flex items-center gap-2 font-semibold text-red-600">
								<Thermometer className="h-4 w-4" />
								Temperature Statistics
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Average</div>
									<div className="text-lg font-bold text-red-600">
										{tempStats.avg.toFixed(1)}°C
									</div>
								</div>
								<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Min</div>
									<div className="text-lg font-bold text-blue-600">
										{tempStats.min.toFixed(1)}°C
									</div>
								</div>
								<div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Max</div>
									<div className="text-lg font-bold text-orange-600">
										{tempStats.max.toFixed(1)}°C
									</div>
								</div>
							</div>
						</div>

						{/* Humidity Stats */}
						<div className="space-y-3">
							<h3 className="flex items-center gap-2 font-semibold text-blue-600">
								<Droplets className="h-4 w-4" />
								Humidity Statistics
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Average</div>
									<div className="text-lg font-bold text-blue-600">
										{humidityStats.avg.toFixed(1)}%
									</div>
								</div>
								<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Min</div>
									<div className="text-lg font-bold text-green-600">
										{humidityStats.min}%
									</div>
								</div>
								<div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
									<div className="text-sm text-muted-foreground">Max</div>
									<div className="text-lg font-bold text-purple-600">
										{humidityStats.max}%
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Overall Stats */}
					<div className="grid grid-cols-4 gap-4 pt-4 border-t">
						<div className="p-3 bg-muted/50 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Total Readings</div>
							<div className="text-lg font-bold">{messages.length}</div>
						</div>
						<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Active Sensors</div>
							<div className="text-lg font-bold text-green-600">
								{messages.filter(m => m.enabled).length}
							</div>
						</div>
						<div className="p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Location</div>
							<div className="text-sm font-bold">
								{messages[0]?.location || 'Unknown'}
							</div>
						</div>
						<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
							<div className="text-sm text-muted-foreground">Sensor Type</div>
							<div className="text-sm font-bold">
								{messages[0]?.sensor || 'Unknown'}
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
