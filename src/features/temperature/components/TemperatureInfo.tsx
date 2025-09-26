import { Activity, Thermometer } from "lucide-react"
import type { TemperatureSensorType } from "@/types/sensor-types"
import { formatTime, getStatusColor } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface Props {
	temperatureData: TemperatureSensorType | null
}

export default function TemperatureInfo({ temperatureData }: Props) {
	if (!temperatureData) {
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
				<Thermometer className="h-6 w-6 text-white" />
			</div>

			<div className="flex-1 flex flex-col justify-center space-y-2">
				<div className="text-center">
					<div className={`text-3xl font-bold ${getStatusColor(temperatureData.temperature, "temperature")}`}>
						{temperatureData.temperature}°C
					</div>
					<div className="text-sm text-muted-foreground mt-1">Humidity: {temperatureData.humidity}%</div>
				</div>
			</div>

			<Separator />

			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div>{temperatureData.location}</div>
				<div>{formatTime(temperatureData.timestamp)}</div>
			</div>
		</div>
	)
}
