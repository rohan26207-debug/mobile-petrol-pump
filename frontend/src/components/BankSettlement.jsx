import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Wallet, Calendar } from 'lucide-react';

const BankSettlement = ({ isDarkMode, settlementData, payments, creditData, selectedDate }) => {
  // Initialize date range with current selected date
  const [fromDate, setFromDate] = useState(selectedDate);
  const [toDate, setToDate] = useState(selectedDate);

  // Calculate bank settlement data for date range
  const bankSettlementData = useMemo(() => {
    // Create a date range array
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const dateArray = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d).toISOString().split('T')[0]);
    }

    // Calculate amounts for each date
    return dateArray.map((date, index) => {
      // Filter data for this date
      const daySettlements = settlementData.filter(s => s.date === date);
      const dayPayments = payments.filter(p => p.date === date);
      const dayCreditSales = creditData.filter(c => c.date === date);

      // Calculate Cash amount (cash from credit sales + customer cash receipts)
      // Cash from credit sales (cash sales)
      const creditCashSales = dayCreditSales
        .filter(c => c.type === 'cash' || !c.type) // type not set means cash
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      
      // Customer cash receipts
      const paymentCash = dayPayments
        .filter(p => p.mode && p.mode.toLowerCase() === 'cash')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const cashAmount = creditCashSales + paymentCash;

      // Calculate Card amount (Settlement + Customer receipts with mode='Card')
      const settlementCard = daySettlements
        .filter(s => s.description && s.description.toLowerCase().includes('card'))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      const paymentCard = dayPayments
        .filter(p => p.mode && p.mode.toLowerCase() === 'card')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const cardAmount = settlementCard + paymentCard;

      // Calculate Paytm amount
      const settlementPaytm = daySettlements
        .filter(s => s.description && s.description.toLowerCase().includes('paytm'))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      const paymentPaytm = dayPayments
        .filter(p => p.mode && (p.mode.toLowerCase() === 'wallet' || p.mode.toLowerCase().includes('paytm')))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const paytmAmount = settlementPaytm + paymentPaytm;

      // Calculate PhonePe amount
      const settlementPhonepe = daySettlements
        .filter(s => s.description && s.description.toLowerCase().includes('phonepe'))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      const paymentPhonepe = dayPayments
        .filter(p => p.mode && p.mode.toLowerCase().includes('phonepe'))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const phonepeAmount = settlementPhonepe + paymentPhonepe;

      // Calculate DTP amount
      const settlementDTP = daySettlements
        .filter(s => s.description && s.description.toLowerCase().includes('dtp'))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      const paymentDTP = dayPayments
        .filter(p => p.mode && p.mode.toLowerCase() === 'dtp')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const dtpAmount = settlementDTP + paymentDTP;

      return {
        srNo: index + 1,
        date,
        cashAmount,
        cardAmount,
        paytmAmount,
        phonepeAmount,
        dtpAmount
      };
    });
  }, [fromDate, toDate, settlementData, payments, creditData]);

  // Calculate totals
  const totals = useMemo(() => {
    return bankSettlementData.reduce(
      (acc, row) => ({
        cashAmount: acc.cashAmount + row.cashAmount,
        cardAmount: acc.cardAmount + row.cardAmount,
        paytmAmount: acc.paytmAmount + row.paytmAmount,
        phonepeAmount: acc.phonepeAmount + row.phonepeAmount,
        dtpAmount: acc.dtpAmount + row.dtpAmount
      }),
      { cashAmount: 0, cardAmount: 0, paytmAmount: 0, phonepeAmount: 0, dtpAmount: 0 }
    );
  }, [bankSettlementData]);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          <Wallet className="w-5 h-5 text-green-600" />
          Bank Settlement Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Selector */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              <Calendar className="w-3 h-3" />
              From Date
            </Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
          <div className="space-y-1">
            <Label className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              <Calendar className="w-3 h-3" />
              To Date
            </Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-orange-600'}`}>Cash</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-orange-700'}`}>
              ₹{totals.cashAmount.toFixed(2)}
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Card</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-blue-700'}`}>
              ₹{totals.cardAmount.toFixed(2)}
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-purple-600'}`}>Paytm</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-purple-700'}`}>
              ₹{totals.paytmAmount.toFixed(2)}
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-indigo-600'}`}>PhonePe</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-indigo-700'}`}>
              ₹{totals.phonepeAmount.toFixed(2)}
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>DTP</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-green-700'}`}>
              ₹{totals.dtpAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className={`rounded-lg border overflow-hidden ${
          isDarkMode ? 'border-gray-600' : 'border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
              }`}>
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Sr. No</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-right font-semibold">Card (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">Paytm (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">PhonePe (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">DTP (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">Total (₹)</th>
                </tr>
              </thead>
              <tbody className={isDarkMode ? 'text-gray-300' : 'text-slate-700'}>
                {bankSettlementData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-3 py-8 text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      No data available for selected date range
                    </td>
                  </tr>
                ) : (
                  bankSettlementData.map((row) => (
                    <tr key={row.date} className={`border-t ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <td className="px-3 py-2">{row.srNo}</td>
                      <td className="px-3 py-2 font-medium">
                        {new Date(row.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.cardAmount > 0 ? row.cardAmount.toFixed(2) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.paytmAmount > 0 ? row.paytmAmount.toFixed(2) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.phonepeAmount > 0 ? row.phonepeAmount.toFixed(2) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.dtpAmount > 0 ? row.dtpAmount.toFixed(2) : '-'}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {row.total > 0 ? row.total.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {bankSettlementData.length > 0 && (
                <tfoot className={`border-t-2 ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-slate-50'
                }`}>
                  <tr className="font-bold">
                    <td colSpan="2" className="px-3 py-2">Total</td>
                    <td className={`px-3 py-2 text-right font-mono ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {totals.cardAmount.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {totals.paytmAmount.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${
                      isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      {totals.phonepeAmount.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {totals.dtpAmount.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${
                      isDarkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      {totals.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className={`text-xs p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-blue-50 text-blue-700'
        }`}>
          <strong>Note:</strong> Amounts include settlements and customer receipts for each payment mode.
          This report helps verify digital payment settlements with bank deposits.
        </div>
      </CardContent>
    </Card>
  );
};

export default BankSettlement;
