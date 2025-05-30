import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, FileText, MoreVertical } from 'lucide-react';
import { usePayments } from '../../../hooks/usePayments';

const StudentPaymentsTab = ({ student }) => {
  const [studentPayments, setStudentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getPaymentsByStudent } = usePayments();

  // Load student payments when component mounts or student changes
  useEffect(() => {
    const loadPayments = async () => {
      if (!student?.id && !student?.studentId) {
        setStudentPayments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try both student.id and student.studentId as the payment might reference either
        const studentId = student.id || student.studentId;
        const payments = await getPaymentsByStudent(studentId);
        setStudentPayments(payments);
      } catch (error) {
        console.error('Error loading student payments:', error);
        setStudentPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [student?.id, student?.studentId, getPaymentsByStudent]);

  // Format currency (matching your VND format from screenshot)
  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return '0 ' + currency;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount).replace('₫', currency);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Calculate totals
  const totalPaid = studentPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  const pendingAmount = studentPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6 p-1 h-full">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Payment History</h3>
          <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors">
            Record Payment
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[340px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
          <p className="text-sm text-gray-500">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Payment History</h3>
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors">
          Record Payment
        </button>
      </div>
      
      {studentPayments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[340px]">
          <CreditCard className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-500">No payment records found</p>
          <p className="text-xs text-gray-400 mt-2 max-w-sm">Record a payment to track this student's financial history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-600">Total Paid</p>
                  <p className="text-lg font-semibold text-green-700">
                    {formatCurrency(totalPaid, studentPayments[0]?.currency)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-xs font-medium text-yellow-600">Pending</p>
                  <p className="text-lg font-semibold text-yellow-700">
                    {formatCurrency(pendingAmount, studentPayments[0]?.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {studentPayments.map((payment) => (
              <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {payment.paymentType || 'Payment'} • {payment.paymentMethod || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>Date: {formatDate(payment.paymentDate || payment.createdAt)}</span>
                        {payment.courseName && <span>Course: {payment.courseName}</span>}
                      </div>
                      {payment.notes && (
                        <div className="flex items-start space-x-1">
                          <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="italic">{payment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(payment.status)}
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentsTab; 