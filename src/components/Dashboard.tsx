"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff } from "lucide-react"
import { PowerSensorType, SwitchSensorType, TemperatureSensorType, WaterSensorType } from "@/types/sensor-types"
import SensorCard from "./SensorCard"
import SwitchInfo from "./switch/SwitchInfo"
import SwitchVisualization from "./switch/SwitchVisualization"
import TemperatureInfo from "./temperature/TemperatureInfo"
import TemperatureVisualization from "./temperature/TemperatureVisualization"
import WaterInfo from "./water/WaterInfo"
import WaterVisualization from "./water/WaterVisualization"
import PowerInfo from "./power/PowerInfo"
import PowerVisualization from "./power/PowerVisualization"

export default function Dashboard() {
	const [isConnected, setIsConnected] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	const [switchData, setSwitchData] = useState<SwitchSensorType | null>(null)
	const [temperatureData, setTemperatureData] = useState<TemperatureSensorType | null>(null)
	const [waterLevelData, setWaterLevelData] = useState<WaterSensorType | null>(null)
	const [powerData, setPowerData] = useState<PowerSensorType | null>(null)

	useEffect(() => {
		const mqttClient = mqtt.connect("ws://localhost:8883")

		mqttClient.on("connect", () => {
			console.log("Dashboard connected to MQTT broker")
			setIsConnected(true)
			setConnectionStatus("Connected")

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

	return (
		<div className="min-h-screen  bg-background p-4 md:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2 w-full flex justify-between items-center">
					<h1 className="text-4xl font-bold tracking-tight text-balance">IoT Monitoring Dashboard</h1>
					{isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<SensorCard
						title="Switch  Sensor"
						icon={<SwitchVisualization />}
					>
						<SwitchInfo switchData={switchData} />
					</SensorCard>
					<SensorCard
						title="Temperature Sensor"
						icon={<TemperatureVisualization />}
					>
						<TemperatureInfo temperatureData={temperatureData} />
					</SensorCard>
					<SensorCard
						title="Water Sensor"
						icon={<WaterVisualization />}
					>
						<WaterInfo waterLevelData={waterLevelData} />
					</SensorCard>
					<SensorCard
						title="Power Sensor"
						icon={<PowerVisualization />}
					>
						<PowerInfo powerData={powerData} />
					</SensorCard>
				</div>

			</div>
		</div>
	)
}
