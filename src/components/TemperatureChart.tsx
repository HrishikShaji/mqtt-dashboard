import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts"
import { Thermometer, Droplets } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { TemperatureSensorType } from "@/types/sensor-types"

interface Props {
	messages: TemperatureSensorType[]
}

export default function TemperatureChart({ messages }: Props) {
	const chartData = messages
		.map((item) => ({
			time: new Date(item.timestamp).toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
			temperature: item.temperature,
			humidity: item.humidity,
			location: item.location,
			sensor: item.sensor,
			enabled: item.enabled,
			fullTimestamp: item.timestamp,
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime())

	// Calculate stats
	const temperatures = messages.map((m) => m.temperature)
	const humidities = messages.map((m) => m.humidity)

	const tempStats = {
		avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
		min: Math.min(...temperatures),
		max: Math.max(...temperatures),
	}

	const humidityStats = {
		avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
		min: Math.min(...humidities),
		max: Math.max(...humidities),
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
							<Thermometer className="h-4 w-4 text-red-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">{data.temperature.toFixed(1)}°C</span>
						</p>
						<p className="flex items-center gap-3">
							<Droplets className="h-4 w-4 text-blue-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">{data.humidity}%</span>
						</p>
					</div>
					<p className="text-sm text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">{`${label}`}</p>
					{!data.enabled && <p className="text-xs text-orange-500 mt-2">⚠️ Sensor Disabled</p>}
				</div>
			)
		}
		return null
	}

	return (
		<Dialog>
			<DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 shadow-sm">
				<Thermometer className="h-4 w-4" />
				View Chart
			</DialogTrigger>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Thermometer className="h-5 w-5 text-red-500" />
					<Droplets className="h-5 w-5 text-blue-500" />
					Temperature & Humidity Monitoring
				</DialogTitle>

				<div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
					<div className="h-[400px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
								<defs>
									<linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
									</linearGradient>
									<linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
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
									yAxisId="temperature"
									orientation="left"
									className="text-xs fill-gray-500"
									label={{
										value: "°C",
										angle: -90,
										position: "insideLeft",
										style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
									}}
									stroke="#9ca3af"
								/>
								<YAxis
									yAxisId="humidity"
									orientation="right"
									className="text-xs fill-gray-500"
									label={{
										value: "%",
										angle: 90,
										position: "insideRight",
										style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
									}}
									stroke="#9ca3af"
								/>
								<Tooltip content={<CustomTooltip />} />
								<Area
									yAxisId="temperature"
									type="monotone"
									dataKey="temperature"
									stroke="#ef4444"
									strokeWidth={2}
									fill="url(#temperatureGradient)"
									fillOpacity={1}
								/>
								<Line
									yAxisId="humidity"
									type="monotone"
									dataKey="humidity"
									stroke="#3b82f6"
									strokeWidth={2}
									dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
								/>
								<text x="20" y="40" fill="#ef4444" fontSize="11" fontWeight="500">
									Temperature
								</text>
								<line x1="20" y1="50" x2="40" y2="50" stroke="#ef4444" strokeWidth="2" />

								<text x="20" y="70" fill="#3b82f6" fontSize="11" fontWeight="500">
									Humidity
								</text>
								<line x1="20" y1="80" x2="40" y2="80" stroke="#3b82f6" strokeWidth="2" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="space-y-6">
					<div className="grid grid-cols-2 gap-6">
						{/* Temperature Stats */}
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
							<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
								<Thermometer className="h-4 w-4 text-red-500" />
								Temperature Statistics
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Average</div>
									<div className="text-lg font-bold text-red-500">{tempStats.avg.toFixed(1)}°C</div>
								</div>
								<div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Min</div>
									<div className="text-lg font-bold text-blue-500">{tempStats.min.toFixed(1)}°C</div>
								</div>
								<div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Max</div>
									<div className="text-lg font-bold text-orange-500">{tempStats.max.toFixed(1)}°C</div>
								</div>
							</div>
						</div>

						{/* Humidity Stats */}
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
							<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
								<Droplets className="h-4 w-4 text-blue-500" />
								Humidity Statistics
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Average</div>
									<div className="text-lg font-bold text-blue-500">{humidityStats.avg.toFixed(1)}%</div>
								</div>
								<div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Min</div>
									<div className="text-lg font-bold text-green-500">{humidityStats.min}%</div>
								</div>
								<div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Max</div>
									<div className="text-lg font-bold text-purple-500">{humidityStats.max}%</div>
								</div>
							</div>
						</div>
					</div>

					{/* Overall Stats */}
					<div className="grid grid-cols-4 gap-4">
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Total Readings</div>
							<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Active Sensors</div>
							<div className="text-2xl font-bold text-green-500">{messages.filter((m) => m.enabled).length}</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Location</div>
							<div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								{messages[0]?.location || "Unknown"}
							</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Sensor Type</div>
							<div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								{messages[0]?.sensor || "Unknown"}
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
