
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import type { SwitchSensorType } from "@/types/sensor-types"

interface Props {
	messages: SwitchSensorType[]
}

export default function SwitchChart1({ messages }: Props) {
	const chartData = messages
		.map((item) => ({
			time: new Date(item.timestamp).toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
			state: item.state ? 1 : 0,
			stateLabel: item.state ? "ON" : "OFF",
			device: item.device,
			fullTimestamp: item.timestamp,
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime())


	return (
		<div className=" rounded-xl bg-neutral-900 p-6 mb-6">
			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
							domain={[0, 1]}
							ticks={[0, 1]}
							tickFormatter={(value) => (value === 1 ? "ON" : "OFF")}
							className="text-xs fill-gray-500"
							stroke="#9ca3af"
						/>
						<Tooltip />

						<ReferenceLine
							y={1}
							stroke="#10b981"
							strokeDasharray="3 3"
							strokeOpacity={0.5}
						/>
						<ReferenceLine
							y={0}
							stroke="#ef4444"
							strokeDasharray="3 3"
							strokeOpacity={0.5}
						/>

						<Area
							type="stepAfter"
							dataKey="state"
							stroke="#10b981"
							strokeWidth={2}
							fill="url(#stateGradient)"
							fillOpacity={1}
						/>

					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
