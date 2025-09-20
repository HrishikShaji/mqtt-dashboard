import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Power } from 'lucide-react';
import { SwitchSensorType } from '@/types/sensor-types';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
	messages: SwitchSensorType[];
}

export default function SwitchChart({ messages }: Props) {
	const chartData = messages
		.map(item => ({
			time: new Date(item.timestamp).toLocaleTimeString('en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			state: item.state ? 1 : 0,
			stateLabel: item.state ? 'ON' : 'OFF',
			device: item.device,
			fullTimestamp: item.timestamp
		}))
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime());

	const CustomTooltip = ({ active, payload, label }: {
		active?: boolean;
		payload?: any[];
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
					<p className="font-medium">{`${data.device}`}</p>
					<p className={`font-bold ${data.state === 1 ? 'text-green-600' : 'text-red-600'}`}>
						{`State: ${data.stateLabel}`}
					</p>
					<p className="text-sm text-muted-foreground">{`Time: ${label}`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<Dialog>
			<DialogTrigger>SHOW</DialogTrigger>
			<DialogContent>
				<DialogTitle className='flex gap-3 items-center'>
					<Power className="h-5 w-5" />
					Switch State Over Time
				</DialogTitle>
				<div className="h-[300px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="stateGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis
								dataKey="time"
								className="text-xs fill-muted-foreground"
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis
								domain={[0, 1]}
								ticks={[0, 1]}
								tickFormatter={(value) => value === 1 ? 'ON' : 'OFF'}
								className="text-xs fill-muted-foreground"
							/>
							<Tooltip content={<CustomTooltip />} />
							<Area
								type="stepAfter"
								dataKey="state"
								stroke="#22c55e"
								strokeWidth={2}
								fill="url(#stateGradient)"
								fillOpacity={0.6}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Stats Summary */}
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
					<div className="p-3 bg-muted/50 rounded-lg">
						<div className="text-sm text-muted-foreground">Total Events</div>
						<div className="text-lg font-bold">{messages.length}</div>
					</div>
					<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
						<div className="text-sm text-muted-foreground">ON Events</div>
						<div className="text-lg font-bold text-green-600">
							{messages.filter(m => m.state).length}
						</div>
					</div>
					<div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
						<div className="text-sm text-muted-foreground">OFF Events</div>
						<div className="text-lg font-bold text-red-600">
							{messages.filter(m => !m.state).length}
						</div>
					</div>
				</div>

			</DialogContent>
		</Dialog>
	);
}
