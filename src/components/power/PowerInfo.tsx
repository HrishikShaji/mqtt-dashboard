import { Activity, Zap } from "lucide-react"
import type { PowerSensorType } from "@/types/sensor-types"
import { formatTime, getStatusColor } from "@/lib/utils"
import { Separator } from "../ui/separator"

interface Props {
	powerData: PowerSensorType | null
}

export default function PowerInfo({ powerData }: Props) {
	if (!powerData) {
		return (
			<div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
				<Activity className="h-8 w-8 mb-2 animate-pulse" />
				<p className="text-sm">No data</p>
			</div>
		)
	}

	return (
		<div className="h-[200px] flex flex-col justify-between space-y-4">
			<div className="flex items-center justify-center">
				<Zap className="h-6 w-6 text-yellow-500" />
			</div>

			<div className="flex-1 space-y-3">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Voltage:</span>
						<span className={getStatusColor(powerData.voltage, "power")}>{powerData.voltage}V</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Current:</span>
						<span className={getStatusColor(powerData.current, "power")}>{powerData.current}A</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Power:</span>
						<span className={getStatusColor(powerData.power, "power")}>{powerData.power}W</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Frequency:</span>
						<span className="text-blue-600 dark:text-blue-400">{powerData.frequency}Hz</span>
					</div>
				</div>
			</div>

			<Separator />

			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div>PF: {powerData.powerFactor}</div>
				<div>{formatTime(powerData.timestamp)}</div>
			</div>
		</div>
	)
}
