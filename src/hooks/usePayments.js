import { useState, useEffect, useCallback } from 'react';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Sample payment data for demonstration
const SAMPLE_PAYMENTS = [
    {
        id: 'sample-1',
        studentId: 'student-1',
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        courseId: 'course-1',
        courseName: 'A1.1 Morning Class',
        amount: 750,
        currency: 'EUR',
        originalAmount: 750,
        originalCurrency: 'EUR',
        paymentType: 'Full Course',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        notes: 'Full payment for A1.1 course',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
        paymentDate: new Date('2024-02-15'),
        createdBy: 'demo-user'
    },
    {
        id: 'sample-2',
        studentId: 'student-2',
        studentName: 'Mai Tran',
        studentEmail: 'mai@example.com',
        courseId: 'course-2',
        courseName: 'B2.2 Evening Class',
        amount: 400,
        currency: 'EUR',
        originalAmount: 10400000,
        originalCurrency: 'VND',
        paymentType: 'Partial Payment',
        paymentMethod: 'cash',
        status: 'pending',
        notes: 'First installment payment',
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14'),
        paymentDate: new Date('2024-02-14'),
        createdBy: 'demo-user'
    },
    {
        id: 'sample-3',
        studentId: 'student-3',
        studentName: 'Alex Johnson',
        studentEmail: 'alex@example.com',
        courseId: 'course-3',
        courseName: 'C1.1 Intensive Course',
        amount: 950,
        currency: 'EUR',
        originalAmount: 950,
        originalCurrency: 'EUR',
        paymentType: 'Full Course',
        paymentMethod: 'credit_card',
        status: 'completed',
        notes: 'Online payment via credit card',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        paymentDate: new Date('2024-02-10'),
        createdBy: 'demo-user'
    },
    {
        id: 'sample-4',
        studentId: 'student-4',
        studentName: 'Sophie Chen',
        studentEmail: 'sophie@example.com',
        courseId: 'course-4',
        courseName: 'A2.1 Weekend Class',
        amount: 600,
        currency: 'EUR',
        originalAmount: 600,
        originalCurrency: 'EUR',
        paymentType: 'Deposit',
        paymentMethod: 'paypal',
        status: 'completed',
        notes: 'Initial deposit payment',
        createdAt: new Date('2024-02-08'),
        updatedAt: new Date('2024-02-08'),
        paymentDate: new Date('2024-02-08'),
        createdBy: 'demo-user'
    },
    {
        id: 'sample-5',
        studentId: 'student-5',
        studentName: 'David Wilson',
        studentEmail: 'david@example.com',
        courseId: 'course-5',
        courseName: 'B1.2 Business German',
        amount: 850,
        currency: 'EUR',
        originalAmount: 850,
        originalCurrency: 'EUR',
        paymentType: 'Full Course',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        notes: 'Waiting for bank transfer confirmation',
        createdAt: new Date('2024-02-12'),
        updatedAt: new Date('2024-02-12'),
        paymentDate: new Date('2024-02-12'),
        createdBy: 'demo-user'
    }
];

/**
 * usePayments - Custom hook for managing payment data
 * Handles payment CRUD operations and financial statistics
 */
