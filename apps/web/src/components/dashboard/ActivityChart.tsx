'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, Button } from '@repo/ui';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@repo/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ActivityChartProps {
  data: { date: string; count: number }[];
}

type TimeRange = '7D' | '30D' | 'All';

const chartConfig = {
  count: {
    label: "Meetings",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ActivityChart({ data }: ActivityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  const filteredData = useMemo(() => {
    if (timeRange === 'All') return data;
    const days = timeRange === '7D' ? 7 : 30;
    return data.slice(-days);
  }, [data, timeRange]);

  return (
    <Card className='border-accent'>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-lg font-semibold">Activity Overview</h3>
        <div className="flex space-x-1 bg-muted p-1 rounded-md">
          {(['7D', '30D', 'All'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-7 px-2 text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full">
          {filteredData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No data yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  className="text-xs fill-muted-foreground" 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  allowDecimals={false}
                  className="text-xs fill-muted-foreground" 
                />
                <ChartTooltip cursor={{ fill: 'var(--accent)', opacity: 0.5 }} content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={[12.5, 12.5, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
