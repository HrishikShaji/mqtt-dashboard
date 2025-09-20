"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff } from "lucide-react"
import { PowerSensorType, SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types"
import SwitchControlCard from "./SwitchControlCard"
import TemperatureCard from "./TemperatureCard"
import WaterCard from "./WaterCard"
import PowerCard from "./PowerCard"
import { formatTime } from "@/lib/utils"

export default function Dashboard() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	// Sensor data states
	const [switchData, setSwitchData] = useState<SwitchSensorType | null>(null)
	const [temperatureData, setTemperatureData] = useState<TemperatureSensorType | null>(null)
	const [waterLevelData, setWaterLevelData] = useState<WaterSensorType | null>(null)
	const [powerData, setPowerData] = useState<PowerSensorType | null>(null)
	const [messageHistory, setMessageHistory] = useState([])

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

				// Add to message history
				setMessageHistory((prev) => [
					{
						id: Date.now() + Math.random(),
						topic,
						data,
						receivedAt: new Date().toISOString(),
					},
					...prev.slice(0, 19), // Keep only last 20 messages
				])
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

				{/* Real-time Message Feed */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="h-5 w-5" />
							Real-time Data Feed
						</CardTitle>
						<CardDescription>Receiving data from IoT Control Center...</CardDescription>
					</CardHeader>
					<CardContent>
						{messageHistory.length > 0 ? (
							<ScrollArea className="h-96 w-full">
								<div className="space-y-3">
									{messageHistory.map((msg) => (
										<Card key={msg.id} className="bg-muted/50">
											<CardContent className="pt-4">
												<div className="flex justify-between items-start mb-2">
													<Badge variant="outline" className="text-xs">
														{msg.topic}
													</Badge>
													<span className="text-xs text-muted-foreground">{formatTime(msg.receivedAt)}</span>
												</div>
												<div className="text-sm text-muted-foreground">
													{msg.topic === "switch/state" &&
														`State: ${msg.data.state ? "ON" : "OFF"}, Device: ${msg.data.device}`}
													{msg.topic === "sensors/temperature" &&
														`Temp: ${msg.data.temperature}°C, Humidity: ${msg.data.humidity}%, Location: ${msg.data.location}`}
													{msg.topic === "sensors/waterlevel" &&
														`Level: ${msg.data.level}%, Status: ${msg.data.status}, Location: ${msg.data.location}`}
													{msg.topic === "sensors/power" &&
														`Power: ${msg.data.power}W, Voltage: ${msg.data.voltage}V, Current: ${msg.data.current}A`}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</ScrollArea>
						) : (
							<div className="text-center py-12 text-muted-foreground">
								<Activity className="h-12 w-12 mx-auto mb-4 animate-pulse" />
								<p className="text-lg">Waiting for sensor data...</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
