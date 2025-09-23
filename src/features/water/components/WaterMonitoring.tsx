import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from "recharts"
import { Gauge, BarChartIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { WaterSensorType } from "@/types/sensor-types"
import { WaterStatsTable } from "@/features/water/components/WaterStatsTable"
import WaterChart1 from "@/features/water/components/WaterChart1"
import useWaterMonitoring from "../hooks/useWaterMonitoring"


export default function WaterMonitoring() {
	const { messages } = useWaterMonitoring()
	return (
		<Dialog>
			<DialogTrigger className="rounded-md border-1 hover:bg-black hover:text-white p-1 cursor-pointer">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Gauge className="h-5 w-5 text-blue-500" />
					Tank Level Monitoring
					<span className="text-sm font-normal text-gray-500">• {messages[0]?.location}</span>
				</DialogTitle>
				<div className="flex gap-5">
					{/* Chart Section */}
					<div className="flex-1">
						<WaterChart1 messages={messages} />

					</div>
					{/* Stats Table Section */}
					<div className="flex-1">
						<WaterStatsTable messages={messages} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
