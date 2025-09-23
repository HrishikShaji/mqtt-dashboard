export interface PowerMonitoringData {
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

export interface PowerChartDataPoint {
	time: string;
	current: number;
	voltage: number;
	power: number;
	powerFactor: number;
	frequency: number;
	phase: string;
	sensor: string;
	enabled: boolean;
	monitoring: boolean;
	apparentPower: string;
	efficiency: string;
	fullTimestamp: string;
}

export interface PowerStats {
	voltage: {
		avg: number;
		min: number;
		max: number;
	};
	current: {
		avg: number;
		min: number;
		max: number;
	};
	power: {
		avg: number;
		min: number;
		max: number;
		total: number;
	};
	powerFactor: {
		avg: number;
		min: number;
		max: number;
	};
	frequency: {
		avg: number;
		min: number;
		max: number;
	};
}

export interface PowerQuality {
	status: string;
	color: string;
	icon: any;
}
