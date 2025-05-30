import React from 'react';
import { Award } from 'lucide-react';

const StudentPaymentsTab = ({ student }) => {
  return (
    <div className="space-y-6 p-1 h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Payment History</h3>
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors">
          Record Payment
        </button>
      </div>
      
      {/* Show payment history or placeholder */}
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[340px]">
        <Award className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-500">No payment records found</p>
        <p className="text-xs text-gray-400 mt-2 max-w-sm">Record a payment to track this student's financial history</p>
      </div>
    </div>
  );
};

export default StudentPaymentsTab; 