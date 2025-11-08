/**
 * Local Storage Service for Offline M.Pump Calc
 * Handles all data persistence in browser localStorage
 * Now with Firebase sync for multi-device support
 * Adds per-user namespacing so different users never see each other's data
 */

// Import Firebase sync service via global to avoid circular deps
let firebaseSyncService = null;

// Active namespace prefix: e.g., "mpp:<uid>:"
let ACTIVE_NAMESPACE = 'mpp:guest:';

// Helper to build namespaced key
const nsKey = (baseKey) => (ACTIVE_NAMESPACE ? `${ACTIVE_NAMESPACE}${baseKey}` : baseKey);

// Legacy alternate keys written by older listeners (without mpump_ prefix)
const LEGACY_ALT_KEYS = {
  mpump_customers: ['customers'],
  mpump_credit_data: ['creditData'],
  mpump_payments: ['payments'],
  mpump_settlements: ['settlements'],
  mpump_sales_data: ['salesData'],
  mpump_income_data: ['incomeData'],
  mpump_expense_data: ['expenseData'],
  mpump_fuel_settings: [],
  mpump_rates_by_date: [],
  mpump_income_categories: [],
  mpump_expense_categories: [],
  mpump_settlement_types: [],
  mpump_income_desc_history: [],
  mpump_expense_desc_history: [],
};

// Other singleton keys that may exist without mpump_ prefix
const LEGACY_MISC_KEYS = [
  'mpump_contact_info',
  'mpp_notes',
  'mpump_online_url',
  'mpump_auto_backup_settings',
  'mpump_auto_backup_weekly_settings',
  'appTextSize',
  'appTheme'
];

const getFirebaseSync = () => {
  try {
    if (typeof window !== 'undefined' && window.firebaseSyncService) {
      return window.firebaseSyncService;
    }
  } catch (error) {
    console.log('Firebase sync not available:', error?.message || error);
  }
  return null;
};

class LocalStorageService {
  constructor() {
    this.keys = {
      salesData: 'mpump_sales_data',
      creditData: 'mpump_credit_data',
      incomeData: 'mpump_income_data',
      expenseData: 'mpump_expense_data',
      fuelSettings: 'mpump_fuel_settings',
      rates: 'mpump_rates_by_date',
      customers: 'mpump_customers',
      payments: 'mpump_payments',
      incomeCategories: 'mpump_income_categories',
      expenseCategories: 'mpump_expense_categories',
      settlements: 'mpump_settlements',
      settlementTypes: 'mpump_settlement_types',
      incomeDescHistory: 'mpump_income_desc_history',
      expenseDescHistory: 'mpump_expense_desc_history'
    };
  }

  // ===== Namespace management =====
  setNamespace(userId) {
    const prevNs = ACTIVE_NAMESPACE;
    ACTIVE_NAMESPACE = userId ? `mpp:${userId}:` : 'mpp:guest:';

    // On first set for a logged-in (or anonymous) user, run migration from legacy unscoped/alt keys
    if (userId) {
      this.migrateLegacyKeys({ deleteAfter: true });
    }

    // Ensure defaults exist within this namespace
    this.initializeDefaultData();

    // Announce namespace switch to UI (for any listeners interested)
    try {
      window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { userId, namespace: ACTIVE_NAMESPACE } }));
    } catch (_) {}

    return { prevNs, newNs: ACTIVE_NAMESPACE };
  }

  getNamespace() { return ACTIVE_NAMESPACE; }

  clearNamespace() {
    const prevNs = ACTIVE_NAMESPACE;
    ACTIVE_NAMESPACE = 'mpp:guest:';
    this.initializeDefaultData();
    try { window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { userId: null, namespace: ACTIVE_NAMESPACE } })); } catch(_){}
    return prevNs;
  }

  // Move legacy unscoped data into the active namespace, then delete legacy keys
  migrateLegacyKeys({ deleteAfter = true } = {}) {
    if (!ACTIVE_NAMESPACE) return;

    const migrateKey = (baseKey, altKeys = []) => {
      const namespaced = nsKey(baseKey);
      const nsExists = localStorage.getItem(namespaced) !== null;
      if (nsExists) return; // Already migrated for this user

      const legacyVal = localStorage.getItem(baseKey);
      if (legacyVal !== null) {
        localStorage.setItem(namespaced, legacyVal);
        if (deleteAfter) localStorage.removeItem(baseKey);
        return;
      }

      for (const alt of altKeys) {
        const val = localStorage.getItem(alt);
        if (val !== null) {
          localStorage.setItem(namespaced, val);
          if (deleteAfter) localStorage.removeItem(alt);
          return;
        }
      }
    };

    Object.entries(LEGACY_ALT_KEYS).forEach(([baseKey, alts]) => migrateKey(baseKey, alts));
    LEGACY_MISC_KEYS.forEach((k) => migrateKey(k, []));
  }

  // ===== Initialization within the current namespace =====
  initializeDefaultData() {
    const defaultFuelSettings = {
      'Diesel': { price: 90.46, nozzleCount: 2 },
      'Petrol': { price: 102.50, nozzleCount: 3 },
      'CNG': { price: 75.20, nozzleCount: 2 },
      'Premium': { price: 108.90, nozzleCount: 1 }
    };

    const existingSettings = this.getFuelSettings();
    if (!existingSettings) { this.setFuelSettings(defaultFuelSettings); }

    if (!this.getSalesData()) this.setSalesData([]);
    if (!this.getCreditData()) this.setCreditData([]);
    if (!this.getIncomeData()) this.setIncomeData([]);
    if (!this.getExpenseData()) this.setExpenseData([]);
    if (!this.getCustomers()) this.setCustomers([]);
    if (!this.getPayments()) this.setPayments([]);
    if (!this.getSettlements()) this.setSettlements([]);

    if (!this.getIncomeCategories()) {
      this.setIncomeCategories([
        { id: '1', name: 'Other Income' },
        { id: '2', name: 'Commission' },
        { id: '3', name: 'Interest' }
      ]);
    }
    if (!this.getExpenseCategories()) {
      this.setExpenseCategories([
        { id: '1', name: 'Salary' },
        { id: '2', name: 'Rent' },
        { id: '3', name: 'Electricity' },
        { id: '4', name: 'Maintenance' },
        { id: '5', name: 'Other' }
      ]);
    }

    const existingTypes = this.getItem(this.keys.settlementTypes);
    if (!existingTypes || existingTypes.length === 0) {
      this.setSettlementTypes([
        { id: '1', name: 'Card' },
        { id: '2', name: 'DTP' },
        { id: '3', name: 'Paytm' },
        { id: '4', name: 'PhonePe' }
      ]);
    }
  }

  // ===== Generic localStorage methods (namespaced) =====
  setItem(key, data) {
    try { localStorage.setItem(nsKey(key), JSON.stringify(data)); return true; }
    catch (error) { console.error('Failed to save to localStorage:', error); return false; }
  }
  getItem(key) {
    try { const data = localStorage.getItem(nsKey(key)); return data ? JSON.parse(data) : null; }
    catch (error) { console.error('Failed to read from localStorage:', error); return null; }
  }

  // ... rest of file unchanged ...
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
export const setStorageNamespace = (userId) => localStorageService.setNamespace(userId);
export const clearStorageNamespace = () => localStorageService.clearNamespace();
export const exportAllData = () => localStorageService.exportAllData();
export const importAllData = (data) => localStorageService.importAllData(data);
export const mergeAllData = (data) => localStorageService.mergeAllData(data);
