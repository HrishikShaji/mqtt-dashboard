import { Activity, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ReactNode, useEffect, useState } from "react";

interface Props {
	title: string;
	children: ReactNode;
	icon: ReactNode;
}

export default function SensorCard({ title, children, icon }: Props) {
	return (
		<Card className="relative overflow-hidden rounded-4xl bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20">
			<CardHeader className="pb-3">
				<CardTitle className="flex w-full justify-between items-center gap-2 text-lg text-white">
					{title}
					{icon}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{children}
			</CardContent>
		</Card>
	)
}
