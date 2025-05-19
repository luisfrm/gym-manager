import { formatCurrency } from "./currency";
import { ReactNode } from "react";

export interface ReportTotals {
  USD: number;
  VES: number;
}

export interface ReportPeriod {
  current: ReportTotals;
  previous: ReportTotals;
  change: number; // Percentage change
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const formatReportValue = (value: number | ReportTotals, type: 'currency' | 'number' | 'percentage' = 'number'): string => {
  if (typeof value === 'number') {
    switch (type) {
      case 'currency':
        return formatCurrency(value, 'USD');
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('en-US');
    }
  }
  
  // For ReportTotals
  return `${formatCurrency(value.USD, 'USD')} / ${formatCurrency(value.VES, 'VES')}`;
};

export const getReportTrend = (change: number): { icon: string; color: string } => {
  if (change > 0) {
    return { icon: '↑', color: 'text-green-500' };
  } else if (change < 0) {
    return { icon: '↓', color: 'text-red-500' };
  }
  return { icon: '→', color: 'text-gray-500' };
};

export const formatReportTitle = (value: ReportTotals, change?: number): ReactNode => {
  const trend = change !== undefined ? getReportTrend(change) : null;
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span>{formatCurrency(value.USD, 'USD')}</span>
        {trend && change !== undefined && (
          <span className={`${trend.color} text-sm`}>
            {trend.icon} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-sm mt-1 opacity-80">
        {formatCurrency(value.VES, 'VES')}
      </div>
    </div>
  );
}; 