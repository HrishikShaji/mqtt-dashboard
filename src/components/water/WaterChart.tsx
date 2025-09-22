import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from "recharts"
import { Gauge, AlertTriangle, CheckCircle, XCircle, BarChartIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { WaterSensorType } from "@/types/sensor-types"

interface Props {
	messages: WaterSensorType[]
}

export default function WaterChart({ messages }: Props) {
	const chartData = messages
		.map((item) => ({
			time: new Date(item.timestamp).toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
			level: item.level,
			capacity: item.capacity,
			percentage: ((item.level / item.capacity) * 100).toFixed(1),
			location: item.location,
			sensor: item.sensor,
			status: item.status,
			enabled: item.enabled,
			alertsEnabled: item.alertsEnabled,
			fullTimestamp: item.timestamp,
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime())

	// Calculate stats
	const levels = messages.map((m) => m.level)
	const percentages = messages.map((m) => (m.level / m.capacity) * 100)

	const levelStats = {
		current: levels[levels.length - 1],
		avg: levels.reduce((a, b) => a + b, 0) / levels.length,
		min: Math.min(...levels),
		max: Math.max(...levels),
		avgPercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
	}

	const capacity = messages[0]?.capacity || 1000
	const statusCounts = messages.reduce(
		(acc, m) => {
			acc[m.status] = (acc[m.status] || 0) + 1
			return acc
		},
		{} as Record<string, number>,
	)

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "normal":
				return "#10b981"
			case "warning":
				return "#f59e0b"
			case "critical":
				return "#ef4444"
			case "low":
				return "#f97316"
			case "high":
				return "#8b5cf6"
			default:
				return "#6b7280"
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "normal":
				return <CheckCircle className="h-4 w-4" />
			case "warning":
			case "low":
			case "high":
				return <AlertTriangle className="h-4 w-4" />
			case "critical":
				return <XCircle className="h-4 w-4" />
			default:
				return <Gauge className="h-4 w-4" />
		}
	}

	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean
		payload?: any[]
		label?: string
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg backdrop-blur-sm">
					<p className="font-medium text-gray-900 dark:text-gray-100 mb-3">{`${data.sensor} - ${data.location}`}</p>
					<div className="space-y-2">
						<p className="flex items-center gap-3">
							<Gauge className="h-4 w-4 text-blue-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">
								{data.level} / {data.capacity} units
							</span>
						</p>
						<p className="text-lg font-bold text-blue-500 ml-7">{data.percentage}% filled</p>
						<div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
							{getStatusIcon(data.status)}
							<span className={`font-semibold capitalize`} style={{ color: getStatusColor(data.status) }}>
								{data.status}
							</span>
						</div>
					</div>
					<p className="text-sm text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">{`${label}`}</p>
					{!data.enabled && <p className="text-xs text-orange-500 mt-2">⚠️ Sensor Disabled</p>}
					{!data.alertsEnabled && <p className="text-xs text-yellow-500 mt-1">🔕 Alerts Disabled</p>}
				</div>
			)
		}
		return null
	}

	return (
		<Dialog>
			<DialogTrigger className="rounded-md border-1 hover:bg-black hover:text-white p-1 cursor-pointer">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw]  max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Gauge className="h-5 w-5 text-blue-500" />
					Tank Level Monitoring
					<span className="text-sm font-normal text-gray-500">• {messages[0]?.location}</span>
				</DialogTitle>
				<div className="flex gap-5 ">
					<div className="flex-1 bg-gray-50 w-full dark:bg-gray-900/50 rounded-xl p-6 mb-6">
						<div className="h-[400px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<defs>
										<linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
											<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
									<XAxis
										dataKey="time"
										className="text-xs fill-gray-500"
										angle={-45}
										textAnchor="end"
										height={60}
										stroke="#9ca3af"
									/>
									<YAxis
										className="text-xs fill-gray-500"
										label={{
											value: "Level (units)",
											angle: -90,
											position: "insideLeft",
											style: { textAnchor: "middle", fill: "#6b7280" },
										}}
										domain={[0, capacity]}
										stroke="#9ca3af"
									/>
									<Tooltip content={<CustomTooltip />} />

									<ReferenceLine
										y={capacity}
										stroke="#ef4444"
										strokeDasharray="5 5"
										strokeOpacity={0.7}
										label={{
											value: "Max",
											position: "insideTopRight",
											style: { fill: "#ef4444", fontSize: "10px", fontWeight: "500" },
										}}
									/>
									<ReferenceLine
										y={capacity * 0.9}
										stroke="#f59e0b"
										strokeDasharray="3 3"
										strokeOpacity={0.5}
										label={{
											value: "90%",
											position: "insideTopRight",
											style: { fill: "#f59e0b", fontSize: "10px", fontWeight: "500" },
										}}
									/>
									<ReferenceLine
										y={capacity * 0.1}
										stroke="#f97316"
										strokeDasharray="3 3"
										strokeOpacity={0.5}
										label={{
											value: "10%",
											position: "insideTopRight",
											style: { fill: "#f97316", fontSize: "10px", fontWeight: "500" },
										}}
									/>

									<Area
										type="monotone"
										dataKey="level"
										stroke="#3b82f6"
										strokeWidth={2}
										fill="url(#levelGradient)"
										fillOpacity={1}
									/>
									<Legend />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="space-y-6 flex-1">
						{/* Current Status */}
						<div className="grid grid-cols-4 gap-4">
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
								<div className="text-sm text-gray-500 mb-1">Current Level</div>
								<div className="text-2xl font-bold text-blue-500 mb-1">
									{levelStats.current} / {capacity}
								</div>
								<div className="text-sm text-gray-500">{((levelStats.current / capacity) * 100).toFixed(1)}% filled</div>
							</div>
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
								<div className="text-sm text-gray-500 mb-1">Sensor Type</div>
								<div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{messages[0]?.sensor}</div>
							</div>
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
								<div className="text-sm text-gray-500 mb-1">Monitoring</div>
								<div className="space-y-1">
									<div className="text-xs">
										{messages[messages.length - 1]?.enabled ? (
											<span className="text-green-500 font-medium">✓ Sensor Active</span>
										) : (
											<span className="text-red-500 font-medium">✗ Sensor Inactive</span>
										)}
									</div>
									<div className="text-xs">
										{messages[messages.length - 1]?.alertsEnabled ? (
											<span className="text-green-500 font-medium">🔔 Alerts On</span>
										) : (
											<span className="text-yellow-500 font-medium">🔕 Alerts Off</span>
										)}
									</div>
								</div>
							</div>
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
								<div className="text-sm text-gray-500 mb-1">Total Readings</div>
								<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</div>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-6">
							{/* Level Statistics */}
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
								<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
									<Gauge className="h-4 w-4 text-blue-500" />
									Level Statistics
								</h3>
								<div className="grid grid-cols-3 gap-3">
									<div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
										<div className="text-sm text-gray-500 mb-1">Average</div>
										<div className="text-lg font-bold text-blue-500">{levelStats.avg.toFixed(0)}</div>
										<div className="text-xs text-gray-500">{levelStats.avgPercentage.toFixed(1)}%</div>
									</div>
									<div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
										<div className="text-sm text-gray-500 mb-1">Minimum</div>
										<div className="text-lg font-bold text-green-500">{levelStats.min}</div>
										<div className="text-xs text-gray-500">{((levelStats.min / capacity) * 100).toFixed(1)}%</div>
									</div>
									<div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
										<div className="text-sm text-gray-500 mb-1">Maximum</div>
										<div className="text-lg font-bold text-purple-500">{levelStats.max}</div>
										<div className="text-xs text-gray-500">{((levelStats.max / capacity) * 100).toFixed(1)}%</div>
									</div>
								</div>
							</div>

							{/* Status Distribution */}
							<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
								<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
									<AlertTriangle className="h-4 w-4 text-orange-500" />
									Status Distribution
								</h3>
								<div className="grid grid-cols-2 gap-3">
									{Object.entries(statusCounts).map(([status, count]) => (
										<div key={status} className="p-3 rounded-lg text-center border border-gray-100 dark:border-gray-800">
											<div className="flex items-center justify-center gap-2 mb-2">
												{getStatusIcon(status)}
												<div className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{status}</div>
											</div>
											<div className="text-xl font-bold" style={{ color: getStatusColor(status) }}>
												{count}
											</div>
											<div className="text-xs text-gray-500">{((count / messages.length) * 100).toFixed(1)}%</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

				</div>
			</DialogContent>
		</Dialog>
	)
}
