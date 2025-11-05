import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { 
  Calculator, 
  CreditCard, 
  TrendingDown, 
  Moon,
  Sun,
  Fuel,
  IndianRupee,
  TrendingUp,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Share2,
  Receipt,
  Plus,
  Minus,
  Users,
  Wallet,
  Package,
  ArrowRightLeft
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import useAutoBackup from '../hooks/use-auto-backup';
import { useAutoBackupWeekly } from '../hooks/use-auto-backup-weekly';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SalesTracker from './SalesTracker';
import CreditSales from './CreditSales';
import IncomeExpense from './IncomeExpense';
import Settlement from './Settlement';
import PriceConfiguration from './PriceConfiguration';
import HeaderSettings from './HeaderSettings';
import UnifiedRecords from './UnifiedRecords';
import CustomerManagement from './CustomerManagement';
import PaymentReceived from './PaymentReceived';
import CreditSalesManagement from './CreditSalesManagement';
import OutstandingReport from './OutstandingReport';
import OutstandingPDFReport from './OutstandingPDFReport';
import CustomerLedger from './CustomerLedger';
import BankSettlement from './BankSettlement';
import MPPStock from './MPPStock';
import localStorageService from '../services/localStorage';

const ZAPTRStyleCalculator = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textSize, setTextSize] = useState(100); // Default 100% (normal size)
  const [parentTab, setParentTab] = useState('today'); // Parent tab: 'today' or 'outstanding'
  const [outstandingSubTab, setOutstandingSubTab] = useState('received'); // Sub-tab in Balance view
  const [todaySubTab, setTodaySubTab] = useState('all'); // Sub-tab in Today Summary: 'all' or 'c-sales'
  const [salesData, setSalesData] = useState([]);
  const [creditData, setCreditData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [fuelSettings, setFuelSettings] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mppTransferState, setMppTransferState] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Dialog states for edit functionality
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [settleIncExpDialogOpen, setSettleIncExpDialogOpen] = useState(false);
  const [settleIncExpActiveTab, setSettleIncExpActiveTab] = useState('settlement');
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [incomeExpenseDialogOpen, setIncomeExpenseDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingSaleData, setEditingSaleData] = useState(null);
  const [editingCreditData, setEditingCreditData] = useState(null);
  const [editingSettlementData, setEditingSettlementData] = useState(null);
  const [editingIncomeExpenseData, setEditingIncomeExpenseData] = useState(null);
  const [stockDataVersion, setStockDataVersion] = useState(0); // For triggering stock summary re-render
  
  // Notes Dialog State
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  // PDF Settings Dialog
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [pdfSettings, setPdfSettings] = useState({
    includeSales: true,
    includeCredit: true,
    includeIncome: true,
    includeExpense: true,
    includeSummary: true,
    pageSize: 'a4',
    orientation: 'portrait',
    dateRange: 'single', // 'single' or 'range'
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const { toast } = useToast();

  // Auto-backup hook - automatically saves to folder when data changes
  useAutoBackup(salesData, creditData, incomeData, expenseData, fuelSettings);

  // Weekly auto-backup hook - automatically downloads backup every 7 days
  useAutoBackupWeekly(toast);

  // Load data from localStorage
  // Loading state removed per user request

  const loadData = () => {
    try {
      // Load all data from localStorage
      const salesData = localStorageService.getSalesData();
      const creditData = localStorageService.getCreditData();
      const incomeData = localStorageService.getIncomeData();
      const expenseData = localStorageService.getExpenseData();
      const settlementData = localStorageService.getSettlements();
      const fuelSettings = localStorageService.getFuelSettings();
      const customers = localStorageService.getCustomers();
      const payments = localStorageService.getPayments();

      // Set data in component state
      setSalesData(salesData);
      setCreditData(creditData);
      setIncomeData(incomeData);
      setExpenseData(expenseData);
      setSettlementData(settlementData);
      setFuelSettings(fuelSettings);
      setCustomers(customers);
      setPayments(payments);

    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
      
      // Initialize with empty data if localStorage fails
      setSalesData([]);
      setCreditData([]);
      setIncomeData([]);
      setExpenseData([]);
      setCustomers([]);
      setPayments([]);
      
      // Initialize default fuel settings
      const defaultFuelSettings = {
        'Petrol': { price: 102.50, nozzleCount: 3 },
        'Diesel': { price: 89.75, nozzleCount: 2 },
        'CNG': { price: 75.20, nozzleCount: 2 },
        'Premium': { price: 108.90, nozzleCount: 1 }
      };
      setFuelSettings(defaultFuelSettings);
      localStorageService.setFuelSettings(defaultFuelSettings);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
    // Load notes (not date-specific)
    const savedNotes = localStorage.getItem('mpp_notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Reload data when date changes (to reflect any new data)
  useEffect(() => {
    loadData();
    
    // Reset all forms when date changes to prevent adding old data to new date
    resetAllForms();
  }, [selectedDate]);

  // Function to reset all child component forms
  const resetAllForms = () => {
    // Trigger reset in child components by updating a reset key
    setFormResetKey(prev => prev + 1);
  };

  // Add form reset state to force child component form resets
  const [formResetKey, setFormResetKey] = useState(0);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Text size control functions
  const increaseTextSize = () => {
    setTextSize(prevSize => {
      const newSize = Math.min(prevSize + 10, 150); // Max 150%
      localStorage.setItem('appTextSize', newSize.toString());
      document.documentElement.style.fontSize = `${newSize}%`;
      return newSize;
    });
  };

  const decreaseTextSize = () => {
    setTextSize(prevSize => {
      const newSize = Math.max(prevSize - 10, 70); // Min 70%
      localStorage.setItem('appTextSize', newSize.toString());
      document.documentElement.style.fontSize = `${newSize}%`;
      return newSize;
    });
  };

  // Load text size on component mount
  useEffect(() => {
    const savedSize = localStorage.getItem('appTextSize');
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTodayStats = () => {
    const todaySales = salesData.filter(sale => sale.date === selectedDate);
    const todayCredits = creditData.filter(credit => credit.date === selectedDate);
    const todayIncome = incomeData.filter(income => income.date === selectedDate);
    const todayExpenses = expenseData.filter(expense => expense.date === selectedDate);

    // Calculate fuel sales by fuel type
    const fuelSalesByType = {};
    todaySales.forEach(sale => {
      if (!fuelSalesByType[sale.fuelType]) {
        fuelSalesByType[sale.fuelType] = { liters: 0, amount: 0 };
      }
      fuelSalesByType[sale.fuelType].liters += sale.liters;
      fuelSalesByType[sale.fuelType].amount += sale.amount;
    });
    
    // Calculate fuel cash sales (Reading sales with type='cash' WITHOUT MPP tag)
    const fuelCashSales = todaySales
      .filter(sale => sale.type === 'cash' && !sale.mpp && sale.mpp !== true && sale.mpp !== 'true')
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    // Calculate income from direct entries (separated by MPP tag)
    const directIncomeNoMPP = todayIncome.filter(income => !income.mpp).reduce((sum, income) => sum + income.amount, 0);
    const directIncomeMPP = todayIncome.filter(income => income.mpp === true || income.mpp === 'true').reduce((sum, income) => sum + income.amount, 0);
    const directIncome = directIncomeNoMPP + directIncomeMPP;
    
    // Calculate income from credit sales (separated by parent credit's MPP tag)
    const creditIncomeNoMPP = todayCredits
      .filter(credit => !credit.mpp)
      .reduce((sum, credit) => {
        if (credit.incomeEntries && credit.incomeEntries.length > 0) {
          return sum + credit.incomeEntries.reduce((incSum, entry) => incSum + entry.amount, 0);
        }
        return sum;
      }, 0);
    
    const creditIncomeMPP = todayCredits
      .filter(credit => credit.mpp === true || credit.mpp === 'true')
      .reduce((sum, credit) => {
        if (credit.incomeEntries && credit.incomeEntries.length > 0) {
          return sum + credit.incomeEntries.reduce((incSum, entry) => incSum + entry.amount, 0);
        }
        return sum;
      }, 0);
    
    const creditIncome = creditIncomeNoMPP + creditIncomeMPP;
    
    // Total income separated by MPP
    const otherIncomeNoMPP = directIncomeNoMPP + creditIncomeNoMPP;
    const otherIncomeMPP = directIncomeMPP + creditIncomeMPP;
    const otherIncome = directIncome + creditIncome;
    
    // Calculate expenses from direct entries (separated by MPP tag)
    const directExpensesNoMPP = todayExpenses.filter(expense => !expense.mpp).reduce((sum, expense) => sum + expense.amount, 0);
    const directExpensesMPP = todayExpenses.filter(expense => expense.mpp === true || expense.mpp === 'true').reduce((sum, expense) => sum + expense.amount, 0);
    const directExpenses = directExpensesNoMPP + directExpensesMPP;
    
    // Calculate expenses from credit sales (separated by parent credit's MPP tag)
    const creditExpensesNoMPP = todayCredits
      .filter(credit => !credit.mpp)
      .reduce((sum, credit) => {
        if (credit.expenseEntries && credit.expenseEntries.length > 0) {
          return sum + credit.expenseEntries.reduce((expSum, entry) => expSum + entry.amount, 0);
        }
        return sum;
      }, 0);
    
    const creditExpensesMPP = todayCredits
      .filter(credit => credit.mpp === true || credit.mpp === 'true')
      .reduce((sum, credit) => {
        if (credit.expenseEntries && credit.expenseEntries.length > 0) {
          return sum + credit.expenseEntries.reduce((expSum, entry) => expSum + entry.amount, 0);
        }
        return sum;
      }, 0);
    
    const creditExpenses = creditExpensesNoMPP + creditExpensesMPP;
    
    // Total expenses separated by MPP
    const totalExpensesNoMPP = directExpensesNoMPP + creditExpensesNoMPP;
    const totalExpensesMPP = directExpensesMPP + creditExpensesMPP;
    const totalExpenses = directExpenses + creditExpenses;
    
    // Debug logging for income/expenses
    console.log('=== INCOME/EXPENSE DEBUG ===');
    console.log('Today Income:', todayIncome.length, todayIncome.map(i => ({ id: i.id, mpp: i.mpp, type: typeof i.mpp, amount: i.amount })));
    console.log('Today Expenses:', todayExpenses.length, todayExpenses.map(e => ({ id: e.id, mpp: e.mpp, type: typeof e.mpp, amount: e.amount })));
    console.log('Today Credits:', todayCredits.length, todayCredits.map(c => ({ 
      id: c.id, 
      mpp: c.mpp, 
      incomeEntries: c.incomeEntries?.length || 0,
      expenseEntries: c.expenseEntries?.length || 0
    })));
    console.log('Income Stats:', {
      directIncomeNoMPP,
      directIncomeMPP,
      creditIncomeNoMPP,
      creditIncomeMPP,
      otherIncomeNoMPP,
      otherIncomeMPP
    });
    console.log('Expense Stats:', {
      directExpensesNoMPP,
      directExpensesMPP,
      creditExpensesNoMPP,
      creditExpensesMPP,
      totalExpensesNoMPP,
      totalExpensesMPP
    });
    console.log('===========================');
    
    // Calculate credit amount and liters (separated by MPP tag)
    const creditNoMPP = todayCredits.filter(c => !c.mpp && c.mpp !== true && c.mpp !== 'true');
    const creditWithMPP = todayCredits.filter(c => c.mpp === true || c.mpp === 'true');
    
    const creditTotalAmountNoMPP = creditNoMPP.reduce((sum, credit) => sum + credit.amount, 0);
    const creditTotalAmount = todayCredits.reduce((sum, credit) => sum + credit.amount, 0);
    
    const creditLitersNoMPP = creditNoMPP.reduce((sum, credit) => {
      if (credit.fuelEntries && credit.fuelEntries.length > 0) {
        return sum + credit.fuelEntries.reduce((literSum, entry) => literSum + entry.liters, 0);
      } else if (credit.liters) {
        return sum + credit.liters;
      }
      return sum;
    }, 0);
    
    const creditLiters = todayCredits.reduce((sum, credit) => {
      if (credit.fuelEntries && credit.fuelEntries.length > 0) {
        return sum + credit.fuelEntries.reduce((literSum, entry) => literSum + entry.liters, 0);
      } else if (credit.liters) {
        return sum + credit.liters;
      }
      return sum;
    }, 0);
    
    const creditLitersMPP = creditWithMPP.reduce((sum, credit) => {
      if (credit.fuelEntries && credit.fuelEntries.length > 0) {
        return sum + credit.fuelEntries.reduce((literSum, entry) => literSum + entry.liters, 0);
      } else if (credit.liters) {
        return sum + credit.liters;
      }
      return sum;
    }, 0);
    
    const creditAmountMPP = creditWithMPP.reduce((sum, credit) => sum + credit.amount, 0);
    
    // Calculate settlements without MPP tag
    const todaySettlements = settlementData.filter(s => s.date === selectedDate);
    const settlementNoMPP = todaySettlements.filter(s => !s.mpp).reduce((sum, s) => sum + (s.amount || 0), 0);
    
    // MPP calculations with debugging
    console.log('=== getTodayStats - MPP CALCULATIONS ===');
    console.log('Total today sales:', todaySales.length);
    console.log('All sales with MPP info:', todaySales.map(s => ({ 
      id: s.id, 
      mpp: s.mpp, 
      type: typeof s.mpp,
      amount: s.amount,
      liters: s.liters
    })));
    
    const salesWithMPP = todaySales.filter(s => s.mpp === true || s.mpp === 'true');
    console.log('Sales WITH MPP (filtered):', salesWithMPP.length, salesWithMPP.map(s => ({ id: s.id, amount: s.amount })));
    
    const fuelSalesMPP = salesWithMPP.reduce((sum, sale) => sum + sale.amount, 0);
    const fuelLitersMPP = salesWithMPP.reduce((sum, sale) => sum + sale.liters, 0);
    
    const settlementMPP = todaySettlements.filter(s => s.mpp === true || s.mpp === 'true').reduce((sum, s) => sum + (s.amount || 0), 0);
    const mppCash = fuelSalesMPP - creditAmountMPP - totalExpensesMPP + otherIncomeMPP - settlementMPP;
    const hasMPPData = fuelSalesMPP > 0 || creditAmountMPP > 0 || settlementMPP > 0 || otherIncomeMPP > 0 || totalExpensesMPP > 0;
    
    console.log('MPP Stats:', {
      fuelSalesMPP,
      fuelLitersMPP,
      creditAmountMPP,
      settlementMPP,
      mppCash,
      hasMPPData
    });
    
    // Fuel sales without MPP (for left column)
    const salesNoMPP = todaySales.filter(sale => sale.type === 'cash' && !sale.mpp && sale.mpp !== true && sale.mpp !== 'true');
    console.log('Sales NO MPP (filtered):', salesNoMPP.length, salesNoMPP.map(s => ({ id: s.id, amount: s.amount })));
    
    const fuelSalesNoMPP = fuelCashSales;
    const fuelLitersNoMPP = salesNoMPP.reduce((sum, sale) => sum + sale.liters, 0);
    
    console.log('Left Column Stats:', {
      fuelSalesNoMPP,
      fuelLitersNoMPP
    });
    console.log('========================================');
    
    // Cash in Hand = Fuel Sales (no MPP) - Credit Sales (no MPP) - Expenses (no MPP) + Income (no MPP) - Settlement (no MPP)
    const cashInHand = fuelCashSales - creditTotalAmountNoMPP - totalExpensesNoMPP + otherIncomeNoMPP - settlementNoMPP;
    
    // MPP Cash is separate and calculated independently
    // Total available cash = Cash in Hand + MPP Cash (for display only)
    const totalAvailableCash = cashInHand + mppCash;
    
    const totalLiters = todaySales.reduce((sum, sale) => sum + sale.liters, 0);
    
    // Total income is fuel sales + other income
    const totalIncome = fuelCashSales + otherIncome;
    
    // Net cash position (what's actually in hand - no MPP)
    const netCash = cashInHand;
    
    return { 
      fuelCashSales,
      cashInHand,
      mppCash,
      totalAvailableCash,
      hasMPPData,
      creditAmount: creditTotalAmount,
      creditLiters,
      totalLiters, 
      totalSales: fuelCashSales + creditTotalAmount,
      otherIncome,
      otherIncomeNoMPP,
      otherIncomeMPP,
      totalIncome,
      totalExpenses,
      totalExpensesNoMPP,
      totalExpensesMPP,
      netCash,
      fuelSalesByType,
      // Separate MPP data
      fuelSalesNoMPP,
      fuelLitersNoMPP,
      creditAmountNoMPP: creditTotalAmountNoMPP,
      creditLitersNoMPP,
      settlementNoMPP,
      fuelSalesMPP,
      fuelLitersMPP,
      creditAmountMPP,
      creditLitersMPP,
      settlementMPP
    };
  };

  const stats = getTodayStats();

  // Data handling functions (offline localStorage)
  const addSaleRecord = (saleData) => {
    try {
      console.log('=== ADDING SALE RECORD ===');
      console.log('Sale Data:', {
        ...saleData,
        date: selectedDate,
        mpp: saleData.mpp,
        mppType: typeof saleData.mpp
      });
      
      const newSale = localStorageService.addSaleRecord({
        ...saleData,
        date: selectedDate
      });
      
      console.log('Sale Added to Storage:', newSale);
      console.log('MPP field saved:', newSale.mpp, 'Type:', typeof newSale.mpp);
      
      // Update local state immediately
      setSalesData(prev => {
        const updated = [...prev, newSale];
        console.log('Updated salesData state:', updated.map(s => ({ id: s.id, mpp: s.mpp, amount: s.amount })));
        return updated;
      });
      
      // If this sale has MPP tag, auto-generate receipt for MPP customer
      if (newSale.mpp === true && newSale.amount > 0) {
        createAutoReceiptForMPP(
          newSale.amount,
          `Auto-receipt: MPP Fuel Sale - ${newSale.fuelType || 'Fuel'}`,
          newSale.id,
          'sale'
        );
      }
      
      return newSale;
    } catch (error) {
      console.error('Failed to add sale record:', error);
    }
  };

  const addCreditRecord = (creditData) => {
    try {
      const newCredit = localStorageService.addCreditRecord({
        ...creditData,
        // Use the date from creditData if provided, otherwise use selectedDate
        date: creditData.date || selectedDate
      });
      
      // Update local state immediately
      setCreditData(prev => [...prev, newCredit]);
      
      return newCredit;
    } catch (error) {
      console.error('Failed to add credit record:', error);
    }
  };

  const addIncomeRecord = (incomeData) => {
    try {
      const newIncome = localStorageService.addIncomeRecord({
        ...incomeData,
        date: selectedDate
      });
      
      // Update local state immediately
      setIncomeData(prev => [...prev, newIncome]);
      
      return newIncome;
    } catch (error) {
      console.error('Failed to add income record:', error);
    }
  };

  const addExpenseRecord = (expenseData) => {
    try {
      const newExpense = localStorageService.addExpenseRecord({
        ...expenseData,
        date: selectedDate
      });
      
      // Update local state immediately
      setExpenseData(prev => [...prev, newExpense]);
      
      return newExpense;
    } catch (error) {
      console.error('Failed to add expense record:', error);
    }
  };

  const addSettlementRecord = (settlementData) => {
    try {
      const newSettlement = localStorageService.addSettlement({
        ...settlementData,
        date: selectedDate
      });
      
      // Update local state immediately
      setSettlementData(prev => [...prev, newSettlement]);
      
      return newSettlement;
    } catch (error) {
      console.error('Failed to add settlement record:', error);
    }
  };

  // Delete functions
  const deleteSaleRecord = (id) => {
    try {
      // Get the sale record before deletion to check if it's MPP
      const saleToDelete = salesData.find(sale => sale.id === id);
      
      const success = localStorageService.deleteSaleRecord(id);
      if (success) {
        setSalesData(prev => prev.filter(sale => sale.id !== id));
        
        // Delete corresponding auto-generated receipt if it was MPP
        if (saleToDelete && saleToDelete.mpp === true) {
          deleteAutoReceiptForMPP(id, 'sale');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to delete sale record:', error);
    }
    return false;
  };

  const deleteCreditRecord = (id) => {
    try {
      // Get the credit record before deletion to check if it's MPP
      const creditToDelete = creditData.find(credit => credit.id === id);
      
      const success = localStorageService.deleteCreditRecord(id);
      if (success) {
        setCreditData(prev => prev.filter(credit => credit.id !== id));
        
        // Delete corresponding auto-generated receipt if it was MPP
        if (creditToDelete && creditToDelete.mpp === true) {
          deleteAutoReceiptForMPP(id, 'credit');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to delete credit record:', error);
    }
    return false;
  };

  const deleteIncomeRecord = (id) => {
    try {
      const success = localStorageService.deleteIncomeRecord(id);
      if (success) {
        setIncomeData(prev => prev.filter(income => income.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete income record:', error);
    }
    return false;
  };

  const deleteExpenseRecord = (id) => {
    try {
      const success = localStorageService.deleteExpenseRecord(id);
      if (success) {
        setExpenseData(prev => prev.filter(expense => expense.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete expense record:', error);
    }
    return false;
  };

  const deleteSettlementRecord = (id) => {
    try {
      // Get the settlement record before deletion to check if it's MPP
      const settlementToDelete = settlementData.find(settlement => settlement.id === id);
      
      const success = localStorageService.deleteSettlement(id);
      if (success) {
        setSettlementData(prev => prev.filter(settlement => settlement.id !== id));
        
        // Delete corresponding auto-generated receipt if it was MPP
        if (settlementToDelete && settlementToDelete.mpp === true) {
          deleteAutoReceiptForMPP(id, 'settlement');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to delete settlement record:', error);
    }
    return false;
  };

  // Edit dialog handlers
  const handleEditSale = (saleRecord) => {
    setEditingSaleData(saleRecord);
    setSalesDialogOpen(true);
  };

  const handleEditCredit = (creditRecord) => {
    setEditingCreditData(creditRecord);
    setCreditDialogOpen(true);
  };

  const handleEditIncomeExpense = (record, type) => {
    setEditingIncomeExpenseData({ ...record, type });
    setIncomeExpenseDialogOpen(true);
  };

  const handleEditSettlement = (settlementRecord) => {
    setEditingSettlementData(settlementRecord);
    setSettleIncExpActiveTab('settlement');
    setSettleIncExpDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setSalesDialogOpen(false);
    setCreditDialogOpen(false);
    setSettleIncExpDialogOpen(false);
    setIncomeExpenseDialogOpen(false);
    setEditingSaleData(null);
    setEditingCreditData(null);
    setEditingSettlementData(null);
    setEditingIncomeExpenseData(null);
  };

  // Update functions
  const updateSaleRecord = (id, updatedData) => {
    try {
      // Get the original sale record to compare
      const originalSale = salesData.find(sale => sale.id === id);
      
      const updatedSale = localStorageService.updateSaleRecord(id, updatedData);
      if (updatedSale) {
        setSalesData(prev => prev.map(sale => sale.id === id ? updatedSale : sale));
        
        // Handle MPP receipt updates
        if (updatedSale.mpp === true && updatedSale.amount > 0) {
          // Update auto-generated receipt for MPP customer
          updateAutoReceiptForMPP(
            id,
            'sale',
            updatedSale.amount,
            `Auto-receipt: MPP Fuel Sale - ${updatedSale.fuelType || 'Fuel'}`
          );
        } else if (originalSale && originalSale.mpp === true) {
          // If MPP tag was removed or amount is 0, delete the receipt
          deleteAutoReceiptForMPP(id, 'sale');
        }
        
        return updatedSale;
      }
    } catch (error) {
      console.error('Failed to update sale record:', error);
    }
    return null;
  };

  const updateCreditRecord = (id, updatedData) => {
    try {
      // Get the original credit record to compare
      const originalCredit = creditData.find(credit => credit.id === id);
      
      const updatedCredit = localStorageService.updateCreditRecord(id, updatedData);
      if (updatedCredit) {
        setCreditData(prev => prev.map(credit => credit.id === id ? updatedCredit : credit));
        
        // Handle MPP receipt updates for credit sales
        if (updatedCredit.mpp === true) {
          // Calculate fuel sales amount (excluding income/expense)
          const fuelAmount = updatedCredit.fuelEntries ? 
            updatedCredit.fuelEntries.reduce((sum, entry) => {
              return sum + (parseFloat(entry.liters || 0) * parseFloat(entry.rate || 0));
            }, 0) : 0;
          
          if (fuelAmount > 0) {
            // Update auto-generated receipt for MPP customer
            updateAutoReceiptForMPP(
              id,
              'credit',
              fuelAmount,
              `Auto-receipt: MPP Credit Sale (Fuel) - ${updatedCredit.customerName || 'Credit Sale'}`
            );
          } else {
            // If fuel amount is 0, delete the receipt
            deleteAutoReceiptForMPP(id, 'credit');
          }
        } else if (originalCredit && originalCredit.mpp === true) {
          // If MPP tag was removed, delete the receipt
          deleteAutoReceiptForMPP(id, 'credit');
        }
        
        return updatedCredit;
      }
    } catch (error) {
      console.error('Failed to update credit record:', error);
    }
    return null;
  };

  const updateIncomeRecord = (id, updatedData) => {
    try {
      const updatedIncome = localStorageService.updateIncomeRecord(id, updatedData);
      if (updatedIncome) {
        setIncomeData(prev => prev.map(income => income.id === id ? updatedIncome : income));
        return updatedIncome;
      }
    } catch (error) {
      console.error('Failed to update income record:', error);
    }
    return null;
  };

  const updateExpenseRecord = (id, updatedData) => {
    try {
      const updatedExpense = localStorageService.updateExpenseRecord(id, updatedData);
      if (updatedExpense) {
        setExpenseData(prev => prev.map(expense => expense.id === id ? updatedExpense : expense));
        return updatedExpense;
      }
    } catch (error) {
      console.error('Failed to update expense record:', error);
    }
    return null;
  };

  const updateSettlementRecord = (id, updatedData) => {
    try {
      // Get the original settlement record to compare
      const originalSettlement = settlementData.find(settlement => settlement.id === id);
      
      const updatedSettlement = localStorageService.updateSettlement(id, updatedData);
      if (updatedSettlement) {
        setSettlementData(prev => prev.map(settlement => settlement.id === id ? updatedSettlement : settlement));
        
        // Handle MPP receipt updates for settlements
        if (updatedSettlement.mpp === true && updatedSettlement.amount > 0) {
          // Update auto-generated receipt for MPP customer
          updateAutoReceiptForMPP(
            id,
            'settlement',
            updatedSettlement.amount,
            `Auto-receipt: MPP Settlement - ${updatedSettlement.description || 'Settlement'}`
          );
        } else if (originalSettlement && originalSettlement.mpp === true) {
          // If MPP tag was removed or amount is 0, delete the receipt
          deleteAutoReceiptForMPP(id, 'settlement');
        }
        
        return updatedSettlement;
      }
    } catch (error) {
      console.error('Failed to update settlement record:', error);
    }
    return null;
  };

  const updateFuelRate = (fuelType, rate, date = selectedDate) => {
    try {
      // Save rate for the specific date
      const success = localStorageService.updateFuelRate(fuelType, rate, date);
      
      if (success) {
        // Update local state immediately
        setFuelSettings(prev => ({
          ...prev,
          [fuelType]: { ...prev[fuelType], price: parseFloat(rate) }
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating fuel rate:', error);
      return false;
    }
  };

  // Customer Management Handlers
  const handleAddCustomer = (name, startingBalance = 0, isMPP = false) => {
    try {
      const newCustomer = localStorageService.addCustomer(name, startingBalance, isMPP);
      setCustomers(localStorageService.getCustomers()); // Reload sorted list
      toast({
        title: "Success",
        description: `Customer "${name}" added successfully.`,
        variant: "default"
      });
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to add customer.',
        variant: "destructive"
      });
      return null;
    }
  };

  const handleDeleteCustomer = (id) => {
    try {
      localStorageService.deleteCustomer(id);
      setCustomers(localStorageService.getCustomers());
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleUpdateCustomer = (id, startingBalance, isMPP) => {
    try {
      localStorageService.updateCustomer(id, startingBalance, isMPP);
      setCustomers(localStorageService.getCustomers());
      toast({
        title: "Success",
        description: "Customer updated successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update customer.',
        variant: "destructive"
      });
    }
  };

  // Payment Handlers
  const handleAddPayment = (paymentData) => {
    try {
      localStorageService.addPayment(paymentData);
      setPayments(localStorageService.getPayments());
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  // Helper function to automatically create receipt for Mobile Petrol Pump customer
  const createAutoReceiptForMPP = (amount, description, sourceId = null, sourceType = null) => {
    try {
      const mppCustomer = customers.find(c => c.isMPP === true);
      if (mppCustomer && amount > 0) {
        const receiptData = {
          customerId: mppCustomer.id,
          customerName: mppCustomer.name,
          amount: amount,
          date: selectedDate,
          paymentDate: selectedDate,
          description: description || 'Auto-generated receipt',
          isAutoGenerated: true,
          sourceId: sourceId, // ID of the source record (sale, credit, settlement)
          sourceType: sourceType // Type: 'sale', 'credit', 'settlement'
        };
        const newReceipt = localStorageService.addPayment(receiptData);
        setPayments(localStorageService.getPayments());
        console.log(`Auto-generated receipt for ${mppCustomer.name}: ₹${amount}`);
        return newReceipt;
      }
    } catch (error) {
      console.error('Error creating auto receipt for MPP:', error);
    }
    return null;
  };

  // Helper function to find and update auto-generated receipt
  const updateAutoReceiptForMPP = (sourceId, sourceType, newAmount, newDescription) => {
    try {
      const currentPayments = localStorageService.getPayments();
      const autoReceipt = currentPayments.find(p => 
        p.isAutoGenerated === true && 
        p.sourceId === sourceId && 
        p.sourceType === sourceType
      );
      
      if (autoReceipt && newAmount > 0) {
        const updatedReceiptData = {
          ...autoReceipt,
          amount: newAmount,
          description: newDescription,
          date: selectedDate,
          paymentDate: selectedDate
        };
        localStorageService.updatePayment(autoReceipt.id, updatedReceiptData);
        setPayments(localStorageService.getPayments());
        console.log(`Updated auto-receipt for MPP: ₹${newAmount}`);
      } else if (autoReceipt && newAmount <= 0) {
        // If new amount is 0 or negative, delete the receipt
        deleteAutoReceiptForMPP(sourceId, sourceType);
      }
    } catch (error) {
      console.error('Error updating auto receipt for MPP:', error);
    }
  };

  // Helper function to delete auto-generated receipt
  const deleteAutoReceiptForMPP = (sourceId, sourceType) => {
    try {
      const currentPayments = localStorageService.getPayments();
      const autoReceipt = currentPayments.find(p => 
        p.isAutoGenerated === true && 
        p.sourceId === sourceId && 
        p.sourceType === sourceType
      );
      
      if (autoReceipt) {
        localStorageService.deletePayment(autoReceipt.id);
        setPayments(localStorageService.getPayments());
        console.log(`Deleted auto-receipt for MPP sales ID: ${sourceId}`);
      }
    } catch (error) {
      console.error('Error deleting auto receipt for MPP:', error);
    }
  };

  const handleUpdatePayment = (id, paymentData) => {
    try {
      localStorageService.updatePayment(id, paymentData);
      setPayments(localStorageService.getPayments());
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleDeletePayment = (id) => {
    try {
      localStorageService.deletePayment(id);
      setPayments(localStorageService.getPayments());
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  // Export functions
  
  // Helper function to calculate stats for any data set
  const calculateStats = (sales, credits, income, expenses) => {
    const fuelSalesByType = {};
    let totalLiters = 0;
    let fuelCashSales = 0;

    sales.forEach(sale => {
      if (!fuelSalesByType[sale.fuelType]) {
        fuelSalesByType[sale.fuelType] = { liters: 0, amount: 0 };
      }
      fuelSalesByType[sale.fuelType].liters += sale.liters;
      fuelSalesByType[sale.fuelType].amount += sale.amount;
      totalLiters += sale.liters;
      fuelCashSales += sale.amount;
    });

    const creditLiters = credits.reduce((sum, credit) => {
      if (credit.fuelEntries && credit.fuelEntries.length > 0) {
        return sum + credit.fuelEntries.reduce((literSum, entry) => literSum + entry.liters, 0);
      } else if (credit.liters) {
        return sum + credit.liters;
      }
      return sum;
    }, 0);
    const creditAmount = credits.reduce((sum, credit) => sum + credit.amount, 0);
    
    // Calculate income from direct entries
    const directIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Calculate income from credit sales
    const creditIncome = credits.reduce((sum, credit) => {
      if (credit.incomeEntries && credit.incomeEntries.length > 0) {
        return sum + credit.incomeEntries.reduce((incSum, entry) => incSum + entry.amount, 0);
      }
      return sum;
    }, 0);
    
    // Total income includes both direct and credit income
    const otherIncome = directIncome + creditIncome;
    
    // Calculate expenses from direct entries
    const directExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate expenses from credit sales
    const creditExpenses = credits.reduce((sum, credit) => {
      if (credit.expenseEntries && credit.expenseEntries.length > 0) {
        return sum + credit.expenseEntries.reduce((expSum, entry) => expSum + entry.amount, 0);
      }
      return sum;
    }, 0);
    
    // Total expenses includes both direct and credit expenses
    const totalExpenses = directExpenses + creditExpenses;
    
    const cashInHand = fuelCashSales - creditAmount + otherIncome - totalExpenses;

    return {
      fuelSalesByType,
      totalLiters,
      fuelCashSales,
      creditLiters,
      creditAmount,
      otherIncome,
      totalExpenses,
      cashInHand
    };
  };
  
  // Direct PDF generation (works in AppsGeyser/WebView)
  const generateDirectPDF = () => {
    try {
      // Filter data based on date settings
      let filteredSales, filteredCredits, filteredIncome, filteredExpenses;
      
      if (pdfSettings.dateRange === 'single') {
        filteredSales = salesData.filter(sale => sale.date === pdfSettings.startDate);
        filteredCredits = creditData.filter(credit => credit.date === pdfSettings.startDate);
        filteredIncome = incomeData.filter(income => income.date === pdfSettings.startDate);
        filteredExpenses = expenseData.filter(expense => expense.date === pdfSettings.startDate);
      } else {
        // Date range filter
        filteredSales = salesData.filter(sale => sale.date >= pdfSettings.startDate && sale.date <= pdfSettings.endDate);
        filteredCredits = creditData.filter(credit => credit.date >= pdfSettings.startDate && credit.date <= pdfSettings.endDate);
        filteredIncome = incomeData.filter(income => income.date >= pdfSettings.startDate && income.date <= pdfSettings.endDate);
        filteredExpenses = expenseData.filter(expense => expense.date >= pdfSettings.startDate && expense.date <= pdfSettings.endDate);
      }

      // Calculate stats for filtered data
      const filteredStats = calculateStats(filteredSales, filteredCredits, filteredIncome, filteredExpenses);

      // Create PDF with settings
      const doc = new jsPDF({
        orientation: pdfSettings.orientation,
        unit: 'mm',
        format: pdfSettings.pageSize
      });

      // Set font
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('M.Pump Calc Daily Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateText = pdfSettings.dateRange === 'single' 
        ? pdfSettings.startDate 
        : `${pdfSettings.startDate} to ${pdfSettings.endDate}`;
      doc.text(dateText, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

      let yPos = 30;

      // SUMMARY TABLE (if enabled)
      if (pdfSettings.includeSummary) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SUMMARY', 14, yPos);
        yPos += 5;

        const summaryData = [];
        let rowNum = 1;
        
        // Fuel sales by type
        Object.entries(filteredStats.fuelSalesByType).forEach(([fuelType, data]) => {
        summaryData.push([
          `${rowNum}. ${fuelType} Sales`,
          data.liters.toFixed(2),
          `₹${data.amount.toFixed(2)}`
        ]);
        rowNum++;
      });

        // Total if multiple fuel types
        if (Object.keys(filteredStats.fuelSalesByType).length > 1) {
          summaryData.push([
            'Total Reading Sales',
            filteredStats.totalLiters.toFixed(2),
            `₹${filteredStats.fuelCashSales.toFixed(2)}`
          ]);
        }

        if (pdfSettings.includeCredit) {
          summaryData.push([
            `${rowNum}. Credit Sales`,
            filteredStats.creditLiters.toFixed(2),
            `₹${filteredStats.creditAmount.toFixed(2)}`
          ]);
          rowNum++;
        }

        if (pdfSettings.includeIncome) {
          summaryData.push([
            `${rowNum}. Income`,
            '-',
            `₹${filteredStats.otherIncome.toFixed(2)}`
          ]);
          rowNum++;
        }

        if (pdfSettings.includeExpense) {
          summaryData.push([
            `${rowNum}. Expenses`,
            '-',
            `₹${filteredStats.totalExpenses.toFixed(2)}`
          ]);
        }

        summaryData.push([
          'Cash in Hand',
          '-',
          `₹${filteredStats.cashInHand.toFixed(2)}`
        ]);

      doc.autoTable({
        startY: yPos,
        head: [['Category', 'Litres', 'Amount']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' }
        }
      });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // READING SALES (if enabled and has data)
      if (pdfSettings.includeSales && filteredSales.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('READING SALES', 14, yPos);
        yPos += 5;

        const salesTableData = filteredSales.map(sale => [
          sale.nozzle,
          sale.fuelType,
          sale.startReading,
          sale.endReading,
          sale.liters.toFixed(2),
          `₹${sale.rate.toFixed(2)}`,
          `₹${sale.amount.toFixed(2)}`
        ]);

        salesTableData.push([
          { content: 'Total Reading Sales', colSpan: 4, styles: { fontStyle: 'bold' } },
          filteredStats.totalLiters.toFixed(2),
          '-',
          `₹${filteredStats.fuelCashSales.toFixed(2)}`
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Nozzle', 'Fuel Type', 'Start', 'End', 'Liters', 'Rate', 'Amount']],
          body: salesTableData,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            2: { halign: 'right', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 20 },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right', fontStyle: 'bold' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // CREDIT SALES (if enabled and has data)
      if (pdfSettings.includeCredit && filteredCredits.length > 0 && yPos < 250) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CREDIT SALES', 14, yPos);
        yPos += 5;

        const creditTableData = filteredCredits.map(credit => [
          credit.customerName,
          credit.vehicleNumber || 'N/A',
          credit.fuelType || 'N/A',
          credit.liters ? credit.liters.toFixed(2) : 'N/A',
          credit.rate ? `₹${credit.rate.toFixed(2)}` : 'N/A',
          `₹${credit.amount.toFixed(2)}`
        ]);

        creditTableData.push([
          { content: 'Total Credit Sales', colSpan: 5, styles: { fontStyle: 'bold' } },
          `₹${filteredStats.creditAmount.toFixed(2)}`
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Customer', 'Vehicle', 'Fuel Type', 'Liters', 'Rate', 'Amount']],
          body: creditTableData,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: {
            1: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // INCOME & EXPENSES (if enabled and has data)
      const showIncome = pdfSettings.includeIncome && filteredIncome.length > 0;
      const showExpense = pdfSettings.includeExpense && filteredExpenses.length > 0;
      
      if ((showIncome || showExpense) && yPos < 250) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INCOME & EXPENSES', 14, yPos);
        yPos += 5;

        const incomeExpenseData = [];
        if (showIncome) {
          filteredIncome.forEach(income => {
            incomeExpenseData.push(['Income', income.description, `₹${income.amount.toFixed(2)}`]);
          });
        }
        if (showExpense) {
          filteredExpenses.forEach(expense => {
            incomeExpenseData.push(['Expense', expense.description, `₹${expense.amount.toFixed(2)}`]);
          });
        }

        doc.autoTable({
          startY: yPos,
          head: [['Type', 'Description', 'Amount']],
          body: incomeExpenseData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: {
            2: { halign: 'right' }
          }
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Generated on: ${new Date().toLocaleString()}`,
          105,
          287,
          { align: 'center' }
        );
      }

      // Generate filename
      const fileName = pdfSettings.dateRange === 'single' 
        ? `mpump-report-${pdfSettings.startDate}.pdf`
        : `mpump-report-${pdfSettings.startDate}-to-${pdfSettings.endDate}.pdf`;

      // Check if running in Android WebView
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isWebView = /wv/.test(navigator.userAgent) || window.MPumpCalcAndroid;

      if (isAndroid && isWebView && window.MPumpCalcAndroid) {
        // Android WebView - Save to Downloads and open with viewer
        try {
          const pdfBlob = doc.output('blob');
          const reader = new FileReader();
          
          reader.onloadend = function() {
            const base64data = reader.result.split(',')[1];
            // Save PDF to Downloads/MPumpCalc folder and open with viewer
            window.MPumpCalcAndroid.openPdfWithViewer(base64data, fileName);
          };
          
          reader.readAsDataURL(pdfBlob);
          
          toast({
            title: "PDF Generated",
            description: "Saving PDF to Downloads folder...",
          });
        } catch (error) {
          console.error('Android PDF error:', error);
          // Fallback to download
          doc.save(fileName);
        }
      } else {
        // Browser - Normal download
        doc.save(fileName);
        
        toast({
          title: "PDF Generated",
          description: `${fileName} has been downloaded`,
        });
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not create PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      // Check if running in Android WebView
      const isAndroid = typeof window.MPumpCalcAndroid !== 'undefined';
      
      if (isAndroid) {
        // Generate PDF using jsPDF and pass to Android
        generatePDFForAndroid();
        return;
      }
      
      // Get today's data for web version
      const todaySales = salesData.filter(sale => sale.date === selectedDate);
      const todayCredits = creditData.filter(credit => credit.date === selectedDate);
      const todayIncome = incomeData.filter(income => income.date === selectedDate);
      const todayExpenses = expenseData.filter(expense => expense.date === selectedDate);

      // Create formatted HTML content with simplified markup
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Daily Report - ${selectedDate}</title>
<style>
body{font:Arial;margin:10px;line-height:1.2}
h1{font-size:28px;margin:0;text-align:center}
p{font-size:18px;margin:2px 0;text-align:center}
.s{margin:15px 0 5px 0;font-size:18px;font-weight:bold}
table{width:100%;border-collapse:collapse;font-size:14px;margin:5px 0}
th{background:#f0f0f0;border:1px solid #000;padding:4px;text-align:center;font-weight:bold;font-size:15px}
td{border:1px solid #000;padding:3px;font-size:14px}
.r{text-align:right}
.c{text-align:center}
.t{font-weight:bold;background:#f8f8f8}
.print-btn{background:#007bff;color:white;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:5px;margin:10px auto;display:block;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
.print-btn:hover{background:#0056b3}
.no-print{display:block}
@media print{body{margin:8mm}.no-print{display:none}}
</style>
</head>
<body>
<h1>Daily Report</h1>
<p>Date: ${selectedDate}</p>

<p style="font-size:16px;margin:8px 0;font-weight:bold;color:#7c3aed">
STOCK: ${fuelSettings ? Object.keys(fuelSettings).map(fuelType => {
  const storageKey = fuelType.toLowerCase() + 'StockData';
  const savedData = localStorage.getItem(storageKey);
  let startStock = 0;
  if (savedData) {
    const allStockData = JSON.parse(savedData);
    const dateData = allStockData[selectedDate];
    if (dateData) {
      startStock = dateData.startStock || 0;
    }
  }
  return fuelType + '=' + startStock.toFixed(0) + ' L';
}).join(' ') : 'N/A'}
</p>

<div class="s">SUMMARY</div>
<table>
<tr><th>Category<th>Litres<th>Amount</tr>
${Object.entries(stats.fuelSalesByType).map(([fuelType, data]) => 
  `<tr><td>${fuelType} Sales<td class="r">${data.liters.toFixed(2)}L<td class="r">${data.amount.toFixed(2)}</tr>`
).join('')}
<tr><td>Credit Sales<td class="r">${stats.creditLiters.toFixed(2)}L<td class="r">${stats.creditAmount.toFixed(2)}</tr>
<tr><td>Income<td class="r">-<td class="r">${stats.otherIncome.toFixed(2)}</tr>
<tr><td>Expenses<td class="r">-<td class="r">${stats.totalExpenses.toFixed(2)}</tr>
<tr class="t"><td><b>Cash in Hand</b><td class="r"><b>${stats.totalLiters.toFixed(2)}L</b><td class="r"><b>${stats.cashInHand.toFixed(2)}</b></tr>
</table>

${todaySales.length > 0 ? `
<div class="s">SALES RECORDS</div>
<table>
<tr><th width="8%">Sr.No<th width="22%">Description<th width="12%">Start<th width="12%">End<th width="12%">Rate<th width="12%">Litres<th width="12%">Amount</tr>
${todaySales.map((sale, index) => 
  `<tr><td class="c">${index + 1}<td>${sale.nozzle} - ${sale.fuelType}<td class="r">${sale.startReading}<td class="r">${sale.endReading}<td class="r">${sale.rate}<td class="r">${sale.liters}<td class="r">${sale.amount.toFixed(2)}</tr>`
).join('')}
<tr class="t"><td colspan="5" class="r"><b>Total:</b><td class="r"><b>${todaySales.reduce((sum, sale) => sum + parseFloat(sale.liters), 0).toFixed(2)}</b><td class="r"><b>${todaySales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0).toFixed(2)}</b></tr>
</table>` : ''}

${todayCredits.length > 0 ? `
<div class="s">CREDIT RECORDS</div>
<table>
<tr><th width="8%">Sr.No<th width="40%">Customer<th width="15%">Rate<th width="15%">Litres<th width="22%">Amount</tr>
${todayCredits.map((credit, index) => 
  `<tr><td class="c">${index + 1}<td>${credit.customerName}<td class="r">${credit.rate}<td class="r">${credit.liters}<td class="r">${credit.amount.toFixed(2)}</tr>`
).join('')}
<tr class="t"><td colspan="3" class="r"><b>Total:</b><td class="r"><b>${todayCredits.reduce((sum, credit) => sum + parseFloat(credit.liters), 0).toFixed(2)}</b><td class="r"><b>${todayCredits.reduce((sum, credit) => sum + parseFloat(credit.amount), 0).toFixed(2)}</b></tr>
</table>` : ''}

${todayIncome.length > 0 ? `
<div class="s">INCOME RECORDS</div>
<table>
<tr><th width="10%">Sr.No<th width="70%">Description<th width="20%">Amount</tr>
${todayIncome.map((income, index) => 
  `<tr><td class="c">${index + 1}<td>${income.description}<td class="r">${income.amount.toFixed(2)}</tr>`
).join('')}
<tr class="t"><td colspan="2" class="r"><b>Total Income:</b><td class="r"><b>${todayIncome.reduce((sum, income) => sum + parseFloat(income.amount), 0).toFixed(2)}</b></tr>
</table>` : ''}

${todayExpenses.length > 0 ? `
<div class="s">EXPENSE RECORDS</div>
<table>
<tr><th width="10%">Sr.No<th width="70%">Description<th width="20%">Amount</tr>
${todayExpenses.map((expense, index) => 
  `<tr><td class="c">${index + 1}<td>${expense.description}<td class="r">${expense.amount.toFixed(2)}</tr>`
).join('')}
<tr class="t"><td colspan="2" class="r"><b>Total Expenses:</b><td class="r"><b>${todayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2)}</b></tr>
</table>` : ''}

<div style="margin-top:15px;text-align:center;font-size:10px;border-top:1px solid #000;padding-top:5px">
Generated on: ${new Date().toLocaleString()}
</div>

<div class="no-print" style="text-align:center;margin:20px 0">
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>

<script>
// Auto print on load (with delay for content loading)
window.onload = function() {
  setTimeout(() => {
    window.print();
  }, 500);
};
</script>
</body>
</html>`;

      // Open in new window for printing/PDF generation
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow pop-ups for this site to enable PDF export and printing.');
        return;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Focus window
      printWindow.focus();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Generate PDF for Android WebView using jsPDF
  const generatePDFForAndroid = () => {
    try {
      const todaySales = salesData.filter(sale => sale.date === selectedDate);
      const todayCredits = creditData.filter(credit => credit.date === selectedDate);
      const todayIncome = incomeData.filter(income => income.date === selectedDate);
      const todayExpenses = expenseData.filter(expense => expense.date === selectedDate);

      // Create PDF using jsPDF
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.text('M.Pump Calc Daily Report', 105, yPos, { align: 'center' });
      yPos += 10;

      // Date
      doc.setFontSize(12);
      doc.text(`Date: ${selectedDate}`, 105, yPos, { align: 'center' });
      yPos += 8;

      // Stock Summary
      doc.setFontSize(10);
      doc.setTextColor(124, 58, 237); // Purple color
      const stockSummaryText = fuelSettings ? Object.keys(fuelSettings).map(fuelType => {
        const storageKey = `${fuelType.toLowerCase()}StockData`;
        const savedData = localStorage.getItem(storageKey);
        let startStock = 0;
        if (savedData) {
          const allStockData = JSON.parse(savedData);
          const dateData = allStockData[selectedDate];
          if (dateData) {
            startStock = dateData.startStock || 0;
          }
        }
        return `${fuelType}=${startStock.toFixed(0)} L`;
      }).join(' ') : 'N/A';
      doc.text(`STOCK: ${stockSummaryText}`, 105, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black
      yPos += 15;

      // Summary Section
      doc.setFontSize(14);
      doc.text('SUMMARY', 14, yPos);
      yPos += 5;

      const summaryData = [];
      Object.entries(stats.fuelSalesByType).forEach(([fuelType, data]) => {
        summaryData.push([`${fuelType} Sales`, `${data.liters.toFixed(2)}L`, `${data.amount.toFixed(2)}`]);
      });
      summaryData.push(['Credit Sales', `${stats.creditLiters.toFixed(2)}L`, `${stats.creditAmount.toFixed(2)}`]);
      summaryData.push(['Income', '-', `${stats.otherIncome.toFixed(2)}`]);
      summaryData.push(['Expenses', '-', `${stats.totalExpenses.toFixed(2)}`]);
      summaryData.push(['Cash in Hand', `${stats.totalLiters.toFixed(2)}L`, `${stats.cashInHand.toFixed(2)}`]);

      doc.autoTable({
        startY: yPos,
        head: [['Category', 'Litres', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
        styles: { fontSize: 10 }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Sales Records
      if (todaySales.length > 0 && yPos < 250) {
        doc.setFontSize(14);
        doc.text('SALES RECORDS', 14, yPos);
        yPos += 5;

        const salesTableData = todaySales.map((sale, index) => [
          index + 1,
          `${sale.nozzle} - ${sale.fuelType}`,
          sale.startReading,
          sale.endReading,
          sale.rate,
          sale.liters,
          sale.amount.toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Description', 'Start', 'End', 'Rate', 'Litres', 'Amount']],
          body: salesTableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Credit Records
      if (todayCredits.length > 0 && yPos < 250) {
        doc.setFontSize(14);
        doc.text('CREDIT RECORDS', 14, yPos);
        yPos += 5;

        const creditTableData = todayCredits.map((credit, index) => [
          index + 1,
          credit.customerName,
          credit.vehicleNumber || 'N/A',
          credit.rate,
          credit.liters,
          credit.amount.toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Customer', 'Vehicle', 'Rate', 'Litres', 'Amount']],
          body: creditTableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Income Records
      if (todayIncome.length > 0 && yPos < 250) {
        doc.setFontSize(14);
        doc.text('INCOME RECORDS', 14, yPos);
        yPos += 5;

        const incomeTableData = todayIncome.map((income, index) => [
          index + 1,
          income.description,
          income.amount.toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Description', 'Amount']],
          body: incomeTableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Expense Records
      if (todayExpenses.length > 0 && yPos < 250) {
        doc.setFontSize(14);
        doc.text('EXPENSE RECORDS', 14, yPos);
        yPos += 5;

        const expenseTableData = todayExpenses.map((expense, index) => [
          index + 1,
          expense.description,
          expense.amount.toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Description', 'Amount']],
          body: expenseTableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Get PDF as Base64
      const pdfBase64 = doc.output('dataurlstring').split(',')[1];
      const fileName = `Report_${selectedDate}.pdf`;

      // Call Android native method to save PDF
      if (window.MPumpCalcAndroid && window.MPumpCalcAndroid.openPdfWithViewer) {
        window.MPumpCalcAndroid.openPdfWithViewer(pdfBase64, fileName);
      }
    } catch (error) {
      console.error('Error generating PDF for Android:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Debug function removed

  // CSV export function removed per user request

  const copyToClipboard = () => {
    const textContent = generateTextContent();
    navigator.clipboard.writeText(textContent).then(() => {
      alert('Daily report copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Daily report copied to clipboard!');
    });
  };

  // PDF export content generation function removed

  // CSV content generation function removed per user request

  const generateTextContent = () => {
    const todaySales = salesData.filter(sale => sale.date === selectedDate);
    const todayCredits = creditData.filter(credit => credit.date === selectedDate);
    const todayIncome = incomeData.filter(income => income.date === selectedDate);
    const todayExpenses = expenseData.filter(expense => expense.date === selectedDate);

    let text = `Date: ${selectedDate}\n\n`;
    
    // Summary section
    text += `*Summary*\n`;
    Object.entries(stats.fuelSalesByType).forEach(([fuelType, data]) => {
      text += `${fuelType} Sales: ${data.liters.toFixed(2)}L - ${data.amount.toFixed(2)}\n`;
    });
    text += `Credit Sales: ${stats.creditLiters.toFixed(2)}L - ${stats.creditAmount.toFixed(2)}\n`;
    text += `Income: ${stats.otherIncome.toFixed(2)}\n`;
    text += `Expenses: ${stats.totalExpenses.toFixed(2)}\n`;
    text += `Cash in Hand: ${stats.cashInHand.toFixed(2)}\n`;
    text += `-------\n\n`;
    
    // *Readings* section
    if (todaySales.length > 0) {
      text += `*Readings*\n`;
      todaySales.forEach((sale, index) => {
        text += `${index + 1}. Readings:\n`;
        text += ` Description: ${sale.nozzle}\n`;
        text += ` Starting: ${sale.startReading}\n`;
        text += ` Ending: ${sale.endReading}\n`;
        text += ` Litres: ${sale.liters}\n`;
        text += ` Rate: ${sale.rate}\n`;
        text += ` Amount: ${sale.amount.toFixed(2)}\n`;
      });
      text += `*Readings Total: ${stats.fuelCashSales.toFixed(2)}*\n`;
      text += `-------\n`;
    }
    
    // *Credits* section
    if (todayCredits.length > 0) {
      text += `*Credits*\n`;
      todayCredits.forEach((credit, index) => {
        text += `${index + 1}. Credit:\n`;
        text += ` Description: ${credit.customerName}\n`;
        text += ` Litre: ${credit.liters}\n`;
        text += ` Rate: ${credit.rate}\n`;
        text += ` Amount: ${credit.amount.toFixed(2)}\n`;
      });
      text += `*Credits Total: ${stats.creditAmount.toFixed(2)}*\n`;
      text += `-------\n`;
    }
    
    // *Income* section
    if (todayIncome.length > 0) {
      text += `*Income*\n`;
      todayIncome.forEach((income, index) => {
        text += `${index + 1}. Income:\n`;
        text += ` ${income.description}: ${income.amount.toFixed(2)}\n`;
      });
      text += `*Income Total: ${stats.otherIncome.toFixed(2)}*\n`;
      text += `-------\n`;
    }
    
    // *Expenses* section
    if (todayExpenses.length > 0) {
      text += `*Expenses*\n`;
      todayExpenses.forEach((expense, index) => {
        text += `${index + 1}. Expenses:\n`;
        text += ` ${expense.description}: ${expense.amount.toFixed(2)}\n`;
      });
      text += `*Expenses Total: ${stats.totalExpenses.toFixed(2)}*\n`;
      text += `-------\n`;
    }
    
    text += `\n************************\n`;
    text += `*Total Amount: ${stats.cashInHand.toFixed(2)}*\n`;
    
    return text;
  };

  // Loading screen removed per user request

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        
        {/* Offline mode display removed per user request */}
        {/* Header */}
        <div className="flex items-center justify-between mb-1 sm:mb-2 pt-status-bar">
          {/* Left Side: Settings and App Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderSettings 
              isDarkMode={isDarkMode}
              fuelSettings={fuelSettings}
              setFuelSettings={setFuelSettings}
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onUpdateCustomer={handleUpdateCustomer}
            />
            
            <div 
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-full">
                <Fuel className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className={`text-base sm:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                Mobile Petrol Pump
              </h1>
            </div>
          </div>
          
          {/* Right Side: Text Size and Dark Mode Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Text Size Controls */}
            <div className="flex items-center gap-3 sm:gap-4 border rounded-md p-1" style={{
              borderColor: isDarkMode ? '#4b5563' : '#e2e8f0'
            }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={decreaseTextSize}
                className="h-7 w-7 p-0 hover:bg-opacity-10"
                title="Decrease text size"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="text-xs px-2 hidden sm:inline">{textSize}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={increaseTextSize}
                className="h-7 w-7 p-0 hover:bg-opacity-10"
                title="Increase text size"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
            >
              {isDarkMode ? <Sun className="w-3 h-3 sm:w-4 sm:h-4" /> : <Moon className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
              <span className="sm:hidden">{isDarkMode ? 'L' : 'D'}</span>
            </Button>
          </div>
        </div>

        {/* Parent Tabs: Today Summary / Balance */}
        <div className={`border-b mb-2 ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="grid grid-cols-2 gap-0">
            <button
              onClick={() => setParentTab('today')}
              className={`py-3 px-4 text-center font-semibold transition-colors ${
                parentTab === 'today'
                  ? isDarkMode
                    ? 'bg-blue-900 text-white border-b-2 border-blue-500'
                    : 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Today Summary
            </button>
            <button
              onClick={() => setParentTab('outstanding')}
              className={`py-3 px-4 text-center font-semibold transition-colors ${
                parentTab === 'outstanding'
                  ? isDarkMode
                    ? 'bg-blue-900 text-white border-b-2 border-blue-500'
                    : 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Balance
            </button>
          </div>
        </div>

        {/* Date Section - Only show in Today Summary */}
        {parentTab === 'today' && (
          <Card className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          } shadow-lg mb-2`}>
            <CardContent className="p-2 sm:p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <Label className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Operating Date
                      </Label>
                      <div className={`text-sm sm:text-xl font-bold truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {formatDisplayDate(selectedDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotesOpen(true)}
                      className={`text-xs h-7 px-2 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Notes"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      N
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToPDF}
                      className={`text-xs h-7 px-2 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className={`text-xs h-7 px-2 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousDay}
                    className={`h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0 ${
                      isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  
                  <div className={`border rounded-lg p-1 sm:p-1.5 flex-1 min-w-0 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    <Input
                      id="date-picker"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`h-6 sm:h-8 w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextDay}
                    className={`h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0 ${
                      isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock Summary Section - Between Operating Date and Summary */}
        {parentTab === 'today' && (
          <Card key={`stock-summary-${stockDataVersion}`} className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          } shadow-lg mb-2`}>
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Package className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <span className={`text-xs sm:text-sm font-semibold ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  STOCK:
                </span>
                {fuelSettings && Object.keys(fuelSettings).map((fuelType, index) => {
                  // Fetch start stock for each fuel type
                  // stockDataVersion is used to trigger re-render when stock data changes
                  const storageKey = `${fuelType.toLowerCase()}StockData`;
                  const savedData = localStorage.getItem(storageKey);
                  let startStock = 0;
                  
                  if (savedData) {
                    const allStockData = JSON.parse(savedData);
                    const dateData = allStockData[selectedDate];
                    if (dateData) {
                      startStock = dateData.startStock || 0;
                    }
                  }
                  
                  return (
                    <span 
                      key={fuelType}
                      className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {fuelType}={startStock.toFixed(0)} L{index < Object.keys(fuelSettings).length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock and Rate Buttons - Same height as STOCK summary */}
        {parentTab === 'today' && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Stock Button */}
            <Card 
              className="bg-white border-slate-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setStockDialogOpen(true)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-purple-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Add Stock
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rate Button */}
            <Card 
              className="bg-white border-slate-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setRateDialogOpen(true)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Add Rate
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today Summary View */}
        {parentTab === 'today' && (
          <>
            {/* Summary Section - Two Column Layout */}
        <Card className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        } shadow-lg mb-2`}>
          <CardContent className="p-2 sm:p-3">
            <div className={`grid ${stats.hasMPPData ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* LEFT COLUMN - Regular Data (No MPP) */}
              <div className="space-y-1.5 sm:space-y-2">
                {/* Summary Header for Left Column */}
                <h2 className={`text-lg sm:text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Summary
                </h2>
                {/* Fuel Sales (No MPP) */}
                <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      1
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Fuel Sales
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {stats.fuelLitersNoMPP.toFixed(2)}L • ₹{stats.fuelSalesNoMPP.toFixed(2)}
                    </div>
                  </div>
                </div>
              
              {/* Show total if there are multiple fuel types */}
              {Object.keys(stats.fuelSalesByType).length > 1 && (
                <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-slate-50'
                } border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-slate-300'}`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      T
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Total Reading Sales
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {stats.totalLiters.toFixed(2)}L • ₹{stats.fuelCashSales.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

                {/* Credit Sales (No MPP) */}
                <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg border-l-4 border-orange-500 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-orange-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      2
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Credit Sales
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {stats.creditLitersNoMPP.toFixed(2)}L • ₹{stats.creditAmountNoMPP.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Income (No MPP) */}
                <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      3
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Income
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      ₹{stats.otherIncomeNoMPP.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Expenses (No MPP) */}
                <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      4
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Expenses
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      ₹{stats.totalExpensesNoMPP.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Settlement (No MPP) */}
                <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      5
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Settlement
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      ₹{stats.settlementNoMPP.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Cash in Hand */}
                <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg border-l-4 border-purple-500 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      6
                    </div>
                    <span className={`font-medium text-xs sm:text-base truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      Cash in Hand
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      ₹{stats.cashInHand.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - MPP Data */}
              {stats.hasMPPData && (
                <div className="space-y-1.5 sm:space-y-2">
                  {/* MPP Header */}
                  <h3 className={`text-lg sm:text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    MPP
                  </h3>

                  {/* Fuel Sales (MPP) */}
                  <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        1
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Fuel Sales
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {stats.fuelLitersMPP.toFixed(2)}L • ₹{stats.fuelSalesMPP.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Credit Sales (MPP) */}
                  <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg border-l-4 border-orange-500 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-orange-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        2
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Credit Sales
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {stats.creditLitersMPP.toFixed(2)}L • ₹{stats.creditAmountMPP.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Income (MPP) */}
                  <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        3
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Income
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        ₹{stats.otherIncomeMPP.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Expenses (MPP) */}
                  <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        4
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Expenses
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        ₹{stats.totalExpensesMPP.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Settlement (MPP) */}
                  <div className={`flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        5
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        Settlement
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        ₹{stats.settlementMPP.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* MPP Cash */}
                  <div className={`flex justify-between items-center p-2 sm:p-3 rounded-lg border-l-4 border-purple-500 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        6
                      </div>
                      <span className={`font-medium text-xs sm:text-base truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        MPP Cash
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs sm:text-lg font-bold whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        ₹{stats.mppCash.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards section removed as requested by user */}

        {/* Quick Action Buttons - Same height as STOCK summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2">
          <Card 
            className={`${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } border-0 shadow-lg cursor-pointer transition-colors`}
            onClick={() => {
              setEditingSaleData(null);
              setSalesDialogOpen(true);
            }}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-center gap-2">
                <Calculator className="w-4 h-4 text-white" />
                <span className="text-xs sm:text-sm font-semibold text-white">Reading Sales</span>
              </div>
            </CardContent>
          </Card>
          
          <Sheet open={salesDialogOpen} onOpenChange={setSalesDialogOpen}>
            <SheetContent side="bottom" className={`h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <SheetHeader>
                <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                  {editingSaleData ? 'Edit Sale Record' : 'Add Sale Record'}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]">
                <SalesTracker 
                  isDarkMode={isDarkMode}
                  salesData={salesData}
                  addSaleRecord={addSaleRecord}
                  updateSaleRecord={updateSaleRecord}
                  deleteSaleRecord={deleteSaleRecord}
                  fuelSettings={fuelSettings}
                  selectedDate={selectedDate}
                  creditData={creditData}
                  incomeData={incomeData}
                  expenseData={expenseData}
                  formResetKey={formResetKey}
                  editingRecord={editingSaleData}
                  onRecordSaved={handleCloseDialogs}
                  hideRecordsList={true}
                  customers={customers}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Card 
            className={`${
              isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-600 hover:bg-orange-700'
            } border-0 shadow-lg cursor-pointer transition-colors`}
            onClick={() => {
              setEditingCreditData(null);
              setCreditDialogOpen(true);
            }}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4 text-white" />
                <span className="text-xs sm:text-sm font-semibold text-white">Credit Sales</span>
              </div>
            </CardContent>
          </Card>
          
          <Sheet open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
            <SheetContent 
              side="bottom" 
              className={`h-[90vh] w-screen max-w-none left-0 right-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
              style={{ width: '100vw', maxWidth: '100vw' }}
            >
              <SheetHeader className="px-2">
                <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                  {editingCreditData ? 'Edit Credit Record' : 'Add Credit Record'}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)] px-2">
                <CreditSales 
                  isDarkMode={isDarkMode}
                  creditData={creditData}
                  addCreditRecord={addCreditRecord}
                  updateCreditRecord={updateCreditRecord}
                  deleteCreditRecord={deleteCreditRecord}
                  fuelSettings={fuelSettings}
                  selectedDate={selectedDate}
                  salesData={salesData}
                  incomeData={incomeData}
                  expenseData={expenseData}
                  formResetKey={formResetKey}
                  editingRecord={editingCreditData}
                  onRecordSaved={handleCloseDialogs}
                  hideRecordsList={true}
                  customers={customers}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Card 
            className={`${
              isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
            } border-0 shadow-lg cursor-pointer transition-colors`}
            onClick={() => {
              setEditingSettlementData(null);
              setEditingIncomeExpenseData(null);
              setSettleIncExpActiveTab('settlement');
              setSettleIncExpDialogOpen(true);
            }}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-white" />
                <span className="text-xs sm:text-sm font-semibold text-white">Settle/Inc./Exp</span>
              </div>
            </CardContent>
          </Card>
          
          <Sheet open={settleIncExpDialogOpen} onOpenChange={setSettleIncExpDialogOpen}>
            <SheetContent side="bottom" className={`h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <Tabs value={settleIncExpActiveTab} onValueChange={setSettleIncExpActiveTab} className="w-full h-full flex flex-col">
                <TabsList className={`grid w-full grid-cols-2 mx-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <TabsTrigger value="settlement" className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    Settlement
                  </TabsTrigger>
                  <TabsTrigger value="incexp" className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Inc./Exp.
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="settlement" className="flex-1 overflow-hidden">
                  <SheetHeader className="px-2">
                    <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                      {editingSettlementData ? 'Edit Settlement' : 'Add Settlement'}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 overflow-y-auto h-[calc(90vh-150px)] px-2">
                    <Settlement 
                      isDarkMode={isDarkMode}
                      settlementData={settlementData}
                      addSettlementRecord={addSettlementRecord}
                      updateSettlementRecord={updateSettlementRecord}
                      deleteSettlementRecord={deleteSettlementRecord}
                      selectedDate={selectedDate}
                      formResetKey={formResetKey}
                      editingRecord={editingSettlementData}
                      onRecordSaved={handleCloseDialogs}
                      hideRecordsList={true}
                      customers={customers}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="incexp" className="flex-1 overflow-hidden">
                  <SheetHeader className="px-2">
                    <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                      {editingIncomeExpenseData ? 'Edit Income/Expense' : 'Add Income/Expense'}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 overflow-y-auto h-[calc(90vh-150px)] px-2">
                <IncomeExpense 
                  isDarkMode={isDarkMode}
                  incomeData={incomeData}
                  addIncomeRecord={addIncomeRecord}
                  updateIncomeRecord={updateIncomeRecord}
                  deleteIncomeRecord={deleteIncomeRecord}
                  expenseData={expenseData}
                  addExpenseRecord={addExpenseRecord}
                  updateExpenseRecord={updateExpenseRecord}
                  deleteExpenseRecord={deleteExpenseRecord}
                  selectedDate={selectedDate}
                  salesData={salesData}
                  creditData={creditData}
                  formResetKey={formResetKey}
                  editingRecord={editingIncomeExpenseData}
                  onRecordSaved={handleCloseDialogs}
                  hideRecordsList={true}
                  customers={customers}
                />
              </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>

        {/* All Records & C Sales Tabs - Below action buttons */}
        <Tabs value={todaySubTab} onValueChange={setTodaySubTab} className="w-full mt-4">
          <TabsList className={`flex w-full mb-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-slate-100'
          }`}>
            <TabsTrigger value="all" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[33%]">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="c-sales" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[34%]">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Manage Credit</span>
              <span className="sm:hidden">Credit</span>
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[33%]">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Receipt</span>
              <span className="sm:hidden">Rcpt</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UnifiedRecords 
              isDarkMode={isDarkMode}
              salesData={salesData}
              creditData={creditData}
              incomeData={incomeData}
              expenseData={expenseData}
              settlementData={settlementData}
              selectedDate={selectedDate}
              onEditSale={handleEditSale}
              deleteSaleRecord={deleteSaleRecord}
              onEditCredit={handleEditCredit}
              deleteCreditRecord={deleteCreditRecord}
              onEditIncome={(record) => handleEditIncomeExpense(record, 'income')}
              deleteIncomeRecord={deleteIncomeRecord}
              onEditExpense={(record) => handleEditIncomeExpense(record, 'expense')}
              deleteExpenseRecord={deleteExpenseRecord}
              onEditSettlement={handleEditSettlement}
              deleteSettlementRecord={deleteSettlementRecord}
            />
          </TabsContent>

          <TabsContent value="c-sales">
            <CreditSalesManagement
              customers={customers}
              creditData={creditData}
              selectedDate={selectedDate}
              onEditCredit={handleEditCredit}
              onDeleteCredit={deleteCreditRecord}
              isDarkMode={isDarkMode}
            />
          </TabsContent>

          <TabsContent value="receipt">
            <PaymentReceived
              customers={customers}
              payments={payments}
              selectedDate={selectedDate}
              onAddPayment={handleAddPayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
              isDarkMode={isDarkMode}
            />
          </TabsContent>
        </Tabs>

        {/* Stock Dialog/Sheet */}
        <Sheet open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
          <SheetContent 
            side="bottom" 
            className={`h-[90vh] w-screen max-w-none left-0 right-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            style={{ width: '100vw', maxWidth: '100vw' }}
          >
            <SheetHeader className="px-2">
              <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                Stock Entry
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)] px-2">
              <MPPStock 
                isDarkMode={isDarkMode}
                selectedDate={selectedDate}
                salesData={salesData}
                fuelSettings={fuelSettings}
                onClose={() => setStockDialogOpen(false)}
                onStockSaved={() => setStockDataVersion(v => v + 1)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Rate Dialog/Sheet */}
        <Sheet open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
          <SheetContent 
            side="bottom" 
            className={`h-[90vh] w-screen max-w-none left-0 right-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            style={{ width: '100vw', maxWidth: '100vw' }}
          >
            <SheetHeader className="px-2">
              <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                Rate Configuration
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)] px-2">
              <PriceConfiguration 
                isDarkMode={isDarkMode}
                fuelSettings={fuelSettings}
                updateFuelRate={updateFuelRate}
                selectedDate={selectedDate}
                salesData={salesData}
                creditData={creditData}
                incomeData={incomeData}
                expenseData={expenseData}
                onClose={() => setRateDialogOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Notes Dialog */}
        <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
          <SheetContent 
            side="bottom" 
            className={`h-[80vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
          >
            <SheetHeader className="px-2">
              <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                Notes
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-2 flex flex-col h-[calc(80vh-80px)]">
              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  localStorage.setItem('mpp_notes', e.target.value);
                }}
                placeholder="Write your notes here..."
                className={`flex-1 resize-none ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white border-gray-600' 
                    : 'bg-white text-slate-900 border-slate-300'
                }`}
              />
            </div>
          </SheetContent>
        </Sheet>
        </>
        )}

        {/* Outstanding View */}
        {parentTab === 'outstanding' && (
          <div className="mt-4">
            {/* Outstanding Sub-tabs */}
            <Tabs value={outstandingSubTab} onValueChange={setOutstandingSubTab} className="w-full">
              <TabsList className={`flex w-full mb-4 ${
                isDarkMode ? 'bg-gray-800' : 'bg-slate-100'
              }`}>
                <TabsTrigger value="bank-settlement" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[33%]">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Bank Settlement</span>
                  <span className="sm:hidden">Bank</span>
                </TabsTrigger>
                <TabsTrigger value="outstanding-settings" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[34%]">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Outstanding</span>
                  <span className="sm:hidden">Ot</span>
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm w-[33%]">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Customer Ledger</span>
                  <span className="sm:hidden">Cust</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bank-settlement">
                <BankSettlement
                  isDarkMode={isDarkMode}
                  settlementData={settlementData}
                  payments={payments}
                  creditData={creditData}
                  salesData={salesData}
                  selectedDate={selectedDate}
                />
              </TabsContent>

              <TabsContent value="outstanding-settings">
                <OutstandingPDFReport
                  customers={customers}
                  creditData={creditData}
                  payments={payments}
                  isDarkMode={isDarkMode}
                  selectedDate={selectedDate}
                />
              </TabsContent>

              <TabsContent value="report">
                <CustomerLedger
                  customers={customers}
                  creditData={creditData}
                  payments={payments}
                  salesData={salesData}
                  settlementData={settlementData}
                  isDarkMode={isDarkMode}
                  selectedDate={selectedDate}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* PDF Settings Dialog */}
        <Sheet open={pdfSettingsOpen} onOpenChange={setPdfSettingsOpen}>
          <SheetContent side="right" className={`w-full sm:max-w-md ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <SheetHeader>
              <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                PDF Export Settings
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Content Selection */}
              <div className="space-y-3">
                <Label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Include in PDF
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeSummary"
                      checked={pdfSettings.includeSummary}
                      onChange={(e) => setPdfSettings({...pdfSettings, includeSummary: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="includeSummary" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Summary
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeSales"
                      checked={pdfSettings.includeSales}
                      onChange={(e) => setPdfSettings({...pdfSettings, includeSales: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="includeSales" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Reading Sales
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeCredit"
                      checked={pdfSettings.includeCredit}
                      onChange={(e) => setPdfSettings({...pdfSettings, includeCredit: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="includeCredit" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Credit Sales
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeIncome"
                      checked={pdfSettings.includeIncome}
                      onChange={(e) => setPdfSettings({...pdfSettings, includeIncome: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="includeIncome" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Income
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeExpense"
                      checked={pdfSettings.includeExpense}
                      onChange={(e) => setPdfSettings({...pdfSettings, includeExpense: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="includeExpense" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Expenses
                    </Label>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Date Selection
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="singleDate"
                      name="dateRange"
                      checked={pdfSettings.dateRange === 'single'}
                      onChange={() => setPdfSettings({...pdfSettings, dateRange: 'single', startDate: selectedDate, endDate: selectedDate})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="singleDate" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Current Date ({selectedDate})
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="dateRange"
                      name="dateRange"
                      checked={pdfSettings.dateRange === 'range'}
                      onChange={() => setPdfSettings({...pdfSettings, dateRange: 'range'})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="dateRange" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                      Date Range
                    </Label>
                  </div>

                  {pdfSettings.dateRange === 'range' && (
                    <div className="pl-6 space-y-2">
                      <div>
                        <Label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                          Start Date
                        </Label>
                        <Input
                          type="date"
                          value={pdfSettings.startDate}
                          onChange={(e) => setPdfSettings({...pdfSettings, startDate: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                          End Date
                        </Label>
                        <Input
                          type="date"
                          value={pdfSettings.endDate}
                          onChange={(e) => setPdfSettings({...pdfSettings, endDate: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Format Options */}
              <div className="space-y-3">
                <Label className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  PDF Format
                </Label>
                
                <div>
                  <Label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Page Size
                  </Label>
                  <select
                    value={pdfSettings.pageSize}
                    onChange={(e) => setPdfSettings({...pdfSettings, pageSize: e.target.value})}
                    className={`w-full mt-1 px-3 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (216 x 279 mm)</option>
                    <option value="a5">A5 (148 x 210 mm)</option>
                  </select>
                </div>

                <div>
                  <Label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Orientation
                  </Label>
                  <select
                    value={pdfSettings.orientation}
                    onChange={(e) => setPdfSettings({...pdfSettings, orientation: e.target.value})}
                    className={`w-full mt-1 px-3 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPdfSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setPdfSettingsOpen(false);
                    generateDirectPDF();
                  }}
                >
                  Generate PDF
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
};

export default ZAPTRStyleCalculator;