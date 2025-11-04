import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { IndianRupee, Wallet, Trash2, Search, ChevronDown, Edit, X, AlertTriangle } from 'lucide-react';

const PaymentReceived = ({ 
  customers, 
  payments, 
  selectedDate,
  onAddPayment, 
  onDeletePayment, 
  onUpdatePayment,
  isDarkMode 
}) => {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(selectedDate);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Date range filter state
  const [fromDate, setFromDate] = useState(selectedDate);
  const [toDate, setToDate] = useState(selectedDate);
  
  // Record Receipt Sheet state
  const [recordReceiptOpen, setRecordReceiptOpen] = useState(false);
  
  // Filter state for receipts list
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterCustomerSearch, setFilterCustomerSearch] = useState('');
  const [showFilterCustomerDropdown, setShowFilterCustomerDropdown] = useState(false);
  const [showAllCustomersFilter, setShowAllCustomersFilter] = useState(true);
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, payment: null });
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentDate, setEditPaymentDate] = useState('');
  const [editCustomerSearch, setEditCustomerSearch] = useState('');
  const [showEditCustomerDropdown, setShowEditCustomerDropdown] = useState(false);
  
  const customerDropdownRef = useRef(null);
  const editCustomerDropdownRef = useRef(null);
  const filterCustomerDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
      if (editCustomerDropdownRef.current && !editCustomerDropdownRef.current.contains(event.target)) {
        setShowEditCustomerDropdown(false);
      }
      if (filterCustomerDropdownRef.current && !filterCustomerDropdownRef.current.contains(event.target)) {
        setShowFilterCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync date range with selectedDate
  useEffect(() => {
    setFromDate(selectedDate);
    setToDate(selectedDate);
    setPaymentDate(selectedDate);
  }, [selectedDate]);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredEditCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(editCustomerSearch.toLowerCase())
  );
  
  const filteredFilterCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(filterCustomerSearch.toLowerCase())
  );

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setEditCustomerId(payment.customerId);
    setEditCustomerSearch(payment.customerName);
    setEditAmount(payment.amount.toString());
    setEditPaymentDate(payment.date);
    setEditDialogOpen(true);
  };

  const handleUpdatePaymentSubmit = () => {
    if (editCustomerId && editAmount && parseFloat(editAmount) > 0 && editPaymentDate && editingPayment) {
      const customer = customers.find(c => c.id === editCustomerId);
      if (customer) {
        onUpdatePayment(editingPayment.id, {
          customerId: editCustomerId,
          customerName: customer.name,
          amount: parseFloat(editAmount),
          date: editPaymentDate
        });
        setEditDialogOpen(false);
        setEditingPayment(null);
        setEditCustomerId('');
        setEditCustomerSearch('');
        setEditAmount('');
        setEditPaymentDate('');
      }
    }
  };

  const handleDeleteClick = (payment) => {
    setDeleteConfirm({ show: true, payment });
  };

  const confirmDelete = () => {
    if (deleteConfirm.payment) {
      onDeletePayment(deleteConfirm.payment.id);
    }
    setDeleteConfirm({ show: false, payment: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, payment: null });
  };

  const handleAddPayment = () => {
    if (customerId && amount && parseFloat(amount) > 0 && paymentDate) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        onAddPayment({
          customerId,
          customerName: customer.name,
          amount: parseFloat(amount),
          date: paymentDate
        });
        // Save the current payment date before clearing
        const currentDate = paymentDate;
        setCustomerId('');
        setCustomerSearch('');
        setAmount('');
        // Keep the same date for next payment
        setPaymentDate(currentDate);
      }
    }
  };

  // Filter payments for date range
  const filteredPayments = payments.filter(p => {
    // Filter by date range
    const matchesDateRange = p.date >= fromDate && p.date <= toDate;
    
    // Filter by customer
    let matchesCustomer = showAllCustomersFilter;
    if (!showAllCustomersFilter && filterCustomerId) {
      const selectedCustomerObj = customers.find(c => c.id === filterCustomerId);
      if (selectedCustomerObj) {
        matchesCustomer = 
          p.customerId === filterCustomerId || 
          p.customerName === selectedCustomerObj.name;
      }
    }
    
    return matchesDateRange && matchesCustomer;
  });

  // Calculate total received in date range
  const totalReceived = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="space-y-4">
      {/* Record Receipt Button */}
      <Button
        onClick={() => setRecordReceiptOpen(true)}
        className={`w-full ${
          isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Record Receipt
      </Button>

      {/* Receipts List with Customer and Date Range Filters */}
      <Card className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      }`}>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="mb-4 space-y-3">
            {/* Customer Filter Row */}
            <div>
              <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Customer
              </Label>
              <div className="grid grid-cols-[1fr_auto] gap-3 mt-1">
                {/* Search and Select Customer Dropdown */}
                <div className="relative" ref={filterCustomerDropdownRef}>
                  <Input
                    type="text"
                    placeholder="Search and select customer..."
                    value={filterCustomerSearch}
                    onChange={(e) => {
                      setFilterCustomerSearch(e.target.value);
                      setShowFilterCustomerDropdown(true);
                    }}
                    onFocus={() => setShowFilterCustomerDropdown(true)}
                    disabled={showAllCustomersFilter}
                    className={`w-full pr-10 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                    } ${showAllCustomersFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } ${showAllCustomersFilter ? 'opacity-50' : ''}`}
                    onClick={() => !showAllCustomersFilter && setShowFilterCustomerDropdown(!showFilterCustomerDropdown)}
                  />
                  
                  {showFilterCustomerDropdown && !showAllCustomersFilter && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {/* Individual customers */}
                      {filteredFilterCustomers.length > 0 ? (
                        filteredFilterCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className={`px-3 py-2 cursor-pointer ${
                              isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            } ${
                              filterCustomerId === customer.id 
                                ? isDarkMode ? 'bg-blue-600' : 'bg-blue-100' 
                                : ''
                            }`}
                            onClick={() => {
                              setFilterCustomerId(customer.id);
                              setFilterCustomerSearch(customer.name);
                              setShowFilterCustomerDropdown(false);
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
                    id="allCustomersFilter"
                    checked={showAllCustomersFilter}
                    onChange={(e) => {
                      setShowAllCustomersFilter(e.target.checked);
                      if (e.target.checked) {
                        setFilterCustomerId('');
                        setFilterCustomerSearch('');
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label 
                    htmlFor="allCustomersFilter" 
                    className={`text-sm font-medium cursor-pointer ${
                      isDarkMode ? 'text-gray-200' : 'text-slate-700'
                    }`}
                  >
                    All Customers
                  </label>
                </div>
              </div>
            </div>

            {/* Receipt Heading and Total */}
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Receipt {formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)}
              </h3>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ₹{totalReceived.toFixed(2)}
              </div>
            </div>
            
            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fromDate" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  From Date
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="toDate" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  To Date
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
          </div>
          
          {filteredPayments.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No receipts in selected date range</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {payment.customerName}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ₹{payment.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPayment(payment)}
                      className={`hover:bg-blue-100 hover:text-blue-600 ${
                        isDarkMode ? 'text-gray-400 hover:bg-blue-900 hover:text-blue-400' : ''
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(payment)}
                      className={`hover:bg-red-100 hover:text-red-600 ${
                        isDarkMode ? 'text-gray-400 hover:bg-red-900 hover:text-red-400' : ''
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Receipt Sheet */}
      <Sheet open={recordReceiptOpen} onOpenChange={setRecordReceiptOpen}>
        <SheetContent side="bottom" className={`h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <SheetHeader>
            <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
              Record Receipt
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)] px-2">
            <div className="space-y-3">
              {/* Customer Search */}
              <div className="relative" ref={customerDropdownRef}>
                <Label htmlFor="customer" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                  Customer
                </Label>
                <div className="relative mt-1">
                  <Input
                    type="text"
                    placeholder="Search and select customer..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className={`w-full pr-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  />
                  
                  {showCustomerDropdown && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className={`px-3 py-2 cursor-pointer ${
                              isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            } ${
                              customerId === customer.id 
                                ? isDarkMode ? 'bg-blue-600' : 'bg-blue-100' 
                                : ''
                            }`}
                            onClick={() => {
                              setCustomerId(customer.id);
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
              </div>

              {/* Payment Date */}
              <div>
                <Label htmlFor="paymentDate" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                  Date
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                  Amount Received
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>

              {/* Record Receipt & Add More */}
              <Button
                onClick={() => {
                  handleAddPayment();
                  // Clear form but keep sheet open
                  setCustomerId('');
                  setCustomerSearch('');
                  setAmount('');
                  // Keep the same date for convenience
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!customerId || !amount || !paymentDate}
              >
                <IndianRupee className="w-4 h-4 mr-1" />
                Record Receipt & Add More
              </Button>

              {/* Record Receipt & Close */}
              <Button
                onClick={() => {
                  handleAddPayment();
                  setRecordReceiptOpen(false);
                  // Reset form
                  setCustomerId('');
                  setCustomerSearch('');
                  setAmount('');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!customerId || !amount || !paymentDate}
              >
                <IndianRupee className="w-4 h-4 mr-1" />
                Record Receipt & Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Edit Receipt Dialog */}
      <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <SheetContent side="bottom" className={`h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <SheetHeader>
            <SheetTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
              Edit Receipt
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4 px-2">
            <div className="relative" ref={editCustomerDropdownRef}>
              <Label htmlFor="editCustomer" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                Customer
              </Label>
              <div className="relative mt-1">
                <Input
                  type="text"
                  placeholder="Search and select customer..."
                  value={editCustomerSearch}
                  onChange={(e) => {
                    setEditCustomerSearch(e.target.value);
                    setShowEditCustomerDropdown(true);
                  }}
                  onFocus={() => setShowEditCustomerDropdown(true)}
                  className={`w-full pr-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
                <ChevronDown 
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  onClick={() => setShowEditCustomerDropdown(!showEditCustomerDropdown)}
                />
                
                {showEditCustomerDropdown && (
                  <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border shadow-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {filteredEditCustomers.length > 0 ? (
                      filteredEditCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className={`px-3 py-2 cursor-pointer ${
                            isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          } ${
                            editCustomerId === customer.id 
                              ? isDarkMode ? 'bg-blue-600' : 'bg-blue-100' 
                              : ''
                          }`}
                          onClick={() => {
                            setEditCustomerId(customer.id);
                            setEditCustomerSearch(customer.name);
                            setShowEditCustomerDropdown(false);
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
            </div>

            <div>
              <Label htmlFor="editDate" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                Payment Date
              </Label>
              <Input
                id="editDate"
                type="date"
                value={editPaymentDate}
                onChange={(e) => setEditPaymentDate(e.target.value)}
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div>
              <Label htmlFor="editAmount" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                Amount
              </Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter amount"
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdatePaymentSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!editCustomerId || !editAmount || !editPaymentDate}
              >
                <IndianRupee className="w-4 h-4 mr-1" />
                Update Receipt
              </Button>
              <Button
                onClick={() => setEditDialogOpen(false)}
                variant="outline"
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
                    Delete Receipt?
                  </h3>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    Are you sure you want to delete this receipt of <span className="font-semibold">₹{deleteConfirm.payment?.amount.toFixed(2)}</span> from <span className="font-semibold">"{deleteConfirm.payment?.customerName}"</span>?
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

export default PaymentReceived;
