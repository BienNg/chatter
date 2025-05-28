import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useFunnelSteps() {
  const [funnelSteps, setFunnelSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFunnelSteps = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'funnelSteps'));
      const steps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFunnelSteps(steps);
    } catch (error) {
      console.error('Error fetching funnel steps:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchFunnelSteps(); 
  }, [fetchFunnelSteps]);

  const addFunnelStep = async (step) => {
    try {
      const trimmedStep = step.trim();
      const exists = funnelSteps.some(existingStep => 
        existingStep.value.toLowerCase() === trimmedStep.toLowerCase()
      );
      
      if (exists) {
        throw new Error(`Funnel step "${trimmedStep}" already exists`);
      }
      
      const docRef = await addDoc(collection(db, 'funnelSteps'), { value: trimmedStep });
      
      // Add to local state immediately
      const newStep = { id: docRef.id, value: trimmedStep };
      setFunnelSteps(prev => [...prev, newStep]);
      
      return newStep;
    } catch (error) {
      console.error('Error adding funnel step:', error);
      throw error;
    }
  };

  const deleteFunnelStep = async (id) => {
    try {
      await deleteDoc(doc(db, 'funnelSteps', id));
      setFunnelSteps(prev => prev.filter(step => step.id !== id));
    } catch (error) {
      console.error('Error deleting funnel step:', error);
      throw error;
    }
  };

  return { 
    funnelSteps: funnelSteps.map(step => step.value), 
    loading, 
    addFunnelStep, 
    deleteFunnelStep 
  };
} 