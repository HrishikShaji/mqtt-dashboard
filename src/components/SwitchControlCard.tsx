import { Activity, Power } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SwitchSensorType } from "@/types/sensor-types";
import { formatTime } from "@/lib/utils";

interface Props {
	switchData: SwitchSensorType;
}

export default function SwitchControlCard({ switchData }: Props) {
	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<Power className="h-5 w-5" />
					Switch Control
				</CardTitle>
			</CardHeader>
			<CardContent>
				{switchData ? (
					<div className="space-y-4">
						<div className="text-center">
							<div
								className={`text-3xl font-bold ${switchData.state ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
							>
								{switchData.state ? "ON" : "OFF"}
							</div>
							<Badge variant="outline" className="mt-2">
								{switchData.device}
							</Badge>
						</div>
						<div className="text-xs text-muted-foreground text-center">{formatTime(switchData.timestamp)}</div>
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
						<p className="text-sm">No data</p>
					</div>
				)}
			</CardContent>
		</Card>

	)
}
