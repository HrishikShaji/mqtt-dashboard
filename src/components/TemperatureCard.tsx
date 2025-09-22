import { Activity, Power, Thermometer } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SwitchSensorType, TemperatureSensorType } from "@/types/sensor-types";
import { formatTime, getStatusColor } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, limitToLast, onValue, off, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";
import { useSidebar } from "./ui/sidebar";
import TemperatureChart from "./TemperatureChart";

interface Props {
	temperatureData: TemperatureSensorType | null;
}

export default function TemperatureCard({ temperatureData }: Props) {
	const [messages, setMessages] = useState<TemperatureSensorType[]>([])
	useEffect(() => {
		const database = getDatabase(app);
		const messagesRef = ref(database, 'messages');

		const specificTopic = "sensors/temperature";
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

				let parsedArray: TemperatureSensorType[] = []
				messageArray.forEach((item) => {
					try {
						const parsed = JSON.parse(item.payload)
						parsedArray.push(parsed)

					} catch (err) {
						console.log("🔥 Parse error for item:", item, err);
					}
				})
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
					<Thermometer className="h-5 w-5" />
					Temperature
				</CardTitle>
			</CardHeader>
			<CardContent>
				{temperatureData ? (
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
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
						<p className="text-sm">No data</p>
					</div>
				)}
			</CardContent>
			<TemperatureChart messages={messages} />
		</Card>

	)
}
