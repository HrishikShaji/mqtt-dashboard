import React from 'react';
import { Zap, Activity, BarChartIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { transformToChartData, calculateStats, getPowerQuality } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePowerSensorData from '../hooks/usePowerSensorData';
import { PowerChart1 } from './PowerChart1';
import { PowerChart2 } from './PowerChart2';
import { PowerStatsTable } from './PowerStatsTable';


export default function PowerMonitoring() {
	const { messages } = usePowerSensorData()
	const chartData = transformToChartData(messages);
	const stats = calculateStats(messages);
	const powerQuality = getPowerQuality(stats);

	return (
		<Dialog>
			<DialogTrigger className="cursor-pointer hover:text-blue-500">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw]  max-h-[90vh] overflow-y-auto rounded-4xl bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-white dark:text-gray-100 mb-6">
					<Zap className="h-5 w-5 text-white" />
					{/* <Activity className="h-5 w-5 text-blue-500" /> */}
					Power Monitoring Dashboard
				</DialogTitle>
				<div className="flex gap-5 h-full">
					<div className="flex flex-col gap-5 flex-1 w-full h-full">
						<Tabs defaultValue="power1">
							<TabsList>
								<TabsTrigger value="power1">Power</TabsTrigger>
								<TabsTrigger value="power2">Quality</TabsTrigger>
							</TabsList>
							<TabsContent value="power1">
								<PowerChart1 data={chartData} />
							</TabsContent>
							<TabsContent value="power2">
								<PowerChart2 data={chartData} />
							</TabsContent>
						</Tabs>
					</div>
					<div className='flex-1'>
						<PowerStatsTable
							stats={stats}
							powerQuality={powerQuality}
							messages={messages}
						/>

					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
