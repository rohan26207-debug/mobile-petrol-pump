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
      
      // Start listening for changes from other devices
      this.startListeners();
    } catch (error) {
      console.error('❌ Firebase sync initialization failed:', error);
      // Continue without sync - offline mode will still work
    }
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
      const creditData = {
        ...credit,
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
      const paymentData = {
        ...payment,
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
      const settlementData = {
        ...settlement,
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
      const saleData = {
        ...sale,
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
      const recordData = {
        ...record,
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

    // Listen to customers
    const customersListener = onSnapshot(
      collection(db, 'customers'),
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
          } else if (change.type === 'removed') {
            console.log('📥 Customer deleted from another device:', data.name);
            const customers = localStorageService.getCustomers();
            const filtered = customers.filter(c => c.id !== data.id);
            localStorage.setItem('customers', JSON.stringify(filtered));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error (will retry when online):', error.message);
      }
    );

    // Listen to credit sales
    const creditSalesListener = onSnapshot(
      collection(db, 'creditSales'),
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
          } else if (change.type === 'removed') {
            console.log('📥 Credit sale deleted from another device');
            const credits = localStorageService.getCreditData();
            const filtered = credits.filter(c => c.id !== data.id);
            localStorage.setItem('creditData', JSON.stringify(filtered));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    // Listen to payments
    const paymentsListener = onSnapshot(
      collection(db, 'payments'),
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
          } else if (change.type === 'removed') {
            console.log('📥 Payment deleted from another device');
            const payments = localStorageService.getPayments();
            const filtered = payments.filter(p => p.id !== data.id);
            localStorage.setItem('payments', JSON.stringify(filtered));
          }
        });
      },
      (error) => {
        console.log('📴 Listener error:', error.message);
      }
    );

    this.listeners.push(customersListener, creditSalesListener, paymentsListener);
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
