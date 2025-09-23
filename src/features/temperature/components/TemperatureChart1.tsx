import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart, Legend } from "recharts"
import type { TemperatureSensorType } from "@/types/sensor-types"

interface Props {
	messages: TemperatureSensorType[]
}

export default function TemperatureChart1({ messages }: Props) {
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


	return (
		<div className="flex-1 bg-gray-50 w-full dark:bg-gray-900/50 rounded-xl p-6 mb-6">
			<div className="h-[400px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
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
						<Tooltip />
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
						<Legend />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
