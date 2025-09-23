import { SwitchSensorType } from "@/types/sensor-types"

interface Props {
	messages: SwitchSensorType[];
}

export default function SwitchStatsTable({ messages }: Props) {
	return (
		<table className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
			<thead>
				<tr className="border-b border-gray-200 dark:border-gray-700">
					<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Metric</th>
					<th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Count</th>
				</tr>
			</thead>
			<tbody>
				<tr className="border-b border-gray-200 dark:border-gray-700">
					<td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">Total Events</td>
					<td className="px-4 py-3 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</td>
				</tr>
				<tr className="border-b border-gray-200 dark:border-gray-700">
					<td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">ON Events</td>
					<td className="px-4 py-3 text-center text-2xl font-bold text-green-500">{messages.filter((m) => m.state).length}</td>
				</tr>
				<tr>
					<td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">OFF Events</td>
					<td className="px-4 py-3 text-center text-2xl font-bold text-red-500">{messages.filter((m) => !m.state).length}</td>
				</tr>
			</tbody>
		</table>
	)
}
