"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff } from "lucide-react"

export default function Dashboard() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	// Sensor data states
	const [switchData, setSwitchData] = useState(null)
	const [temperatureData, setTemperatureData] = useState(null)
	const [waterLevelData, setWaterLevelData] = useState(null)
	const [powerData, setPowerData] = useState(null)
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

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString()
	}

	const getStatusColor = (value, type) => {
		switch (type) {
			case "temperature":
				if (value < 20) return "text-blue-600 dark:text-blue-400"
				if (value > 30) return "text-red-600 dark:text-red-400"
				return "text-green-600 dark:text-green-400"
			case "waterLevel":
				if (value < 20) return "text-red-600 dark:text-red-400"
				if (value < 50) return "text-yellow-600 dark:text-yellow-400"
				return "text-green-600 dark:text-green-400"
			case "power":
				return "text-purple-600 dark:text-purple-400"
			default:
				return "text-muted-foreground"
		}
	}

	const getWaterLevelStatus = (level) => {
		if (level < 20) return { text: "Critical", variant: "destructive" as const }
		if (level < 50) return { text: "Low", variant: "secondary" as const }
		return { text: "Normal", variant: "default" as const }
	}

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

					{/* Temperature Card */}
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
											className={`text-3xl font-bold ${getStatusColor(Number.parseFloat(temperatureData.temperature), "temperature")}`}
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
					</Card>

					{/* Water Level Card */}
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
					</Card>

					{/* Power Monitoring Card */}
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
						</CardContent>
					</Card>
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
