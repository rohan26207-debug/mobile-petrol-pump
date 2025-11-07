/**
 * Local Storage Service for Offline M.Pump Calc
 * Handles all data persistence in browser localStorage
 * Now with Firebase sync for multi-device support
 */

// Import Firebase sync service
let firebaseSyncService = null;

// Lazy load Firebase sync to avoid circular dependency
const getFirebaseSync = () => {
  if (!firebaseSyncService) {
    try {
      firebaseSyncService = require('./firebaseSync').default;
    } catch (error) {
      console.log('Firebase sync not available:', error.message);
    }
  }
  return firebaseSyncService;
};

class LocalStorageService {
  constructor() {
    this.keys = {
      salesData: 'mpump_sales_data',
      creditData: 'mpump_credit_data', 
      incomeData: 'mpump_income_data',
      expenseData: 'mpump_expense_data',
      fuelSettings: 'mpump_fuel_settings',
      rates: 'mpump_rates_by_date', // New: date-specific rates
      customers: 'mpump_customers', // New: customer list
      payments: 'mpump_payments', // New: payments received
      incomeCategories: 'mpump_income_categories', // Income categories
      expenseCategories: 'mpump_expense_categories', // Expense categories
      settlements: 'mpump_settlements', // Settlements (bank transfers)
      settlementTypes: 'mpump_settlement_types', // Settlement types/categories
      incomeDescHistory: 'mpump_income_desc_history', // Income description history
      expenseDescHistory: 'mpump_expense_desc_history' // Expense description history
    };
    
    this.initializeDefaultData();
  }

