import { PowerChartDataPoint } from '../types/power-sensor-types';
import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';

interface PowerChartProps {
	data: PowerChartDataPoint[];
}

export function PowerChart1({ data }: PowerChartProps) {
	return (
		<div className="bg-gray-50 w-full dark:bg-gray-900/50 rounded-xl p-6 mb-6">
			<div className="h-[400px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
						<XAxis
							dataKey="time"
							className="text-xs fill-gray-500"
							angle={-45}
							textAnchor="end"
							height={60}
							stroke="#9ca3af"
						/>
						<YAxis
							yAxisId="electrical"
							orientation="left"
							className="text-xs fill-gray-500"
							label={{
								value: "V/A",
								angle: -90,
								position: "insideLeft",
								style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
							}}
							stroke="#9ca3af"
						/>
						<YAxis
							yAxisId="power"
							orientation="right"
							className="text-xs fill-gray-500"
							label={{
								value: "W",
								angle: 90,
								position: "insideRight",
								style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
							}}
							stroke="#9ca3af"
						/>
						<ReferenceLine
							yAxisId="electrical"
							y={230}
							stroke="#3b82f6"
							strokeDasharray="5 5"
							strokeOpacity={0.7}
							label={{
								value: "230V",
								position: "insideTopLeft",
								style: { fill: "#3b82f6", fontSize: "10px", fontWeight: "500" },
							}}
						/>
						<Line
							yAxisId="electrical"
							type="monotone"
							dataKey="voltage"
							stroke="#3b82f6"
							strokeWidth={2}
							dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
							name="Voltage"
						/>
						<Line
							yAxisId="electrical"
							type="monotone"
							dataKey="current"
							stroke="#f59e0b"
							strokeWidth={2}
							dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
							name="Current"
						/>
						<Area
							yAxisId="power"
							type="monotone"
							dataKey="power"
							stroke="#10b981"
							strokeWidth={2}
							fill="url(#powerGradient)"
							fillOpacity={1}
							name="Power"
						/>
						<Legend />
						<Tooltip />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
