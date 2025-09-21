import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, AreaChart } from 'recharts';
import { Zap, Activity, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface PowerMonitoringData {
	current: number;
	enabled: boolean;
	frequency: number;
	monitoring: boolean;
	phase: string;
	power: number;
	powerFactor: number;
	sensor: string;
	timestamp: string;
	voltage: number;
}

interface Props {
	messages: PowerMonitoringData[];
}

export default function PowerMonitoringChart({ messages }: Props) {
	const chartData = messages
		.map((item) => {
			// Safely convert values to numbers with fallbacks
			const voltage = Number(item.voltage) || 0
			const current = Number(item.current) || 0
			const power = Number(item.power) || 0
			const powerFactor = Number(item.powerFactor) || 0
			const frequency = Number(item.frequency) || 0

			return {
				time: new Date(item.timestamp).toLocaleTimeString("en-US", {
					hour12: false,
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
				current: current,
				voltage: voltage,
				power: power,
				powerFactor: powerFactor,
				frequency: frequency,
				phase: item.phase || "Single",
				sensor: item.sensor || "Power Meter",
				enabled: Boolean(item.enabled),
				monitoring: Boolean(item.monitoring),
				// Calculated values
				apparentPower: (voltage * current).toFixed(2),
				efficiency: (powerFactor * 100).toFixed(1),
				fullTimestamp: item.timestamp,
			}
		})
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime())

	// Calculate stats with safe number conversion
	const voltages = messages.map((m) => Number(m.voltage) || 0).filter((v) => v > 0)
	const currents = messages.map((m) => Number(m.current) || 0).filter((c) => c > 0)
	const powers = messages.map((m) => Number(m.power) || 0).filter((p) => p > 0)
	const powerFactors = messages.map((m) => Number(m.powerFactor) || 0).filter((pf) => pf > 0)
	const frequencies = messages.map((m) => Number(m.frequency) || 0).filter((f) => f > 0)

	const stats = {
		voltage: {
			avg: voltages.length > 0 ? voltages.reduce((a, b) => a + b, 0) / voltages.length : 0,
			min: voltages.length > 0 ? Math.min(...voltages) : 0,
			max: voltages.length > 0 ? Math.max(...voltages) : 0,
		},
		current: {
			avg: currents.length > 0 ? currents.reduce((a, b) => a + b, 0) / currents.length : 0,
			min: currents.length > 0 ? Math.min(...currents) : 0,
			max: currents.length > 0 ? Math.max(...currents) : 0,
		},
		power: {
			avg: powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : 0,
			min: powers.length > 0 ? Math.min(...powers) : 0,
			max: powers.length > 0 ? Math.max(...powers) : 0,
			total: powers.reduce((a, b) => a + b, 0),
		},
		powerFactor: {
			avg: powerFactors.length > 0 ? powerFactors.reduce((a, b) => a + b, 0) / powerFactors.length : 0,
			min: powerFactors.length > 0 ? Math.min(...powerFactors) : 0,
			max: powerFactors.length > 0 ? Math.max(...powerFactors) : 0,
		},
		frequency: {
			avg: frequencies.length > 0 ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length : 0,
			min: frequencies.length > 0 ? Math.min(...frequencies) : 0,
			max: frequencies.length > 0 ? Math.max(...frequencies) : 0,
		},
	}

	// Power quality assessment with safety checks
	const getPowerQuality = () => {
		const avgPF = stats.powerFactor.avg || 0
		const freqVariation = stats.frequency.max - stats.frequency.min || 0
		const voltageVariation =
			stats.voltage.avg > 0 ? ((stats.voltage.max - stats.voltage.min) / stats.voltage.avg) * 100 : 0

		if (avgPF >= 0.95 && freqVariation <= 1 && voltageVariation <= 5) {
			return { status: "Excellent", color: "#10b981", icon: CheckCircle }
		} else if (avgPF >= 0.9 && freqVariation <= 2 && voltageVariation <= 10) {
			return { status: "Good", color: "#3b82f6", icon: CheckCircle }
		} else if (avgPF >= 0.8 && freqVariation <= 3 && voltageVariation <= 15) {
			return { status: "Fair", color: "#f59e0b", icon: AlertTriangle }
		} else {
			return { status: "Poor", color: "#ef4444", icon: AlertTriangle }
		}
	}

	const powerQuality = getPowerQuality()

	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean
		payload?: any[]
		label?: string
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			// Safely convert values to numbers with fallbacks
			const voltage = Number(data.voltage) || 0
			const current = Number(data.current) || 0
			const power = Number(data.power) || 0
			const powerFactor = Number(data.powerFactor) || 0
			const frequency = Number(data.frequency) || 0
			const apparentPower = Number(data.apparentPower) || 0
			const efficiency = Number(data.efficiency) || 0

			return (
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg backdrop-blur-sm min-w-[280px]">
					<p className="font-medium text-gray-900 dark:text-gray-100 mb-3">{`${data.sensor || "Power Meter"} - ${data.phase || "Single"} Phase`}</p>
					<div className="space-y-2">
						<p className="flex items-center gap-3">
							<Zap className="h-4 w-4 text-blue-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">{voltage.toFixed(1)}V</span>
						</p>
						<p className="flex items-center gap-3">
							<Activity className="h-4 w-4 text-yellow-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">{current.toFixed(1)}A</span>
						</p>
						<p className="flex items-center gap-3">
							<Gauge className="h-4 w-4 text-green-500" />
							<span className="font-semibold text-gray-900 dark:text-gray-100">{power.toFixed(0)}W</span>
						</p>
						<div className="border-t pt-2 mt-3 space-y-1 border-gray-100 dark:border-gray-800">
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Power Factor: <span className="font-semibold">{powerFactor.toFixed(3)}</span>
							</p>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Frequency: <span className="font-semibold">{frequency.toFixed(1)}Hz</span>
							</p>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Apparent Power: <span className="font-semibold">{apparentPower.toFixed(0)}VA</span>
							</p>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Efficiency: <span className="font-semibold">{efficiency.toFixed(1)}%</span>
							</p>
						</div>
					</div>
					<p className="text-sm text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">{`${label}`}</p>
					{!data.enabled && <p className="text-xs text-orange-500 mt-2">⚠️ Meter Disabled</p>}
					{!data.monitoring && <p className="text-xs text-red-500 mt-1">🚫 Monitoring Off</p>}
				</div>
			)
		}
		return null
	}

	return (
		<Dialog>
			<DialogTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 shadow-sm">
				<Zap className="h-4 w-4" />
				View Power Metrics
			</DialogTrigger>
			<DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Zap className="h-5 w-5 text-yellow-500" />
					<Activity className="h-5 w-5 text-blue-500" />
					Power Monitoring Dashboard
				</DialogTitle>

				<div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
					<div className="h-[400px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
								<defs>
									<linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
									</linearGradient>
								</defs>
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
								<Tooltip content={<CustomTooltip />} />

								<ReferenceLine
									yAxisId="electrical"
									y={230}
									stroke="#3b82f6"
									strokeDasharray="5 5"
									strokeOpacity={0.7}
									label={{
										value: "230V",
										position: "topLeft",
										style: { fill: "#3b82f6", fontSize: "10px", fontWeight: "500" },
									}}
								/>

								{/* Voltage Line */}
								<Line
									yAxisId="electrical"
									type="monotone"
									dataKey="voltage"
									stroke="#3b82f6"
									strokeWidth={2}
									dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
									name="Voltage"
								/>

								{/* Current Line */}
								<Line
									yAxisId="electrical"
									type="monotone"
									dataKey="current"
									stroke="#f59e0b"
									strokeWidth={2}
									dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
									name="Current"
								/>

								{/* Power Area */}
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

								<text x="20" y="40" fill="#3b82f6" fontSize="11" fontWeight="500">
									Voltage
								</text>
								<line x1="20" y1="50" x2="40" y2="50" stroke="#3b82f6" strokeWidth="2" />

								<text x="20" y="70" fill="#f59e0b" fontSize="11" fontWeight="500">
									Current
								</text>
								<line x1="20" y1="80" x2="40" y2="80" stroke="#f59e0b" strokeWidth="2" />

								<text x="20" y="100" fill="#10b981" fontSize="11" fontWeight="500">
									Power
								</text>
								<rect x="20" y="105" width="20" height="8" fill="#10b981" fillOpacity="0.3" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
					<div className="h-[200px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
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
										position: "topLeft",
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
										position: "topRight",
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

								<text x="20" y="40" fill="#ef4444" fontSize="11" fontWeight="500">
									Power Factor
								</text>
								<line x1="20" y1="50" x2="40" y2="50" stroke="#ef4444" strokeWidth="2" />

								<text x="20" y="70" fill="#8b5cf6" fontSize="11" fontWeight="500">
									Frequency
								</text>
								<line x1="20" y1="80" x2="40" y2="80" stroke="#8b5cf6" strokeWidth="2" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="space-y-6">
					{/* Power Quality Overview */}
					<div className="grid grid-cols-5 gap-4">
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Current Load</div>
							<div className="text-2xl font-bold text-green-500 mb-1">{stats.power.avg.toFixed(0)}W</div>
							<div className="text-sm text-gray-500">{(stats.voltage.avg * stats.current.avg).toFixed(0)}VA</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Power Quality</div>
							<div className="flex items-center justify-center gap-2 mt-1">
								<powerQuality.icon className="h-4 w-4" style={{ color: powerQuality.color }} />
								<span className="font-bold" style={{ color: powerQuality.color }}>
									{powerQuality.status}
								</span>
							</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Avg Power Factor</div>
							<div className="text-2xl font-bold text-red-500 mb-1">{stats.powerFactor.avg.toFixed(3)}</div>
							<div className="text-sm text-gray-500">{(stats.powerFactor.avg * 100).toFixed(1)}% efficient</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">System Info</div>
							<div className="font-semibold text-gray-900 dark:text-gray-100">
								{messages[0]?.phase || "Single"} Phase
							</div>
							<div className="text-sm text-gray-500">{messages[0]?.sensor || "Power Meter"}</div>
						</div>
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
							<div className="text-sm text-gray-500 mb-1">Status</div>
							<div className="space-y-1">
								<div className="text-xs">
									{messages[messages.length - 1]?.enabled ? (
										<span className="text-green-500 font-medium">✓ Meter Active</span>
									) : (
										<span className="text-red-500 font-medium">✗ Meter Inactive</span>
									)}
								</div>
								<div className="text-xs">
									{messages[messages.length - 1]?.monitoring ? (
										<span className="text-green-500 font-medium">📊 Monitoring</span>
									) : (
										<span className="text-red-500 font-medium">🚫 Not Monitoring</span>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-6">
						{/* Electrical Parameters */}
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
							<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
								<Zap className="h-4 w-4 text-blue-500" />
								Electrical Parameters
							</h3>
							<div className="space-y-3">
								<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Voltage (V)</div>
									<div className="text-lg font-bold text-blue-500">
										{stats.voltage.avg.toFixed(1)} ± {((stats.voltage.max - stats.voltage.min) / 2).toFixed(1)}
									</div>
									<div className="text-xs text-gray-500">
										{stats.voltage.min.toFixed(1)} - {stats.voltage.max.toFixed(1)}
									</div>
								</div>
								<div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Current (A)</div>
									<div className="text-lg font-bold text-yellow-500">
										{stats.current.avg.toFixed(2)} ± {((stats.current.max - stats.current.min) / 2).toFixed(2)}
									</div>
									<div className="text-xs text-gray-500">
										{stats.current.min.toFixed(2)} - {stats.current.max.toFixed(2)}
									</div>
								</div>
							</div>
						</div>

						{/* Power Analysis */}
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
							<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
								<Gauge className="h-4 w-4 text-green-500" />
								Power Analysis
							</h3>
							<div className="space-y-3">
								<div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Active Power (W)</div>
									<div className="text-lg font-bold text-green-500">{stats.power.avg.toFixed(0)}</div>
									<div className="text-xs text-gray-500">
										{stats.power.min} - {stats.power.max}
									</div>
								</div>
								<div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Power Factor</div>
									<div className="text-lg font-bold text-red-500">{stats.powerFactor.avg.toFixed(3)}</div>
									<div className="text-xs text-gray-500">
										{stats.powerFactor.min.toFixed(3)} - {stats.powerFactor.max.toFixed(3)}
									</div>
								</div>
							</div>
						</div>

						{/* System Health */}
						<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
							<h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
								<Activity className="h-4 w-4 text-purple-500" />
								System Health
							</h3>
							<div className="space-y-3">
								<div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Frequency (Hz)</div>
									<div className="text-lg font-bold text-purple-500">{stats.frequency.avg.toFixed(2)}</div>
									<div className="text-xs text-gray-500">
										Variation: ±{((stats.frequency.max - stats.frequency.min) / 2).toFixed(2)}
									</div>
								</div>
								<div className="p-3 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
									<div className="text-sm text-gray-500 mb-1">Total Readings</div>
									<div className="text-lg font-bold text-gray-900 dark:text-gray-100">{messages.length}</div>
									<div className="text-xs text-gray-500">Monitoring sessions</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
