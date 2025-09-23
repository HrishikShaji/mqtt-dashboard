import { SwitchSensorType } from "@/types/sensor-types";
import { useEffect, useState } from "react";
import { equalTo, getDatabase, off, limitToLast, onValue, orderByChild, query, ref } from "firebase/database";
import app from "@/lib/firebase";


export default function useSwitchMonitoring() {
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

	return { messages }
}
