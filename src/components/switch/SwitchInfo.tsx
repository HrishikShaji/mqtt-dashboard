import { Power } from "lucide-react"
import { Badge } from "../ui/badge"
import type { SwitchSensorType } from "@/types/sensor-types"
import { formatTime, getStatusColor } from "@/lib/utils"
import { Separator } from "../ui/separator"

interface Props {
	switchData: SwitchSensorType | null
}

export default function SwitchInfo({ switchData }: Props) {
	if (!switchData) {
		return (
			<div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
				<Power className="h-8 w-8 mb-2 animate-pulse" />
				<p className="text-sm">No data</p>
			</div>
		)
	}

	return (
		<div className="h-[200px] flex flex-col justify-between space-y-4">
			<div className="flex items-center justify-center">
				<Power className="h-6 w-6 text-blue-500" />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center space-y-3">
				<div className={`text-4xl font-bold ${getStatusColor(switchData.state ? 1 : 0, "switch")}`}>
					{switchData.state ? "ON" : "OFF"}
				</div>
				<Badge variant="outline" className="text-xs">
					{switchData.device}
				</Badge>
			</div>

			<Separator />

			<div className="text-xs text-muted-foreground text-center space-y-1">
				<div>Device: {switchData.device}</div>
				<div>{formatTime(switchData.timestamp)}</div>
			</div>
		</div>
	)
}
