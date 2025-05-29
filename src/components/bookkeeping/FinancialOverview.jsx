import React from 'react';
import { TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';

/**
 * FinancialOverview - Displays key financial metrics in card format
 * Shows total revenue, monthly revenue, pending payments, and exchange rates
 */
const FinancialOverview = ({ currency = 'EUR' }) => {
  const { payments, loading, getFinancialStats } = usePayments();
  
  // Get financial statistics
  const stats = getFinancialStats(currency);
  
  // Exchange rate data (in a real app, this would come from an API)
  const exchangeRates = {
    'EUR': { 'VND': 26000, 'USD': 1.08 },
    'VND': { 'EUR': 0.000038, 'USD': 0.000041 },
    'USD': { 'EUR': 0.93, 'VND': 24300 }
  };

  const formatCurrency = (amount, curr = currency) => {
    const formatters = {
      'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      'VND': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
      'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    };
    
    return formatters[curr]?.format(amount) || `${curr} ${amount.toLocaleString()}`;
  };

  const getExchangeRateDisplay = () => {
    if (currency === 'EUR') {
      return `1 EUR = ${exchangeRates.EUR.VND.toLocaleString()} VND`;
    } else if (currency === 'VND') {
      return `1 VND = ${exchangeRates.VND.EUR} EUR`;
    } else {
      return `1 USD = ${exchangeRates.USD.EUR} EUR`;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {/* Total Revenue */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <span className="text-green-500">
            <TrendingUp className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </span>
          <span className="ml-2 text-sm text-green-500">+{stats.totalGrowthPercent}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">vs. previous period</div>
      </div>
      
      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <span className="text-green-500">
            <TrendingUp className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.monthlyRevenue)}
          </span>
          <span className="ml-2 text-sm text-green-500">+{stats.monthlyGrowthPercent}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">vs. previous month</div>
      </div>
      
      {/* Pending Payments */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
          <span className="text-yellow-500">
            <Clock className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.pendingAmount)}
          </span>
          <span className="ml-2 text-sm text-yellow-500">{stats.pendingCount} pending</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">Due this month</div>
      </div>
      
      {/* Exchange Rate */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Exchange Rate</h3>
          <span className="text-blue-500">
            <RefreshCw className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-lg font-bold text-gray-900">
            {getExchangeRateDisplay()}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">Updated 5 mins ago</div>
      </div>
    </div>
  );
};

export default FinancialOverview; 