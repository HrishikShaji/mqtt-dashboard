import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart, Legend } from "recharts"
import { Thermometer, Droplets, BarChartIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { TemperatureSensorType } from "@/types/sensor-types"
import useTemperatureMonitoring from "../hooks/useTemperatureMonitoring"
import TemperatureChart1 from "./TemperatureChart1"
import { TemperatureStatsTable } from "./TemperatureStatsTable"


export default function TemperatureMonitoring() {

	const { messages } = useTemperatureMonitoring()

	return (
		<Dialog>
			<DialogTrigger className="cursor-pointer hover:text-blue-500">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw]  max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Thermometer className="h-5 w-5 text-red-500" />
					<Droplets className="h-5 w-5 text-blue-500" />
					Temperature & Humidity Monitoring
				</DialogTitle>
				<div className="flex gap-5">

					<TemperatureChart1 messages={messages} />
					<div className="flex-1">
						<TemperatureStatsTable messages={messages} />

					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
