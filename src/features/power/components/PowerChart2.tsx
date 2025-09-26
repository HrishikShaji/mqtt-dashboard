import { PowerChartDataPoint } from '../types/power-sensor-types';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';

interface QualityChartProps {
	data: PowerChartDataPoint[];
}

export function PowerChart2({ data }: QualityChartProps) {
	return (
		<div className="w-full bg-neutral-900 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
			<div className="h-[400px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
						<XAxis
							dataKey="time"
							className="text-xs fill-gray-500"
							angle={-45}
							textAnchor="end"
							height={40}
							stroke="#9ca3af"
						/>
						<YAxis
							yAxisId="pf"
							orientation="left"
							domain={[0, 1]}
							className="text-xs fill-gray-500"
							label={{
								value: "PF",
								angle: -90,
								position: "insideLeft",
								style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
							}}
							stroke="#9ca3af"
						/>
						<YAxis
							yAxisId="freq"
							orientation="right"
							domain={[49, 51]}
							className="text-xs fill-gray-500"
							label={{
								value: "Hz",
								angle: 90,
								position: "insideRight",
								style: { textAnchor: "middle", fill: "#6b7280", fontSize: "12px" },
							}}
							stroke="#9ca3af"
						/>
						<ReferenceLine
							yAxisId="pf"
							y={0.95}
							stroke="#10b981"
							strokeDasharray="5 5"
							strokeOpacity={0.7}
							label={{
								value: "0.95",
								position: "insideTopLeft",
								style: { fill: "#10b981", fontSize: "10px", fontWeight: "500" },
							}}
						/>
						<ReferenceLine
							yAxisId="freq"
							y={50}
							stroke="#8b5cf6"
							strokeDasharray="5 5"
							strokeOpacity={0.7}
							label={{
								value: "50Hz",
								position: "insideTopRight",
								style: { fill: "#8b5cf6", fontSize: "10px", fontWeight: "500" },
							}}
						/>
						<Line
							yAxisId="pf"
							type="monotone"
							dataKey="powerFactor"
							stroke="#ef4444"
							strokeWidth={2}
							dot={{ fill: "#ef4444", strokeWidth: 2, r: 2 }}
							name="Power Factor"
						/>
						<Line
							yAxisId="freq"
							type="monotone"
							dataKey="frequency"
							stroke="#8b5cf6"
							strokeWidth={2}
							dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 2 }}
							name="Frequency"
						/>
						<Legend />
						<Tooltip />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
