import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookkeepingLayout } from './layout';
import FinancialOverview from './FinancialOverview';
import PaymentForm from './PaymentForm';
import PaymentsList from './PaymentsList';
import RevenueChart from './RevenueChart';
import { Plus, Download } from 'lucide-react';

/**
 * BookkeepingInterface - Main bookkeeping application component
 * Handles financial management, payments tracking, and revenue analytics
 */
const BookkeepingInterface = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');

  const handleRecordPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentFormClose = () => {
    setShowPaymentForm(false);
  };

  const handlePaymentSubmit = (paymentData) => {
    // Handle payment submission
    console.log('Payment submitted:', paymentData);
    setShowPaymentForm(false);
  };

  const handleExportData = () => {
    // Handle data export
    console.log('Exporting financial data...');
  };

  return (
    <BookkeepingLayout
      userProfile={userProfile}
      currentUser={currentUser}
      onLogout={logout}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">Financial Overview</h1>
          <button
            onClick={handleRecordPayment}
            className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Record Payment
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="EUR">EUR</option>
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
          <button
            onClick={handleExportData}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Export Data"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Financial Overview Cards */}
        <FinancialOverview currency={selectedCurrency} />

        {/* Recent Transactions */}
        <div className="px-6">
          <PaymentsList currency={selectedCurrency} />
        </div>

        {/* Revenue Chart */}
        <div className="p-6">
          <RevenueChart currency={selectedCurrency} />
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          isOpen={showPaymentForm}
          onClose={handlePaymentFormClose}
          onSubmit={handlePaymentSubmit}
          currency={selectedCurrency}
        />
      )}
    </BookkeepingLayout>
  );
};

export default BookkeepingInterface; 