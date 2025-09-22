import { Activity, Droplets, Power, Thermometer } from "lucide-react";
import { SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types";
import { formatTime, getStatusColor, getWaterLevelStatus } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge"

interface Props {
	waterLevelData: WaterSensorType | null;
}

export default function WaterInfo({ waterLevelData }: Props) {
	if (!waterLevelData) {
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
				<div className={`text-3xl font-bold ${getStatusColor(waterLevelData.level, "waterLevel")}`}>
					{waterLevelData.level}%
				</div>
				<Progress value={waterLevelData.level} className="mt-3" />
			</div>
			<Separator />
			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div className="flex items-center justify-center gap-2">
					<Badge {...getWaterLevelStatus(waterLevelData.level)}>
						{getWaterLevelStatus(waterLevelData.level).text}
					</Badge>
				</div>
				<div>Capacity: {waterLevelData.capacity}L</div>
				<div>{formatTime(waterLevelData.timestamp)}</div>
			</div>
		</div>
	)
}
