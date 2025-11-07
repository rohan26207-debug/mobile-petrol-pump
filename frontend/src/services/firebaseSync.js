// Firebase Sync Service - Works alongside localStorage
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, getDeviceId, initializeAuth } from './firebase';
import localStorageService from './localStorage';

class FirebaseSyncService {
  constructor() {
    this.deviceId = getDeviceId();
    this.syncEnabled = true;
    this.listeners = [];
    this.initialized = false;
  }

  // Get current user ID
  getUserId() {
    const { auth } = require('./firebase');
    return auth.currentUser?.uid || null;
  }

  // Initialize Firebase sync
  async initialize() {
    if (this.initialized) return;
    
    try {
      await initializeAuth();
      console.log('✅ Firebase sync service initialized');
      this.initialized = true;
      
      // Wait for auth to be ready before starting listeners
      await this.waitForAuth();
      
      // Start listening for changes from other devices
      this.startListeners();
    } catch (error) {
      console.error('❌ Firebase sync initialization failed:', error);
      // Continue without sync - offline mode will still work
    }
  }

  // Wait for authentication to be ready
  async waitForAuth(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
      const userId = this.getUserId();
      if (userId) {
        console.log('✅ Auth ready, user ID:', userId);
        return userId;
      }
      console.log(`⏳ Waiting for auth... attempt ${i + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    }
    throw new Error('Authentication timeout - user not logged in');
  }

  // Enable/Disable sync
  setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
    console.log(`🔄 Firebase sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  // ==================== CUSTOMERS ====================

  async syncCustomer(customer, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      
      if (!userId) {
        console.log('📴 User not authenticated, skipping sync');
        return;
      }

      const customerData = {
        ...customer,
        userId,  // Add user ID for security
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'customers', customer.id);
        await updateDoc(docRef, customerData).catch(() => {
          // Document doesn't exist, create it
          return addDoc(collection(db, 'customers'), { ...customerData, id: customer.id });
        });
        console.log('✅ Customer synced:', customer.name);
      } else if (operation === 'delete') {
        const docRef = doc(db, 'customers', customer.id);
        await deleteDoc(docRef);
        console.log('✅ Customer deleted from cloud:', customer.name);
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
      // Firebase will automatically retry when online
    }
  }

  // ==================== CREDIT SALES ====================

  async syncCreditSale(credit, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      if (!userId) return;

      const creditData = {
        ...credit,
        userId,
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'creditSales', credit.id);
        await updateDoc(docRef, creditData).catch(() => {
          return addDoc(collection(db, 'creditSales'), { ...creditData, id: credit.id });
        });
        console.log('✅ Credit sale synced:', credit.customerName);
      } else if (operation === 'delete') {
        const docRef = doc(db, 'creditSales', credit.id);
        await deleteDoc(docRef);
        console.log('✅ Credit sale deleted from cloud:', credit.customerName);
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
    }
  }

  // ==================== PAYMENTS ====================

