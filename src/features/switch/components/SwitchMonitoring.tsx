import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { BarChartIcon, Power } from "lucide-react"
import type { SwitchSensorType } from "@/types/sensor-types"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import useSwitchMonitoring from "../hooks/useSwitchMonitoring"
import SwitchChart1 from "./SwitchChart1"
import SwitchStatsTable from "./SwitchStatsTable"

export default function SwitchMonitoring() {
	const { messages } = useSwitchMonitoring()

	return (
		<Dialog>
			<DialogTrigger className="cursor-pointer hover:text-blue-500">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw]  max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Power className="h-5 w-5 text-green-500" />
					Switch State Monitoring
				</DialogTitle>
				<div className="flex gap-5">
					<div className="flex-1">
						<SwitchChart1 messages={messages} />
					</div>
					<div className="flex-1">
						<SwitchStatsTable messages={messages} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

