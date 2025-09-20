"use client"
// components/RealtimeDashboard.js
import React, { useState, useEffect } from 'react';
import { ref, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';

const RealtimeDashboard = () => {
	const [messages, setMessages] = useState([]);
	const [topicData, setTopicData] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Listen to latest 50 messages
		const messagesRef = ref(database, 'messages');
		const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

		const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const messageArray = Object.entries(data).map(([key, value]) => ({
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

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	const getStatusColor = (timestamp) => {
		const now = Date.now();
		const diff = now - timestamp;
		if (diff < 30000) return 'text-green-500'; // Less than 30 seconds
		if (diff < 300000) return 'text-yellow-500'; // Less than 5 minutes
		return 'text-red-500'; // Older than 5 minutes
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 bg-gray-50 min-h-screen">
			<h1 className="text-3xl font-bold text-gray-800 mb-8">MQTT Dashboard</h1>

			{/* Topic Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				<h2 className="col-span-full text-2xl font-semibold text-gray-700 mb-4">Topic Overview</h2>
				{Object.entries(topicData).map(([topicKey, data]) => (
					<div key={topicKey} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<div className="flex justify-between items-start mb-2">
							<h3 className="font-semibold text-gray-800 truncate">
								{data.topic.replace(/_/g, '/')}
							</h3>
							<span className={`text-xs font-medium ${getStatusColor(data.timestamp)}`}>
								●
							</span>
						</div>
						<p className="text-gray-600 text-sm mb-2">Client: {data.clientId}</p>
						<p className="text-lg font-mono bg-gray-100 p-2 rounded mb-2 break-words">
							{data.payload}
						</p>
						<p className="text-xs text-gray-500">
							{formatTimestamp(data.timestamp)}
						</p>
					</div>
				))}
			</div>

			{/* Recent Messages */}
			<div className="bg-white rounded-lg shadow-md">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-2xl font-semibold text-gray-700">Recent Messages</h2>
					<p className="text-gray-500">Live MQTT message feed</p>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Timestamp
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Client
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Topic
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Payload
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{messages.map((message, index) => (
								<tr key={message.id} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatTimestamp(message.timestamp)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{message.clientId}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
										{message.topic}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
										{message.payload}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{messages.length === 0 && (
					<div className="px-6 py-12 text-center">
						<p className="text-gray-500">No messages received yet</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default RealtimeDashboard;
