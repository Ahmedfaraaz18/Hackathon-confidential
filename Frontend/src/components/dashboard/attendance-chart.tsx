'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AttendanceChartProps {
  percentage: number;
}

export function AttendanceChart({ percentage }: AttendanceChartProps) {
  const chartData = [
    { name: 'Present', value: percentage, fill: 'hsl(var(--chart-1))' },
    { name: 'Absent/Other', value: 100 - percentage, fill: 'hsl(var(--muted))' },
  ];
  const chartConfig = {
    present: {
      label: 'Present',
    },
    absent: {
      label: 'Absent/Other',
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Your overall attendance percentage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
                <Cell key={`cell-0`} fill={chartData[0].fill} />
                <Cell key={`cell-1`} fill={chartData[1].fill} />
            </Pie>
             <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-3xl font-bold"
             >
                {percentage.toFixed(0)}%
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Keep up the good work! <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing overall attendance
        </div>
      </CardFooter>
    </Card>
  );
}
