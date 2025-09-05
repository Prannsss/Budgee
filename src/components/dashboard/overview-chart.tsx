
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Jan", assets: 4000, liabilities: 2400 },
  { name: "Feb", assets: 3000, liabilities: 1398 },
  { name: "Mar", assets: 2000, liabilities: 9800 },
  { name: "Apr", assets: 2780, liabilities: 3908 },
  { name: "May", assets: 1890, liabilities: 4800 },
  { name: "Jun", assets: 2390, liabilities: 3800 },
  { name: "Jul", assets: 3490, liabilities: 4300 },
];

const chartConfig = {
    assets: {
        label: "Assets",
        color: "hsl(var(--primary))",
    },
    liabilities: {
        label: "Liabilities",
        color: "hsl(var(--secondary))",
    },
}

export function OverviewChart() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your assets and liabilities over the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <BarChart accessibilityLayer data={data}>
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent />}
                />
                <Bar dataKey="assets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="liabilities" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
