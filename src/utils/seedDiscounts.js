import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const defaultDiscounts = [
  {
    name: 'Student Discount',
    type: 'percentage',
    value: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Early Bird',
    type: 'percentage',
    value: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Loyalty Discount',
    type: 'percentage',
    value: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Group Discount',
    type: 'percentage',
    value: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Seasonal Promotion',
    type: 'fixed_amount',
    value: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const seedDiscounts = async () => {
  try {
    // Check if discounts already exist
    const discountsRef = collection(db, 'discounts');
    const snapshot = await getDocs(discountsRef);
    
    if (snapshot.empty) {
      console.log('Seeding discounts collection...');
      
      for (const discount of defaultDiscounts) {
        await addDoc(discountsRef, discount);
        console.log(`Added discount: ${discount.name}`);
      }
      
      console.log('Discounts seeded successfully!');
    } else {
      console.log('Discounts collection already has data, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding discounts:', error);
  }
};

// Run the seed function if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.seedDiscounts = seedDiscounts;
} 