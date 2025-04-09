
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trendValue?: number;
  trendText?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  className,
  trendValue,
  trendText,
}: StatCardProps) => {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          {description}
        </CardDescription>
        
        {(trendValue !== undefined || trendText) && (
          <div className="text-xs flex items-center mt-2">
            {trendValue !== undefined && (
              <span
                className={cn(
                  "mr-1",
                  trendValue > 0 ? "text-green-500" : trendValue < 0 ? "text-red-500" : "text-gray-500"
                )}
              >
                {trendValue > 0 ? "↑" : trendValue < 0 ? "↓" : "•"} {Math.abs(trendValue)}%
              </span>
            )}
            {trendText && <span className="text-muted-foreground">{trendText}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
