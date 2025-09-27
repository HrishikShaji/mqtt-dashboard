import { SwitchSensorType } from "@/types/sensor-types"

interface Props {
	messages: SwitchSensorType[];
}

export default function SwitchStatsTable({ messages }: Props) {
	return (
		<div className="rounded-md border border-border text-white overflow-hidden">
			<table className="w-full ">
				<thead className="bg-neutral-900 text-white ">
					<tr className="text-left">
						<th className="px-2 py-1 font-medium">Metric</th>
						<th className="px-2 py-1 font-medium">Count</th>
					</tr>
				</thead>
				<tbody>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">Total Events</td>
						<td className="px-2 py-1 font-medium">{messages.length}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">ON Events</td>
						<td className="px-2 py-1 font-medium text-green-500">{messages.filter((m) => m.state).length}</td>
					</tr>
					<tr className="border-t border-border">
						<td className="px-2 py-1 text-muted-foreground">OFF Events</td>
						<td className="px-2 py-1 font-medium text-red-500">{messages.filter((m) => !m.state).length}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
