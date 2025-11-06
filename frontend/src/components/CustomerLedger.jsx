import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Search, Printer, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CustomerLedger = ({ customers, creditData, payments, salesData, settlementData, incomeData, expenseData, isDarkMode, selectedDate }) => {
  const [customerId, setCustomerId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(selectedDate);
  const [ledgerData, setLedgerData] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [ledgerTab, setLedgerTab] = useState('generate'); // 'generate' or 'print'
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef(null);

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

  const generateReport = () => {
    if (!customerId || !fromDate || !toDate) {
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Check if this is Mobile Petrol Pump customer
    const isMPPCustomer = customer.isMPP === true || customer.name.toLowerCase().includes('mobile petrol pump');

    if (isMPPCustomer) {
      // Special calculation for Mobile Petrol Pump customer
      generateMPPReport(customer);
    } else {
      // Normal customer ledger calculation
      generateNormalReport(customer);
    }
  };

  const generateNormalReport = (customer) => {
    // Get all credit sales for this customer within date range
    const customerCredits = creditData
      .filter(c => c.customerName === customer.name)
      .filter(c => c.date >= fromDate && c.date <= toDate)
      .map(c => ({
        date: c.date,
        type: 'credit',
        credit: c.amount,
        received: 0,
        description: `Credit Sale - ${c.fuelType || 'N/A'} ${c.liters || 0}L`
      }));

    // Get all payments for this customer within date range
    const customerPayments = payments
      .filter(p => p.customerId === customerId)
      .filter(p => p.date >= fromDate && p.date <= toDate)
      .map(p => ({
        date: p.date,
        type: 'payment',
        credit: 0,
        received: p.amount,
        description: 'Payment Received'
      }));

    // Combine and sort by date
    const combined = [...customerCredits, ...customerPayments].sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    // Calculate running outstanding balance starting with customer's starting balance
    let runningBalance = customer.startingBalance || 0;
    const ledgerWithBalance = combined.map(item => {
      runningBalance += (item.credit - item.received);
      return {
        ...item,
        outstanding: runningBalance
      };
    });

    setLedgerData(ledgerWithBalance);
    setShowReport(true);
    setLedgerTab('print');
  };

  const generateMPPReport = (customer) => {
    const ledgerEntries = [];

    // 1. Normal credit sales for Mobile Petrol Pump customer (without MPP tag)
    const mppNormalCredits = creditData
      .filter(c => c.customerName === customer.name && c.mpp !== true && c.mpp !== 'true')
      .filter(c => c.date >= fromDate && c.date <= toDate)
      .map(c => ({
        date: c.date,
        type: 'credit',
        credit: c.amount,
        received: 0,
        description: `Credit Sale - ${c.fuelType || 'N/A'} ${c.liters || 0}L`
      }));

    // Note: We do NOT show individual MPP-tagged credits and settlements as line items
    // They are all included in the single "MPP Cash" calculation below

    // 4. MPP Cash calculation (Option B: Full Formula)
    // Shows complete MPP Cash calculation for reconciliation
    // Formula: MPP Fuel Sales - MPP Credit Sales + MPP Income - MPP Expenses - MPP Settlements
    // Note: Auto-payments are also shown separately for detailed tracking
    
    // Debug: Log all sales data to see mpp flags
    console.log('=== DEBUGGING MPP FILTERS ===');
    console.log('All Sales Data:', salesData.map(s => ({ date: s.date, mpp: s.mpp, type: s.type, amount: s.amount })));
    console.log('Date Range:', fromDate, 'to', toDate);
    
    // Get ALL MPP fuel sales in date range (both cash and credit)
    const mppSalesFiltered = salesData
      .filter(s => s.date >= fromDate && s.date <= toDate);
    console.log('Sales in date range:', mppSalesFiltered.map(s => ({ date: s.date, mpp: s.mpp, type: s.type, amount: s.amount })));
    
    const mppSalesWithTag = mppSalesFiltered.filter(s => s.mpp === true || s.mpp === 'true');
    console.log('MPP Tagged Sales (all types):', mppSalesWithTag.map(s => ({ date: s.date, mpp: s.mpp, type: s.type, amount: s.amount })));
    
    const mppFuelSales = mppSalesWithTag.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    console.log('Total MPP Fuel Sales:', mppFuelSales);
    
    // Get MPP credit sales amount (fuel portion only)
    const mppCreditsInRange = creditData.filter(c => c.date >= fromDate && c.date <= toDate);
    console.log('Credits in date range:', mppCreditsInRange.map(c => ({ date: c.date, mpp: c.mpp, customerName: c.customerName, amount: c.amount })));
    
    const mppCreditsWithTag = mppCreditsInRange.filter(c => c.mpp === true || c.mpp === 'true');
    console.log('MPP Tagged Credits:', mppCreditsWithTag.map(c => ({ date: c.date, mpp: c.mpp, customerName: c.customerName, amount: c.amount })));
    
    // Calculate fuel amount only from MPP credits
    const mppCreditAmount = mppCreditsWithTag.reduce((sum, credit) => {
      if (credit.fuelEntries && credit.fuelEntries.length > 0) {
        return sum + credit.fuelEntries.reduce((fuelSum, entry) => {
          return fuelSum + (parseFloat(entry.liters || 0) * parseFloat(entry.rate || 0));
        }, 0);
      } else {
        return sum + (credit.amount || 0);
      }
    }, 0);
    console.log('Total MPP Credit Amount (fuel only):', mppCreditAmount);
    
    // Get MPP income in date range (direct + from credit sales)
    const mppDirectIncome = incomeData
      .filter(inc => inc.mpp === true || inc.mpp === 'true')
      .filter(inc => inc.date >= fromDate && inc.date <= toDate)
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    const mppCreditIncome = creditData
      .filter(credit => credit.mpp === true || credit.mpp === 'true')
      .filter(credit => credit.date >= fromDate && credit.date <= toDate)
      .reduce((sum, credit) => {
        if (credit.incomeEntries && credit.incomeEntries.length > 0) {
          return sum + credit.incomeEntries.reduce((incSum, entry) => incSum + (entry.amount || 0), 0);
        }
        return sum;
      }, 0);
    
    const mppTotalIncome = mppDirectIncome + mppCreditIncome;
    
    // Get MPP expenses in date range (direct + from credit sales)
    const mppDirectExpenses = expenseData
      .filter(exp => exp.mpp === true || exp.mpp === 'true')
      .filter(exp => exp.date >= fromDate && exp.date <= toDate)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    const mppCreditExpenses = creditData
      .filter(credit => credit.mpp === true || credit.mpp === 'true')
      .filter(credit => credit.date >= fromDate && credit.date <= toDate)
      .reduce((sum, credit) => {
        if (credit.expenseEntries && credit.expenseEntries.length > 0) {
          return sum + credit.expenseEntries.reduce((expSum, entry) => expSum + (entry.amount || 0), 0);
        }
        return sum;
      }, 0);
    
    const mppTotalExpenses = mppDirectExpenses + mppCreditExpenses;
    
    // Get MPP settlements amount
    const mppSettlementsInRange = settlementData.filter(s => s.date >= fromDate && s.date <= toDate);
    console.log('Settlements in date range:', mppSettlementsInRange.map(s => ({ date: s.date, mpp: s.mpp, amount: s.amount })));
    
    const mppSettlementsWithTag = mppSettlementsInRange.filter(s => s.mpp === true || s.mpp === 'true');
    console.log('MPP Tagged Settlements:', mppSettlementsWithTag.map(s => ({ date: s.date, mpp: s.mpp, amount: s.amount })));
    
    const mppSettlementAmount = mppSettlementsWithTag.reduce((sum, s) => sum + (s.amount || 0), 0);
    console.log('Total MPP Settlement Amount:', mppSettlementAmount);
    
    // Calculate MPP Cash using FULL formula
    // Formula: MPP Fuel Sales - MPP Credit Sales + MPP Income - MPP Expenses - MPP Settlements
    const totalMPPCash = mppFuelSales - mppCreditAmount + mppTotalIncome - mppTotalExpenses - mppSettlementAmount;
    
    // Debug logging
    console.log('=== Customer Ledger MPP Cash Calculation (FULL FORMULA) ===');
    console.log('Customer:', customer.name);
    console.log('Date Range:', fromDate, 'to', toDate);
    console.log('');
    console.log('MPP Fuel Sales (All tagged sales):', mppFuelSales);
    console.log('MPP Credit Amount (Fuel only from tagged credits):', mppCreditAmount);
    console.log('MPP Total Income (Tagged income):', mppTotalIncome);
    console.log('MPP Total Expenses (Tagged expenses):', mppTotalExpenses);
    console.log('MPP Settlement Amount (Tagged settlements):', mppSettlementAmount);
    console.log('');
    console.log('Formula:', mppFuelSales, '-', mppCreditAmount, '+', mppTotalIncome, '-', mppTotalExpenses, '-', mppSettlementAmount);
    console.log('Final MPP Cash:', totalMPPCash);
    console.log('');
    console.log('NOTE: Auto-payments for MPP credits/settlements are ALSO shown as separate line items above');
    console.log('==========================================');
    
    if (totalMPPCash !== 0) {
      // Show MPP cash as a single entry
      // If positive: shows in "Received" column (reduces outstanding)
      // If negative: shows in "Credit" column (increases outstanding)
      const mppCashEntry = {
        date: toDate, // Show on end date for summary
        type: 'mpp_cash',
        credit: totalMPPCash < 0 ? Math.abs(totalMPPCash) : 0,
        received: totalMPPCash > 0 ? totalMPPCash : 0,
        description: 'MPP Cash'
      };
      ledgerEntries.push(mppCashEntry);
    }

    // 5. All payments to Mobile Petrol Pump customer (including auto-generated ones)
    const allMPPPayments = payments
      .filter(p => p.customerId === customerId)
      .filter(p => p.date >= fromDate && p.date <= toDate)
      .map(p => ({
        date: p.date,
        type: p.isAutoMPPTracking ? 'auto_mpp_payment' : 'payment',
        credit: 0,
        received: p.amount,
        description: p.description || (p.isAutoMPPTracking ? 'MPP Transaction' : 'Payment Received')
      }));

    // Combine all entries
    const allEntries = [
      ...mppNormalCredits,
      ...ledgerEntries, // This includes the MPP Cash entry
      ...allMPPPayments // This includes both normal and auto-generated payments
    ].sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance for MPP customer
    // Balance = Starting Balance + Credit Sales (no MPP) - all Received amounts
    // Received amounts include: MPP Credit Sales (fuel), MPP Settlements, Normal Payments, and MPP Cash
    let runningBalance = customer.startingBalance || 0;
    const ledgerWithBalance = allEntries.map(item => {
      runningBalance += (item.credit - item.received);
      return {
        ...item,
        outstanding: runningBalance
      };
    });

    setLedgerData(ledgerWithBalance);
    setShowReport(true);
    setLedgerTab('print');
  };

  const handlePrint = () => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }

    try {
      // Check if running in Android WebView
      const isAndroid = typeof window.MPumpCalcAndroid !== 'undefined';
      
      if (isAndroid) {
        // Generate PDF using jsPDF for Android
        generatePDFForAndroid(selectedCustomer);
        return;
      }
      
      // For web browser - use print dialog
      generateHTMLForWeb(selectedCustomer);
    } catch (error) {
      console.error('Print error:', error);
      alert('Error generating report: ' + error.message);
    }
  };

  const generatePDFForAndroid = (selectedCustomer) => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.text('Customer Ledger Report', 105, yPos, { align: 'center' });
      yPos += 10;

      // Customer Name
      doc.setFontSize(14);
      doc.text(selectedCustomer.name, 105, yPos, { align: 'center' });
      yPos += 8;

      // Date Range
      doc.setFontSize(11);
      const periodStr = `Period: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`;
      doc.text(periodStr, 105, yPos, { align: 'center' });
      yPos += 15;

      if (ledgerData.length === 0) {
        doc.setFontSize(12);
        doc.text('No transactions found for the selected period', 105, yPos, { align: 'center' });
      } else {
        // Ledger Table
        const tableData = ledgerData.map((row) => [
          new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          row.description,
          row.credit > 0 ? row.credit.toFixed(2) : '-',
          row.received > 0 ? row.received.toFixed(2) : '-',
          row.outstanding.toFixed(2)
        ]);

        // Add total row
        const totalCredit = ledgerData.reduce((sum, row) => sum + row.credit, 0);
        const totalReceived = ledgerData.reduce((sum, row) => sum + row.received, 0);
        const finalOutstanding = ledgerData[ledgerData.length - 1]?.outstanding || 0;
        
        tableData.push([
          'TOTAL',
          '',
          totalCredit.toFixed(2),
          totalReceived.toFixed(2),
          finalOutstanding.toFixed(2)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Description', 'Credit', 'Received', 'Outstanding']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 9 },
          footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
        });
      }

      // Footer
      yPos = doc.internal.pageSize.height - 15;
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, yPos, { align: 'center' });

      // Convert to base64 and send to Android
      const pdfBase64 = doc.output('dataurlstring').split(',')[1];
      const fileName = `Ledger_${selectedCustomer.name}_${fromDate}_to_${toDate}.pdf`;
      
      if (window.MPumpCalcAndroid && window.MPumpCalcAndroid.openPdfWithViewer) {
        window.MPumpCalcAndroid.openPdfWithViewer(pdfBase64, fileName);
      } else {
        console.error('Android interface not available');
        alert('PDF generation is only available in the Android app');
      }
    } catch (error) {
      console.error('Error generating PDF for Android:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const generateHTMLForWeb = (selectedCustomer) => {
    // Original HTML generation for web browsers
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Customer Ledger Report</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;padding:0;line-height:1.4}
h1{font-size:24px;margin:10px 0;text-align:center;color:#333}
h2{font-size:18px;margin:5px 0;text-align:center;color:#555}
p{font-size:13px;margin:5px 0;text-align:center;color:#666}
table{width:100%;border-collapse:collapse;margin:15px 0;font-size:12px}
th{background:#f0f0f0;border:1px solid #333;padding:7px;text-align:left;font-weight:bold}
td{border:1px solid #333;padding:5px}
.r{text-align:right}
.credit{color:#d97706}
.received{color:#16a34a}
.total-row{font-weight:bold;background:#f8f8f8}
@media print{body{margin:10mm}}
</style>
</head>
<body>
<h1>Customer Ledger Report</h1>
<h2>${selectedCustomer.name}</h2>
<p>Period: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}</p>

${ledgerData.length > 0 ? `
<table>
<tr>
  <th>Date</th>
  <th>Description</th>
  <th class="r">Credit</th>
  <th class="r">Received</th>
  <th class="r">Outstanding</th>
</tr>
${ledgerData.map(row => `
<tr>
  <td>${new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
  <td>${row.description}</td>
  <td class="r credit">${row.credit > 0 ? '₹' + row.credit.toFixed(2) : '-'}</td>
  <td class="r received">${row.received > 0 ? '₹' + row.received.toFixed(2) : '-'}</td>
  <td class="r"><b>₹${row.outstanding.toFixed(2)}</b></td>
</tr>
`).join('')}
<tr class="total-row">
  <td colspan="2"><b>TOTAL</b></td>
  <td class="r credit"><b>₹${ledgerData.reduce((sum, row) => sum + row.credit, 0).toFixed(2)}</b></td>
  <td class="r received"><b>₹${ledgerData.reduce((sum, row) => sum + row.received, 0).toFixed(2)}</b></td>
  <td class="r"><b>₹${ledgerData[ledgerData.length - 1]?.outstanding.toFixed(2) || '0.00'}</b></td>
</tr>
</table>
` : '<p style="text-align:center;margin:30px 0">No transactions found</p>'}

<div style="margin-top:20px;text-align:center;font-size:11px;border-top:1px solid #ccc;padding-top:8px">
Generated on: ${new Date().toLocaleString('en-IN')}
</div>

<script>
window.onload = function() {
  setTimeout(function() {
    window.print();
  }, 500);
};
</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <Tabs value={ledgerTab} onValueChange={setLedgerTab} className="w-full">
      <TabsList className={`flex w-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
        <TabsTrigger value="generate" className="flex-1 text-xs sm:text-sm">
          Report
        </TabsTrigger>
        <TabsTrigger value="print" className="flex-1 text-xs sm:text-sm" disabled={!showReport}>
          Print
        </TabsTrigger>
      </TabsList>

      {/* Report Tab */}
      <TabsContent value="generate">
        <div className="space-y-4">
          {/* Customer Selection and Date Range */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Customer Ledger Report
                </h3>
              </div>

              <div className="space-y-4">
                {/* Customer Selection */}
                <div className="relative" ref={customerDropdownRef}>
                  <Label htmlFor="customer" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                    Select Customer
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
                              className={`px-3 py-2 cursor-pointer hover:${
                                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
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

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromDate" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
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
                    <Label htmlFor="toDate" className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
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

                {/* Generate Report Button */}
                <Button
                  onClick={generateReport}
                  disabled={!customerId || !fromDate || !toDate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Print Tab */}
      <TabsContent value="print">
        <div className="space-y-4">
          {/* Print Button */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
            <CardContent className="p-4">
              <Button
                onClick={handlePrint}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
            </CardContent>
          </Card>

          {/* Ledger Report Display */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
            <CardContent className="p-4">
              <div id="ledger-print-content" className="print-content">
                <div className="mb-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Customer Ledger Report: {selectedCustomer?.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Period: {new Date(fromDate).toLocaleDateString('en-IN')} to {new Date(toDate).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {ledgerData.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions found for the selected period</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-slate-300'}`}>
                          <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                            Date
                          </th>
                          <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                            Description
                          </th>
                          <th className={`text-right p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                            Credit
                          </th>
                          <th className={`text-right p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                            Received
                          </th>
                          <th className={`text-right p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                            Outstanding
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerData.map((row, index) => (
                          <tr
                            key={index}
                            className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}
                          >
                            <td className={`p-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                              {new Date(row.date).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className={`p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                              {row.description}
                            </td>
                            <td className={`p-3 text-right ${
                              row.credit > 0 
                                ? isDarkMode ? 'text-orange-400' : 'text-orange-600' 
                                : isDarkMode ? 'text-gray-500' : 'text-slate-400'
                            }`}>
                              {row.credit > 0 ? `₹${row.credit.toFixed(2)}` : '-'}
                            </td>
                            <td className={`p-3 text-right ${
                              row.received > 0 
                                ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                                : isDarkMode ? 'text-gray-500' : 'text-slate-400'
                            }`}>
                              {row.received > 0 ? `₹${row.received.toFixed(2)}` : '-'}
                            </td>
                            <td className={`p-3 text-right font-bold ${
                              row.outstanding > 0
                                ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                : isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              ₹{row.outstanding.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {/* Summary Row */}
                        <tr className={`font-bold border-t-2 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-300'
                        }`}>
                          <td colSpan="2" className={`p-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            TOTAL
                          </td>
                          <td className={`p-3 text-right ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            ₹{ledgerData.reduce((sum, row) => sum + row.credit, 0).toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            ₹{ledgerData.reduce((sum, row) => sum + row.received, 0).toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${
                            ledgerData[ledgerData.length - 1]?.outstanding > 0
                              ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                              : isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ₹{ledgerData[ledgerData.length - 1]?.outstanding.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CustomerLedger;