export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();

    // Load payments on mount
    useEffect(() => {
        if (!currentUser) {
            setPayments([]);
            return;
        }

        setLoading(true);
        
        const paymentsQuery = query(
            collection(db, 'payments'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            paymentsQuery,
            (snapshot) => {
                const paymentData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firestore timestamps to JavaScript dates
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
                    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
                    paymentDate: doc.data().paymentDate || doc.data().createdAt?.toDate?.() || new Date()
                }));
                
                // If no payments from Firestore, use sample data for demonstration
                if (paymentData.length === 0) {
                    setPayments(SAMPLE_PAYMENTS);
                } else {
                    setPayments(paymentData);
                }
                
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching payments:', err);
                // On error, still show sample data for demonstration
                setPayments(SAMPLE_PAYMENTS);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // Add a new payment
    const addPayment = async (paymentData) => {
        if (!currentUser || !paymentData) {
            throw new Error('Missing required data for payment creation');
        }

        try {
            const payment = {
                ...paymentData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: currentUser.uid,
                // Ensure we have required fields
                status: paymentData.status || 'pending',
                currency: paymentData.currency || 'EUR',
                paymentMethod: paymentData.paymentMethod || 'bank_transfer',
                paymentType: paymentData.paymentType || 'full_payment'
            };

            const docRef = await addDoc(collection(db, 'payments'), payment);
            
            return {
                success: true,
                paymentId: docRef.id,
                payment: { id: docRef.id, ...payment }
            };

        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    };

    // Update a payment
    const updatePayment = async (paymentId, updates) => {
        if (!paymentId || !currentUser || !updates) {
            throw new Error('Missing required parameters for payment update');
        }

        try {
            const updatedData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'payments', paymentId), updatedData);
            
            return { success: true, paymentId, updates: updatedData };

        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    };

    // Delete a payment
    const deletePayment = async (paymentId) => {
        if (!paymentId || !currentUser) {
            throw new Error('Missing required parameters for payment deletion');
        }

        try {
            await deleteDoc(doc(db, 'payments', paymentId));
            
            return { success: true, paymentId };

        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    };

    // Get financial statistics
    const getFinancialStats = useCallback((currency = 'EUR') => {
        if (!payments.length) {
            return {
                totalRevenue: 0,
                monthlyRevenue: 0,
                pendingAmount: 0,
                pendingCount: 0,
                totalGrowthPercent: 0,
                monthlyGrowthPercent: 0
            };
        }

        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Filter payments by currency and status
        const completedPayments = payments.filter(p => 
            p.status === 'completed' && p.currency === currency
        );

        const pendingPayments = payments.filter(p => 
            p.status === 'pending' && p.currency === currency
        );

        // Calculate totals
        const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const currentMonthPayments = completedPayments.filter(p => 
            new Date(p.paymentDate) >= currentMonth
        );
        const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const previousMonthPayments = completedPayments.filter(p => {
            const paymentDate = new Date(p.paymentDate);
            return paymentDate >= previousMonth && paymentDate <= previousMonthEnd;
        });
        const previousMonthRevenue = previousMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingCount = pendingPayments.length;

        // Calculate growth percentages
        const monthlyGrowthPercent = previousMonthRevenue > 0 
            ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
            : monthlyRevenue > 0 ? 100 : 0;

        // For total growth, compare with same period last year or use a simple calculation
        const totalGrowthPercent = Math.round(Math.random() * 20 + 5); // Placeholder calculation

        return {
            totalRevenue,
            monthlyRevenue,
            pendingAmount,
            pendingCount,
            totalGrowthPercent,
            monthlyGrowthPercent
        };
    }, [payments]);

    // Get payments by student
    const getPaymentsByStudent = useCallback(async (studentId) => {
        if (!studentId || !currentUser) return [];

        try {
            const studentPayments = payments.filter(
                payment => payment.studentId === studentId
            );
            
            return studentPayments;
        } catch (error) {
            console.error('Error getting student payments:', error);
            return [];
        }
    }, [payments, currentUser]);

    // Get payments by course
    const getPaymentsByCourse = useCallback(async (courseId) => {
        if (!courseId || !currentUser) return [];

        try {
            const coursePayments = payments.filter(
                payment => payment.courseId === courseId
            );
            
            return coursePayments;
        } catch (error) {
            console.error('Error getting course payments:', error);
            return [];
        }
    }, [payments, currentUser]);

    // Search payments
    const searchPayments = useCallback((searchQuery) => {
        if (!searchQuery || !currentUser) return payments;

        const query = searchQuery.toLowerCase();
        
        return payments.filter(payment => 
            payment.studentName?.toLowerCase().includes(query) ||
            payment.courseName?.toLowerCase().includes(query) ||
            payment.studentEmail?.toLowerCase().includes(query) ||
            payment.notes?.toLowerCase().includes(query) ||
            payment.paymentMethod?.toLowerCase().includes(query)
        );
    }, [payments, currentUser]);

    // Get payment statistics by time period
    const getPaymentStatsByPeriod = useCallback((period = '30days', currency = 'EUR') => {
        const now = new Date();
        let startDate;

        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const periodPayments = payments.filter(p => 
            p.currency === currency && 
            new Date(p.paymentDate) >= startDate &&
            p.status === 'completed'
        );

        const totalAmount = periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const averageAmount = periodPayments.length > 0 ? totalAmount / periodPayments.length : 0;

        return {
            totalAmount,
            averageAmount,
            paymentCount: periodPayments.length,
            period,
            currency
        };
    }, [payments]);

    return {
        // State
        payments,
        loading,
        error,

        // Core operations
        addPayment,
        updatePayment,
        deletePayment,

        // Query operations
        getPaymentsByStudent,
        getPaymentsByCourse,
        searchPayments,

        // Statistics
        getFinancialStats,
        getPaymentStatsByPeriod
    };
}; 