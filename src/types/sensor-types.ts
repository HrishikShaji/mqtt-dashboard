export interface SwitchSensorType {
	state: boolean;
	timestamp: string;
	device: string;
}

export interface PowerSensorType {
	voltage: number;
	current: number;
	power: number;
	frequency: number;
	powerFactor: number;
	sensor: string;
	phase: string;
	enabled: boolean;
	monitoring: boolean;

}

export interface WaterSensorType {
	level: number;
	capacity: number;
	status: string;
	sensor: string;
	location: string;
	enabled: boolean;
	alertsEnabled: boolean;
}

export interface TemperatureSensorType {
	temperature: number;
	humidity: number;
	sensor: string;
	location: string;
	enabled: boolean;
}
