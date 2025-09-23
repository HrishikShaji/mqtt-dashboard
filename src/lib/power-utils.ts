import { PowerChartDataPoint, PowerMonitoringData, PowerQuality, PowerStats } from '@/types/power-sensor-types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function fmt(n: number, d = 0): string {
	return Number.isFinite(n) ? n.toFixed(d) : "—";
}

export function transformToChartData(messages: PowerMonitoringData[]): PowerChartDataPoint[] {
	return messages
		.map((item) => {
			const voltage = Number(item.voltage) || 0;
			const current = Number(item.current) || 0;
			const power = Number(item.power) || 0;
			const powerFactor = Number(item.powerFactor) || 0;
			const frequency = Number(item.frequency) || 0;

			return {
				time: new Date(item.timestamp).toLocaleTimeString("en-US", {
					hour12: false,
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
				current,
				voltage,
				power,
				powerFactor,
				frequency,
				phase: item.phase || "Single",
				sensor: item.sensor || "Power Meter",
				enabled: Boolean(item.enabled),
				monitoring: Boolean(item.monitoring),
				apparentPower: (voltage * current).toFixed(2),
				efficiency: (powerFactor * 100).toFixed(1),
				fullTimestamp: item.timestamp,
			};
		})
		.sort((a, b) => new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime());
}

export function calculateStats(messages: PowerMonitoringData[]): PowerStats {
	const voltages = messages.map((m) => Number(m.voltage) || 0).filter((v) => v > 0);
	const currents = messages.map((m) => Number(m.current) || 0).filter((c) => c > 0);
	const powers = messages.map((m) => Number(m.power) || 0).filter((p) => p > 0);
	const powerFactors = messages.map((m) => Number(m.powerFactor) || 0).filter((pf) => pf > 0);
	const frequencies = messages.map((m) => Number(m.frequency) || 0).filter((f) => f > 0);

	return {
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
	};
}

export function getPowerQuality(stats: PowerStats): PowerQuality {
	const avgPF = stats.powerFactor.avg || 0;
	const freqVariation = stats.frequency.max - stats.frequency.min || 0;
	const voltageVariation = stats.voltage.avg > 0
		? ((stats.voltage.max - stats.voltage.min) / stats.voltage.avg) * 100
		: 0;

	if (avgPF >= 0.95 && freqVariation <= 1 && voltageVariation <= 5) {
		return { status: "Excellent", color: "#10b981", icon: CheckCircle };
	} else if (avgPF >= 0.9 && freqVariation <= 2 && voltageVariation <= 10) {
		return { status: "Good", color: "#3b82f6", icon: CheckCircle };
	} else if (avgPF >= 0.8 && freqVariation <= 3 && voltageVariation <= 15) {
		return { status: "Fair", color: "#f59e0b", icon: AlertTriangle };
	} else {
		return { status: "Poor", color: "#ef4444", icon: AlertTriangle };
	}
}
