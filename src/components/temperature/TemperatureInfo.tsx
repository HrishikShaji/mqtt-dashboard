import { Activity, Power, Thermometer } from "lucide-react";
import { SwitchSensorType, TemperatureSensorType } from "@/types/sensor-types";
import { formatTime, getStatusColor } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface Props {
	temperatureData: TemperatureSensorType | null;
}

export default function TemperatureInfo({ temperatureData }: Props) {

	if (!temperatureData) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
				<p className="text-sm">No data</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="text-center">
				<div
					className={`text-3xl font-bold ${getStatusColor(temperatureData.temperature, "temperature")}`}
				>
					{temperatureData.temperature}°C
				</div>
				<div className="text-sm text-muted-foreground mt-1">Humidity: {temperatureData.humidity}%</div>
			</div>
			<Separator />
			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div>{temperatureData.location}</div>
				<div>{formatTime(temperatureData.timestamp)}</div>
			</div>
		</div>
	)
}
