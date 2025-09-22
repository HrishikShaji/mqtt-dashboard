import { SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, limitToLast, onValue, off, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";
import WaterChart from "./WaterChart";


export default function WaterVisualization() {
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
		<WaterChart
			messages={messages}
		/>
	)
}
