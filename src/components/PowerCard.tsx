import { Activity, Power, Thermometer, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PowerSensorType, SwitchSensorType, TemperatureSensorType } from "@/types/sensor-types";
import { formatTime, getStatusColor } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, limitToLast, onValue, off, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";
import PowerChart from "./PowerChart";

interface Props {
	powerData: PowerSensorType;
}

export default function PowerCard({ powerData }: Props) {
	const [messages, setMessages] = useState<PowerSensorType[]>([])
	useEffect(() => {
		const database = getDatabase(app);
		const messagesRef = ref(database, 'messages');

		const specificTopic = "sensors/power";
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

				let parsedArray: PowerSensorType[] = []
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
					<Zap className="h-5 w-5" />
					Power Monitor
				</CardTitle>
			</CardHeader>
			<CardContent>
				{powerData ? (
					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-2 text-sm">
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
								<span className="text-purple-600 dark:text-purple-400">{powerData.frequency}Hz</span>
							</div>
						</div>
						<Separator />
						<div className="text-xs text-muted-foreground text-center space-y-1">
							<div>PF: {powerData.powerFactor}</div>
							<div>{formatTime(powerData.timestamp)}</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
						<p className="text-sm">No data</p>
					</div>
				)}

				<PowerChart messages={messages} />
			</CardContent>
		</Card>

	)
}
