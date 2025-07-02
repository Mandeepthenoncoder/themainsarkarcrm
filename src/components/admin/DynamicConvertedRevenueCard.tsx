'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConvertedRevenueData {
  period: string;
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  formattedCurrent: string;
  formattedPrevious: string;
}

export default function DynamicConvertedRevenueCard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'WTD' | 'MTD' | 'YTD'>('YTD');
  const [salesData, setSalesData] = useState<ConvertedRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async (period: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/gross-sales?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch converted revenue data');
      }
      
      const data = await response.json();
      setSalesData(data);
    } catch (err) {
      console.error('Error fetching converted revenue data:', err);
      setError('Failed to load converted revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (value: 'WTD' | 'MTD' | 'YTD') => {
    setSelectedPeriod(value);
  };

  const getComparisonText = (period: string, percentageChange: number) => {
    const previousPeriodMap = {
      'WTD': 'previous week',
      'MTD': 'previous month', 
      'YTD': 'previous year'
    };
    
    if (percentageChange === 0) {
      return `(vs ${previousPeriodMap[period as keyof typeof previousPeriodMap]})`;
    }
    
    return `from ${previousPeriodMap[period as keyof typeof previousPeriodMap]}`;
  };

  const getPercentageIcon = (percentageChange: number) => {
    if (percentageChange > 0) return <TrendingUp className="h-3 w-3 inline ml-1" />;
    if (percentageChange < 0) return <TrendingDown className="h-3 w-3 inline ml-1" />;
    return <Minus className="h-3 w-3 inline ml-1" />;
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Converted Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
          <p className="text-xs text-muted-foreground">Fetching converted revenue data</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Converted Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">Error</div>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">Converted Revenue</CardTitle>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-20 h-6 text-xs border-none shadow-none p-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WTD">WTD</SelectItem>
              <SelectItem value="MTD">MTD</SelectItem>
              <SelectItem value="YTD">YTD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{salesData?.formattedCurrent || '₹0'}</div>
        <p className={`text-xs flex items-center ${
          salesData?.percentageChange && salesData.percentageChange > 0 
            ? 'text-green-600' 
            : salesData?.percentageChange && salesData.percentageChange < 0 
              ? 'text-red-600' 
              : 'text-muted-foreground'
        }`}>
          {salesData?.percentageChange !== undefined && (
            <>
              {salesData.percentageChange >= 0 ? '+' : ''}{salesData.percentageChange}%
              {getPercentageIcon(salesData.percentageChange)}
              {' '}
              {getComparisonText(salesData.period, salesData.percentageChange)}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
} 