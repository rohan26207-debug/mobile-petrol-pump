import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { FileText, TrendingUp, Users } from 'lucide-react';

const OutstandingReport = ({ customers, creditData, payments, isDarkMode }) => {
  // Calculate outstanding for each customer
  const outstandingReport = useMemo(() => {
    return customers.map(customer => {
      // Total credit sales for this customer
      const totalCredit = creditData
        .filter(c => c.customerName === customer.name)
        .reduce((sum, c) => sum + c.amount, 0);

      // Total payments received from this customer
      const totalReceived = payments
        .filter(p => p.customerId === customer.id)
        .reduce((sum, p) => sum + p.amount, 0);

      // Outstanding balance
      const outstanding = totalCredit - totalReceived;

      return {
        id: customer.id,
        name: customer.name,
        outstanding
      };
    })
    .filter(r => r.outstanding !== 0) // Show all non-zero balances (positive or negative)
    .sort((a, b) => b.outstanding - a.outstanding); // Sort by outstanding amount, highest first
  }, [customers, creditData, payments]);

  // Calculate total outstanding
  const totalOutstanding = useMemo(() => {
    return outstandingReport.reduce((sum, r) => sum + r.outstanding, 0);
  }, [outstandingReport]);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Total Outstanding
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                ₹{totalOutstanding.toFixed(2)}
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                {outstandingReport.length} customer{outstandingReport.length !== 1 ? 's' : ''} with outstanding
              </p>
            </div>
            <Users className={`w-12 h-12 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Table */}
      <Card className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      }`}>
        <CardContent className="p-4">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Customer Outstanding Report
          </h3>
          
          {outstandingReport.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No outstanding balances</p>
              <p className="text-sm mt-1">All customers have cleared their dues</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-slate-200'
                  }`}>
                    <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      Customer Name
                    </th>
                    <th className={`text-right p-3 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      Outstanding Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingReport.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-slate-100'
                      }`}
                    >
                      <td className={`p-3 font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {row.name}
                      </td>
                      <td className={`p-3 text-right font-bold ${
                        row.outstanding > 0 
                          ? isDarkMode ? 'text-orange-400' : 'text-orange-600'  // Positive (owe us)
                          : isDarkMode ? 'text-green-400' : 'text-green-600'    // Negative (we owe them)
                      }`}>
                        ₹{row.outstanding.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className={`font-bold ${
                    isDarkMode ? 'bg-gray-700' : 'bg-slate-50'
                  }`}>
                    <td className={`p-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      TOTAL
                    </td>
                    <td className={`p-3 text-right ${
                      totalOutstanding > 0
                        ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        : isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ₹{totalOutstanding.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OutstandingReport;
