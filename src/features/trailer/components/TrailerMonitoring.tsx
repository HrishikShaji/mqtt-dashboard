"use client"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { BarChartIcon, Power } from "lucide-react"
import type { SwitchSensorType } from "@/types/sensor-types"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import useTrailerMonitoring from "../hooks/useTrailerMonitoring"

export default function TrailerMonitoring() {
	const { messages } = useTrailerMonitoring()

	return (
		<Dialog>
			<DialogTrigger className="cursor-pointer hover:text-blue-500">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw]  max-h-[90vh] overflow-y-auto rounded-4xl bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-white">
					<Power className="h-5 w-5 text-white" />
					Switch State Monitoring
				</DialogTitle>
			</DialogContent>
		</Dialog>
	)
}