  // Initialize default data if not exists
  initializeDefaultData() {
    // Default fuel settings
    const defaultFuelSettings = {
      'Diesel': { price: 90.46, nozzleCount: 2 },
      'Petrol': { price: 102.50, nozzleCount: 3 },
      'CNG': { price: 75.20, nozzleCount: 2 },
      'Premium': { price: 108.90, nozzleCount: 1 }
    };

    const existingSettings = this.getFuelSettings();
    
    if (!existingSettings) {
      this.setFuelSettings(defaultFuelSettings);
    }

    // Initialize empty arrays if not exist
    if (!this.getSalesData()) this.setSalesData([]);
    if (!this.getCreditData()) this.setCreditData([]);
    if (!this.getIncomeData()) this.setIncomeData([]);
    if (!this.getExpenseData()) this.setExpenseData([]);
    if (!this.getCustomers()) this.setCustomers([]);
    if (!this.getPayments()) this.setPayments([]);
    if (!this.getSettlements()) this.setSettlements([]);
    
    // Initialize default income/expense categories
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
    
    // Initialize default settlement types
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

  // Generic localStorage methods
  setItem(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  // Sales Data Methods
  getSalesData() {
    return this.getItem(this.keys.salesData) || [];
  }

  setSalesData(data) {
    return this.setItem(this.keys.salesData, data);
  }

  addSaleRecord(saleData) {
    const sales = this.getSalesData();
    const newSale = {
      id: Date.now().toString(),
      date: saleData.date,
      nozzle: saleData.nozzle,
      fuelType: saleData.fuelType,
      startReading: parseFloat(saleData.startReading),
      endReading: parseFloat(saleData.endReading),
      liters: parseFloat(saleData.liters),
      rate: parseFloat(saleData.rate),
      amount: parseFloat(saleData.amount),
      type: 'cash',
      mpp: saleData.mpp || false,
      timestamp: new Date().toISOString()
    };
    
    sales.push(newSale);
    this.setSalesData(sales);
    return newSale;
  }

  // Credit Data Methods
  getCreditData() {
    return this.getItem(this.keys.creditData) || [];
  }

  setCreditData(data) {
    return this.setItem(this.keys.creditData, data);
  }

  addCreditRecord(creditData) {
    const credits = this.getCreditData();
    const newCredit = {
      id: Date.now().toString(),
      date: creditData.date,
      customerId: creditData.customerId,
      customerName: creditData.customerName,
      // New structure with arrays
      fuelEntries: creditData.fuelEntries || [],
      incomeEntries: creditData.incomeEntries || [],
      expenseEntries: creditData.expenseEntries || [],
      amount: parseFloat(creditData.amount),
      totalAmount: parseFloat(creditData.amount), // Add totalAmount field
      // Legacy fields for backward compatibility
      vehicleNumber: creditData.vehicleNumber || 'N/A',
      fuelType: creditData.fuelType || (creditData.fuelEntries && creditData.fuelEntries[0] ? creditData.fuelEntries[0].fuelType : 'N/A'),
      liters: creditData.liters || (creditData.fuelEntries && creditData.fuelEntries[0] ? creditData.fuelEntries[0].liters : 0),
      rate: creditData.rate || (creditData.fuelEntries && creditData.fuelEntries[0] ? creditData.fuelEntries[0].rate : 0),
      dueDate: creditData.dueDate || creditData.date,
      status: creditData.status || 'pending',
      mpp: creditData.mpp || false,
      timestamp: new Date().toISOString()
    };
    
    credits.push(newCredit);
    this.setCreditData(credits);
    return newCredit;
  }

  // Income Data Methods
  getIncomeData() {
    return this.getItem(this.keys.incomeData) || [];
  }

  setIncomeData(data) {
    return this.setItem(this.keys.incomeData, data);
  }

  addIncomeRecord(incomeData) {
    const income = this.getIncomeData();
    const newIncome = {
      id: Date.now().toString(),
      date: incomeData.date,
      amount: parseFloat(incomeData.amount),
      description: incomeData.description || incomeData.category || 'Income',
      type: 'income',
      mpp: incomeData.mpp || false,
      timestamp: new Date().toISOString()
    };
    
    income.push(newIncome);
    this.setIncomeData(income);
    return newIncome;
  }

  // Expense Data Methods
  getExpenseData() {
    return this.getItem(this.keys.expenseData) || [];
  }

  setExpenseData(data) {
    return this.setItem(this.keys.expenseData, data);
  }

  addExpenseRecord(expenseData) {
    const expenses = this.getExpenseData();
    const newExpense = {
      id: Date.now().toString(),
      date: expenseData.date,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description || expenseData.category || 'Expense',
      type: 'expense',
      mpp: expenseData.mpp || false,
      timestamp: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    this.setExpenseData(expenses);
    return newExpense;
  }

  // Fuel Settings Methods
  getFuelSettings() {
    return this.getItem(this.keys.fuelSettings);
  }

  setFuelSettings(settings) {
    const result = this.setItem(this.keys.fuelSettings, settings);
    
    // Sync to Firebase
    const firebaseSync = getFirebaseSync();
    if (firebaseSync) {
      firebaseSync.syncFuelSettings(settings);
    }
    
    return result;
  }

  updateFuelRate(fuelType, rate, date = null) {
    // If date is provided, store rate for that specific date
    if (date) {
      return this.setRateForDate(fuelType, rate, date);
    }
    
    // Legacy: Update global settings (for backward compatibility)
    const settings = this.getFuelSettings() || {};
    if (settings[fuelType]) {
      settings[fuelType].price = parseFloat(rate);
      this.setFuelSettings(settings);
      return true;
    }
    return false;
  }

  // Date-specific rate methods
  getAllRates() {
    return this.getItem(this.keys.rates) || {};
  }

  setAllRates(rates) {
    return this.setItem(this.keys.rates, rates);
  }

  setRateForDate(fuelType, rate, date) {
    const rates = this.getAllRates();
    
    // Structure: { "2025-10-23": { "Petrol": 102.50, "Diesel": 89.75 }, ... }
    if (!rates[date]) {
      rates[date] = {};
    }
    
    rates[date][fuelType] = parseFloat(rate);
    return this.setAllRates(rates);
  }

  getRatesForDate(date) {
    const rates = this.getAllRates();
    
    // If rates exist for this exact date, return them
    if (rates[date]) {
      return rates[date];
    }
    
    // Otherwise, find the most recent previous date with rates
    const allDates = Object.keys(rates).sort().reverse();
    const previousDate = allDates.find(d => d < date);
    
    if (previousDate) {
      return rates[previousDate];
    }
    
    // No previous rates found, return empty
    return {};
  }

  // Get the last changed rate for a specific fuel type before the given date
  getLastChangedRate(fuelType, beforeDate) {
    const rates = this.getAllRates();
    
    // Get all dates with rates, sorted in descending order
    const allDates = Object.keys(rates)
      .filter(d => d < beforeDate)
      .sort()
      .reverse();
    
    // Find the most recent date that has a rate for this fuel type
    for (const date of allDates) {
      if (rates[date][fuelType] !== undefined) {
        return rates[date][fuelType];
      }
    }
    
    // No previous rate found
    return null;
  }

  // Data filtering methods
  getDataByDate(dataType, date) {
    let data = [];
    
    switch (dataType) {
      case 'sales':
        data = this.getSalesData();
        break;
      case 'credit':
        data = this.getCreditData();
        break;
      case 'income':
        data = this.getIncomeData();
        break;
      case 'expense':
        data = this.getExpenseData();
        break;
    }
    
    if (!date) return data;
    
    return data.filter(item => item.date === date);
  }

  // Delete methods
  deleteSaleRecord(id) {
    const sales = this.getSalesData();
    const updatedSales = sales.filter(sale => sale.id !== id);
    this.setSalesData(updatedSales);
    return true;
  }

  deleteCreditRecord(id) {
    const credits = this.getCreditData();
    const updatedCredits = credits.filter(credit => credit.id !== id);
    this.setCreditData(updatedCredits);
    return true;
  }

  deleteIncomeRecord(id) {
    const income = this.getIncomeData();
    const updatedIncome = income.filter(item => item.id !== id);
    this.setIncomeData(updatedIncome);
    return true;
  }

  deleteExpenseRecord(id) {
    const expenses = this.getExpenseData();
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    this.setExpenseData(updatedExpenses);
    return true;
  }

  // Combined Income/Expense Data Method (for Firebase sync)
  getIncomeExpenseData() {
    const income = this.getIncomeData();
    const expenses = this.getExpenseData();
    return [...income, ...expenses];
  }

  // Update methods
  updateSaleRecord(id, updatedData) {
    const sales = this.getSalesData();
    const saleIndex = sales.findIndex(sale => sale.id === id);
    if (saleIndex !== -1) {
      sales[saleIndex] = { ...sales[saleIndex], ...updatedData };
      this.setSalesData(sales);
      return sales[saleIndex];
    }
    return null;
  }

  updateCreditRecord(id, updatedData) {
    const credits = this.getCreditData();
    const creditIndex = credits.findIndex(credit => credit.id === id);
    if (creditIndex !== -1) {
      credits[creditIndex] = { ...credits[creditIndex], ...updatedData };
      this.setCreditData(credits);
      return credits[creditIndex];
    }
    return null;
  }

  updateIncomeRecord(id, updatedData) {
    const income = this.getIncomeData();
    const incomeIndex = income.findIndex(item => item.id === id);
    if (incomeIndex !== -1) {
      income[incomeIndex] = { ...income[incomeIndex], ...updatedData };
      this.setIncomeData(income);
      return income[incomeIndex];
    }
    return null;
  }

  updateExpenseRecord(id, updatedData) {
    const expenses = this.getExpenseData();
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    if (expenseIndex !== -1) {
      expenses[expenseIndex] = { ...expenses[expenseIndex], ...updatedData };
      this.setExpenseData(expenses);
      return expenses[expenseIndex];
    }
    return null;
  }

  // Export all data (for backup)
  exportDataByDate(selectedDate) {
    // Filter data by selected date and minimize field names for compression
    const sales = this.getSalesData().filter(s => s.date === selectedDate).map(s => ({
      i: s.id,
      d: s.date,
      n: s.nozzle,
      f: s.fuelType,
      sr: s.startReading,
      er: s.endReading,
      l: s.liters,
      r: s.rate,
      a: s.amount,
      m: s.mpp
    }));
    
    const credits = this.getCreditData().filter(c => c.date === selectedDate).map(c => ({
      i: c.id,
      d: c.date,
      ci: c.customerId,
      cn: c.customerName,
      a: c.amount,
      m: c.mpp
    }));
    
    const income = this.getIncomeData().filter(i => i.date === selectedDate).map(i => ({
      i: i.id,
      d: i.date,
      ds: i.description,
      a: i.amount,
      m: i.mpp
    }));
    
    const expense = this.getExpenseData().filter(e => e.date === selectedDate).map(e => ({
      i: e.id,
      d: e.date,
      ds: e.description,
      a: e.amount,
      m: e.mpp
    }));
    
    const pay = this.getPayments().filter(p => p.date === selectedDate).map(p => ({
      i: p.id,
      d: p.date,
      ci: p.customerId,
      a: p.amount,
      m: p.mode
    }));
    
    const settle = this.getSettlements().filter(s => s.date === selectedDate).map(s => ({
      i: s.id,
      d: s.date,
      a: s.amount,
      ds: s.description,
      m: s.mpp
    }));

    // Minimize customer and fuel data
    const cust = this.getCustomers().map(c => ({
      i: c.id,
      n: c.name,
      sb: c.startingBalance,
      mpp: c.isMPP
    }));
    
    const fuel = {};
    const fullFuel = this.getFuelSettings();
    Object.keys(fullFuel).forEach(key => {
      fuel[key] = { p: fullFuel[key].price, n: fullFuel[key].nozzleCount };
    });

    return {
      s: sales,
      c: credits,
      i: income,
      e: expense,
      p: pay,
      st: settle,
      f: fuel,
      cu: cust,
      dt: selectedDate,
      v: '2.1'
    };
  }

  exportAllData() {
    // Get all stock data for all fuel types
    const stockData = {};
    const stockKeys = Object.keys(localStorage).filter(key => key.endsWith('StockData'));
    stockKeys.forEach(key => {
      stockData[key] = JSON.parse(localStorage.getItem(key) || '{}');
    });

    // Get contact information
    const contactInfo = localStorage.getItem('mpump_contact_info');
    
    // Get notes
    const notes = localStorage.getItem('mpp_notes');
    
    // Get online URL
    const onlineUrl = localStorage.getItem('mpump_online_url');
    
    // Get auto-backup settings
    const autoBackupSettings = localStorage.getItem('mpump_auto_backup_settings');
    const weeklyBackupSettings = localStorage.getItem('mpump_auto_backup_weekly_settings');
    
    // Get app preferences
    const textSize = localStorage.getItem('appTextSize');
    const theme = localStorage.getItem('appTheme');

    return {
      salesData: this.getSalesData(),
      creditData: this.getCreditData(),
      incomeData: this.getIncomeData(),
      expenseData: this.getExpenseData(),
      fuelSettings: this.getFuelSettings(),
      customers: this.getCustomers(),
      payments: this.getPayments(),
      settlements: this.getSettlements(),
      settlementTypes: this.getSettlementTypes(), // ADDED: Settlement types
      incomeCategories: this.getIncomeCategories(), // ADDED: Income categories
      expenseCategories: this.getExpenseCategories(), // ADDED: Expense categories
      stockData: stockData,
      contactInfo: contactInfo ? JSON.parse(contactInfo) : null,
      notes: notes || '',
      onlineUrl: onlineUrl || '',
      autoBackupSettings: autoBackupSettings ? JSON.parse(autoBackupSettings) : null,
      weeklyBackupSettings: weeklyBackupSettings ? JSON.parse(weeklyBackupSettings) : null,
      appPreferences: {
        textSize: textSize || '100',
        theme: theme || 'light'
      },
      exportDate: new Date().toISOString(),
      version: '2.1' // Updated version
    };
  }

  // Import all data (for restore)
  importAllData(data) {
    try {
      // Import main data arrays
      if (data.salesData) this.setSalesData(data.salesData);
      if (data.creditData) this.setCreditData(data.creditData);
      if (data.incomeData) this.setIncomeData(data.incomeData);
      if (data.expenseData) this.setExpenseData(data.expenseData);
      if (data.fuelSettings) this.setFuelSettings(data.fuelSettings);
      if (data.customers) this.setCustomers(data.customers);
      if (data.payments) this.setPayments(data.payments);
      if (data.settlements) this.setSettlements(data.settlements);
      
      // Import settings/configuration data (ADDED)
      if (data.settlementTypes) this.setSettlementTypes(data.settlementTypes);
      if (data.incomeCategories) this.setIncomeCategories(data.incomeCategories);
      if (data.expenseCategories) this.setExpenseCategories(data.expenseCategories);
      
      // Import stock data
      if (data.stockData) {
        Object.keys(data.stockData).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data.stockData[key]));
        });
      }
      
      // Import contact information
      if (data.contactInfo) {
        localStorage.setItem('mpump_contact_info', JSON.stringify(data.contactInfo));
      }
      
      // Import notes
      if (data.notes !== undefined) {
        localStorage.setItem('mpp_notes', data.notes);
      }
      
      // Import online URL
      if (data.onlineUrl !== undefined) {
        localStorage.setItem('mpump_online_url', data.onlineUrl);
      }
      
      // Import auto-backup settings
      if (data.autoBackupSettings) {
        localStorage.setItem('mpump_auto_backup_settings', JSON.stringify(data.autoBackupSettings));
      }
      if (data.weeklyBackupSettings) {
        localStorage.setItem('mpump_auto_backup_weekly_settings', JSON.stringify(data.weeklyBackupSettings));
      }
      
      // Import app preferences
      if (data.appPreferences) {
        if (data.appPreferences.textSize) {
          localStorage.setItem('appTextSize', data.appPreferences.textSize);
        }
        if (data.appPreferences.theme) {
          localStorage.setItem('appTheme', data.appPreferences.theme);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Merge data (keeps old data in case of conflicts)
  mergeAllData(importedData) {
    try {
      // Helper function to merge arrays, keeping old data for duplicate IDs
      const mergeArrays = (existingArray, newArray) => {
        if (!Array.isArray(existingArray)) existingArray = [];
        if (!Array.isArray(newArray)) newArray = [];
        
        // Create a map of existing IDs for quick lookup
        const existingIds = new Set(existingArray.map(item => item.id));
        
        // Add only new items (items with IDs that don't exist in old data)
        const itemsToAdd = newArray.filter(item => !existingIds.has(item.id));
        
        return [...existingArray, ...itemsToAdd];
      };

      // Merge main data arrays (old data takes priority)
      if (importedData.salesData) {
        const existingSales = this.getSalesData();
        const mergedSales = mergeArrays(existingSales, importedData.salesData);
        this.setSalesData(mergedSales);
      }

      if (importedData.creditData) {
        const existingCredits = this.getCreditData();
        const mergedCredits = mergeArrays(existingCredits, importedData.creditData);
        this.setCreditData(mergedCredits);
      }

      if (importedData.incomeData) {
        const existingIncome = this.getIncomeData();
        const mergedIncome = mergeArrays(existingIncome, importedData.incomeData);
        this.setIncomeData(mergedIncome);
      }

      if (importedData.expenseData) {
        const existingExpenses = this.getExpenseData();
        const mergedExpenses = mergeArrays(existingExpenses, importedData.expenseData);
        this.setExpenseData(mergedExpenses);
      }

      if (importedData.customers) {
        const existingCustomers = this.getCustomers();
        const mergedCustomers = mergeArrays(existingCustomers, importedData.customers);
        this.setCustomers(mergedCustomers);
      }

      if (importedData.payments) {
        const existingPayments = this.getPayments();
        const mergedPayments = mergeArrays(existingPayments, importedData.payments);
        this.setPayments(mergedPayments);
      }

      // For settings, keep existing if they exist, otherwise use imported
      if (importedData.fuelSettings && !this.getFuelSettings()) {
        this.setFuelSettings(importedData.fuelSettings);
      }

      // Merge stock data
      if (importedData.stockData) {
        Object.keys(importedData.stockData).forEach(key => {
          // Only import if key doesn't exist
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(importedData.stockData[key]));
          }
        });
      }

      // For single-value settings, keep existing if they exist
      if (importedData.contactInfo && !localStorage.getItem('mpump_contact_info')) {
        localStorage.setItem('mpump_contact_info', JSON.stringify(importedData.contactInfo));
      }

      if (importedData.notes !== undefined && !localStorage.getItem('mpp_notes')) {
        localStorage.setItem('mpp_notes', importedData.notes);
      }

      if (importedData.onlineUrl !== undefined && !localStorage.getItem('mpump_online_url')) {
        localStorage.setItem('mpump_online_url', importedData.onlineUrl);
      }

      if (importedData.autoBackupSettings && !localStorage.getItem('mpump_auto_backup_settings')) {
        localStorage.setItem('mpump_auto_backup_settings', JSON.stringify(importedData.autoBackupSettings));
      }

      if (importedData.weeklyBackupSettings && !localStorage.getItem('mpump_auto_backup_weekly_settings')) {
        localStorage.setItem('mpump_auto_backup_weekly_settings', JSON.stringify(importedData.weeklyBackupSettings));
      }

      // Merge app preferences (keep existing if present)
      if (importedData.appPreferences) {
        if (importedData.appPreferences.textSize && !localStorage.getItem('appTextSize')) {
          localStorage.setItem('appTextSize', importedData.appPreferences.textSize);
        }
        if (importedData.appPreferences.theme && !localStorage.getItem('appTheme')) {
          localStorage.setItem('appTheme', importedData.appPreferences.theme);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to merge data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeDefaultData();
  }

  // Check storage usage
  getStorageInfo() {
    const totalSize = new Blob(Object.values(localStorage)).size;
    const itemCount = Object.keys(localStorage).filter(key => 
      key.startsWith('mpump_')
    ).length;
    
    return {
      totalSize,
      itemCount,
      maxSize: 5 * 1024 * 1024, // 5MB typical localStorage limit
      usagePercent: (totalSize / (5 * 1024 * 1024)) * 100
    };
  }

  // Customer Methods
  getCustomers() {
    return this.getItem(this.keys.customers) || [];
  }

  setCustomers(customers) {
    return this.setItem(this.keys.customers, customers);
  }

  addCustomer(name, startingBalance = 0, isMPP = false) {
    const customers = this.getCustomers();
    
    // Check if trying to add MPP customer when one already exists
    if (isMPP) {
      const existingMPP = customers.find(c => c.isMPP === true);
      if (existingMPP) {
        throw new Error('A Manager Petrol Pump customer already exists. Only one MPP customer is allowed.');
      }
    }
    
    const newCustomer = {
      id: Date.now().toString(),
      name: name,
      startingBalance: parseFloat(startingBalance) || 0,
      isMPP: isMPP || false,
      created_at: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    // Sort alphabetically by name
    customers.sort((a, b) => a.name.localeCompare(b.name));
    this.setCustomers(customers);
    
    // Sync to Firebase
    const firebaseSync = getFirebaseSync();
    if (firebaseSync) {
      firebaseSync.syncCustomer(newCustomer, 'add');
    }
    
    return newCustomer;
  }

  deleteCustomer(id) {
    const customers = this.getCustomers();
    const customerToDelete = customers.find(c => c.id === id);
    const updated = customers.filter(c => c.id !== id);
    this.setCustomers(updated);
    
    // Sync to Firebase
    if (customerToDelete) {
      const firebaseSync = getFirebaseSync();
      if (firebaseSync) {
        firebaseSync.syncCustomer(customerToDelete, 'delete');
      }
    }
    
    return true;
  }

  updateCustomer(id, startingBalance, isMPP) {
    const customers = this.getCustomers();
    
    // Check if trying to set MPP flag to true when another MPP customer already exists
    if (isMPP === true) {
      const existingMPP = customers.find(c => c.isMPP === true && c.id !== id);
      if (existingMPP) {
        throw new Error('A Manager Petrol Pump customer already exists. Only one MPP customer is allowed.');
      }
    }
    
    const updated = customers.map(c => {
      if (c.id === id) {
        const updatedCustomer = { ...c, startingBalance: parseFloat(startingBalance) || 0 };
        if (isMPP !== undefined) {
          updatedCustomer.isMPP = isMPP;
        }
        return updatedCustomer;
      }
      return c;
    });
    this.setCustomers(updated);
    
    const updatedCustomer = updated.find(c => c.id === id);
    
    // Sync to Firebase
    if (updatedCustomer) {
      const firebaseSync = getFirebaseSync();
      if (firebaseSync) {
        firebaseSync.syncCustomer(updatedCustomer, 'update');
      }
    }
    
    return updatedCustomer;
  }
  
  // Check if MPP checkbox should be visible (any customer has isMPP = true)
  isMPPVisible() {
    const customers = this.getCustomers();
    return customers.some(c => c.isMPP === true);
  }

  // Payment Methods
  getPayments() {
    return this.getItem(this.keys.payments) || [];
  }

  setPayments(payments) {
    return this.setItem(this.keys.payments, payments);
  }

  addPayment(paymentData) {
    const payments = this.getPayments();
    const newPayment = {
      id: Date.now().toString(),
      customerId: paymentData.customerId,
      customerName: paymentData.customerName,
      amount: parseFloat(paymentData.amount),
      date: paymentData.date,
      mode: paymentData.mode || 'cash', // Payment mode (cash/card/wallet/bank/auto)
      timestamp: new Date().toISOString(),
      // MPP auto-tracking fields
      linkedMPPCreditId: paymentData.linkedMPPCreditId || null,
      linkedMPPSettlementId: paymentData.linkedMPPSettlementId || null,
      isAutoMPPTracking: paymentData.isAutoMPPTracking || false,
      description: paymentData.description || null
    };
    
    payments.push(newPayment);
    this.setPayments(payments);
    return newPayment;
  }

  updatePayment(id, paymentData) {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = {
        ...payments[index],
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
        mode: paymentData.mode || payments[index].mode || 'cash', // Update mode if provided
        timestamp: new Date().toISOString()
      };
      this.setPayments(payments);
      return payments[index];
    }
    return null;
  }

  deletePayment(id) {
    const payments = this.getPayments();
    const updated = payments.filter(p => p.id !== id);
    this.setPayments(updated);
    return true;
  }

  // Income Category Methods
  getIncomeCategories() {
    return this.getItem(this.keys.incomeCategories) || [];
  }

  setIncomeCategories(categories) {
    const result = this.setItem(this.keys.incomeCategories, categories);
    
    // Sync to Firebase
    const firebaseSync = getFirebaseSync();
    if (firebaseSync) {
      firebaseSync.syncIncomeCategories(categories);
    }
    
    return result;
  }

  addIncomeCategory(name) {
    const categories = this.getIncomeCategories();
    const newCategory = {
      id: Date.now().toString(),
      name: name
    };
    categories.push(newCategory);
    // Sort alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));
    this.setIncomeCategories(categories);
    return newCategory;
  }

  deleteIncomeCategory(id) {
    const categories = this.getIncomeCategories();
    const updated = categories.filter(c => c.id !== id);
    this.setIncomeCategories(updated);
    return true;
  }

  updateIncomeCategory(id, name) {
    const categories = this.getIncomeCategories();
    const updated = categories.map(c => {
      if (c.id === id) {
        return { ...c, name: name };
      }
      return c;
    });
    // Sort alphabetically by name
    updated.sort((a, b) => a.name.localeCompare(b.name));
    this.setIncomeCategories(updated);
    return updated.find(c => c.id === id);
  }

  // Expense Category Methods
  getExpenseCategories() {
    return this.getItem(this.keys.expenseCategories) || [];
  }

  setExpenseCategories(categories) {
    const result = this.setItem(this.keys.expenseCategories, categories);
    
    // Sync to Firebase
    const firebaseSync = getFirebaseSync();
    if (firebaseSync) {
      firebaseSync.syncExpenseCategories(categories);
    }
    
    return result;
  }

  addExpenseCategory(name) {
    const categories = this.getExpenseCategories();
    const newCategory = {
      id: Date.now().toString(),
      name: name
    };
    categories.push(newCategory);
    // Sort alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));
    this.setExpenseCategories(categories);
    return newCategory;
  }

  deleteExpenseCategory(id) {
    const categories = this.getExpenseCategories();
    const updated = categories.filter(c => c.id !== id);
    this.setExpenseCategories(updated);
    return true;
  }

  updateExpenseCategory(id, name) {
    const categories = this.getExpenseCategories();
    const updated = categories.map(c => {
      if (c.id === id) {
        return { ...c, name: name };
      }
      return c;
    });
    // Sort alphabetically by name
    updated.sort((a, b) => a.name.localeCompare(b.name));
    this.setExpenseCategories(updated);
    return updated.find(c => c.id === id);
  }

  // Settlement Methods
  getSettlements() {
    return this.getItem(this.keys.settlements) || [];
  }

  setSettlements(settlements) {
    return this.setItem(this.keys.settlements, settlements);
  }

  addSettlement(settlementData) {
    const settlements = this.getSettlements();
    const newSettlement = {
      id: Date.now().toString(),
      date: settlementData.date,
      amount: parseFloat(settlementData.amount),
      description: settlementData.description || '',
      mpp: settlementData.mpp || false,
      timestamp: new Date().toISOString()
    };
    settlements.push(newSettlement);
    this.setSettlements(settlements);
    return newSettlement;
  }

  updateSettlement(id, settlementData) {
    const settlements = this.getSettlements();
    const index = settlements.findIndex(s => s.id === id);
    if (index !== -1) {
      settlements[index] = {
        ...settlements[index],
        date: settlementData.date,
        amount: parseFloat(settlementData.amount),
        description: settlementData.description || '',
        mpp: settlementData.mpp !== undefined ? settlementData.mpp : settlements[index].mpp,
        timestamp: new Date().toISOString()
      };
      this.setSettlements(settlements);
      return settlements[index];
    }
    return null;
  }

  deleteSettlement(id) {
    const settlements = this.getSettlements();
    const updated = settlements.filter(s => s.id !== id);
    this.setSettlements(updated);
    return true;
  }

  // Settlement Type Methods
  getSettlementTypes() {
    return this.getItem(this.keys.settlementTypes) || [];
  }

  setSettlementTypes(types) {
    const result = this.setItem(this.keys.settlementTypes, types);
    
    // Sync to Firebase
    const firebaseSync = getFirebaseSync();
    if (firebaseSync) {
      firebaseSync.syncSettlementTypes(types);
    }
    
    return result;
  }

  addSettlementType(name) {
    const types = this.getSettlementTypes();
    const newType = {
      id: Date.now().toString(),
      name: name
    };
    types.push(newType);
    types.sort((a, b) => a.name.localeCompare(b.name));
    this.setSettlementTypes(types);
    return newType;
  }

  deleteSettlementType(id) {
    const types = this.getSettlementTypes();
    const updated = types.filter(t => t.id !== id);
    this.setSettlementTypes(updated);
    return true;
  }

  updateSettlementType(id, name) {
    const types = this.getSettlementTypes();
    const updated = types.map(t => {
      if (t.id === id) {
        return { ...t, name: name };
      }
      return t;
    });
    updated.sort((a, b) => a.name.localeCompare(b.name));
    this.setSettlementTypes(updated);
    return updated.find(t => t.id === id);
  }

  // Income Description History Management
  getIncomeDescHistory() {
    return JSON.parse(localStorage.getItem(this.keys.incomeDescHistory) || '[]');
  }

  addIncomeDescHistory(description) {
    if (!description || !description.trim()) return;
    
    const history = this.getIncomeDescHistory();
    const trimmedDesc = description.trim();
    
    // Check if already exists
    if (history.includes(trimmedDesc)) return;
    
    // Add to beginning of array
    history.unshift(trimmedDesc);
    
    // Keep only last 20 entries
    if (history.length > 20) {
      history.splice(20);
    }
    
    localStorage.setItem(this.keys.incomeDescHistory, JSON.stringify(history));
  }

  deleteIncomeDescHistory(description) {
    const history = this.getIncomeDescHistory();
    const updated = history.filter(item => item !== description);
    localStorage.setItem(this.keys.incomeDescHistory, JSON.stringify(updated));
  }

  // Expense Description History Management
  getExpenseDescHistory() {
    return JSON.parse(localStorage.getItem(this.keys.expenseDescHistory) || '[]');
  }

  addExpenseDescHistory(description) {
    if (!description || !description.trim()) return;
    
    const history = this.getExpenseDescHistory();
    const trimmedDesc = description.trim();
    
    // Check if already exists
    if (history.includes(trimmedDesc)) return;
    
    // Add to beginning of array
    history.unshift(trimmedDesc);
    
    // Keep only last 20 entries
    if (history.length > 20) {
      history.splice(20);
    }
    
    localStorage.setItem(this.keys.expenseDescHistory, JSON.stringify(history));
  }

  deleteExpenseDescHistory(description) {
    const history = this.getExpenseDescHistory();
    const updated = history.filter(item => item !== description);
    localStorage.setItem(this.keys.expenseDescHistory, JSON.stringify(updated));
  }

  // Pro Mode Management
  isProModeEnabled() {
    return localStorage.getItem('mpump_pro_mode') === 'true';
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;

// Export utility functions for sync
export const exportAllData = () => localStorageService.exportAllData();
export const importAllData = (data) => localStorageService.importAllData(data);
export const mergeAllData = (data) => localStorageService.mergeAllData(data);
