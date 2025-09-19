"use client"
import { useState, useEffect } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export default function Dashboard() {
	const [client, setClient] = useState<MqttClient | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [switchData, setSwitchData] = useState(null);
	const [messageHistory, setMessageHistory] = useState([]);
	const [connectionStatus, setConnectionStatus] = useState('Disconnected');

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect('ws://localhost:8883');

		mqttClient.on('connect', () => {
			console.log('Dashboard connected to MQTT broker');
			setIsConnected(true);
			setConnectionStatus('Connected');
			setClient(mqttClient);

			// Subscribe to switch state topic
			mqttClient.subscribe('switch/state', (err) => {
				if (err) {
					console.error('Subscription error:', err);
				} else {
					console.log('Subscribed to switch/state topic');
				}
			});
		});

		mqttClient.on('message', (topic, message) => {
			try {
				const data = JSON.parse(message.toString());
				console.log('Received message:', { topic, data });

				if (topic === 'switch/state') {
					setSwitchData(data);

					// Add to message history
					setMessageHistory(prev => [
						{
							id: Date.now(),
							topic,
							data,
							receivedAt: new Date().toISOString()
						},
						...prev.slice(0, 9) // Keep only last 10 messages
					]);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		});

		mqttClient.on('error', (err) => {
			console.error('MQTT connection error:', err);
			setConnectionStatus(`Error: ${err.message}`);
		});

		mqttClient.on('offline', () => {
			setIsConnected(false);
			setConnectionStatus('Offline');
		});

		mqttClient.on('reconnect', () => {
			setConnectionStatus('Reconnecting...');
		});

		return () => {
			if (mqttClient) {
				mqttClient.end();
			}
		};
	}, []);

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString();
	};

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-center mb-8">MQTT Dashboard</h1>

				{/* Connection Status */}
				<div className="bg-white rounded-lg shadow-md p-4 mb-6">
					<div className="flex items-center justify-center">
						<span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
							}`}></span>
						<span className="text-lg font-medium">{connectionStatus}</span>
					</div>
				</div>

				{/* Current Switch State */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Current Switch State</h2>
					{switchData ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className={`text-4xl font-bold mb-2 ${switchData.state ? 'text-green-600' : 'text-red-600'
									}`}>
									{switchData.state ? 'ON' : 'OFF'}
								</div>
								<div className="text-sm text-gray-500">Status</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-lg font-semibold mb-2">
									{switchData.device || 'Unknown'}
								</div>
								<div className="text-sm text-gray-500">Device</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-lg font-semibold mb-2">
									{formatTime(switchData.timestamp)}
								</div>
								<div className="text-sm text-gray-500">Last Updated</div>
							</div>
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<div className="text-6xl mb-4">⏳</div>
							<p>Waiting for switch data...</p>
						</div>
					)}
				</div>

				{/* Message History */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">Message History</h2>
					{messageHistory.length > 0 ? (
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{messageHistory.map((msg) => (
								<div key={msg.id} className="border rounded-lg p-3 bg-gray-50">
									<div className="flex justify-between items-start mb-2">
										<span className="font-medium text-blue-600">{msg.topic}</span>
										<span className="text-sm text-gray-500">
											{formatTime(msg.receivedAt)}
										</span>
									</div>
									<div className="flex items-center space-x-4">
										<span className={`px-2 py-1 rounded text-sm font-medium ${msg.data.state
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
											}`}>
											{msg.data.state ? 'ON' : 'OFF'}
										</span>
										<span className="text-sm text-gray-600">
											Device: {msg.data.device}
										</span>
										<span className="text-xs text-gray-500">
											{formatTime(msg.data.timestamp)}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<div className="text-4xl mb-4">📝</div>
							<p>No messages received yet</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
