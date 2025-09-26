import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from "recharts"
import type { WaterSensorType } from "@/types/sensor-types"

interface Props {
	messages: WaterSensorType[]
}

export default function WaterChart1({ messages }: Props) {
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

	const capacity = messages[0]?.capacity || 1000

	return (
		<div className="bg-neutral-900 w-full dark:bg-gray-900/50 rounded-xl p-6">
			<div className="h-[400px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
						{/* <defs> */}
						{/* 	<linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1"> */}
						{/* 		<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /> */}
						{/* 		<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} /> */}
						{/* 	</linearGradient> */}
						{/* </defs> */}
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
						<Tooltip />

						{/* Reference Lines */}
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
	)
}
