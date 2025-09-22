import { Activity, Droplets, Power, Thermometer } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types";
import { formatTime, getStatusColor, getWaterLevelStatus } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, limitToLast, onValue, off, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";
import WaterChart from "./WaterChart";

interface Props {
	waterLevelData: WaterSensorType | null;
}

export default function WaterCard({ waterLevelData }: Props) {
	const [messages, setMessages] = useState<WaterSensorType[]>([])
	useEffect(() => {
		const database = getDatabase(app);
		const messagesRef = ref(database, 'messages');

		const specificTopic = "sensors/waterlevel";
		const messagesQuery = query(
			messagesRef,
			orderByChild('topic'),
			equalTo(specificTopic),
			limitToLast(50)
		);

		const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
			const data = snapshot.val();

			if (data) {
				const messageArray = Object.entries(data).map(([key, value]: any[]) => ({
					id: key,
					...value
				})).sort((a, b) => b.timestamp - a.timestamp);

				let parsedArray: WaterSensorType[] = []
				messageArray.forEach((item) => {
					try {
						const parsed = JSON.parse(item.payload)
						parsedArray.push(parsed)

					} catch (err) {
						console.log("🔥 Parse error for item:", item, err);
					}
				})
				console.log(parsedArray)
				setMessages(parsedArray)
			}
		});


		return () => {
			off(messagesRef, 'value', unsubscribeMessages);
		};
	}, []);
	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<Droplets className="h-5 w-5" />
					Water Level
				</CardTitle>
			</CardHeader>
			<CardContent>
				{waterLevelData ? (
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
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
						<p className="text-sm">No data</p>
					</div>
				)}
			</CardContent>
			<WaterChart
				messages={messages}
			/>
		</Card>

	)
}
