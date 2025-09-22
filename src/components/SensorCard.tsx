import { Activity, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ReactNode, useEffect, useState } from "react";

interface Props {
	title: string;
	children: ReactNode;
}

export default function SensorCard({ title, children }: Props) {
	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<Power className="h-5 w-5" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{children}
			</CardContent>
		</Card>
	)
}
