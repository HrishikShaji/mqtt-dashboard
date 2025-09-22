import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { BarChartIcon, Power } from "lucide-react"
import type { SwitchSensorType } from "@/types/sensor-types"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Props {
	messages: SwitchSensorType[]
}

export default function SwitchChart({ messages }: Props) {
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
					<p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{`${data.device}`}</p>
					<p className={`font-bold text-lg ${data.state === 1 ? "text-green-500" : "text-red-500"}`}>
						{`State: ${data.stateLabel}`}
					</p>
					<p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">{`${label}`}</p>
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
			<DialogContent className="max-w-4xl">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Power className="h-5 w-5 text-green-500" />
					Switch State Monitoring
				</DialogTitle>

				<div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
								<defs>
									<linearGradient id="stateGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
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
									domain={[0, 1]}
									ticks={[0, 1]}
									tickFormatter={(value) => (value === 1 ? "ON" : "OFF")}
									className="text-xs fill-gray-500"
									stroke="#9ca3af"
								/>
								<Tooltip content={<CustomTooltip />} />

								<ReferenceLine
									y={1}
									stroke="#10b981"
									strokeDasharray="3 3"
									strokeOpacity={0.5}
									label={{
										value: "ON",
										position: "insideTopRight",
										style: { fill: "#10b981", fontSize: "10px", fontWeight: "500" },
									}}
								/>
								<ReferenceLine
									y={0}
									stroke="#ef4444"
									strokeDasharray="3 3"
									strokeOpacity={0.5}
									label={{
										value: "OFF",
										position: "insideBottomRight",
										style: { fill: "#ef4444", fontSize: "10px", fontWeight: "500" },
									}}
								/>

								<Area
									type="stepAfter"
									dataKey="state"
									stroke="#10b981"
									strokeWidth={2}
									fill="url(#stateGradient)"
									fillOpacity={1}
								/>

								<text x="20" y="40" fill="#10b981" fontSize="11" fontWeight="500">
									Switch State
								</text>
								<rect x="20" y="45" width="20" height="8" fill="#10b981" fillOpacity="0.3" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
						<div className="text-sm text-gray-500 mb-1">Total Events</div>
						<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</div>
					</div>
					<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
						<div className="text-sm text-gray-500 mb-1">ON Events</div>
						<div className="text-2xl font-bold text-green-500">{messages.filter((m) => m.state).length}</div>
					</div>
					<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
						<div className="text-sm text-gray-500 mb-1">OFF Events</div>
						<div className="text-2xl font-bold text-red-500">{messages.filter((m) => !m.state).length}</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
