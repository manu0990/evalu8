'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@repo/ui';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@repo/ui';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

interface StatusRadarProps {
  data: { status: string; count: number; fill: string }[];
}

const chartConfig = {
  count: { label: "Meetings", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function StatusRadar({ data }: StatusRadarProps) {
  return (
    <Card className="flex flex-col h-full border-accent">
      <CardHeader className="items-center pb-4">
        <CardTitle>Meeting Status</CardTitle>
      </CardHeader>
      <CardContent className="pb-0 flex-1 flex flex-col justify-center">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-60 w-full">
            <RadarChart 
              data={data} 
              margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="status" />
              <Radar
                dataKey="count"
                fill="var(--color-count)"
                fillOpacity={0.6}
                stroke="var(--color-count)"
                strokeWidth={0.6}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
