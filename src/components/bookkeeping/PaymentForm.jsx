import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Upload, Image } from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useCourses } from '../../hooks/useCourses';
import { useAccounts } from '../../hooks/useAccounts';
import PaymentStudentSelector from './PaymentStudentSelector';
import PaymentCourseSelector from './PaymentCourseSelector';
import PaymentDropdownSelector from './PaymentDropdownSelector';
import PaymentAccountSelector from './PaymentAccountSelector';

/**
 * PaymentForm - Modal form for recording new payments
 * Integrates with student and course data for payment tracking
 */
const PaymentForm = ({ isOpen, onClose, onSubmit, currency = 'EUR' }) => {
  const { students, loading: studentsLoading } = useStudents();
  const { courses, loading: coursesLoading } = useCourses();
  const { accounts, loading: accountsLoading } = useAccounts();
  
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    currency: currency,
    paymentType: 'full_payment',
    paymentAccountId: '',
    status: 'completed',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptImage: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentId: '',
        courseId: '',
        amount: '',
        currency: currency,
        paymentType: 'full_payment',
        paymentAccountId: '',
        status: 'completed',
        notes: '',
        paymentDate: new Date().toISOString().split('T')[0],
        receiptImage: null
      });
      setErrors({});
      setImagePreview(null);
    }
  }, [isOpen, currency]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Please select a payment date';
    }

    if (!formData.paymentAccountId) {
      newErrors.paymentAccountId = 'Please select an account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get student, course, and account details
      const selectedStudent = students.find(s => s.id === formData.studentId);
      const selectedCourse = courses.find(c => c.id === formData.courseId);
      const selectedAccount = accounts.find(a => a.id === formData.paymentAccountId);

      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        studentName: selectedStudent?.fullName || 'Unknown Student',
        studentEmail: selectedStudent?.email || '',
        courseName: selectedCourse?.courseName || selectedCourse?.name || 'Unknown Course',
        accountName: selectedAccount?.name || 'Unknown Account',
        accountType: selectedAccount?.type || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(paymentData);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setErrors({ submit: 'Failed to record payment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Handle file size validation for receipt images
    if (field === 'receiptImage' && value) {
      const maxSize = 3 * 1024 * 1024; // 3MB in bytes
      if (value.size > maxSize) {
        setErrors(prev => ({ ...prev, receiptImage: 'File size must be less than 3MB' }));
        return;
      }
      // Clear any previous file size errors
      if (errors.receiptImage) {
        setErrors(prev => ({ ...prev, receiptImage: '' }));
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle image preview for receipt uploads
    if (field === 'receiptImage' && value) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleInputChange('receiptImage', file);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, receiptImage: null }));
    setImagePreview(null);
  };

  const formatAmount = (value) => {
    if (!value) return '';
    
    // Remove all non-digit characters except decimal point
    const cleanValue = value.toString().replace(/[^\d.,]/g, '');
    
    // Split by comma (decimal separator)
    const parts = cleanValue.split(',');
    const integerPart = parts[0] || '';
    const decimalPart = parts[1] || '';
    
    // Format integer part with dots as thousand separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Limit decimal part to 2 digits
    const limitedDecimal = decimalPart.slice(0, 2);
    
    // Combine parts
    if (limitedDecimal) {
      return `${formattedInteger},${limitedDecimal}`;
    }
    return formattedInteger;
  };

  const parseAmount = (formattedValue) => {
    if (!formattedValue) return '';
    
    // Remove dots (thousand separators) and replace comma with dot for decimal
    return formattedValue.replace(/\./g, '').replace(',', '.');
  };

  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = parseAmount(inputValue);
    
    // Validate that it's a valid number
    if (inputValue === '' || !isNaN(parseFloat(numericValue))) {
      setFormData(prev => ({ ...prev, amount: numericValue }));
    }
    
    // Clear error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Student and Course Selection */}
            <div className="grid grid-cols-2 gap-4">
              <PaymentStudentSelector
                onSelectStudent={(student) => {
                  if (student) {
                    handleInputChange('studentId', student.id);
                  } else {
                    handleInputChange('studentId', '');
                  }
                }}
                selectedStudentId={formData.studentId}
                disabled={studentsLoading}
                error={errors.studentId}
              />

              <PaymentCourseSelector
                onSelectCourse={(course) => {
                  if (course) {
                    handleInputChange('courseId', course.id);
                  } else {
                    handleInputChange('courseId', '');
                  }
                }}
                selectedCourseId={formData.courseId}
                disabled={coursesLoading}
                error={errors.courseId}
              />
            </div>

            {/* Amount and Payment Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatAmount(formData.amount)}
                    onChange={handleAmountChange}
                    className={`w-full pl-3 pr-16 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="0,00"
                  />
                  {/* Currency Selector */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                    <div className="relative">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="appearance-none bg-transparent border-0 text-gray-600 text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer pr-6 pl-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        <option value="VND">VND</option>
                        <option value="EUR">EUR</option>
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.paymentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
                )}
              </div>
            </div>

            {/* Payment Type and Account */}
            <div className="grid grid-cols-2 gap-4">
              <PaymentDropdownSelector
                label="Payment Type"
                icon={FileText}
                options={[
                  { value: 'full_payment', label: 'Full Payment', description: 'Complete course payment' },
                  { value: 'partial_payment', label: 'Partial Payment', description: 'Partial course payment' },
                  { value: 'deposit', label: 'Deposit', description: 'Initial deposit' }
                ]}
                value={formData.paymentType}
                onChange={(value) => handleInputChange('paymentType', value)}
                placeholder="Select payment type..."
              />

              <PaymentAccountSelector
                onSelectAccount={(account) => {
                  if (account) {
                    handleInputChange('paymentAccountId', account.id);
                  } else {
                    handleInputChange('paymentAccountId', '');
                  }
                }}
                selectedAccountId={formData.paymentAccountId}
                disabled={accountsLoading}
                error={errors.paymentAccountId}
              />
            </div>

            {/* Notes and Image Upload */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  Receipt Image (Optional)
                </label>
                
                {imagePreview ? (
                  // Image Preview
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Receipt preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.receiptImage?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.receiptImage?.size ? `${(formData.receiptImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Upload Area
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange('receiptImage', e.target.files[0])}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Drop image here or click to upload
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG up to 3MB
                      </span>
                    </label>
                  </div>
                )}
                
                {/* Error Message for Image Upload */}
                {errors.receiptImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.receiptImage}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Error and Actions */}
        <div className="flex-shrink-0 border-t border-gray-200">
          {/* Submit Error */}
          {errors.submit && (
            <div className="px-6 pt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 