  async syncPayment(payment, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      if (!userId) return;

      const paymentData = {
        ...payment,
        userId,
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'payments', payment.id);
        await updateDoc(docRef, paymentData).catch(() => {
          return addDoc(collection(db, 'payments'), { ...paymentData, id: payment.id });
        });
        console.log('✅ Payment synced:', payment.customerName);
      } else if (operation === 'delete') {
        const docRef = doc(db, 'payments', payment.id);
        await deleteDoc(docRef);
        console.log('✅ Payment deleted from cloud:', payment.customerName);
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
    }
  }

  // ==================== SETTLEMENTS ====================

  async syncSettlement(settlement, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      if (!userId) return;

      const settlementData = {
        ...settlement,
        userId,
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'settlements', settlement.id);
        await updateDoc(docRef, settlementData).catch(() => {
          return addDoc(collection(db, 'settlements'), { ...settlementData, id: settlement.id });
        });
        console.log('✅ Settlement synced');
      } else if (operation === 'delete') {
        const docRef = doc(db, 'settlements', settlement.id);
        await deleteDoc(docRef);
        console.log('✅ Settlement deleted from cloud');
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
    }
  }

  // ==================== SALES ====================

  async syncSale(sale, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      if (!userId) return;

      const saleData = {
        ...sale,
        userId,
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'sales', sale.id);
        await updateDoc(docRef, saleData).catch(() => {
          return addDoc(collection(db, 'sales'), { ...saleData, id: sale.id });
        });
        console.log('✅ Sale synced');
      } else if (operation === 'delete') {
        const docRef = doc(db, 'sales', sale.id);
        await deleteDoc(docRef);
        console.log('✅ Sale deleted from cloud');
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
    }
  }

  // ==================== INCOME/EXPENSES ====================

  async syncIncomeExpense(record, operation = 'add') {
    if (!this.syncEnabled) return;

    try {
      const userId = this.getUserId();
      if (!userId) return;

      const recordData = {
        ...record,
        userId,
        deviceId: this.deviceId,
        syncedAt: serverTimestamp(),
        operation
      };

      if (operation === 'add' || operation === 'update') {
        const docRef = doc(db, 'incomeExpenses', record.id);
        await updateDoc(docRef, recordData).catch(() => {
          return addDoc(collection(db, 'incomeExpenses'), { ...recordData, id: record.id });
        });
        console.log('✅ Income/Expense synced');
      } else if (operation === 'delete') {
        const docRef = doc(db, 'incomeExpenses', record.id);
        await deleteDoc(docRef);
        console.log('✅ Income/Expense deleted from cloud');
      }
    } catch (error) {
      console.log('📴 Will sync when online:', error.message);
    }
  }

  // ==================== BULK SYNC ====================

  // Sync all local data to cloud (useful for initial setup or after being offline)
  async syncAllLocalData() {
    if (!this.syncEnabled) return;

    console.log('🔄 Starting bulk sync of local data to cloud...');

    try {
      // Get all local data
      const customers = localStorageService.getCustomers();
      const creditSales = localStorageService.getCreditData();
      const payments = localStorageService.getPayments();
      const settlements = localStorageService.getSettlements();
      const sales = localStorageService.getSalesData();
      const incomeExpenses = localStorageService.getIncomeExpenseData();

      // Sync customers
      for (const customer of customers) {
        await this.syncCustomer(customer, 'add');
      }

      // Sync credit sales
      for (const credit of creditSales) {
        await this.syncCreditSale(credit, 'add');
      }

      // Sync payments
      for (const payment of payments) {
        await this.syncPayment(payment, 'add');
      }

      // Sync settlements
      for (const settlement of settlements) {
        await this.syncSettlement(settlement, 'add');
      }

      // Sync sales
      for (const sale of sales) {
        await this.syncSale(sale, 'add');
      }

      // Sync income/expenses
      for (const record of incomeExpenses) {
        await this.syncIncomeExpense(record, 'add');
      }

      console.log('✅ Bulk sync completed successfully');
    } catch (error) {
      console.error('❌ Bulk sync failed:', error);
    }
  }

  // ==================== LISTENERS ====================

  // Listen for changes from other devices
  startListeners() {
    console.log('👂 Starting Firebase listeners for real-time updates...');

    const userId = this.getUserId();
    if (!userId) {
      console.log('❌ User not authenticated, cannot start listeners');
      console.log('⚠️ This means cross-device sync will NOT work!');
      return;
    }

    console.log('✅ User authenticated, starting listeners for user:', userId);

    // Listen to customers (only user's own data)
    const customersListener = onSnapshot(
      query(collection(db, 'customers'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          // Ignore changes from this device
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Customer update from another device:', data.name);
            // Update localStorage with the new data
            const customers = localStorageService.getCustomers();
            const existingIndex = customers.findIndex(c => c.id === data.id);
            
            if (existingIndex >= 0) {
              customers[existingIndex] = data;
            } else {
              customers.push(data);
            }
            
            localStorage.setItem('customers', JSON.stringify(customers));
            
            // Trigger custom event to update UI
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Customer deleted from another device:', data.name);
            const customers = localStorageService.getCustomers();
            const filtered = customers.filter(c => c.id !== data.id);
            localStorage.setItem('customers', JSON.stringify(filtered));
            
            // Trigger custom event to update UI
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error (will retry when online):', error.message);
      }
    );

    // Listen to credit sales (only user's own data)
    const creditSalesListener = onSnapshot(
      query(collection(db, 'creditSales'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Credit sale update from another device');
            const credits = localStorageService.getCreditData();
            const existingIndex = credits.findIndex(c => c.id === data.id);
            
            if (existingIndex >= 0) {
              credits[existingIndex] = data;
            } else {
              credits.push(data);
            }
            
            localStorage.setItem('creditData', JSON.stringify(credits));
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Credit sale deleted from another device');
            const credits = localStorageService.getCreditData();
            const filtered = credits.filter(c => c.id !== data.id);
            localStorage.setItem('creditData', JSON.stringify(filtered));
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    // Listen to payments (only user's own data)
    const paymentsListener = onSnapshot(
      query(collection(db, 'payments'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Payment update from another device');
            const payments = localStorageService.getPayments();
            const existingIndex = payments.findIndex(p => p.id === data.id);
            
            if (existingIndex >= 0) {
              payments[existingIndex] = data;
            } else {
              payments.push(data);
            }
            
            localStorage.setItem('payments', JSON.stringify(payments));
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Payment deleted from another device');
            const payments = localStorageService.getPayments();
            const filtered = payments.filter(p => p.id !== data.id);
            localStorage.setItem('payments', JSON.stringify(filtered));
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    // Listen to settlements
    const settlementsListener = onSnapshot(
      query(collection(db, 'settlements'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Settlement update from another device');
            const settlements = localStorageService.getSettlements();
            const existingIndex = settlements.findIndex(s => s.id === data.id);
            
            if (existingIndex >= 0) {
              settlements[existingIndex] = data;
            } else {
              settlements.push(data);
            }
            
            localStorage.setItem('settlements', JSON.stringify(settlements));
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Settlement deleted from another device');
            const settlements = localStorageService.getSettlements();
            const filtered = settlements.filter(s => s.id !== data.id);
            localStorage.setItem('settlements', JSON.stringify(filtered));
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    // Listen to sales
    const salesListener = onSnapshot(
      query(collection(db, 'sales'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Sale update from another device');
            const sales = localStorageService.getSalesData();
            const existingIndex = sales.findIndex(s => s.id === data.id);
            
            if (existingIndex >= 0) {
              sales[existingIndex] = data;
            } else {
              sales.push(data);
            }
            
            localStorage.setItem('salesData', JSON.stringify(sales));
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Sale deleted from another device');
            const sales = localStorageService.getSalesData();
            const filtered = sales.filter(s => s.id !== data.id);
            localStorage.setItem('salesData', JSON.stringify(filtered));
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    // Listen to income/expenses
    const incomeExpensesListener = onSnapshot(
      query(collection(db, 'incomeExpenses'), where('userId', '==', userId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          
          if (data.deviceId === this.deviceId) return;

          if (change.type === 'added' || change.type === 'modified') {
            console.log('📥 Income/Expense update from another device');
            const records = localStorageService.getIncomeExpenseData();
            const existingIndex = records.findIndex(r => r.id === data.id);
            
            if (existingIndex >= 0) {
              records[existingIndex] = data;
            } else {
              records.push(data);
            }
            
            // Split into income and expense arrays
            const income = records.filter(r => r.type === 'income');
            const expense = records.filter(r => r.type === 'expense');
            
            localStorage.setItem('incomeData', JSON.stringify(income));
            localStorage.setItem('expenseData', JSON.stringify(expense));
            window.dispatchEvent(new Event('localStorageChange'));
          } else if (change.type === 'removed') {
            console.log('📥 Income/Expense deleted from another device');
            const records = localStorageService.getIncomeExpenseData();
            const filtered = records.filter(r => r.id !== data.id);
            
            // Split into income and expense arrays
            const income = filtered.filter(r => r.type === 'income');
            const expense = filtered.filter(r => r.type === 'expense');
            
            localStorage.setItem('incomeData', JSON.stringify(income));
            localStorage.setItem('expenseData', JSON.stringify(expense));
            window.dispatchEvent(new Event('localStorageChange'));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    this.listeners.push(customersListener, creditSalesListener, paymentsListener, settlementsListener, salesListener, incomeExpensesListener);
  }

  // Stop all listeners
  stopListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
    console.log('🛑 Firebase listeners stopped');
  }

  // Get sync status
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      deviceId: this.deviceId,
      initialized: this.initialized
    };
  }
}

// Export singleton instance
const firebaseSyncService = new FirebaseSyncService();

// Auto-initialize
firebaseSyncService.initialize().catch(err => {
  console.log('📴 Firebase sync will work when online:', err.message);
});

export default firebaseSyncService;
