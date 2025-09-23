import React from 'react';
import { Zap, Activity, BarChartIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { transformToChartData, calculateStats, getPowerQuality } from '../lib/utils';
import { PowerChart } from './PowerChart';
import { QualityChart } from './QualityChart';
import { StatisticsTable } from './StatisticsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePowerSensorData from '../hooks/usePowerSensorData';


export default function PowerMonitoring() {
	const { messages } = usePowerSensorData()
	const chartData = transformToChartData(messages);
	const stats = calculateStats(messages);
	const powerQuality = getPowerQuality(stats);

	return (
		<Dialog>
			<DialogTrigger className="rounded-md border-1 hover:bg-black hover:text-white p-1 cursor-pointer">
				<BarChartIcon size={20} />
			</DialogTrigger>
			<DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto">
				<DialogTitle className="flex gap-3 items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
					<Zap className="h-5 w-5 text-yellow-500" />
					<Activity className="h-5 w-5 text-blue-500" />
					Power Monitoring Dashboard
				</DialogTitle>
				<div className="flex gap-5 h-full">
					<div className="flex flex-col gap-5 flex-2/3 w-full h-full">
						<Tabs defaultValue="power">
							<TabsList>
								<TabsTrigger value="power">Power</TabsTrigger>
								<TabsTrigger value="quality">Quality</TabsTrigger>
							</TabsList>
							<TabsContent value="power">
								<PowerChart data={chartData} />
							</TabsContent>
							<TabsContent value="quality">
								<QualityChart data={chartData} />
							</TabsContent>
						</Tabs>
					</div>
					<StatisticsTable
						stats={stats}
						powerQuality={powerQuality}
						messages={messages}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
