import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const createTestUsers = async () => {
    const testUsers = [
        {
            id: 'test-user-1',
            displayName: 'Alice Johnson',
            email: 'alice@example.com',
            roles: [{ id: 'teacher', name: 'Teacher' }],
            department: 'Teaching',
            isOnboardingComplete: true,
            createdAt: new Date()
        },
        {
            id: 'test-user-2',
            displayName: 'Bob Smith',
            email: 'bob@example.com',
            roles: [{ id: 'accountant', name: 'Accountant' }],
            department: 'Finance',
            isOnboardingComplete: true,
            createdAt: new Date()
        },
        {
            id: 'test-user-3',
            displayName: 'Carol Davis',
            email: 'carol@example.com',
            roles: [{ id: 'support', name: 'Customer Support' }],
            department: 'Customer Support',
            isOnboardingComplete: true,
            createdAt: new Date()
        },
        {
            id: 'test-user-4',
            displayName: 'David Wilson',
            email: 'david@example.com',
            roles: [{ id: 'manager', name: 'Manager' }],
            department: 'Administration',
            isOnboardingComplete: true,
            createdAt: new Date()
        },
        {
            id: 'test-user-5',
            displayName: 'Emma Brown',
            email: 'emma@example.com',
            roles: [{ id: 'teacher', name: 'Teacher' }],
            department: 'Teaching',
            isOnboardingComplete: true,
            createdAt: new Date()
        }
    ];

    try {
        console.log('Creating test users...');
        for (const user of testUsers) {
            const userRef = doc(db, 'users', user.id);
            await setDoc(userRef, user);
            console.log(`Created user: ${user.displayName}`);
        }
        console.log('All test users created successfully!');
        return true;
    } catch (error) {
        console.error('Error creating test users:', error);
        return false;
    }
};

// Function to call from browser console for testing
window.createTestUsers = createTestUsers; 