import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatTime = (timestamp: string) => {
	return new Date(timestamp).toLocaleTimeString()
}

export const getStatusColor = (value: number, type: string) => {
	switch (type) {
		case "temperature":
			if (value < 20) return "text-blue-600 dark:text-blue-400"
			if (value > 30) return "text-red-600 dark:text-red-400"
			return "text-green-600 dark:text-green-400"
		case "waterLevel":
			if (value < 20) return "text-red-600 dark:text-red-400"
			if (value < 50) return "text-yellow-600 dark:text-yellow-400"
			return "text-green-600 dark:text-green-400"
		case "power":
			return "text-purple-600 dark:text-purple-400"
		default:
			return "text-muted-foreground"
	}
}

export const getWaterLevelStatus = (level: number) => {
	if (level < 20) return { text: "Critical", variant: "destructive" as const }
	if (level < 50) return { text: "Low", variant: "secondary" as const }
	return { text: "Normal", variant: "default" as const }
}

