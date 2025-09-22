import { Activity, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SwitchSensorType } from "@/types/sensor-types";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, off, limitToLast, onValue, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";
import SwitchChart from "./SwitchChart";


export default function SwitchVisualization() {
	const [messages, setMessages] = useState<SwitchSensorType[]>([])
	useEffect(() => {
		const database = getDatabase(app);
		const messagesRef = ref(database, 'messages');

		const specificTopic = "switch/state";
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

				let parsedArray: SwitchSensorType[] = []
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
		<SwitchChart messages={messages} />
	)
}
