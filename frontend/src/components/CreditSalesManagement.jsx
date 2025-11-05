import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Edit, Trash2, ChevronDown, AlertTriangle, IndianRupee } from 'lucide-react';
import { Badge } from './ui/badge';
import localStorageService from '../services/localStorage';

const CreditSalesManagement = ({ 
  customers, 
  creditData, 
  selectedDate,
  onEditCredit,
  onDeleteCredit,
  isDarkMode 
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(true);
  const [fromDate, setFromDate] = useState(selectedDate);
  const [toDate, setToDate] = useState(selectedDate);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, credit: null });
  
  const customerDropdownRef = useRef(null);

  // Sync date range with selectedDate
  useEffect(() => {
    setFromDate(selectedDate);
    setToDate(selectedDate);
  }, [selectedDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter credit sales based on customer and date range
  const filteredCreditData = creditData.filter(credit => {
    // Match by customerId or customerName (for backward compatibility)
    let matchesCustomer = showAllCustomers;
    if (!showAllCustomers && selectedCustomer) {
      const selectedCustomerObj = customers.find(c => c.id === selectedCustomer);
      if (selectedCustomerObj) {
        matchesCustomer = 
          credit.customerId === selectedCustomer || 
          credit.customerName === selectedCustomerObj.name;
      }
    }
    const matchesDateRange = credit.date >= fromDate && credit.date <= toDate;
    return matchesCustomer && matchesDateRange;
  });

  // Calculate total - handle undefined/null values and backward compatibility
  const totalAmount = filteredCreditData.reduce((sum, credit) => {
    const amount = credit.totalAmount || credit.amount || 0;
    return sum + amount;
  }, 0);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDeleteClick = (credit) => {
    // Check if Pro Mode is enabled
    if (localStorageService.isProModeEnabled()) {
      // Skip confirmation dialog, delete directly
      if (onDeleteCredit) {
        onDeleteCredit(credit.id);
      }
    } else {
      // Show confirmation dialog
      setDeleteConfirm({ show: true, credit });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm.credit && onDeleteCredit) {
      onDeleteCredit(deleteConfirm.credit.id);
    }
    setDeleteConfirm({ show: false, credit: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, credit: null });
  };

  return (
    <div className="space-y-4">
      <Card className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      }`}>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="space-y-3 mb-4">
            {/* Customer Selection Row */}
            <div>
              <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Customer
              </Label>
              <div className="grid grid-cols-[1fr_auto] gap-3 mt-1">
                {/* Search and Select Customer Dropdown */}
                <div className="relative" ref={customerDropdownRef}>
                  <Input
                    type="text"
                    placeholder="Search and select customer..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    disabled={showAllCustomers}
                    className={`w-full pr-10 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                    } ${showAllCustomers ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } ${showAllCustomers ? 'opacity-50' : ''}`}
                    onClick={() => !showAllCustomers && setShowCustomerDropdown(!showCustomerDropdown)}
                  />
                  
                  {showCustomerDropdown && !showAllCustomers && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {/* Individual customers */}
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className={`px-3 py-2 cursor-pointer ${
                              isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            } ${
                              selectedCustomer === customer.id 
                                ? isDarkMode ? 'bg-blue-600' : 'bg-blue-100' 
                                : ''
                            }`}
                            onClick={() => {
                              setSelectedCustomer(customer.id);
                              setCustomerSearch(customer.name);
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                              {customer.name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`px-3 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No customers found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* All Customers Checkbox */}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md min-w-[140px]" 
                     style={{ 
                       backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                       borderColor: isDarkMode ? '#4b5563' : '#d1d5db'
                     }}>
                  <input
                    type="checkbox"
                    id="allCustomers"
                    checked={showAllCustomers}
                    onChange={(e) => {
                      setShowAllCustomers(e.target.checked);
                      if (e.target.checked) {
                        setSelectedCustomer('');
                        setCustomerSearch('');
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label 
                    htmlFor="allCustomers" 
                    className={`text-sm font-medium cursor-pointer ${
                      isDarkMode ? 'text-gray-200' : 'text-slate-700'
                    }`}
                  >
                    All Customers
                  </label>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  From Date
                </Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div>
                <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  To Date
                </Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Header with Total */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300 dark:border-gray-600">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Credit Sales {formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)}
            </h3>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Credit Sales List */}
          {filteredCreditData.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No credit sales in selected date range</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredCreditData.map((credit) => (
                <div
                  key={credit.id}
                  className={`border rounded-lg p-2 sm:p-3 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <Badge className="bg-orange-100 text-orange-800 border-0 text-xs">
                        Credit
                      </Badge>
                      <div className="flex items-center gap-1 text-orange-600 font-bold">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-base sm:text-lg">{(credit.totalAmount || credit.amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCredit(credit)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(credit)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="mb-2">
                    <span className="font-semibold text-base break-words">{credit.customerName}</span>
                  </div>

                  {/* Fuel Entries */}
                  {credit.fuelEntries && credit.fuelEntries.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {credit.fuelEntries.map((entry, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${
                            isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-purple-50 border-purple-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
                              {entry.fuelType}
                            </Badge>
                            <span className="text-xs font-medium text-purple-600">
                              ₹{(entry.amount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>Litres: </span>
                              <span className="font-medium">{entry.liters}L</span>
                            </div>
                            <div>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>Rate: </span>
                              <span className="font-medium">₹{entry.rate}/L</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Income/Expense Entries */}
                  {((credit.incomeEntries && credit.incomeEntries.length > 0) || 
                    (credit.expenseEntries && credit.expenseEntries.length > 0)) && (
                    <div className="space-y-1">
                      {credit.incomeEntries?.map((entry, index) => (
                        <div
                          key={`income-${index}`}
                          className={`flex items-center justify-between text-xs p-1.5 rounded ${
                            isDarkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-50'
                          }`}
                        >
                          <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>
                            + {entry.description}
                          </span>
                          <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            +₹{(entry.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {credit.expenseEntries?.map((entry, index) => (
                        <div
                          key={`expense-${index}`}
                          className={`flex items-center justify-between text-xs p-1.5 rounded ${
                            isDarkMode ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'
                          }`}
                        >
                          <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>
                            - {entry.description}
                          </span>
                          <span className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            -₹{(entry.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-2 rounded-full ${
                  isDarkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Delete Credit Sale?
                  </h3>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    Are you sure you want to delete credit sale of <span className="font-semibold">₹{(deleteConfirm.credit?.totalAmount || deleteConfirm.credit?.amount || 0).toFixed(2)}</span> for <span className="font-semibold">"{deleteConfirm.credit?.customerName}"</span>?
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className={`${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  No, Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreditSalesManagement;
