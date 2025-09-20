"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff } from "lucide-react"
import { PowerSensorType, SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types"
import SwitchControlCard from "./SwitchControlCard"
import TemperatureCard from "./TemperatureCard"
import WaterCard from "./WaterCard"
import PowerCard from "./PowerCard"
import { ref, onValue, off, query, orderByChild, limitToLast, getDatabase } from 'firebase/database';
import app from '@/lib/firebase';

export default function Dashboard() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	// Sensor data states
	const [switchData, setSwitchData] = useState<SwitchSensorType | null>(null)
	const [temperatureData, setTemperatureData] = useState<TemperatureSensorType | null>(null)
	const [waterLevelData, setWaterLevelData] = useState<WaterSensorType | null>(null)
	const [powerData, setPowerData] = useState<PowerSensorType | null>(null)
	const [messages, setMessages] = useState([]);
	const [topicData, setTopicData] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect("ws://localhost:8883")

		mqttClient.on("connect", () => {
			console.log("Dashboard connected to MQTT broker")
			setIsConnected(true)
			setConnectionStatus("Connected")
			setClient(mqttClient)

			// Subscribe to all sensor topics
			const topics = ["switch/state", "sensors/temperature", "sensors/waterlevel", "sensors/power"]
			topics.forEach((topic) => {
				mqttClient.subscribe(topic, (err) => {
					if (err) {
						console.error(`Subscription error for ${topic}:`, err)
					} else {
						console.log(`Subscribed to ${topic} topic`)
					}
				})
			})
		})

		mqttClient.on("message", (topic, message) => {
			try {
				const data = JSON.parse(message.toString())
				console.log("Received message:", { topic, data })

				// Route messages to appropriate state
				switch (topic) {
					case "switch/state":
						setSwitchData(data)
						break
					case "sensors/temperature":
						setTemperatureData(data)
						break
					case "sensors/waterlevel":
						setWaterLevelData(data)
						break
					case "sensors/power":
						setPowerData(data)
						break
				}

			} catch (error) {
				console.error("Error parsing message:", error)
			}
		})

		mqttClient.on("error", (err) => {
			console.error("MQTT connection error:", err)
			setConnectionStatus(`Error: ${err.message}`)
		})

		mqttClient.on("offline", () => {
			setIsConnected(false)
			setConnectionStatus("Offline")
		})

		mqttClient.on("reconnect", () => {
			setConnectionStatus("Reconnecting...")
		})

		return () => {
			if (mqttClient) {
				mqttClient.end()
			}
		}
	}, [])


	useEffect(() => {
		// Listen to latest 50 messages
		const database = getDatabase(app);
		const messagesRef = ref(database, 'messages');
		const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

		const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const messageArray = Object.entries(data).map(([key, value]: any[]) => ({
					id: key,
					...value
				})).sort((a, b) => b.timestamp - a.timestamp);
				setMessages(messageArray);
			}
			setLoading(false);
		});

		// Listen to topics for latest values
		const topicsRef = ref(database, 'topics');
		const unsubscribeTopics = onValue(topicsRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				setTopicData(data);
			}
		});

		return () => {
			off(messagesRef, 'value', unsubscribeMessages);
			off(topicsRef, 'value', unsubscribeTopics);
		};
	}, []);

	return (
		<div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight text-balance">IoT Monitoring Dashboard</h1>
					<p className="text-muted-foreground text-lg">Real-time sensor data and system monitoring</p>
				</div>

				{/* Connection Status */}
				<Card className="border-2">
					<CardContent className="pt-6">
						<div className="flex items-center justify-center gap-3">
							{isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
							<Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-3 py-1">
								{connectionStatus}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Sensor Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Switch Control Card */}
					{switchData &&
						<SwitchControlCard switchData={switchData} />}
					{/* Temperature Card */}
					{temperatureData &&
						<TemperatureCard temperatureData={temperatureData} />}
					{/* Water Level Card */}
					{waterLevelData &&
						<WaterCard waterLevelData={waterLevelData} />}
					{/* Power Monitoring Card */}
					{powerData &&
						<PowerCard powerData={powerData} />}
				</div>

			</div>
		</div>
	)
}
