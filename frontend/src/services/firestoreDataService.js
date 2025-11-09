/**
 * Firestore Data Service
 * All business data operations go directly to Firestore (cloud-first approach)
 * No localStorage caching for business data
 */

import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

class FirestoreDataService {
  
  // Get current user ID
  getUserId() {
    return auth.currentUser?.uid || null;
  }

  // ===== SALES DATA =====
  
  async getSalesData(date = null) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const salesQuery = date
        ? query(collection(db, 'sales'), where('userId', '==', userId), where('date', '==', date))
        : query(collection(db, 'sales'), where('userId', '==', userId), orderBy('date', 'desc'));
      
      const snapshot = await getDocs(salesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  async addSale(saleData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'sales'), {
        ...saleData,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  }

  async updateSale(saleId, saleData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      await updateDoc(doc(db, 'sales', saleId), {
        ...saleData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  }

  async deleteSale(saleId) {
    try {
      await deleteDoc(doc(db, 'sales', saleId));
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }

  // ===== CREDIT SALES =====
  
  async getCreditSales(date = null) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const creditsQuery = date
        ? query(collection(db, 'creditSales'), where('userId', '==', userId), where('date', '==', date))
        : query(collection(db, 'creditSales'), where('userId', '==', userId), orderBy('date', 'desc'));
      
      const snapshot = await getDocs(creditsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching credit sales:', error);
      throw error;
    }
  }

  async addCreditSale(creditData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'creditSales'), {
        ...creditData,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding credit sale:', error);
      throw error;
    }
  }

  async updateCreditSale(creditId, creditData) {
    try {
      await updateDoc(doc(db, 'creditSales', creditId), {
        ...creditData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating credit sale:', error);
      throw error;
    }
  }

  async deleteCreditSale(creditId) {
    try {
      await deleteDoc(doc(db, 'creditSales', creditId));
    } catch (error) {
      console.error('Error deleting credit sale:', error);
      throw error;
    }
  }

  // ===== CUSTOMERS =====
  
  async getCustomers() {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const customersQuery = query(collection(db, 'customers'), where('userId', '==', userId));
      const snapshot = await getDocs(customersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async addCustomer(customerData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customerData,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      await updateDoc(doc(db, 'customers', customerId), {
        ...customerData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId) {
    try {
      await deleteDoc(doc(db, 'customers', customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // ===== PAYMENTS =====
  
  async getPayments(date = null) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const paymentsQuery = date
        ? query(collection(db, 'payments'), where('userId', '==', userId), where('date', '==', date))
        : query(collection(db, 'payments'), where('userId', '==', userId), orderBy('date', 'desc'));
      
      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async addPayment(paymentData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentData,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  async updatePayment(paymentId, paymentData) {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        ...paymentData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(paymentId) {
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // ===== SETTLEMENTS =====
  
  async getSettlements(date = null) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const settlementsQuery = date
        ? query(collection(db, 'settlements'), where('userId', '==', userId), where('date', '==', date))
        : query(collection(db, 'settlements'), where('userId', '==', userId), orderBy('date', 'desc'));
      
      const snapshot = await getDocs(settlementsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching settlements:', error);
      throw error;
    }
  }

  async addSettlement(settlementData) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'settlements'), {
        ...settlementData,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding settlement:', error);
      throw error;
    }
  }

  async updateSettlement(settlementId, settlementData) {
    try {
      await updateDoc(doc(db, 'settlements', settlementId), {
        ...settlementData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating settlement:', error);
      throw error;
    }
  }

  async deleteSettlement(settlementId) {
    try {
      await deleteDoc(doc(db, 'settlements', settlementId));
    } catch (error) {
      console.error('Error deleting settlement:', error);
      throw error;
    }
  }

  // ===== INCOME/EXPENSES =====
  
  async getIncomeExpenses(date = null) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const incomeExpensesQuery = date
        ? query(collection(db, 'incomeExpenses'), where('userId', '==', userId), where('date', '==', date))
        : query(collection(db, 'incomeExpenses'), where('userId', '==', userId), orderBy('date', 'desc'));
      
      const snapshot = await getDocs(incomeExpensesQuery);
      const allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Separate into income and expenses
      const income = allRecords.filter(r => r.type === 'income');
      const expenses = allRecords.filter(r => r.type === 'expense');
      
      return { income, expenses };
    } catch (error) {
      console.error('Error fetching income/expenses:', error);
      throw error;
    }
  }

  async addIncomeExpense(data) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'incomeExpenses'), {
        ...data,
        userId,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding income/expense:', error);
      throw error;
    }
  }

  async updateIncomeExpense(recordId, data) {
    try {
      await updateDoc(doc(db, 'incomeExpenses', recordId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating income/expense:', error);
      throw error;
    }
  }

  async deleteIncomeExpense(recordId) {
    try {
      await deleteDoc(doc(db, 'incomeExpenses', recordId));
    } catch (error) {
      console.error('Error deleting income/expense:', error);
      throw error;
    }
  }

  // ===== FUEL SETTINGS =====
  
  async getFuelSettings() {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = doc(db, 'fuelSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().settings || {};
      } else {
        // Return default settings if none exist
        return {
          'Diesel': { price: 90.46, nozzleCount: 2 },
          'Petrol': { price: 102.50, nozzleCount: 3 },
          'CNG': { price: 75.20, nozzleCount: 2 },
          'Premium': { price: 108.90, nozzleCount: 1 }
        };
      }
    } catch (error) {
      console.error('Error fetching fuel settings:', error);
      throw error;
    }
  }

  async saveFuelSettings(settings) {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = doc(db, 'fuelSettings', userId);
      await updateDoc(docRef, {
        settings,
        updatedAt: Timestamp.now()
      }).catch(async (error) => {
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
          await addDoc(collection(db, 'fuelSettings'), {
            userId,
            settings,
            timestamp: Timestamp.now()
          });
        } else {
          throw error;
        }
      });
    } catch (error) {
      console.error('Error saving fuel settings:', error);
      throw error;
    }
  }
}

const firestoreDataService = new FirestoreDataService();
export default firestoreDataService;
