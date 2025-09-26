import { Activity, Droplets } from "lucide-react"
import type { WaterSensorType } from "@/types/sensor-types"
import { formatTime, getStatusColor, getWaterLevelStatus } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Props {
	waterLevelData: WaterSensorType | null
}

export default function WaterInfo({ waterLevelData }: Props) {
	if (!waterLevelData) {
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
				<Droplets className="h-6 w-6 text-white" />
			</div>

			<div className="flex-1 flex flex-col justify-center space-y-3">
				<div className="text-center">
					<div className={`text-3xl font-bold ${getStatusColor(waterLevelData.level, "waterLevel")}`}>
						{waterLevelData.level}%
					</div>
					<Progress value={waterLevelData.level} className="mt-2" />
				</div>
				<div className="flex items-center justify-center">
					<Badge {...getWaterLevelStatus(waterLevelData.level)}>{getWaterLevelStatus(waterLevelData.level).text}</Badge>
				</div>
			</div>

			<Separator />

			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div>Capacity: {waterLevelData.capacity}L</div>
				<div>{formatTime(waterLevelData.timestamp)}</div>
			</div>
		</div>
	)
}
